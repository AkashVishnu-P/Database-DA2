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

    // Monthly revenue simulation data for Recharts
    const monthlyRevenue = [
      { month: "Jan", revenue: 45200, outpatient: 18000, inpatient: 27200 },
      { month: "Feb", revenue: 52100, outpatient: 21000, inpatient: 31100 },
      { month: "Mar", revenue: 48900, outpatient: 19500, inpatient: 29400 },
      { month: "Apr", revenue: 61400, outpatient: 24000, inpatient: 37400 },
      { month: "May", revenue: 58700, outpatient: 22800, inpatient: 35900 },
      { month: "Jun", revenue: 67300, outpatient: 26500, inpatient: 40800 },
      { month: "Jul", revenue: 72100, outpatient: 28400, inpatient: 43700 },
      { month: "Aug", revenue: 69800, outpatient: 27100, inpatient: 42700 },
      { month: "Sep", revenue: 76400, outpatient: 30200, inpatient: 46200 },
      { month: "Oct", revenue: 84500, outpatient: 33100, inpatient: 51400 },
    ];

    // Department Distribution
    const departmentDistribution = [
      { name: "General Medicine", patients: 84 },
      { name: "Cardiology", patients: 62 },
      { name: "Neurology", patients: 45 },
      { name: "Orthopedics", patients: 58 },
      { name: "Pediatrics", patients: 39 },
      { name: "Emergency", patients: 95 },
    ];

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
        monthlyRevenue,
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
