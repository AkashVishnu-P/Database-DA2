import prisma from "@/lib/prisma";
import { AppointmentStatus, AppointmentType, PriorityLevel } from "@prisma/client";
import { nextCode } from "@/lib/numbering";

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
  static async bookAppointment(data: BookAppointmentDTO) {
    return prisma.$transaction(async (tx) => {
      const apptDate = new Date(data.appointmentDate);
      const startOfDay = new Date(apptDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(apptDate);
      endOfDay.setHours(23, 59, 59, 999);

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

      const appointmentNumber = await nextCode("APT", 5, await tx.appointment.count(), async (code) =>
        !!(await tx.appointment.findUnique({ where: { appointmentNumber: code } }))
      );

      const doctor = await tx.doctor.findUnique({
        where: { id: data.doctorId },
        include: { user: true, department: true },
      });
      if (!doctor) throw new Error("Doctor not found.");
      if (Number.isNaN(apptDate.getTime())) throw new Error("Invalid appointment date.");

      const consultationFee = Number(doctor.consultationFee);

      const appointment = await tx.appointment.create({
        data: {
          appointmentNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          departmentId: data.departmentId || doctor.departmentId,
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

      const billNumber = await nextCode("OPD", 5, await tx.bill.count(), async (code) =>
        !!(await tx.bill.findUnique({ where: { billNumber: code } }))
      );

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
