import { z } from "zod";

export const itemTypeEnum = z.enum([
  "RAW_MATERIAL",
  "SEMI_FINISHED",
  "FINISHED_PRODUCT",
  "SERVICE",
  "OTHER",
]);

export const createProductSchema = z.object({
  sku: z.string().min(2, "SKU must be at least 2 characters").max(50),
  name: z.string().min(2, "Product name must be at least 2 characters").max(150),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters").max(150),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Product category is required"),
  uomId: z.string().min(1, "Unit of measure is required"),
  itemType: itemTypeEnum,
  defaultSellingPrice: z.coerce.number().min(0, "Selling price cannot be negative").default(0),
  minSellingPrice: z.coerce.number().min(0, "Minimum selling price cannot be negative").default(0),
  referenceCost: z.coerce.number().min(0, "Reference cost cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
