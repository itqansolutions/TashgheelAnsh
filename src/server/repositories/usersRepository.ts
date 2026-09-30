import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PermissionCode } from "../permissions";

export interface UserViewData {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  role: string;
  roleAr: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  customPermissions: PermissionCode[];
  createdAt: Date;
}

export const ROLE_NAMES_AR: Record<string, string> = {
  ADMIN: "مدير النظام العام",
  MANAGER: "مدير تشغيل ومتابعة",
  ACCOUNTANT: "محاسب مالي رئيسي",
  SALES: "مسؤول مبيعات وعملاء",
  WAREHOUSE: "أمين مخزن وتشغيل",
  USER: "مستخدم عام",
};

// Initial in-memory cache for test suites or offline environments
const INITIAL_HASH = bcrypt.hashSync("admin123", 10);
let inMemoryUsers: (UserViewData & { passwordHash: string })[] = [
  {
    id: "usr-admin",
    name: "مدير النظام العام (Admin)",
    username: "admin",
    email: "admin@tashgheel.com",
    phone: "01001234567",
    passwordHash: INITIAL_HASH,
    role: "ADMIN",
    roleAr: "مدير النظام العام",
    isActive: true,
    lastLoginAt: new Date(),
    customPermissions: [],
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "usr-acc",
    name: "محمود عبد الرحمن",
    username: "accountant",
    email: "accountant@tashgheel.com",
    phone: "01122334455",
    passwordHash: INITIAL_HASH,
    role: "ACCOUNTANT",
    roleAr: "محاسب مالي رئيسي",
    isActive: true,
    lastLoginAt: new Date("2026-09-29"),
    customPermissions: [],
    createdAt: new Date("2026-02-01"),
  },
  {
    id: "usr-sales",
    name: "سامح إبراهيم",
    username: "sales",
    email: "sales@tashgheel.com",
    phone: "01234567890",
    passwordHash: INITIAL_HASH,
    role: "SALES",
    roleAr: "مسؤول مبيعات وعملاء",
    isActive: true,
    lastLoginAt: new Date("2026-09-30"),
    customPermissions: [],
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "usr-wh",
    name: "طارق النجار",
    username: "warehouse",
    email: "warehouse@tashgheel.com",
    phone: "01555555555",
    passwordHash: INITIAL_HASH,
    role: "WAREHOUSE",
    roleAr: "أمين مخزن وتشغيل",
    isActive: true,
    lastLoginAt: new Date("2026-09-28"),
    customPermissions: [],
    createdAt: new Date("2026-04-01"),
  },
];

export class UsersRepository {
  static async getUsers(): Promise<UserViewData[]> {
    try {
      const dbUsers = await prisma.user.findMany({
        include: {
          userRoles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbUsers && dbUsers.length > 0) {
        return dbUsers.map((u) => {
          const roleCode = u.userRoles[0]?.role?.code || "USER";
          return {
            id: u.id,
            name: u.name,
            username: (u as any).username || u.email.split("@")[0],
            email: u.email,
            phone: (u as any).phone || null,
            role: roleCode,
            roleAr: ROLE_NAMES_AR[roleCode] || roleCode,
            isActive: u.isActive,
            lastLoginAt: (u as any).lastLoginAt || null,
            customPermissions: ((u as any).customPermissions || []) as PermissionCode[],
            createdAt: u.createdAt,
          };
        });
      }
      return inMemoryUsers.map(({ passwordHash: _, ...rest }) => rest);
    } catch {
      return inMemoryUsers.map(({ passwordHash: _, ...rest }) => rest);
    }
  }

  static async getUserById(id: string): Promise<(UserViewData & { passwordHash: string }) | null> {
    try {
      const u = await prisma.user.findUnique({
        where: { id },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      if (u) {
        const roleCode = u.userRoles[0]?.role?.code || "USER";
        return {
          id: u.id,
          name: u.name,
          username: (u as any).username || u.email.split("@")[0],
          email: u.email,
          phone: (u as any).phone || null,
          passwordHash: u.passwordHash,
          role: roleCode,
          roleAr: ROLE_NAMES_AR[roleCode] || roleCode,
          isActive: u.isActive,
          lastLoginAt: (u as any).lastLoginAt || null,
          customPermissions: ((u as any).customPermissions || []) as PermissionCode[],
          createdAt: u.createdAt,
        };
      }
    } catch {
      // In-memory fallback
    }

    const memUser = inMemoryUsers.find((u) => u.id === id);
    return memUser ? { ...memUser } : null;
  }

  static async getUserByEmailOrUsername(
    identifier: string
  ): Promise<(UserViewData & { passwordHash: string }) | null> {
    const cleanId = identifier.trim().toLowerCase();

    try {
      const u = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: cleanId, mode: "insensitive" } },
            { username: { equals: cleanId, mode: "insensitive" } as any },
          ],
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (u) {
        const roleCode = u.userRoles[0]?.role?.code || "USER";
        return {
          id: u.id,
          name: u.name,
          username: (u as any).username || u.email.split("@")[0],
          email: u.email,
          phone: (u as any).phone || null,
          passwordHash: u.passwordHash,
          role: roleCode,
          roleAr: ROLE_NAMES_AR[roleCode] || roleCode,
          isActive: u.isActive,
          lastLoginAt: (u as any).lastLoginAt || null,
          customPermissions: ((u as any).customPermissions || []) as PermissionCode[],
          createdAt: u.createdAt,
        };
      }
    } catch {
      // In-memory fallback
    }

    const memUser = inMemoryUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    );
    return memUser ? { ...memUser } : null;
  }

