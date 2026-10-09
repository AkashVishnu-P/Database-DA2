"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Filter,
  Eye,
  FileText,
  Calendar,
  BedDouble,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PatientsDirectoryPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [query]);

  const loadPatients = async () => {
    try {
      const res = await fetch(`/api/patients?query=${encodeURIComponent(query)}&limit=100`);
      if (res.ok) {
        const d = await res.json();
        setPatients(d.patients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (p: any) => {
    setSelectedPatient(p);
    setShowDetailModal(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Patient Records...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patient Master Index & Medical Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive registry of all registered patients, permanent UHIDs, and clinical histories.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by UHID, name, contact..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 w-64 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Registered Patient Census</CardTitle>
            <CardDescription>Showing {patients.length} medical profiles</CardDescription>
          </div>
          <Badge variant="outline">{patients.length} Records</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">UHID</th>
                  <th className="pb-2">Patient Name</th>
                  <th className="pb-2">Gender & Age</th>
                  <th className="pb-2">Blood Group</th>
                  <th className="pb-2">Contact Phone</th>
                  <th className="pb-2">Current Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p) => {
                  const birthYear = new Date(p.dateOfBirth).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono font-bold text-sky-600 dark:text-sky-400">
                        {p.uhid}
                      </td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">
                        {p.gender}, {age} yrs
                      </td>
                      <td className="py-2.5 font-semibold text-rose-600">
                        {p.bloodGroup || "N/A"}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {p.phone}
                      </td>
                      <td className="py-2.5">
                        {p.isAdmitted ? (
                          <Badge variant="warning" className="text-[10px]">
                            Admitted ({p.occupiedBed?.bedNumber || "Ward"})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Outpatient
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(p)}
                          className="text-xs h-7 px-2.5"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View EHR
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Patient EHR Detail */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Electronic Health Record - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
        description={`Unique Hospital Identifier: ${selectedPatient?.uhid}`}
        maxWidth="lg"
      >
        {selectedPatient && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Demographics</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedPatient.gender} • Born {formatDate(selectedPatient.dateOfBirth)}
                </p>
                <p className="text-slate-500">Blood Group: {selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Contact Information</span>
                <p className="text-slate-700 dark:text-slate-300">{selectedPatient.phone}</p>
                <p className="text-slate-500">{selectedPatient.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Clinical History & Allergies</h4>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 space-y-1.5">
                <p>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Known Allergies: </span>
                  <span className="text-rose-600 font-medium">{selectedPatient.allergies || "None documented"}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Chronic Diagnoses: </span>
                  <span>{selectedPatient.chronicConditions || "None documented"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Insurance Policy</h4>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Provider: {selectedPatient.insuranceProvider || "Self-Pay"}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Policy: {selectedPatient.insurancePolicyNumber || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
