"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("/api/appointments?limit=100");
      if (res.ok) {
        const d = await res.json();
        setAppointments(d.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Appointments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Outpatient Consultations & Appointment Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily OPD tokens, specialty clinic bookings, and consultation tracking.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {["ALL", "SCHEDULED", "IN_CONSULTATION", "COMPLETED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Appointments Schedule</CardTitle>
            <CardDescription>Showing {filtered.length} scheduled visits</CardDescription>
          </div>
          <Badge variant="outline">{filtered.length} Total</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Token</th>
                  <th className="pb-2">Appointment #</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Consultant Doctor</th>
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Date & Slot</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        {apt.tokenNumber}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-slate-500">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {apt.patientName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {apt.patientUhid}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">
                      {apt.doctorName}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {apt.departmentName}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {formatDate(apt.appointmentDate)} • {apt.timeSlot}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={
                          apt.status === "COMPLETED"
                            ? "success"
                            : apt.status === "IN_CONSULTATION"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
