import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function ExpensesPage() {
  const expenses = [
    {
      id: "exp-1",
      expenseNumber: "EXP-2026-000001",
      date: "2026-05-10",
      categoryName: "نقل ومشال ومناولة",
      classification: "MANUFACTURING",
      classificationLabel: "تكلفة تشغيل (أمر تصنيع)",
      amount: 2000.0,
      description: "شحن خامات صاج لمصنع الأمل",
      cashAccount: "خزينة المركز الرئيسي",
    },
    {
      id: "exp-2",
      expenseNumber: "EXP-2026-000002",
      date: "2026-05-12",
      categoryName: "إيجار ومرافق إدارية",
      classification: "GENERAL",
      classificationLabel: "مصروف إداري عام",
      amount: 15000.0,
      description: "سداد إيجار المقر الإداري الشهري",
      cashAccount: "الحساب البنكي التجاري",
    },
    {
      id: "exp-3",
      expenseNumber: "EXP-2026-000003",
      date: "2026-05-15",
      categoryName: "كهرباء وطاقة إنتاجية",
      classification: "GENERAL",
      classificationLabel: "مصروف مرافق عام",
      amount: 3500.0,
      description: "فاتورة كهرباء المستودع الرئيسي",
      cashAccount: "خزينة المركز الرئيسي",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة المصروفات والتكاليف التشغيلية</h1>
            <p className="text-xs text-slate-500 mt-1">
              تسجيل المصروفات العامة، تكاليف شحن ونقل التصنيع، وفصل المصروفات الرأسمالية عن المصاريف العمومية.
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم السند</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">بند المصروف</th>
                  <th className="py-3 px-4">التصنيف المحاسبي</th>
                  <th className="py-3 px-4">البيان والشرح</th>
                  <th className="py-3 px-4">الخزينة المنصرف منها</th>
                  <th className="py-3 px-4 text-left">المبلغ المصروف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{exp.categoryName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.classification === "MANUFACTURING"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {exp.classificationLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.cashAccount}</td>
                    <td className="py-3.5 px-4 text-left font-mono font-bold text-slate-900">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
