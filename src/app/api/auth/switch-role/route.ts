import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { UserRole } from "@prisma/client";

const ROLE_EMAIL_MAP: Record<string, string> = {
  SUPER_ADMIN: "admin@hospital.com",
  HOSPITAL_ADMIN: "hospital.admin@hospital.com",
  DOCTOR: "doctor@hospital.com",
  RECEPTIONIST: "receptionist@hospital.com",
  NURSE: "nurse@hospital.com",
  CASHIER: "cashier@hospital.com",
  LAB_TECHNICIAN: "lab@hospital.com",
  PHARMACIST: "pharmacist@hospital.com",
  PATIENT: "patient@hospital.com",
};

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();
    const targetEmail = ROLE_EMAIL_MAP[role] || "admin@hospital.com";

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        doctorProfile: true,
        patientProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Role user not found" }, { status: 404 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar,
      patientId: user.patientProfile?.id || null,
      doctorId: user.doctorProfile?.id || null,
      staffId: user.staffProfile?.id || null,
    });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
