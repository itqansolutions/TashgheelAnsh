"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Check,
  ShieldCheck,
  AlertCircle,
  X,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import {
  UserViewData,
  ROLE_NAMES_AR,
} from "@/server/repositories/usersRepository";
import {
  createUserAction,
  updateUserAction,
  toggleUserStatusAction,
  resetPasswordAction,
  updateUserPermissionsAction,
} from "@/server/actions/userActions";
import {
  PERMISSION_CATEGORIES,
  DEFAULT_ROLE_PERMISSIONS,
  PermissionCode,
} from "@/server/permissions";

interface UsersClientProps {
  initialUsers: UserViewData[];
  currentUserId: string;
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<UserViewData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Selected user for editing / resetting / permissions
  const [selectedUser, setSelectedUser] = useState<UserViewData | null>(null);

  // Form states & messages
  const [formLoading, setFormLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Permissions modal state
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionCode[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    dashboard: true,
    sales: true,
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.isActive) ||
      (statusFilter === "INACTIVE" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Quick Notification Helper
  const showFeedback = (successMsg?: string, errorMsg?: string) => {
    if (successMsg) {
      setSuccessBanner(successMsg);
      setErrorBanner(null);
      setTimeout(() => setSuccessBanner(null), 4000);
    } else if (errorMsg) {
      setErrorBanner(errorMsg);
      setSuccessBanner(null);
    }
  };

  // 1. Create User Handler
  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    setErrorBanner(null);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);

    setFormLoading(false);
    if (res.error) {
      setErrorBanner(res.error);
    } else if (res.user) {
      setUsers([res.user, ...users]);
      setIsCreateOpen(false);
      showFeedback(`تم إنشاء حساب المستخدم "${res.user.name}" بنجاح.`);
    }
  }

  // 2. Edit User Handler
  async function handleEditUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    setErrorBanner(null);

    const formData = new FormData(e.currentTarget);
    formData.set("id", selectedUser.id);
    const res = await updateUserAction(formData);

