import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  FileText,
  ShoppingCart,
  Receipt,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  TrendingDown,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await PartnersRepository.getPartnerById(id);

  if (!supplier) {
    notFound();
  }

  const statement = await PartnersRepository.getStatement(id);

  async function handleRecordPayment(formData: FormData) {
    "use server";
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const ref = formData.get("referenceNumber") as string;
    const desc = formData.get("description") as string;

    if (amount > 0) {
      await PartnersRepository.recordPayment(id, amount, ref, desc);
    }
    redirect(`/suppliers/${id}`);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/suppliers" className="hover:text-indigo-600 transition">
                إدارة الموردين
              </Link>
              <span>/</span>
              <span className="font-mono text-indigo-600 font-bold">{supplier.code}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{supplier.nameAr}</h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{supplier.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/suppliers"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للموردين</span>
            </Link>
            <Link
              href={`/suppliers/${supplier.id}/statement`}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span>كشف حساب تفصيلي</span>
            </Link>
            <Link
              href={`/purchases/new?supplierId=${supplier.id}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>فاتورة شراء جديدة</span>
            </Link>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">الرصيد الجاري المستحق للمورد</span>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(supplier.currentBalance)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">التزام دائن مقيد بدفتر الأستاذ</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي المشتريات المعتمدة</span>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(supplier.totalPurchases || 0)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">إجمالي الفواتير الواردة</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي المسدد للمورد</span>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(supplier.totalPayments || 0)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">سندات صرف وخزينة معتمدة</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block mb-1">شروط الدفع المتفق عليها</span>
            <div className="text-2xl font-bold text-slate-800">
              {supplier.paymentTermsDays} يوم
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">فترة الائتمان المقررة</span>
          </div>
        </div>

        {/* Record Payment Section & Quick Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplier Info Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>بيانات الاتصال والتسجيل</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">الرقم الضريبي</span>
                <span className="font-mono font-semibold text-slate-800">{supplier.taxNumber || "غير مسجل"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الهاتف والموبايل</span>
                <div className="flex items-center gap-2 font-mono text-slate-800">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.phone || supplier.mobile || "—"}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">البريد الإلكتروني</span>
                <div className="flex items-center gap-2 text-slate-800">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{supplier.email || "—"}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">العنوان المعتمد</span>
                <div className="flex items-start gap-2 text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{supplier.address || "العنوان غير محدد"}</span>
                </div>
              </div>
              {supplier.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                  <span className="font-bold block mb-1 text-slate-700">ملاحظات:</span>
                  <span>{supplier.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Record Payment Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span>تسجيل سداد دفعة نقدية / بنكية للمورد</span>
            </h3>

            <form action={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المبلغ المسدد (EGP) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="amount"
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم إيصال الصرف / الشيك
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  defaultValue={`PAY-${Date.now().toString().slice(-6)}`}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  حساب السداد (الخزينة)
                </label>
                <select className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold">
                  <option>خزينة المركز الرئيسي (EGP)</option>
                  <option>الحساب البنكي التجاري</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  بيان السداد
                </label>
                <input
                  type="text"
                  name="description"
                  placeholder="سداد دفعة تحت حساب فواتير التوريد"
                  defaultValue="سداد دفعة تحت حساب التوريدات"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>اعتماد السداد المالي</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">أحدث القيود المقيدة بدفتر الأستاذ:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-3">التاريخ</th>
                      <th className="py-2 px-3">المستند</th>
                      <th className="py-2 px-3">البيان</th>
                      <th className="py-2 px-3">مدين (سداد)</th>
                      <th className="py-2 px-3">دائن (فاتورة)</th>
                      <th className="py-2 px-3">الرصيد بعد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {statement.slice(-4).reverse().map((entry) => (
                      <tr key={entry.id}>
                        <td className="py-2 px-3 text-slate-500">{entry.entryDate}</td>
                        <td className="py-2 px-3 font-mono font-bold text-indigo-600">{entry.referenceNumber}</td>
                        <td className="py-2 px-3 text-slate-700">{entry.description}</td>
                        <td className="py-2 px-3 text-emerald-600 font-bold">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </td>
                        <td className="py-2 px-3 text-rose-600 font-bold">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{formatCurrency(entry.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
