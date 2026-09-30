import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Plus,
  Phone,
  FileText,
  BadgeDollarSign,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default async function CustomersPage() {
  const customers = await PartnersRepository.getPartners("CUSTOMER");

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">إدارة العملاء والائتمان التجاري</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة مديونيات العملاء، الحدود الائتمانية، كشوف الحسابات التفصيلية، وفواتير المبيعات.
            </p>
          </div>
          <Link
            href="/suppliers/new?role=customer"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل عميل جديد</span>
          </Link>
        </div>

        {/* Total stats pill on mobile */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>إجمالي العملاء: <strong className="text-slate-800 font-mono">{customers.length}</strong></span>
          <span>إجمالي المديونيات: <strong className="text-indigo-600 font-mono">{formatCurrency(customers.reduce((sum, c) => sum + c.currentBalance, 0))}</strong></span>
        </div>

        {/* Customers List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {customers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا يوجد عملاء مسجلين
              </div>
            ) : (
              customers.map((cust) => (
                <div key={cust.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {cust.code}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>نشط</span>
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{cust.nameAr}</p>
                      {cust.name && cust.name !== cust.nameAr && (
                        <p className="text-[11px] text-slate-400">{cust.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone, Credit Limit, and Balance */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">المديونية (مدين):</span>
                      <span className={`font-bold font-mono text-xs ${cust.currentBalance > 0 ? "text-indigo-700" : "text-slate-500"}`}>
                        {formatCurrency(cust.currentBalance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">الحد الائتماني:</span>
                      <span className="font-mono text-slate-700 font-semibold text-xs">
                        {formatCurrency(cust.creditLimit)}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block mb-0.5">الهاتف:</span>
                      {cust.phone || cust.mobile ? (
                        <a
                          href={`tel:${cust.phone || cust.mobile}`}
                          className="font-mono text-slate-800 flex items-center gap-1 text-xs hover:text-indigo-600"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{cust.phone || cust.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">غير محدد</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/suppliers/${cust.id}/statement`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>كشف حساب</span>
                    </Link>
                    <Link
                      href={`/sales/new?customerId=${cust.id}`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <BadgeDollarSign className="h-3.5 w-3.5" />
                      <span>فاتورة بيع</span>
                    </Link>
                    <Link
                      href={`/suppliers/${cust.id}`}
                      className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center justify-center min-h-[44px] min-w-[44px]"
                      title="ملف العميل"
                    >
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
                  <th className="py-3 px-4">كود العميل</th>
                  <th className="py-3 px-4">اسم العميل / الشركة</th>
                  <th className="py-3 px-4">الهاتف والتواصل</th>
                  <th className="py-3 px-4">الحد الائتماني</th>
                  <th className="py-3 px-4">المديونية المستحقة (مدين)</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">إجراءات الحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {cust.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{cust.nameAr}</p>
                      <p className="text-[11px] text-slate-400">{cust.name}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{cust.phone || cust.mobile || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {formatCurrency(cust.creditLimit)}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      <span className={cust.currentBalance > 0 ? "text-indigo-700" : "text-slate-400"}>
                        {formatCurrency(cust.currentBalance)}
                      </span>
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
                          href={`/suppliers/${cust.id}/statement`}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="كشف حساب العميل"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/sales/new?customerId=${cust.id}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition flex items-center gap-1"
                        >
                          <BadgeDollarSign className="h-3.5 w-3.5" />
                          <span>فاتورة بيع</span>
                        </Link>
                        <Link
                          href={`/suppliers/${cust.id}`}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
                        >
                          <span>تفاصيل</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </div>
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
