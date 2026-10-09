import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const beds = await prisma.bed.findMany({
      include: {
        room: true,
        patient: {
          include: { user: true },
        },
      },
      orderBy: [{ room: { roomNumber: "asc" } }, { bedNumber: "asc" }],
    });

    const formatted = beds.map((b) => ({
      id: b.id,
      bedNumber: b.bedNumber,
      roomId: b.roomId,
      roomNumber: b.room.roomNumber,
      roomType: b.room.type,
      floor: b.room.floor,
      dailyRate: Number(b.room.dailyRate),
      isOccupied: b.isOccupied,
      status: b.status,
      patientId: b.patientId,
      patientName: b.patient ? `${b.patient.user?.firstName || "Patient"} ${b.patient.user?.lastName || ""}`.trim() : null,
      patientUhid: b.patient?.uhid || null,
    }));

    return NextResponse.json({ beds: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
