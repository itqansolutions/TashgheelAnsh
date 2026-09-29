import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PurchasesRepository } from "@/server/repositories/purchasesRepository";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  ShoppingCart,
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
  Printer,
} from "lucide-react";

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await PurchasesRepository.getPurchaseById(id);
  if (!purchase) notFound();

  async function handleRecordPayment(formData: FormData) {
    "use server";
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const ref = formData.get("referenceNumber") as string;
    const cashAccount = formData.get("cashAccount") as string;

    if (amount > 0) {
      await PurchasesRepository.recordPurchasePayment(id, amount, ref, cashAccount);
    }
    redirect(`/purchases/${id}`);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/purchases" className="hover:text-indigo-600 transition">
                فواتير التوريد
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{purchase.invoiceNumber}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              تفاصيل فاتورة الشراء والتوريد ({purchase.invoiceNumber})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              المورد: {purchase.supplierName} • المستودع: {purchase.warehouseName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/purchases/${purchase.id}/print`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة الفاتورة (A4)</span>
            </Link>
            <Link
              href="/purchases"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للمشتريات</span>
            </Link>
            <Link
              href={`/suppliers/${purchase.supplierId}/statement`}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>كشف حساب المورد</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي الفاتورة</span>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(purchase.totalAmount)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">شامل التوريد والتكاليف</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">المبلغ المسدد للمورد</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {formatCurrency(purchase.paidAmount)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">بموجب إيصالات صرف معتمدة</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">المتبقي المطلوب سداده</span>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              {formatCurrency(purchase.remainingAmount)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {purchase.remainingAmount === 0 ? "مسددة بالكامل" : "مستحق بدفتر أستاذ المورد"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">حالة الفاتورة</span>
            <div className="text-xl font-bold text-indigo-700">
              {purchase.status === "PAID" ? "مسددة بالكامل" : "مفتوحة / مستحقة"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">تاريخ الفاتورة: {purchase.invoiceDate}</span>
          </div>
        </div>

        {/* Lines & Generated Batches Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">بنود التوريد ولوتات الباتش المنشأة</h2>
              <p className="text-xs text-slate-500">
                كل كمية تم توريدها حصلت على رقم باتش خاص بها لحفظ تكلفتها الفعلية
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              {purchase.lines.length} بنود
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم الباتش المنشأ</th>
                  <th className="py-3 px-4">الصنف / الخامة</th>
                  <th className="py-3 px-4">الكمية الواردة</th>
                  <th className="py-3 px-4">تكلفة الوحدة</th>
                  <th className="py-3 px-4">إجمالي البند</th>
                  <th className="py-3 px-4 text-left">التتبع المخزني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {purchase.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {line.batchNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{line.productName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{line.productSku}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{line.quantity}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{formatCurrency(line.unitCost)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">{formatCurrency(line.lineTotal)}</td>
                    <td className="py-3 px-4 text-left">
                      <Link
                        href={`/inventory/batches/${line.batchNumber}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <span>تتبع اللوت</span>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Record Payment Form */}
          {purchase.remainingAmount > 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span>سداد دفعة من هذه الفاتورة</span>
              </h3>

              <form action={handleRecordPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المبلغ المراد سداده (EGP) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={purchase.remainingAmount}
                      name="amount"
                      defaultValue={purchase.remainingAmount}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم إيصال الصرف / الشيك
                    </label>
                    <input
                      type="text"
                      name="referenceNumber"
                      defaultValue={`PAY-${Date.now().toString().slice(-6)}`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حساب السداد (الخزينة)
                  </label>
                  <select name="cashAccount" className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
                    <option value="خزينة المركز الرئيسي">خزينة المركز الرئيسي (EGP)</option>
                    <option value="الحساب البنكي التجاري">الحساب البنكي التجاري</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تأكيد صرف وسداد المبلغ</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-900">هذه الفاتورة مسددة بالكامل</h3>
              <p className="text-xs text-emerald-700">تم تسوية كامل المستحقات المقيدة لصالح المورد.</p>
            </div>
          )}

          {/* Payment History Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>سجل السدادات المسجلة على الفاتورة</span>
            </h3>

            {purchase.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لم يتم تسجيل سدادات على هذه الفاتورة بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-3">التاريخ</th>
                      <th className="py-2 px-3">رقم السند</th>
                      <th className="py-2 px-3">حساب الخزينة</th>
                      <th className="py-2 px-3 text-left">المبلغ المسدد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {purchase.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{p.paymentDate}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{p.referenceNumber}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.cashAccountName}</td>
                        <td className="py-2.5 px-3 text-left font-mono font-bold text-emerald-600">
                          {formatCurrency(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
