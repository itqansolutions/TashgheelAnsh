import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  ShoppingCart,
  Receipt,
  FileText,
  Phone,
  CheckCircle2,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const suppliers = await PartnersRepository.getPartners("SUPPLIER", q);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة الموردين وحسابات التوريد</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة حسابات الموردين، أرصدة الالتزامات الدائنة، كشوف الحسابات التفصيلية، وأوامر الشراء.
            </p>
          </div>
          <Link
            href="/suppliers/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مورد جديد</span>
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <form className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث بكود المورد، الاسم، أو رقم الهاتف..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </form>

          <span className="text-xs text-slate-500 font-medium">
            إجمالي {suppliers.length} موردين معتمدين
          </span>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">كود المورد</th>
                  <th className="py-3 px-4">اسم المورد / الشركة</th>
                  <th className="py-3 px-4">الهاتف والتواصل</th>
                  <th className="py-3 px-4">رصيد المورد المستحق (دائن)</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">إجراءات الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      لا يوجد موردين مطابقين لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {sup.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/suppliers/${sup.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {sup.nameAr}
                        </Link>
                        <p className="text-[11px] text-slate-400">{sup.name}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{sup.phone || sup.mobile || "غير محدد"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={sup.currentBalance > 0 ? "text-rose-600" : "text-emerald-600"}>
                            {formatCurrency(sup.currentBalance)}
                          </span>
                          {sup.currentBalance > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal">(مستحق له)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>نشط</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/suppliers/${sup.id}/statement`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="كشف حساب تفصيلي"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/purchases/new?supplierId=${sup.id}`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="فاتورة شراء جديدة"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/suppliers/${sup.id}`}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
                          >
                            <span>تفاصيل</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
