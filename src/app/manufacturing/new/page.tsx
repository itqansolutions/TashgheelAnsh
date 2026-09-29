import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { ManufacturingRepository } from "@/server/repositories/manufacturingRepository";
import { Factory, ArrowRight, Save } from "lucide-react";

export default async function NewManufacturingOrderPage() {
  const factories = await PartnersRepository.getPartners("FACTORY");
  const warehouses = await MasterDataRepository.getWarehouses();

  async function handleCreateOrder(formData: FormData) {
    "use server";
    const factoryId = formData.get("factoryId") as string;
    const warehouseId = formData.get("warehouseId") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const expectedCompletionDate = formData.get("expectedCompletionDate")
      ? new Date(formData.get("expectedCompletionDate") as string)
      : undefined;
    const notes = formData.get("notes") as string;

    const factory = factories.find((f) => f.id === factoryId);
    const warehouse = warehouses.find((w) => w.id === warehouseId);

    const created = await ManufacturingRepository.createOrder(
      {
        factoryId,
        warehouseId,
        startDate,
        expectedCompletionDate,
        notes,
      },
      factory?.nameAr || "مصنع خارجي",
      warehouse?.nameAr || "المستودع الرئيسي"
    );

    redirect(`/manufacturing/${created.id}`);
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/manufacturing" className="hover:text-indigo-600 transition">
                أوامر التصنيع
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">أمر تشغيل جديد</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">فتح أمر تصنيع وتشغيل خارجي لدى الغير</h1>
          </div>
          <Link
            href="/manufacturing"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        <form action={handleCreateOrder} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المصنع المنفذ / شريك التصنيع *
              </label>
              <select
                name="factoryId"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameAr} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مستودع صرف الخامات واستلام المخرجات *
              </label>
              <select
                name="warehouseId"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nameAr} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ بدء عملية التشغيل *
              </label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الانتهاء المتوقع
              </label>
              <input
                type="date"
                name="expectedCompletionDate"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات أمر التشغيل ومواصفات التشغيل
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="مثال: تشغيل صاج وتشكيل كبائن طبقاً لرسومات القطع المرفقة..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/manufacturing"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <Save className="h-4 w-4" />
              <span>فتح أمر التشغيل والبدء</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
