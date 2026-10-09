import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        department: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = doctors.map((d) => ({
      id: d.id,
      userId: d.userId,
      name: `Dr. ${d.user.firstName} ${d.user.lastName}`,
      email: d.user.email,
      phone: d.user.phone,
      avatar: d.user.avatar,
      departmentId: d.departmentId,
      departmentName: d.department.name,
      departmentCode: d.department.code,
      specialization: d.specialization,
      qualification: d.qualification,
      experienceYears: d.experienceYears,
      consultationFee: Number(d.consultationFee),
      roomNumber: d.roomNumber,
      status: d.status,
      schedule: d.scheduleJson ? JSON.parse(d.scheduleJson) : null,
    }));

    return NextResponse.json({ doctors: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
