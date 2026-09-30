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
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">مخزون الباتشات والتقييم الفعلي</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة أرصدة التشغيلات واللوتات بكل مستودع بدقة تكلفة الشراء أو التصنيع المستقلة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/inventory/movements"
              className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm min-h-[44px] transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>دفتر حركات المخزون</span>
            </Link>
          </div>
        </div>

        {/* Valuation Dashboard Grid: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">إجمالي تقييم المخزون</span>
            <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(valuation.totalValue)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block truncate">
              {valuation.activeBatchesCount} لوتات باتش نشطة
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">خامات أولية (Raw)</span>
            <div className="text-base sm:text-2xl font-bold text-purple-700 font-mono">
              {formatCurrency(valuation.rawMaterialsValue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">مواد خام مخزنة بالمستودع</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">نصف مصنع (Semi)</span>
            <div className="text-base sm:text-2xl font-bold text-amber-700 font-mono">
              {formatCurrency(valuation.semiFinishedValue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">أجزاء وهياكل مشغلة جاهزة</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">منتج تام (Finished)</span>
            <div className="text-base sm:text-2xl font-bold text-emerald-700 font-mono">
              {formatCurrency(valuation.finishedGoodsValue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">جاهز للتسليم والبيع</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث برقم الباتش أو اسم الصنف..."
              className="w-full pl-3 pr-9 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[44px]"
            />
          </form>

          <span className="text-xs text-slate-500 font-medium">
            عرض {batches.length} تشغيلات مخزنية
          </span>
        </div>

        {/* Batches List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {batches.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد تشغيلات مخزنية مطابقة
              </div>
            ) : (
              batches.map((batch) => {
                const totalValue = batch.remainingQuantity * batch.unitCost;
                return (
                  <div key={batch.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            {batch.batchNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {batch.sourceType === "PURCHASE" ? "توريد" : "تصنيع"}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{batch.productName}</h3>
                        <p className="text-[11px] text-slate-500">
                          {batch.warehouseName} • <span className="font-mono">{batch.productSku}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">المتاح</span>
                        <span className="font-bold text-emerald-700 text-xs">{batch.remainingQuantity}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">تكلفة الوحدة</span>
                        <span className="font-bold text-slate-900 text-xs">{formatCurrency(batch.unitCost)}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">قيمة اللوت</span>
                        <span className="font-bold text-indigo-700 text-xs">{formatCurrency(totalValue)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/inventory/batches/${batch.batchNumber}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[44px]"
                    >
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      <span>شجرة وسلسلة تتبع اللوت</span>
                      <ChevronLeft className="h-4 w-4 mr-auto" />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
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
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      لا توجد باتشات مطابقة لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const totalVal = b.remainingQuantity * b.unitCost;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                          {b.batchNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{b.productName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{b.productSku}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{b.warehouseName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-semibold text-slate-800">{b.sourceDocumentNumber}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {b.sourceType === "PURCHASE" ? "فاتورة شراء" : "أمر تصنيع"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{b.initialQuantity}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                          {b.remainingQuantity}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(b.unitCost)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {formatCurrency(totalVal)}
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <Link
                            href={`/inventory/batches/${b.batchNumber}`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition inline-flex items-center gap-1"
                          >
                            <span>تتبع</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
