import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  Package,
  Layers,
  ArrowRightLeft,
  ChevronLeft,
  Search,
  FolderTree,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; warehouseId?: string }>;
}) {
  const { q, warehouseId } = await searchParams;
  const valuation = await InventoryRepository.getInventoryValuation();
  const batches = await InventoryRepository.getBatches(undefined, warehouseId, q);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">مخزون الباتشات والتقييم الفعلي</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة أرصدة التشغيلات واللوتات بكل مستودع بدقة تكلفة الشراء أو التصنيع المستقلة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/inventory/movements"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>دفتر حركات المخزون</span>
            </Link>
          </div>
        </div>

        {/* Valuation Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي تقييم المخزون</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(valuation.totalValue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
              {valuation.activeBatchesCount} لوتات باتش نشطة
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">قيمة الخامات الأولية (Raw)</span>
            <div className="text-2xl font-bold text-purple-700 font-mono">
              {formatCurrency(valuation.rawMaterialsValue)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">مواد خام مخزنة بالمستودع</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">قيمة النصف مصنع (Semi)</span>
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {formatCurrency(valuation.semiFinishedValue)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">أجزاء وهياكل مشغلة جاهزة للتقفيل</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">قيمة المنتجات التامة (Finished)</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(valuation.finishedGoodsValue)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">منتجات تامة الصنع جاهزة للتسليم</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <form className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث برقم الباتش أو اسم الصنف..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </form>

          <span className="text-xs text-slate-500 font-medium">
            عرض {batches.length} تشغيلات مخزنية
          </span>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم الباتش (Batch Lot)</th>
                  <th className="py-3 px-4">الصنف المسجل</th>
                  <th className="py-3 px-4">مستودع التخزين</th>
                  <th className="py-3 px-4">المصدر ومستند التكوين</th>
                  <th className="py-3 px-4">الكمية الأصلية</th>
                  <th className="py-3 px-4">الرصيد المتاح</th>
                  <th className="py-3 px-4">تكلفة الوحدة الفعلية</th>
                  <th className="py-3 px-4">إجمالي قيمة اللوت</th>
                  <th className="py-3 px-4 text-left">شجرة التتبع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      <Link href={`/inventory/batches/${batch.id}`} className="hover:underline">
                        {batch.batchNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{batch.productName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{batch.productSku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{batch.warehouseName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                        {batch.sourceDocumentNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{batch.initialQuantity}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      {batch.remainingQuantity}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {formatCurrency(batch.unitCost)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {formatCurrency(batch.remainingQuantity * batch.unitCost)}
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <Link
                        href={`/inventory/batches/${batch.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition"
                      >
                        <span>تتبع</span>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
