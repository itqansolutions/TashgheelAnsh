"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PermissionCode } from "../permissions";
import { UsersRepository } from "../repositories/usersRepository";
import { AuditService } from "../services/auditService";
import { SessionUser, SESSION_COOKIE_NAME } from "../auth/types";
import prisma from "@/lib/db";

export type { SessionUser };


export async function loginAction(formData: FormData) {
  const identifier = (formData.get("identifier") || formData.get("email") || "") as string;
  const password = (formData.get("password") || "") as string;
  const rememberMe = formData.get("rememberMe") === "true" || formData.get("rememberMe") === "on";

  if (!identifier.trim() || !password) {
    return { error: "يرجى إدخال اسم المستخدم / البريد الإلكتروني وكلمة المرور" };
  }

  try {
    const user = await UsersRepository.getUserByEmailOrUsername(identifier);

    if (!user) {
      // Check bootstrap environment admin if user database is unseeded
      const envUser = process.env.ADMIN_USERNAME || "admin";
      const envEmail = process.env.ADMIN_EMAIL || "admin@tashgheel.com";
      const envPass = process.env.ADMIN_PASSWORD || "admin123";

      const cleanId = identifier.trim().toLowerCase();
      if (
        (cleanId === envUser.toLowerCase() || cleanId === envEmail.toLowerCase()) &&
        password === envPass
      ) {
        const sessionPayload: SessionUser = {
          id: "usr-admin-bootstrap",
          name: "مدير النظام العام (Admin)",
          username: "admin",
          email: "admin@tashgheel.com",
          role: "ADMIN",
          permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN,
        };

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
          path: "/",
        });

        redirect("/");
      }

      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    if (!user.isActive) {
      return { error: "هذا الحساب معطل حالياً. يرجى مراجعة إدارة النظام." };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    }

    // Role & permissions
    const basePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    const mergedPermissions = Array.from(
      new Set([...basePermissions, ...(user.customPermissions || [])])
    ) as PermissionCode[];

    const sessionPayload: SessionUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: mergedPermissions,
    };

    // Update last login
    await UsersRepository.updateLastLogin(user.id);

    // Audit log
    try {
      await AuditService.log(prisma as any, {
        userId: user.id,
        action: "USER_LOGIN",
        entity: "User",
        entityId: user.id,
        newState: {
          username: user.username,
          loginTime: new Date().toISOString(),
          rememberMe,
        },
      });
    } catch {
      // non-blocking audit failure
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: err.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول" };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: "USER_LOGOUT",
        entity: "User",
        entityId: sessionUser.id,
      });
    } catch {
      // non-blocking audit
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const parsed = JSON.parse(sessionCookie.value) as SessionUser;
    if (!parsed || !parsed.id || !parsed.role) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requirePermission(permission: PermissionCode): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role === "ADMIN") {
    return user;
  }
  if (!user.permissions.includes(permission)) {
    redirect("/unauthorized");
  }
  return user;
}
