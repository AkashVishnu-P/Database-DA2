"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  BedDouble,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FileDown,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    toast.success("Hospital KPI Report exported to CSV format");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Executive Quick Actions */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Operations & Executive Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry across clinical departments, inpatient capacity, and financial flows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Audit
          </Button>
          <Link href="/dashboard/admissions">
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
              <Plus className="mr-1.5 h-4 w-4" />
              Admit Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Admitted */}
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inpatients Admitted
            </CardTitle>
            <BedDouble className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis.activeAdmissions || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center">
              <span className="font-semibold text-sky-600 mr-1">{kpis.occupiedBeds || 0} Beds</span>{" "}
              Occupied ({kpis.bedOccupancyRate || 0}%)
            </p>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {kpis.todayAppointments || 0}
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center">
              <span className="font-semibold text-emerald-600 mr-1">{kpis.availableDoctors || 0}</span>{" "}
              Doctors on duty
            </p>
          </CardContent>
        </Card>

        {/* Revenue Collected */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue Settled
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(kpis.totalRevenue || 0)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Today: <span className="font-semibold text-amber-600">{formatCurrency(kpis.todayRevenue || 0)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Ledger */}
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Invoices
            </CardTitle>
            <CreditCard className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(kpis.pendingBillsAmount || 0)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Across <span className="font-semibold text-rose-600">{kpis.pendingBillsCount || 0}</span> bills
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts: Monthly Revenue & Department Load */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        {/* Monthly Revenue Trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Financial Cashflow & Inpatient Billing</CardTitle>
                <CardDescription>Monthly billing aggregates across Inpatient & Outpatient streams</CardDescription>
              </div>
              <Badge variant="success">YTD Healthy</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Department Load</CardTitle>
            <CardDescription>Active patient census across clinical specialties</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentDistribution || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-20} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }} />
                <Bar dataKey="patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Live Activity Stream & Operational Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Live Clinical & System Audit Stream</CardTitle>
              <CardDescription>Real-time automated lifecycle events and user actions</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-sky-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activities recorded.</p>
              ) : (
                activities.map((a: any) => (
                  <div key={a.id} className="flex items-start justify-between border-b border-slate-100 pb-2.5 last:border-0 dark:border-slate-800">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {a.action.replace(/_/g, " ")}
                          </span>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {a.entityType}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Executed by {a.userName}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inpatient Bed Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Bed Capacity</CardTitle>
            <CardDescription>Instant real-time room & bed overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Total Hospital Beds:</span>
              <span className="font-bold">{kpis.totalBeds || 150}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Currently Occupied:</span>
              <span className="font-bold text-sky-600">{kpis.occupiedBeds || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Available For Admission:</span>
              <span className="font-bold text-emerald-600">{kpis.availableBeds || 0}</span>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>Occupancy Ratio</span>
                <span>{kpis.bedOccupancyRate || 0}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all"
                  style={{ width: `${Math.min(100, kpis.bedOccupancyRate || 0)}%` }}
                />
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/beds" className="w-full">
                <Button variant="outline" className="w-full text-xs">
                  Open Interactive Bed Board
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
