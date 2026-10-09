"use client";

import React, { useEffect, useState } from "react";
import {
  BedDouble,
  HeartPulse,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const ROOM_TYPES = [
  "ALL",
  "ICU",
  "PRIVATE",
  "SEMI_PRIVATE",
  "GENERAL_WARD",
  "OPERATION_THEATRE",
  "EMERGENCY",
];

export default function BedBoardPage() {
  const [beds, setBeds] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBeds();
  }, []);

  const loadBeds = async () => {
    try {
      const res = await fetch("/api/beds");
      if (res.ok) {
        const d = await res.json();
        setBeds(d.beds || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeds =
    filterType === "ALL" ? beds : beds.filter((b) => b.roomType === filterType);

  const occupiedCount = beds.filter((b) => b.isOccupied).length;
  const availableCount = beds.filter((b) => !b.isOccupied && b.status === "AVAILABLE").length;
  const cleaningCount = beds.filter((b) => b.status === "CLEANING").length;

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Ward Bed Telemetry...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Bed Board & Ward Occupancy Map
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time visual map across Intensive Care Units (ICU), surgical wards, private suites, and general wards.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">{occupiedCount} Occupied</Badge>
          <Badge variant="success">{availableCount} Available</Badge>
          <Badge variant="warning">{cleaningCount} Cleaning</Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 dark:border-slate-800">
        {ROOM_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filterType === t
                ? "bg-sky-600 text-white shadow-xs dark:bg-sky-500"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Grid of Bed Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredBeds.map((bed) => {
          let cardBorder = "border-slate-200 dark:border-slate-800";
          let badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
          let statusText = "Available";

          if (bed.isOccupied) {
            cardBorder = "border-sky-300 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20";
            badgeColor = "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300";
            statusText = "Occupied";
          } else if (bed.status === "CLEANING") {
            cardBorder = "border-amber-300 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20";
            badgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
            statusText = "Sanitizing";
          }

          return (
            <Card key={bed.id} className={`p-3 transition-all hover:shadow-md ${cardBorder}`}>
              <div className="flex items-center justify-between pb-1.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {bed.bedNumber}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
                  {statusText}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="block font-medium text-slate-700 dark:text-slate-300">
                  Room {bed.roomNumber}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {bed.roomType}
                </span>
                <span className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  ${bed.dailyRate}/day
                </span>
              </div>
              {bed.patientName && (
                <div className="mt-2 border-t border-slate-100 pt-1.5 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {bed.patientName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block truncate">
                    {bed.patientUhid}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
