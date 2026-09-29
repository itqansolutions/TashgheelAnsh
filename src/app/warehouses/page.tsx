import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { Warehouse, Plus, MapPin, CheckCircle2 } from "lucide-react";

export default async function WarehousesPage() {
  const warehouses = await MasterDataRepository.getWarehouses();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">المستودعات ومراكز التخزين</h1>
            <p className="text-xs text-slate-500 mt-1">
              متابعة مواقع التخزين، أرصدة الباتشات بكل مخزن، وتجهيز الهيكل للفروع المتعددة.
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>إضافة مستودع جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh) => (
            <div key={wh.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                    <Warehouse className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{wh.nameAr}</h3>
                    <p className="text-xs font-mono text-indigo-600 font-semibold">{wh.code} • {wh.name}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>نشط</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{wh.address}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <Link
                  href={`/inventory?warehouseId=${wh.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  استعراض جرد وباتشات هذا المستودع ←
                </Link>
                <button className="text-slate-400 hover:text-slate-600 font-medium">
                  تعديل البيانات
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
