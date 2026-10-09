import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AppointmentService } from "@/services/appointmentService";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      where.appointmentDate = { gte: d, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      take: limit,
      orderBy: [{ appointmentDate: "desc" }, { tokenNumber: "asc" }],
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
        department: true,
      },
    });

    const formatted = appointments.map((a) => ({
      id: a.id,
      appointmentNumber: a.appointmentNumber,
      patientId: a.patientId,
      patientName: `${a.patient.user?.firstName || "Patient"} ${a.patient.user?.lastName || ""}`.trim(),
      patientUhid: a.patient.uhid,
      doctorId: a.doctorId,
      doctorName: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      departmentName: a.department.name,
      appointmentDate: a.appointmentDate,
      timeSlot: a.timeSlot,
      tokenNumber: a.tokenNumber,
      status: a.status,
      type: a.type,
      priority: a.priority,
      vitals: a.vitalsJson ? JSON.parse(a.vitalsJson) : null,
      notes: a.notes,
    }));

    return NextResponse.json({ appointments: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();

    const result = await AppointmentService.bookAppointment({
      ...body,
      userId: session?.userId,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
