import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 text-center">
      <div className="p-4 rounded-full bg-rose-100 text-rose-600 mb-4 shadow-lg shadow-rose-600/10">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
        غير مصرح بالدخول أو الإجراء (403 Unauthorized)
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        ليس لديك الصلاحية الكافية للوصول إلى هذه الشاشة أو تنفيذ هذا الأمر المالي/التشغيلي.
        يرجى التواصل مع مسؤول النظام لمنح الصلاحيات المناسبة لحسابك.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
      >
        <span>العودة إلى لوحة التحكم الرئيسية</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
