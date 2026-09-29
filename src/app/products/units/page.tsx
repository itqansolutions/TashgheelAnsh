import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { Scale, Plus, ArrowRight } from "lucide-react";

export default async function UnitsPage() {
  const uoms = await MasterDataRepository.getUnitsOfMeasure();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/products" className="hover:text-indigo-600 transition">
                دليل الأصناف
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">وحدات القياس</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">وحدات القياس والمعايرة الصناعية</h1>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للأصناف</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {uoms.map((u) => (
            <div key={u.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{u.nameAr}</h3>
              <p className="text-xs font-mono text-slate-400">{u.name} ({u.code})</p>
              <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                الرمز: {u.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
