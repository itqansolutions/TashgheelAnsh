import prisma from "@/lib/db";

export interface MockBatchItem {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  productSku: string;
  itemType: "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED_PRODUCT";
  warehouseId: string;
  warehouseName: string;
  sourceType: "PURCHASE" | "MANUFACTURING" | "OPENING_BALANCE" | "RETURN";
  sourceDocumentNumber: string;
  sourceDocumentId: string;
  initialQuantity: number;
  remainingQuantity: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
  expiryDate?: string;
  timeline: Array<{
    title: string;
    description: string;
    date: string;
    documentType: string;
    documentNumber: string;
    linkUrl: string;
    type: "in" | "out" | "mfg" | "sale";
  }>;
}

export interface MockInventoryMovement {
  id: string;
  transactionNumber: string;
  date: string;
  productName: string;
  productSku: string;
  batchNumber: string;
  warehouseName: string;
  type: string;
  typeLabel: string;
  referenceDocument: string;
  inQuantity: number;
  outQuantity: number;
  balanceAfter: number;
  unitCost: number;
}

let inMemoryBatches: MockBatchItem[] = [
  {
    id: "bat-001",
    batchNumber: "BAT-2026-000001",
    productId: "prod-1",
    productName: "لفائف صاج معالج سمك 2 مم",
    productSku: "RM-STEEL-01",
    itemType: "RAW_MATERIAL",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    sourceType: "PURCHASE",
    sourceDocumentNumber: "PUR-2026-000001",
    sourceDocumentId: "pur-1",
    initialQuantity: 500,
    remainingQuantity: 300, // 100 consumed in MFG, 100 sold
    unitCost: 80.0,
    totalCost: 24000.0,
    createdAt: "2026-05-01",
    timeline: [
      {
        title: "توريد واستلام بضاعة (Purchase Receipt)",
        description: "استلام 500 كجم صاج من شركة النصر لتوريد الخامات",
        date: "2026-05-01",
        documentType: "فاتورة توريد",
        documentNumber: "PUR-2026-000001",
        linkUrl: "/purchases/pur-1",
        type: "in",
      },
      {
        title: "استهلاك في أمر تشغيل وتصنيع خارجي",
        description: "صرف 100 كجم لمصنع الأمل لتصنيع هياكل كبائن (MFG-2026-000001)",
        date: "2026-05-10",
        documentType: "أمر تصنيع",
        documentNumber: "MFG-2026-000001",
        linkUrl: "/manufacturing/mfg-1",
        type: "mfg",
      },
      {
        title: "بيع وتوزيع مباشر للعميل",
        description: "صرف 100 كجم لشركة الأهرام للتجارة (SAL-2026-000001)",
        date: "2026-05-18",
        documentType: "فاتورة بيع",
        documentNumber: "SAL-2026-000001",
        linkUrl: "/sales/sal-1",
        type: "sale",
      },
    ],
  },
  {
    id: "bat-002",
    batchNumber: "BAT-2026-000002",
    productId: "prod-2",
    productName: "هيكل كابينة نصف مجمع",
    productSku: "SF-FRAME-01",
    itemType: "SEMI_FINISHED",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    sourceType: "MANUFACTURING",
    sourceDocumentNumber: "MFG-2026-000001",
    sourceDocumentId: "mfg-1",
    initialQuantity: 120,
    remainingQuantity: 120,
    unitCost: 185.0,
    totalCost: 22200.0,
    createdAt: "2026-05-12",
    timeline: [
      {
        title: "إنتاج وتوريد من مصنع الأمل الهندسي",
        description: "إتمام أمر تشغيل MFG-2026-000001 وتوزيع التكاليف",
        date: "2026-05-12",
        documentType: "أمر تصنيع",
        documentNumber: "MFG-2026-000001",
        linkUrl: "/manufacturing/mfg-1",
        type: "mfg",
      },
    ],
  },
  {
    id: "bat-003",
    batchNumber: "BAT-2026-000003",
    productId: "prod-3",
    productName: "لوحة توزيع كهربائية قياسية",
    productSku: "FP-CABINET-01",
    itemType: "FINISHED_PRODUCT",
    warehouseId: "wh-1",
    warehouseName: "المستودع الرئيسي - 6 أكتوبر",
    sourceType: "MANUFACTURING",
    sourceDocumentNumber: "MFG-2026-000002",
    sourceDocumentId: "mfg-2",
    initialQuantity: 50,
    remainingQuantity: 35,
    unitCost: 520.0,
    totalCost: 18200.0,
    createdAt: "2026-05-14",
    timeline: [
      {
        title: "إتمام إنتاج منتج تام الصنع",
        description: "إنتاج 50 كابينة بتكلفة وحدة 520.00 EGP",
        date: "2026-05-14",
        documentType: "أمر تصنيع",
        documentNumber: "MFG-2026-000002",
        linkUrl: "/manufacturing/mfg-2",
        type: "mfg",
      },
      {
        title: "بيع وتوريد للعميل",
        description: "صرف 15 كابينة في فاتورة مبيعات SAL-2026-000002",
        date: "2026-05-20",
        documentType: "فاتورة بيع",
        documentNumber: "SAL-2026-000002",
        linkUrl: "/sales/sal-2",
        type: "sale",
      },
    ],
  },
];

