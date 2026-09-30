import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PurchasesRepository } from "@/server/repositories/purchasesRepository";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  Building2,
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ supplierId?: string; status?: string; q?: string }>;
}) {
  const { supplierId, status, q } = await searchParams;
  const purchases = await PurchasesRepository.getPurchases(supplierId, status, q);
  const suppliers = await PartnersRepository.getPartners("SUPPLIER");

  const statusBadges: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "مسودة", color: "bg-slate-100 text-slate-700 border-slate-200" },
    OPEN: { label: "مفتوحة (مستحقة)", color: "bg-blue-50 text-blue-700 border-blue-200" },
    PARTIALLY_PAID: { label: "مسددة جزئياً", color: "bg-amber-50 text-amber-700 border-amber-200" },
    PAID: { label: "مسددة بالكامل", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "ملغاة", color: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">فواتير التوريد والمشتريات</h1>
            <p className="text-xs text-slate-500 mt-1">
              إثبات فواتير الشراء، إنشاء لوتات الباتش تلقائياً بتكلفة الوحدة، وقيد استحقاق المورد بدفتر الأستاذ.
            </p>
          </div>
          <Link
            href="/purchases/new"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>فاتورة شراء جديدة</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form className="relative w-full md:w-80">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث برقم الفاتورة أو اسم المورد..."
              className="w-full pl-3 pr-9 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[44px]"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Link
              href="/purchases"
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] flex items-center transition ${
                !status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل ({purchases.length})
            </Link>
            <Link
              href="/purchases?status=OPEN"
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] flex items-center transition ${
                status === "OPEN" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مفتوحة / مستحقة
            </Link>
            <Link
              href="/purchases?status=PAID"
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] flex items-center transition ${
                status === "PAID" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مسددة بالكامل
            </Link>
          </div>
        </div>

        {/* Purchases List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {purchases.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد فواتير شراء مسجلة
              </div>
            ) : (
              purchases.map((pur) => {
                const badge = statusBadges[pur.status] || statusBadges.OPEN;
                return (
                  <div key={pur.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {pur.invoiceNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">{pur.supplierName}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {pur.warehouseName} • <span className="font-mono">{pur.invoiceDate}</span>
                        </p>
                      </div>
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">إجمالي الفاتورة</span>
                        <span className="font-bold text-slate-900 text-xs">{formatCurrency(pur.totalAmount)}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">المسدد</span>
                        <span className="font-bold text-emerald-600 text-xs">{formatCurrency(pur.paidAmount)}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-sans">المتبقي</span>
                        <span className={`font-bold text-xs ${pur.remainingAmount > 0 ? "text-rose-600" : "text-slate-400"}`}>
                          {formatCurrency(pur.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/purchases/${pur.id}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[44px]"
                    >
                      <span>عرض الفاتورة وتفاصيل اللوتات</span>
                      <ChevronLeft className="h-4 w-4" />
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
                  <th className="py-3 px-4">رقم الفاتورة</th>
                  <th className="py-3 px-4">تاريخ التوريد</th>
                  <th className="py-3 px-4">المورد المعتمد</th>
                  <th className="py-3 px-4">المستودع المستلم</th>
                  <th className="py-3 px-4">إجمالي الفاتورة</th>
                  <th className="py-3 px-4">المسدد</th>
                  <th className="py-3 px-4">المتبقي للدفع</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">التفاصيل والسداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      لا توجد فواتير شراء مسجلة
                    </td>
                  </tr>
                ) : (
                  purchases.map((pur) => {
                    const badge = statusBadges[pur.status] || statusBadges.OPEN;
                    return (
                      <tr key={pur.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                          {pur.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {pur.invoiceDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {pur.supplierName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {pur.warehouseName}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                          {formatCurrency(pur.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-bold font-mono">
                          {formatCurrency(pur.paidAmount)}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono">
                          <span className={pur.remainingAmount > 0 ? "text-rose-600" : "text-slate-400"}>
                            {formatCurrency(pur.remainingAmount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-left">
                          <Link
                            href={`/purchases/${pur.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition inline-flex items-center gap-1"
                          >
                            <span>عرض</span>
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
