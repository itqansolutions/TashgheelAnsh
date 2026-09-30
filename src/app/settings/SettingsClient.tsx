"use client";

import React, { useState, useRef } from "react";
import {
  Building2,
  Image as ImageIcon,
  Printer,
  Shield,
  Save,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  FileText,
  MapPin,
  Coins,
  RefreshCw,
} from "lucide-react";
import { CompanySettingsData } from "@/server/repositories/settingsRepository";
import { updateCompanySettingsAction } from "@/server/actions/settingsActions";

interface SettingsClientProps {
  initialSettings: CompanySettingsData;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<CompanySettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<"info" | "branding" | "printing" | "system">("info");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Logo upload preview state
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl || null);
  const [removeLogoFlag, setRemoveLogoFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMessage("حجم ملف الشعار يتجاوز الحد الأقصى المسموح به (1.5 ميجابايت).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
      setRemoveLogoFlag(false);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setLogoPreview(null);
    setRemoveLogoFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    if (removeLogoFlag) {
      formData.set("removeLogo", "true");
    }

    const res = await updateCompanySettingsAction(formData);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.settings) {
      setSettings(res.settings);
      setLogoPreview(res.settings.logoUrl || null);
      setRemoveLogoFlag(false);
      setSuccessMessage("تم حفظ وتحديث إعدادات وهوية الشركة بنجاح.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <span>إعدادات وهوية الشركة (Company Settings & Branding)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة البيانات الرسمية للمنشأة، الشعار، الأرقام الضريبية، وترويسة المستندات المطبوعة.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition whitespace-nowrap ${
            activeTab === "info"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>البيانات الأساسية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition whitespace-nowrap ${
            activeTab === "branding"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>الشعار والهوية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("printing")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition whitespace-nowrap ${
            activeTab === "printing"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>ترويسة المطبوعات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition whitespace-nowrap ${
            activeTab === "system"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>الأمان والنظام</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Info */}
        {activeTab === "info" && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                البيانات الرسمية للمنشأة
              </h3>
              <span className="text-xs text-slate-400">تظهر في كافة المستندات الرسمية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المنشأة التجاري (بالعربية) *
                </label>
                <input
                  name="nameAr"
                  type="text"
                  required
                  defaultValue={settings.nameAr}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  placeholder="تشغيل تريد للتجارة والتصنيع المشترك"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم المنشأة التجاري والـ Positioning (بالإنجليزية)
                </label>
                <input
                  name="nameEn"
                  type="text"
                  dir="ltr"
                  defaultValue={settings.nameEn}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  placeholder="TASHGHEEL TRADE — Trading • Inventory • Outsourced Manufacturing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الرقم الضريبي (Tax Registration No.)
                </label>
                <input
                  name="taxNumber"
                  type="text"
                  dir="ltr"
                  defaultValue={settings.taxNumber || ""}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  placeholder="300-987-123"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم السجل التجاري (Commercial Registration)
                </label>
                <input
                  name="commercialReg"
                  type="text"
                  dir="ltr"
                  defaultValue={settings.commercialReg || ""}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  placeholder="498302"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الهاتف الأرضي / المكتب
                </label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="phone"
                    type="text"
                    dir="ltr"
                    defaultValue={settings.phone || ""}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    placeholder="02-33445566"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رقم الجوال / واتساب المبيعات
                </label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="mobile"
                    type="text"
                    dir="ltr"
                    defaultValue={settings.mobile || ""}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    placeholder="01001234567"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني الرسمي
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    dir="ltr"
                    defaultValue={settings.email || ""}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    placeholder="info@tashgheeltrade.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الموقع الإلكتروني
                </label>
                <div className="relative">
                  <Globe className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="website"
                    type="text"
                    dir="ltr"
                    defaultValue={settings.website || ""}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    placeholder="www.tashgheeltrade.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  العنوان الجغرافي والمقر الرئيسي
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    name="address"
                    type="text"
                    defaultValue={settings.address || ""}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                    placeholder="القاهرة، جمهورية مصر العربية"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  العملة الأساسية للنظام
                </label>
                <div className="relative">
                  <Coins className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
                  <select
                    name="currency"
                    defaultValue={settings.currency || "EGP"}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  >
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branding */}
        {activeTab === "branding" && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  شعار المنشأة (Company Logo)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  يظهر الشعار في أعلى تقارير الطباعة والفواتير وسندات الصرف
                </p>
              </div>
              <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Max: 1.5 MB (PNG, JPG, WEBP)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Logo Preview Box */}
              <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-3 text-center shrink-0 relative overflow-hidden">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="space-y-1">
                    <ImageIcon className="h-10 w-10 text-slate-300 mx-auto" />
                    <span className="text-[11px] text-slate-400 font-semibold block">
                      لا يوجد شعار محدد
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3 w-full">
                <input
                  ref={fileInputRef}
                  name="logoFile"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-file-input"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="logo-file-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm border border-indigo-200 transition min-h-[44px]"
                  >
                    <Upload className="h-4 w-4" />
                    <span>اختيار ملف شعار جديد</span>
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200 transition min-h-[44px]"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>حذف الشعار</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <p>• يُفضل استخدام صورة بخلفية شفافة وبأبعاد مناسبة (مثال: 400x150 بكسل).</p>
                  <p>• يتم حفظ الشعار بأمان في قاعدة البيانات كـ Base64، وهو جاهز للترحيل المستقبلي لخدمة AWS S3 أو Cloudflare R2 دون أي تعديل في واجهات النظام.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Printing Header / Footer */}
        {activeTab === "printing" && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                إعدادات ترويسة وتذييل الطباعة الموحدة
              </h3>
              <span className="text-xs text-slate-400">تطبيق آلي على كافة نماذج A4</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ملاحظات أو شعار فرعي أعلى الفاتورة (Header Sub-Banner / Notes)
              </label>
              <input
                name="printHeaderNotes"
                type="text"
                defaultValue={settings.printHeaderNotes || ""}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                placeholder="مثال: فواتير وسندات توريد وتصنيع معتمدة ومطابقة للمواصفات القياسية"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نص التذييل القانوني أسفل المطبوعات (Footer Disclaimer / Legal Note)
              </label>
              <textarea
                name="printFooterNotes"
                rows={3}
                defaultValue={settings.printFooterNotes || ""}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="تم استخراج هذا المستند آلياً من نظام TASHGHEEL TRADE ولا يعتد به دون التوقيع والختم المعتمد."
              />
            </div>

            {/* Print Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-600 block">
                معاينة حية لشكل الترويسة في الطباعة (Live Print Header Preview):
              </span>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {settings.nameAr}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {settings.nameEn}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    س.ت: {settings.commercialReg || "—"} | ب.ض: {settings.taxNumber || "—"}
                  </p>
                </div>
                <div className="h-12 w-28 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">شعار المنشأة</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System & Security */}
        {activeTab === "system" && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                حالة بيئة التشغيل والأمان (System Status & Security)
              </h3>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                جاهز للإنتاج
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">قاعدة البيانات السحابية</span>
                <span className="text-slate-500 block font-mono">PostgreSQL on Railway</span>
                <span className="text-emerald-700 font-semibold text-[11px] block mt-1">
                  ✓ متصلة وتعمل بصورة سليمة
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">مدة صلاحية الجلسة المفتوحة</span>
                <span className="text-slate-500 block font-mono">7 أيام عادية / 30 يوماً مع "تذكرني"</span>
                <span className="text-indigo-700 font-semibold text-[11px] block mt-1">
                  ✓ مشفرة بـ HttpOnly Cookies
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating/Sticky Save Action Bar */}
        <div className="sticky bottom-20 lg:bottom-4 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
            <span>يتم تطبيق التعديلات فور الحفظ على كافة شاشات ومطبوعات النظام</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition disabled:opacity-50 min-h-[44px]"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
