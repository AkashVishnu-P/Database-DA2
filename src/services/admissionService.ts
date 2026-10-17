import prisma from "@/lib/prisma";
import { AdmissionStatus, AdmissionType, BedStatus } from "@prisma/client";
import { nextCode } from "@/lib/numbering";

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
  dischargeDoctorId: string | null;
  dischargeSummary: string;
  userId?: string;
}

export class AdmissionService {
  static async admitPatient(data: AdmitPatientDTO) {
    return prisma.$transaction(async (tx) => {
      const bed = await tx.bed.findUnique({
        where: { id: data.bedId },
        include: { room: true },
      });

      if (!bed) throw new Error("Bed not found.");
      if (bed.isOccupied) throw new Error(`Bed ${bed.bedNumber} is already occupied.`);
      if (bed.status === BedStatus.MAINTENANCE) throw new Error(`Bed ${bed.bedNumber} is under maintenance.`);

      const alreadyAdmitted = await tx.admission.findFirst({
        where: { patientId: data.patientId, status: AdmissionStatus.ADMITTED },
      });
      if (alreadyAdmitted) throw new Error("This patient is already admitted.");

      const admissionNumber = await nextCode("ADM", 4, await tx.admission.count(), async (code) =>
        !!(await tx.admission.findUnique({ where: { admissionNumber: code } }))
      );

      const admission = await tx.admission.create({
        data: {
          admissionNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          roomId: bed.roomId,
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

      await tx.bed.update({
        where: { id: data.bedId },
        data: {
          isOccupied: true,
          status: BedStatus.OCCUPIED,
          patientId: data.patientId,
        },
      });

      await tx.room.update({
        where: { id: bed.roomId },
        data: {
          occupiedBeds: { increment: 1 },
        },
      });

      const billNumber = await nextCode("INV", 4, await tx.bill.count(), async (code) =>
        !!(await tx.bill.findUnique({ where: { billNumber: code } }))
      );
      const admissionFee = 150.0;

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

      await tx.activityLog.create({
        data: {
          userId: data.userId || null,
          action: "PATIENT_ADMITTED",
          entityType: "Admission",
          entityId: admission.id,
          detailsJson: JSON.stringify({
            admissionNumber,
            patientId: data.patientId,
            roomId: bed.roomId,
            bedNumber: bed.bedNumber,
            billNumber,
          }),
        },
      });

      return { admission, bill };
    });
  }

  static async dischargePatient(data: DischargePatientDTO) {
    return prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { id: data.admissionId },
        include: {
          room: true,
          bed: true,
          patient: true,
          doctor: { include: { user: true } },
          bills: { where: { billType: "INPATIENT" }, orderBy: { createdAt: "asc" }, include: { items: true } },
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

      const updatedAdmission = await tx.admission.update({
        where: { id: data.admissionId },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargeDate,
          dischargeSummary: data.dischargeSummary,
          dischargeDoctorId: data.dischargeDoctorId,
        },
      });

      await tx.bed.update({
        where: { id: admission.bedId },
        data: {
          isOccupied: false,
          status: BedStatus.CLEANING,
          patientId: null,
        },
      });

      if (admission.room.occupiedBeds > 0) {
        await tx.room.update({
          where: { id: admission.roomId },
          data: { occupiedBeds: { decrement: 1 } },
        });
      }

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
            paymentStatus: newBalance <= 0 ? "PAID" : Number(activeBill.paidAmount) > 0 ? "PARTIALLY_PAID" : "PENDING",
          },
        });
      }

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
