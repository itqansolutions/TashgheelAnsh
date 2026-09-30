import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Printer,
  Calendar,
  Filter,
  ArrowRight,
  Download,
  Building2,
} from "lucide-react";
import { PrintButton } from "@/components/ui/PrintButton";

import { SettingsRepository } from "@/server/repositories/settingsRepository";
import { CompanyPrintHeader } from "@/components/printing/CompanyPrintHeader";
import { CompanyPrintFooter } from "@/components/printing/CompanyPrintFooter";

export default async function SupplierStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromDate?: string; toDate?: string }>;
}) {
  const { id } = await params;
  const { fromDate, toDate } = await searchParams;

  const [supplier, settings] = await Promise.all([
    PartnersRepository.getPartnerById(id),
    SettingsRepository.getSettings(),
  ]);

  if (!supplier) notFound();

  const entries = await PartnersRepository.getStatement(id, fromDate, toDate);

  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);
  const currentBalance = supplier.currentBalance;

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Navigation & Print Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href={`/suppliers/${supplier.id}`}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">كشف حساب مالي تفصيلي</h1>
              <p className="text-xs text-slate-500 font-mono">
                {supplier.code} • {supplier.nameAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PrintButton label="طباعة كشف الحساب (A4)" />
          </div>
        </div>

        {/* Filter Toolbar (Hidden during print) */}
        <form className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-700 shrink-0">من:</span>
            <input
              type="date"
              name="fromDate"
              defaultValue={fromDate || ""}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 shrink-0">إلى:</span>
            <input
              type="date"
              name="toDate"
              defaultValue={toDate || ""}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono min-h-[40px]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition min-h-[40px]"
          >
            تصفية الفترة
          </button>
        </form>

        {/* Printable Statement Sheet */}
        <div className="bg-white p-4 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Dynamic Company Statement Header */}
          <CompanyPrintHeader
            settings={settings}
            documentTitle="كشف حساب معتمد"
            documentNumber={`STMT-${supplier.code}`}
            documentDate={new Date().toISOString().split("T")[0]}
            badgeLabel="مطابق للدفاتر المحاسبية"
          />

          {/* Partner Info & Balance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-400 block text-[11px]">بيانات الحساب (Account Details)</span>
              <p className="text-sm font-bold text-slate-900">{supplier.nameAr}</p>
              <p className="font-mono text-slate-600">كود الحساب: {supplier.code}</p>
              <p className="font-mono text-slate-600">الرقم الضريبي: {supplier.taxNumber || "—"}</p>
              {supplier.address && <p className="text-slate-600">{supplier.address}</p>}
            </div>

            <div className="flex flex-col justify-center sm:items-end text-right sm:text-left space-y-1 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <span className="text-xs font-bold text-slate-500">الرصيد النهائي المسجل بدفتر الأستاذ</span>
              <span className={`text-xl sm:text-2xl font-black font-mono ${currentBalance > 0 ? (supplier.isCustomer ? "text-indigo-600" : "text-rose-600") : "text-emerald-600"}`}>
                {formatCurrency(currentBalance)}
              </span>
              <span className="text-[10px] text-slate-400">
                (مطابق لقيود دفتر الأستاذ العام)
              </span>
            </div>
          </div>

          {/* Statement Records: Mobile Card List on (< sm) */}
          <div className="sm:hidden space-y-3">
            {entries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد قيود مسجلة لهذا الحساب خلال الفترة المحددة
              </div>
            ) : (
              entries.map((e) => (
                <div key={e.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {e.referenceNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{e.entryDate}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{e.description}</p>
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 text-center text-[11px] font-mono">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">مدين</span>
                      <span className="font-bold text-emerald-600">
                        {e.debit > 0 ? formatCurrency(e.debit) : "—"}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">دائن</span>
                      <span className="font-bold text-rose-600">
                        {e.credit > 0 ? formatCurrency(e.credit) : "—"}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">الرصيد</span>
                      <span className="font-black text-slate-900">
                        {formatCurrency(e.balanceAfter)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Mobile Total Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
              <span className="font-bold text-[11px] text-slate-400 block">إجمالي حركات الفترة</span>
              <div className="grid grid-cols-3 gap-1 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">إجمالي مدين</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(totalDebits)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">إجمالي دائن</span>
                  <span className="font-bold text-rose-400">{formatCurrency(totalCredits)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الرصيد النهائي</span>
                  <span className="font-black text-white">{formatCurrency(currentBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View (>= sm) and Printable Table */}
          <div className="hidden sm:block overflow-x-auto print:block">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-r-lg">التاريخ</th>
                  <th className="py-3 px-3">رقم المستند</th>
                  <th className="py-3 px-3">البيان والشرح المحاسبي</th>
                  <th className="py-3 px-3 text-left">مدين (سدادات)</th>
                  <th className="py-3 px-3 text-left">دائن (فواتير توريد)</th>
                  <th className="py-3 px-3 text-left rounded-l-lg">الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      لا توجد قيود مسجلة لهذا الحساب خلال الفترة المحددة
                    </td>
                  </tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono text-slate-600">{e.entryDate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">{e.referenceNumber}</td>
                      <td className="py-3 px-3 text-slate-800">{e.description}</td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-emerald-600">
                        {e.debit > 0 ? formatCurrency(e.debit) : "—"}
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-rose-600">
                        {e.credit > 0 ? formatCurrency(e.credit) : "—"}
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-black text-slate-900">
                        {formatCurrency(e.balanceAfter)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-slate-900">
                    إجمالي حركات الفترة المقيدة
                  </td>
                  <td className="py-3 px-3 text-left text-emerald-700 font-mono">
                    {formatCurrency(totalDebits)}
                  </td>
                  <td className="py-3 px-3 text-left text-rose-700 font-mono">
                    {formatCurrency(totalCredits)}
                  </td>
                  <td className="py-3 px-3 text-left text-slate-900 font-mono font-black">
                    {formatCurrency(currentBalance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Dynamic Company Footer */}
          <CompanyPrintFooter
            settings={settings}
            signatures={[
              { title: "إعداد المحاسب المسؤول", subtitle: "التوقيع والتاريخ" },
              { title: "المراجعة والتدقيق المالي", subtitle: "المراجعة الداخلية" },
              { title: "المدير المالي والاعتماد", subtitle: "الاعتماد والختم الرسمي" },
            ]}
            showQr={false}
          />
        </div>
      </div>
    </AppShell>
  );
}
