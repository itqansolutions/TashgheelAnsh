import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  Factory,
  Plus,
  Phone,
  FileText,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

export default async function FactoriesPage() {
  const factories = await PartnersRepository.getPartners("FACTORY");

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">المصانع وشركاء التشغيل لدى الغير</h1>
            <p className="text-xs text-slate-500 mt-1">
              إدارة المصانع الخارجية، متابعة تشغيلات الخامات، أتعاب التصنيع، والمطابقات المالية بدفتر الأستاذ.
            </p>
          </div>
          <Link
            href="/suppliers/new?role=factory"
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل مصنع / ورشة جديدة</span>
          </Link>
        </div>

        {/* Total stats pill on mobile */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>إجمالي المصانع والورش: <strong className="text-slate-800 font-mono">{factories.length}</strong></span>
          <span>إجمالي أتعاب التشغيل المستحقة: <strong className="text-rose-600 font-mono">{formatCurrency(factories.reduce((sum, f) => sum + f.currentBalance, 0))}</strong></span>
        </div>

        {/* Factories List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {factories.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد مصانع أو ورش مسجلة
              </div>
            ) : (
              factories.map((fac) => (
                <div key={fac.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {fac.code}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>نشط</span>
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{fac.nameAr}</p>
                      {fac.name && fac.name !== fac.nameAr && (
                        <p className="text-[11px] text-slate-400">{fac.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Balance */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">الهاتف:</span>
                      {fac.phone || fac.mobile ? (
                        <a
                          href={`tel:${fac.phone || fac.mobile}`}
                          className="font-mono text-slate-800 flex items-center gap-1 text-xs hover:text-indigo-600"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{fac.phone || fac.mobile}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">غير محدد</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">رصيد الأتعاب المستحقة (دائن):</span>
                      <span className={`font-bold font-mono text-xs ${fac.currentBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {formatCurrency(fac.currentBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/suppliers/${fac.id}/statement`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>كشف حساب</span>
                    </Link>
                    <Link
                      href={`/manufacturing/new?factoryId=${fac.id}`}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center justify-center gap-1 min-h-[44px]"
                    >
                      <Factory className="h-3.5 w-3.5" />
                      <span>أمر تشغيل</span>
                    </Link>
                    <Link
                      href={`/suppliers/${fac.id}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center min-h-[44px] min-w-[44px]"
                      title="ملف المصنع"
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
                  <th className="py-3 px-4">كود المصنع</th>
                  <th className="py-3 px-4">اسم المصنع / ورشة التشغيل</th>
                  <th className="py-3 px-4">الهاتف والتواصل</th>
                  <th className="py-3 px-4">رصيد أتعاب التشغيل المستحقة (دائن)</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">إجراءات المصنع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {factories.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {fac.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{fac.nameAr}</p>
                      <p className="text-[11px] text-slate-400">{fac.name}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{fac.phone || fac.mobile || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      <span className={fac.currentBalance > 0 ? "text-rose-600" : "text-emerald-600"}>
                        {formatCurrency(fac.currentBalance)}
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
                          href={`/suppliers/${fac.id}/statement`}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="كشف حساب المصنع"
                        >
                          <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/manufacturing/new?factoryId=${fac.id}`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition flex items-center gap-1"
                        >
                          <Factory className="h-3.5 w-3.5" />
                          <span>أمر تشغيل</span>
                        </Link>
                        <Link
                          href={`/suppliers/${fac.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1"
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
