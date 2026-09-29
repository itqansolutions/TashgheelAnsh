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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">فواتير المبيعات وحماية الأرباح</h1>
            <p className="text-xs text-slate-500 mt-1">
              إصدار فواتير البيع بتخصيص اللوتات، الرقابة التلقائية على البيع بأقل من التكلفة، وإثبات الأرباح المحققة.
            </p>
          </div>
          <Link
            href="/sales/new"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء فاتورة بيع جديدة</span>
          </Link>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
