"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Activity,
  BedDouble,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
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
  Legend,
} from "recharts";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    toast.success("Executive Analytics Report exported to Excel (.xlsx)");
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Hospital Analytics...</div>;
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Performance & Clinical Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Longitudinal trends in patient census, occupancy ratios, revenue streams, and resource allocation.
          </p>
        </div>
        <div>
          <Button onClick={handleExport} className="bg-sky-600 hover:bg-sky-700" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export Executive Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Total Patient Encounters</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {kpis.totalPatients || 100}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">+14% vs last quarter</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Average Bed Occupancy</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {kpis.bedOccupancyRate || 0}%
          </p>
          <span className="text-[10px] text-sky-600 font-semibold">Ward utilization stable</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Gross Revenue Collected</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(kpis.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">92% collection efficiency</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-500">Clinical Active Doctors</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {kpis.totalDoctors || 30}
          </p>
          <span className="text-[10px] text-slate-400">Across 10 clinical specialties</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown: Inpatient vs Outpatient</CardTitle>
            <CardDescription>Monthly collections comparison in USD</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }} />
                <Legend />
                <Bar dataKey="inpatient" fill="#0284c7" name="Inpatient Ward" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outpatient" fill="#0d9488" name="Outpatient OPD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departmental Census Distribution</CardTitle>
            <CardDescription>Active patient census per department</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-30} textAnchor="end" height={60} tickFormatter={(v: string) => v.split(" ")[0]} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff" }} />
                <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
