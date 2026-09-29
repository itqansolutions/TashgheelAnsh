import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { Tag, Plus, ArrowRight, FolderTree } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await MasterDataRepository.getCategories();

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
              <span className="text-slate-800 font-bold">التصنيفات</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">تصنيفات المنتجات والخامات</h1>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للأصناف</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.nameAr}</h3>
                  <p className="text-xs font-mono text-slate-400">{c.code} • {c.name}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {c.count} أصناف
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
