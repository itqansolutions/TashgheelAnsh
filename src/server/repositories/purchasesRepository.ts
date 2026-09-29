import prisma from "@/lib/db";
import { CreatePurchaseInvoiceInput } from "../validators/purchases";
import { PurchaseService } from "../services/purchaseService";

export interface MockPurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  discountAmount: number;
  lineTotal: number;
  batchNumber?: string;
}

export interface MockPurchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  invoiceDate: string;
  dueDate?: string;
  status: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  lines: MockPurchaseItem[];
  payments: Array<{
    id: string;
    paymentDate: string;
    amount: number;
    referenceNumber: string;
    cashAccountName: string;
  }>;
}

let inMemoryPurchases: MockPurchase[] = [
  {
    id: "pur-1",
    invoiceNumber: "PUR-2026-000001",
    supplierId: "part-sup-1",
    supplierName: "شركة النصر لتوريد الخامات المعدنية",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    invoiceDate: "2026-05-01",
    dueDate: "2026-05-31",
    status: "OPEN",
    subtotal: 40000.0,
    discountAmount: 0,
    totalAmount: 40000.0,
    paidAmount: 30000.0,
    remainingAmount: 10000.0,
    notes: "توريد دفعة صاج معالج للمشروع الأول",
    lines: [
      {
        id: "pline-1",
        productId: "prod-1",
        productSku: "RM-STEEL-01",
        productName: "لفائف صاج معالج سمك 2 مم",
        quantity: 500,
        unitCost: 80.0,
        discountAmount: 0,
        lineTotal: 40000.0,
        batchNumber: "BAT-2026-000001",
      },
    ],
    payments: [
      {
        id: "pay-1",
        paymentDate: "2026-05-15",
        amount: 30000.0,
        referenceNumber: "PAY-2026-000001",
        cashAccountName: "خزينة المركز الرئيسي",
      },
    ],
  },
];

export class PurchasesRepository {
  static async getPurchases(supplierId?: string, status?: string, search?: string) {
    let result = [...inMemoryPurchases];
    if (supplierId) {
      result = result.filter((p) => p.supplierId === supplierId);
    }
    if (status) {
      result = result.filter((p) => p.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  static async getPurchaseById(id: string) {
    return inMemoryPurchases.find((p) => p.id === id) || null;
  }

  static async postPurchase(
    input: CreatePurchaseInvoiceInput,
    supplierName: string,
    warehouseName: string,
    productNames: Record<string, { name: string; sku: string }>
  ) {
    const nextSeq = `PUR-2026-${String(inMemoryPurchases.length + 1).padStart(6, "0")}`;
    const nextBatchSeq = `BAT-2026-${String(inMemoryPurchases.length + 1).padStart(6, "0")}`;

    let subtotal = 0;
    let totalDiscount = 0;

    const lines: MockPurchaseItem[] = input.lines.map((l, idx) => {
      const lineTotal = l.quantity * l.unitCost - (l.discountAmount || 0);
      subtotal += l.quantity * l.unitCost;
      totalDiscount += l.discountAmount || 0;

      const pInfo = productNames[l.productId] || { name: "صنف", sku: "SKU" };
      return {
        id: `pline-${Date.now()}-${idx}`,
        productId: l.productId,
        productName: pInfo.name,
        productSku: pInfo.sku,
        quantity: l.quantity,
        unitCost: l.unitCost,
        discountAmount: l.discountAmount || 0,
        lineTotal,
        batchNumber: nextBatchSeq,
      };
    });

    const totalAmount = subtotal - totalDiscount;

    const newPurchase: MockPurchase = {
      id: `pur-${Date.now()}`,
      invoiceNumber: nextSeq,
      supplierId: input.supplierId,
      supplierName,
      warehouseId: input.warehouseId,
      warehouseName,
      invoiceDate: input.invoiceDate.toISOString().split("T")[0],
      dueDate: input.dueDate ? input.dueDate.toISOString().split("T")[0] : undefined,
      status: "OPEN",
      subtotal,
      discountAmount: totalDiscount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      notes: input.notes || undefined,
      lines,
      payments: [],
    };

    inMemoryPurchases.unshift(newPurchase);
    return newPurchase;
  }

  static async recordPurchasePayment(
    purchaseId: string,
    amount: number,
    referenceNumber: string,
    cashAccountName: string
  ) {
    const purchase = inMemoryPurchases.find((p) => p.id === purchaseId);
    if (!purchase) throw new Error("Purchase not found");

    purchase.paidAmount += amount;
    purchase.remainingAmount = Math.max(0, purchase.totalAmount - purchase.paidAmount);
    if (purchase.remainingAmount === 0) {
      purchase.status = "PAID";
    } else {
      purchase.status = "PARTIALLY_PAID";
    }

    purchase.payments.push({
      id: `pay-${Date.now()}`,
      paymentDate: new Date().toISOString().split("T")[0],
      amount,
      referenceNumber,
      cashAccountName,
    });

    return purchase;
  }
}
