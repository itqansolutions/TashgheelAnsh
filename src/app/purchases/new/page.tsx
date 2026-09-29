"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Package,
  Layers,
  AlertCircle,
} from "lucide-react";

interface LineItem {
  productId: string;
  quantity: number;
  unitCost: number;
  discountAmount: number;
}

export default function NewPurchasePage() {
  const router = useRouter();

  const suppliers = [
    { id: "part-sup-1", name: "شركة النصر لتوريد الخامات المعدنية (BP-SUP-01)" },
    { id: "part-fac-1", name: "مصنع الأمل للصناعات والتشكيل (BP-FAC-01)" },
  ];

  const warehouses = [
    { id: "wh-1", name: "المستودع الرئيسي - المنطقة الصناعية (WH-MAIN)" },
    { id: "wh-2", name: "مستودع تشغيلات المصانع (WH-FACTORY)" },
  ];

  const products = [
    { id: "prod-1", sku: "RM-STEEL-01", name: "لفائف صاج معالج 2 مم", defaultCost: 80.0 },
    { id: "prod-2", sku: "SF-FRAME-01", name: "هيكل كابينة نصف مجمع", defaultCost: 185.0 },
    { id: "prod-3", sku: "FP-CABINET-01", name: "لوحة توزيع كهربائية قياسية", defaultCost: 520.0 },
  ];

  const [supplierId, setSupplierId] = useState(suppliers[0].id);
  const [warehouseId, setWarehouseId] = useState(warehouses[0].id);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 يوماً من تاريخ التوريد");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [lines, setLines] = useState<LineItem[]>([
    {
      productId: products[0].id,
      quantity: 500,
      unitCost: products[0].defaultCost,
      discountAmount: 0,
    },
  ]);

  function addLine() {
    setLines([
      ...lines,
      {
        productId: products[0].id,
        quantity: 100,
        unitCost: products[0].defaultCost,
        discountAmount: 0,
      },
    ]);
  }

  function removeLine(index: number) {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }

  function updateLine(index: number, field: keyof LineItem, value: any) {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    if (field === "productId") {
      const selected = products.find((p) => p.id === value);
      if (selected) {
        newLines[index].unitCost = selected.defaultCost;
      }
    }
    setLines(newLines);
  }

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
  const totalDiscount = lines.reduce((sum, l) => sum + l.discountAmount, 0);
  const grandTotal = subtotal - totalDiscount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Call server action / API to invoke PurchaseService
    setTimeout(() => {
      setLoading(false);
      router.push("/purchases");
    }, 700);
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/purchases" className="hover:text-indigo-600 transition">
                فواتير التوريد
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">فاتورة شراء جديدة</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">إنشاء واعتماد فاتورة شراء وتوريد</h1>
          </div>
          <Link
            href="/purchases"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        {/* Invoice Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
              <span>بيانات التوريد والمورد</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المورد المعتمد *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المستودع المستلم للبضاعة *
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                  تاريخ فاتورة الشراء *
                </label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شروط السداد
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الاستحقاق المتفق عليه
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات الفاتورة
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="رقم إذن الاستلام أو بوليصة الشحن..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Lines Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span>بنود الأصناف والكميات الواردة</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  سيتم إنشاء رقم باتش جديد لكل بند فور الاعتماد لحفظ تكلفة الشراء بدقة
                </p>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة بند آخر</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">الصنف / الخامة</th>
                    <th className="py-2.5 px-3 w-32">الكمية</th>
                    <th className="py-2.5 px-3 w-36">تكلفة الوحدة (EGP)</th>
                    <th className="py-2.5 px-3 w-32">الخصم (EGP)</th>
                    <th className="py-2.5 px-3 text-left w-36">إجمالي البند</th>
                    <th className="py-2.5 px-3 w-12">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, index) => {
                    const lineTotal = line.quantity * line.unitCost - line.discountAmount;
                    return (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <select
                            value={line.productId}
                            onChange={(e) => updateLine(index, "productId", e.target.value)}
                            className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            value={line.quantity}
                            onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={line.unitCost}
                            onChange={(e) => updateLine(index, "unitCost", parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.discountAmount}
                            onChange={(e) => updateLine(index, "discountAmount", parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-xs rounded-xl border border-slate-300 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <div className="w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي الخصم:</span>
                  <span className="font-mono font-bold text-rose-600">-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>صافي الفاتورة (مستحق للمورد):</span>
                  <span className="font-mono text-indigo-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">
              عند الضغط على &quot;اعتماد وترحيل الشراء&quot; سيتم إنشاء لوتات الباتش وإثبات القيد بدفتر الأستاذ تلقائياً.
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/purchases"
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? "جاري الترحيل بالمعاملة..." : "اعتماد وترحيل الفاتورة"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
