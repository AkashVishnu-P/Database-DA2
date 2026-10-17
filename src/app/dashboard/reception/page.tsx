"use client";

import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  Users,
  Stethoscope,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReceptionDashboardPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    dateOfBirth: "1992-05-14",
    bloodGroup: "O+",
    allergies: "None",
    chronicConditions: "None",
  });

  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({
    patientId: "",
    doctorId: "",
    departmentId: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    timeSlot: "10:00 AM",
    type: "OUTPATIENT",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docRes, apptRes, patRes, deptRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/appointments?limit=25"),
        fetch("/api/patients?limit=50"),
        fetch("/api/departments"),
      ]);

      if (docRes.ok) {
        const d = await docRes.json();
        setDoctors(d.doctors || []);
      }
      if (apptRes.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (patRes.ok) {
        const d = await patRes.json();
        setPatients(d.patients || []);
      }
      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Patient registered! UHID assigned: ${data.patient.uhid}`);
        setShowRegisterModal(false);
        setRegForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "Male",
          dateOfBirth: "1992-05-14",
          bloodGroup: "O+",
          allergies: "None",
          chronicConditions: "None",
        });
        loadData();
      } else {
        toast.error(data.error || "Failed to register patient");
      }
    } catch (err) {
      toast.error("Registration error");
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apptForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Appointment booked! Token #${data.appointment.tokenNumber} generated.`);
        setShowApptModal(false);
        loadData();
      } else {
        toast.error(data.error || "Failed to book appointment");
      }
    } catch (err) {
      toast.error("Booking error");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Reception Desk...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reception & Patient Intake Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rapid patient check-in, token ticketing, appointment scheduling, and doctor availability.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => setShowRegisterModal(true)}
            className="bg-sky-600 hover:bg-sky-700"
            size="sm"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Register Patient
          </Button>
          <Button
            onClick={() => {
              if (patients.length > 0 && doctors.length > 0) {
                setApptForm((prev) => ({
                  ...prev,
                  patientId: patients[0].id,
                  doctorId: doctors[0].id,
                  departmentId: doctors[0].departmentId,
                }));
              }
              setShowApptModal(true);
            }}
            variant="outline"
            size="sm"
          >
            <Calendar className="mr-1.5 h-4 w-4" />
            Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Live Waiting Room & Queue Tokens</CardTitle>
              <CardDescription>Sequential daily tokens issued for outpatient consultations</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                    <th className="pb-2">Token</th>
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Consultant Doctor</th>
                    <th className="pb-2">Time Slot</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments.slice(0, 10).map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-bold">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          {apt.tokenNumber}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {apt.patientName}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({apt.patientUhid})
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">
                        {apt.doctorName}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {apt.timeSlot}
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

        <Card>
          <CardHeader>
            <CardTitle>Doctor Availability</CardTitle>
            <CardDescription>Live duty and consultation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctors.slice(0, 7).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {doc.specialization} • Room {doc.roomNumber || "Suite"}
                  </p>
                </div>
                <Badge
                  variant={doc.status === "AVAILABLE" ? "success" : "warning"}
                  className="text-[10px]"
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Patient (Intake Desk)"
        description="A permanent Unique Hospital Identifier (UHID) will be generated automatically."
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                First Name
              </label>
              <Input
                required
                value={regForm.firstName}
                onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Last Name
              </label>
              <Input
                required
                value={regForm.lastName}
                onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Phone Number
              </label>
              <Input
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Blood Group
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                value={regForm.bloodGroup}
                onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Date of Birth
              </label>
              <Input
                type="date"
                value={regForm.dateOfBirth}
                onChange={(e) => setRegForm({ ...regForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Gender
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                value={regForm.gender}
                onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Complete Registration
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showApptModal}
        onClose={() => setShowApptModal(false)}
        title="Schedule Outpatient Consultation"
        description="Assigns sequential daily token number and creates OPD consultation bill item."
        maxWidth="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Select Patient
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={apptForm.patientId}
              onChange={(e) => setApptForm({ ...apptForm, patientId: e.target.value })}
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.uhid})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Select Doctor
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={apptForm.doctorId}
              onChange={(e) => {
                const doc = doctors.find((d) => d.id === e.target.value);
                setApptForm({
                  ...apptForm,
                  doctorId: e.target.value,
                  departmentId: doc?.departmentId || "",
                });
              }}
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} - {d.specialization} (${d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Date
              </label>
              <Input
                type="date"
                value={apptForm.appointmentDate}
                onChange={(e) => setApptForm({ ...apptForm, appointmentDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Time Slot
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                value={apptForm.timeSlot}
                onChange={(e) => setApptForm({ ...apptForm, timeSlot: e.target.value })}
              >
                {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "02:30 PM", "03:00 PM"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowApptModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Generate Token & Confirm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
