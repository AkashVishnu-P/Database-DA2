import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        items: { include: { medicine: true } },
      },
    });

    const formatted = prescriptions.map((p) => ({
      id: p.id,
      prescriptionNumber: p.prescriptionNumber,
      patientId: p.patientId,
      patientName: `${p.patient.user?.firstName || "Patient"} ${p.patient.user?.lastName || ""}`.trim(),
      patientUhid: p.patient.uhid,
      doctorId: p.doctorId,
      doctorName: `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`,
      status: p.status,
      notes: p.notes,
      issuedAt: p.issuedAt,
      items: p.items.map((i) => ({
        id: i.id,
        medicineId: i.medicineId,
        medicineName: i.medicineName,
        dosage: i.dosage,
        frequency: i.frequency,
        durationDays: i.durationDays,
        instructions: i.instructions,
        isDispensed: i.isDispensed,
        unitPrice: Number(i.medicine.unitPrice),
      })),
    }));

    return NextResponse.json({ prescriptions: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();

    const { patientId, doctorId, appointmentId, admissionId, notes, items } = body;

    const count = await prisma.prescription.count();
    const year = new Date().getFullYear();
    const prescriptionNumber = `RX-${year}-${String(count + 1).padStart(4, "0")}`;

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId,
        doctorId: doctorId || session?.doctorId || "doc-1",
        appointmentId: appointmentId || null,
        admissionId: admissionId || null,
        notes: notes || null,
        items: {
          create: items.map((i: any) => ({
            medicineId: i.medicineId,
            medicineName: i.medicineName,
            dosage: i.dosage || "1 tablet",
            frequency: i.frequency || "TDS",
            durationDays: i.durationDays || 5,
            instructions: i.instructions || "After meals",
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, prescription }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
