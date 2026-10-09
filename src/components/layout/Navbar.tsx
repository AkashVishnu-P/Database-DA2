"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Moon,
  Sun,
  User,
  Shield,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface NavbarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const ROLES = [
  { key: "SUPER_ADMIN", label: "Super Admin", color: "bg-purple-500", desc: "Full Master Access" },
  { key: "HOSPITAL_ADMIN", label: "Hospital Admin", color: "bg-blue-600", desc: "Operations & Analytics" },
  { key: "DOCTOR", label: "Doctor", color: "bg-emerald-600", desc: "OPD & Inpatient Care" },
  { key: "RECEPTIONIST", label: "Receptionist", color: "bg-cyan-600", desc: "Registration & Queue" },
  { key: "NURSE", label: "Nurse", color: "bg-teal-600", desc: "Ward & Bed Vitals" },
  { key: "CASHIER", label: "Cashier", color: "bg-amber-600", desc: "Billing & POS Invoices" },
  { key: "LAB_TECHNICIAN", label: "Lab Technician", color: "bg-indigo-600", desc: "Diagnostic Testing" },
  { key: "PHARMACIST", label: "Pharmacist", color: "bg-orange-600", desc: "Medicine Dispensing" },
  { key: "PATIENT", label: "Patient", color: "bg-sky-500", desc: "Personal Portal" },
];

export function Navbar({ currentUser }: NavbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleRoleSwitch = async (targetRole: string) => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        toast.success(`Switched role to ${targetRole}`);
        setShowRoleModal(false);
        router.refresh();
        window.location.reload();
      }
    } catch (e) {
      toast.error("Failed to switch role");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.info("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 sm:px-6">
        {/* Left: Brand & Search bar trigger */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 shadow-md shadow-sky-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                CarePulse <span className="text-sky-600 dark:text-sky-400">ERP</span>
              </span>
              <span className="hidden text-[10px] uppercase tracking-wider text-slate-400 sm:block">
                Hospital Operating System
              </span>
            </div>
          </div>

          {/* Quick Search Shortcut */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-slate-700 md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search patients, doctors, records...</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-sm dark:bg-slate-900">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Role Switcher Badge */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="group flex items-center space-x-2 rounded-lg border border-sky-200 bg-sky-50/80 px-2.5 py-1 text-xs font-medium text-sky-800 transition hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
            title="Click to switch role demo"
          >
            <Shield className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-bold underline decoration-sky-400 underline-offset-2">
              {currentUser?.role || "GUEST"}
            </span>
            <Layers className="h-3 w-3 opacity-60 group-hover:opacity-100" />
          </button>

          {/* Dark / Light Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Notification Center Trigger */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-600 dark:text-slate-300"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                </span>
              )}
            </Button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Notifications
                  </h4>
                  <Badge variant="info">
                    {notifications.filter((n) => !n.isRead).length} new
                  </Badge>
                </div>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      No new notifications
                    </p>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg p-2 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {currentUser?.name
                ? currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "U"}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                {currentUser?.name || "Healthcare Staff"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {currentUser?.email || "staff@hospital.com"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Demo Role Switcher Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Switch User Role (Demo / Testing Mode)"
        description="Select any role below to instantly log in and experience the tailored dashboard and workflows."
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2 md:grid-cols-3">
          {ROLES.map((r) => {
            const isCurrent = currentUser?.role === r.key;
            return (
              <button
                key={r.key}
                onClick={() => handleRoleSwitch(r.key)}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  isCurrent
                    ? "border-sky-500 bg-sky-50/50 shadow-sm dark:border-sky-500 dark:bg-sky-950/30"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">
                      Active
                    </span>
                  )}
                </div>
                <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {r.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {r.desc}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Global Search Modal */}
      <Modal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Global Clinical Search"
        description="Search by Patient UHID, Name, Doctor, or Appointment Number"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. UHID-2026-0001 or Marcus House..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="text-xs text-slate-400">
            Press ESC to close or enter keyword to filter patient records and appointments.
          </div>
        </div>
      </Modal>
    </>
  );
}
