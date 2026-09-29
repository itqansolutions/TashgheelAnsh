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

export default async function SupplierStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ fromDate?: string; toDate?: string }>;
}) {
  const { id } = await params;
  const { fromDate, toDate } = await searchParams;

  const supplier = await PartnersRepository.getPartnerById(id);
  if (!supplier) notFound();

  const entries = await PartnersRepository.getStatement(id, fromDate, toDate);

  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);
  const currentBalance = supplier.currentBalance;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Print Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href={`/suppliers/${supplier.id}`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">كشف حساب مورد معتمد</h1>
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
        <form className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">الفترة من:</span>
            <input
              type="date"
              name="fromDate"
              defaultValue={fromDate || ""}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">إلى:</span>
            <input
              type="date"
              name="toDate"
              defaultValue={toDate || ""}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition"
          >
            تصفية
          </button>
        </form>

        {/* Printable Statement Sheet */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
                <span>الشركة المصرية للتجارة والصناعات الهندسية</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                الإدارة المالية والحسابات • سجل تجاري: 45890 • بطاقة ضريبية: 900-112-334
              </p>
              <p className="text-xs text-slate-500">القاهرة، مصر • هاتف: +20233445566</p>
            </div>

            <div className="text-left">
              <h2 className="text-xl font-extrabold text-slate-900">كشف حساب مورد</h2>
              <p className="text-xs font-mono text-indigo-600 font-bold mt-1">STATEMENT OF ACCOUNT</p>
              <p className="text-xs text-slate-400 mt-1">تاريخ الإصدار: {new Date().toISOString().split("T")[0]}</p>
            </div>
          </div>

          {/* Supplier Info & Balance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-400 block text-[11px]">بيانات المورد (Account Details)</span>
              <p className="text-sm font-bold text-slate-900">{supplier.nameAr}</p>
              <p className="font-mono text-slate-600">كود المورد: {supplier.code}</p>
              <p className="font-mono text-slate-600">الرقم الضريبي: {supplier.taxNumber || "—"}</p>
              <p className="text-slate-600">{supplier.address}</p>
            </div>

            <div className="flex flex-col justify-center sm:items-end text-right sm:text-left space-y-1">
              <span className="text-xs font-bold text-slate-500">الرصيد النهائي المستحق للمورد (دائن)</span>
              <span className="text-2xl font-black text-rose-600 font-mono">
                {formatCurrency(currentBalance)}
              </span>
              <span className="text-[11px] text-slate-400">
                (مستخرج ومطابق لقيود دفتر الأستاذ العام)
              </span>
            </div>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
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

          {/* Signatures Footer */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-slate-600 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800 mb-8">إعداد المحاسب المسؤول</p>
              <div className="w-32 border-b border-slate-400 mx-auto" />
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-8">المراجعة والتدقيق المالي</p>
              <div className="w-32 border-b border-slate-400 mx-auto" />
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-8">المدير المالي والاعتماد</p>
              <div className="w-32 border-b border-slate-400 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
