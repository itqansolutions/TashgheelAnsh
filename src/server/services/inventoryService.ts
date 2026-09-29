import {
  BatchSourceType,
  InventoryTransactionType,
  Prisma,
} from "@prisma/client";
import Decimal from "decimal.js";
import { DocumentSequenceService } from "./documentSequenceService";

export class InventoryService {
  /**
   * Creates a new inventory lot/batch and logs the inward inventory movement.
   */
  static async createBatch(
    tx: Prisma.TransactionClient,
    params: {
      productId: string;
      warehouseId: string;
      quantity: Decimal | number | string;
      unitCost: Decimal | number | string;
      sourceType: BatchSourceType;
      sourceDocumentId?: string;
      sourceDocumentLineId?: string;
      notes?: string;
      userId?: string | null;
      transactionType: InventoryTransactionType;
    }
  ) {
    const qty = new Decimal(params.quantity);
    const unitCost = new Decimal(params.unitCost);
    const totalCost = qty.times(unitCost);

    if (qty.lte(0)) {
      throw new Error("Batch quantity must be strictly greater than 0.");
    }
    if (unitCost.lt(0)) {
      throw new Error("Batch unit cost cannot be negative.");
    }

    const batchNumber = await DocumentSequenceService.getNextNumber(tx, "BATCH");

    const batch = await tx.inventoryBatch.create({
      data: {
        batchNumber,
        productId: params.productId,
        warehouseId: params.warehouseId,
        sourceType: params.sourceType,
        sourceDocumentId: params.sourceDocumentId,
        sourceDocumentLineId: params.sourceDocumentLineId,
        initialQuantity: qty.toFixed(4),
        remainingQuantity: qty.toFixed(4),
        unitCost: unitCost.toFixed(4),
        totalCost: totalCost.toFixed(4),
        notes: params.notes,
      },
    });

    const txNumber = await DocumentSequenceService.getNextNumber(tx, "INVENTORY_TX");

    await tx.inventoryTransaction.create({
      data: {
        transactionNumber: txNumber,
        productId: params.productId,
        batchId: batch.id,
        warehouseId: params.warehouseId,
        quantity: qty.toFixed(4), // Positive for receipt/output
        unitCost: unitCost.toFixed(4),
        totalCost: totalCost.toFixed(4),
        transactionType: params.transactionType,
        referenceDocumentType: params.sourceType,
        referenceDocumentId: params.sourceDocumentId || batch.id,
        referenceLineId: params.sourceDocumentLineId,
        userId: params.userId || null,
        notes: params.notes,
      },
    });

    return batch;
  }

  /**
   * Safely decrements a specific batch quantity with concurrency protection.
   */
  static async decrementBatch(
    tx: Prisma.TransactionClient,
    params: {
      batchId: string;
      quantity: Decimal | number | string;
      transactionType: InventoryTransactionType;
      referenceDocumentType: string;
      referenceDocumentId: string;
      referenceLineId?: string;
      userId?: string | null;
      notes?: string;
    }
  ) {
    const deductQty = new Decimal(params.quantity);
    if (deductQty.lte(0)) {
      throw new Error("Deduction quantity must be strictly greater than 0.");
    }

    const batch = await tx.inventoryBatch.findUnique({
      where: { id: params.batchId },
      include: { product: true },
    });

    if (!batch) {
      throw new Error(`Inventory batch with ID ${params.batchId} not found.`);
    }

    const currentRemaining = new Decimal(batch.remainingQuantity.toString());
    if (currentRemaining.lt(deductQty)) {
      throw new Error(
        `Insufficient quantity in batch ${batch.batchNumber}. Available: ${currentRemaining.toFixed(4)}, Requested: ${deductQty.toFixed(4)}`
      );
    }

    const newRemaining = currentRemaining.minus(deductQty);
    const unitCost = new Decimal(batch.unitCost.toString());
    const totalDeductedCost = deductQty.times(unitCost);

    const updatedBatch = await tx.inventoryBatch.update({
      where: { id: params.batchId },
      data: {
        remainingQuantity: newRemaining.toFixed(4),
      },
    });

    const txNumber = await DocumentSequenceService.getNextNumber(tx, "INVENTORY_TX");

    await tx.inventoryTransaction.create({
      data: {
        transactionNumber: txNumber,
        productId: batch.productId,
        batchId: batch.id,
        warehouseId: batch.warehouseId,
        quantity: deductQty.negated().toFixed(4), // Negative for outbound
        unitCost: unitCost.toFixed(4),
        totalCost: totalDeductedCost.toFixed(4),
        transactionType: params.transactionType,
        referenceDocumentType: params.referenceDocumentType,
        referenceDocumentId: params.referenceDocumentId,
        referenceLineId: params.referenceLineId,
        userId: params.userId || null,
        notes: params.notes,
      },
    });

    return {
      batch: updatedBatch,
      deductedQuantity: deductQty,
      unitCost,
      totalCost: totalDeductedCost,
    };
  }

  /**
   * Reverses or restores quantity back into an existing batch.
   */
  static async restoreBatch(
    tx: Prisma.TransactionClient,
    params: {
      batchId: string;
      quantity: Decimal | number | string;
      transactionType: InventoryTransactionType;
      referenceDocumentType: string;
      referenceDocumentId: string;
      referenceLineId?: string;
      userId?: string | null;
      notes?: string;
    }
  ) {
    const restoreQty = new Decimal(params.quantity);
    if (restoreQty.lte(0)) {
      throw new Error("Restoration quantity must be strictly greater than 0.");
    }

    const batch = await tx.inventoryBatch.findUnique({
      where: { id: params.batchId },
    });

    if (!batch) {
      throw new Error(`Inventory batch with ID ${params.batchId} not found.`);
    }

    const currentRemaining = new Decimal(batch.remainingQuantity.toString());
    const newRemaining = currentRemaining.plus(restoreQty);
    const unitCost = new Decimal(batch.unitCost.toString());
    const totalCost = restoreQty.times(unitCost);

    const updatedBatch = await tx.inventoryBatch.update({
      where: { id: params.batchId },
      data: {
        remainingQuantity: newRemaining.toFixed(4),
      },
    });

    const txNumber = await DocumentSequenceService.getNextNumber(tx, "INVENTORY_TX");

    await tx.inventoryTransaction.create({
      data: {
        transactionNumber: txNumber,
        productId: batch.productId,
        batchId: batch.id,
        warehouseId: batch.warehouseId,
        quantity: restoreQty.toFixed(4), // Positive for restoration
        unitCost: unitCost.toFixed(4),
        totalCost: totalCost.toFixed(4),
        transactionType: params.transactionType,
        referenceDocumentType: params.referenceDocumentType,
        referenceDocumentId: params.referenceDocumentId,
        referenceLineId: params.referenceLineId,
        userId: params.userId || null,
        notes: params.notes || "Stock movement reversed",
      },
    });

    return updatedBatch;
  }
}
