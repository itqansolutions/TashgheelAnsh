export interface UploadedLogoResult {
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export interface ILogoStorageProvider {
  uploadLogo(file: {
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }): Promise<UploadedLogoResult>;
  deleteLogo(url: string): Promise<boolean>;
}

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

const MAX_LOGO_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

export class Base64DatabaseStorageProvider implements ILogoStorageProvider {
  async uploadLogo(file: {
    buffer: Buffer;
    mimeType: string;
    filename: string;
  }): Promise<UploadedLogoResult> {
    const { buffer, mimeType } = file;

    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(
        "نوع الملف غير مدعوم. الصيغ المسموح بها للشعار هي: PNG, JPG, JPEG, WEBP, SVG"
      );
    }

    if (buffer.length > MAX_LOGO_SIZE_BYTES) {
      throw new Error(
        `حجم ملف الشعار يتجاوز الحد الأقصى المسموح به (1.5 ميجابايت). الحجم الحالي: ${(
          buffer.length /
          (1024 * 1024)
        ).toFixed(2)} ميجابايت`
      );
    }

    const base64Data = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    return {
      url: dataUri,
      sizeBytes: buffer.length,
      mimeType,
    };
  }

  async deleteLogo(_url: string): Promise<boolean> {
    return true;
  }
}

// Factory function returning active storage provider
export function getLogoStorageProvider(): ILogoStorageProvider {
  // In the future, this can inspect process.env.STORAGE_DRIVER === 's3' and return S3StorageProvider
  return new Base64DatabaseStorageProvider();
}
