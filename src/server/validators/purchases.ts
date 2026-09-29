import { z } from "zod";

export const purchaseLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitCost: z.coerce.number().min(0, "Unit cost cannot be negative"),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const createPurchaseInvoiceSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(purchaseLineSchema).min(1, "At least one purchase line is required"),
});

export type PurchaseLineInput = z.infer<typeof purchaseLineSchema>;
export type CreatePurchaseInvoiceInput = z.infer<typeof createPurchaseInvoiceSchema>;
