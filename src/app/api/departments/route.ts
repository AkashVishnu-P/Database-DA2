import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true, staff: true, appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      floor: d.floor,
      contactNumber: d.contactNumber,
      description: d.description,
      doctorCount: d._count.doctors,
      staffCount: d._count.staff,
      appointmentCount: d._count.appointments,
    }));

    return NextResponse.json({ departments: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
