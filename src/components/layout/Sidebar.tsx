"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  BedDouble,
  Pill,
  CreditCard,
  FlaskConical,
  BarChart3,
  Settings,
  Stethoscope,
  HeartPulse,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = "SUPER_ADMIN" }: SidebarProps) {
  const pathname = usePathname();

  // Navigation Items Matrix
  const getNavItems = () => {
    switch (role) {
      case "DOCTOR":
        return [
          { href: "/dashboard/doctor", label: "My Consultations", icon: Stethoscope },
          { href: "/dashboard/appointments", label: "OPD Schedule", icon: Calendar },
          { href: "/dashboard/admissions", label: "Ward Rounds", icon: BedDouble },
          { href: "/dashboard/patients", label: "Patient EHR", icon: Users },
          { href: "/dashboard/lab", label: "Lab Orders", icon: FlaskConical },
        ];
      case "RECEPTIONIST":
        return [
          { href: "/dashboard/reception", label: "Reception Desk", icon: ClipboardList },
          { href: "/dashboard/patients", label: "Patient Registration", icon: UserPlus },
          { href: "/dashboard/appointments", label: "Book Appointment", icon: Calendar },
          { href: "/dashboard/admissions", label: "Patient Admission", icon: BedDouble },
          { href: "/dashboard/beds", label: "Ward Bed Board", icon: HeartPulse },
        ];
      case "CASHIER":
        return [
          { href: "/dashboard/cashier", label: "POS Cashier Desk", icon: CreditCard },
          { href: "/dashboard/billing", label: "Invoices & Ledger", icon: ClipboardList },
          { href: "/dashboard/patients", label: "Patient Lookup", icon: Users },
        ];
      case "PHARMACIST":
        return [
          { href: "/dashboard/pharmacist", label: "Dispensing Queue", icon: Pill },
          { href: "/dashboard/pharmacy", label: "Drug Inventory", icon: ClipboardList },
        ];
      case "LAB_TECHNICIAN":
        return [
          { href: "/dashboard/lab", label: "Laboratory Orders", icon: FlaskConical },
        ];
      case "NURSE":
        return [
          { href: "/dashboard/nurse", label: "Nurse Station", icon: HeartPulse },
          { href: "/dashboard/beds", label: "Bed Board", icon: BedDouble },
          { href: "/dashboard/patients", label: "Patient Vitals", icon: Users },
        ];
      case "PATIENT":
        return [
          { href: "/dashboard/patient", label: "Patient Portal", icon: LayoutDashboard },
          { href: "/dashboard/appointments", label: "My Appointments", icon: Calendar },
          { href: "/dashboard/billing", label: "My Invoices", icon: CreditCard },
        ];
      default:
        // SUPER_ADMIN & HOSPITAL_ADMIN
        return [
          { href: "/dashboard/admin", label: "Executive Dashboard", icon: LayoutDashboard },
          { href: "/dashboard/patients", label: "Patients", icon: Users },
          { href: "/dashboard/doctors", label: "Doctors & Staff", icon: Stethoscope },
          { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
          { href: "/dashboard/admissions", label: "Inpatient Admissions", icon: BedDouble },
          { href: "/dashboard/beds", label: "Bed Board", icon: HeartPulse },
          { href: "/dashboard/pharmacy", label: "Pharmacy & Stock", icon: Pill },
          { href: "/dashboard/billing", label: "Billing & Accounts", icon: CreditCard },
          { href: "/dashboard/lab", label: "Laboratory", icon: FlaskConical },
          { href: "/dashboard/analytics", label: "Hospital Analytics", icon: BarChart3 },
          { href: "/dashboard/settings", label: "System Config", icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/50 md:flex">
      <div className="mb-4 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Clinical Modules
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sky-600 text-white shadow-sm dark:bg-sky-500"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "mr-3 h-4 w-4 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role Indicator Footer */}
      <div className="mt-auto rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Environment
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            CarePulse v1.0
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}
