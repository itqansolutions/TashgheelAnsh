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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة العملاء والائتمان التجاري</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة مديونيات العملاء، الحدود الائتمانية، كشوف الحسابات التفصيلية، وفواتير المبيعات.
            </p>
          </div>
          <Link
            href="/suppliers/new?role=customer"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>تسجيل عميل جديد</span>
          </Link>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
