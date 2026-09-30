import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SalesRepository } from "@/server/repositories/salesRepository";
import { formatCurrency } from "@/lib/utils";
import {
  BadgeDollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  ChevronLeft,
  TrendingUp,
  Printer,
} from "lucide-react";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await SalesRepository.getSaleById(id);
  if (!sale) notFound();

  async function handleRecordReceipt(formData: FormData) {
    "use server";
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const ref = formData.get("referenceNumber") as string;
    const cashAccount = formData.get("cashAccount") as string;

    if (amount > 0) {
      await SalesRepository.recordCustomerReceipt(id, amount, ref, cashAccount);
    }
    redirect(`/sales/${id}`);
  }

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/sales" className="hover:text-indigo-600 transition">
                فواتير المبيعات
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{sale.invoiceNumber}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              فاتورة بيع وتحصيل ({sale.invoiceNumber})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              العميل: {sale.customerName} • المستودع: {sale.warehouseName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/sales/${sale.id}/print`}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs min-h-[44px] shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة (A4)</span>
            </Link>
            <Link
              href="/sales"
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs min-h-[44px] transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة</span>
            </Link>
            <Link
              href={`/suppliers/${sale.customerId}/statement`}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 min-h-[44px] transition flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>كشف العميل</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Cards: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">إجمالي الفاتورة</span>
            <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(sale.totalAmount)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">شامل البنود المباعة</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">التكلفة (COGS)</span>
            <div className="text-base sm:text-2xl font-bold text-slate-700 font-mono">
              {formatCurrency(sale.totalCost)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">تكاليف اللوتات الفعلية</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">مجمل الربح المحقق</span>
            <div className="text-base sm:text-2xl font-bold text-emerald-600 font-mono">
              {formatCurrency(sale.grossProfit)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block truncate">
              هامش: {sale.profitMarginPct}%
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">المتبقي للتحصيل</span>
            <div className="text-base sm:text-2xl font-bold text-rose-600 font-mono">
              {formatCurrency(sale.remainingAmount)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate font-mono">
              المحصل: {formatCurrency(sale.paidAmount)}
            </span>
          </div>
        </div>

        {/* Lines & Allocated Batches */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">بنود الفاتورة واللوتات المخزنية المخصصة</h2>
            <span className="text-xs font-mono font-bold text-indigo-700">
              ربح الفاتورة: {formatCurrency(sale.grossProfit)}
            </span>
          </div>

          {/* Mobile Card List (< sm) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {sale.lines.map((line) => {
              const batchNum = line.allocations[0]?.batchNumber || "BAT-001";
              return (
                <div key={line.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {batchNum}
                    </span>
                    <Link
                      href={`/inventory/batches/${batchNum}`}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      <span>تتبع اللوت</span>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{line.productName}</h4>
                  <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl text-center font-mono text-xs border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">الكمية</span>
                      <span className="font-bold text-slate-800">{line.quantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">سعر البيع</span>
                      <span className="font-bold text-slate-800">{formatCurrency(line.unitPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">صافي البيع</span>
                      <span className="font-bold text-slate-900">{formatCurrency(line.lineSubtotal)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 font-mono">
                    <span className="text-slate-500">التكلفة: <strong className="text-slate-700">{formatCurrency(line.totalCost)}</strong></span>
                    <span className="font-bold text-emerald-600">الربح: +{formatCurrency(line.grossProfit)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">الصنف المباع</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">سعر البيع</th>
                  <th className="py-3 px-4">اللوت المسحوب</th>
                  <th className="py-3 px-4">تكلفة اللوت (COGS)</th>
                  <th className="py-3 px-4">صافي البيع</th>
                  <th className="py-3 px-4">الربح المحقق</th>
                  <th className="py-3 px-4 text-left">التتبع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sale.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{line.productName}</td>
                    <td className="py-3 px-4 text-slate-800 font-bold">{line.quantity}</td>
                    <td className="py-3 px-4 text-slate-900 font-mono">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {line.allocations[0]?.batchNumber || "BAT-001"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatCurrency(line.totalCost)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatCurrency(line.lineSubtotal)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      +{formatCurrency(line.grossProfit)}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <Link
                        href={`/inventory/batches/${line.allocations[0]?.batchNumber || "BAT-2026-000001"}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <span>تتبع</span>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Receipt Form & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {sale.remainingAmount > 0 ? (
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>إثبات تحصيل دفعة نقدية / بنكية من العميل</span>
              </h3>

              <form action={handleRecordReceipt} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المبلغ المحصل (EGP) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={sale.remainingAmount}
                      name="amount"
                      defaultValue={sale.remainingAmount}
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم إيصال التحصيل
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      defaultValue={`REC-${Date.now().toString().slice(-6)}`}
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    إيداع في خزينة / بنك
                  </label>
                  <select name="cashAccount" className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold min-h-[44px]">
                    <option value="خزينة المركز الرئيسي">خزينة المركز الرئيسي (EGP)</option>
                    <option value="الحساب البنكي التجاري">الحساب البنكي التجاري</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition min-h-[44px]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تأكيد التحصيل وإيداع النقدية</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50/50 p-6 rounded-2xl sm:rounded-3xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-900">تم تحصيل هذه الفاتورة بالكامل</h3>
              <p className="text-xs text-emerald-700">تم سداد كامل قيمة المبيعات وإيداعها في الخزينة.</p>
            </div>
          )}

          {/* Receipts History */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>سجل التحصيلات المسجلة على هذه الفاتورة</span>
            </h3>

            {sale.receipts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لم يتم تسجيل أي تحصيلات على هذه الفاتورة بعد</p>
            ) : (
              <div className="space-y-2">
                {sale.receipts.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-indigo-700 block">{r.referenceNumber}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{r.receiptDate} • {r.cashAccountName}</span>
                    </div>
                    <div className="text-left font-mono font-bold text-emerald-600 text-sm">
                      {formatCurrency(r.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
