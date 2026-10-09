import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        doctorProfile: { select: { id: true, specialization: true } },
        patientProfile: { select: { id: true, uhid: true } },
        staffProfile: { select: { id: true, designation: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        doctorId: user.doctorProfile?.id,
        patientId: user.patientProfile?.id,
        uhid: user.patientProfile?.uhid,
        staffId: user.staffProfile?.id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