    setFormLoading(false);
    if (res.error) {
      setErrorBanner(res.error);
    } else if (res.user) {
      setUsers(users.map((u) => (u.id === res.user?.id ? res.user : u)));
      setIsEditOpen(false);
      showFeedback(`تم تحديث بيانات المستخدم "${res.user.name}" بنجاح.`);
    }
  }

  // 3. Reset Password Handler
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    setErrorBanner(null);

    const formData = new FormData(e.currentTarget);
    formData.set("userId", selectedUser.id);
    const res = await resetPasswordAction(formData);

    setFormLoading(false);
    if (res.error) {
      setErrorBanner(res.error);
    } else {
      setIsResetPassOpen(false);
      showFeedback(`تمت إعادة تعيين كلمة المرور للمستخدم "${selectedUser.name}" بنجاح.`);
    }
  }

  // 4. Toggle Status Handler
  async function handleToggleStatus(user: UserViewData) {
    const newStatus = !user.isActive;
    const res = await toggleUserStatusAction(user.id, newStatus);
    if (res.error) {
      showFeedback(undefined, res.error);
    } else {
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
      );
      showFeedback(
        `تم ${newStatus ? "تفعيل" : "تعطيل"} حساب "${user.name}" بنجاح.`
      );
    }
  }

  // 5. Open Permissions Modal
  function openPermissionsModal(user: UserViewData) {
    setSelectedUser(user);
    // Base role permissions
    const base = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    const combined = Array.from(
      new Set([...base, ...(user.customPermissions || [])])
    ) as PermissionCode[];
    setSelectedPermissions(combined);
    setIsPermissionsOpen(true);
  }

  // Toggle single permission checkbox
  function togglePermission(code: PermissionCode) {
    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  }

  // Save Custom Permissions Handler
  async function handleSavePermissions() {
    if (!selectedUser) return;
    setFormLoading(true);
    setErrorBanner(null);

    const res = await updateUserPermissionsAction(
      selectedUser.id,
      selectedPermissions
    );
    setFormLoading(false);
    if (res.error) {
      setErrorBanner(res.error);
    } else {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, customPermissions: selectedPermissions }
            : u
        )
      );
      setIsPermissionsOpen(false);
      showFeedback(
        `تم حفظ الصلاحيات المخصصة للمستخدم "${selectedUser.name}" بنجاح.`
      );
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Global Alerts */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-600 hover:text-rose-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span>إدارة المستخدمين والأدوار (User Management & RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات الفريق، تعيين الأدوار والصلاحيات، وتأمين عمليات الاعتماد والبيع.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorBanner(null);
            setIsCreateOpen(true);
          }}
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm min-h-[44px] transition shadow-md shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، اسم المستخدم، أو البريد الإلكتروني..."
            className="w-full pl-3 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
          >
            <option value="ALL">جميع الأدوار</option>
            {Object.entries(ROLE_NAMES_AR).map(([code, label]) => (
              <option key={code} value={code}>
                {label} ({code})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">النشطون فقط</option>
            <option value="INACTIVE">المعطلون فقط</option>
          </select>
        </div>
      </div>

      {/* Users List Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            مستخدمو النظام المعتمدون
          </h3>
          <span className="text-xs text-slate-500 font-bold font-mono">
            {filteredUsers.length} من أصل {users.length}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
            لا يوجد مستخدمون مطابقون لمعايير البحث الحالية.
          </div>
        ) : (
          <>
            {/* Mobile Card List (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs">
                            {u.name}
                          </h4>
                          {u.id === currentUserId && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                              أنت
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400" dir="ltr">
                          @{u.username} • {u.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      disabled={u.id === currentUserId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border min-h-[36px] transition ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      } ${u.id === currentUserId ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"}`}
                    >
                      {u.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>نشط</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>معطل</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                      {u.roleAr}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {u.lastLoginAt
                        ? `آخر دخول: ${new Date(u.lastLoginAt).toLocaleDateString("ar-EG")}`
                        : "لم يسجل الدخول بعد"}
                    </span>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setErrorBanner(null);
                        setIsEditOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 min-h-[44px]"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-indigo-600" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setErrorBanner(null);
                        setIsResetPassOpen(true);
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 min-h-[44px]"
                    >
                      <Key className="h-3.5 w-3.5 text-amber-600" />
                      <span>كلمة السر</span>
                    </button>

                    <button
                      onClick={() => openPermissionsModal(u)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 min-h-[44px]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                      <span>الصلاحيات</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">المستخدم</th>
                    <th className="py-3.5 px-6">اسم المستخدم / البريد</th>
                    <th className="py-3.5 px-6">الدور الوظيفي</th>
                    <th className="py-3.5 px-6">الحالة</th>
                    <th className="py-3.5 px-6">آخر نشاط</th>
                    <th className="py-3.5 px-6 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.id === currentUserId && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-bold">
                                  أنت
                                </span>
                              )}
                            </div>
                            {u.phone && (
                              <p className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-600" dir="ltr">
                        <p className="font-semibold text-slate-800">@{u.username}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                          {u.roleAr} ({u.role})
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentUserId}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          } ${u.id === currentUserId ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {u.isActive ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>معطل</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString("ar-EG")
                          : "لم يسجل بعد"}
                      </td>
                      <td className="py-3.5 px-6 text-left">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setErrorBanner(null);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="تعديل البيانات"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setErrorBanner(null);
                              setIsResetPassOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="إعادة تعيين كلمة المرور"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openPermissionsModal(u)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="إدارة الصلاحيات"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* RBAC Standard Matrix Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              مصفوفة توزيع الصلاحيات والأدوار القياسية (Role Permissions Matrix)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">TASHGHEEL RBAC</span>
        </div>

        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="py-2.5 px-3">الوحدة / القسم</th>
                <th className="py-2.5 px-3 text-center">مدير عام (ADMIN)</th>
                <th className="py-2.5 px-3 text-center">محاسب (ACCOUNTANT)</th>
                <th className="py-2.5 px-3 text-center">مبيعات (SALES)</th>
                <th className="py-2.5 px-3 text-center">أمين مخزن (WAREHOUSE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                  إدارة وشراء المخزون
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  كامل الصلاحيات
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  قراءة واعتماد مالي
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                  استعلام الرصيد فقط
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  إدخال وصرف
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                  أوامر التصنيع لدى الغير
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  كامل الصلاحيات
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  إثبات المصروفات والإقفال
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                  غير متاح
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  صرف الخامات واستلام التام
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                  البيع بأقل من التكلفة
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  متاح مع قيد تدقيق
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-sans">
                  غير متاح
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-sans">
                  يتطلب موافقة إدارية
                </td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-sans">
                  غير متاح
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                  إعدادات وهوية الشركة
                </td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold font-sans">
                  كامل الصلاحيات
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                  قراءة الهوية فقط
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                  غير متاح
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">
                  غير متاح
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- MODAL 1: CREATE USER ---------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    إنشاء حساب مستخدم جديد
                  </h3>
                  <p className="text-xs text-slate-400">
                    أدخل بيانات المستخدم وحدد الدور الوظيفي
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorBanner && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد علي"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم (Username) *
                  </label>
                  <input
                    name="username"
                    type="text"
                    required
                    dir="ltr"
                    placeholder="ahmed"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الدور الوظيفي (Role) *
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue="USER"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  >
                    {Object.entries(ROLE_NAMES_AR).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    dir="ltr"
                    placeholder="ahmed@company.com"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف / الجوال
                  </label>
                  <input
                    name="phone"
                    type="text"
                    dir="ltr"
                    placeholder="01012345678"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الابتدائية *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  dir="ltr"
                  placeholder="لا تقل عن 6 أحرف"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 min-h-[44px]"
                >
                  {formLoading ? "جاري الحفظ..." : "حفظ وإنشاء المستخدم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: EDIT USER ---------------- */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    تعديل بيانات المستخدم: {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    @{selectedUser.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorBanner && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={selectedUser.name}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    dir="ltr"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الدور الوظيفي (Role) *
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue={selectedUser.role}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                  >
                    {Object.entries(ROLE_NAMES_AR).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف / الجوال
                </label>
                <input
                  name="phone"
                  type="text"
                  dir="ltr"
                  defaultValue={selectedUser.phone || ""}
                  placeholder="01012345678"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 min-h-[44px]"
                >
                  {formLoading ? "جاري التحديث..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: RESET PASSWORD ---------------- */}
      {isResetPassOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    إعادة تعيين كلمة المرور
                  </h3>
                  <p className="text-xs text-slate-500">
                    للمستخدم: {selectedUser.name} (@{selectedUser.username})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetPassOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorBanner && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة *
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  dir="ltr"
                  placeholder="لا تقل عن 6 أحرف أو أرقام"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetPassOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 min-h-[44px]"
                >
                  {formLoading ? "جاري التعيين..." : "تأكيد كلمة المرور الجديدة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 4: PERMISSIONS ACCORDION MATRIX ---------------- */}
      {isPermissionsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    تخصيص الصلاحيات الدقيقة (Fine-Grained Permissions)
                  </h3>
                  <p className="text-xs text-slate-500">
                    المستخدم: <strong className="text-slate-800">{selectedUser.name}</strong> • الدور الأساسي:{" "}
                    <span className="text-indigo-600 font-bold">{selectedUser.roleAr}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPermissionsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedUser.role === "ADMIN" && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-600" />
                <span>
                  ملاحظة: هذا الحساب يمتلك دور المدير العام (ADMIN) ويمتلك كافة الصلاحيات بصورة تلقائية وتجاوزية.
                </span>
              </div>
            )}

            {/* Permission categories accordion */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {PERMISSION_CATEGORIES.map((cat) => {
                const isExpanded = !!expandedCategories[cat.id];
                const catPermissionsCount = cat.permissions.length;
                const grantedInCat = cat.permissions.filter((p) =>
                  selectedPermissions.includes(p.code)
                ).length;

                return (
                  <div
                    key={cat.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategories({
                          ...expandedCategories,
                          [cat.id]: !isExpanded,
                        })
                      }
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 transition text-right"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          {cat.nameAr}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {grantedInCat} / {catPermissionsCount}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 space-y-2 bg-white divide-y divide-slate-100">
                        {cat.permissions.map((p) => {
                          const isChecked = selectedPermissions.includes(p.code);
                          return (
                            <label
                              key={p.code}
                              className="flex items-start gap-3 pt-2 first:pt-0 cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.code)}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div className="text-xs">
                                <span className="font-bold text-slate-800 block">
                                  {p.labelAr}
                                </span>
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                  {p.descriptionAr}
                                </span>
                                <span className="text-[10px] font-mono text-slate-300 block" dir="ltr">
                                  {p.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-mono">
                إجمالي الصلاحيات المختارة: {selectedPermissions.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 min-h-[44px]"
                >
                  {formLoading ? "جاري الحفظ..." : "حفظ الصلاحيات المخصصة"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
