import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/services/billingService";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();

    const { billId, amount, paymentMethod, transactionRef, notes } = body;

    if (!billId || !amount) {
      return NextResponse.json(
        { error: "billId and amount are required" },
        { status: 400 }
      );
    }

    const cashierId = session?.userId || "cashier-sys";

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
