"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CashierDashboardPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState("CASH");
  const [transactionRef, setTransactionRef] = useState("");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printedBill, setPrintedBill] = useState<any>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const res = await fetch("/api/billing?limit=50");
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
    setPayMethod("CASH");
    setTransactionRef("");
    setShowPayModal(true);
  };

  const handleOpenPrint = (bill: any) => {
    setPrintedBill(bill);
    setShowPrintModal(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
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
          transactionRef,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Payment settled! Receipt ${data.payment.receiptNumber} issued.`);
        setShowPayModal(false);
        loadBills();
        handleOpenPrint({
          ...selectedBill,
          paidAmount: Number(selectedBill.paidAmount) + payAmount,
          balanceAmount: Math.max(0, Number(selectedBill.balanceAmount) - payAmount),
          payments: [
            ...(selectedBill.payments || []),
            { receiptNumber: data.payment.receiptNumber, amount: payAmount, method: payMethod, date: new Date() },
          ],
        });
      } else {
        toast.error(data.error || "Payment collection failed");
      }
    } catch (err) {
      toast.error("Error processing payment");
    }
  };

  const filteredBills = bills.filter(
    (b) =>
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName.toLowerCase().includes(search.toLowerCase()) ||
      b.patientUhid.toLowerCase().includes(search.toLowerCase())
  );

  const pendingBills = filteredBills.filter((b) => b.balanceAmount > 0);
  const paidBills = filteredBills.filter((b) => b.balanceAmount <= 0);

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Cashier POS Station...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cashier & Point-of-Sale (POS) Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Settle clinical billing balances, collect payments across multiple gateways, and issue tax receipts.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search invoice or UHID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 text-xs"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Outstanding Invoices Ledger</CardTitle>
            <CardDescription>Accounts waiting for cashier collection</CardDescription>
          </div>
          <Badge variant="warning">{pendingBills.length} Invoices Pending</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Stream</th>
                  <th className="pb-2">Net Total</th>
                  <th className="pb-2">Paid</th>
                  <th className="pb-2">Balance Due</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingBills.slice(0, 15).map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                      {bill.billNumber}
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bill.patientName}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {bill.patientUhid}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        {bill.billType}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-medium">{formatCurrency(bill.netAmount)}</td>
                    <td className="py-2.5 text-emerald-600">{formatCurrency(bill.paidAmount)}</td>
                    <td className="py-2.5 font-bold text-rose-600">
                      {formatCurrency(bill.balanceAmount)}
                    </td>
                    <td className="py-2.5 text-right space-x-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleOpenPay(bill)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5"
                      >
                        <CreditCard className="mr-1 h-3 w-3" />
                        Collect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPrint(bill)}
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
        title={`Collect Payment - ${selectedBill?.billNumber}`}
        description={`Patient: ${selectedBill?.patientName} (${selectedBill?.patientUhid})`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Net Invoice Amount:</span>
              <span className="font-semibold">{formatCurrency(selectedBill?.netAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Previously Settled:</span>
              <span className="text-emerald-600 font-semibold">{formatCurrency(selectedBill?.paidAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-200 pt-1 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">Total Outstanding Balance:</span>
              <span className="font-bold text-rose-600">{formatCurrency(selectedBill?.balanceAmount || 0)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              <option value="CASH">Cash Currency</option>
              <option value="CREDIT_CARD">Credit Card POS</option>
              <option value="DEBIT_CARD">Debit Card POS</option>
              <option value="UPI">UPI / Digital QR</option>
              <option value="INSURANCE">Insurance TPA Settlement</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Amount to Collect ($)
            </label>
            <Input
              type="number"
              step="0.01"
              max={selectedBill?.balanceAmount}
              value={payAmount}
              onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {payMethod !== "CASH" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transaction / Card Approval Ref
              </label>
              <Input
                placeholder="e.g. TXN-892348"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Confirm & Print Receipt
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Official Hospital Tax Invoice & Receipt"
        maxWidth="2xl"
      >
        {printedBill && (
          <div className="space-y-4 text-xs font-sans p-4 border border-slate-200 rounded-xl bg-white dark:bg-slate-900 dark:border-slate-800">

            <div className="flex justify-between items-start border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-sky-700 dark:text-sky-400">
                  CAREPULSE HEALTHCARE SYSTEMS
                </h3>
                <p className="text-[11px] text-slate-500">
                  100 Medical Center Parkway • Emergency: (555) 911-0000
                </p>
                <p className="text-[11px] text-slate-400">Tax ID: US-HC-98234190</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                  {printedBill.billNumber}
                </span>
                <span className="text-[10px] text-slate-400">
                  Issued: {formatDate(printedBill.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Patient Information</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{printedBill.patientName}</p>
                <p className="text-slate-500 font-mono">UHID: {printedBill.patientUhid}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Billing Status</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{printedBill.paymentStatus}</p>
                <p className="text-slate-500">Service Stream: {printedBill.billType}</p>
              </div>
            </div>

            <div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-400 dark:border-slate-800">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(printedBill.items || []).map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 text-slate-700 dark:text-slate-300">{item.description}</td>
                      <td className="py-1.5 text-center text-slate-500">{item.quantity}</td>
                      <td className="py-1.5 text-right text-slate-500">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-1.5 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800 flex justify-end">
              <div className="w-48 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Net:</span>
                  <span className="font-bold">{formatCurrency(printedBill.netAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid:</span>
                  <span className="font-bold">{formatCurrency(printedBill.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 border-t border-slate-200 pt-1 font-bold">
                  <span>Balance:</span>
                  <span>{formatCurrency(printedBill.balanceAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={() => {
                  window.print();
                }}
                className="bg-sky-600 hover:bg-sky-700"
                size="sm"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print Tax Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
