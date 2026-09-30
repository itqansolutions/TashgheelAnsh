import React from "react";
import { CompanySettingsData } from "@/server/repositories/settingsRepository";
import { Layers } from "lucide-react";

interface CompanyPrintHeaderProps {
  settings: CompanySettingsData;
  documentTitle: string;
  documentNumber: string;
  documentDate: string;
  dueDate?: string | null;
  badgeLabel?: string;
}

export function CompanyPrintHeader({
  settings,
  documentTitle,
  documentNumber,
  documentDate,
  dueDate,
  badgeLabel,
}: CompanyPrintHeaderProps) {
  return (
    <div className="border-b-2 border-slate-900 pb-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        {/* Company Identity & Logo */}
        <div className="flex items-start gap-4">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={settings.nameAr}
              className="h-16 w-auto max-w-[150px] object-contain shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm print:border print:border-slate-800">
              <Layers className="h-8 w-8 text-white" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-black text-slate-900">
                {settings.nameAr}
              </h1>
              {badgeLabel && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {badgeLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-tight">
              {settings.nameEn}
            </p>
            <div className="text-[11px] text-slate-600 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              {settings.commercialReg && (
                <span>س.ت: <strong className="font-mono">{settings.commercialReg}</strong></span>
              )}
              {settings.taxNumber && (
                <span>ب.ض / الرقم الضريبي: <strong className="font-mono">{settings.taxNumber}</strong></span>
              )}
              {settings.address && <span>{settings.address}</span>}
              {settings.phone && (
                <span dir="ltr">هاتف: {settings.phone}</span>
              )}
            </div>
            {settings.printHeaderNotes && (
              <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                {settings.printHeaderNotes}
              </p>
            )}
          </div>
        </div>

        {/* Document Reference Info */}
        <div className="text-left font-mono shrink-0">
          <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs mb-1.5 print:bg-slate-900 print:text-white">
            {documentTitle}
          </div>
          <div className="text-sm font-bold text-slate-900" dir="ltr">
            {documentNumber}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            تاريخ الإصدار: {documentDate}
          </div>
          {dueDate && (
            <div className="text-[11px] text-rose-600 font-bold mt-0.5">
              الاستحقاق: {dueDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
