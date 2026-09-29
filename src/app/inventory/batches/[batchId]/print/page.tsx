import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ArrowRight, Package, QrCode, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function BatchCertificatePrintPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const batch = await InventoryRepository.getBatchByIdOrNumber(batchId);

  if (!batch) notFound();

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans" dir="rtl">
      {/* Top Bar for Action (Hidden during print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/inventory/batches/${batch.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة لبيانات الباتش</span>
        </Link>
        <PrintButton label="طباعة جواز وتشغيلة الباتش (A4)" />
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Certificate Header */}
        <div className="border-b-2 border-indigo-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-6 w-6 text-indigo-700" />
              <h1 className="text-xl font-black text-slate-900">شهادة وجواز تتبع الباتش الفني والمالي</h1>
            </div>
            <p className="text-xs text-slate-500 font-mono">BATCH PASSPORT & TRACEABILITY CERTIFICATE</p>
            <p className="text-xs text-slate-600 mt-1">نظام إدارة الإنتاج والتجارة - وحدة الرقابة على المخزون وتكاليف التشغيل</p>
          </div>
          <div className="text-left">
            <div className="h-20 w-20 border-2 border-slate-800 rounded-lg flex items-center justify-center bg-slate-50">
              <QrCode className="h-16 w-16 text-slate-900" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-1 text-center">Batch QR Stamp</span>
          </div>
        </div>

        {/* Big Batch Identification Banner */}
        <div className="my-6 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-700 block mb-0.5">رقم الباتش التسلسلي المعتمد (Lot ID)</span>
            <div className="text-2xl font-black font-mono text-indigo-950 tracking-wider">{batch.batchNumber}</div>
          </div>
          <div className="text-left font-mono">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>معتمد ومفحوص جودة</span>
            </span>
          </div>
        </div>

        {/* Product & Specifications Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block mb-1">اسم الصنف والمواصفات:</span>
            <div className="font-bold text-slate-900 text-sm">{batch.productName}</div>
            <div className="font-mono text-slate-500 mt-0.5">كود الصنف: {batch.productSku}</div>
            <div className="text-slate-600 mt-1">
              تصنيف الصنف:{" "}
              <span className="font-bold">
                {batch.itemType === "RAW_MATERIAL"
                  ? "مادة خام أساسية"
                  : batch.itemType === "SEMI_FINISHED"
                  ? "منتج نصف مصنع"
                  : "منتج تام الصنع"}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold block mb-1">المستودع وموقع التخزين:</span>
            <div className="font-bold text-slate-900 text-sm">{batch.warehouseName}</div>
            <div className="font-mono text-slate-500 mt-0.5">كود المستودع: {batch.warehouseId}</div>
            <div className="text-slate-600 mt-1">
              تاريخ التسجيل: <span className="font-mono font-bold">{batch.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Quantities & Financial Cost Breakdown */}
        <div className="my-6">
          <h2 className="text-xs font-bold text-slate-800 mb-2">الأرصدة ومحددات التكلفة الفعلية (Specific Landed Cost)</h2>
          <table className="w-full text-right text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 border-l border-slate-200">الكمية الافتتاحية</th>
                <th className="py-2.5 px-3 border-l border-slate-200">الرصيد المتبقي الحالي</th>
                <th className="py-2.5 px-3 border-l border-slate-200 text-left">تكلفة الوحدة المحددة</th>
                <th className="py-2.5 px-3 text-left">إجمالي قيمة الباتش الحالية</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3 border-l border-slate-200 font-mono font-bold text-slate-700">
                  {batch.initialQuantity.toLocaleString()}
                </td>
                <td className="py-3 px-3 border-l border-slate-200 font-mono font-bold text-indigo-700">
                  {batch.remainingQuantity.toLocaleString()}
                </td>
                <td className="py-3 px-3 border-l border-slate-200 text-left font-mono font-bold text-slate-900">
                  {formatCurrency(batch.unitCost)}
                </td>
                <td className="py-3 px-3 text-left font-mono font-bold text-emerald-700">
                  {formatCurrency(batch.remainingQuantity * batch.unitCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Origin & Traceability Lineage */}
        <div className="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
          <span className="font-bold text-slate-800 block mb-2">أصل التكوين والتتبع الرقابي:</span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500">طبيعة المصدر:</span>{" "}
              <span className="font-bold">
                {batch.sourceType === "PURCHASE" ? "فاتورة شراء وتوريد مباشر" : "أمر تصنيع وتشغيل لدى الغير"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">رقم مستند المصدر:</span>{" "}
              <span className="font-mono font-bold text-indigo-700">{batch.sourceDocumentNumber}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="text-slate-500 mb-8 font-semibold">مسؤول رقابة الجودة والمخزون</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">التوقيع والتاريخ</div>
          </div>
          <div>
            <div className="text-slate-500 mb-8 font-semibold">مدير الحسابات العامة وتكاليف الإنتاج</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 font-bold">الاعتماد والختم الرسمي</div>
          </div>
        </div>
      </div>
    </div>
  );
}
