"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BillingLedgerPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("CASH");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printedBill, setPrintedBill] = useState<any>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const res = await fetch("/api/billing?limit=100");
      if (res.ok) {
        const d = await res.json();
        setBills(d.bills || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPay = (bill: any) => {
    setSelectedBill(bill);
    setPayAmount(bill.balanceAmount);
    setShowPayModal(true);
  };

  const handleOpenPrint = (bill: any) => {
    setPrintedBill(bill);
    setShowPrintModal(true);
  };

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      const res = await fetch("/api/billing/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBill.id,
          amount: payAmount,
          paymentMethod: payMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Payment of ${formatCurrency(payAmount)} received! Receipt ${data.payment.receiptNumber}`);
        setShowPayModal(false);
        loadBills();
      } else {
        toast.error(data.error || "Payment collection failed");
      }
    } catch (err) {
      toast.error("Error processing payment");
    }
  };

  const filtered = bills.filter((b) => {
    const matchesSearch =
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientUhid.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || b.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Billing Ledger...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hospital Billing & Accounts Receivable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive audit ledger of inpatient admissions, consultations, pharmacy, and diagnostic services.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search invoice or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 text-xs"
          />
          {["ALL", "PENDING", "PARTIALLY_PAID", "PAID"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Accounts Receivable Ledger</CardTitle>
            <CardDescription>Showing {filtered.length} billing statements</CardDescription>
          </div>
          <Badge variant="outline">{filtered.length} Bills</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Total Net</th>
                  <th className="pb-2">Settled</th>
                  <th className="pb-2">Balance</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                      {b.billNumber}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.patientName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {b.patientUhid}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        {b.billType}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-medium">{formatCurrency(b.netAmount)}</td>
                    <td className="py-2.5 text-emerald-600">{formatCurrency(b.paidAmount)}</td>
                    <td className="py-2.5 font-bold text-rose-600">
                      {formatCurrency(b.balanceAmount)}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={b.paymentStatus === "PAID" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {b.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right space-x-1.5">
                      {b.balanceAmount > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPay(b)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2"
                        >
                          Collect
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPrint(b)}
                        className="text-xs h-7 px-2"
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Settle Bill - ${selectedBill?.billNumber}`}
        description={`Patient: ${selectedBill?.patientName} (${selectedBill?.patientUhid})`}
        maxWidth="md"
      >
        <form onSubmit={handleCollect} className="space-y-3">
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(selectedBill?.balanceAmount || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Payment Gateway</label>
            <select
              className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="UPI">UPI / Digital QR</option>
              <option value="INSURANCE">Insurance TPA</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Amount to Settle</label>
            <Input
              type="number"
              step="0.01"
              max={selectedBill?.balanceAmount}
              value={payAmount}
              onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Settle
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Printable Statement & Receipt"
        maxWidth="xl"
      >
        {printedBill && (
          <div className="space-y-3 text-xs p-3 border border-slate-200 rounded-xl bg-white dark:bg-slate-900">
            <div className="flex justify-between border-b pb-2">
              <div>
                <h4 className="font-bold text-sm text-sky-600">CarePulse Health ERP</h4>
                <p className="text-[10px] text-slate-400">Statement for: {printedBill.patientName}</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold">{printedBill.billNumber}</span>
              </div>
            </div>
            <div className="py-2 space-y-1">
              <div className="flex justify-between">
                <span>Net Total:</span>
                <span className="font-bold">{formatCurrency(printedBill.netAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Settled:</span>
                <span>{formatCurrency(printedBill.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold border-t pt-1">
                <span>Balance:</span>
                <span>{formatCurrency(printedBill.balanceAmount)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => window.print()} className="bg-sky-600" size="sm">
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Statement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
