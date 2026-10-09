import prisma from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface RecordPaymentDTO {
  billId: string;
  cashierId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
}

export class BillingService {
  /**
   * Processes a bill payment atomically:
   * 1. Creates Payment record with receiptNumber
   * 2. Recalculates Bill paidAmount and balanceAmount
   * 3. Flips Bill status to PAID or PARTIALLY_PAID
   * 4. Auto-generates formal Invoice record if not present
   * 5. Emits ActivityLog
   */
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

      if (paymentAmount <= 0) throw new Error("Payment amount must be greater than zero.");

      const newPaid = currentPaid + paymentAmount;
      const newBalance = Math.max(0, currentNet - newPaid);
      const isFullyPaid = newBalance <= 0;

      // 1. Receipt Number
      const paymentCount = await tx.payment.count();
      const year = new Date().getFullYear();
      const receiptNumber = `RCP-${year}-${String(paymentCount + 1).padStart(5, "0")}`;

      // 2. Create Payment
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

      // 3. Update Bill
      const updatedBill = await tx.bill.update({
        where: { id: bill.id },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: isFullyPaid ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID,
        },
      });

      // 4. Ensure Invoice exists
      if (!bill.invoice) {
        const invoiceCount = await tx.invoice.count();
        const invoiceNumber = `FIN-${year}-${String(invoiceCount + 1).padStart(5, "0")}`;
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

      // 5. Activity Log
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

  /**
   * Generates aggregated revenue metrics for dashboards
   */
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
