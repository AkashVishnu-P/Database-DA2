import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/services/billingService";
import { getAuthContext } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const body = await req.json();

    const { billId, amount, paymentMethod, transactionRef, notes } = body;

    if (!billId || !amount) {
      return NextResponse.json(
        { error: "billId and amount are required" },
        { status: 400 }
      );
    }

    if (!session?.userId) {
      return NextResponse.json({ error: "Please sign in to record payments." }, { status: 401 });
    }
    if (session.role === "PATIENT") {
      const bill = await prisma.bill.findUnique({ where: { id: billId } });
      if (!bill || bill.patientId !== session.patientId) {
        return NextResponse.json({ error: "You can only pay your own bills." }, { status: 403 });
      }
    }
    const cashierId = session.userId;

    const result = await BillingService.recordPayment({
      billId,
      cashierId,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || "CASH",
      transactionRef,
      notes,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
