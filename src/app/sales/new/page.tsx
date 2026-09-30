"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency } from "@/lib/utils";
import {
  BadgeDollarSign,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Package,
  Layers,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function NewSalesInvoicePage() {
  const router = useRouter();

  const customers = [
    { id: "part-cust-1", name: "شركة الأهرام للتجارة والمقاولات (BP-CUST-01)" },
  ];

  const warehouses = [
    { id: "wh-1", name: "المستودع الرئيسي - 6 أكتوبر (WH-MAIN)" },
  ];

  const availableBatches = [
    {
      id: "bat-001",
      batchNumber: "BAT-2026-000001",
      productName: "لفائف صاج معالج 2 مم",
      productId: "prod-1",
      remainingQty: 300,
      unitCost: 80.0,
      defaultPrice: 120.0,
    },
    {
      id: "bat-002",
      batchNumber: "BAT-2026-000002",
      productName: "هيكل كابينة نصف مجمع",
      productId: "prod-2",
      remainingQty: 120,
      unitCost: 185.0,
      defaultPrice: 250.0,
    },
    {
      id: "bat-003",
      batchNumber: "BAT-2026-000003",
      productName: "لوحة توزيع كهربائية قياسية",
      productId: "prod-3",
      remainingQty: 35,
      unitCost: 520.0,
      defaultPrice: 850.0,
    },
  ];

  const [customerId, setCustomerId] = useState(customers[0].id);
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("CREDIT");
  const [notes, setNotes] = useState("");
  const [allowBelowCostApproval, setAllowBelowCostApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sales line with batch allocation
  const [selectedBatchId, setSelectedBatchId] = useState(availableBatches[0].id);
  const [quantity, setQuantity] = useState(50);
  const [sellingPrice, setSellingPrice] = useState(120.0);
  const [discount, setDiscount] = useState(0);

  const selectedBatch = availableBatches.find((b) => b.id === selectedBatchId) || availableBatches[0];
  const unitCost = selectedBatch.unitCost;
  const lineSubtotal = quantity * sellingPrice - discount;
  const netUnitPrice = quantity > 0 ? lineSubtotal / quantity : 0;
  const totalCost = quantity * unitCost;
  const grossProfit = lineSubtotal - totalCost;
  const isBelowCost = netUnitPrice < unitCost;
  const isAtCost = Math.abs(netUnitPrice - unitCost) < 0.01;
  const expectedLoss = isBelowCost ? totalCost - lineSubtotal : 0;
  const profitMarginPct = lineSubtotal > 0 ? ((grossProfit / lineSubtotal) * 100).toFixed(1) : "0";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isBelowCost && !allowBelowCostApproval) {
      alert("تنبيه: سعر البيع أقل من التكلفة! يتطلب اعتماد مدير المبيعات لإتمام الحفظ.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/sales");
    }, 700);
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20 sm:pb-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/sales" className="hover:text-indigo-600 transition">
                فواتير المبيعات
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">فاتورة بيع جديدة</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">إنشاء فاتورة بيع مع تخصيص الباتش المخزني</h1>
          </div>
          <Link
            href="/sales"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm min-h-[44px] transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        {/* Invoice Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
              <span>بيانات العميل وشروط البيع</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العميل المعتمد *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مستودع صرف البضاعة *
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  طريقة الدفع والتسوية *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                >
                  <option value="CREDIT">آجل على الحساب (Credit)</option>
                  <option value="CASH">نقدي فوري (Cash)</option>
                  <option value="BANK_TRANSFER">تحويل بنكي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Batch Allocation & Line Item */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-600" />
                <span>تخصيص لوتات الباتش (Batch Allocation Engine)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                اختر الباتش الفعلي المراد سحبه لمعرفة تكلفة الوحدة وهامش الربح بدقة قبل إصدار الفاتورة.
              </p>
            </div>

            {/* Batch Selector Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر الباتش المخزني للصرف *
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    const b = availableBatches.find((item) => item.id === e.target.value);
                    if (b) setSellingPrice(b.defaultPrice);
                  }}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold min-h-[44px]"
                >
                  {availableBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.productName} ({b.batchNumber}) - متاح: {b.remainingQty} | التكلفة: {b.unitCost} EGP
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الكمية المباعة (المطلوبة) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBatch.remainingQty}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سعر بيع الوحدة (EGP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 min-h-[44px]"
                />
              </div>
            </div>

            {/* Below-Cost Warnings & Profit Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-mono text-xs">
              <div className="p-2 sm:p-0">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] font-sans">تكلفة اللوت (COGS)</span>
                <span className="text-sm sm:text-base font-bold text-slate-200 mt-0.5 block truncate">
                  {formatCurrency(unitCost)}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-sans">إجمالي: {formatCurrency(totalCost)}</span>
              </div>

              <div className="p-2 sm:p-0">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] font-sans">صافي سعر البيع</span>
                <span className="text-sm sm:text-base font-bold text-white mt-0.5 block truncate">
                  {formatCurrency(netUnitPrice)}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-sans">إجمالي: {formatCurrency(lineSubtotal)}</span>
              </div>

              <div className="p-2 sm:p-0">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] font-sans">مجمل الربح</span>
                <span className={`text-sm sm:text-base font-bold mt-0.5 block truncate ${grossProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(grossProfit)}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-sans">
                  هامش: {profitMarginPct}%
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 flex flex-col justify-center pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {isBelowCost ? (
                  <span className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold text-center">
                    ⚠ بيع بأقل من التكلفة!
                  </span>
                ) : isAtCost ? (
                  <span className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold text-center">
                    تنبيه: بيع بسعر التكلفة (0%)
                  </span>
                ) : (
                  <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold text-center">
                    ✔ صفقة رابحة معتمدة
                  </span>
                )}
              </div>
            </div>

            {/* Below-Cost Critical Warning Banner */}
            {isBelowCost && (
              <div className="p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>تحذير رقابي حرج: سعر البيع أقل من التكلفة الفعلية للوت المسحوب!</span>
                </div>
                <p className="text-xs">
                  تكلفة الوحدة من الباتش هي {formatCurrency(unitCost)} بينما صافي سعر البيع هو {formatCurrency(netUnitPrice)}.
                  الخسارة المتوقعة المحققة من هذا البند هي:{" "}
                  <span className="font-bold font-mono text-rose-900">{formatCurrency(expectedLoss)}</span>.
                </p>
                <div className="flex items-start gap-2.5 pt-2 border-t border-rose-200">
                  <input
                    type="checkbox"
                    id="belowCostApproval"
                    checked={allowBelowCostApproval}
                    onChange={(e) => setAllowBelowCostApproval(e.target.checked)}
                    className="h-5 w-5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 mt-0.5 shrink-0"
                  />
                  <label htmlFor="belowCostApproval" className="text-xs font-bold text-rose-900 cursor-pointer select-none">
                    أؤكد امتلاكي لصلاحية الاعتماد الاستثنائي (sales.sell_below_cost) وتسجيل الإذن بسجل التدقيق
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer (Sticky on Mobile, Standard on Desktop) */}
          <div className="fixed bottom-14 sm:static inset-x-0 bg-white/95 sm:bg-white backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 sm:rounded-2xl sm:border sm:shadow-sm z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="hidden sm:block text-xs text-slate-500">
              سيتم خفض رصيد الباتش المختار وقيد المديونية بحساب العميل بدفتر الأستاذ.
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Mobile Total Display in sticky bar */}
              <div className="sm:hidden text-right">
                <span className="text-[10px] text-slate-400 block">إجمالي البيع:</span>
                <span className="font-mono font-black text-sm text-emerald-700">{formatCurrency(lineSubtotal)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sales"
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition min-h-[44px] flex items-center"
                >
                  إلغاء
                </Link>
                <button
                  type="submit"
                  disabled={loading || (isBelowCost && !allowBelowCostApproval)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 min-h-[44px]"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? "جاري الاعتماد..." : "إصدار فاتورة البيع"}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
