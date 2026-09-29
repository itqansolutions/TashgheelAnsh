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
  Building2,
  Layers,
} from "lucide-react";

export default async function FactoriesPage() {
  const factories = await PartnersRepository.getPartners("FACTORY");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">المصانع وشركاء التشغيل لدى الغير</h1>
            <p className="text-xs text-slate-500 mt-1">
              إدارة المصانع الخارجية، متابعة تشغيلات الخامات، أتعاب التصنيع، والمطابقات المالية بدفتر الأستاذ.
            </p>
          </div>
          <Link
            href="/suppliers/new?role=factory"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل مصنع / ورشة تشغيل جديدة</span>
          </Link>
        </div>

        {/* Factories Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                          <span>تفاصيل الحساب</span>
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