  static async createUser(data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: string;
    customPermissions?: PermissionCode[];
  }): Promise<UserViewData> {
    const existing = await this.getUserByEmailOrUsername(data.email);
    if (existing) {
      throw new Error("البريد الإلكتروني مسجل مسبقاً لمستخدم آخر");
    }

    const existingUser = await this.getUserByEmailOrUsername(data.username);
    if (existingUser) {
      throw new Error("اسم المستخدم محجوز بالفعل. يرجى اختيار اسم مستخدم آخر");
    }

    try {
      let role = await prisma.role.findUnique({
        where: { code: data.role },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            code: data.role,
            name: data.role,
            description: ROLE_NAMES_AR[data.role] || data.role,
          },
        });
      }

      const created = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          username: data.username.toLowerCase(),
          phone: data.phone || null,
          passwordHash: data.passwordHash,
          isActive: true,
          customPermissions: (data.customPermissions || []) as any,
          userRoles: {
            create: {
              roleId: role.id,
            },
          },
        } as any,
      });

      const userView: UserViewData = {
        id: created.id,
        name: created.name,
        username: (created as any).username || data.username,
        email: created.email,
        phone: (created as any).phone || data.phone,
        role: data.role,
        roleAr: ROLE_NAMES_AR[data.role] || data.role,
        isActive: created.isActive,
        lastLoginAt: null,
        customPermissions: data.customPermissions || [],
        createdAt: created.createdAt,
      };

      inMemoryUsers.unshift({
        ...userView,
        passwordHash: data.passwordHash,
      });

      return userView;
    } catch {
      // In-memory creation
      const newUser: UserViewData & { passwordHash: string } = {
        id: `usr-${Date.now()}`,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || null,
        passwordHash: data.passwordHash,
        role: data.role,
        roleAr: ROLE_NAMES_AR[data.role] || data.role,
        isActive: true,
        lastLoginAt: null,
        customPermissions: data.customPermissions || [],
        createdAt: new Date(),
      };
      inMemoryUsers.unshift(newUser);
      const { passwordHash: _, ...rest } = newUser;
      return rest;
    }
  }

  static async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      customPermissions?: PermissionCode[];
    }
  ): Promise<UserViewData> {
    try {
      if (data.role) {
        let role = await prisma.role.findUnique({
          where: { code: data.role },
        });
        if (role) {
          await prisma.userRole.deleteMany({ where: { userId: id } });
          await prisma.userRole.create({
            data: { userId: id, roleId: role.id },
          });
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.email && { email: data.email.toLowerCase() }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.customPermissions && { customPermissions: data.customPermissions as any }),
        } as any,
      });

      // Update in-memory
      const idx = inMemoryUsers.findIndex((u) => u.id === id);
      if (idx !== -1) {
        inMemoryUsers[idx] = {
          ...inMemoryUsers[idx],
          ...data,
          ...(data.role && {
            role: data.role,
            roleAr: ROLE_NAMES_AR[data.role] || data.role,
          }),
        };
      }

      const roleCode = data.role || (idx !== -1 ? inMemoryUsers[idx].role : "USER");
      return {
        id: updated.id,
        name: updated.name,
        username: (updated as any).username || (idx !== -1 ? inMemoryUsers[idx].username : ""),
        email: updated.email,
        phone: (updated as any).phone,
        role: roleCode,
        roleAr: ROLE_NAMES_AR[roleCode] || roleCode,
        isActive: updated.isActive,
        lastLoginAt: (updated as any).lastLoginAt,
        customPermissions: data.customPermissions || [],
        createdAt: updated.createdAt,
      };
    } catch {
      // In-memory fallback
      const idx = inMemoryUsers.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error("المستخدم غير موجود");

      inMemoryUsers[idx] = {
        ...inMemoryUsers[idx],
        ...data,
        ...(data.role && {
          role: data.role,
          roleAr: ROLE_NAMES_AR[data.role] || data.role,
        }),
      };
      const { passwordHash: _, ...rest } = inMemoryUsers[idx];
      return rest;
    }
  }

  static async toggleUserStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { isActive },
      });
    } catch {
      // in-memory fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      inMemoryUsers[idx].isActive = isActive;
    }
    return true;
  }

  static async resetPassword(id: string, newPasswordHash: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { passwordHash: newPasswordHash },
      });
    } catch {
      // in-memory fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      inMemoryUsers[idx].passwordHash = newPasswordHash;
    }
    return true;
  }

  static async updateLastLogin(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() } as any,
      });
    } catch {
      // in-memory fallback
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      inMemoryUsers[idx].lastLoginAt = new Date();
    }
  }
}
