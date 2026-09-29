import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { formatCurrency, formatQuantity } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  Tag,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; type?: string }>;
}) {
  const { q, cat, type } = await searchParams;
  const products = await MasterDataRepository.getProducts(q, cat, type);
  const categories = await MasterDataRepository.getCategories();

  const itemTypeBadges: Record<string, { label: string; color: string }> = {
    RAW_MATERIAL: { label: "مادة خام", color: "bg-purple-50 text-purple-700 border-purple-200" },
    SEMI_FINISHED: { label: "نصف مصنع", color: "bg-amber-50 text-amber-700 border-amber-200" },
    FINISHED_PRODUCT: { label: "منتج تام", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    SERVICE: { label: "خدمة تشغيل", color: "bg-blue-50 text-blue-700 border-blue-200" },
    OTHER: { label: "أخرى", color: "bg-slate-50 text-slate-700 border-slate-200" },
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">دليل الأصناف والمنتجات</h1>
            <p className="text-xs text-slate-500 mt-1">
              إدارة الخامات الأولية، المنتجات نصف المصنعة، والمنتجات تامة الصنع مع سياسات التسعير بالباتش.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/products/categories"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              التصنيفات
            </Link>
            <Link
              href="/products/units"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              وحدات القياس
            </Link>
            <Link
              href="/products/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة صنف جديد</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <form className="relative w-full md:w-80">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="بحث بكود الصنف، الاسم بالعربي، أو الإنجليزي..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Link
              href="/products"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                !type ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل ({products.length})
            </Link>
            <Link
              href="/products?type=RAW_MATERIAL"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                type === "RAW_MATERIAL" ? "bg-purple-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              خامات
            </Link>
            <Link
              href="/products?type=SEMI_FINISHED"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                type === "SEMI_FINISHED" ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              نصف مصنع
            </Link>
            <Link
              href="/products?type=FINISHED_PRODUCT"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                type === "FINISHED_PRODUCT" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              منتج تام
            </Link>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">كود الصنف (SKU)</th>
                  <th className="py-3 px-4">اسم الصنف</th>
                  <th className="py-3 px-4">التصنيف والنوع</th>
                  <th className="py-3 px-4">الرصيد المتاح</th>
                  <th className="py-3 px-4">عدد الباتشات</th>
                  <th className="py-3 px-4">سعر البيع الافتراضي</th>
                  <th className="py-3 px-4">قيمة المخزون</th>
                  <th className="py-3 px-4 text-left">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      لا توجد أصناف مطابقة لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const badge = itemTypeBadges[prod.itemType] || itemTypeBadges.OTHER;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                          {prod.sku}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{prod.nameAr}</p>
                          <p className="text-[11px] text-slate-400 font-sans">{prod.name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[11px] text-slate-600 font-semibold">
                              {prod.categoryName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <span className={prod.currentStock > 0 ? "text-emerald-600" : "text-slate-400"}>
                            {formatQuantity(prod.currentStock, prod.uomSymbol)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                            {prod.batchesCount} لوت
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(prod.defaultSellingPrice)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(prod.totalInventoryValue)}
                        </td>
                        <td className="py-3 px-4 text-left">
                          <Link
                            href={`/products/${prod.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold transition"
                          >
                            <span>تفاصيل اللوت</span>
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
