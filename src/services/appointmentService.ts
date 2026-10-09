import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType, PriorityLevel } from "@prisma/client";

export interface BookAppointmentDTO {
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string | Date;
  timeSlot: string;
  type?: AppointmentType;
  priority?: PriorityLevel;
  notes?: string;
  userId?: string;
}

export class AppointmentService {
  /**
   * Books an appointment with queue token assignment, OPD fee billing, and doctor notification
   */
  static async bookAppointment(data: BookAppointmentDTO) {
    return prisma.$transaction(async (tx) => {
      const apptDate = new Date(data.appointmentDate);
      const startOfDay = new Date(apptDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(apptDate);
      endOfDay.setHours(23, 59, 59, 999);

      // 1. Calculate sequential daily token for this doctor
      const dailyCount = await tx.appointment.count({
        where: {
          doctorId: data.doctorId,
          appointmentDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      const tokenNumber = dailyCount + 1;

      // 2. Generate unique Appointment Number
      const totalCount = await tx.appointment.count();
      const year = new Date().getFullYear();
      const appointmentNumber = `APT-${year}-${String(totalCount + 1).padStart(5, "0")}`;

      // 3. Get doctor to fetch consultation fee
      const doctor = await tx.doctor.findUnique({
        where: { id: data.doctorId },
        include: { user: true, department: true },
      });
      if (!doctor) throw new Error("Doctor not found.");

      const consultationFee = Number(doctor.consultationFee);

      // 4. Create Appointment
      const appointment = await tx.appointment.create({
        data: {
          appointmentNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          appointmentDate: apptDate,
          timeSlot: data.timeSlot,
          tokenNumber,
          status: AppointmentStatus.SCHEDULED,
          type: data.type || AppointmentType.OUTPATIENT,
          priority: data.priority || PriorityLevel.NORMAL,
          notes: data.notes || null,
        },
        include: {
          patient: true,
          doctor: { include: { user: true } },
          department: true,
        },
      });

      // 5. Create Outpatient Consultation Bill
      const billCount = await tx.bill.count();
      const billNumber = `OPD-${year}-${String(billCount + 1).padStart(5, "0")}`;

      const bill = await tx.bill.create({
        data: {
          billNumber,
          patientId: data.patientId,
          appointmentId: appointment.id,
          billType: "OUTPATIENT",
          totalAmount: consultationFee,
          netAmount: consultationFee,
          paidAmount: 0.0,
          balanceAmount: consultationFee,
          paymentStatus: "PENDING",
          items: {
            create: [
              {
                description: `Outpatient Consultation - Dr. ${doctor.user.firstName} ${doctor.user.lastName} (${doctor.specialization})`,
                quantity: 1,
                unitPrice: consultationFee,
                totalPrice: consultationFee,
              },
            ],
          },
        },
      });

      // 6. Notification to Doctor
      if (doctor.user?.id) {
        await tx.notification.create({
          data: {
            userId: doctor.user.id,
            title: "New OPD Appointment",
            message: `Token #${tokenNumber}: Patient ${appointment.patient.uhid} scheduled for ${data.timeSlot}.`,
            type: "INFO",
            link: "/dashboard/doctor",
          },
        });
      }

      // 7. Activity Log
      await tx.activityLog.create({
        data: {
          userId: data.userId || null,
          action: "APPOINTMENT_BOOKED",
          entityType: "Appointment",
          entityId: appointment.id,
          detailsJson: JSON.stringify({
            appointmentNumber,
            tokenNumber,
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeSlot: data.timeSlot,
          }),
        },
      });

      return { appointment, bill };
    });
  }

  static async getDoctorTodayQueue(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: { gte: today, lte: endToday },
      },
      include: {
        patient: true,
      },
      orderBy: { tokenNumber: "asc" },
    });
  }
}
