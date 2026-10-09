import { NextRequest, NextResponse } from "next/server";
import { PharmacyService } from "@/services/pharmacyService";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const { prescriptionId } = await req.json();

    if (!prescriptionId) {
      return NextResponse.json(
        { error: "prescriptionId is required" },
        { status: 400 }
      );
    }

    const result = await PharmacyService.dispensePrescription(
      prescriptionId,
      session?.userId
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
