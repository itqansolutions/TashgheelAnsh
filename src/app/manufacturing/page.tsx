import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ManufacturingRepository } from "@/server/repositories/manufacturingRepository";
import { formatCurrency } from "@/lib/utils";
import {
  Factory,
  Plus,
  Calendar,
  Layers,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function ManufacturingPage() {
  const orders = await ManufacturingRepository.getOrders();

  const statusBadges: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "مسودة", color: "bg-slate-100 text-slate-700 border-slate-200" },
    OPEN: { label: "مفتوح للتشغيل", color: "bg-blue-50 text-blue-700 border-blue-200" },
    IN_PROGRESS: { label: "قيد التنفيذ والمصروفات", color: "bg-amber-50 text-amber-700 border-amber-200" },
    READY_TO_CLOSE: { label: "جاهز للتوزيع والإقفال", color: "bg-purple-50 text-purple-700 border-purple-200" },
    CLOSED: { label: "مغلق ومحمل بالمخزن", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "ملغي", color: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">أوامر وتشغيلات التصنيع لدى الغير</h1>
            <p className="text-xs text-slate-500 mt-1">
              إدارة أوامر التشغيل، تتبع استهلاك الخامات، قيد أتعاب المصانع، وإقفال العمليات بتوزيع التكاليف.
            </p>
          </div>
          <Link
            href="/manufacturing/new"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>أمر تشغيل جديد</span>
          </Link>
        </div>

        {/* Manufacturing Orders: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد أوامر تشغيل مسجلة
              </div>
            ) : (
              orders.map((order) => {
                const badge = statusBadges[order.status] || statusBadges.OPEN;
                const opExpenses = order.totalExpenseCost + order.totalFactoryCost;
                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{order.factoryName}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.warehouseName} • <span className="font-mono">{order.startDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Cost Breakdown Grid */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">الخامات</span>
                        <span className="font-bold text-slate-900 text-xs">{formatCurrency(order.totalMaterialCost)}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">أتعاب ومصاريف</span>
                        <span className="font-bold text-amber-600 text-xs">{formatCurrency(opExpenses)}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">إجمالي التكلفة</span>
                        <span className="font-black text-indigo-700 text-xs">{formatCurrency(order.totalManufacturingCost)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/manufacturing/${order.id}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[44px]"
                    >
                      <Factory className="h-4 w-4" />
                      <span>إدارة مساحة التشغيل والتكاليف</span>
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
                  <th className="py-3 px-4">رقم أمر التشغيل</th>
                  <th className="py-3 px-4">المصنع المنفذ</th>
                  <th className="py-3 px-4">مستودع الصرف/الاستلام</th>
                  <th className="py-3 px-4">تاريخ البدء</th>
                  <th className="py-3 px-4">تكلفة المواد المستهلكة</th>
                  <th className="py-3 px-4">أتعاب ومصروفات التشغيل</th>
                  <th className="py-3 px-4">إجمالي تكلفة التشغيل</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">مساحة العمل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((order) => {
                  const badge = statusBadges[order.status] || statusBadges.OPEN;
                  const opExpenses = order.totalExpenseCost + order.totalFactoryCost;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {order.factoryName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {order.warehouseName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {order.startDate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {formatCurrency(order.totalMaterialCost)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {formatCurrency(opExpenses)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-indigo-700 font-mono text-sm">
                        {formatCurrency(order.totalManufacturingCost)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <Link
                          href={`/manufacturing/${order.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition"
                        >
                          <span>إدارة التشغيل</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
