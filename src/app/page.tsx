"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  TrendingUp,
  BadgeDollarSign,
  Package,
  Factory,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  ChevronLeft,
  Layers,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "traceability">("overview");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-medium">
                الإصدار الإنتاجي 1.0
              </span>
              <span className="text-xs text-slate-400">آخر تحديث: قبل دقيقة</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              مركز الرقابة الإدارية والتصنيع المشترك
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              متابعة دقيقة للتوريدات، استهلاك الخامات بالباتشات، تكلفة أوامر التشغيل، وحماية هوامش الربحية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/manufacturing/new"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              <Factory className="h-4 w-4" />
              <span>أمر تشغيل جديد</span>
            </Link>
            <Link
              href="/sales/new"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <BadgeDollarSign className="h-4 w-4" />
              <span>فاتورة بيع وتخصيص باتش</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            المؤشرات المالية والتشغيلية
          </button>
          <button
            onClick={() => setActiveTab("traceability")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition ${
              activeTab === "traceability"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            سلسلة التتبع الشامل (Traceability Map)
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* KPI Cards Grid (2 columns on mobile, 4 columns on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {/* 1. Sales Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold">إجمالي المبيعات</span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">425,800 ج</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="truncate">38 فاتورة معتمدة</span>
                </div>
              </div>

              {/* 2. Realized Profit Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold">مجمل الربح التجاري</span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <BadgeDollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">118,450 ج</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-indigo-600 font-medium">
                  <span>هامش الربح: 27.8%</span>
                </div>
              </div>

              {/* 3. Batch Inventory Value */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold">تقييم المخزون</span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">682,100 ج</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-amber-600 font-medium">
                  <span>14 باتش نشط بالمخزن</span>
                </div>
              </div>

              {/* 4. Open Manufacturing Orders */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold">أوامر التصنيع</span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-sky-50 text-sky-600">
                    <Factory className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="text-base sm:text-2xl font-bold text-slate-900 font-mono">3 جارية</div>
                <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-sky-600 font-medium">
                  <span className="truncate">تكلفة: 145,000 ج</span>
                </div>
              </div>
            </div>

            {/* Balances & Payables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Receivables */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <ArrowDownLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">مستحقات العملاء المدينة (Receivables)</h3>
                      <p className="text-xs text-slate-500">حسابات جارية وفق قيود دفتر الأستاذ</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-extrabold text-slate-900">185,200.00 EGP</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 mt-3 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">شركة الأهرام للتجارة والمقاولات</p>
                      <p className="text-slate-400">فاتورة SAL-2026-000008 • استحقاق خلال 5 أيام</p>
                    </div>
                    <span className="font-bold text-slate-900">75,000.00 EGP</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">مؤسسة النور الهندسية</p>
                      <p className="text-rose-500 font-medium">متأخرة 12 يوم • تنبيه تحصيل</p>
                    </div>
                    <span className="font-bold text-rose-600">42,500.00 EGP</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">الشركة الدولية للمشروعات</p>
                      <p className="text-slate-400">فاتورة SAL-2026-000012</p>
                    </div>
                    <span className="font-bold text-slate-900">67,700.00 EGP</span>
                  </div>
                </div>
              </div>

              {/* Supplier & Factory Payables */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">التزامات الموردين والمصانع (Payables)</h3>
                      <p className="text-xs text-slate-500">فواتير توريد ومصاريف تشغيل غير مسددة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-extrabold text-slate-900">240,000.00 EGP</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 mt-3 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">مصنع الأمل للصناعات الهندسية (تشغيل)</p>
                      <p className="text-slate-400">أتعاب تشغيل أمر MFG-2026-000004</p>
                    </div>
                    <span className="font-bold text-slate-900">35,000.00 EGP</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">شركة النصر لتوريد الخامات (مورد)</p>
                      <p className="text-slate-400">فاتورة PUR-2026-000005 • استحقاق خلال 15 يوم</p>
                    </div>
                    <span className="font-bold text-slate-900">145,000.00 EGP</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">المتحدة لخدمات النقل واللوجستيات</p>
                      <p className="text-slate-400">مصاريف نقل خامات التصنيع</p>
                    </div>
                    <span className="font-bold text-slate-900">12,000.00 EGP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Batches and Outsourced Orders Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">تشغيلات الباتش النشطة بالمخازن وتكلفتها</h3>
                  <p className="text-xs text-slate-500">
                    كل كمية تحتفظ بتكلفتها المستقلة دون دمج بمتوسط سعري
                  </p>
                </div>
                <Link
                  href="/inventory"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                >
                  <span>عرض تقرير الجرد الكامل</span>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>

              {/* Mobile Card View (sm:hidden) */}
              <div className="sm:hidden divide-y divide-slate-100">
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-600">BAT-2026-000001</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      توريد PUR-001
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">لفائف صاج معالج 2 مم</p>
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المتاح</span>
                      <span className="font-bold text-emerald-600">300 كجم</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الوحدة</span>
                      <span className="text-slate-700">80.00 ج</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">إجمالي القيمة</span>
                      <span className="font-bold text-slate-900">24,000 ج</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-600">BAT-2026-000002</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      تصنيع MFG-001
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">هيكل كابينة نصف مجمع</p>
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المتاح</span>
                      <span className="font-bold text-emerald-600">120 ق</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الوحدة</span>
                      <span className="text-slate-700">185.00 ج</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">إجمالي القيمة</span>
                      <span className="font-bold text-slate-900">22,200 ج</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-600">BAT-2026-000003</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      تصنيع MFG-002
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">لوحة توزيع كهربائية قياسية</p>
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المتاح</span>
                      <span className="font-bold text-emerald-600">35 ق</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الوحدة</span>
                      <span className="text-slate-700">520.00 ج</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">إجمالي القيمة</span>
                      <span className="font-bold text-slate-900">18,200 ج</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Table View (hidden sm:block) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 rounded-r-lg">رقم الباتش</th>
                      <th className="py-2.5 px-4">الصنف</th>
                      <th className="py-2.5 px-4">المصدر</th>
                      <th className="py-2.5 px-4">الكمية الواردة</th>
                      <th className="py-2.5 px-4">الرصيد المتاح</th>
                      <th className="py-2.5 px-4">تكلفة الوحدة</th>
                      <th className="py-2.5 px-4 rounded-l-lg">إجمالي قيمة اللوت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">BAT-2026-000001</td>
                      <td className="py-3 px-4 text-slate-900">لفائف صاج معالج 2 مم</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                          فاتورة توريد PUR-001
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">500 كجم</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">300 كجم</td>
                      <td className="py-3 px-4 text-slate-900">80.00 EGP</td>
                      <td className="py-3 px-4 font-bold text-slate-900">24,000.00 EGP</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">BAT-2026-000002</td>
                      <td className="py-3 px-4 text-slate-900">هيكل كابينة نصف مجمع</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                          تصنيع أمر MFG-001
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">120 ق</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">120 ق</td>
                      <td className="py-3 px-4 text-slate-900">185.00 EGP</td>
                      <td className="py-3 px-4 font-bold text-slate-900">22,200.00 EGP</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">BAT-2026-000003</td>
                      <td className="py-3 px-4 text-slate-900">لوحة توزيع كهربائية قياسية</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                          تصنيع أمر MFG-002
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">50 ق</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">35 ق</td>
                      <td className="py-3 px-4 text-slate-900">520.00 EGP</td>
                      <td className="py-3 px-4 font-bold text-slate-900">18,200.00 EGP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Traceability Explorer Tab */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                سلسلة التتبع الكاملة: من التوريد إلى سداد العميل
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تتبع مسار أي صنف مصنع أو مباع وصولاً إلى خاماته ومصانعه وفواتير شرائه الأصلية.
              </p>
            </div>

            {/* Visual Node Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة 1</span>
                <p className="text-xs font-bold text-slate-800">توريد الخامات</p>
                <p className="text-[11px] text-slate-500 mt-1">شركة النصر للخامات</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">
                  PUR-2026-000001
                </span>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة 2</span>
                <p className="text-xs font-bold text-slate-800">باتش المادة الخام</p>
                <p className="text-[11px] text-slate-500 mt-1">تكلفة 80.00 EGP / كجم</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                  BAT-2026-000001
                </span>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة 3</span>
                <p className="text-xs font-bold text-slate-800">التشغيل لدى الغير</p>
                <p className="text-[11px] text-slate-500 mt-1">مصنع الأمل الهندسي</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-700 text-[10px] font-semibold">
                  MFG-2026-000002
                </span>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة 4</span>
                <p className="text-xs font-bold text-slate-800">باتش المنتج التام</p>
                <p className="text-[11px] text-slate-500 mt-1">تكلفة محتسبة: 520 EGP</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                  BAT-2026-000003
                </span>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">المرحلة 5</span>
                <p className="text-xs font-bold text-slate-800">البيع للعميل</p>
                <p className="text-[11px] text-slate-500 mt-1">شركة الأهرام للتجارة</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">
                  SAL-2026-000008
                </span>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 relative">
                <span className="text-[10px] font-bold text-emerald-600 block mb-1">المرحلة 6</span>
                <p className="text-xs font-bold text-emerald-950">التحصيل المالي</p>
                <p className="text-[11px] text-emerald-700 mt-1">قيد دفتر الأستاذ</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold">
                  REC-2026-000003
                </span>
              </div>
            </div>

            {/* Proof of Lineage Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
              <div className="text-slate-400 font-semibold mb-2">// تقرير المطابقة المحاسبية لسلسلة التوريد والتصنيع</div>
              <p>✔ سعر البيع النهائي: 850.00 EGP | تكلفة الباتش الفعلية: 520.00 EGP</p>
              <p>✔ مجمل الربح المحقق للوحدة: +330.00 EGP (هامش 38.8%)</p>
              <p>✔ الخامات المستهلكة: 2.5 كجم صاج (باتش BAT-001) + أتعاب مصنع 210 EGP + شحن 30 EGP</p>
              <p>✔ حالة الحساب: تم قيد مديونية العميل وإيداع التحصيل بالخزينة الرئيسية</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
