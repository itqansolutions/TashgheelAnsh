import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ManufacturingRepository } from "@/server/repositories/manufacturingRepository";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  Factory,
  Package,
  Layers,
  Receipt,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Calculator,
  ChevronLeft,
  Printer,
} from "lucide-react";

export default async function ManufacturingWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "inputs" } = await searchParams;

  const order = await ManufacturingRepository.getOrderById(id);
  if (!order) notFound();

  const availableBatches = await InventoryRepository.getBatches();
  const products = await MasterDataRepository.getProducts();

  async function handleAddInput(formData: FormData) {
    "use server";
    const batchId = formData.get("batchId") as string;
    const qty = parseFloat(formData.get("quantity") as string) || 0;
    const batch = availableBatches.find((b) => b.id === batchId || b.batchNumber === batchId);

    if (batch && qty > 0) {
      await ManufacturingRepository.addInput(
        id,
        batch.productId,
        batch.productName,
        batch.batchNumber,
        qty,
        batch.unitCost
      );
    }
    redirect(`/manufacturing/${id}?tab=inputs`);
  }

  async function handleAddExpense(formData: FormData) {
    "use server";
    const category = formData.get("category") as string;
    const expenseType = formData.get("expenseType") as any;
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const desc = formData.get("description") as string;

    if (amount > 0) {
      await ManufacturingRepository.addExpense(id, category, expenseType, amount, desc);
    }
    redirect(`/manufacturing/${id}?tab=expenses`);
  }

  async function handleCloseOrder(formData: FormData) {
    "use server";
    const p1Id = formData.get("prod1_id") as string;
    const p1Qty = parseFloat(formData.get("prod1_qty") as string) || 0;
    const p1Pct = parseFloat(formData.get("prod1_pct") as string) || 0;

    const p2Id = formData.get("prod2_id") as string;
    const p2Qty = parseFloat(formData.get("prod2_qty") as string) || 0;
    const p2Pct = parseFloat(formData.get("prod2_pct") as string) || 0;

    const outputs = [];
    if (p1Id && p1Qty > 0) {
      const prod = products.find((p) => p.id === p1Id);
      outputs.push({
        productId: p1Id,
        productName: prod?.nameAr || "منتج مخرج 1",
        quantity: p1Qty,
        allocationPercentage: p1Pct,
      });
    }
    if (p2Id && p2Qty > 0) {
      const prod = products.find((p) => p.id === p2Id);
      outputs.push({
        productId: p2Id,
        productName: prod?.nameAr || "منتج مخرج 2",
        quantity: p2Qty,
        allocationPercentage: p2Pct,
      });
    }

    if (outputs.length > 0) {
      await ManufacturingRepository.closeOrder(id, outputs);
    }
    redirect(`/manufacturing/${id}?tab=outputs`);
  }

  const isClosed = order.status === "CLOSED";

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/manufacturing" className="hover:text-indigo-600 transition">
                أوامر التصنيع
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{order.orderNumber}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              مساحة تشغيل وتكلفة أمر التصنيع ({order.orderNumber})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              المصنع: {order.factoryName} • تاريخ البدء: {order.startDate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/manufacturing/${order.id}/print`}
              className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs min-h-[44px] shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>إذن التشغيل (A4)</span>
            </Link>
            <Link
              href="/manufacturing"
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs min-h-[44px] transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة</span>
            </Link>
            {isClosed ? (
              <span className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 min-h-[44px]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>مغلق ومحمل بالمخزن</span>
              </span>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 min-h-[44px]">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>مفتوح للتشغيل</span>
              </span>
            )}
          </div>
        </div>

        {/* Live Cost Accumulation Bar */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-xl space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-indigo-400 font-bold block mb-0.5">
                التكلفة التراكمية الإجمالية لأمر التشغيل
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {formatCurrency(order.totalManufacturingCost)}
              </div>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-[11px] text-slate-400">حالة التجميع</span>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {isClosed ? "تم قفل التكلفة ورسملتها على اللوتات" : "مفتوح لإضافة خامات ومصروفات"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-sans">1. تكلفة الخامات (Materials)</span>
              <span className="text-base sm:text-lg font-bold text-white mt-1 block">
                {formatCurrency(order.totalMaterialCost)}
              </span>
            </div>

            <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-sans">2. أتعاب المصنع (Factory Fees)</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 mt-1 block">
                {formatCurrency(order.totalFactoryCost)}
              </span>
            </div>

            <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px] font-sans">3. مصاريف تشغيل (Expenses)</span>
              <span className="text-base sm:text-lg font-bold text-sky-400 mt-1 block">
                {formatCurrency(order.totalExpenseCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
          <Link
            href={`/manufacturing/${id}?tab=inputs`}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition min-h-[44px] flex items-center shrink-0 ${
              tab === "inputs"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            الخامات المستهلكة ({order.inputs.length})
          </Link>
          <Link
            href={`/manufacturing/${id}?tab=expenses`}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition min-h-[44px] flex items-center shrink-0 ${
              tab === "expenses"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            المصروفات وأتعاب المصنع ({order.expenses.length})
          </Link>
          <Link
            href={`/manufacturing/${id}?tab=outputs`}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition min-h-[44px] flex items-center shrink-0 ${
              tab === "outputs"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            المخرجات وتوزيع التكاليف ({order.outputs.length})
          </Link>
        </div>

        {/* Tab 1: Inputs */}
        {tab === "inputs" && (
          <div className="space-y-4 sm:space-y-6">
            {!isClosed && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  <span>صرف واستهلاك خامة من المخزن لأمر التشغيل</span>
                </h3>

                <form action={handleAddInput} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اختر لوت الباتش المراد سحبه *
                    </label>
                    <select
                      name="batchId"
                      required
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold min-h-[44px]"
                    >
                      {availableBatches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.productName} ({b.batchNumber}) - متاح: {b.remainingQuantity} @ {b.unitCost} EGP
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الكمية المستهلكة *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      name="quantity"
                      placeholder="مثال: 50"
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 min-h-[44px]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition min-h-[44px]"
                    >
                      <Plus className="h-4 w-4" />
                      <span>صرف الخامة وخفض المخزن</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Inputs: Mobile Cards (< sm) & Desktop Table (>= sm) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">سجل الخامات المستهلكة في هذا الأمر</h3>
                <span className="text-xs text-slate-500 font-bold font-mono">
                  الإجمالي: {formatCurrency(order.totalMaterialCost)}
                </span>
              </div>

              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {order.inputs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    لم يتم صرف أي خامات لهذا الأمر بعد
                  </div>
                ) : (
                  order.inputs.map((inItem) => (
                    <div key={inItem.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {inItem.batchNumber}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {formatCurrency(inItem.totalCost)}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{inItem.productName}</h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                        <span>الكمية المسحوبة: <strong className="text-slate-800">{inItem.quantity}</strong></span>
                        <span>تكلفة الوحدة: <strong>{formatCurrency(inItem.unitCost)}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">رقم باتش الخامة</th>
                      <th className="py-3 px-4">اسم الخامة المستهلكة</th>
                      <th className="py-3 px-4">الكمية المسحوبة</th>
                      <th className="py-3 px-4">تكلفة الوحدة الفعلية للوت</th>
                      <th className="py-3 px-4 text-left">التكلفة المحملة على الأمر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {order.inputs.map((inItem) => (
                      <tr key={inItem.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                          {inItem.batchNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{inItem.productName}</td>
                        <td className="py-3 px-4 text-slate-800">{inItem.quantity}</td>
                        <td className="py-3 px-4 text-slate-900 font-mono">{formatCurrency(inItem.unitCost)}</td>
                        <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                          {formatCurrency(inItem.totalCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Expenses & Factory Charges */}
        {tab === "expenses" && (
          <div className="space-y-4 sm:space-y-6">
            {!isClosed && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  <span>إضافة أتعاب تصنيع للمصنع أو مصروف تشغيل</span>
                </h3>

                <form action={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نوع التكلفة *
                    </label>
                    <select
                      name="expenseType"
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold min-h-[44px]"
                    >
                      <option value="FACTORY_PAYABLE">أتعاب تشغيل (مستحق للمصنع)</option>
                      <option value="GENERAL_OPERATIONAL">مصروف عام (نقل / تغليف)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تصنيف المصروف
                    </label>
                    <input
                      type="text"
                      name="category"
                      defaultValue="خدمات تشغيل وتصنيع"
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      المبلغ (EGP) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      name="amount"
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 min-h-[44px]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition min-h-[44px]"
                    >
                      <Plus className="h-4 w-4" />
                      <span>إثبات المصروف على الأمر</span>
                    </button>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      البيان والشرح
                    </label>
                    <input
                      type="text"
                      name="description"
                      required
                      placeholder="مثال: أتعاب ثني وتشكيل الصاج بمصنع الأمل"
                      className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 min-h-[44px]"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Expenses: Mobile Cards (< sm) & Desktop Table (>= sm) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">سجل المصروفات وأتعاب التشغيل المقيدة</h3>
                <span className="text-xs text-slate-500 font-mono font-bold">
                  الإجمالي: {formatCurrency(order.totalExpenseCost + order.totalFactoryCost)}
                </span>
              </div>

              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {order.expenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    لم يتم قيد أي مصروفات لهذا الأمر بعد
                  </div>
                ) : (
                  order.expenses.map((exp) => (
                    <div key={exp.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            exp.expenseType === "FACTORY_PAYABLE"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {exp.expenseType === "FACTORY_PAYABLE" ? "أتعاب مصنع دائنة" : "مصروف تشغيلي"}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {formatCurrency(exp.amount)}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs">{exp.categoryName}</p>
                      <p className="text-[11px] text-slate-600">{exp.description}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">نوع التكلفة</th>
                      <th className="py-3 px-4">التصنيف</th>
                      <th className="py-3 px-4">البيان والشرح</th>
                      <th className="py-3 px-4 text-left">المبلغ المحمل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {order.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              exp.expenseType === "FACTORY_PAYABLE"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                          >
                            {exp.expenseType === "FACTORY_PAYABLE" ? "أتعاب مصنع دائنة" : "مصروف تشغيلي"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{exp.categoryName}</td>
                        <td className="py-3 px-4 text-slate-700">{exp.description}</td>
                        <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Outputs & Cost Allocation Wizard */}
        {tab === "outputs" && (
          <div className="space-y-4 sm:space-y-6">
            {!isClosed ? (
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                    <span>توزيع التكاليف وإقفال أمر التشغيل (Closing & Allocation Wizard)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    سيتم توزيع إجمالي التكلفة ({formatCurrency(order.totalManufacturingCost)}) على المنتجات المخرجة
                    وإنشاء لوتات باتش جديدة في المخزن بتكلفة الوحدة المحسوبة بدقة.
                  </p>
                </div>

                <form action={handleCloseOrder} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المنتج المخرج الأول *
                      </label>
                      <select name="prod1_id" className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 bg-white font-semibold min-h-[44px]">
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nameAr} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        الكمية المنتجة *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        name="prod1_qty"
                        placeholder="100"
                        defaultValue="120"
                        className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نسبة التكلفة % *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        name="prod1_pct"
                        placeholder="100"
                        defaultValue="100"
                        className="w-full px-3 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-indigo-700 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">
                      ✔ يجب أن يتساوى مجموع نسب التوزيع مع 100.00% بالضبط.
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition min-h-[44px]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>اعتماد الإقفال ورسملة اللوتات بالمخزن</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Produced Batches: Mobile Cards (< sm) & Desktop Table (>= sm) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">لوتات المنتجات المخرجة وتكلفتها المحتسبة</h3>
                  <p className="text-[11px] text-slate-500">تم إيداعها بالمستودع والحصول على رقم لوت خاص لكل كمية</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {order.outputs.length} مخرجات
                </span>
              </div>

              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden divide-y divide-slate-100">
                {order.outputs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    لم يتم إقفال هذا الأمر وتوليد مخرجات بعد
                  </div>
                ) : (
                  order.outputs.map((out) => (
                    <div key={out.id} className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {out.batchNumber}
                        </span>
                        <Link
                          href={`/inventory/batches/${out.batchNumber}`}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <span>شجرة التتبع</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{out.productName}</h4>
                      <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl text-center font-mono text-xs border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">الكمية</span>
                          <span className="font-bold text-slate-800">{out.quantity}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">نسبة التكلفة</span>
                          <span className="font-bold text-indigo-700">{out.allocationPercentage}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">تكلفة الوحدة</span>
                          <span className="font-black text-emerald-600">{formatCurrency(out.calculatedUnitCost)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">رقم اللوت (الباتش) المنشأ</th>
                      <th className="py-3 px-4">اسم المنتج التام</th>
                      <th className="py-3 px-4">الكمية المنتجة</th>
                      <th className="py-3 px-4">نسبة التكلفة</th>
                      <th className="py-3 px-4">إجمالي التكلفة المحملة</th>
                      <th className="py-3 px-4">تكلفة الوحدة المحسوبة</th>
                      <th className="py-3 px-4 text-left">التتبع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {order.outputs.map((out) => (
                      <tr key={out.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                          {out.batchNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{out.productName}</td>
                        <td className="py-3 px-4 text-slate-800">{out.quantity}</td>
                        <td className="py-3 px-4 font-bold font-mono text-indigo-700">
                          {out.allocationPercentage}%
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                          {formatCurrency(out.allocatedCost)}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-600 font-mono text-sm">
                          {formatCurrency(out.calculatedUnitCost)}
                        </td>
                        <td className="py-3 px-4 text-left">
                          <Link
                            href={`/inventory/batches/${out.batchNumber}`}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            <span>شجرة التتبع</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
