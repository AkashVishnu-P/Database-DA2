"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Building2,
  UserPlus,
  LogIn,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const QUICK_ROLES = [
  { role: "SUPER_ADMIN", label: "Super Admin", email: "admin@hospital.com" },
  { role: "HOSPITAL_ADMIN", label: "Hospital Admin", email: "hospital.admin@hospital.com" },
  { role: "DOCTOR", label: "Doctor", email: "doctor@hospital.com" },
  { role: "RECEPTIONIST", label: "Receptionist", email: "receptionist@hospital.com" },
  { role: "NURSE", label: "Nurse", email: "nurse@hospital.com" },
  { role: "CASHIER", label: "Cashier", email: "cashier@hospital.com" },
  { role: "LAB_TECHNICIAN", label: "Lab Tech", email: "lab@hospital.com" },
  { role: "PHARMACIST", label: "Pharmacist", email: "pharmacist@hospital.com" },
  { role: "PATIENT", label: "Patient", email: "patient@hospital.com" },
];

const ALL_ROLES = [
  { value: "PATIENT", label: "Patient (Personal Health Portal)" },
  { value: "DOCTOR", label: "Doctor / Physician (OPD & Rounds)" },
  { value: "RECEPTIONIST", label: "Receptionist (Intake & Tokens)" },
  { value: "NURSE", label: "Nurse (Ward Care & Bed Telemetry)" },
  { value: "CASHIER", label: "Cashier (POS Invoicing & Billing)" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician (Diagnostics)" },
  { value: "PHARMACIST", label: "Pharmacist (Dispensing & Stock)" },
  { value: "HOSPITAL_ADMIN", label: "Hospital Administrator" },
  { value: "SUPER_ADMIN", label: "Super Admin (System Root)" },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login State
  const [loginEmail, setLoginEmail] = useState("admin@hospital.com");
  const [loginPassword, setLoginPassword] = useState("Hospital@123");
  const [loading, setLoading] = useState(false);

  // Register State
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("PATIENT");
  const [regPhone, setRegPhone] = useState("");
  const [regSpecialization, setRegSpecialization] = useState("Cardiologist");
  const [regBloodGroup, setRegBloodGroup] = useState("O+");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error("Network error during login");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          phone: regPhone,
          specialization: regRole === "DOCTOR" ? regSpecialization : undefined,
          bloodGroup: regRole === "PATIENT" ? regBloodGroup : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success(`Account created as ${data.user.role}! Redirecting...`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error("Network error during registration");
      setLoading(false);
    }
  };

  const handleQuickSelect = (roleEmail: string) => {
    setLoginEmail(roleEmail);
    setLoginPassword("Hospital@123");
    toast.info(`Filled credentials for ${roleEmail}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column: Visual Healthcare Hero */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CarePulse ERP</h1>
            <p className="text-xs text-sky-300">Enterprise Clinical & Hospital Operating System</p>
          </div>
        </div>

        <div className="space-y-6">
          <Badge className="border-sky-400/30 bg-sky-500/20 text-sky-200">
            Enterprise Edition v2026.4
          </Badge>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Comprehensive Hospital Management, Synchronized in Real Time.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
            Empowering medical staff with unified clinical electronic health records, automated bed occupancy tracking, prescription inventory synchronization, and frictionless point-of-sale invoicing.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>ACID Transactional Guarantees</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Automated Ward Bed Triggers</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>9 Tailored Role Portals</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Stock & Dispensation Sync</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 CarePulse Health Systems</span>
          <div className="flex space-x-4">
            <span>HIPAA Compliant</span>
            <span>HL7 / FHIR Ready</span>
          </div>
        </div>
      </div>

      {/* Right Column: Tabbed Form (Sign In / Register) */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register New Account</span>
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === "login" && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Sign In to Workstation
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your clinical credentials or select a 1-click role account below.
                </p>
              </div>

              {/* 1-Click Role Quick Fill */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 dark:border-sky-950 dark:bg-sky-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    1-Click Demo Login
                  </span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                    Password: Hospital@123
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_ROLES.map((q) => (
                    <button
                      key={q.role}
                      type="button"
                      onClick={() => handleQuickSelect(q.email)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span className="truncate block font-semibold">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hospital Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                      placeholder="doctor@hospital.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info("Demo password is: Hospital@123");
                      }}
                      className="text-xs text-sky-600 hover:underline dark:text-sky-400"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <span>Remember this workstation</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-md shadow-sky-600/20"
                >
                  {loading ? (
                    "Authenticating..."
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === "register" && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Hospital Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register as any hospital role with automated clinical entity provisioning.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      First Name
                    </label>
                    <Input
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Last Name
                    </label>
                    <Input
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Hospital Role
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@hospital.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Contact Phone
                  </label>
                  <Input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                  />
                </div>

                {/* Conditional fields based on role */}
                {regRole === "DOCTOR" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Medical Specialization
                    </label>
                    <Input
                      value={regSpecialization}
                      onChange={(e) => setRegSpecialization(e.target.value)}
                      placeholder="e.g. Neurologist, Orthopedic Surgeon"
                    />
                  </div>
                )}

                {regRole === "PATIENT" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Blood Group
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 mt-2"
                >
                  {loading ? (
                    "Creating Account..."
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>Register & Launch Dashboard</span>
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
