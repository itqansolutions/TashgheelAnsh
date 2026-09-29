import { describe, it, expect, vi } from "vitest";
import { DocumentSequenceService } from "../../src/server/services/documentSequenceService";
import { InventoryService } from "../../src/server/services/inventoryService";
import { LedgerService } from "../../src/server/services/ledgerService";
import { PurchaseService } from "../../src/server/services/purchaseService";
import { ManufacturingService } from "../../src/server/services/manufacturingService";
import { SalesService } from "../../src/server/services/salesService";

describe("Services: DocumentSequenceService", () => {
  it("should generate formatted contiguous document numbers with prefix and year", async () => {
    const mockTx: any = {
      documentSequence: {
        upsert: vi.fn().mockResolvedValue({ currentNumber: 42 }),
      },
    };

    const num = await DocumentSequenceService.getNextNumber(
      mockTx,
      "PURCHASE",
      new Date("2026-05-15")
    );
    expect(num).toBe("PUR-2026-000042");
    expect(mockTx.documentSequence.upsert).toHaveBeenCalledWith({
      where: {
        documentType_year: {
          documentType: "PURCHASE",
          year: 2026,
        },
      },
      update: { currentNumber: { increment: 1 } },
      create: {
        documentType: "PURCHASE",
        prefix: "PUR",
        year: 2026,
        currentNumber: 1,
      },
    });
  });
});

describe("Services: InventoryService Concurrency & Stock Decrement", () => {
  it("should reject decrement when requested quantity exceeds batch remaining quantity", async () => {
    const mockTx: any = {
      inventoryBatch: {
        findUnique: vi.fn().mockResolvedValue({
          id: "batch-1",
          batchNumber: "BAT-2026-000001",
          productId: "prod-1",
          warehouseId: "wh-1",
          remainingQuantity: "25.0000",
          unitCost: "80.0000",
        }),
      },
    };

    await expect(
      InventoryService.decrementBatch(mockTx, {
        batchId: "batch-1",
        quantity: 30, // Exceeds 25
        transactionType: "SALE",
        referenceDocumentType: "SALES_INVOICE",
        referenceDocumentId: "sale-1",
      })
    ).rejects.toThrowError(/Insufficient quantity in batch/);
  });

  it("should successfully decrement batch and log outward inventory transaction", async () => {
    const mockTx: any = {
      inventoryBatch: {
        findUnique: vi.fn().mockResolvedValue({
          id: "batch-1",
          batchNumber: "BAT-2026-000001",
          productId: "prod-1",
          warehouseId: "wh-1",
          remainingQuantity: "100.0000",
          unitCost: "80.0000",
        }),
        update: vi.fn().mockResolvedValue({
          id: "batch-1",
          remainingQuantity: "60.0000",
        }),
      },
      documentSequence: {
        upsert: vi.fn().mockResolvedValue({ currentNumber: 10 }),
      },
      inventoryTransaction: {
        create: vi.fn().mockResolvedValue({ id: "tx-1" }),
      },
    };

    const result = await InventoryService.decrementBatch(mockTx, {
      batchId: "batch-1",
      quantity: 40,
      transactionType: "SALE",
      referenceDocumentType: "SALES_INVOICE",
      referenceDocumentId: "sale-1",
    });

    expect(result.deductedQuantity.toNumber()).toBe(40);
    expect(result.totalCost.toNumber()).toBe(3200); // 40 * 80
    expect(mockTx.inventoryBatch.update).toHaveBeenCalledWith({
      where: { id: "batch-1" },
      data: { remainingQuantity: "60.0000" },
    });
    expect(mockTx.inventoryTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        quantity: "-40.0000",
        unitCost: "80.0000",
        totalCost: "3200.0000",
        transactionType: "SALE",
      }),
    });
  });
});

describe("Services: ManufacturingService Execution", () => {
  it("should close manufacturing order and create capitalized output batches with allocated costs", async () => {
    const mockTx: any = {
      manufacturingOrder: {
        findUnique: vi.fn().mockResolvedValue({
          id: "mfg-1",
          orderNumber: "MFG-2026-000001",
          factoryId: "fac-1",
          status: "IN_PROGRESS",
          totalManufacturingCost: "120000.0000",
          inputs: [{ id: "in-1" }],
          expenses: [
            {
              id: "exp-1",
              expenseType: "FACTORY_PAYABLE",
              amount: "15000.0000",
              description: "Manufacturing service charge",
            },
          ],
        }),
        update: vi.fn().mockResolvedValue({ id: "mfg-1", status: "CLOSED" }),
      },
      documentSequence: {
        upsert: vi.fn().mockResolvedValue({ currentNumber: 1 }),
      },
      inventoryBatch: {
        create: vi.fn().mockResolvedValue({ id: "batch-out-1" }),
      },
      inventoryTransaction: {
        create: vi.fn().mockResolvedValue({ id: "itx-out-1" }),
      },
      manufacturingOutput: {
        create: vi.fn().mockResolvedValue({ id: "out-1" }),
      },
      businessPartner: {
        findUnique: vi.fn().mockResolvedValue({
          id: "fac-1",
          currentBalance: "0.0000",
          isFactory: true,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      partnerLedgerEntry: {
        create: vi.fn().mockResolvedValue({ id: "led-1" }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    };

    const closed = await ManufacturingService.closeOrder(mockTx, {
      manufacturingOrderId: "mfg-1",
      actualCompletionDate: new Date(),
      outputs: [
        {
          productId: "prod-out-1",
          warehouseId: "wh-1",
          quantity: 500,
          allocationPercentage: 60,
        },
        {
          productId: "prod-out-2",
          warehouseId: "wh-1",
          quantity: 300,
          allocationPercentage: 40,
        },
      ],
    });

    expect(closed.status).toBe("CLOSED");
    // Verify 2 batches were created for the two outputs
    expect(mockTx.inventoryBatch.create).toHaveBeenCalledTimes(2);
    // Verify factory ledger credited for Type B factory charge (15,000 EGP)
    expect(mockTx.partnerLedgerEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        partnerId: "fac-1",
        credit: "15000.0000",
        referenceType: "MANUFACTURING_CHARGE",
      }),
    });
    // Verify audit log created
    expect(mockTx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "MANUFACTURING_ORDER_CLOSED",
        entity: "ManufacturingOrder",
        entityId: "mfg-1",
      }),
    });
  });
});
