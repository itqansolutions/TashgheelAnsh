import prisma from "@/lib/db";
import {
  AddManufacturingExpenseDto,
  AddManufacturingInputDto,
  CloseManufacturingOrderDto,
  CreateManufacturingOrderInput,
} from "../validators/manufacturing";
import { ManufacturingService } from "../services/manufacturingService";
import { allocateManufacturingCosts } from "../domain/costing";

export interface MockManufacturingOrder {
  id: string;
  orderNumber: string;
  factoryId: string;
  factoryName: string;
  warehouseId: string;
  warehouseName: string;
  startDate: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  status: "DRAFT" | "OPEN" | "IN_PROGRESS" | "READY_TO_CLOSE" | "CLOSED" | "CANCELLED";
  totalMaterialCost: number;
  totalExpenseCost: number;
  totalFactoryCost: number;
  totalManufacturingCost: number;
  notes?: string;
  inputs: Array<{
    id: string;
    productId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  expenses: Array<{
    id: string;
    categoryName: string;
    expenseType: "GENERAL_OPERATIONAL" | "FACTORY_PAYABLE";
    amount: number;
    description: string;
  }>;
  outputs: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    allocationPercentage: number;
    allocatedCost: number;
    calculatedUnitCost: number;
    batchNumber?: string;
  }>;
}

let inMemoryOrders: MockManufacturingOrder[] = [
  {
    id: "mfg-1",
    orderNumber: "MFG-2026-000001",
    factoryId: "part-fac-1",
    factoryName: "مصنع الأمل للصناعات والتشكيل",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    startDate: "2026-05-10",
    expectedCompletionDate: "2026-05-20",
    actualCompletionDate: "2026-05-12",
    status: "CLOSED",
    totalMaterialCost: 8000.0,
    totalExpenseCost: 2000.0,
    totalFactoryCost: 15000.0,
    totalManufacturingCost: 25000.0,
    notes: "تشغيل دفعة هياكل كبائن سمك 2 مم",
    inputs: [
      {
        id: "min-1",
        productId: "prod-1",
        productName: "لفائف صاج معالج سمك 2 مم",
        batchNumber: "BAT-2026-000001",
        quantity: 100,
        unitCost: 80.0,
        totalCost: 8000.0,
      },
    ],
    expenses: [
      {
        id: "mexp-1",
        categoryName: "نقل ومشال ومناولة",
        expenseType: "GENERAL_OPERATIONAL",
        amount: 2000.0,
        description: "شحن خامات الصاج للمصنع",
      },
      {
        id: "mexp-2",
        categoryName: "خدمات تصنيع وتشغيل",
        expenseType: "FACTORY_PAYABLE",
        amount: 15000.0,
        description: "أتعاب تشغيل وتشكيل وثني ولحام",
      },
    ],
    outputs: [
      {
        id: "mout-1",
        productId: "prod-2",
        productName: "هيكل كابينة نصف مجمع",
        quantity: 120,
        allocationPercentage: 100.0,
        allocatedCost: 25000.0,
        calculatedUnitCost: 208.33,
        batchNumber: "BAT-2026-000002",
      },
    ],
  },
  {
    id: "mfg-2",
    orderNumber: "MFG-2026-000002",
    factoryId: "part-fac-1",
    factoryName: "مصنع الأمل للصناعات والتشكيل",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    startDate: "2026-05-22",
    expectedCompletionDate: "2026-06-05",
    status: "OPEN",
    totalMaterialCost: 16000.0,
    totalExpenseCost: 3000.0,
    totalFactoryCost: 20000.0,
    totalManufacturingCost: 39000.0,
    notes: "أمر تشغيل لوحات توزيع متعددة المخرجات",
    inputs: [
      {
        id: "min-2",
        productId: "prod-1",
        productName: "لفائف صاج معالج سمك 2 مم",
        batchNumber: "BAT-2026-000001",
        quantity: 200,
        unitCost: 80.0,
        totalCost: 16000.0,
      },
    ],
    expenses: [
      {
        id: "mexp-3",
        categoryName: "نقل ومشال",
        expenseType: "GENERAL_OPERATIONAL",
        amount: 3000.0,
        description: "نقل وتعتيق",
      },
      {
        id: "mexp-4",
        categoryName: "خدمات تصنيع",
        expenseType: "FACTORY_PAYABLE",
        amount: 20000.0,
        description: "أتعاب تقطيع ليزر وتشكيل",
      },
    ],
    outputs: [],
  },
];

