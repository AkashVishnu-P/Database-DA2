"use client";

import React, { useEffect, useState } from "react";
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PharmacistDashboardPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      const [rxRes, medRes] = await Promise.all([
        fetch("/api/prescriptions"),
        fetch("/api/inventory"),
      ]);

      if (rxRes.ok) {
        const d = await rxRes.json();
        setPrescriptions(d.prescriptions || []);
      }
      if (medRes.ok) {
        const d = await medRes.json();
        setMedicines(d.medicines || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId: string) => {
    try {
      const res = await fetch("/api/prescriptions/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Prescription dispensed! Drug inventory decremented atomically. Pharmacy bill generated: ${data.pharmacyBill?.billNumber}`
        );
        loadPharmacyData();
      } else {
        toast.error(data.error || "Dispensation failed");
      }
    } catch (err) {
      toast.error("Error during dispensation");
    }
  };

  const pendingRx = prescriptions.filter((p) => p.status === "ACTIVE");
  const lowStockMeds = medicines.filter((m) => m.isLowStock);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Pharmacy Station...</div>;
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Hospital Pharmacy & Drug Inventory Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dispense active clinical prescriptions, automate stock deductions, and monitor batch expirations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Prescription Dispensing Pipeline</CardTitle>
              <CardDescription>
                Orders awaiting pharmacist verification and stock deduction
              </CardDescription>
            </div>
            <Badge variant="warning">{pendingRx.length} Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRx.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  All active prescriptions have been dispensed.
                </p>
              ) : (
                pendingRx.map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                            {rx.prescriptionNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {rx.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({rx.patientUhid})
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Prescribed by {rx.doctorName} • {formatDate(rx.issuedAt)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleDispense(rx.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Dispense & Deduct Stock
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg text-xs">
                      {rx.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.medicineName} ({item.dosage})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {item.frequency} • {item.durationDays}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory & Batch Stock</CardTitle>
            <CardDescription>Live stock levels and reorder thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicines.slice(0, 10).map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {med.name} ({med.strength})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {med.genericName} • {med.form}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      med.isLowStock ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {med.totalStock} units
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {formatCurrency(med.unitPrice)}/ea
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
