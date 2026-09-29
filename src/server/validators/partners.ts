import { z } from "zod";

export const partnerBaseSchema = z.object({
  code: z.string().min(2, "Partner code must be at least 2 characters").max(50),
  name: z.string().min(2, "Partner name must be at least 2 characters").max(150),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters").max(150),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  isSupplier: z.boolean().default(false),
  isCustomer: z.boolean().default(false),
  isFactory: z.boolean().default(false),
  creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative").default(0),
  paymentTermsDays: z.coerce.number().int().min(0).default(0),
  openingBalance: z.coerce.number().default(0),
  notes: z.string().optional().nullable(),
});

export const createPartnerSchema = partnerBaseSchema.refine(
  data => data.isSupplier || data.isCustomer || data.isFactory,
  {
    message: "Partner must have at least one role: Supplier, Customer, or Factory.",
    path: ["isSupplier"],
  }
);

export const updatePartnerSchema = partnerBaseSchema.partial();
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
