"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requirePermission } from "./authActions";
import { PERMISSIONS, PermissionCode } from "../permissions";
import { UsersRepository } from "../repositories/usersRepository";
import { AuditService } from "../services/auditService";
import prisma from "@/lib/db";

export async function createUserAction(formData: FormData) {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_CREATE);

  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!name || !username || !email || !password) {
    return { error: "يرجى ملء جميع الحقول المطلوبة (الاسم، اسم المستخدم، البريد، كلمة المرور)" };
  }

  if (password.length < 6) {
    return { error: "كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام" };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UsersRepository.createUser({
      name,
      username,
      email,
      phone: phone || undefined,
      passwordHash,
      role,
    });

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: "USER_CREATED",
        entity: "User",
        entityId: newUser.id,
        newState: {
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/users");
    return { success: true, user: newUser };
  } catch (err: any) {
    return { error: err.message || "فشل إنشاء المستخدم" };
  }
}

export async function updateUserAction(formData: FormData) {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_EDIT);

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const role = formData.get("role") as string;

  if (!id) {
    return { error: "معرف المستخدم مطلوب" };
  }

  try {
    const updated = await UsersRepository.updateUser(id, {
      name,
      email,
      phone: phone || undefined,
      role,
    });

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: "USER_UPDATED",
        entity: "User",
        entityId: id,
        newState: { name, email, phone, role },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/users");
    return { success: true, user: updated };
  } catch (err: any) {
    return { error: err.message || "فشل تعديل بيانات المستخدم" };
  }
}

export async function toggleUserStatusAction(userId: string, isActive: boolean) {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_DEACTIVATE);

  if (userId === sessionUser.id && !isActive) {
    return { error: "لا يمكنك تعطيل حسابك الحالي المسجل به الدخول" };
  }

  try {
    await UsersRepository.toggleUserStatus(userId, isActive);

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        entity: "User",
        entityId: userId,
        newState: { isActive },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "فشل تغيير حالة المستخدم" };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_EDIT);

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword) {
    return { error: "يرجى تحديد المستخدم وإدخال كلمة المرور الجديدة" };
  }

  if (newPassword.length < 6) {
    return { error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف أو أرقام" };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UsersRepository.resetPassword(userId, passwordHash);

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: userId,
        newState: { resetAt: new Date().toISOString() },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/users");
    return { success: true, message: "تمت إعادة تعيين كلمة المرور بنجاح" };
  } catch (err: any) {
    return { error: err.message || "فشلت إعادة تعيين كلمة المرور" };
  }
}

export async function updateUserPermissionsAction(
  userId: string,
  permissions: PermissionCode[]
) {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_EDIT);

  try {
    await UsersRepository.updateUser(userId, {
      customPermissions: permissions,
    });

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: "USER_PERMISSIONS_UPDATED",
        entity: "User",
        entityId: userId,
        newState: { permissionsCount: permissions.length },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "فشل تحديث الصلاحيات" };
  }
}
