import prisma from "@/lib/prisma";
import { LabRequestStatus, PriorityLevel } from "@prisma/client";

export class LabService {
  /**
   * Doctor requests a lab test: creates request and attaches test fee to bill
   */
  static async requestLabTest(data: {
    patientId: string;
    doctorId: string;
    labTestId: string;
    appointmentId?: string;
    admissionId?: string;
    priority?: PriorityLevel;
    userId?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const count = await tx.labRequest.count();
      const year = new Date().getFullYear();
      const requestNumber = `LR-${year}-${String(count + 1).padStart(5, "0")}`;

      const labTest = await tx.labTest.findUnique({
        where: { id: data.labTestId },
      });
      if (!labTest) throw new Error("Lab test not found.");

      const labRequest = await tx.labRequest.create({
        data: {
          requestNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          labTestId: data.labTestId,
          appointmentId: data.appointmentId || null,
          admissionId: data.admissionId || null,
          status: LabRequestStatus.PENDING,
          priority: data.priority || PriorityLevel.NORMAL,
        },
        include: {
          patient: true,
          labTest: true,
          doctor: { include: { user: true } },
        },
      });

      // Add lab test fee to bill
      const billCount = await tx.bill.count();
      const billNumber = `LAB-${year}-${String(billCount + 1).padStart(5, "0")}`;
      const fee = Number(labTest.standardFee);

      await tx.bill.create({
        data: {
          billNumber,
          patientId: data.patientId,
          admissionId: data.admissionId || null,
          appointmentId: data.appointmentId || null,
          billType: "LAB",
          totalAmount: fee,
          netAmount: fee,
          paidAmount: 0.0,
          balanceAmount: fee,
          paymentStatus: "PENDING",
          items: {
            create: [
              {
                description: `Lab Test: ${labTest.name} (${labTest.code})`,
                quantity: 1,
                unitPrice: fee,
                totalPrice: fee,
              },
            ],
          },
        },
      });

      await tx.activityLog.create({
        data: {
          userId: data.userId || null,
          action: "LAB_TEST_REQUESTED",
          entityType: "LabRequest",
          entityId: labRequest.id,
          detailsJson: JSON.stringify({
            requestNumber,
            testName: labTest.name,
            patientId: data.patientId,
          }),
        },
      });

      return labRequest;
    });
  }

  /**
   * Lab technician uploads findings & verifies report
   */
  static async completeReport(data: {
    labRequestId: string;
    technicianId: string;
    resultJson: string;
    remarks?: string;
    isAbnormal?: boolean;
    reportFileUrl?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const report = await tx.labReport.create({
        data: {
          labRequestId: data.labRequestId,
          technicianId: data.technicianId,
          resultJson: data.resultJson,
          remarks: data.remarks || null,
          isAbnormal: data.isAbnormal || false,
          reportFileUrl: data.reportFileUrl || null,
          verifiedAt: new Date(),
        },
      });

      const updatedRequest = await tx.labRequest.update({
        where: { id: data.labRequestId },
        data: {
          status: LabRequestStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          doctor: { include: { user: true } },
          patient: true,
          labTest: true,
        },
      });

      // Notify ordering doctor
      if (updatedRequest.doctor?.user?.id) {
        await tx.notification.create({
          data: {
            userId: updatedRequest.doctor.user.id,
            title: `Lab Report Ready: ${updatedRequest.labTest.name}`,
            message: `Report verified for Patient ${updatedRequest.patient.uhid}. Status: ${
              data.isAbnormal ? "ABNORMAL" : "NORMAL"
            }.`,
            type: data.isAbnormal ? "WARNING" : "SUCCESS",
            link: `/dashboard/doctor`,
          },
        });
      }

      return report;
    });
  }
}
