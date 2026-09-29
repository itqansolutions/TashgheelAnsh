import { z } from "zod";

export const saleBatchAllocationSchema = z.object({
  batchId: z.string().min(1, "Batch ID is required"),
  quantity: z.coerce.number().positive("Batch quantity must be greater than 0"),
});

export const salesInvoiceLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().positive("Line quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  discountAmount: z.coerce.number().min(0).default(0),
  allocations: z
    .array(saleBatchAllocationSchema)
    .min(1, "At least one batch must be allocated for this line"),
  allowBelowCost: z.boolean().default(false),
}).refine(
  data => {
    const totalAllocated = data.allocations.reduce((sum, a) => sum + a.quantity, 0);
    return Math.abs(totalAllocated - data.quantity) < 0.0001;
  },
  {
    message: "Sum of batch allocations must match line quantity.",
    path: ["allocations"],
  }
);

export const createSalesInvoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  paymentMethod: z.enum(["CASH", "CREDIT", "BANK_TRANSFER", "PARTIAL"]).default("CREDIT"),
  notes: z.string().optional().nullable(),
  lines: z.array(salesInvoiceLineSchema).min(1, "At least one sales line is required"),
});

export type SaleBatchAllocationDto = z.infer<typeof saleBatchAllocationSchema>;
export type SalesInvoiceLineDto = z.infer<typeof salesInvoiceLineSchema>;
export type CreateSalesInvoiceInput = z.infer<typeof createSalesInvoiceSchema>;
