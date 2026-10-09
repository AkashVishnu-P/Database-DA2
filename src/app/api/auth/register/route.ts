import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      role = "PATIENT",
      phone,
      departmentId,
      specialization,
      gender = "Male",
      bloodGroup = "O+",
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Fetch default department if needed
    const defaultDept = departmentId
      ? await prisma.department.findUnique({ where: { id: departmentId } })
      : await prisma.department.findFirst();

    // Create User inside transaction along with their role-specific clinical entity
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: role as UserRole,
          firstName,
          lastName,
          phone: phone || "+1 (555) 000-1122",
          status: "ACTIVE",
        },
      });

      // Role specific sub-profile creation
      if (role === "DOCTOR") {
        const docCount = await tx.doctor.count();
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            departmentId: defaultDept?.id || "",
            licenseNumber: `MD-REG-${new Date().getFullYear()}-${String(docCount + 101).padStart(4, "0")}`,
            specialization: specialization || "General Medicine Consultant",
            qualification: "MBBS, MD Board Certified",
            consultationFee: 75.0,
            roomNumber: `Suite ${200 + docCount}`,
            status: "AVAILABLE",
          },
        });
      } else if (
        role === "NURSE" ||
        role === "RECEPTIONIST" ||
        role === "CASHIER" ||
        role === "LAB_TECHNICIAN" ||
        role === "PHARMACIST" ||
        role === "HOSPITAL_ADMIN"
      ) {
        await tx.staff.create({
          data: {
            userId: newUser.id,
            departmentId: defaultDept?.id || "",
            designation: `${role.replace(/_/g, " ")} Officer`,
            shift: "MORNING",
          },
        });
      } else if (role === "PATIENT") {
        const patientCount = await tx.patient.count();
        const year = new Date().getFullYear();
        const uhid = `UHID-${year}-${String(patientCount + 1).padStart(4, "0")}`;

        await tx.patient.create({
          data: {
            userId: newUser.id,
            uhid,
            bloodGroup: bloodGroup || "O+",
            dateOfBirth: new Date("1995-01-01"),
            gender: gender || "Male",
            address: "123 Health Ave",
            emergencyContactPhone: phone || null,
          },
        });
      }

      return newUser;
    });

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
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
    console.error("Register Error:", err);
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
