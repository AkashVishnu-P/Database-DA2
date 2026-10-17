import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LabService } from "@/services/labService";
import { getAuthContext } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const where: any = {};
    if (session?.role === "PATIENT") where.patientId = session.patientId || "none";

    const [tests, requests] = await Promise.all([
      prisma.labTest.findMany({ orderBy: { category: "asc" } }),
      prisma.labRequest.findMany({
        where,
        orderBy: { requestedAt: "desc" },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
          labTest: true,
          labReport: { include: { technician: { include: { user: true } } } },
        },
      }),
    ]);

    const formattedRequests = requests.map((r) => ({
      id: r.id,
      requestNumber: r.requestNumber,
      patientId: r.patientId,
      patientName: `${r.patient.user?.firstName || "Patient"} ${r.patient.user?.lastName || ""}`.trim(),
      patientUhid: r.patient.uhid,
      doctorName: `Dr. ${r.doctor.user.firstName} ${r.doctor.user.lastName}`,
      testName: r.labTest.name,
      testCode: r.labTest.code,
      testCategory: r.labTest.category,
      standardFee: Number(r.labTest.standardFee),
      normalRange: r.labTest.normalRange,
      unit: r.labTest.unit,
      status: r.status,
      priority: r.priority,
      requestedAt: r.requestedAt,
      completedAt: r.completedAt,
      report: r.labReport
        ? {
            id: r.labReport.id,
            technicianName: `${r.labReport.technician.user.firstName} ${r.labReport.technician.user.lastName}`,
            result: JSON.parse(r.labReport.resultJson),
            remarks: r.labReport.remarks,
            isAbnormal: r.labReport.isAbnormal,
            verifiedAt: r.labReport.verifiedAt,
          }
        : null,
    }));

    return NextResponse.json({
      tests: tests.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        category: t.category,
        fee: Number(t.standardFee),
        normalRange: t.normalRange,
        unit: t.unit,
      })),
      requests: formattedRequests,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const body = await req.json();

    if (body.action === "COMPLETE_REPORT") {
      if (!body.labRequestId) {
        return NextResponse.json({ error: "labRequestId is required." }, { status: 400 });
      }
      const existing = await prisma.labReport.findUnique({ where: { labRequestId: body.labRequestId } });
      if (existing) {
        return NextResponse.json({ error: "A report has already been submitted for this test." }, { status: 409 });
      }
      const technicianId =
        session?.staffId ||
        (await prisma.staff.findFirst({ where: { user: { role: "LAB_TECHNICIAN" } } }))?.id ||
        (await prisma.staff.findFirst())?.id;
      if (!technicianId) {
        return NextResponse.json({ error: "No lab staff profile found to sign the report." }, { status: 400 });
      }
      const report = await LabService.completeReport({
        labRequestId: body.labRequestId,
        technicianId,
        resultJson: JSON.stringify(body.results),
        remarks: body.remarks,
        isAbnormal: body.isAbnormal,
      });
      return NextResponse.json({ success: true, report });
    }

    if (!body.patientId || !body.labTestId) {
      return NextResponse.json({ error: "Patient and lab test are required." }, { status: 400 });
    }
    const doctorId = body.doctorId || session?.doctorId;
    if (!doctorId) {
      return NextResponse.json({ error: "Only doctors can order lab tests." }, { status: 403 });
    }

    const labRequest = await LabService.requestLabTest({
      patientId: body.patientId,
      doctorId,
      labTestId: body.labTestId,
      appointmentId: body.appointmentId,
      admissionId: body.admissionId,
      priority: body.priority,
      userId: session?.userId,
    });

    return NextResponse.json({ success: true, labRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
