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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/inventory" className="hover:text-indigo-600 transition">
                أرصدة المخزون
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">دفتر حركات المخزن</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">سجل ودفتر حركات المخزون (Inventory Ledger)</h1>
            <p className="text-xs text-slate-500 mt-1">
              جميع الحركات الواردة والمنصرفة مسجلة بدقة مع رقم المستند والتكلفة والرصيد التراكمي.
            </p>
          </div>
          <Link
            href="/inventory"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لملخص المخزون</span>
          </Link>
        </div>

        {/* Movements Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
