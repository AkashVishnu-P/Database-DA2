"use client";

import React, { useEffect } from "react";
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
  Activity,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role?: string;
  user?: { name?: string; email?: string; role?: string } | null;
  mobileOpen?: boolean;
  onClose?: () => void;
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  NURSE: "Nurse",
  CASHIER: "Cashier",
  LAB_TECHNICIAN: "Lab Technician",
  PHARMACIST: "Pharmacist",
  PATIENT: "Patient",
};

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "DOCTOR":
      return [
        { href: "/dashboard/doctor", label: "My Consultations", icon: Stethoscope },
        { href: "/dashboard/appointments", label: "OPD Schedule", icon: Calendar },
        { href: "/dashboard/admissions", label: "Ward Rounds", icon: BedDouble },
        { href: "/dashboard/patients", label: "Patient Records", icon: Users },
        { href: "/dashboard/lab", label: "Lab Orders", icon: FlaskConical },
      ];
    case "RECEPTIONIST":
      return [
        { href: "/dashboard/reception", label: "Reception Desk", icon: ClipboardList },
        { href: "/dashboard/patients", label: "Patients", icon: UserPlus },
        { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
        { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
        { href: "/dashboard/admissions", label: "Admissions", icon: BedDouble },
        { href: "/dashboard/beds", label: "Bed Board", icon: HeartPulse },
      ];
    case "CASHIER":
      return [
        { href: "/dashboard/cashier", label: "Cashier Desk", icon: CreditCard },
        { href: "/dashboard/billing", label: "Invoices", icon: ClipboardList },
        { href: "/dashboard/patients", label: "Patient Lookup", icon: Users },
      ];
    case "PHARMACIST":
      return [
        { href: "/dashboard/pharmacist", label: "Dispensing Queue", icon: Pill },
        { href: "/dashboard/pharmacy", label: "Drug Inventory", icon: ClipboardList },
      ];
    case "LAB_TECHNICIAN":
      return [{ href: "/dashboard/lab", label: "Laboratory Orders", icon: FlaskConical }];
    case "NURSE":
      return [
        { href: "/dashboard/nurse", label: "Nurse Station", icon: HeartPulse },
        { href: "/dashboard/beds", label: "Bed Board", icon: BedDouble },
        { href: "/dashboard/patients", label: "Patients", icon: Users },
      ];
    case "PATIENT":
      return [
        { href: "/dashboard/patient", label: "My Health", icon: LayoutDashboard },
        { href: "/dashboard/doctors", label: "Find Doctors", icon: Stethoscope },
        { href: "/dashboard/appointments", label: "My Appointments", icon: Calendar },
        { href: "/dashboard/billing", label: "My Bills", icon: CreditCard },
      ];
    default:
      return [
        { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/patients", label: "Patients", icon: Users },
        { href: "/dashboard/doctors", label: "Doctors & Staff", icon: Stethoscope },
        { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
        { href: "/dashboard/admissions", label: "Admissions", icon: BedDouble },
        { href: "/dashboard/beds", label: "Bed Board", icon: HeartPulse },
        { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill },
        { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
        { href: "/dashboard/lab", label: "Laboratory", icon: FlaskConical },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
      ];
  }
}

export function Sidebar({ role = "SUPER_ADMIN", user, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  useEffect(() => {
    onClose?.();
  }, [pathname]);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-white">CarePulse</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Hospital System
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-500/15 text-white"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-sky-400" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 flex items-center gap-3 rounded-xl bg-slate-800/60 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{user?.name || "User"}</div>
            <div className="truncate text-[11px] text-slate-400">{ROLE_LABELS[role] || role}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
