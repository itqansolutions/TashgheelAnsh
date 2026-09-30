import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchasesRepository } from "@/server/repositories/purchasesRepository";
import { SettingsRepository } from "@/server/repositories/settingsRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ArrowRight } from "lucide-react";
import { CompanyPrintHeader } from "@/components/printing/CompanyPrintHeader";
import { CompanyPrintFooter } from "@/components/printing/CompanyPrintFooter";

export default async function PurchaseInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [purchase, settings] = await Promise.all([
    PurchasesRepository.getPurchaseById(id),
    SettingsRepository.getSettings(),
  ]);

  if (!purchase) notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans" dir="rtl">
      {/* Top Bar for Action (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/purchases/${purchase.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للفاتورة</span>
        </Link>
        <PrintButton label="طباعة الفاتورة الرسمية (A4)" />
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Dynamic Company Header */}
        <CompanyPrintHeader
          settings={settings}
          documentTitle="فاتورة توريد مشتريات"
          documentNumber={purchase.invoiceNumber}
          documentDate={purchase.invoiceDate}
          badgeLabel="سند إدخال مخزني معتمد"
        />

        {/* Partner & Warehouse Info */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">بيانات المورد المعتمد:</span>
            <div className="font-bold text-slate-900 text-sm">{purchase.supplierName}</div>
            <div className="text-slate-600 mt-1 font-mono">كود المورد: {purchase.supplierId}</div>
            <div className="text-slate-600">المستودع المستلم: {purchase.warehouseName}</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block mb-1">شروط الدفع والحالة:</span>
            <div><span className="text-slate-500">حالة المستند:</span> <span className="font-bold text-emerald-700">معتمد ومقيد بالمخازن</span></div>
            <div><span className="text-slate-500">طريقة السداد:</span> <span className="font-bold">آجل (حساب مورد معتمد)</span></div>
            <div><span className="text-slate-500">حالة السداد:</span> <span className="font-mono font-bold text-indigo-700">{purchase.status}</span></div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="my-6">
          <table className="w-full text-right text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 border-l border-slate-200">م</th>
                <th className="py-2.5 px-3 border-l border-slate-200">الصنف والوصف</th>
                <th className="py-2.5 px-3 border-l border-slate-200">رقم الباتش المنشأ</th>
                <th className="py-2.5 px-3 border-l border-slate-200 text-center">الكمية</th>
                <th className="py-2.5 px-3 border-l border-slate-200 text-left">سعر الوحدة</th>
                <th className="py-2.5 px-3 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchase.lines.map((l, idx) => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-l border-slate-200 font-bold text-slate-900">{l.productName}</td>
                  <td className="py-2.5 px-3 border-l border-slate-200 font-mono text-indigo-700 font-bold">{l.batchNumber}</td>
                  <td className="py-2.5 px-3 border-l border-slate-200 text-center font-mono font-bold">{l.quantity.toLocaleString()}</td>
                  <td className="py-2.5 px-3 border-l border-slate-200 text-left font-mono">{formatCurrency(l.unitCost, settings.currency)}</td>
                  <td className="py-2.5 px-3 text-left font-mono font-bold">{formatCurrency(l.lineTotal, settings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end my-6">
          <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>إجمالي البضاعة:</span>
              <span className="font-mono font-bold">{formatCurrency(purchase.subtotal, settings.currency)}</span>
            </div>
            {purchase.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم التجاري المكتسب:</span>
                <span className="font-mono font-bold">-{formatCurrency(purchase.discountAmount, settings.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>صافي الفاتورة الإجمالي:</span>
              <span className="font-mono text-indigo-700">{formatCurrency(purchase.totalAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
              <span>المدفوع:</span>
              <span className="font-mono">{formatCurrency(purchase.paidAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-rose-600">
              <span>المتبقي للمورد (دائن):</span>
              <span className="font-mono">{formatCurrency(purchase.remainingAmount, settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Company Footer */}
        <CompanyPrintFooter
          settings={settings}
          signatures={[
            { title: "أمين المستودع المستلم", subtitle: "التوقيع والتاريخ" },
            { title: "المحاسب المسؤول", subtitle: "المراجعة والتسجيل" },
            { title: "اعتماد إدارة المشتريات", subtitle: "الختم والتصديق" },
          ]}
          showQr={false}
        />
      </div>
    </div>
  );
}
