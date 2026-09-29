import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  Package,
  Layers,
  Calendar,
  ArrowRight,
  TrendingUp,
  History,
  ShoppingCart,
  Factory,
  BadgeDollarSign,
  ChevronLeft,
} from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await MasterDataRepository.getProductById(id);

  if (!product) {
    notFound();
  }

  // Sample batches for this product
  const batches = [
    {
      id: "bat-001",
      batchNumber: "BAT-2026-000001",
      warehouseName: "المستودع الرئيسي - 6 أكتوبر",
      sourceType: "PURCHASE",
      sourceDoc: "PUR-2026-000001",
      initialQty: 500,
      remainingQty: product.currentStock,
      unitCost: product.referenceCost,
      totalCost: product.currentStock * product.referenceCost,
      createdAt: "2026-05-10",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/products" className="hover:text-indigo-600 transition">
                دليل الأصناف
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{product.sku}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{product.nameAr}</h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{product.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للأصناف</span>
            </Link>
            <Link
              href={`/purchases/new?productId=${product.id}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>طلب شراء جديد</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">الرصيد الفعلي المتاح</span>
            <div className="text-2xl font-bold text-emerald-600">
              {formatQuantity(product.currentStock, product.uomSymbol)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">محسوب من مجموع اللوتات النشطة</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">قيمة المخزون المقيدة</span>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.totalInventoryValue)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">بناء على تكاليف الباتشات الفعلية</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">سعر البيع الافتراضي</span>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.defaultSellingPrice)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              الحد الأدنى: {formatCurrency(product.minSellingPrice)}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">التكلفة الاسترشادية</span>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(product.referenceCost)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">لتقديرات العروض والتسعير</span>
          </div>
        </div>

        {/* Active Batches Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">تشغيلات الباتش (Lots / Batches) المخزنية</h3>
              <p className="text-xs text-slate-500">
                كل كمية تحتفظ بتكلفتها المستقلة دون دمج بأي متوسط تكلفة
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              {batches.length} باتش نشط
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم الباتش</th>
                  <th className="py-3 px-4">مستودع التخزين</th>
                  <th className="py-3 px-4">مستند المصدر</th>
                  <th className="py-3 px-4">الكمية الأصلية</th>
                  <th className="py-3 px-4">الرصيد المتبقي</th>
                  <th className="py-3 px-4">تكلفة الوحدة الفعلية</th>
                  <th className="py-3 px-4">إجمالي قيمة اللوت</th>
                  <th className="py-3 px-4 text-left">التتبع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {b.batchNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{b.warehouseName}</td>
                    <td className="py-3 px-4 font-mono text-purple-700">
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                        {b.sourceDoc}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{b.initialQty} {product.uomSymbol}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{b.remainingQty} {product.uomSymbol}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(b.unitCost)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(b.totalCost)}</td>
                    <td className="py-3 px-4 text-left">
                      <Link
                        href={`/inventory/batches/${b.id}`}
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

        {/* Histories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Purchase History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              <span>سجل التوريدات والمشتريات</span>
            </div>
            <div className="text-xs space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">فاتورة PUR-2026-000001</p>
                  <p className="text-[11px] text-slate-500">شركة النصر للخامات</p>
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-slate-900">500 {product.uomSymbol}</span>
                  <span className="block text-[10px] text-slate-400">@ 80.00 EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manufacturing History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              <Factory className="h-4 w-4 text-sky-600" />
              <span>سجل الاستهلاك والتشغيل</span>
            </div>
            <div className="text-xs space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">أمر تشغيل MFG-2026-000001</p>
                  <p className="text-[11px] text-slate-500">مصنع الأمل للصناعات</p>
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-rose-600">-100 {product.uomSymbol}</span>
                  <span className="block text-[10px] text-slate-400">استهلاك خام</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
              <span>سجل المبيعات والتوزيع</span>
            </div>
            <div className="text-xs space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">فاتورة SAL-2026-000001</p>
                  <p className="text-[11px] text-slate-500">شركة الأهرام للتجارة</p>
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-slate-900">100 {product.uomSymbol}</span>
                  <span className="block text-[10px] text-emerald-600">ربح +35.00 EGP/وحدة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
