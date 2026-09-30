import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SalesRepository } from "@/server/repositories/salesRepository";
import { formatCurrency } from "@/lib/utils";
import {
  BadgeDollarSign,
  Plus,
  Search,
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default async function SalesPage() {
  const sales = await SalesRepository.getSales();

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">فواتير المبيعات وحماية الأرباح</h1>
            <p className="text-xs text-slate-500 mt-1">
              إصدار فواتير البيع بتخصيص اللوتات، الرقابة التلقائية على البيع بأقل من التكلفة، وإثبات الأرباح المحققة.
            </p>
          </div>
          <Link
            href="/sales/new"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>فاتورة بيع جديدة</span>
          </Link>
        </div>

        {/* Total stats bar on mobile */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>إجمالي الفواتير: <strong className="text-slate-800 font-mono">{sales.length}</strong></span>
          <span>إجمالي أرباح المبيعات: <strong className="text-emerald-600 font-mono">{formatCurrency(sales.reduce((sum, s) => sum + s.grossProfit, 0))}</strong></span>
        </div>

        {/* Sales List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {sales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد فواتير مبيعات مسجلة
              </div>
            ) : (
              sales.map((sale) => (
                <div key={sale.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {sale.invoiceNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {sale.status === "PAID" ? "مسددة" : "مفتوحة"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{sale.customerName}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sale.warehouseName} • <span className="font-mono">{sale.invoiceDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-center">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">قيمة البيع</span>
                      <span className="font-bold text-slate-900 text-xs">{formatCurrency(sale.totalAmount)}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">التكلفة (COGS)</span>
                      <span className="font-bold text-slate-600 text-xs">{formatCurrency(sale.totalCost)}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">مجمل الربح</span>
                      <span className={`font-bold text-xs ${sale.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(sale.grossProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Margin pill and action button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-600">
                      هامش الربح: <strong className="text-emerald-700 font-mono">{sale.profitMarginPct}%</strong>
                    </span>
                    <Link
                      href={`/sales/${sale.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition min-h-[44px]"
                    >
                      <span>عرض وتحصيل</span>
                      <ChevronLeft className="h-4 w-4" />
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
                  <th className="py-3 px-4">رقم الفاتورة</th>
                  <th className="py-3 px-4">تاريخ البيع</th>
                  <th className="py-3 px-4">العميل المشتري</th>
                  <th className="py-3 px-4">مستودع الصرف</th>
                  <th className="py-3 px-4">إجمالي البيع</th>
                  <th className="py-3 px-4">تكلفة البضاعة المباعة (COGS)</th>
                  <th className="py-3 px-4">مجمل الربح المحقق</th>
                  <th className="py-3 px-4">هامش الربح</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">التفاصيل والتحصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {sale.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sale.warehouseName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {formatCurrency(sale.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      <span className={sale.grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {formatCurrency(sale.grossProfit)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                      {sale.profitMarginPct}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {sale.status === "PAID" ? "مسددة" : "مفتوحة / مستحقة"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <Link
                        href={`/sales/${sale.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                      >
                        <span>عرض وتحصيل</span>
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
