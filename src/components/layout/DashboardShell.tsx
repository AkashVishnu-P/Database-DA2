"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  currentUser?: any;
}

export function DashboardShell({ children, currentUser }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950">
      <Navbar currentUser={currentUser} />
      <div className="flex flex-1">
        <Sidebar role={currentUser?.role} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
