import React from "react";
import { QrCode } from "lucide-react";
import { CompanySettingsData } from "@/server/repositories/settingsRepository";

interface CompanyPrintFooterProps {
  settings: CompanySettingsData;
  signatures?: { title: string; subtitle?: string }[];
  showQr?: boolean;
  qrCaption?: string;
  customNote?: string;
}

export function CompanyPrintFooter({
  settings,
  signatures = [
    { title: "المستلم المعتمد", subtitle: "التوقيع والاستلام" },
    { title: "المحاسب المسؤول", subtitle: "المراجعة والتدقيق" },
    { title: "اعتماد الإدارة العامة", subtitle: "الختم والتصديق" },
  ],
  showQr = true,
  qrCaption = "ZATCA / ETA Verified",
  customNote,
}: CompanyPrintFooterProps) {
  return (
    <div className="pt-8 mt-8 border-t border-slate-300 text-xs">
      {/* Signatures & QR Section */}
      <div className="grid grid-cols-3 gap-6 items-center">
        {/* Slot 1: First Signature */}
        {signatures[0] && (
          <div className="text-center">
            <div className="text-slate-600 mb-8 font-bold">{signatures[0].title}</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 text-[11px] font-semibold text-slate-500">
              {signatures[0].subtitle || "التوقيع والاعتماد"}
            </div>
          </div>
        )}

        {/* Slot 2: QR Stamp or Center Signature */}
        {showQr ? (
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 border-2 border-slate-800 rounded-lg flex items-center justify-center bg-slate-50">
              <QrCode className="h-12 w-12 text-slate-900" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">{qrCaption}</span>
          </div>
        ) : signatures[1] ? (
          <div className="text-center">
            <div className="text-slate-600 mb-8 font-bold">{signatures[1].title}</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 text-[11px] font-semibold text-slate-500">
              {signatures[1].subtitle || "التوقيع والاعتماد"}
            </div>
          </div>
        ) : null}

        {/* Slot 3: Approval / Management */}
        {signatures[showQr ? 1 : 2] && (
          <div className="text-center">
            <div className="text-slate-600 mb-8 font-bold">{signatures[showQr ? 1 : 2].title}</div>
            <div className="border-t border-dashed border-slate-400 w-3/4 mx-auto pt-1 text-[11px] font-semibold text-slate-500">
              {signatures[showQr ? 1 : 2].subtitle || "الختم والاعتماد الرسمي"}
            </div>
          </div>
        )}
      </div>

      {/* Legal Disclaimer / Footer Note */}
      <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex items-center justify-between">
        <span>{customNote || settings.printFooterNotes || "تم استخراج هذا المستند آلياً من نظام TASHGHEEL TRADE"}</span>
        <span>{settings.nameEn} • {settings.website || "www.tashgheeltrade.com"}</span>
      </div>
    </div>
  );
}
