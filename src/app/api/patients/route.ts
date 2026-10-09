import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { uhid: { contains: query } },
        { user: { firstName: { contains: query } } },
        { user: { lastName: { contains: query } } },
        { emergencyContactName: { contains: query } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          occupiedBed: {
            include: { room: true },
          },
          admissions: {
            where: { status: "ADMITTED" },
            take: 1,
          },
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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      bloodGroup,
      address,
      city,
      emergencyContactName,
      emergencyContactPhone,
      allergies,
      chronicConditions,
      insuranceProvider,
      insurancePolicyNumber,
    } = body;

    // Generate next UHID
    const count = await prisma.patient.count();
    const year = new Date().getFullYear();
    const uhid = `UHID-${year}-${String(count + 1).padStart(4, "0")}`;

    // Create user optionally or patient directly
    let createdUser = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        createdUser = await prisma.user.create({
          data: {
            email,
            passwordHash: "$2a$10$w1qM8i3EwF1234567890Ouy7z17Gg4cK", // default hash
            role: "PATIENT",
            firstName,
            lastName,
            phone,
          },
        });
      } else {
        createdUser = existingUser;
      }
    }

    const patient = await prisma.patient.create({
      data: {
        userId: createdUser?.id || null,
        uhid,
        bloodGroup: bloodGroup || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("1990-01-01"),
        gender: gender || "Male",
        address: address || null,
        city: city || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || phone || null,
        allergies: allergies || null,
        chronicConditions: chronicConditions || null,
        insuranceProvider: insuranceProvider || null,
        insurancePolicyNumber: insurancePolicyNumber || null,
      },
      include: { user: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: session?.userId || null,
        action: "PATIENT_REGISTERED",
        entityType: "Patient",
        entityId: patient.id,
        detailsJson: JSON.stringify({ uhid, name: `${firstName} ${lastName}` }),
      },
    });

    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
