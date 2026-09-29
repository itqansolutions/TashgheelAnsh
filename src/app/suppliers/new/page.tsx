import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { ArrowRight, Save, Users, Building2 } from "lucide-react";

export default function NewSupplierPage() {
  async function handleCreateSupplier(formData: FormData) {
    "use server";
    const code = formData.get("code") as string;
    const nameAr = formData.get("nameAr") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const mobile = formData.get("mobile") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const taxNumber = formData.get("taxNumber") as string;
    const openingBalance = parseFloat(formData.get("openingBalance") as string) || 0;
    const creditLimit = parseFloat(formData.get("creditLimit") as string) || 0;
    const paymentTermsDays = parseInt(formData.get("paymentTermsDays") as string, 10) || 30;
    const notes = formData.get("notes") as string;

    await PartnersRepository.createPartner({
      code,
      nameAr,
      name: name || nameAr,
      phone,
      mobile,
      email,
      address,
      taxNumber,
      isSupplier: true,
      isCustomer: false,
      isFactory: false,
      creditLimit,
      paymentTermsDays,
      openingBalance,
      notes,
    });

    redirect("/suppliers");
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/suppliers" className="hover:text-indigo-600 transition">
                إدارة الموردين
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">مورد جديد</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">تسجيل مورد / شركة توريد جديدة</h1>
          </div>
          <Link
            href="/suppliers"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        <form action={handleCreateSupplier} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود المورد المعياري *
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder="مثال: BP-SUP-02"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرقم الضريبي / السجل التجاري
              </label>
              <input
                type="text"
                name="taxNumber"
                placeholder="مثال: 100-245-890"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المورد باللغة العربية *
              </label>
              <input
                type="text"
                name="nameAr"
                required
                placeholder="مثال: الشركة الدولية للصناعات المعدنية"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المورد بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                name="name"
                placeholder="International Metals Supply Co."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهاتف الأساسي
              </label>
              <input
                type="text"
                name="phone"
                placeholder="+20233445566"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الموبايل / واتساب مسؤول المبيعات
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="+201001122334"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني التجاري
              </label>
              <input
                type="email"
                name="email"
                placeholder="sales@company.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرصيد الافتتاحي (دائن / مستحق للمورد)
              </label>
              <input
                type="number"
                step="0.01"
                name="openingBalance"
                defaultValue="0.00"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان المصنع / المستودع الرئيسي للمورد
            </label>
            <input
              type="text"
              name="address"
              placeholder="المنطقة الصناعية، العاشر من رمضان"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات وشروط الدفع والتوريد
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="مثال: شروط الدفع 50% مقدم و 50% عند التوريد..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/suppliers"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <Save className="h-4 w-4" />
              <span>تسجيل المورد</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
