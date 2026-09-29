import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { ArrowRight, Save, Layers, Package } from "lucide-react";

export default async function NewProductPage() {
  const categories = await MasterDataRepository.getCategories();
  const uoms = await MasterDataRepository.getUnitsOfMeasure();

  async function handleCreateProduct(formData: FormData) {
    "use server";
    const sku = formData.get("sku") as string;
    const nameAr = formData.get("nameAr") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const uomId = formData.get("uomId") as string;
    const itemType = formData.get("itemType") as any;
    const defaultSellingPrice = parseFloat(formData.get("defaultSellingPrice") as string) || 0;
    const minSellingPrice = parseFloat(formData.get("minSellingPrice") as string) || 0;
    const referenceCost = parseFloat(formData.get("referenceCost") as string) || 0;

    await MasterDataRepository.createProduct({
      sku,
      nameAr,
      name: name || nameAr,
      description,
      categoryId,
      uomId,
      itemType,
      defaultSellingPrice,
      minSellingPrice,
      referenceCost,
    });

    redirect("/products");
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/products" className="hover:text-indigo-600 transition">
                دليل الأصناف
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">صنف جديد</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">تعريف صنف / منتج جديد</h1>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        {/* Form Card */}
        <form action={handleCreateProduct} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود الصنف (SKU / Barcode) *
              </label>
              <input
                type="text"
                name="sku"
                required
                placeholder="مثال: RM-ALUM-01"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الصنف في دورة الإنتاج والتجارة *
              </label>
              <select
                name="itemType"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold"
              >
                <option value="RAW_MATERIAL">مادة خام أولية (Raw Material)</option>
                <option value="SEMI_FINISHED">منتج نصف مصنع (Semi-Finished)</option>
                <option value="FINISHED_PRODUCT">منتج تام الصنع للبيع (Finished Good)</option>
                <option value="SERVICE">خدمة تصنيع خارجية (Manufacturing Service)</option>
                <option value="OTHER">أخرى (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم الصنف باللغة العربية *
              </label>
              <input
                type="text"
                name="nameAr"
                required
                placeholder="مثال: قطاعات ألومنيوم معالجة 3 مم"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم الصنف بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                name="name"
                placeholder="Aluminum Extruded Profile 3mm"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                التصنيف الرئيسي *
              </label>
              <select
                name="categoryId"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                وحدة القياس الأساسية (UOM) *
              </label>
              <select
                name="uomId"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 font-semibold"
              >
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameAr} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>سياسة التسعير والتكلفة الاسترشادية</span>
              <span className="text-[10px] text-slate-500 font-normal">
                (ملاحظة: تكلفة المخزون الفعلية تُحتسب بدقة من كل باتش ولا تتأثر بالسعر الافتراضي)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  سعر البيع الافتراضي (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="defaultSellingPrice"
                  defaultValue="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  الحد الأدنى لسعر البيع (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="minSellingPrice"
                  defaultValue="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  التكلفة التقديرية الاسترشادية (EGP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="referenceCost"
                  defaultValue="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات أو مواصفات فنية
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="أي اشتراطات خاصة بالتخزين أو مواصفات الجودة..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <Save className="h-4 w-4" />
              <span>حفظ الصنف الجديد</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
