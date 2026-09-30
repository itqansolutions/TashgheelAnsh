import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { ArrowRight, Save, Users, Building2 } from "lucide-react";

export default async function NewSupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const isCustomer = role === "customer";
  const isFactory = role === "factory";

  const title = isCustomer
    ? "تسجيل عميل جديد"
    : isFactory
    ? "تسجيل مصنع / ورشة تشغيل جديدة"
    : "تسجيل مورد / شركة توريد جديدة";

  const backUrl = isCustomer ? "/customers" : isFactory ? "/factories" : "/suppliers";
  const backLabel = isCustomer ? "العودة للعملاء" : isFactory ? "العودة للمصانع" : "العودة للموردين";

  async function handleCreatePartner(formData: FormData) {
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
    const partnerRole = formData.get("partnerRole") as string;

    await PartnersRepository.createPartner({
      code,
      nameAr,
      name: name || nameAr,
      phone,
      mobile,
      email,
      address,
      taxNumber,
      isSupplier: partnerRole === "supplier",
      isCustomer: partnerRole === "customer",
      isFactory: partnerRole === "factory",
      creditLimit,
      paymentTermsDays,
      openingBalance,
      notes,
    });

    if (partnerRole === "customer") {
      redirect("/customers");
    } else if (partnerRole === "factory") {
      redirect("/factories");
    } else {
      redirect("/suppliers");
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href={backUrl} className="hover:text-indigo-600 transition">
                {backLabel}
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">{title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
          </div>
          <Link
            href={backUrl}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm min-h-[44px] transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>إلغاء وعودة</span>
          </Link>
        </div>

        <form action={handleCreatePartner} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <input type="hidden" name="partnerRole" value={isCustomer ? "customer" : isFactory ? "factory" : "supplier"} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كود الحساب المعياري *
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder={isCustomer ? "مثال: CUST-01" : isFactory ? "مثال: FAC-01" : "مثال: SUP-01"}
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
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
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم باللغة العربية *
              </label>
              <input
                type="text"
                name="nameAr"
                required
                placeholder={isCustomer ? "مثال: مؤسسة النور للتجارة" : isFactory ? "مثال: مصنع الأمل للتشغيل" : "مثال: الشركة الدولية للصناعات"}
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                name="name"
                placeholder="International Trading Co."
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-sans min-h-[44px]"
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
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الموبايل / واتساب
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="+201001122334"
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني التجاري
              </label>
              <input
                type="email"
                name="email"
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الرصيد الافتتاحي (EGP)
              </label>
              <input
                type="number"
                step="0.01"
                name="openingBalance"
                defaultValue="0.00"
                className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              العنوان المعتمد
            </label>
            <input
              type="text"
              name="address"
              placeholder="المنطقة الصناعية، القاهرة"
              className="w-full px-3.5 py-2.5 text-sm sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات وشروط التعامل
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="مثال: شروط الدفع والائتمان..."
              className="w-full px-3.5 py-2 text-sm sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href={backUrl}
              className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition flex items-center min-h-[44px]"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition min-h-[44px]"
            >
              <Save className="h-4 w-4" />
              <span>حفظ الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
