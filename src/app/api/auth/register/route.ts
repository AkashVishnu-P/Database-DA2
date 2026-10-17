import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { nextCode } from "@/lib/numbering";
import { UserRole } from "@prisma/client";

const STAFF_ROLES = ["NURSE", "RECEPTIONIST", "CASHIER", "LAB_TECHNICIAN", "PHARMACIST", "HOSPITAL_ADMIN", "SUPER_ADMIN"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = String(body.role || "PATIENT") as UserRole;
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email and password are required." },
        { status: 400 }
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      let department = body.departmentId
        ? await tx.department.findUnique({ where: { id: body.departmentId } })
        : null;
      if (!department && role !== "PATIENT") {
        department =
          (await tx.department.findFirst({ orderBy: { name: "asc" } })) ??
          (await tx.department.create({
            data: { name: "General Medicine", code: "GENMED", floor: "1st Floor" },
          }));
      }

      const user = await tx.user.create({
        data: { email, passwordHash, role, firstName, lastName, phone, status: "ACTIVE" },
      });

      let patientId: string | null = null;
      let doctorId: string | null = null;
      let staffId: string | null = null;

      if (role === "PATIENT") {
        const uhid = await nextCode("UHID", 4, await tx.patient.count(), async (code) =>
          !!(await tx.patient.findUnique({ where: { uhid: code } }))
        );
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            uhid,
            gender: body.gender || "Male",
            bloodGroup: body.bloodGroup || null,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("2000-01-01"),
            address: body.address || null,
            city: body.city || null,
            emergencyContactName: body.emergencyContactName || null,
            emergencyContactPhone: body.emergencyContactPhone || phone,
            allergies: body.allergies || null,
          },
        });
        patientId = patient.id;
      } else if (role === "DOCTOR") {
        const licenseNumber = await nextCode("MD-REG", 4, await tx.doctor.count(), async (code) =>
          !!(await tx.doctor.findUnique({ where: { licenseNumber: code } }))
        );
        const doctor = await tx.doctor.create({
          data: {
            userId: user.id,
            departmentId: department!.id,
            licenseNumber,
            specialization: body.specialization || "General Physician",
            qualification: body.qualification || "MBBS",
            experienceYears: Number(body.experienceYears) || 0,
            consultationFee: Number(body.consultationFee) || 75,
            status: "AVAILABLE",
          },
        });
        doctorId = doctor.id;
      } else if (STAFF_ROLES.includes(role)) {
        const staff = await tx.staff.create({
          data: {
            userId: user.id,
            departmentId: department!.id,
            designation: role.replace(/_/g, " "),
            shift: "MORNING",
          },
        });
        staffId = staff.id;
      }

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "USER_REGISTERED",
          entityType: "User",
          entityId: user.id,
          detailsJson: JSON.stringify({ email, role }),
        },
      });

      return { user, patientId, doctorId, staffId };
    });

    const { user } = result;
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      patientId: result.patientId,
      doctorId: result.doctorId,
      staffId: result.staffId,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );

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
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
