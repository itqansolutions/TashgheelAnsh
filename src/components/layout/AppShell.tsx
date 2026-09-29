"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bell,
  Menu,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: "لوحة التحكم الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "فواتير المشتريات والتوريد", href: "/purchases", icon: ShoppingCart },
  { name: "أوامر التصنيع لدى الغير", href: "/manufacturing", icon: Factory, badge: "تشغيل" },
  { name: "أرصدة الباتشات والمخازن", href: "/inventory", icon: Package },
  { name: "فواتير المبيعات والأرباح", href: "/sales", icon: BadgeDollarSign },
  { name: "شركاء الأعمال (موردين/مصانع/عملاء)", href: "/partners", icon: Users },
  { name: "الخزينة ودفاتر الأستاذ", href: "/accounting", icon: Wallet },
  { name: "تقارير التتبع والرقابة", href: "/reports", icon: FileSpreadsheet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/75 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">نظام إدارة الإنتاج والتجارة</h1>
              <p className="text-xs text-slate-400">Trading & Manufacturing ERP</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            الوحدات التشغيلية والمالية
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
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
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                م
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">مدير النظام العام</p>
                <p className="text-[11px] text-slate-400 truncate">admin@enterprise.com</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="متصل" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:mr-72 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative max-w-xs sm:w-80">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث سريع برقم الفاتورة، الباتش، أو الشريك..."
                className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>قاعدة بيانات Railway متصلة</span>
            </div>

            {/* Quick Traceability Action */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>تدقيق الرقابة</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
