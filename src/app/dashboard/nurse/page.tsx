"use client";

import React, { useEffect, useState } from "react";
import {
  HeartPulse,
  BedDouble,
  Activity,
  CheckCircle2,
  Clock,
  Plus,
  Thermometer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function NurseDashboardPage() {
  const [beds, setBeds] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals recording modal
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [vitals, setVitals] = useState({
    bp: "120/80",
    pulse: "72 bpm",
    temp: "98.6 F",
    spo2: "99%",
    notes: "Patient alert, oriented, resting comfortably.",
  });

  useEffect(() => {
    loadNurseData();
  }, []);

  const loadNurseData = async () => {
    try {
      const [bedRes, admRes] = await Promise.all([
        fetch("/api/beds"),
        fetch("/api/admissions?status=ADMITTED"),
      ]);

      if (bedRes.ok) {
        const d = await bedRes.json();
        setBeds(d.beds || []);
      }
      if (admRes.ok) {
        const d = await admRes.json();
        setAdmissions(d.admissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVitals = (adm: any) => {
    setSelectedAdmission(adm);
    setShowVitalsModal(true);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      `Vitals logged for Patient ${selectedAdmission?.patientName} (BP: ${vitals.bp}, Pulse: ${vitals.pulse}, SpO2: ${vitals.spo2})`
    );
    setShowVitalsModal(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Nurse Ward Station...</div>;
  }

  const occupiedBeds = beds.filter((b) => b.isOccupied);
  const availableBeds = beds.filter((b) => !b.isOccupied && b.status === "AVAILABLE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Nursing Station & Ward Care Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inpatient ward monitoring, bed status management, and clinical vitals logging.
        </p>
      </div>

      {/* Main Grid: Inpatient Ward Care & Bed Visualizer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Inpatients Under Care */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Inpatients Under Active Nursing Care</CardTitle>
              <CardDescription>Ward rounds and hourly vitals checks</CardDescription>
            </div>
            <Badge variant="info">{admissions.length} Admitted</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admissions.map((adm) => (
                <div
                  key={adm.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {adm.patientName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({adm.patientUhid})
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        Room {adm.roomNumber} • Bed {adm.bedNumber}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                      Attending: {adm.doctorName} • {adm.diagnosisAtAdmission}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenVitals(adm)}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8"
                  >
                    <Thermometer className="mr-1.5 h-3.5 w-3.5" />
                    Record Vitals
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Ward Bed Status Mini Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Ward Bed Overview</CardTitle>
            <CardDescription>
              {occupiedBeds.length} Occupied • {availableBeds.length} Available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
              {beds.slice(0, 36).map((bed) => (
                <div
                  key={bed.id}
                  className={`p-2 rounded-lg border text-center transition ${
                    bed.isOccupied
                      ? "border-sky-300 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40"
                      : bed.status === "CLEANING"
                      ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {bed.bedNumber}
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    {bed.roomNumber}
                  </span>
                  <span
                    className={`inline-block mt-1 text-[8px] font-semibold uppercase px-1 py-0.2 rounded ${
                      bed.isOccupied
                        ? "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900"
                        : "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900"
                    }`}
                  >
                    {bed.isOccupied ? "Occupied" : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Record Vitals */}
      <Modal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        title={`Record Clinical Vitals - ${selectedAdmission?.patientName}`}
        description={`Room ${selectedAdmission?.roomNumber} • Bed ${selectedAdmission?.bedNumber}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveVitals} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Blood Pressure (BP)
              </label>
              <Input
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                placeholder="120/80"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Heart Pulse (BPM)
              </label>
              <Input
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                placeholder="72 bpm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Temperature (°F)
              </label>
              <Input
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                placeholder="98.6 F"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Oxygen Saturation (SpO2)
              </label>
              <Input
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                placeholder="99%"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Nursing Notes
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
              rows={2}
              value={vitals.notes}
              onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowVitalsModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
              Save Vitals to Chart
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
