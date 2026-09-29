import prisma from "@/lib/db";
import { CreateSalesInvoiceInput } from "../validators/sales";
import { calculateSaleLineCostAndProfit } from "../domain/costing";

export interface MockSaleLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  netUnitPrice: number;
  lineSubtotal: number;
  totalCost: number;
  grossProfit: number;
  isBelowCost: boolean;
  allocations: Array<{
    batchNumber: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

export interface MockSale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  invoiceDate: string;
  dueDate?: string;
  paymentMethod: string;
  status: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPct: number;
  hasBelowCostLines: boolean;
  notes?: string;
  lines: MockSaleLine[];
  receipts: Array<{
    id: string;
    receiptDate: string;
    amount: number;
    referenceNumber: string;
    cashAccountName: string;
  }>;
}

let inMemorySales: MockSale[] = [
  {
    id: "sal-1",
    invoiceNumber: "SAL-2026-000001",
    customerId: "part-cust-1",
    customerName: "شركة الأهرام للتجارة والمقاولات",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    invoiceDate: "2026-05-18",
    dueDate: "2026-06-18",
    paymentMethod: "CREDIT",
    status: "OPEN",
    subtotal: 12000.0,
    discountAmount: 0,
    totalAmount: 12000.0,
    paidAmount: 5000.0,
    remainingAmount: 7000.0,
    totalCost: 8000.0,
    grossProfit: 4000.0,
    profitMarginPct: 33.33,
    hasBelowCostLines: false,
    notes: "توريد صاج معالج لمشروع العاصمة",
    lines: [
      {
        id: "sline-1",
        productId: "prod-1",
        productName: "لفائف صاج معالج سمك 2 مم",
        productSku: "RM-STEEL-01",
        quantity: 100,
        unitPrice: 120.0,
        discountAmount: 0,
        netUnitPrice: 120.0,
        lineSubtotal: 12000.0,
        totalCost: 8000.0,
        grossProfit: 4000.0,
        isBelowCost: false,
        allocations: [
          {
            batchNumber: "BAT-2026-000001",
            quantity: 100,
            unitCost: 80.0,
            totalCost: 8000.0,
          },
        ],
      },
    ],
    receipts: [
      {
        id: "rec-1",
        receiptDate: "2026-05-20",
        amount: 5000.0,
        referenceNumber: "REC-2026-000001",
        cashAccountName: "خزينة المركز الرئيسي",
      },
    ],
  },
];

export class SalesRepository {
  static async getSales(customerId?: string, status?: string, search?: string) {
    let result = [...inMemorySales];
    if (customerId) result = result.filter((s) => s.customerId === customerId);
    if (status) result = result.filter((s) => s.status === status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.invoiceNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  static async getSaleById(id: string) {
    return inMemorySales.find((s) => s.id === id) || null;
  }

  static async createSale(
    input: CreateSalesInvoiceInput,
    customerName: string,
    warehouseName: string,
    productNames: Record<string, { name: string; sku: string }>,
    batchDetails: Record<string, { batchNumber: string; unitCost: number }>
  ) {
    const nextSeq = `SAL-2026-${String(inMemorySales.length + 1).padStart(6, "0")}`;

    let invoiceSubtotal = 0;
    let invoiceDiscount = 0;
    let invoiceTotalCost = 0;
    let invoiceGrossProfit = 0;
    let hasBelowCost = false;

    const lines: MockSaleLine[] = input.lines.map((line, idx) => {
      const pInfo = productNames[line.productId] || { name: "صنف", sku: "SKU" };
      const allocDetails = line.allocations.map((a) => {
        const b = batchDetails[a.batchId] || { batchNumber: a.batchId, unitCost: 80 };
        return {
          batchNumber: b.batchNumber,
          quantity: a.quantity,
          unitCost: b.unitCost,
          totalCost: a.quantity * b.unitCost,
        };
      });

      const calc = calculateSaleLineCostAndProfit({
        orderedQuantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount || 0,
        allocations: allocDetails.map((a) => ({
          batchId: a.batchNumber,
          quantity: a.quantity,
          unitCost: a.unitCost,
        })),
      });

      invoiceSubtotal += calc.grossSellingAmount.toNumber();
      invoiceDiscount += line.discountAmount || 0;
      invoiceTotalCost += calc.totalCost.toNumber();
      invoiceGrossProfit += calc.grossProfit.toNumber();
      if (calc.isBelowCost) hasBelowCost = true;

      return {
        id: `sline-${Date.now()}-${idx}`,
        productId: line.productId,
        productName: pInfo.name,
        productSku: pInfo.sku,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount || 0,
        netUnitPrice: calc.netUnitPrice.toNumber(),
        lineSubtotal: calc.netSellingAmount.toNumber(),
        totalCost: calc.totalCost.toNumber(),
        grossProfit: calc.grossProfit.toNumber(),
        isBelowCost: calc.isBelowCost,
        allocations: allocDetails,
      };
    });

    const totalAmount = invoiceSubtotal - invoiceDiscount;
    const profitMarginPct = totalAmount > 0 ? (invoiceGrossProfit / totalAmount) * 100 : 0;

    const newSale: MockSale = {
      id: `sal-${Date.now()}`,
      invoiceNumber: nextSeq,
      customerId: input.customerId,
      customerName,
      warehouseId: input.warehouseId,
      warehouseName,
      invoiceDate: input.invoiceDate.toISOString().split("T")[0],
      dueDate: input.dueDate ? input.dueDate.toISOString().split("T")[0] : undefined,
      paymentMethod: input.paymentMethod,
      status: "OPEN",
      subtotal: invoiceSubtotal,
      discountAmount: invoiceDiscount,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      totalCost: invoiceTotalCost,
      grossProfit: invoiceGrossProfit,
      profitMarginPct: parseFloat(profitMarginPct.toFixed(2)),
      hasBelowCostLines: hasBelowCost,
      notes: input.notes || undefined,
      lines,
      receipts: [],
    };

    inMemorySales.unshift(newSale);
    return newSale;
  }

  static async recordCustomerReceipt(
    saleId: string,
    amount: number,
    referenceNumber: string,
    cashAccountName: string
  ) {
    const sale = inMemorySales.find((s) => s.id === saleId);
    if (!sale) throw new Error("Sale not found");

    sale.paidAmount += amount;
    sale.remainingAmount = Math.max(0, sale.totalAmount - sale.paidAmount);
    if (sale.remainingAmount === 0) {
      sale.status = "PAID";
    } else {
      sale.status = "PARTIALLY_PAID";
    }

    sale.receipts.push({
      id: `rec-${Date.now()}`,
      receiptDate: new Date().toISOString().split("T")[0],
      amount,
      referenceNumber,
      cashAccountName,
    });

    return sale;
  }
}
