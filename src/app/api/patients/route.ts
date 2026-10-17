import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthContext, hashPassword } from "@/lib/auth";
import { nextCode } from "@/lib/numbering";

const DEFAULT_PATIENT_PASSWORD = "Hospital@123";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 500);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { uhid: { contains: query } },
        { user: { firstName: { contains: query } } },
        { user: { lastName: { contains: query } } },
        { user: { email: { contains: query } } },
        { emergencyContactName: { contains: query } },
      ];
    }
    if (session?.role === "PATIENT") {
      where.id = session.patientId || "none";
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          occupiedBed: { include: { room: true } },
          admissions: { where: { status: "ADMITTED" }, take: 1 },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    const formatted = patients.map((p) => ({
      id: p.id,
      uhid: p.uhid,
      firstName: p.user?.firstName || "Anonymous",
      lastName: p.user?.lastName || "Patient",
      gender: p.gender,
      dateOfBirth: p.dateOfBirth,
      bloodGroup: p.bloodGroup,
      phone: p.user?.phone || p.emergencyContactPhone || "N/A",
      email: p.user?.email || "N/A",
      address: p.address,
      city: p.city,
      allergies: p.allergies,
      chronicConditions: p.chronicConditions,
      insuranceProvider: p.insuranceProvider,
      insurancePolicyNumber: p.insurancePolicyNumber,
      isAdmitted: p.admissions.length > 0,
      occupiedBed: p.occupiedBed
        ? {
            bedNumber: p.occupiedBed.bedNumber,
            roomNumber: p.occupiedBed.room.roomNumber,
            roomType: p.occupiedBed.room.type,
          }
        : null,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      patients: formatted,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    if (session?.role === "PATIENT") {
      return NextResponse.json({ error: "Patients cannot register other patients." }, { status: 403 });
    }

    const body = await req.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = body.email ? String(body.email).toLowerCase().trim() : "";
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First name and last name are required." }, { status: 400 });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
      }
    }

    const passwordHash = await hashPassword(body.password || DEFAULT_PATIENT_PASSWORD);

    const patient = await prisma.$transaction(async (tx) => {
      const uhid = await nextCode("UHID", 4, await tx.patient.count(), async (code) =>
        !!(await tx.patient.findUnique({ where: { uhid: code } }))
      );

      const user = await tx.user.create({
        data: {
          email: email || `${uhid.toLowerCase()}@patients.carepulse.local`,
          passwordHash,
          role: "PATIENT",
          firstName,
          lastName,
          phone,
        },
      });

      const created = await tx.patient.create({
        data: {
          userId: user.id,
          uhid,
          bloodGroup: body.bloodGroup || null,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("1990-01-01"),
          gender: body.gender || "Male",
          address: body.address || null,
          city: body.city || null,
          emergencyContactName: body.emergencyContactName || null,
          emergencyContactPhone: body.emergencyContactPhone || phone,
          allergies: body.allergies || null,
          chronicConditions: body.chronicConditions || null,
          insuranceProvider: body.insuranceProvider || null,
          insurancePolicyNumber: body.insurancePolicyNumber || null,
        },
        include: { user: true },
      });

      await tx.activityLog.create({
        data: {
          userId: session?.userId || null,
          action: "PATIENT_REGISTERED",
          entityType: "Patient",
          entityId: created.id,
          detailsJson: JSON.stringify({ uhid, name: `${firstName} ${lastName}` }),
        },
      });

      return created;
    });

    const { passwordHash: _hidden, ...safeUser } = patient.user!;
    return NextResponse.json({ success: true, patient: { ...patient, user: safeUser } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "HOSPITAL_ADMIN")) {
      return NextResponse.json(
        { error: "Only administrators can remove patient records." },
        { status: 403 }
      );
    }

    const patientId = req.nextUrl.searchParams.get("id");
    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true, admissions: { where: { status: "ADMITTED" } } },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const adm of patient.admissions) {
        await tx.room.update({
          where: { id: adm.roomId },
          data: { occupiedBeds: { decrement: 1 } },
        });
      }
      await tx.bed.updateMany({
        where: { patientId: patient.id },
        data: { isOccupied: false, status: "AVAILABLE", patientId: null },
      });

      await tx.payment.deleteMany({ where: { patientId: patient.id } });
      await tx.bill.deleteMany({ where: { patientId: patient.id } });
      await tx.labRequest.deleteMany({ where: { patientId: patient.id } });
      await tx.prescription.deleteMany({ where: { patientId: patient.id } });
      await tx.medicalRecord.deleteMany({ where: { patientId: patient.id } });
      await tx.appointment.deleteMany({ where: { patientId: patient.id } });
      await tx.admission.deleteMany({ where: { patientId: patient.id } });
      await tx.patient.delete({ where: { id: patient.id } });
      if (patient.userId) {
        await tx.user.delete({ where: { id: patient.userId } });
      }

      await tx.activityLog.create({
        data: {
          userId: session.userId,
          action: "PATIENT_DELETED",
          entityType: "Patient",
          entityId: patient.id,
          detailsJson: JSON.stringify({
            uhid: patient.uhid,
            name: `${patient.user?.firstName || ""} ${patient.user?.lastName || ""}`.trim(),
            deletedBy: session.email,
          }),
        },
      });
    });

    return NextResponse.json({ success: true, message: "Patient record removed." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
