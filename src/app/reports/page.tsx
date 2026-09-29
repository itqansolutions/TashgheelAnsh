import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ReportsRepository } from "@/server/repositories/reportsRepository";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "@/components/ui/PrintButton";
import { ExportCsvButton } from "@/components/ui/ExportCsvButton";
import {
  FileSpreadsheet,
  Users,
  Package,
  Layers,
  Factory,
  BadgeDollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  CheckCircle2,
  ChevronLeft,
  Building2,
  Receipt,
  Boxes,
  FileCheck,
} from "lucide-react";

interface ReportsPageProps {
  searchParams: Promise<{
    tab?: string;
    partnerId?: string;
    warehouseId?: string;
    productId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { tab = "inventory-valuation", partnerId, warehouseId, productId, fromDate, toDate, search } =
    await searchParams;

  const tabs = [
    { id: "inventory-valuation", name: "تقييم المخزون بالباتشات", icon: Package, category: "المخزون" },
    { id: "batch-cost-history", name: "سجل تكاليف الباتشات", icon: Layers, category: "المخزون" },
    { id: "supplier-statement", name: "كشف حساب مورد", icon: Users, category: "الشركاء والمالية" },
    { id: "customer-statement", name: "كشف حساب عميل", icon: Users, category: "الشركاء والمالية" },
    { id: "receivables-aging", name: "أعمار ديون العملاء", icon: Clock, category: "الشركاء والمالية" },
    { id: "payables-aging", name: "أعمار مستحقات الموردين", icon: Clock, category: "الشركاء والمالية" },
    { id: "overdue", name: "الحسابات المتجاوزة", icon: AlertTriangle, category: "الشركاء والمالية" },
    { id: "manufacturing-cost", name: "تحليل تكاليف التصنيع", icon: Factory, category: "التصنيع" },
    { id: "factory-performance", name: "أداء مصانع التشغيل", icon: Building2, category: "التصنيع" },
    { id: "sales-by-product", name: "مبيعات وهوامش المنتجات", icon: TrendingUp, category: "المبيعات" },
    { id: "gross-profit", name: "الأرباح الإجمالية والبيع دون التكلفة", icon: BadgeDollarSign, category: "المبيعات" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">مركز التقارير المحاسبية والتشغيلية</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                تقارير التكلفة اللحظية، دفاتر الأستاذ، كشوفات الحسابات، تحليلات هوامش الربح وأعمار الديون.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PrintButton label="طباعة التقرير (A4)" />
          </div>
        </div>

        {/* Tab Selector Pills (Categorized) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/reports?tab=${t.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{t.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dynamic Report Content Rendering based on Tab */}
        {tab === "inventory-valuation" && <InventoryValuationReport warehouseId={warehouseId} search={search} />}
        {tab === "batch-cost-history" && <BatchCostHistoryReport productId={productId} search={search} />}
        {tab === "supplier-statement" && <SupplierStatementReport partnerId={partnerId} fromDate={fromDate} toDate={toDate} />}
        {tab === "customer-statement" && <CustomerStatementReport partnerId={partnerId} fromDate={fromDate} toDate={toDate} />}
        {tab === "receivables-aging" && <ReceivablesAgingReport />}
        {tab === "payables-aging" && <PayablesAgingReport />}
        {tab === "overdue" && <OverdueAccountsReport />}
        {tab === "manufacturing-cost" && <ManufacturingCostReport />}
        {tab === "factory-performance" && <FactoryPerformanceReport />}
        {tab === "sales-by-product" && <SalesByProductReport fromDate={fromDate} toDate={toDate} />}
        {tab === "gross-profit" && <GrossProfitReport fromDate={fromDate} toDate={toDate} />}
      </div>
    </AppShell>
  );
}

/**
 * 1. Inventory Valuation Component
 */
async function InventoryValuationReport({ warehouseId, search }: { warehouseId?: string; search?: string }) {
  const { rows, summary } = await ReportsRepository.getInventoryValuation(warehouseId, search);

  const csvHeaders = ["رقم الباتش", "اسم الصنف", "كود الصنف SKU", "المستودع", "الرصيد المتبقي", "تكلفة الوحدة", "إجمالي التقييم", "أيام في المخزن", "مصدر الباتش"];
  const csvRows = rows.map((r) => [r.batchNumber, r.productName, r.productSku, r.warehouseName, r.remainingQuantity, r.unitCost, r.totalValuation, r.daysInStock, r.sourceType]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي تقييم المخزون المتبقي</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">{formatCurrency(summary.totalValuation)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">بالتكلفة الفعلية المحددة للباتشات</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الكميات المخزنية</span>
          <div className="text-2xl font-bold font-mono text-slate-800">{summary.totalQuantity.toLocaleString()} وحدة</div>
          <span className="text-[11px] text-slate-400 mt-1 block">رصيد متاح للاستخدام أو البيع</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">عدد الباتشات المسجلة</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{summary.totalBatches} باتش</div>
          <span className="text-[11px] text-slate-400 mt-1 block">تتبع تفصيلي فردي لكل تشغيلة</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value="inventory-valuation" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="بحث برقم الباتش أو اسم الصنف..."
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 w-64"
          />
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800">
            تصفية
          </button>
        </form>
        <ExportCsvButton filename="تقرير_تقييم_المخزون" headers={csvHeaders} rows={csvRows} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">كشف تقييم المخزون المتبقي لكل باتش (Specific Batch Valuation)</h2>
          <span className="text-xs text-slate-400 font-mono">تاريخ التقرير: {new Date().toLocaleDateString("ar-EG")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">رقم الباتش</th>
                <th className="py-3 px-4">الصنف</th>
                <th className="py-3 px-4">المستودع</th>
                <th className="py-3 px-4 text-center">الرصيد المتبقي</th>
                <th className="py-3 px-4 text-left">تكلفة الوحدة</th>
                <th className="py-3 px-4 text-left">إجمالي التقييم</th>
                <th className="py-3 px-4 text-center">أيام بالمخزن</th>
                <th className="py-3 px-4">المصدر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    <Link href={`/inventory/batches/${r.batchNumber}`} className="hover:underline">
                      {r.batchNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{r.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{r.productSku}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.warehouseName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{r.remainingQuantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-left font-mono text-slate-700">{formatCurrency(r.unitCost)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-indigo-700">{formatCurrency(r.totalValuation)}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{r.daysInStock} يوم</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.sourceType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Batch Cost History Component
 */
async function BatchCostHistoryReport({ productId, search }: { productId?: string; search?: string }) {
  const { rows } = await ReportsRepository.getBatchCostHistory(productId, search);

  const csvHeaders = ["رقم الباتش", "الصنف", "المصدر", "تكلفة الخامات", "أجور المصنعية", "المصروفات", "إجمالي التكلفة", "الكمية المنتجة", "تكلفة الوحدة المحسوبة"];
  const csvRows = rows.map((r) => [r.batchNumber, r.productName, r.origin, r.rawMaterialCost, r.factoryCharges, r.expenses, r.totalCost, r.quantity, r.landedUnitCost]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value="batch-cost-history" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="بحث برقم الباتش أو اسم الصنف..."
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 w-64"
          />
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800">
            تصفية
          </button>
        </form>
        <ExportCsvButton filename="سجل_تكاليف_الباتشات" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">سجل تكوين التكلفة الفعلية لكل باتش (Landed Cost Breakdown)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">رقم الباتش</th>
                <th className="py-3 px-4">الصنف</th>
                <th className="py-3 px-4">مصدر الباتش</th>
                <th className="py-3 px-4 text-left">تكلفة الخامات</th>
                <th className="py-3 px-4 text-left">أجور المصنعية</th>
                <th className="py-3 px-4 text-left">المصروفات</th>
                <th className="py-3 px-4 text-left">إجمالي التكلفة</th>
                <th className="py-3 px-4 text-center">الكمية</th>
                <th className="py-3 px-4 text-left">تكلفة الوحدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.batchNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.productName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.origin === "MANUFACTURING" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                      {r.origin === "MANUFACTURING" ? "تشغيل لدى الغير" : "شراء وتوريد"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.rawMaterialCost)}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.factoryCharges)}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.expenses)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.totalCost)}</td>
                  <td className="py-3 px-4 text-center font-mono">{r.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-indigo-700">{formatCurrency(r.landedUnitCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Supplier Statement Component
 */
async function SupplierStatementReport({ partnerId, fromDate, toDate }: { partnerId?: string; fromDate?: string; toDate?: string }) {
  const result = await ReportsRepository.getSupplierStatement(partnerId, fromDate, toDate);
  const { supplier, suppliersList = [], rows = [], totalDebit = 0, totalCredit = 0, netBalance = 0 } = result;

  const csvHeaders = ["التاريخ", "النوع", "المرجع", "البيان والتفاصيل", "مدين (لنا)", "دائن (للمورد)", "الرصيد التراكمي"];
  const csvRows = rows.map((r) => [r.date, r.referenceType, r.referenceNumber, r.description, r.debit, r.credit, r.balanceAfter]);

  return (
    <div className="space-y-6">
      {/* Partner Selector & Date Filter */}
      <form className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <input type="hidden" name="tab" value="supplier-statement" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">المورد:</span>
          <select name="partnerId" defaultValue={supplier?.id || ""} className="px-3 py-1.5 text-xs rounded-xl border border-slate-300">
            {suppliersList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">من:</span>
          <input type="date" name="fromDate" defaultValue={fromDate || ""} className="px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">إلى:</span>
          <input type="date" name="toDate" defaultValue={toDate || ""} className="px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono" />
        </div>
        <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800">
          عرض كشف الحساب
        </button>
        <div className="mr-auto">
          <ExportCsvButton filename="كشف_حساب_مورد" headers={csvHeaders} rows={csvRows} />
        </div>
      </form>

      {/* Supplier Summary Cards */}
      {supplier && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">الرصيد القائم المستحق للمورد</span>
            <div className="text-2xl font-bold font-mono text-rose-600">{formatCurrency(netBalance)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">التزام دائن مقيد بالدفاتر</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الفواتير الدائنة</span>
            <div className="text-2xl font-bold font-mono text-slate-800">{formatCurrency(totalCredit)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">توريدات مشتريات معتمدة</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي المدفوعات المسددة</span>
            <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(totalDebit)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">سندات صرف وخزينة</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">كشف حساب المورد التفصيلي (Supplier Statement of Account)</h2>
            <p className="text-xs text-slate-400 mt-0.5">{supplier?.code} • {supplier?.nameAr}</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">طريقة الحساب: Running Balance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">رقم السند</th>
                <th className="py-3 px-4">البيان</th>
                <th className="py-3 px-4 text-left">مدين (سداد)</th>
                <th className="py-3 px-4 text-left">دائن (فاتورة)</th>
                <th className="py-3 px-4 text-left">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono">{r.date}</td>
                  <td className="py-3 px-4 font-bold">{r.referenceType}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.referenceNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{r.description}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-600">{r.debit > 0 ? formatCurrency(r.debit) : "—"}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{r.credit > 0 ? formatCurrency(r.credit) : "—"}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 4. Customer Statement Component
 */
async function CustomerStatementReport({ partnerId, fromDate, toDate }: { partnerId?: string; fromDate?: string; toDate?: string }) {
  const result = await ReportsRepository.getCustomerStatement(partnerId, fromDate, toDate);
  const { customer, customersList = [], rows = [], totalDebit = 0, totalCredit = 0, netBalance = 0 } = result;

  const csvHeaders = ["التاريخ", "النوع", "المرجع", "البيان والتفاصيل", "مدين (فاتورة)", "دائن (تحصيل)", "الرصيد التراكمي"];
  const csvRows = rows.map((r) => [r.date, r.referenceType, r.referenceNumber, r.description, r.debit, r.credit, r.balanceAfter]);

  return (
    <div className="space-y-6">
      <form className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <input type="hidden" name="tab" value="customer-statement" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">العميل:</span>
          <select name="partnerId" defaultValue={customer?.id || ""} className="px-3 py-1.5 text-xs rounded-xl border border-slate-300">
            {customersList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.nameAr}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">من:</span>
          <input type="date" name="fromDate" defaultValue={fromDate || ""} className="px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">إلى:</span>
          <input type="date" name="toDate" defaultValue={toDate || ""} className="px-3 py-1 text-xs rounded-xl border border-slate-300 font-mono" />
        </div>
        <button type="submit" className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800">
          عرض كشف الحساب
        </button>
        <div className="mr-auto">
          <ExportCsvButton filename="كشف_حساب_عميل" headers={csvHeaders} rows={csvRows} />
        </div>
      </form>

      {customer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">المديونية القائمة على العميل</span>
            <div className="text-2xl font-bold font-mono text-indigo-700">{formatCurrency(netBalance)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">رصيد مدين مستحق التحصيل</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي المبيعات الآجلة</span>
            <div className="text-2xl font-bold font-mono text-slate-800">{formatCurrency(totalDebit)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">فواتير مبيعات صادرة</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي التحصيلات المقبوضة</span>
            <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(totalCredit)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">سندات قبض وخزينة</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800">كشف حساب العميل التفصيلي (Customer Statement)</h2>
            <p className="text-xs text-slate-400 mt-0.5">{customer?.code} • {customer?.nameAr}</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">طريقة الحساب: Running Balance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4">نوع الحركة</th>
                <th className="py-3 px-4">رقم السند</th>
                <th className="py-3 px-4">البيان</th>
                <th className="py-3 px-4 text-left">مدين (فاتورة)</th>
                <th className="py-3 px-4 text-left">دائن (تحصيل)</th>
                <th className="py-3 px-4 text-left">الرصيد التراكمي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono">{r.date}</td>
                  <td className="py-3 px-4 font-bold">{r.referenceType}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.referenceNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{r.description}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{r.debit > 0 ? formatCurrency(r.debit) : "—"}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-600">{r.credit > 0 ? formatCurrency(r.credit) : "—"}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Manufacturing Cost Analysis
 */
async function ManufacturingCostReport() {
  const { rows, summary } = await ReportsRepository.getManufacturingCostAnalysis();

  const csvHeaders = ["رقم الأمر", "المصنع المنفذ", "تاريخ البدء", "الحالة", "تكلفة الخامات", "أتعاب المصنع", "المصروفات", "إجمالي التكلفة", "الكمية المنتجة", "تكلفة الوحدة", "نسبة الإنتاجية %"];
  const csvRows = rows.map((r) => [r.orderNumber, r.factoryName, r.startDate, r.status, r.materialCost, r.factoryCost, r.expenseCost, r.totalCost, r.outputQuantity, r.costPerUnit, r.yieldPct]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي تكاليف أوامر التصنيع</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">{formatCurrency(summary.totalCostAll)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">خامات + أتعاب مصانع + مصاريف</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الوحدات تامة الصنع</span>
          <div className="text-2xl font-bold font-mono text-slate-800">{summary.totalOutputsAll.toLocaleString()} وحدة</div>
          <span className="text-[11px] text-slate-400 mt-1 block">محولة من خامات إلى منتجات تامة</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">متوسط تكلفة الوحدة المصنعة</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(summary.avgCostPerUnit)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">شامل التكاليف المباشرة وغير المباشرة</span>
        </div>
      </div>

      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="تحليل_تكاليف_التصنيع" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">تحليل تكاليف أوامر التصنيع لدى الغير (Outsourced Manufacturing Cost Analysis)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">رقم الأمر</th>
                <th className="py-3 px-4">المصنع</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-left">تكلفة الخامات</th>
                <th className="py-3 px-4 text-left">أتعاب المصنع</th>
                <th className="py-3 px-4 text-left">مصروفات إضافية</th>
                <th className="py-3 px-4 text-left">إجمالي التكلفة</th>
                <th className="py-3 px-4 text-center">الكمية الناتجة</th>
                <th className="py-3 px-4 text-left">تكلفة الوحدة</th>
                <th className="py-3 px-4 text-center">كفاءة الإنتاج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    <Link href={`/manufacturing`} className="hover:underline">
                      {r.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.factoryName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.materialCost)}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.factoryCost)}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.expenseCost)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.totalCost)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{r.outputQuantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-indigo-700">{formatCurrency(r.costPerUnit)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">{r.yieldPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 6. Factory Performance Component
 */
async function FactoryPerformanceReport() {
  const { rows } = await ReportsRepository.getFactoryPerformance();

  const csvHeaders = ["كود المصنع", "اسم المصنع", "إجمالي الأوامر", "أوامر مكتملة", "أوامر قيد التشغيل", "إجمالي الأتعاب المستحقة", "المسدد للمصنع", "المتبقي للمصنع"];
  const csvRows = rows.map((r) => [r.factoryCode, r.factoryName, r.totalOrders, r.completedOrders, r.inProgressOrders, r.totalChargesIncurred, r.totalChargesPaid, r.outstandingBalance]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="أداء_مصانع_التشغيل" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">مؤشرات أداء ومستحقات مصانع التشغيل للغير (Factory Performance)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">كود المصنع</th>
                <th className="py-3 px-4">اسم المصنع</th>
                <th className="py-3 px-4 text-center">أوامر الإنتاج</th>
                <th className="py-3 px-4 text-center">مكتملة</th>
                <th className="py-3 px-4 text-center">جارية</th>
                <th className="py-3 px-4 text-left">إجمالي الأتعاب المقيدة</th>
                <th className="py-3 px-4 text-left">المسدد للمصنع</th>
                <th className="py-3 px-4 text-left">المتبقي له (دائن)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.factoryCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.factoryName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{r.totalOrders}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-600 font-bold">{r.completedOrders}</td>
                  <td className="py-3 px-4 text-center font-mono text-amber-600 font-bold">{r.inProgressOrders}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.totalChargesIncurred)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-600">{formatCurrency(r.totalChargesPaid)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{formatCurrency(r.outstandingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 7. Sales by Product Component
 */
async function SalesByProductReport({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const { rows, summary } = await ReportsRepository.getSalesByProduct(fromDate, toDate);

  const csvHeaders = ["كود الصنف", "اسم الصنف", "الكمية المباعة", "إجمالي الإيراد", "تكلفة البضاعة المباعة COGS", "إجمالي الربح", "هامش الربح %"];
  const csvRows = rows.map((r) => [r.productSku, r.productName, r.unitsSold, r.totalRevenue, r.totalCogs, r.grossProfit, r.marginPct.toFixed(2)]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي إيراد المبيعات</span>
          <div className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(summary.totalRevenue)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">تكلفة البضاعة المباعة (COGS)</span>
          <div className="text-2xl font-bold font-mono text-slate-600">{formatCurrency(summary.totalCogs)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">مجمل الربح التجاري</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(summary.totalGrossProfit)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">متوسط هامش الربح</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">{summary.overallMargin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="مبيعات_المنتجات_والأرباح" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">تقرير مبيعات وهوامش ربحية الأصناف (Sales & Margins by Product)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">كود الصنف SKU</th>
                <th className="py-3 px-4">اسم الصنف</th>
                <th className="py-3 px-4 text-center">الكمية المباعة</th>
                <th className="py-3 px-4 text-left">إجمالي الإيراد</th>
                <th className="py-3 px-4 text-left">تكلفة المبيعات COGS</th>
                <th className="py-3 px-4 text-left">مجمل الربح</th>
                <th className="py-3 px-4 text-center">هامش الربح %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.productSku}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.productName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{r.unitsSold.toLocaleString()}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.totalRevenue)}</td>
                  <td className="py-3 px-4 text-left font-mono text-slate-600">{formatCurrency(r.totalCogs)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-600">{formatCurrency(r.grossProfit)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">{r.marginPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 8. Gross Profit Report (With Below Cost Detection)
 */
async function GrossProfitReport({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const { rows, summary } = await ReportsRepository.getGrossProfitReport(fromDate, toDate);

  const csvHeaders = ["رقم الفاتورة", "العميل", "التاريخ", "الصنف", "رقم الباتش", "الكمية", "سعر البيع", "تكلفة الباتش", "مجمل الربح", "هامش الربح %", "بيع دون التكلفة"];
  const csvRows = rows.map((r) => [r.invoiceNumber, r.customerName, r.date, r.productName, r.batchNumber, r.quantity, r.sellPrice, r.unitCost, r.grossProfit, r.marginPct.toFixed(1), r.isBelowCost ? "نعم" : "لا"]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي الأرباح الإجمالية</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(summary.totalProfit)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">محسوبة بالباتش الدقيق المستخرج</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">عدد تخصيصات الباتشات المباعة</span>
          <div className="text-2xl font-bold font-mono text-slate-800">{summary.totalRows} عملية صرف</div>
          <span className="text-[11px] text-slate-400 mt-1 block">مطابقة لفواتير المبيعات الصادرة</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">حالات البيع بأقل من التكلفة</span>
          <div className="text-2xl font-bold font-mono text-rose-600">{summary.belowCostCount} حالة</div>
          <span className="text-[11px] text-slate-400 mt-1 block">تتطلب اعتماد إداري معلل</span>
        </div>
      </div>

      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="الأرباح_الإجمالية_والبيع_دون_التكلفة" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">تحليل الأرباح الإجمالية لكل فاتورة وباتش مخصص (Batch Margin Audit)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">رقم الفاتورة</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">الصنف والباتش</th>
                <th className="py-3 px-4 text-center">الكمية</th>
                <th className="py-3 px-4 text-left">سعر البيع</th>
                <th className="py-3 px-4 text-left">تكلفة الباتش</th>
                <th className="py-3 px-4 text-left">مجمل الربح</th>
                <th className="py-3 px-4 text-center">الهامش %</th>
                <th className="py-3 px-4 text-center">حالة السعر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.invoiceNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.customerName}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{r.productName}</p>
                    <p className="text-[11px] text-indigo-600 font-mono">{r.batchNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{r.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.sellPrice)}</td>
                  <td className="py-3 px-4 text-left font-mono text-slate-600">{formatCurrency(r.unitCost)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-600">{formatCurrency(r.grossProfit)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">{r.marginPct.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-center">
                    {r.isBelowCost ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="h-3 w-3" />
                        <span>دون التكلفة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>مربح</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 9. Receivables Aging Component
 */
async function ReceivablesAgingReport() {
  const { rows, summary } = await ReportsRepository.getReceivablesAging();

  const csvHeaders = ["كود العميل", "اسم العميل", "الحد الائتماني", "حالي (0-30)", "31-60 يوم", "61-90 يوم", "+90 يوم", "إجمالي المديونية"];
  const csvRows = rows.map((r) => [r.partnerCode, r.partnerName, r.creditLimit, r.current0To30, r.days31To60, r.days61To90, r.days90Plus, r.totalBalance]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي مديونيات العملاء القائمة</span>
          <div className="text-2xl font-bold font-mono text-indigo-700">{formatCurrency(summary.totalReceivables)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">أرصدة مدينة مستحقة</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي المديونيات المتأخرة (+30 يوم)</span>
          <div className="text-2xl font-bold font-mono text-rose-600">{formatCurrency(summary.totalOverdue)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">تتطلب متابعة تحصيل عاجلة</span>
        </div>
      </div>

      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="أعمار_ديون_العملاء" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">جدول أعمار ديون العملاء (Accounts Receivable Aging)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">كود العميل</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4 text-left">الحد الائتماني</th>
                <th className="py-3 px-4 text-left">حالي (0 - 30)</th>
                <th className="py-3 px-4 text-left">31 - 60 يوم</th>
                <th className="py-3 px-4 text-left">61 - 90 يوم</th>
                <th className="py-3 px-4 text-left">+90 يوم</th>
                <th className="py-3 px-4 text-left">إجمالي الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.partnerCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.partnerName}</td>
                  <td className="py-3 px-4 text-left font-mono">{formatCurrency(r.creditLimit)}</td>
                  <td className="py-3 px-4 text-left font-mono text-emerald-600">{formatCurrency(r.current0To30)}</td>
                  <td className="py-3 px-4 text-left font-mono text-amber-600">{formatCurrency(r.days31To60)}</td>
                  <td className="py-3 px-4 text-left font-mono text-orange-600">{formatCurrency(r.days61To90)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{formatCurrency(r.days90Plus)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.totalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 10. Payables Aging Component
 */
async function PayablesAgingReport() {
  const { rows, summary } = await ReportsRepository.getPayablesAging();

  const csvHeaders = ["كود الشريك", "اسم المورد / المصنع", "حالي (0-30)", "31-60 يوم", "61-90 يوم", "+90 يوم", "إجمالي المستحق"];
  const csvRows = rows.map((r) => [r.partnerCode, r.partnerName, r.current0To30, r.days31To60, r.days61To90, r.days90Plus, r.totalBalance]);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm">
        <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي التزامات الموردين والمصانع القائمة</span>
        <div className="text-2xl font-bold font-mono text-rose-600">{formatCurrency(summary.totalPayables)}</div>
        <span className="text-[11px] text-slate-400 mt-1 block">أرصدة دائنة مستحقة السداد</span>
      </div>

      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="أعمار_مستحقات_الموردين" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">جدول أعمار مستحقات الموردين ومصانع التشغيل (Accounts Payable Aging)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">كود الشريك</th>
                <th className="py-3 px-4">اسم المورد / المصنع</th>
                <th className="py-3 px-4 text-left">حالي (0 - 30)</th>
                <th className="py-3 px-4 text-left">31 - 60 يوم</th>
                <th className="py-3 px-4 text-left">61 - 90 يوم</th>
                <th className="py-3 px-4 text-left">+90 يوم</th>
                <th className="py-3 px-4 text-left">إجمالي المستحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.partnerCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.partnerName}</td>
                  <td className="py-3 px-4 text-left font-mono text-emerald-600">{formatCurrency(r.current0To30)}</td>
                  <td className="py-3 px-4 text-left font-mono text-amber-600">{formatCurrency(r.days31To60)}</td>
                  <td className="py-3 px-4 text-left font-mono text-orange-600">{formatCurrency(r.days61To90)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{formatCurrency(r.days90Plus)}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">{formatCurrency(r.totalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * 11. Overdue Accounts Component
 */
async function OverdueAccountsReport() {
  const { rows } = await ReportsRepository.getOverdueAccounts();

  const csvHeaders = ["كود العميل", "اسم العميل", "الرصيد القائم", "الحد الائتماني", "شروط الدفع (أيام)", "أيام التأخير", "تجاوز الحد الائتماني"];
  const csvRows = rows.map((r) => [r.customerCode, r.customerName, r.currentBalance, r.creditLimit, r.paymentTermsDays, r.daysOverdue, r.isCreditExceeded ? "تجاوز الحد" : "ضمن الحد"]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
        <ExportCsvButton filename="الحسابات_المتجاوزة" headers={csvHeaders} rows={csvRows} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800">كشف العملاء المتجاوزين لفترات أو حدود الائتمان (Overdue & Credit Exceeded Accounts)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">كود العميل</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4 text-left">الرصيد القائم</th>
                <th className="py-3 px-4 text-left">الحد الائتماني</th>
                <th className="py-3 px-4 text-center">أيام الائتمان</th>
                <th className="py-3 px-4 text-center">أيام التأخير</th>
                <th className="py-3 px-4 text-center">حالة الرقابة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{r.customerCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.customerName}</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-rose-600">{formatCurrency(r.currentBalance)}</td>
                  <td className="py-3 px-4 text-left font-mono text-slate-700">{formatCurrency(r.creditLimit)}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">{r.paymentTermsDays} يوم</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">{r.daysOverdue} يوم تأخير</td>
                  <td className="py-3 px-4 text-center">
                    {r.isCreditExceeded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="h-3 w-3" />
                        <span>تجاوز الحد الائتماني</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3 w-3" />
                        <span>متأخر السداد</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
