"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "./authActions";
import { PERMISSIONS } from "../permissions";
import { SettingsRepository } from "../repositories/settingsRepository";
import { getLogoStorageProvider } from "../storage/logoStorage";
import { AuditService } from "../services/auditService";
import prisma from "@/lib/db";

export async function updateCompanySettingsAction(formData: FormData) {
  const sessionUser = await requirePermission(PERMISSIONS.SETTINGS_EDIT);

  const nameAr = (formData.get("nameAr") as string)?.trim();
  const nameEn = (formData.get("nameEn") as string)?.trim();
  const taxNumber = (formData.get("taxNumber") as string)?.trim() || null;
  const commercialReg = (formData.get("commercialReg") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const mobile = (formData.get("mobile") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const printHeaderNotes = (formData.get("printHeaderNotes") as string)?.trim() || null;
  const printFooterNotes = (formData.get("printFooterNotes") as string)?.trim() || null;
  const currency = (formData.get("currency") as string)?.trim() || "EGP";
  const removeLogo = formData.get("removeLogo") === "true";

  if (!nameAr) {
    return { error: "اسم المنشأة باللغة العربية مطلوب ولا يمكن تركه فارغاً" };
  }

  try {
    let logoUrl: string | undefined | null = undefined;

    if (removeLogo) {
      logoUrl = null;
    } else {
      const logoFile = formData.get("logoFile") as File | null;
      if (logoFile && logoFile.size > 0) {
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const storageProvider = getLogoStorageProvider();
        const uploadResult = await storageProvider.uploadLogo({
          buffer,
          mimeType: logoFile.type || "image/png",
          filename: logoFile.name || "logo.png",
        });
        logoUrl = uploadResult.url;
      }
    }

    const currentSettings = await SettingsRepository.getSettings();
    const updatePayload: Record<string, any> = {
      nameAr,
      nameEn: nameEn || currentSettings.nameEn,
      taxNumber,
      commercialReg,
      phone,
      mobile,
      email,
      website,
      address,
      city,
      printHeaderNotes,
      printFooterNotes,
      currency,
    };

    if (logoUrl !== undefined) {
      updatePayload.logoUrl = logoUrl;
    }

    const updated = await SettingsRepository.updateSettings(
      updatePayload,
      sessionUser.id
    );

    try {
      await AuditService.log(prisma as any, {
        userId: sessionUser.id,
        action: logoUrl !== undefined ? "COMPANY_LOGO_UPDATED" : "COMPANY_SETTINGS_UPDATED",
        entity: "CompanySettings",
        entityId: "default-company",
        previousState: { nameAr: currentSettings.nameAr, taxNumber: currentSettings.taxNumber },
        newState: { nameAr: updated.nameAr, taxNumber: updated.taxNumber },
      });
    } catch {
      // non-blocking
    }

    revalidatePath("/settings");
    revalidatePath("/purchases");
    revalidatePath("/sales");
    revalidatePath("/manufacturing");
    revalidatePath("/inventory");
    revalidatePath("/suppliers");
    revalidatePath("/customers");

    return { success: true, settings: updated };
  } catch (err: any) {
    return { error: err.message || "فشل حفظ إعدادات الشركة" };
  }
}
