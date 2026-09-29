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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">فواتير التوريد والمشتريات</h1>
            <p className="text-xs text-slate-500 mt-1">
              إثبات فواتير الشراء، إنشاء لوتات الباتش تلقائياً بتكلفة الوحدة، وقيد استحقاق المورد بدفتر الأستاذ.
            </p>
          </div>
          <Link
            href="/purchases/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء فاتورة شراء جديدة</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <form className="relative w-full md:w-80">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث برقم الفاتورة أو اسم المورد..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Link
              href="/purchases"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                !status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل ({purchases.length})
            </Link>
            <Link
              href="/purchases?status=OPEN"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                status === "OPEN" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مفتوحة / مستحقة
            </Link>
            <Link
              href="/purchases?status=PAID"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                status === "PAID" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مسددة بالكامل
            </Link>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                          >
                            <span>عرض وسداد</span>
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
