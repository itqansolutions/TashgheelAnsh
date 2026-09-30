import prisma from "@/lib/db";

export interface CompanySettingsData {
  id: string;
  nameAr: string;
  nameEn: string;
  taxNumber?: string | null;
  commercialReg?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  printHeaderNotes?: string | null;
  printFooterNotes?: string | null;
  currency: string;
  updatedAt?: Date;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettingsData = {
  id: "default-company",
  nameAr: "تشغيل تريد للتجارة والتصنيع المشترك",
  nameEn: "TASHGHEEL TRADE — Trading • Inventory • Outsourced Manufacturing",
  taxNumber: "30098712300003",
  commercialReg: "498302",
  phone: "02-33445566",
  mobile: "01001234567",
  email: "contact@tashgheeltrade.com",
  website: "www.tashgheeltrade.com",
  address: "القاهرة، جمهورية مصر العربية",
  city: "القاهرة",
  country: "مصر",
  logoUrl: null,
  printHeaderNotes: null,
  printFooterNotes: "تم استخراج هذا المستند آلياً من نظام TASHGHEEL TRADE",
  currency: "EGP",
};

let inMemorySettings: CompanySettingsData = { ...DEFAULT_COMPANY_SETTINGS };

export class SettingsRepository {
  static async getSettings(): Promise<CompanySettingsData> {
    try {
      const dbSettings = await (prisma as any).companySettings.findUnique({
        where: { id: "default-company" },
      });

      if (dbSettings) {
        return dbSettings as CompanySettingsData;
      }

      // If not yet seeded in DB, create it
      const created = await (prisma as any).companySettings.create({
        data: DEFAULT_COMPANY_SETTINGS,
      });
      return created as CompanySettingsData;
    } catch {
      // In-memory fallback if database is offline or in unit test mode
      return inMemorySettings;
    }
  }

  static async updateSettings(
    data: Partial<CompanySettingsData>,
    userId?: string
  ): Promise<CompanySettingsData> {
    try {
      const updated = await (prisma as any).companySettings.upsert({
        where: { id: "default-company" },
        update: {
          ...data,
          updatedById: userId || null,
        },
        create: {
          ...DEFAULT_COMPANY_SETTINGS,
          ...data,
          id: "default-company",
          updatedById: userId || null,
        },
      });

      inMemorySettings = { ...updated };
      return updated as CompanySettingsData;
    } catch {
      // In-memory fallback
      inMemorySettings = {
        ...inMemorySettings,
        ...data,
        updatedAt: new Date(),
      };
      return inMemorySettings;
    }
  }
}
