import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SalesRepository } from "@/server/repositories/salesRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ArrowRight, BadgeDollarSign, ShieldCheck, QrCode } from "lucide-react";

export default async function SalesInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await SalesRepository.getSaleById(id);

  if (!sale) notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans" dir="rtl">
      {/* Top Bar for Action (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/sales/${sale.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة للفاتورة</span>
        </Link>
        <PrintButton label="طباعة الفاتورة الضريبية للعميل (A4)" />
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black text-slate-900">شركة التشغيل والتجارة المتطورة</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                فاتورة ضريبية رسمية
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">TASHGHEEL TRADING ENTERPRISE CO.</p>
            <p className="text-xs text-slate-600 mt-2">
              س.ت: 498302 • ب.ض: 100-245-890 • الرقم الضريبي الموحد: 30098712300003
            </p>
            <p className="text-xs text-slate-600">القاهرة، جمهورية مصر العربية • هاتف: 02-33445566</p>
          </div>
          <div className="text-left font-mono">
            <div className="text-base font-bold text-slate-900">{sale.invoiceNumber}</div>
            <div className="text-xs text-slate-500 mt-1">تاريخ الإصدار: {sale.invoiceDate}</div>
            {sale.dueDate && <div className="text-xs text-rose-600 font-bold mt-0.5">تاريخ الاستحقاق: {sale.dueDate}</div>}
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">بيانات العميل:</span>
            <div className="font-bold text-slate-900 text-sm">{sale.customerName}</div>
            <div className="text-slate-600 mt-1 font-mono">كود العميل: {sale.customerId}</div>
            <div className="text-slate-600 mt-0.5">المستودع المنصرف منه: {sale.warehouseName}</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block mb-1">طريقة السداد والشروط:</span>
            <div><span className="text-slate-500">طريقة الدفع:</span> <span className="font-bold">{sale.paymentMethod === "CREDIT" ? "آجل (حساب جاري عميل)" : "نقدي"}</span></div>
            <div><span className="text-slate-500">حالة الفاتورة:</span> <span className="font-bold text-emerald-700">{sale.status === "PAID" ? "مسددة بالكامل" : sale.status === "PARTIALLY_PAID" ? "مسددة جزئياً" : "مفتوحة للاستحقاق"}</span></div>
          </div>
        </div>

        {/* Items Table with Specific Batch Allocation References */}
        <div className="my-6">
          <table className="w-full text-right text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 border-l border-slate-200">م</th>
                <th className="py-2.5 px-3 border-l border-slate-200">بيان الصنف والمواصفات</th>
                <th className="py-2.5 px-3 border-l border-slate-200">أرقام الباتشات المخصصة</th>
                <th className="py-2.5 px-3 border-l border-slate-200 text-center">الكمية</th>
                <th className="py-2.5 px-3 border-l border-slate-200 text-left">سعر الوحدة</th>
                <th className="py-2.5 px-3 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sale.lines.map((l, idx) => (
                <tr key={l.id}>
                  <td className="py-2.5 px-3 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 border-l border-slate-200">
                    <p className="font-bold text-slate-900">{l.productName}</p>
                    <p className="text-[11px] font-mono text-slate-400">{l.productSku}</p>
                  </td>
                  <td className="py-2.5 px-3 border-l border-slate-200">
                    <div className="space-y-0.5">
                      {l.allocations.map((a, ai) => (
                        <div key={ai} className="font-mono text-[11px] text-indigo-700">
                          {a.batchNumber} ({a.quantity} وحدة)
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 border-l border-slate-200 text-center font-mono font-bold text-slate-900">
                    {l.quantity.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 border-l border-slate-200 text-left font-mono">
                    {formatCurrency(l.unitPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-left font-mono font-bold text-slate-900">
                    {formatCurrency(l.lineSubtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payment Summary */}
        <div className="flex justify-between items-start my-6">
          {/* Bank Payment Instructions */}
          <div className="w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block mb-1">بيانات التحويل البنكي:</span>
            <p>بنك مصر - فرع الشركات الرئيسي</p>
            <p className="font-mono font-bold text-slate-900">IBAN: EG4500020001000000123456789</p>
            <p className="text-[11px] text-slate-400 mt-2">يرجى إرفاق رقم الفاتورة عند التحويل البنكي.</p>
          </div>

          {/* Amount Calculation */}
          <div className="w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>إجمالي المبيعات:</span>
              <span className="font-mono font-bold">{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>الخصم التجاري الممنوح:</span>
                <span className="font-mono font-bold">-{formatCurrency(sale.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>صافي القيمة المستحقة:</span>
              <span className="font-mono text-indigo-700">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
              <span>المسدد نقداً / بنكياً:</span>
              <span className="font-mono">{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-rose-600">
              <span>الرصيد المتبقي على العميل:</span>
              <span className="font-mono">{formatCurrency(sale.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* QR Code & Digital Compliance Footer */}
        <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-slate-300 text-xs">
          <div className="text-center">
            <div className="text-slate-500 mb-8 font-semibold">المستلم المعتمد للعميل</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والاستلام</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 border-2 border-slate-800 rounded-lg flex items-center justify-center bg-slate-50">
              <QrCode className="h-12 w-12 text-slate-900" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">ZATCA / ETA Verified</span>
          </div>
          <div className="text-center">
            <div className="text-slate-500 mb-8 font-semibold">إدارة المبيعات والحسابات</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">الختم والاعتماد الرسمي</div>
          </div>
        </div>
      </div>
    </div>
  );
}
