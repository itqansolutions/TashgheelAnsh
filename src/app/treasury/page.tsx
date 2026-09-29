import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Receipt,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function TreasuryPage() {
  const accounts = [
    {
      id: "cash-1",
      code: "TREASURY-01",
      name: "Main Cash Drawer",
      nameAr: "خزينة المركز الرئيسي النقدية",
      type: "CASH_DRAWER",
      balance: 65000.0,
      currency: "EGP",
      isActive: true,
    },
    {
      id: "bank-1",
      code: "BANK-01",
      name: "Commercial Bank Account",
      nameAr: "الحساب الجاري التجاري - بنك مصر",
      type: "BANK_ACCOUNT",
      balance: 420000.0,
      currency: "EGP",
      isActive: true,
    },
    {
      id: "petty-1",
      code: "PETTY-01",
      name: "Operations Petty Cash",
      nameAr: "عهدة المصروفات النثرية والمشال",
      type: "PETTY_CASH",
      balance: 8500.0,
      currency: "EGP",
      isActive: true,
    },
  ];

  const recentTransactions = [
    {
      id: "ftx-1",
      txNumber: "REC-2026-000001",
      date: "2026-05-20",
      account: "خزينة المركز الرئيسي",
      partner: "شركة الأهرام للتجارة (عميل)",
      type: "RECEIPT",
      amount: 5000.0,
      refDoc: "SAL-2026-000001",
    },
    {
      id: "ftx-2",
      txNumber: "PAY-2026-000001",
      date: "2026-05-15",
      account: "خزينة المركز الرئيسي",
      partner: "شركة النصر لتوريد الخامات (مورد)",
      type: "PAYMENT",
      amount: 30000.0,
      refDoc: "PUR-2026-000001",
    },
    {
      id: "ftx-3",
      txNumber: "PAY-2026-000002",
      date: "2026-05-12",
      account: "الحساب البنكي التجاري",
      partner: "مصروف إيجار المقر الإداري",
      type: "PAYMENT",
      amount: 15000.0,
      refDoc: "EXP-2026-000002",
    },
  ];

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">إدارة الخزائن والحسابات البنكية</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة السيولة النقدية، تدفقات المقبوضات والمدفوعات، وحركات الخزينة المقيدة بدفتر الأستاذ.
            </p>
          </div>
          <div className="text-left">
            <span className="text-xs text-slate-400 block">إجمالي السيولة النقدية المتاحة</span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(totalLiquidity)}
            </span>
          </div>
        </div>

        {/* Treasury Accounts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div key={acc.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                    {acc.type === "BANK_ACCOUNT" ? <Landmark className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{acc.nameAr}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{acc.code}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>نشط</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">الرصيد الفعلي الحالي</span>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {formatCurrency(acc.balance, acc.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Financial Transactions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">أحدث حركات المقبوضات وسندات الصرف</h3>
            <span className="text-xs text-slate-500">حركات مقيدة بحسابات الخزينة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">رقم السند</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">الحساب الخزني</th>
                  <th className="py-3 px-4">الطرف المعني / الشريك</th>
                  <th className="py-3 px-4">نوع الحركة</th>
                  <th className="py-3 px-4">المستند المرجعي</th>
                  <th className="py-3 px-4 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.txNumber}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{tx.date}</td>
                    <td className="py-3 px-4 text-slate-800">{tx.account}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tx.partner}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type === "RECEIPT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {tx.type === "RECEIPT" ? (
                          <>
                            <ArrowDownLeft className="h-3 w-3" />
                            <span>تحصيل مقبوضات (+)</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3 w-3" />
                            <span>صرف مدفوعات (-)</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-700 font-semibold">{tx.refDoc}</td>
                    <td className="py-3 px-4 text-left font-mono font-black text-sm">
                      <span className={tx.type === "RECEIPT" ? "text-emerald-600" : "text-rose-600"}>
                        {tx.type === "RECEIPT" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
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
