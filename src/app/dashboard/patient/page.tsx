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
  Plus,
  Droplet,
  MapPin,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
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
  const [profile, setProfile] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookForm, setBookForm] = useState({
    doctorId: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    timeSlot: "10:00 AM",
    notes: "",
  });

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const [apptRes, rxRes, billRes, labRes, profileRes, docRes] = await Promise.all([
        fetch("/api/appointments?limit=10"),
        fetch("/api/prescriptions?limit=10"),
        fetch("/api/billing?limit=10"),
        fetch("/api/lab"),
        fetch("/api/patients?limit=1"),
        fetch("/api/doctors"),
      ]);

      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.patients?.[0] || null);
      }
      if (docRes.ok) {
        const d = await docRes.json();
        setDoctors(d.doctors || []);
      }

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

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.doctorId) {
      toast.error("Please choose a doctor");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Appointment booked! Your token is #${data.appointment.tokenNumber}`);
        setShowBookModal(false);
        loadPatientData();
      } else {
        toast.error(data.error || "Could not book appointment");
      }
    } finally {
      setBooking(false);
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
      <div className="relative overflow-clip rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 p-6 text-white shadow-lg shadow-sky-600/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-sky-100">Welcome back</p>
            <h2 className="text-2xl font-bold tracking-tight">
              {profile ? `${profile.firstName} ${profile.lastName}` : "Patient"}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {profile?.uhid && (
                <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono font-semibold">{profile.uhid}</span>
              )}
              {profile?.bloodGroup && (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                  <Droplet className="h-3 w-3" /> {profile.bloodGroup}
                </span>
              )}
              {profile?.city && (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
                  <MapPin className="h-3 w-3" /> {profile.city}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowBookModal(true)}
            className="bg-white text-sky-700 shadow-md hover:bg-sky-50"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Book appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

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
              {appointments.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  No appointments yet. Book one to get started.
                </p>
              )}
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
              {prescriptions.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  No prescriptions issued yet.
                </p>
              )}
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
              {bills.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  No bills yet.
                </p>
              )}
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
              {labReports.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  No lab reports available yet.
                </p>
              )}
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
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title="Book an appointment"
        description="Pick a doctor, date and time. A consultation bill is created automatically."
        maxWidth="md"
      >
        <form onSubmit={handleBook} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Doctor</label>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={bookForm.doctorId}
              onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.specialization} ({formatCurrency(d.consultationFee)})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date</label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={bookForm.appointmentDate}
                onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Time</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                value={bookForm.timeSlot}
                onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
              >
                {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM", "05:00 PM"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Reason (optional)</label>
            <Input
              value={bookForm.notes}
              onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
              placeholder="e.g. Fever since 2 days"
            />
          </div>
          <Button type="submit" disabled={booking} className="w-full">
            {booking ? "Booking..." : "Confirm booking"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
