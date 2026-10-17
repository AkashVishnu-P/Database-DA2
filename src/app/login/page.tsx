"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { value: "PATIENT", label: "Patient" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "NURSE", label: "Nurse" },
  { value: "CASHIER", label: "Cashier" },
  { value: "LAB_TECHNICIAN", label: "Lab Technician" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "HOSPITAL_ADMIN", label: "Hospital Administrator" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY_REGISTER = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  role: "PATIENT",
  gender: "Male",
  dateOfBirth: "",
  bloodGroup: "O+",
  city: "",
  address: "",
  departmentId: "",
  specialization: "",
};

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:border-slate-800 dark:bg-slate-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [reg, setReg] = useState(EMPTY_REGISTER);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => (r.ok ? r.json() : { departments: [] }))
      .then((d) => setDepartments(d.departments || []))
      .catch(() => {});
  }, []);

  const updateReg = (key: keyof typeof EMPTY_REGISTER, value: string) =>
    setReg((prev) => ({ ...prev, [key]: value }));

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
        toast.error(data.error || "Sign in failed");
        setLoading(false);
        return;
      }
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error during sign in");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reg.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const isPatient = reg.role === "PATIENT";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: reg.firstName,
          lastName: reg.lastName,
          email: reg.email,
          password: reg.password,
          phone: reg.phone,
          role: reg.role,
          gender: isPatient ? reg.gender : undefined,
          dateOfBirth: isPatient && reg.dateOfBirth ? reg.dateOfBirth : undefined,
          bloodGroup: isPatient ? reg.bloodGroup : undefined,
          city: isPatient ? reg.city : undefined,
          address: isPatient ? reg.address : undefined,
          departmentId: !isPatient ? reg.departmentId || undefined : undefined,
          specialization: reg.role === "DOCTOR" ? reg.specialization : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      toast.success("Account created! Opening your dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error during registration");
      setLoading(false);
    }
  };

  const handleQuickSelect = (email: string) => {
    setLoginEmail(email);
    setLoginPassword("Hospital@123");
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-teal-400/15 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/30">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">CarePulse</div>
            <div className="text-xs text-slate-400">Hospital Management System</div>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            Care for patients.
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-teal-300 bg-clip-text text-transparent">
              We'll handle the records.
            </span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Registration, appointments, admissions, pharmacy, lab and billing in one place,
            with every action saved straight to the hospital database.
          </p>
          <div className="grid max-w-md grid-cols-2 gap-3 pt-2">
            {["Patient registration", "OPD appointments", "Bed & ward tracking", "Billing & payments"].map(
              (f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  {f}
                </div>
              )
            )}
          </div>
        </div>

        <div className="relative text-xs text-slate-500">© {new Date().getFullYear()} CarePulse Health</div>
      </div>

      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight">CarePulse</div>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {tab === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {activeTab === "login" ? (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-500">Sign in with your hospital account.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                      placeholder="you@hospital.com"
                    />
                  </div>
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="px-9"
                      placeholder="Your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
                <Button type="submit" disabled={loading} className="h-11 w-full text-sm font-semibold">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Demo accounts
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Hospital@123</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_ROLES.map((q) => (
                    <button
                      key={q.role}
                      type="button"
                      onClick={() => handleQuickSelect(q.email)}
                      className={`truncate rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                        loginEmail === q.email
                          ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create your account
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Your details are saved to the hospital database right away.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <Input required value={reg.firstName} onChange={(e) => updateReg("firstName", e.target.value)} placeholder="Priya" />
                  </Field>
                  <Field label="Last name">
                    <Input required value={reg.lastName} onChange={(e) => updateReg("lastName", e.target.value)} placeholder="Sharma" />
                  </Field>
                </div>

                <Field label="I am registering as">
                  <select className={selectClass} value={reg.role} onChange={(e) => updateReg("role", e.target.value)}>
                    {ALL_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input type="email" required value={reg.email} onChange={(e) => updateReg("email", e.target.value)} className="pl-9" placeholder="you@example.com" />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={reg.password}
                        onChange={(e) => updateReg("password", e.target.value)}
                        className="pr-9"
                        placeholder="Min. 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Phone">
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input value={reg.phone} onChange={(e) => updateReg("phone", e.target.value)} className="pl-9" placeholder="98765 43210" />
                    </div>
                  </Field>
                </div>

                {reg.role === "PATIENT" ? (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <User className="h-3.5 w-3.5" /> Patient details
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Gender">
                        <select className={selectClass} value={reg.gender} onChange={(e) => updateReg("gender", e.target.value)}>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <Field label="Blood group">
                        <select className={selectClass} value={reg.bloodGroup} onChange={(e) => updateReg("bloodGroup", e.target.value)}>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg}>{bg}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Date of birth">
                        <Input
                          type="date"
                          value={reg.dateOfBirth}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateReg("dateOfBirth", e.target.value)}
                          className="px-2"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City">
                        <Input value={reg.city} onChange={(e) => updateReg("city", e.target.value)} placeholder="Erode" />
                      </Field>
                      <Field label="Address">
                        <Input value={reg.address} onChange={(e) => updateReg("address", e.target.value)} placeholder="Street, area" />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40 sm:grid-cols-2">
                    <Field label="Department">
                      <select className={selectClass} value={reg.departmentId} onChange={(e) => updateReg("departmentId", e.target.value)}>
                        <option value="">Select department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {reg.role === "DOCTOR" && (
                      <Field label="Specialization">
                        <Input value={reg.specialization} onChange={(e) => updateReg("specialization", e.target.value)} placeholder="Cardiologist" />
                      </Field>
                    )}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="h-11 w-full bg-emerald-600 text-sm font-semibold hover:bg-emerald-700">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Create account
                    </>
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
