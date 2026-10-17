"use client";

import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Building,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/departments"),
      ]);

      if (docRes.ok) {
        const d = await docRes.json();
        setDoctors(d.doctors || []);
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

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Medical Staff Roster...</div>;
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Medical Staff Roster & Clinical Departments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Certified consultant physicians, surgeons, duty status, and departmental affiliations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc) => (
          <Card key={doc.id} className="p-4 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {doc.name}
                </h3>
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {doc.specialization}
                </p>
                <p className="text-[11px] text-slate-500">
                  {doc.departmentName} ({doc.departmentCode})
                </p>
              </div>
              <Badge
                variant={doc.status === "AVAILABLE" ? "success" : "warning"}
                className="text-[10px]"
              >
                {doc.status}
              </Badge>
            </div>

            <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <p className="text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Qualification: </span>
                {doc.qualification}
              </p>
              <p className="text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Experience: </span>
                {doc.experienceYears} Years
              </p>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(doc.consultationFee)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
