import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AdmissionService } from "@/services/admissionService";
import { getAuthContext } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (status) where.status = status;
    if (session?.role === "PATIENT") where.patientId = session.patientId || "none";

    const admissions = await prisma.admission.findMany({
      where,
      take: limit,
      orderBy: { admissionDate: "desc" },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        room: true,
        bed: true,
        bills: { where: { billType: "INPATIENT" }, orderBy: { createdAt: "asc" } },
      },
    });

    const formatted = admissions.map((adm) => ({
      id: adm.id,
      admissionNumber: adm.admissionNumber,
      patientId: adm.patientId,
      patientName: `${adm.patient.user?.firstName || "Patient"} ${adm.patient.user?.lastName || ""}`.trim(),
      patientUhid: adm.patient.uhid,
      doctorId: adm.doctorId,
      doctorName: `Dr. ${adm.doctor.user.firstName} ${adm.doctor.user.lastName}`,
      roomId: adm.roomId,
      roomNumber: adm.room.roomNumber,
      roomType: adm.room.type,
      bedId: adm.bedId,
      bedNumber: adm.bed.bedNumber,
      dailyRate: Number(adm.room.dailyRate),
      admissionDate: adm.admissionDate,
      dischargeDate: adm.dischargeDate,
      status: adm.status,
      admissionType: adm.admissionType,
      diagnosisAtAdmission: adm.diagnosisAtAdmission,
      dischargeSummary: adm.dischargeSummary,
      activeBillId: adm.bills[0]?.id || null,
    }));

    return NextResponse.json({ admissions: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const body = await req.json();

    if (!body.patientId || !body.doctorId || !body.bedId) {
      return NextResponse.json({ error: "Patient, doctor and bed are required." }, { status: 400 });
    }
    if (!body.roomId) {
      body.roomId = (await prisma.bed.findUnique({ where: { id: body.bedId } }))?.roomId;
    }

    const result = await AdmissionService.admitPatient({
      ...body,
      userId: session?.userId,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
