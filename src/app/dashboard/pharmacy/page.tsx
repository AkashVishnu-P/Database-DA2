"use client";

import React, { useEffect, useState } from "react";
import {
  Pill,
  Package,
  AlertTriangle,
  Search,
  Plus,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PharmacyInventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const d = await res.json();
        setMedicines(d.medicines || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading Pharmacy Inventory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pharmacy Formulary & Inventory Stock
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formulary drug catalog, active batches, shelf locations, and reorder levels.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search medicine or generic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 text-xs"
          />
        </div>
      </div>

      {/* Grid of Medicines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Hospital Formulary Catalog</CardTitle>
            <CardDescription>Showing {filtered.length} pharmaceutical formulations</CardDescription>
          </div>
          <Badge variant="outline">{filtered.length} Formulations</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Medicine Brand Name</th>
                  <th className="pb-2">Generic Active Ingredient</th>
                  <th className="pb-2">Dosage Form</th>
                  <th className="pb-2">Unit Price</th>
                  <th className="pb-2">Current Stock</th>
                  <th className="pb-2">Reorder Threshold</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-slate-500">{m.code}</td>
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                      {m.name} <span className="font-normal text-slate-400">({m.strength})</span>
                    </td>
                    <td className="py-2.5 text-slate-600 dark:text-slate-300">
                      {m.genericName}
                    </td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        {m.form}
                      </Badge>
                    </td>
                    <td className="py-2.5 font-medium">{formatCurrency(m.unitPrice)}</td>
                    <td className="py-2.5 font-bold">
                      <span className={m.isLowStock ? "text-rose-600" : "text-emerald-600"}>
                        {m.totalStock} units
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{m.reorderLevel} units</td>
                    <td className="py-2.5">
                      <Badge
                        variant={m.isLowStock ? "destructive" : "success"}
                        className="text-[10px]"
                      >
                        {m.isLowStock ? "Low Stock" : "Optimal"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
