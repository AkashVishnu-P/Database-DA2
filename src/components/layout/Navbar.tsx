"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Moon, Sun, LogOut, Layers, Menu, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface NavbarProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onMenuClick?: () => void;
}

const ROLES = [
  { key: "SUPER_ADMIN", label: "Super Admin", color: "bg-purple-500", desc: "Full master access" },
  { key: "HOSPITAL_ADMIN", label: "Hospital Admin", color: "bg-blue-600", desc: "Operations & analytics" },
  { key: "DOCTOR", label: "Doctor", color: "bg-emerald-600", desc: "OPD & inpatient care" },
  { key: "RECEPTIONIST", label: "Receptionist", color: "bg-cyan-600", desc: "Registration & queue" },
  { key: "NURSE", label: "Nurse", color: "bg-teal-600", desc: "Ward & bed vitals" },
  { key: "CASHIER", label: "Cashier", color: "bg-amber-600", desc: "Billing & invoices" },
  { key: "LAB_TECHNICIAN", label: "Lab Technician", color: "bg-indigo-600", desc: "Diagnostic testing" },
  { key: "PHARMACIST", label: "Pharmacist", color: "bg-orange-600", desc: "Medicine dispensing" },
  { key: "PATIENT", label: "Patient", color: "bg-sky-500", desc: "Personal portal" },
];

const DEMO_EMAILS = [
  "admin@hospital.com",
  "hospital.admin@hospital.com",
  "doctor@hospital.com",
  "receptionist@hospital.com",
  "nurse@hospital.com",
  "cashier@hospital.com",
  "lab@hospital.com",
  "pharmacist@hospital.com",
  "patient@hospital.com",
];

const PAGE_TITLES: Record<string, string> = {
  admin: "Dashboard",
  admissions: "Admissions",
  analytics: "Analytics",
  appointments: "Appointments",
  beds: "Bed Board",
  billing: "Billing",
  cashier: "Cashier Desk",
  doctor: "My Consultations",
  doctors: "Doctors",
  lab: "Laboratory",
  nurse: "Nurse Station",
  patient: "My Health",
  patients: "Patients",
  pharmacist: "Dispensing Queue",
  pharmacy: "Pharmacy",
  reception: "Reception Desk",
  settings: "Settings",
};

export function Navbar({ currentUser, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const isDemoAccount = !!currentUser?.email && DEMO_EMAILS.includes(currentUser.email);
  const canSearch = currentUser?.role !== "PATIENT";
  const section = pathname.split("/")[2] || "";
  const pageTitle = PAGE_TITLES[section] || "Dashboard";
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && canSearch) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [canSearch]);

  useEffect(() => {
    if (!showSearchModal || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/patients?query=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.patients || []);
        }
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, showSearchModal]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {}
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRoleSwitch = async (targetRole: string) => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to switch role");
        return;
      }
      toast.success(`Switched to ${targetRole.replace(/_/g, " ").toLowerCase()}`);
      setShowRoleModal(false);
      window.location.href = "/dashboard";
    } catch {
      toast.error("Failed to switch role");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.info("Signed out");
    router.push("/login");
    router.refresh();
  };

  const initials = (currentUser?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {pageTitle}
          </h1>
        </div>

        {canSearch && (
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 md:flex"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search patients...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900">
              ⌘K
            </kbd>
          </button>
        )}

        <div className="flex items-center gap-1.5">
          {isDemoAccount && (
            <button
              onClick={() => setShowRoleModal(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300 sm:flex"
              title="Switch demo role"
            >
              <Layers className="h-3.5 w-3.5" />
              Switch role
            </button>
          )}

          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          )}

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-sky-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">You're all caught up</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-lg p-2.5 text-xs ${
                          n.isRead ? "" : "bg-sky-50/70 dark:bg-sky-950/30"
                        }`}
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-slate-500 dark:text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="ml-1 flex items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              title="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Switch demo role"
        description="Jump into any role's dashboard using the built-in demo accounts."
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
                    ? "border-sky-500 bg-sky-50/60 dark:border-sky-500 dark:bg-sky-950/30"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                  {isCurrent && <Badge variant="info">Current</Badge>}
                </div>
                <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{r.label}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setSearchQuery("");
        }}
        title="Search patients"
        description="Search by UHID, name or email"
        maxWidth="lg"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. UHID-2026-0001 or Kumar"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            {searching && <p className="py-3 text-center text-xs text-slate-400">Searching...</p>}
            {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
              <p className="py-3 text-center text-xs text-slate-400">No patients found</p>
            )}
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery("");
                  router.push(`/dashboard/patients?q=${encodeURIComponent(p.uhid)}`);
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {p.uhid} · {p.email}
                  </p>
                </div>
                {p.isAdmitted && <Badge variant="warning">Admitted</Badge>}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