let inMemoryMovements: MockInventoryMovement[] = [
  {
    id: "itx-1",
    transactionNumber: "ITX-2026-000001",
    date: "2026-05-01",
    productName: "لفائف صاج معالج سمك 2 مم",
    productSku: "RM-STEEL-01",
    batchNumber: "BAT-2026-000001",
    warehouseName: "المستودع الرئيسي",
    type: "PURCHASE_RECEIPT",
    typeLabel: "استلام توريد شراء",
    referenceDocument: "PUR-2026-000001",
    inQuantity: 500,
    outQuantity: 0,
    balanceAfter: 500,
    unitCost: 80.0,
  },
  {
    id: "itx-2",
    transactionNumber: "ITX-2026-000002",
    date: "2026-05-10",
    productName: "لفائف صاج معالج سمك 2 مم",
    productSku: "RM-STEEL-01",
    batchNumber: "BAT-2026-000001",
    warehouseName: "المستودع الرئيسي",
    type: "MANUFACTURING_CONSUMPTION",
    typeLabel: "صرف استهلاك تشغيل",
    referenceDocument: "MFG-2026-000001",
    inQuantity: 0,
    outQuantity: 100,
    balanceAfter: 400,
    unitCost: 80.0,
  },
  {
    id: "itx-3",
    transactionNumber: "ITX-2026-000003",
    date: "2026-05-12",
    productName: "هيكل كابينة نصف مجمع",
    productSku: "SF-FRAME-01",
    batchNumber: "BAT-2026-000002",
    warehouseName: "المستودع الرئيسي",
    type: "MANUFACTURING_OUTPUT",
    typeLabel: "استلام مخرجات تصنيع",
    referenceDocument: "MFG-2026-000001",
    inQuantity: 120,
    outQuantity: 0,
    balanceAfter: 120,
    unitCost: 185.0,
  },
  {
    id: "itx-4",
    transactionNumber: "ITX-2026-000004",
    date: "2026-05-18",
    productName: "لفائف صاج معالج سمك 2 مم",
    productSku: "RM-STEEL-01",
    batchNumber: "BAT-2026-000001",
    warehouseName: "المستودع الرئيسي",
    type: "SALE",
    typeLabel: "صرف فاتورة بيع",
    referenceDocument: "SAL-2026-000001",
    inQuantity: 0,
    outQuantity: 100,
    balanceAfter: 300,
    unitCost: 80.0,
  },
];

export class InventoryRepository {
  static async getInventoryValuation() {
    const totalValue = inMemoryBatches.reduce((sum, b) => sum + b.remainingQuantity * b.unitCost, 0);
    const rawMaterialsValue = inMemoryBatches
      .filter((b) => b.itemType === "RAW_MATERIAL")
      .reduce((sum, b) => sum + b.remainingQuantity * b.unitCost, 0);
    const semiFinishedValue = inMemoryBatches
      .filter((b) => b.itemType === "SEMI_FINISHED")
      .reduce((sum, b) => sum + b.remainingQuantity * b.unitCost, 0);
    const finishedGoodsValue = inMemoryBatches
      .filter((b) => b.itemType === "FINISHED_PRODUCT")
      .reduce((sum, b) => sum + b.remainingQuantity * b.unitCost, 0);

    return {
      totalValue,
      rawMaterialsValue,
      semiFinishedValue,
      finishedGoodsValue,
      activeBatchesCount: inMemoryBatches.filter((b) => b.remainingQuantity > 0).length,
    };
  }

  static async getBatches(productId?: string, warehouseId?: string, search?: string) {
    let result = [...inMemoryBatches];
    if (productId) result = result.filter((b) => b.productId === productId);
    if (warehouseId) result = result.filter((b) => b.warehouseId === warehouseId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(q) ||
          b.productName.includes(q) ||
          b.productSku.toLowerCase().includes(q)
      );
    }
    return result;
  }

  static async getBatchByIdOrNumber(idOrNumber: string) {
    return (
      inMemoryBatches.find(
        (b) => b.id === idOrNumber || b.batchNumber === idOrNumber
      ) || null
    );
  }

  static async getMovements(productId?: string, batchNumber?: string, type?: string) {
    let result = [...inMemoryMovements];
    if (batchNumber) result = result.filter((m) => m.batchNumber === batchNumber);
    if (type) result = result.filter((m) => m.type === type);
    return result;
  }

  static async addBatch(batch: MockBatchItem) {
    inMemoryBatches.unshift(batch);
    return batch;
  }

  static async deductBatchQuantity(idOrNumber: string, quantity: number) {
    const batch = inMemoryBatches.find(
      (b) => b.id === idOrNumber || b.batchNumber === idOrNumber
    );
    if (!batch) throw new Error(`Batch ${idOrNumber} not found`);
    if (batch.remainingQuantity < quantity) {
      throw new Error(`Insufficient batch quantity: remaining ${batch.remainingQuantity}, requested ${quantity}`);
    }
    batch.remainingQuantity -= quantity;
    return batch;
  }

  static async recordMovement(mov: Omit<MockInventoryMovement, "id" | "transactionNumber">) {
    const nextSeq = `ITX-2026-${String(inMemoryMovements.length + 1).padStart(6, "0")}`;
    const newMovement: MockInventoryMovement = {
      id: `itx-${Date.now()}`,
      transactionNumber: nextSeq,
      ...mov,
    };
    inMemoryMovements.unshift(newMovement);
    return newMovement;
  }
}
