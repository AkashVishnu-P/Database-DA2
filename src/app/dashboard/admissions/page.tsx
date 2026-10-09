"use client";

import React, { useEffect, useState } from "react";
import {
  BedDouble,
  UserCheck,
  Plus,
  LogOut,
  Clock,
  Building,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admit Modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    patientId: "",
    doctorId: "",
    roomId: "",
    bedId: "",
    admissionType: "ELECTIVE",
    diagnosisAtAdmission: "Inpatient observation and treatment",
  });

  // Discharge Modal
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [dischargeSummary, setDischargeSummary] = useState(
    "Patient symptoms resolved, vitals stable, discharged on oral medication regimen."
  );

  useEffect(() => {
    loadAdmissions();
  }, []);

  const loadAdmissions = async () => {
    try {
      const [admRes, patRes, docRes, bedRes] = await Promise.all([
        fetch("/api/admissions"),
        fetch("/api/patients?limit=100"),
        fetch("/api/doctors"),
        fetch("/api/beds"),
      ]);

      if (admRes.ok) {
        const d = await admRes.json();
        setAdmissions(d.admissions || []);
      }
      if (patRes.ok) {
        const d = await patRes.json();
        setPatients(d.patients || []);
      }
      if (docRes.ok) {
        const d = await docRes.json();
        setDoctors(d.doctors || []);
      }
      if (bedRes.ok) {
        const d = await bedRes.json();
        setBeds(d.beds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const availableBeds = beds.filter((b) => !b.isOccupied && b.status === "AVAILABLE");

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admitForm),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Patient admitted successfully! Bed marked occupied, room occupancy incremented, and Initial Inpatient Bill ${data.bill?.billNumber} generated automatically.`
        );
        setShowAdmitModal(false);
        loadAdmissions();
      } else {
        toast.error(data.error || "Failed to admit patient");
      }
    } catch (err) {
      toast.error("Admission error");
    }
  };

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    try {
      const res = await fetch("/api/admissions/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: selectedAdmission.id,
          dischargeDoctorId: selectedAdmission.doctorId,
          dischargeSummary,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Discharge approved! Bed freed and queued for cleaning, room stay days tallied, and final Inpatient bill balance recalculated.`
        );
        setShowDischargeModal(false);
        loadAdmissions();
      } else {
        toast.error(data.error || "Discharge failed");
      }
    } catch (err) {
      toast.error("Error during discharge");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Inpatient Admissions...</div>;
  }

  const activeAdmissions = admissions.filter((a) => a.status === "ADMITTED");
  const dischargedAdmissions = admissions.filter((a) => a.status === "DISCHARGED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inpatient Admissions & Discharge Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admit patients with automated bed reservation, and execute clinical discharge with room day tallies.
          </p>
        </div>
        <div>
          <Button
            onClick={() => {
              if (patients.length > 0 && doctors.length > 0 && availableBeds.length > 0) {
                setAdmitForm({
                  patientId: patients[0].id,
                  doctorId: doctors[0].id,
                  roomId: availableBeds[0].roomId,
                  bedId: availableBeds[0].id,
                  admissionType: "ELECTIVE",
                  diagnosisAtAdmission: "Inpatient observation and treatment",
                });
              }
              setShowAdmitModal(true);
            }}
            className="bg-sky-600 hover:bg-sky-700"
            size="sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Admit New Patient
          </Button>
        </div>
      </div>

      {/* Main Table: Currently Admitted Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Currently Admitted Inpatients</CardTitle>
            <CardDescription>
              {activeAdmissions.length} Active in-patients occupying ward beds
            </CardDescription>
          </div>
          <Badge variant="warning">{activeAdmissions.length} Admitted</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Admission #</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Room / Bed</th>
                  <th className="pb-2">Attending Doctor</th>
                  <th className="pb-2">Admit Date</th>
                  <th className="pb-2">Admission Type</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {adm.admissionNumber}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {adm.patientName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {adm.patientUhid}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        Room {adm.roomNumber} • Bed {adm.bedNumber}
                      </Badge>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {adm.roomType} (${adm.dailyRate}/day)
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">
                      {adm.doctorName}
                    </td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {formatDate(adm.admissionDate)}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={adm.admissionType === "EMERGENCY" ? "destructive" : "info"}
                        className="text-[10px]"
                      >
                        {adm.admissionType}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAdmission(adm);
                          setShowDischargeModal(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-7 px-2.5"
                      >
                        <LogOut className="mr-1 h-3 w-3" />
                        Discharge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Admit Patient */}
      <Modal
        isOpen={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        title="Admit Patient to Inpatient Ward"
        description="Select an available bed. The system will atomically mark the bed occupied, increment room count, and initialize the Inpatient Bill."
        maxWidth="lg"
      >
        <form onSubmit={handleAdmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Select Patient
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={admitForm.patientId}
              onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
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
              Attending Doctor
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={admitForm.doctorId}
              onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Select Available Bed
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={admitForm.bedId}
              onChange={(e) => {
                const b = availableBeds.find((x) => x.id === e.target.value);
                setAdmitForm({
                  ...admitForm,
                  bedId: e.target.value,
                  roomId: b?.roomId || "",
                });
              }}
              required
            >
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  Bed {b.bedNumber} • Room {b.roomNumber} ({b.roomType} @ ${b.dailyRate}/day)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Admission Type
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                value={admitForm.admissionType}
                onChange={(e) => setAdmitForm({ ...admitForm, admissionType: e.target.value })}
              >
                <option value="ELECTIVE">Elective / Scheduled</option>
                <option value="EMERGENCY">Emergency / Trauma</option>
                <option value="URGENT">Urgent Care</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Provisional Diagnosis
              </label>
              <Input
                value={admitForm.diagnosisAtAdmission}
                onChange={(e) => setAdmitForm({ ...admitForm, diagnosisAtAdmission: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAdmitModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Confirm Admission
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Discharge */}
      <Modal
        isOpen={showDischargeModal}
        onClose={() => setShowDischargeModal(false)}
        title={`Approve Discharge - ${selectedAdmission?.patientName}`}
        description={`Room ${selectedAdmission?.roomNumber} • Bed ${selectedAdmission?.bedNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleDischarge} className="space-y-3">
          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50">
            <p className="font-semibold mb-1">Automated Discharge Operations:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Bed will be released and marked for sanitization/cleaning.</li>
              <li>Room stay days will be calculated and room charges appended to bill.</li>
              <li>Final bill balance updated for cashier settlement.</li>
            </ul>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Discharge Summary & Instructions
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-rose-500 dark:border-slate-800 dark:bg-slate-900"
              rows={3}
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowDischargeModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white">
              Authorize Discharge
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
