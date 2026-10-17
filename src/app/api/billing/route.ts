import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (status) where.paymentStatus = status;
    if (patientId) where.patientId = patientId;
    if (session?.role === "PATIENT") where.patientId = session.patientId || "none";

    const bills = await prisma.bill.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { user: true } },
        items: true,
        payments: true,
        invoice: true,
      },
    });

    const formatted = bills.map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      patientId: b.patientId,
      patientName: `${b.patient.user?.firstName || "Patient"} ${b.patient.user?.lastName || ""}`.trim(),
      patientUhid: b.patient.uhid,
      billType: b.billType,
      totalAmount: Number(b.totalAmount),
      discountAmount: Number(b.discountAmount),
      taxAmount: Number(b.taxAmount),
      netAmount: Number(b.netAmount),
      paidAmount: Number(b.paidAmount),
      balanceAmount: Number(b.balanceAmount),
      paymentStatus: b.paymentStatus,
      dueDate: b.dueDate,
      createdAt: b.createdAt,
      items: b.items.map((i) => ({
        id: i.id,
        description: i.description,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
      payments: b.payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        amount: Number(p.amount),
        method: p.paymentMethod,
        date: p.createdAt,
      })),
      invoiceNumber: b.invoice?.invoiceNumber || null,
    }));

    return NextResponse.json({ bills: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
