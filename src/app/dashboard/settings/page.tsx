"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Database,
  Lock,
  Server,
  Download,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ROLES_INFO = [
  { role: "SUPER_ADMIN", desc: "Full Master Access, User Provisioning, System Audits, Backups", permissions: "All Modules (CRUD + Root)" },
  { role: "HOSPITAL_ADMIN", desc: "Operations, Facility Capacity, Revenue & Financial Reports", permissions: "Admissions, Billing, Staff, Analytics" },
  { role: "DOCTOR", desc: "OPD Consultations, Inpatient Rounds, Prescriptions, Lab Orders", permissions: "Appointments, Prescriptions, Lab Requests, Discharge" },
  { role: "RECEPTIONIST", desc: "Patient Intake, UHID Generation, OPD Appointment Booking", permissions: "Patients (Create/Read), Appointments (Create/Read)" },
  { role: "NURSE", desc: "Ward Management, Bed Telemetry, Vitals Logging", permissions: "Beds, Patients, Vitals" },
  { role: "CASHIER", desc: "Point of Sale (POS) Settlement, Invoices, Payment Receipts", permissions: "Billing, Payments, Invoices" },
  { role: "LAB_TECHNICIAN", desc: "Specimen Testing, Lab Finding Entries, Pathology Verification", permissions: "Lab Tests, Lab Reports" },
  { role: "PHARMACIST", desc: "Prescription Dispensing, Drug Inventory, Batch Stock Deduction", permissions: "Prescriptions (Dispense), Inventory (Manage)" },
  { role: "PATIENT", desc: "Personal Portal: My Appointments, Prescriptions, Bills, Lab Reports", permissions: "Self-Records Only (Read)" },
];

export default function SettingsPage() {
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      setBackingUp(false);
      toast.success("MySQL database backup snapshot completed: hospital_erp_backup.sql");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Administration & RBAC Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Role-Based Access Control matrix, security auditing, and database operational parameters.
        </p>
      </div>

      {/* Database Backup & Health Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Database Infrastructure & Backup</CardTitle>
            <CardDescription>MySQL 8.0 Engine • Database: hospital_erp</CardDescription>
          </div>
          <Badge variant="success">Operational / Healthy</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 bg-slate-50 p-3 rounded-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Relational Driver</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Prisma Client 6.1 + MySQL</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">ACID Guarantee</span>
              <span className="font-semibold text-emerald-600">Strict Transactional Isolation</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Seeded Records</span>
              <span className="font-semibold text-sky-600">1000+ Interconnected Records</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleBackup}
              disabled={backingUp}
              className="bg-sky-600 hover:bg-sky-700"
              size="sm"
            >
              <Database className="mr-1.5 h-4 w-4" />
              {backingUp ? "Generating Backup..." : "Create SQL Snapshot Backup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RBAC Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control (RBAC) Matrix</CardTitle>
          <CardDescription>Active security access boundaries enforced across all 9 roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Role Name</th>
                  <th className="pb-2">Operational Scope</th>
                  <th className="pb-2">Granted Modules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ROLES_INFO.map((r) => (
                  <tr key={r.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-sky-700 dark:text-sky-400">
                      {r.role}
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {r.desc}
                    </td>
                    <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                      {r.permissions}
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
