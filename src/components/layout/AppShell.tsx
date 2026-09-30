"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { getSessionUser, logoutAction } from "@/server/actions/authActions";
import type { SessionUser } from "@/server/auth/types";
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Package,
  BadgeDollarSign,
  Users,
  Wallet,
  FileSpreadsheet,
  ShieldCheck,
  Search,
  Menu,
  X,
  Plus,
  Layers,
  Building2,
  DollarSign,
  Settings,
  LogOut,
  UserCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: "لوحة التحكم الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "دليل الأصناف والمنتجات", href: "/products", icon: Package },
  { name: "فواتير المشتريات والتوريد", href: "/purchases", icon: ShoppingCart },
  { name: "أوامر التصنيع لدى الغير", href: "/manufacturing", icon: Factory, badge: "تشغيل" },
  { name: "أرصدة الباتشات والمخازن", href: "/inventory", icon: Layers },
  { name: "فواتير المبيعات والأرباح", href: "/sales", icon: BadgeDollarSign },
  { name: "الموردون وجهات التوريد", href: "/suppliers", icon: Users },
  { name: "مصانع التشغيل الخارجية", href: "/factories", icon: Building2 },
  { name: "العملاء والائتمان التجاري", href: "/customers", icon: Users },
  { name: "الخزينة ودفاتر النقدية", href: "/treasury", icon: Wallet },
  { name: "المصروفات التشغيلية", href: "/expenses", icon: DollarSign },
  { name: "مركز التقارير والرقابة", href: "/reports", icon: FileSpreadsheet },
  { name: "المستخدمون والصلاحيات", href: "/users", icon: UserCheck },
  { name: "إعدادات وهوية الشركة", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getSessionUser()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    await logoutAction();
  }

  return (
    <div className="min-h-screen bg-slate-100/75 flex flex-col lg:flex-row" dir="rtl">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 sm:w-80 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-none">
                TASHGHEEL TRADE
              </h1>
              <p className="text-[10px] sm:text-[11px] text-indigo-300 font-semibold mt-1">
                تشغيل تريد — إدارة التجارة والتصنيع
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 sm:px-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            الوحدات التشغيلية والمالية
          </div>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User / Session Profile Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 pb-safe">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : "م"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || "مدير النظام (Admin)"}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono" dir="ltr">
                  @{currentUser?.username || "admin"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="تسجيل الخروج من النظام"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:mr-72 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 pt-safe">
          {/* Mobile Right: Menu button + Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="فتح القائمة الرئيسية"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                تشغيل
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                TASHGHEEL TRADE
              </span>
            </div>

            {/* Desktop Quick Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="hidden lg:flex relative w-80 items-center justify-between pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-400 transition-all text-right shadow-sm group"
            >
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
              <span className="truncate">بحث سريع بالأصناف، الباتشات، الفواتير...</span>
              <kbd className="inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-200/70 rounded">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Header Left */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition"
              aria-label="البحث السريع"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tashgheel Cloud PostgreSQL</span>
            </div>

            {/* Audit Log Quick Link */}
            <Link
              href="/inventory/movements"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition min-h-[36px]"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>سجل الحركات الرقابي</span>
            </Link>

            {/* Desktop Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition min-h-[36px]"
              title="تسجيل الخروج"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        aria-label="التنقل الرئيسي للهاتف"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center text-center">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
              pathname === "/" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] mt-1">الرئيسية</span>
          </Link>

          <Link
            href="/inventory"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
              pathname.startsWith("/inventory") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] mt-1">المخزون</span>
          </Link>

          {/* Center (+) button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setQuickActionOpen(true)}
              className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition"
              aria-label="إجراء سريع جديد"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          <Link
            href="/manufacturing"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
              pathname.startsWith("/manufacturing") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Factory className="h-5 w-5" />
            <span className="text-[10px] mt-1">التصنيع</span>
          </Link>

          <Link
            href="/sales"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
              pathname.startsWith("/sales") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BadgeDollarSign className="h-5 w-5" />
            <span className="text-[10px] mt-1">المبيعات</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Quick Action Bottom Sheet */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" dir="rtl">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setQuickActionOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl p-5 pb-safe shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 bottom-sheet"
            data-testid="bottom-sheet"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">إنشاء مستند تشغيلي جديد</span>
              <button
                type="button"
                onClick={() => setQuickActionOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <Link
                href="/purchases/new"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 min-h-[48px] transition"
              >
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-bold text-slate-900">فاتورة شراء وتوريد خامات</p>
                  <p className="text-[11px] text-slate-500">استلام شحنة وتوليد باتش جديد</p>
                </div>
              </Link>

              <Link
                href="/manufacturing/new"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100 min-h-[48px] transition"
              >
                <Factory className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-bold text-slate-900">أمر تصنيع وتشغيل لدى الغير</p>
                  <p className="text-[11px] text-slate-500">صرف خامات لمصنع وتجميع التكاليف</p>
                </div>
              </Link>

              <Link
                href="/sales/new"
                onClick={() => setQuickActionOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 min-h-[48px] transition"
              >
                <BadgeDollarSign className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900">فاتورة بيع وتخصيص باتشات</p>
                  <p className="text-[11px] text-slate-500">صرف بضاعة مع حماية هامش الربح</p>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/products/new"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 min-h-[44px] justify-center text-[11px]"
                >
                  <Package className="h-4 w-4 text-indigo-600" />
                  <span>إضافة صنف</span>
                </Link>
                <Link
                  href="/suppliers/new"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 min-h-[44px] justify-center text-[11px]"
                >
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span>تسجيل شريك</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
