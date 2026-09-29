import { z } from "zod";

export const createManufacturingOrderSchema = z.object({
  factoryId: z.string().min(1, "Factory is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  startDate: z.coerce.date(),
  expectedCompletionDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const addManufacturingInputSchema = z.object({
  manufacturingOrderId: z.string().min(1, "Manufacturing order is required"),
  batchId: z.string().min(1, "Batch is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().optional().nullable(),
});

export const addManufacturingExpenseSchema = z.object({
  manufacturingOrderId: z.string().min(1, "Manufacturing order is required"),
  categoryId: z.string().min(1, "Expense category is required"),
  expenseType: z.enum(["GENERAL_OPERATIONAL", "FACTORY_PAYABLE"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  factoryId: z.string().optional().nullable(),
  cashAccountId: z.string().optional().nullable(),
  description: z.string().min(2, "Description must be at least 2 characters"),
}).refine(
  data => (data.expenseType === "FACTORY_PAYABLE" ? !!data.factoryId : true),
  {
    message: "Factory partner must be specified for Factory Payable charges.",
    path: ["factoryId"],
  }
);

export const manufacturingOutputItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  allocationPercentage: z.coerce.number().min(0.01).max(100),
  notes: z.string().optional().nullable(),
});

export const closeManufacturingOrderSchema = z.object({
  manufacturingOrderId: z.string().min(1, "Manufacturing order is required"),
  actualCompletionDate: z.coerce.date().default(() => new Date()),
  outputs: z.array(manufacturingOutputItemSchema).min(1, "At least one output product is required"),
}).refine(
  data => {
    const sum = data.outputs.reduce((acc, curr) => acc + curr.allocationPercentage, 0);
    return Math.abs(sum - 100) < 0.01;
  },
  {
    message: "Output cost allocation percentages must sum exactly to 100.00%",
    path: ["outputs"],
  }
);

export type CreateManufacturingOrderInput = z.infer<typeof createManufacturingOrderSchema>;
export type AddManufacturingInputDto = z.infer<typeof addManufacturingInputSchema>;
export type AddManufacturingExpenseDto = z.infer<typeof addManufacturingExpenseSchema>;
export type CloseManufacturingOrderDto = z.infer<typeof closeManufacturingOrderSchema>;
