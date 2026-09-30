import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "@/server/permissions";
import { Users, Shield, Key, CheckCircle2, UserCheck, Lock } from "lucide-react";

export default function UsersPage() {
  const users = [
    {
      id: "u1",
      name: "مدير النظام العام (Admin)",
      email: "admin@enterprise.com",
      role: "ADMIN",
      roleAr: "مدير نظام عام",
      isActive: true,
      lastLogin: "الآن",
    },
    {
      id: "u2",
      name: "محمود عبد الرحمن",
      email: "accountant@enterprise.com",
      role: "ACCOUNTANT",
      roleAr: "محاسب مالي رئيسي",
      isActive: true,
      lastLogin: "أمس 14:30",
    },
    {
      id: "u3",
      name: "سامح إبراهيم",
      email: "sales@enterprise.com",
      role: "SALES",
      roleAr: "مسؤول مبيعات وعملاء",
      isActive: true,
      lastLogin: "منذ 3 ساعات",
    },
    {
      id: "u4",
      name: "طارق النجار",
      email: "warehouse@enterprise.com",
      role: "WAREHOUSE",
      roleAr: "أمين مخزن ومسؤول تشغيل",
      isActive: true,
      lastLogin: "منذ يومين",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">إدارة المستخدمين والأدوار (RBAC)</h1>
            <p className="text-xs text-slate-500 mt-1">
              التحكم في صلاحيات الوصول للمستودعات، دفاتر الأستاذ، وإذن البيع بأقل من التكلفة.
            </p>
          </div>
          <button className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm min-h-[44px] transition shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>

        {/* Users List: Mobile Cards (< sm) & Desktop Table (>= sm) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">قائمة مستخدمي النظام المعتمدين</h3>
            <span className="text-xs text-slate-500 font-medium font-mono">{users.length} مستخدمين</span>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{u.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    <span>نشط</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                    {u.roleAr}
                  </span>
                  <span className="text-[11px] text-slate-400">آخر نشاط: {u.lastLogin}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-6">المستخدم</th>
                  <th className="py-3 px-6">البريد الإلكتروني</th>
                  <th className="py-3 px-6">الدور الوظيفي</th>
                  <th className="py-3 px-6">الحالة</th>
                  <th className="py-3 px-6">آخر نشاط</th>
                  <th className="py-3 px-6 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-6 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        {u.roleAr} ({u.role})
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>نشط</span>
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-500">{u.lastLogin}</td>
                    <td className="py-3 px-6 text-left">
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold min-h-[36px]">
                        تعديل الصلاحيات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles & Permissions Reference */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">مصفوفة توزيع الصلاحيات القياسية (RBAC Matrix)</h3>
          </div>

          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">الوحدة / القسم</th>
                  <th className="py-2.5 px-3 text-center">مدير عام (ADMIN)</th>
                  <th className="py-2.5 px-3 text-center">محاسب (ACCOUNTANT)</th>
                  <th className="py-2.5 px-3 text-center">مبيعات (SALES)</th>
                  <th className="py-2.5 px-3 text-center">أمين مخزن (WAREHOUSE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">إدارة وشراء المخزون</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">كامل الصلاحيات</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">قراءة واعتماد مالي</td>
                  <td className="py-2.5 px-3 text-center text-slate-400 font-sans">استعلام الرصيد فقط</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">إدخال وصرف</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">أوامر التصنيع لدى الغير</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">كامل الصلاحيات</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">إثبات المصروفات والإقفال</td>
                  <td className="py-2.5 px-3 text-center text-slate-400 font-sans">غير متاح</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">صرف الخامات واستلام التام</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">البيع بأقل من التكلفة</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">متاح مع قيد تدقيق</td>
                  <td className="py-2.5 px-3 text-center text-rose-500 font-sans">غير متاح</td>
                  <td className="py-2.5 px-3 text-center text-rose-500 font-sans">يتطلب استثناء إداري</td>
                  <td className="py-2.5 px-3 text-center text-rose-500 font-sans">غير متاح</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">الدفاتر المحاسبية والتقارير</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">كامل الصلاحيات</td>
                  <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">كامل الصلاحيات</td>
                  <td className="py-2.5 px-3 text-center text-slate-400 font-sans">تقارير المبيعات الخاصة به</td>
                  <td className="py-2.5 px-3 text-center text-slate-400 font-sans">تقارير المخزون فقط</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
