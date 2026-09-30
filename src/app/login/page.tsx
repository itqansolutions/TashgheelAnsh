"use client";

import React, { useState } from "react";
import { loginAction } from "@/server/actions/authActions";
import { Layers, Lock, User, ArrowLeft, AlertCircle, Eye, EyeOff, CheckSquare, Square } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);
    if (rememberMe) {
      formData.append("rememberMe", "true");
    }

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      // In Next.js redirect throws, so if we reach catch with no error, redirect is processing
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-emerald-400 items-center justify-center shadow-2xl shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
          <Layers className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          TASHGHEEL TRADE
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-indigo-300">
          تشغيل تريد — إدارة التجارة • المخزون • التصنيع لدى الغير
        </p>
        <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
          منظومة تخطيط الموارد وإدارة دورة العمليات المتكاملة
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-5 sm:px-10 shadow-2xl rounded-3xl border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs font-semibold text-rose-700 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pr-10 pl-3 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition min-h-[44px]"
                  placeholder="admin أو user@tashgheel.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  كلمة المرور
                </label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 pr-10 pl-11 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition min-h-[44px]"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 select-none py-1"
              >
                {rememberMe ? (
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>تذكر تسجيل الدخول (30 يوماً)</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition min-h-[48px]"
            >
              {loading ? (
                <span>جاري التحقق والدخول...</span>
              ) : (
                <>
                  <span>تسجيل الدخول للنظام</span>
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick System Credentials Info */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                <span>بيانات مدير النظام الافتراضية (Super Admin)</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Primary</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                يمكنك الدخول باسم المستخدم أو البريد الإلكتروني:
              </p>
              <div className="flex items-center justify-between font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 select-all" dir="ltr">
                <span>username: <strong>admin</strong></span>
                <span className="text-slate-300">|</span>
                <span>password: <strong>admin123</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
