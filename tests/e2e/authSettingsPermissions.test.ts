import { describe, it, expect, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { UsersRepository } from "@/server/repositories/usersRepository";
import { SettingsRepository, DEFAULT_COMPANY_SETTINGS } from "@/server/repositories/settingsRepository";
import { Base64DatabaseStorageProvider } from "@/server/storage/logoStorage";
import {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
  PermissionCode,
} from "@/server/permissions";
import { SESSION_COOKIE_NAME } from "@/server/auth/types";

describe("Phase 3: Auth, User Management, Permissions & Company Settings", () => {
  /* ---------------- 1. Users Repository & RBAC ---------------- */
  describe("UsersRepository", () => {
    it("should list existing users with mapped roles and Arabic titles", async () => {
      const users = await UsersRepository.getUsers();
      expect(users.length).toBeGreaterThan(0);

      const admin = users.find((u) => u.username === "admin");
      expect(admin).toBeDefined();
      expect(admin?.role).toBe("ADMIN");
      expect(admin?.roleAr).toBe("مدير النظام العام");
      expect(admin?.isActive).toBe(true);
    });

    it("should retrieve user by username or by email case-insensitively", async () => {
      const byUser = await UsersRepository.getUserByEmailOrUsername("ADMIN");
      expect(byUser).toBeDefined();
      expect(byUser?.username).toBe("admin");

      const byEmail = await UsersRepository.getUserByEmailOrUsername("admin@tashgheel.com");
      expect(byEmail).toBeDefined();
      expect(byEmail?.id).toBe(byUser?.id);
    });

    it("should create a new user with valid hashed password and role", async () => {
      const uniqueUsername = `testuser_${Date.now()}`;
      const uniqueEmail = `${uniqueUsername}@tashgheel.com`;
      const passHash = await bcrypt.hash("securePassword123", 10);

      const newUser = await UsersRepository.createUser({
        name: "مستخدم تجريبي جديد",
        username: uniqueUsername,
        email: uniqueEmail,
        phone: "01099998888",
        passwordHash: passHash,
        role: "SALES",
      });

      expect(newUser.id).toBeDefined();
      expect(newUser.username).toBe(uniqueUsername);
      expect(newUser.email).toBe(uniqueEmail);
      expect(newUser.role).toBe("SALES");
      expect(newUser.isActive).toBe(true);

      // Verify password
      const retrieved = await UsersRepository.getUserById(newUser.id);
      expect(retrieved).toBeDefined();
      const match = await bcrypt.compare("securePassword123", retrieved!.passwordHash);
      expect(match).toBe(true);
    });

    it("should reject creating a user with duplicate email or username", async () => {
      const passHash = await bcrypt.hash("pass1234", 10);
      await expect(
        UsersRepository.createUser({
          name: "مستخدم مكرر",
          username: "admin", // existing
          email: "unique_new_email@tashgheel.com",
          passwordHash: passHash,
          role: "USER",
        })
      ).rejects.toThrow();

      await expect(
        UsersRepository.createUser({
          name: "مستخدم مكرر بريد",
          username: "brand_new_username",
          email: "admin@tashgheel.com", // existing
          passwordHash: passHash,
          role: "USER",
        })
      ).rejects.toThrow();
    });

    it("should update user information and toggle status", async () => {
      const users = await UsersRepository.getUsers();
      const testSubject = users.find((u) => u.username !== "admin") || users[0];

      // Update
      const updated = await UsersRepository.updateUser(testSubject.id, {
        name: "اسم معدل للتجربة",
        phone: "01200001111",
      });
      expect(updated.name).toBe("اسم معدل للتجربة");
      expect(updated.phone).toBe("01200001111");

      // Toggle status
      await UsersRepository.toggleUserStatus(testSubject.id, false);
      const afterDeactivation = await UsersRepository.getUserById(testSubject.id);
      expect(afterDeactivation?.isActive).toBe(false);

      // Restore status
      await UsersRepository.toggleUserStatus(testSubject.id, true);
      const afterActivation = await UsersRepository.getUserById(testSubject.id);
      expect(afterActivation?.isActive).toBe(true);
    });

    it("should reset user password correctly", async () => {
      const users = await UsersRepository.getUsers();
      const targetUser = users.find((u) => u.username === "accountant") || users[0];

      const newPassHash = await bcrypt.hash("newSecretPass789", 10);
      await UsersRepository.resetPassword(targetUser.id, newPassHash);

      const refreshed = await UsersRepository.getUserById(targetUser.id);
      const isNewValid = await bcrypt.compare("newSecretPass789", refreshed!.passwordHash);
      expect(isNewValid).toBe(true);
    });
  });

  /* ---------------- 2. Permissions & Matrix Checks ---------------- */
  describe("Granular Permissions Matrix", () => {
    it("ADMIN role should possess all permissions automatically via hasPermission()", () => {
      expect(hasPermission("ADMIN", [], PERMISSIONS.SETTINGS_EDIT)).toBe(true);
      expect(hasPermission("ADMIN", [], PERMISSIONS.USERS_CREATE)).toBe(true);
      expect(hasPermission("ADMIN", [], PERMISSIONS.SALES_SELL_BELOW_COST)).toBe(true);
      expect(hasPermission("ADMIN", [], PERMISSIONS.MANUFACTURING_CLOSE)).toBe(true);
    });

    it("SALES role should NOT have permission to edit settings or sell below cost without grant", () => {
      const salesPermissions = DEFAULT_ROLE_PERMISSIONS.SALES;
      expect(salesPermissions).toBeDefined();

      expect(hasPermission("SALES", salesPermissions, PERMISSIONS.SETTINGS_EDIT)).toBe(false);
      expect(hasPermission("SALES", salesPermissions, PERMISSIONS.SALES_SELL_BELOW_COST)).toBe(false);
      expect(hasPermission("SALES", salesPermissions, PERMISSIONS.SALES_CREATE)).toBe(true);
    });

    it("Custom permissions should supplement the user's base role permissions", () => {
      const customGrant: PermissionCode[] = [PERMISSIONS.SALES_SELL_BELOW_COST];
      const salesPermissions = DEFAULT_ROLE_PERMISSIONS.SALES;

      // With custom grant
      expect(hasPermission("SALES", [...salesPermissions, ...customGrant], PERMISSIONS.SALES_SELL_BELOW_COST)).toBe(true);
    });
  });

  /* ---------------- 3. Company Settings & Branding ---------------- */
  describe("SettingsRepository & Company Branding", () => {
    it("should retrieve default settings containing official TASHGHEEL TRADE branding", async () => {
      const settings = await SettingsRepository.getSettings();
      expect(settings).toBeDefined();
      expect(settings.nameEn).toContain("TASHGHEEL TRADE");
      expect(settings.currency).toBe("EGP");
    });

    it("should update company settings and persist changes", async () => {
      const updated = await SettingsRepository.updateSettings({
        nameAr: "تشغيل تريد للتجارة والتصنيع المشترك المعتمدة",
        taxNumber: "999-888-777",
        commercialReg: "123456",
        phone: "02-99887766",
        printFooterNotes: "مستند تجاري رسمي صادر من TASHGHEEL TRADE",
      });

      expect(updated.nameAr).toBe("تشغيل تريد للتجارة والتصنيع المشترك المعتمدة");
      expect(updated.taxNumber).toBe("999-888-777");
      expect(updated.commercialReg).toBe("123456");
      expect(updated.printFooterNotes).toBe("مستند تجاري رسمي صادر من TASHGHEEL TRADE");

      // Verify getter reflects updated state
      const reFetched = await SettingsRepository.getSettings();
      expect(reFetched.taxNumber).toBe("999-888-777");
    });
  });

  /* ---------------- 4. Logo Storage Provider ---------------- */
  describe("LogoStorageProvider", () => {
    const provider = new Base64DatabaseStorageProvider();

    it("should validate and encode valid PNG/JPEG logo", async () => {
      const fakePngBuffer = Buffer.from("fake-png-image-content-for-testing");
      const result = await provider.uploadLogo({
        buffer: fakePngBuffer,
        mimeType: "image/png",
        filename: "test-logo.png",
      });

      expect(result.url).toBeDefined();
      expect(result.url).toMatch(/^data:image\/png;base64,/);
    });

    it("should reject files exceeding 1.5MB", async () => {
      // 1.6 MB buffer
      const largeBuffer = Buffer.alloc(1.6 * 1024 * 1024);
      await expect(
        provider.uploadLogo({
          buffer: largeBuffer,
          mimeType: "image/png",
          filename: "huge.png",
        })
      ).rejects.toThrow("1.5 ميجابايت");
    });

    it("should reject unsupported mime types", async () => {
      const docBuffer = Buffer.from("pdf-contents");
      await expect(
        provider.uploadLogo({
          buffer: docBuffer,
          mimeType: "application/pdf",
          filename: "document.pdf",
        })
      ).rejects.toThrow("نوع الملف غير مدعوم");
    });
  });

  /* ---------------- 5. Session Architecture ---------------- */
  describe("Auth Architecture & Session Standards", () => {
    it("SESSION_COOKIE_NAME should be standard erp_session", () => {
      expect(SESSION_COOKIE_NAME).toBe("erp_session");
    });
  });
});