export class ManufacturingRepository {
  static async getOrders(factoryId?: string, status?: string) {
    let result = [...inMemoryOrders];
    if (factoryId) result = result.filter((o) => o.factoryId === factoryId);
    if (status) result = result.filter((o) => o.status === status);
    return result;
  }

  static async getOrderById(id: string) {
    return inMemoryOrders.find((o) => o.id === id) || null;
  }

  static async createOrder(
    input: CreateManufacturingOrderInput,
    factoryName: string,
    warehouseName: string
  ) {
    const nextSeq = `MFG-2026-${String(inMemoryOrders.length + 1).padStart(6, "0")}`;
    const newOrder: MockManufacturingOrder = {
      id: `mfg-${Date.now()}`,
      orderNumber: nextSeq,
      factoryId: input.factoryId,
      factoryName,
      warehouseId: input.warehouseId,
      warehouseName,
      startDate: input.startDate.toISOString().split("T")[0],
      expectedCompletionDate: input.expectedCompletionDate
        ? input.expectedCompletionDate.toISOString().split("T")[0]
        : undefined,
      status: "OPEN",
      totalMaterialCost: 0,
      totalExpenseCost: 0,
      totalFactoryCost: 0,
      totalManufacturingCost: 0,
      notes: input.notes || undefined,
      inputs: [],
      expenses: [],
      outputs: [],
    };
    inMemoryOrders.unshift(newOrder);
    return newOrder;
  }

  static async addInput(
    orderId: string,
    productId: string,
    productName: string,
    batchNumber: string,
    quantity: number,
    unitCost: number
  ) {
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const totalCost = quantity * unitCost;
    order.inputs.push({
      id: `min-${Date.now()}`,
      productId,
      productName,
      batchNumber,
      quantity,
      unitCost,
      totalCost,
    });

    order.totalMaterialCost += totalCost;
    order.totalManufacturingCost += totalCost;
    order.status = "IN_PROGRESS";
    return order;
  }

  static async addExpense(
    orderId: string,
    categoryName: string,
    expenseType: "GENERAL_OPERATIONAL" | "FACTORY_PAYABLE",
    amount: number,
    description: string
  ) {
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.expenses.push({
      id: `mexp-${Date.now()}`,
      categoryName,
      expenseType,
      amount,
      description,
    });

    if (expenseType === "FACTORY_PAYABLE") {
      order.totalFactoryCost += amount;
    } else {
      order.totalExpenseCost += amount;
    }
    order.totalManufacturingCost += amount;
    return order;
  }

  static async closeOrder(
    orderId: string,
    outputs: Array<{
      productId: string;
      productName: string;
      quantity: number;
      allocationPercentage: number;
    }>
  ) {
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const allocation = allocateManufacturingCosts({
      totalManufacturingCost: order.totalManufacturingCost,
      outputs: outputs.map((o) => ({
        productId: o.productId,
        warehouseId: order.warehouseId,
        quantity: o.quantity,
        allocationPercentage: o.allocationPercentage,
      })),
    });

    order.outputs = allocation.allocatedOutputs.map((out, idx) => {
      const pName = outputs[idx]?.productName || "منتج مخرج";
      const batchNumber = `BAT-2026-${Date.now().toString().slice(-6)}`;
      return {
        id: `mout-${Date.now()}-${idx}`,
        productId: out.productId,
        productName: pName,
        quantity: out.quantity.toNumber(),
        allocationPercentage: out.allocationPercentage.toNumber(),
        allocatedCost: out.allocatedCost.toNumber(),
        calculatedUnitCost: out.calculatedUnitCost.toNumber(),
        batchNumber,
      };
    });

    order.status = "CLOSED";
    order.actualCompletionDate = new Date().toISOString().split("T")[0];
    return order;
  }
}
