"use client";

import React from "react";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  title?: string;
}

export function ExportCsvButton({
  filename,
  headers,
  rows,
  title = "تصدير إلى Excel (CSV)",
}: ExportCsvButtonProps) {
  const handleExport = () => {
    // Escape CSV cell value
    const escapeCell = (val: string | number) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent =
      "\uFEFF" + // UTF-8 BOM for Arabic support in Excel
      [headers.map(escapeCell).join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join(
        "\r\n"
      );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 font-bold text-xs shadow-sm flex items-center gap-1.5 transition print:hidden"
    >
      <Download className="h-4 w-4 text-emerald-600" />
      <span>{title}</span>
    </button>
  );
}
