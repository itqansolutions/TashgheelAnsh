import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  Layers,
  ArrowRight,
  Package,
  Calendar,
  Building2,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Factory,
  ShoppingCart,
  BadgeDollarSign,
  ShieldCheck,
  Printer,
} from "lucide-react";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const batch = await InventoryRepository.getBatchByIdOrNumber(batchId);
  if (!batch) notFound();

  const totalLotValue = batch.remainingQuantity * batch.unitCost;

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/inventory" className="hover:text-indigo-600 transition">
                أرصدة المخزون والباتشات
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{batch.batchNumber}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              تفاصيل لوت الباتش ({batch.batchNumber})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              الصنف: {batch.productName} ({batch.productSku}) • المستودع: {batch.warehouseName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/inventory/batches/${batch.id}/print`}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs min-h-[44px] shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>جواز الباتش (A4)</span>
            </Link>
            <Link
              href="/inventory"
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs min-h-[44px] transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للمخزون</span>
            </Link>
          </div>
        </div>

        {/* Batch Info Card Grid: 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">تكلفة الوحدة الفعلية</span>
            <div className="text-base sm:text-2xl font-bold text-indigo-700 font-mono">
              {formatCurrency(batch.unitCost)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">تكلفة شراء / إنتاج فعلية</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">الرصيد المتاح حالياً</span>
            <div className="text-base sm:text-2xl font-bold text-emerald-600 font-mono">
              {batch.remainingQuantity}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
              من أصل {batch.initialQuantity} واردة
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">قيمة اللوت المقيدة</span>
            <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">
              {formatCurrency(totalLotValue)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">المتبقي * تكلفة الوحدة</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block mb-1">مستند المصدر</span>
            <div className="text-sm sm:text-base font-bold font-mono text-purple-700 truncate">
              {batch.sourceDocumentNumber}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
              {batch.sourceType === "PURCHASE" ? "فاتورة شراء" : "أمر تصنيع"}
            </span>
          </div>
        </div>

        {/* Traceability Timeline Section */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <span>شجرة وسلسلة التتبع الكاملة لهذا الباتش (Traceability Timeline)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تتبع حركة هذه الكمية منذ لحظة دخولها المستودع، مروراً بعمليات التصنيع، وحتى البيع النهائي للعميل.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-2 sm:pl-0 space-y-4 sm:space-y-6 before:absolute before:inset-0 before:right-4 sm:before:right-5 before:h-full before:w-0.5 before:bg-slate-200">
            {batch.timeline.map((item, idx) => {
              const nodeIcons: Record<string, any> = {
                in: ShoppingCart,
                mfg: Factory,
                sale: BadgeDollarSign,
                out: Package,
              };
              const Icon = nodeIcons[item.type] || Package;

              return (
                <div key={idx} className="relative flex items-start gap-3 sm:gap-4 mr-0 sm:mr-1">
                  {/* Circle Indicator */}
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 z-10">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>

                  {/* Content Box */}
                  <div className="flex-1 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-indigo-300 transition space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-500 text-[11px]">
                        {item.documentType}: <span className="font-mono text-slate-800 font-bold">{item.documentNumber}</span>
                      </span>
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 text-xs min-h-[36px]"
                      >
                        <span>فتح المستند الأصلي</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
