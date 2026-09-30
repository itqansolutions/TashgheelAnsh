import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { formatCurrency } from "@/lib/utils";
import { ArrowRightLeft, Search, Filter, ArrowRight, ChevronLeft } from "lucide-react";

export default async function InventoryMovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; batch?: string }>;
}) {
  const { type, batch } = await searchParams;
  const movements = await InventoryRepository.getMovements(undefined, batch, type);

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/inventory" className="hover:text-indigo-600 transition">
                أرصدة المخزون
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">دفتر حركات المخزن</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">سجل ودفتر حركات المخزون (Inventory Ledger)</h1>
            <p className="text-xs text-slate-500 mt-1">
              جميع الحركات الواردة والمنصرفة مسجلة بدقة مع رقم المستند والتكلفة والرصيد التراكمي.
            </p>
          </div>
          <Link
            href="/inventory"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm min-h-[44px] transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لملخص المخزون</span>
          </Link>
        </div>

        {/* Movements: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {movements.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد حركات مخزنية مسجلة
              </div>
            ) : (
              movements.map((m) => (
                <div key={m.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {m.transactionNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{m.date}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{m.productName}</h4>
                      <Link
                        href={`/inventory/batches/${m.batchNumber}`}
                        className="text-[11px] font-mono font-bold text-purple-700 hover:underline inline-block mt-0.5"
                      >
                        لوت: {m.batchNumber}
                      </Link>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 shrink-0">
                      {m.typeLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl text-center font-mono text-xs border border-slate-100">
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {m.inQuantity > 0 ? "وارد (+)" : "منصرف (-)"}
                      </span>
                      <span className={`font-bold ${m.inQuantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {m.inQuantity > 0 ? `+${m.inQuantity}` : `-${m.outQuantity}`}
                      </span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">الرصيد بعد</span>
                      <span className="font-bold text-slate-900">{m.balanceAfter}</span>
                    </div>
                    <div className="bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">تكلفة الوحدة</span>
                      <span className="font-bold text-slate-900">{formatCurrency(m.unitCost)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>المستند: <strong className="font-mono text-purple-700">{m.referenceDocument}</strong></span>
                    <Link
                      href={`/inventory/batches/${m.batchNumber}`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                    >
                      <span>تتبع اللوت</span>
                      <ChevronLeft className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم الحركة</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">الصنف المسجل</th>
                  <th className="py-3 px-4">رقم اللوت (الباتش)</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">رقم المستند المرجعي</th>
                  <th className="py-3 px-4 text-emerald-600">وارد (+)</th>
                  <th className="py-3 px-4 text-rose-600">منصرف (-)</th>
                  <th className="py-3 px-4">الرصيد بعد</th>
                  <th className="py-3 px-4">تكلفة الوحدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.transactionNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{m.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.productName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      <Link href={`/inventory/batches/${m.batchNumber}`} className="hover:underline">
                        {m.batchNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {m.typeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-700 font-bold">{m.referenceDocument}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 font-mono">
                      {m.inQuantity > 0 ? `+${m.inQuantity}` : "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600 font-mono">
                      {m.outQuantity > 0 ? `-${m.outQuantity}` : "—"}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{m.balanceAfter}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{formatCurrency(m.unitCost)}</td>
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
