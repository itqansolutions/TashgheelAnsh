import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchasesRepository } from "@/server/repositories/purchasesRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ArrowRight, Building2, Package, CheckCircle2 } from "lucide-react";

export default async function PurchaseInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await PurchasesRepository.getPurchaseById(id);

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
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">نظام إدارة الإنتاج والتجارة المتكامل</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">TASHGHEEL TRADING & MANUFACTURING ERP</p>
            <p className="text-xs text-slate-600 mt-2">س.ت: 498302 • ب.ض: 100-245-890 • القاهرة، مصر</p>
          </div>
          <div className="text-left font-mono">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs mb-2">
              فاتورة توريد مشتريات
            </span>
            <div className="text-sm font-bold text-slate-900">{purchase.invoiceNumber}</div>
            <div className="text-xs text-slate-500 mt-1">تاريخ التوريد: {purchase.invoiceDate}</div>
          </div>
        </div>

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
                  <td className="py-2.5 px-3 border-l border-slate-200 text-left font-mono">{formatCurrency(l.unitCost)}</td>
                  <td className="py-2.5 px-3 text-left font-mono font-bold">{formatCurrency(l.lineTotal)}</td>
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
              <span className="font-mono font-bold">{formatCurrency(purchase.subtotal)}</span>
            </div>
            {purchase.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم التجاري المكتسب:</span>
                <span className="font-mono font-bold">-{formatCurrency(purchase.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>صافي الفاتورة الإجمالي:</span>
              <span className="font-mono text-indigo-700">{formatCurrency(purchase.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
              <span>المدفوع:</span>
              <span className="font-mono">{formatCurrency(purchase.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-rose-600">
              <span>المتبقي للمورد (دائن):</span>
              <span className="font-mono">{formatCurrency(purchase.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Signatures & Approvals Footer */}
        <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="text-slate-500 mb-8 font-semibold">أمين المستودع المستلم</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والتاريخ</div>
          </div>
          <div>
            <div className="text-slate-500 mb-8 font-semibold">المحاسب المسؤول</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والختم</div>
          </div>
          <div>
            <div className="text-slate-500 mb-8 font-semibold">اعتماد إدارة المشتريات</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والاعتماد</div>
          </div>
        </div>
      </div>
    </div>
  );
}
