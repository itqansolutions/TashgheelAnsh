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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة المستخدمين والأدوار (RBAC)</h1>
            <p className="text-xs text-slate-500 mt-1">
              التحكم في صلاحيات الوصول للمستودعات، دفاتر الأستاذ، وإذن البيع بأقل من التكلفة.
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">قائمة مستخدمي النظام المعتمدين</h3>
            <span className="text-xs text-slate-500 font-medium">إجمالي {users.length} مستخدمين</span>
          </div>

          <div className="overflow-x-auto">
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
                      <button className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        تعديل الصلاحيات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles & Permissions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(DEFAULT_ROLE_PERMISSIONS).slice(0, 3).map(([roleName, perms]) => (
            <div key={roleName} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <span>دور: {roleName}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                عدد الصلاحيات الممنوحة: {perms.length} صلاحية
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {perms.slice(0, 8).map((p) => (
                  <div key={p} className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{p}</span>
                  </div>
                ))}
                {perms.length > 8 && (
                  <p className="text-[11px] text-slate-400 font-medium">+ {perms.length - 8} صلاحية أخرى...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
