"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Pill,
  CreditCard,
  FlaskConical,
  FileText,
  Clock,
  CheckCircle2,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PatientPortalPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const [apptRes, rxRes, billRes, labRes] = await Promise.all([
        fetch("/api/appointments?limit=10"),
        fetch("/api/prescriptions?limit=10"),
        fetch("/api/billing?limit=10"),
        fetch("/api/lab"),
      ]);

      if (apptRes.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (rxRes.ok) {
        const d = await rxRes.json();
        setPrescriptions(d.prescriptions || []);
      }
      if (billRes.ok) {
        const d = await billRes.json();
        setBills(d.bills || []);
      }
      if (labRes.ok) {
        const d = await labRes.json();
        setLabReports((d.requests || []).filter((r: any) => r.status === "COMPLETED"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (billNumber: string) => {
    toast.success(`Downloading tax invoice ${billNumber}...`);
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Patient Health Portal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Health & Clinical Records Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your digital prescriptions, outpatient appointments, laboratory results, and billing receipts.
        </p>
      </div>

      {/* Main Tabs / 2-Col Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>My Scheduled Consultations</CardTitle>
              <CardDescription>Appointments booked with hospital specialists</CardDescription>
            </div>
            <Calendar className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 dark:border-slate-800"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {apt.doctorName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {apt.departmentName} • {apt.timeSlot}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Token #{apt.tokenNumber} ({apt.appointmentNumber})
                    </span>
                  </div>
                  <Badge variant={apt.status === "COMPLETED" ? "success" : "default"}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Digital Prescriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>My Digital Prescriptions</CardTitle>
              <CardDescription>Verified medication instructions</CardDescription>
            </div>
            <Pill className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prescriptions.slice(0, 5).map((rx) => (
                <div
                  key={rx.id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-sky-600">
                      {rx.prescriptionNumber}
                    </span>
                    <Badge variant={rx.status === "DISPENSED" ? "success" : "warning"} className="text-[10px]">
                      {rx.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Prescribed by {rx.doctorName} on {formatDate(rx.issuedAt)}
                  </p>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {rx.items.map((it: any) => `${it.medicineName} (${it.dosage})`).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing & Tax Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Invoices & Payment Receipts</CardTitle>
              <CardDescription>Settled and outstanding hospital statements</CardDescription>
            </div>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bills.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <div>
                    <span className="font-mono font-bold text-xs block text-slate-900 dark:text-white">
                      {b.billNumber}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {b.billType} • Net: {formatCurrency(b.netAmount)}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Balance: {formatCurrency(b.balanceAmount)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={b.paymentStatus === "PAID" ? "success" : "destructive"}>
                      {b.paymentStatus}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(b.billNumber)}
                      className="text-xs h-7 px-2"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Laboratory Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Verified Diagnostic Reports</CardTitle>
              <CardDescription>Laboratory test results released by pathologist</CardDescription>
            </div>
            <FlaskConical className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {labReports.slice(0, 5).map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {lab.testName}
                    </span>
                    <Badge variant={lab.report?.isAbnormal ? "destructive" : "success"} className="text-[10px]">
                      {lab.report?.isAbnormal ? "Abnormal" : "Verified Normal"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Category: {lab.testCategory} • Verified: {formatDate(lab.completedAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
