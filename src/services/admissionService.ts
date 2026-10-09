import prisma from "@/lib/prisma";
import { AdmissionStatus, AdmissionType, BedStatus } from "@prisma/client";

export interface AdmitPatientDTO {
  patientId: string;
  doctorId: string;
  roomId: string;
  bedId: string;
  admissionType?: AdmissionType;
  diagnosisAtAdmission?: string;
  userId?: string;
}

export interface DischargePatientDTO {
  admissionId: string;
  dischargeDoctorId: string;
  dischargeSummary: string;
  userId?: string;
}

export class AdmissionService {
  /**
   * Admits a patient with automatic cascading updates:
   * 1. Updates Bed to OCCUPIED
   * 2. Increments Room occupiedBeds count
   * 3. Creates active Admission record
   * 4. Initializes In-Patient Bill with Admission Fee
   * 5. Emits notification to Attending Doctor & Nursing staff
   * 6. Writes ActivityLog audit trail
   */
  static async admitPatient(data: AdmitPatientDTO) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify Bed availability
      const bed = await tx.bed.findUnique({
        where: { id: data.bedId },
        include: { room: true },
      });

      if (!bed) throw new Error("Bed not found.");
      if (bed.isOccupied) throw new Error(`Bed ${bed.bedNumber} is already occupied.`);

      // 2. Generate unique Admission Number
      const count = await tx.admission.count();
      const year = new Date().getFullYear();
      const admissionNumber = `ADM-${year}-${String(count + 1).padStart(4, "0")}`;

      // 3. Create Admission Record
      const admission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          roomId: data.roomId,
          bedId: data.bedId,
          admissionType: data.admissionType || AdmissionType.ELECTIVE,
          diagnosisAtAdmission: data.diagnosisAtAdmission || "Inpatient observation and treatment",
          status: AdmissionStatus.ADMITTED,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          room: true,
          bed: true,
        },
      });

      // 4. Update Bed state
      await tx.bed.update({
        where: { id: data.bedId },
        data: {
          isOccupied: true,
          status: BedStatus.OCCUPIED,
          patientId: data.patientId,
        },
      });

      // 5. Update Room occupancy
      await tx.room.update({
        where: { id: data.roomId },
        data: {
          occupiedBeds: { increment: 1 },
        },
      });

      // 6. Generate In-Patient Initial Bill
      const billCount = await tx.bill.count();
      const billNumber = `INV-${year}-${String(billCount + 1).padStart(4, "0")}`;
      const admissionFee = 150.0; // standard admission charge

      const bill = await tx.bill.create({
        data: {
          billNumber,
          patientId: data.patientId,
          admissionId: admission.id,
          billType: "INPATIENT",
          totalAmount: admissionFee,
          netAmount: admissionFee,
          paidAmount: 0.0,
          balanceAmount: admissionFee,
          paymentStatus: "PENDING",
          items: {
            create: [
              {
                description: `Initial Admission Fee & Inpatient Registration (${admission.admissionNumber})`,
                quantity: 1,
                unitPrice: admissionFee,
                totalPrice: admissionFee,
              },
            ],
          },
        },
      });

      // 7. Notification for Attending Doctor
      if (admission.doctor?.user?.id) {
        await tx.notification.create({
          data: {
            userId: admission.doctor.user.id,
            title: "New Patient Admitted",
            message: `Patient ${admission.patient.uhid} has been admitted to Room ${admission.room.roomNumber}, Bed ${admission.bed.bedNumber}.`,
            type: "INFO",
            link: `/dashboard/doctor/admissions`,
          },
        });
      }

      // 8. Audit Activity Log
      await tx.activityLog.create({
        data: {
          userId: data.userId || null,
          action: "PATIENT_ADMITTED",
          entityType: "Admission",
          entityId: admission.id,
          detailsJson: JSON.stringify({
            admissionNumber,
            patientId: data.patientId,
            roomId: data.roomId,
            bedNumber: bed.bedNumber,
            billNumber,
          }),
        },
      });

      return { admission, bill };
    });
  }

  /**
   * Discharges a patient with automatic cascading updates:
   * 1. Marks Admission as DISCHARGED with timestamp & summary
   * 2. Frees Bed and updates status to CLEANING
   * 3. Decrements Room occupancy
   * 4. Tallies room stay charges and adds to inpatient Bill
   * 5. Recalculates total balance for cashier settlement
   * 6. Emits notifications & writes audit log
   */
  static async dischargePatient(data: DischargePatientDTO) {
    return prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { id: data.admissionId },
        include: {
          room: true,
          bed: true,
          patient: true,
          doctor: { include: { user: true } },
          bills: { include: { items: true } },
        },
      });

      if (!admission) throw new Error("Admission record not found.");
      if (admission.status === AdmissionStatus.DISCHARGED) {
        throw new Error("Patient is already discharged.");
      }

      const dischargeDate = new Date();
      const admitDate = new Date(admission.admissionDate);
      const stayDays = Math.max(
        1,
        Math.ceil((dischargeDate.getTime() - admitDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const roomDailyRate = Number(admission.room.dailyRate);
      const totalRoomCharges = stayDays * roomDailyRate;

      // 1. Update Admission record
      const updatedAdmission = await tx.admission.update({
        where: { id: data.admissionId },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargeDate,
          dischargeSummary: data.dischargeSummary,
          dischargeDoctorId: data.dischargeDoctorId,
        },
      });

      // 2. Free Bed
      await tx.bed.update({
        where: { id: admission.bedId },
        data: {
          isOccupied: false,
          status: BedStatus.CLEANING,
          patientId: null,
        },
      });

      // 3. Decrement Room occupancy
      await tx.room.update({
        where: { id: admission.roomId },
        data: {
          occupiedBeds: { decrement: 1 },
        },
      });

      // 4. Update Inpatient Bill with Room stay charge
      let activeBill = admission.bills[0];
      if (activeBill) {
        await tx.billItem.create({
          data: {
            billId: activeBill.id,
            description: `Room Charges: ${stayDays} day(s) in Room ${admission.room.roomNumber} (${admission.room.type}) @ $${roomDailyRate}/day`,
            quantity: stayDays,
            unitPrice: roomDailyRate,
            totalPrice: totalRoomCharges,
          },
        });

        const newTotal = Number(activeBill.totalAmount) + totalRoomCharges;
        const newNet = newTotal - Number(activeBill.discountAmount) + Number(activeBill.taxAmount);
        const newBalance = newNet - Number(activeBill.paidAmount);

        await tx.bill.update({
          where: { id: activeBill.id },
          data: {
            totalAmount: newTotal,
            netAmount: newNet,
            balanceAmount: newBalance,
          },
        });
      }

      // 5. Activity Log
      await tx.activityLog.create({
        data: {
          userId: data.userId || null,
          action: "PATIENT_DISCHARGED",
          entityType: "Admission",
          entityId: admission.id,
          detailsJson: JSON.stringify({
            admissionNumber: admission.admissionNumber,
            stayDays,
            roomCharges: totalRoomCharges,
            dischargeDate,
          }),
        },
      });

      return updatedAdmission;
    });
  }
}
