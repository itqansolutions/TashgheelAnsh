import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManufacturingRepository } from "@/server/repositories/manufacturingRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ArrowRight, Factory, Package, Layers } from "lucide-react";

export default async function ManufacturingOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await ManufacturingRepository.getOrderById(id);

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans" dir="rtl">
      {/* Top Bar for Action (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/manufacturing/${order.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة لأمر التشغيل</span>
        </Link>
        <PrintButton label="طباعة إذن التشغيل والتسليم (A4)" />
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">نظام إدارة الإنتاج والتجارة المتكامل</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">TASHGHEEL TRADING & MANUFACTURING ERP</p>
            <p className="text-xs text-slate-600 mt-2">إذن تشغيل وصرف خامات لجهة تصنيع خارجية (Outsourced Job Order)</p>
          </div>
          <div className="text-left font-mono">
            <span className="inline-block px-3 py-1 bg-indigo-950 text-white rounded-lg font-bold text-xs mb-2">
              أمر تشغيل لدى الغير
            </span>
            <div className="text-sm font-bold text-slate-900">{order.orderNumber}</div>
            <div className="text-xs text-slate-500 mt-1">تاريخ الإصدار: {order.startDate}</div>
          </div>
        </div>

        {/* Order Details Header */}
        <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 font-semibold block mb-1">جهة التصنيع المنفذة:</span>
            <div className="font-bold text-slate-900 text-sm">{order.factoryName}</div>
            <div className="text-slate-600 mt-1 font-mono">كود المصنع: {order.factoryId}</div>
            <div className="text-slate-600">مستودع خروج الخامات: {order.warehouseName}</div>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block mb-1">المواصفات والجدول الزمني:</span>
            <div><span className="text-slate-500">حالة الأمر:</span> <span className="font-bold text-indigo-700">{order.status}</span></div>
            <div><span className="text-slate-500">تاريخ التسليم المتوقع:</span> <span className="font-mono font-bold">{order.expectedCompletionDate || "حسب الاتفاق"}</span></div>
            <div><span className="text-slate-500">تاريخ الإغلاق الفعلي:</span> <span className="font-mono">{order.actualCompletionDate || "قيد التنفيذ"}</span></div>
          </div>
        </div>

        {/* Section 1: Dispatched Raw Materials */}
        <div className="my-6">
          <h2 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Package className="h-4 w-4 text-indigo-600" />
            <span>1. الخامات ومستلزمات الإنتاج المنصرفة للمصنع (Dispatched Raw Materials)</span>
          </h2>
          <table className="w-full text-right text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 border-l border-slate-200">م</th>
                <th className="py-2 px-3 border-l border-slate-200">اسم الخامة والمواصفات</th>
                <th className="py-2 px-3 border-l border-slate-200">رقم الباتش المنصرف</th>
                <th className="py-2 px-3 border-l border-slate-200 text-center">الكمية المسلمة</th>
                <th className="py-2 px-3 border-l border-slate-200 text-left">تكلفة الوحدة</th>
                <th className="py-2 px-3 text-left">إجمالي التكلفة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.inputs.map((inp, idx) => (
                <tr key={inp.id}>
                  <td className="py-2 px-3 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="py-2 px-3 border-l border-slate-200 font-bold text-slate-900">{inp.productName}</td>
                  <td className="py-2 px-3 border-l border-slate-200 font-mono text-indigo-700 font-bold">{inp.batchNumber}</td>
                  <td className="py-2 px-3 border-l border-slate-200 text-center font-mono font-bold">{inp.quantity.toLocaleString()}</td>
                  <td className="py-2 px-3 border-l border-slate-200 text-left font-mono">{formatCurrency(inp.unitCost)}</td>
                  <td className="py-2 px-3 text-left font-mono font-bold">{formatCurrency(inp.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Expected / Actual Finished Goods */}
        <div className="my-6">
          <h2 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-emerald-600" />
            <span>2. المخرجات والمنتجات تامة الصنع المستلمة (Finished Outputs)</span>
          </h2>
          <table className="w-full text-right text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3 border-l border-slate-200">م</th>
                <th className="py-2 px-3 border-l border-slate-200">المنتج المستهدف</th>
                <th className="py-2 px-3 border-l border-slate-200 text-center">الكمية الناتجة</th>
                <th className="py-2 px-3 border-l border-slate-200 text-center">نسبة توزيع التكلفة %</th>
                <th className="py-2 px-3 border-l border-slate-200 text-left">التكلفة المحملة</th>
                <th className="py-2 px-3 text-left">تكلفة الوحدة المحسوبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.outputs.map((out, idx) => (
                <tr key={out.id}>
                  <td className="py-2 px-3 border-l border-slate-200 font-mono text-center">{idx + 1}</td>
                  <td className="py-2 px-3 border-l border-slate-200 font-bold text-slate-900">
                    <div>{out.productName}</div>
                    {out.batchNumber && <div className="text-[11px] font-mono text-indigo-600">باتش: {out.batchNumber}</div>}
                  </td>
                  <td className="py-2 px-3 border-l border-slate-200 text-center font-mono font-bold">{out.quantity.toLocaleString()}</td>
                  <td className="py-2 px-3 border-l border-slate-200 text-center font-mono font-bold text-emerald-600">{out.allocationPercentage}%</td>
                  <td className="py-2 px-3 border-l border-slate-200 text-left font-mono font-bold">{formatCurrency(out.allocatedCost)}</td>
                  <td className="py-2 px-3 text-left font-mono font-bold text-indigo-700">{formatCurrency(out.calculatedUnitCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Cost Aggregates Summary */}
        <div className="flex justify-end my-6">
          <div className="w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>إجمالي تكلفة الخامات المنصرفة:</span>
              <span className="font-mono font-bold">{formatCurrency(order.totalMaterialCost)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>أتعاب ومصنعية المصنع الخارجية:</span>
              <span className="font-mono font-bold">{formatCurrency(order.totalFactoryCost)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>مصروفات إنتاجية وتشغيلية:</span>
              <span className="font-mono font-bold">{formatCurrency(order.totalExpenseCost)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
              <span>إجمالي تكلفة أمر التصنيع:</span>
              <span className="font-mono text-indigo-700">{formatCurrency(order.totalManufacturingCost)}</span>
            </div>
          </div>
        </div>

        {/* Instructions & Handover Notes */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 my-6">
          <p className="font-bold text-slate-800 mb-1">تعليمات الجودة والتسليم:</p>
          <p>يلتزم المصنع بالمطابقة التامة للمواصفات الفنية المعتمدة. لا يعتبر الاستلام نهائياً إلا بعد فحص الجودة المخبري وإصدار شهادة الفحص المعتمدة.</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="text-slate-500 mb-8 font-semibold">مسؤول صرف الخامات</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والتاريخ</div>
          </div>
          <div>
            <div className="text-slate-500 mb-8 font-semibold">مندوب استلام المصنع الخارجي</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">الاسم والرقم القومي والتوقيع</div>
          </div>
          <div>
            <div className="text-slate-500 mb-8 font-semibold">مدير إدارة الإنتاج والتشغيل</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">الاعتماد والختم</div>
          </div>
        </div>
      </div>
    </div>
  );
}
