import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const userId = session?.userId;

    const notifications = await prisma.notification.findMany({
      where: userId ? { userId } : {},
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
