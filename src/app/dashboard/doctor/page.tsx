"use client";

import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  Plus,
  Pill,
  FileText,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Activity,
  BedDouble,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showRxModal, setShowRxModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Prescription Form State
  const [rxNotes, setRxNotes] = useState("");
  const [rxItems, setRxItems] = useState([
    { medicineId: "", medicineName: "", dosage: "1 tablet", frequency: "TDS", durationDays: 5, instructions: "After meals" },
  ]);

  // Lab Order State
  const [selectedLabTestId, setSelectedLabTestId] = useState("");
  const [labPriority, setLabPriority] = useState("NORMAL");

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const [apptRes, admRes, medRes, labRes] = await Promise.all([
        fetch("/api/appointments?limit=20"),
        fetch("/api/admissions?status=ADMITTED&limit=15"),
        fetch("/api/inventory"),
        fetch("/api/lab"),
      ]);

      if (apptRes.ok) {
        const d = await apptRes.json();
        setAppointments(d.appointments || []);
      }
      if (admRes.ok) {
        const d = await admRes.json();
        setAdmissions(d.admissions || []);
      }
      if (medRes.ok) {
        const d = await medRes.json();
        setMedicines(d.medicines || []);
      }
      if (labRes.ok) {
        const d = await labRes.json();
        setLabTests(d.tests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRx = (patient: any) => {
    setSelectedPatient(patient);
    setRxItems([
      {
        medicineId: medicines[0]?.id || "",
        medicineName: medicines[0]?.name || "Amoxicillin",
        dosage: "1 tablet",
        frequency: "TDS",
        durationDays: 5,
        instructions: "After meals with water",
      },
    ]);
    setShowRxModal(true);
  };

  const handleOpenLab = (patient: any) => {
    setSelectedPatient(patient);
    setSelectedLabTestId(labTests[0]?.id || "");
    setShowLabModal(true);
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.patientId || selectedPatient.id,
          appointmentId: selectedPatient.appointmentId || selectedPatient.id,
          notes: rxNotes,
          items: rxItems,
        }),
      });

      if (res.ok) {
        toast.success(`Prescription issued successfully for ${selectedPatient.patientName || selectedPatient.uhid}`);
        setShowRxModal(false);
        setRxNotes("");
      } else {
        toast.error("Failed to issue prescription");
      }
    } catch (err) {
      toast.error("Error creating prescription");
    }
  };

  const handleSubmitLabOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedLabTestId) return;

    try {
      const res = await fetch("/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.patientId || selectedPatient.id,
          labTestId: selectedLabTestId,
          priority: labPriority,
        }),
      });

      if (res.ok) {
        toast.success(`Diagnostic order placed for ${selectedPatient.patientName}`);
        setShowLabModal(false);
      } else {
        toast.error("Failed to order lab test");
      }
    } catch (err) {
      toast.error("Error submitting lab order");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Doctor Clinical Console...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Doctor Clinical Workstation
            </h1>
            <Badge variant="success">Duty: Active</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Outpatient consultation queue, active inpatient ward rounds, and instant prescription writer.
          </p>
        </div>
      </div>

      {/* Main Grid: OPD Consultation Queue & Inpatient Rounds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Outpatient Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Today's Outpatient Consultation Queue</CardTitle>
              <CardDescription>Live tokens assigned for OPD consultation</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.slice(0, 7).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-sm dark:bg-sky-950 dark:text-sky-300">
                      #{apt.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {apt.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({apt.patientUhid})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span>{apt.timeSlot}</span>
                        <span>•</span>
                        <span className="capitalize">{apt.type.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRx(apt)}
                      className="text-xs text-sky-600 border-sky-200 hover:bg-sky-50 dark:border-sky-900"
                    >
                      <Pill className="mr-1 h-3.5 w-3.5" />
                      Rx
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLab(apt)}
                      className="text-xs text-teal-600 border-teal-200 hover:bg-teal-50 dark:border-teal-900"
                    >
                      <FlaskConical className="mr-1 h-3.5 w-3.5" />
                      Lab
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Inpatient Ward Rounds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Inpatient Ward Rounds</CardTitle>
              <CardDescription>Admitted patients requiring daily round inspection</CardDescription>
            </div>
            <BedDouble className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.slice(0, 7).map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {adm.patientName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        Room {adm.roomNumber} • Bed {adm.bedNumber}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {adm.diagnosisAtAdmission}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Admitted: {formatDate(adm.admissionDate)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRx(adm)}
                      className="text-xs text-sky-600"
                    >
                      <Pill className="mr-1 h-3.5 w-3.5" />
                      Rx
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Write Prescription */}
      <Modal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        title={`Write Prescription - ${selectedPatient?.patientName || "Patient"}`}
        description="Prescribed medications will be routed directly to the hospital pharmacy for dispensing and inventory decrement."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmitPrescription} className="space-y-4">
          <div className="space-y-3">
            {rxItems.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Medicine
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                      value={item.medicineId}
                      onChange={(e) => {
                        const m = medicines.find((x) => x.id === e.target.value);
                        const newItems = [...rxItems];
                        newItems[idx].medicineId = e.target.value;
                        newItems[idx].medicineName = m?.name || "";
                        setRxItems(newItems);
                      }}
                      required
                    >
                      <option value="">Select Drug</option>
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.strength}) - {m.form}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Frequency
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                      value={item.frequency}
                      onChange={(e) => {
                        const newItems = [...rxItems];
                        newItems[idx].frequency = e.target.value;
                        setRxItems(newItems);
                      }}
                    >
                      <option value="OD">OD (Once daily)</option>
                      <option value="BD">BD (Twice daily)</option>
                      <option value="TDS">TDS (Three times daily)</option>
                      <option value="QID">QID (Four times daily)</option>
                      <option value="SOS">SOS (As needed)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Duration (Days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.durationDays}
                      onChange={(e) => {
                        const newItems = [...rxItems];
                        newItems[idx].durationDays = parseInt(e.target.value) || 1;
                        setRxItems(newItems);
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Instructions
                    </label>
                    <Input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => {
                        const newItems = [...rxItems];
                        newItems[idx].instructions = e.target.value;
                        setRxItems(newItems);
                      }}
                      placeholder="e.g. After meals"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Doctor Advice & Clinical Notes
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
              rows={3}
              value={rxNotes}
              onChange={(e) => setRxNotes(e.target.value)}
              placeholder="Drink plenty of fluids, avoid cold beverages, follow up in 5 days..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowRxModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Order Diagnostic Lab Test */}
      <Modal
        isOpen={showLabModal}
        onClose={() => setShowLabModal(false)}
        title={`Order Diagnostic Lab Test - ${selectedPatient?.patientName || "Patient"}`}
        description="Test fee will be attached to patient bill and test order dispatched to laboratory pipeline."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitLabOrder} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Diagnostic Test
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={selectedLabTestId}
              onChange={(e) => setSelectedLabTestId(e.target.value)}
              required
            >
              {labTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category}) - ${t.fee}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={labPriority}
              onChange={(e) => setLabPriority(e.target.value)}
            >
              <option value="NORMAL">Routine / Normal</option>
              <option value="URGENT">Urgent (Within 4 hours)</option>
              <option value="STAT">STAT (Immediate Emergency)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowLabModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
              Dispatch Lab Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
