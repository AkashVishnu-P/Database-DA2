"use client";

import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function LabDashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [findings, setFindings] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isAbnormal, setIsAbnormal] = useState(false);

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      const res = await fetch("/api/lab");
      if (res.ok) {
        const d = await res.json();
        setRequests(d.requests || []);
        setTests(d.tests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnterResult = (req: any) => {
    setSelectedRequest(req);
    setFindings(req.normalRange || "All parameters tested within reference ranges.");
    setRemarks("Specimen tested under automated laboratory control.");
    setIsAbnormal(false);
    setShowResultModal(true);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const res = await fetch("/api/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_REPORT",
          labRequestId: selectedRequest.id,
          results: { findings, referenceRange: selectedRequest.normalRange },
          remarks,
          isAbnormal,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Lab Report verified and completed for ${selectedRequest.patientName}! Ordering doctor notified.`);
        setShowResultModal(false);
        loadLabData();
      } else {
        toast.error(data.error || "Failed to complete lab report");
      }
    } catch (err) {
      toast.error("Error submitting lab results");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Laboratory Console...</div>;
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const completedRequests = requests.filter((r) => r.status === "COMPLETED");

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Clinical Diagnostics & Pathology Workstation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Process diagnostic specimens, enter clinical parameters, and verify laboratory sign-offs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Specimen Testing Pipeline</CardTitle>
              <CardDescription>Laboratory test orders awaiting analysis and report entry</CardDescription>
            </div>
            <Badge variant="warning">{pendingRequests.length} Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No pending specimens in queue.
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                          {req.requestNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {req.testName}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {req.testCategory}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Patient: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.patientName}</span> ({req.patientUhid}) • Ordered by {req.doctorName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Normal Range: {req.normalRange || "Standard"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleOpenEnterResult(req)}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      Enter Results
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verified Lab Reports</CardTitle>
            <CardDescription>Recently completed diagnostic findings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedRequests.slice(0, 8).map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-800 space-y-1"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {req.testName}
                  </span>
                  <Badge variant={req.report?.isAbnormal ? "destructive" : "success"} className="text-[10px]">
                    {req.report?.isAbnormal ? "Abnormal" : "Normal"}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  {req.patientName} ({req.patientUhid})
                </p>
                <p className="text-[10px] text-slate-400">
                  Verified: {formatDate(req.completedAt)} by {req.report?.technicianName || "Lab Tech"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={`Enter Diagnostic Findings - ${selectedRequest?.testName}`}
        description={`Patient: ${selectedRequest?.patientName} (${selectedRequest?.patientUhid})`}
        maxWidth="md"
      >
        <form onSubmit={handleSubmitResult} className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 block mb-1">Clinical Normal Range:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedRequest?.normalRange || "Reference values under validation"}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Diagnostic Result / Values
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Technician Remarks
            </label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Specimen verified on automated hematology analyzer"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="abnormalCheck"
              checked={isAbnormal}
              onChange={(e) => setIsAbnormal(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="abnormalCheck" className="text-xs text-rose-600 font-semibold cursor-pointer">
              Flag as Clinically Abnormal (Alerts Doctor Immediately)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowResultModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
              Approve & Complete Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
