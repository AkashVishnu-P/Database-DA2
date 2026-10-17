import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      availableDoctors,
      todayAppointments,
      activeAdmissions,
      totalBeds,
      occupiedBeds,
      todayPayments,
      totalPayments,
      pendingBills,
      recentActivities,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.doctor.count({ where: { status: "AVAILABLE" } }),
      prisma.appointment.count({
        where: { appointmentDate: { gte: today, lte: endToday } },
      }),
      prisma.admission.count({ where: { status: "ADMITTED" } }),
      prisma.bed.count(),
      prisma.bed.count({ where: { isOccupied: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: today }, status: "SUCCESS" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.bill.aggregate({
        _count: { id: true },
        _sum: { balanceAmount: true },
        where: { paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } },
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

    const bedOccupancyRate =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const monthStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const [recentPayments, departments, appointmentsByDept] = await Promise.all([
      prisma.payment.findMany({
        where: { createdAt: { gte: monthStart }, status: "SUCCESS" },
        select: { amount: true, createdAt: true, bill: { select: { billType: true } } },
      }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.appointment.groupBy({ by: ["departmentId"], _count: { id: true } }),
    ]);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(monthStart.getFullYear(), monthStart.getMonth() + i, 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString("en-US", { month: "short" }),
        revenue: 0,
        outpatient: 0,
        inpatient: 0,
      };
    });
    for (const p of recentPayments) {
      const key = `${p.createdAt.getFullYear()}-${p.createdAt.getMonth()}`;
      const bucket = monthlyRevenue.find((m) => m.key === key);
      if (!bucket) continue;
      const amount = Number(p.amount);
      bucket.revenue += amount;
      if (p.bill?.billType === "INPATIENT") bucket.inpatient += amount;
      else bucket.outpatient += amount;
    }

    const departmentDistribution = departments
      .map((d) => ({
        name: d.name,
        patients: appointmentsByDept.find((a) => a.departmentId === d.id)?._count.id || 0,
      }))
      .filter((d) => d.patients > 0)
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 8);

    return NextResponse.json({
      kpis: {
        totalPatients,
        totalDoctors,
        availableDoctors,
        todayAppointments,
        activeAdmissions,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        bedOccupancyRate,
        todayRevenue: Number(todayPayments._sum.amount || 0),
        totalRevenue: Number(totalPayments._sum.amount || 0),
        pendingBillsCount: pendingBills._count.id,
        pendingBillsAmount: Number(pendingBills._sum.balanceAmount || 0),
      },
      charts: {
        monthlyRevenue: monthlyRevenue.map(({ key, ...rest }) => ({
          ...rest,
          revenue: Math.round(rest.revenue),
          outpatient: Math.round(rest.outpatient),
          inpatient: Math.round(rest.inpatient),
        })),
        departmentDistribution,
      },
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        details: a.detailsJson ? JSON.parse(a.detailsJson) : null,
        userName: a.user ? `${a.user.firstName} ${a.user.lastName}` : "System Automated",
        createdAt: a.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
