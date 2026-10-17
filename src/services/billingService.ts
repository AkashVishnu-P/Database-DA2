import prisma from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { nextCode } from "@/lib/numbering";

export interface RecordPaymentDTO {
  billId: string;
  cashierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export class BillingService {
  static async recordPayment(data: RecordPaymentDTO) {
    return prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id: data.billId },
        include: { patient: true, items: true, invoice: true },
      });

      if (!bill) throw new Error("Bill not found.");

      const currentPaid = Number(bill.paidAmount);
      const currentNet = Number(bill.netAmount);
      const paymentAmount = Number(data.amount);

      if (!(paymentAmount > 0)) throw new Error("Payment amount must be greater than zero.");
      if (bill.paymentStatus === PaymentStatus.PAID) throw new Error("This bill is already fully paid.");
      const outstanding = Number(bill.balanceAmount);
      if (paymentAmount > outstanding + 0.001) {
        throw new Error(`Amount exceeds the outstanding balance of ${outstanding.toFixed(2)}.`);
      }

      const newPaid = currentPaid + paymentAmount;
      const newBalance = Math.max(0, currentNet - newPaid);
      const isFullyPaid = newBalance <= 0;

      const receiptNumber = await nextCode("RCP", 5, await tx.payment.count(), async (code) =>
        !!(await tx.payment.findUnique({ where: { receiptNumber: code } }))
      );

      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          billId: bill.id,
          cashierId: data.cashierId,
          patientId: bill.patientId,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod,
          transactionRef: data.transactionRef || null,
          notes: data.notes || null,
          status: "SUCCESS",
        },
      });

      const updatedBill = await tx.bill.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID,
        },
      });

      if (!bill.invoice) {
        const invoiceNumber = await nextCode("FIN", 5, await tx.invoice.count(), async (code) =>
          !!(await tx.invoice.findUnique({ where: { invoiceNumber: code } }))
        );
        await tx.invoice.create({
          data: {
            invoiceNumber,
            billId: bill.id,
            status: isFullyPaid ? "PAID" : "ISSUED",
          },
        });
      } else if (isFullyPaid) {
        await tx.invoice.update({
          where: { id: bill.invoice.id },
          data: { status: "PAID" },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: data.cashierId,
          action: "BILL_PAID",
          entityType: "Payment",
          entityId: payment.id,
          detailsJson: JSON.stringify({
            billNumber: bill.billNumber,
            receiptNumber,
            amount: paymentAmount,
            method: data.paymentMethod,
            newBalance,
          }),
        },
      });

      return { payment, bill: updatedBill };
    });
  }

  static async getRevenueStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayPayments, allPayments, pendingBills] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: today }, status: "SUCCESS" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.bill.aggregate({
        _sum: { balanceAmount: true },
        where: { paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } },
      }),
    ]);

    return {
      todayRevenue: Number(todayPayments._sum.amount || 0),
      totalRevenue: Number(allPayments._sum.amount || 0),
      pendingBillsTotal: Number(pendingBills._sum.balanceAmount || 0),
    };
  }
}
