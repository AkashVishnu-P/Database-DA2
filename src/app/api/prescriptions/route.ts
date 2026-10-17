import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { nextCode } from "@/lib/numbering";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const searchParams = req.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (session?.role === "PATIENT") where.patientId = session.patientId || "none";

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
        medicineName: i.medicineName || "Medicine",
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
    const session = await getAuthContext(req);
    const body = await req.json();

    const { patientId, appointmentId, admissionId, notes } = body;
    const items = Array.isArray(body.items) ? body.items.filter((i: any) => i.medicineId) : [];

    if (!patientId || items.length === 0) {
      return NextResponse.json(
        { error: "A patient and at least one medicine are required." },
        { status: 400 }
      );
    }

    let doctorId = body.doctorId || session?.doctorId;
    if (!doctorId && admissionId) {
      doctorId = (await prisma.admission.findUnique({ where: { id: admissionId } }))?.doctorId;
    }
    if (!doctorId && appointmentId) {
      doctorId = (await prisma.appointment.findUnique({ where: { id: appointmentId } }))?.doctorId;
    }
    if (!doctorId) {
      return NextResponse.json({ error: "Only doctors can issue prescriptions." }, { status: 403 });
    }

    const prescriptionNumber = await nextCode("RX", 4, await prisma.prescription.count(), async (code) =>
      !!(await prisma.prescription.findUnique({ where: { prescriptionNumber: code } }))
    );

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        admissionId: admissionId || null,
        notes: notes || null,
        items: {
          create: items.map((i: any) => ({
            medicineId: i.medicineId,
            medicineName: i.medicineName || "Medicine",
            dosage: i.dosage || "1 tablet",
            frequency: i.frequency || "TDS",
            durationDays: Number(i.durationDays) || 5,
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
