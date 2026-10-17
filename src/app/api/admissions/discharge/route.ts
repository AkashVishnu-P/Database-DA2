import { NextRequest, NextResponse } from "next/server";
import { AdmissionService } from "@/services/admissionService";
import { getAuthContext } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthContext(req);
    const body = await req.json();

    const { admissionId, dischargeDoctorId, dischargeSummary } = body;

    if (!admissionId || !dischargeSummary) {
      return NextResponse.json(
        { error: "admissionId and dischargeSummary are required" },
        { status: 400 }
      );
    }

    const updated = await AdmissionService.dischargePatient({
      admissionId,
      dischargeDoctorId: dischargeDoctorId || session?.doctorId || null,
      dischargeSummary,
      userId: session?.userId,
    });

    return NextResponse.json({ success: true, admission: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
