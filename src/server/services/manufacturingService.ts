import { ManufacturingStatus, Prisma } from "@prisma/client";
import Decimal from "decimal.js";
import { allocateManufacturingCosts } from "../domain/costing";
import {
  AddManufacturingExpenseDto,
  AddManufacturingInputDto,
  CloseManufacturingOrderDto,
  CreateManufacturingOrderInput,
} from "../validators/manufacturing";
import { AuditService } from "./auditService";
import { DocumentSequenceService } from "./documentSequenceService";
import { InventoryService } from "./inventoryService";
import { LedgerService } from "./ledgerService";

export class ManufacturingService {
  /**
   * Creates a new manufacturing order in OPEN state.
   */
  static async createOrder(
    tx: Prisma.TransactionClient,
    input: CreateManufacturingOrderInput,
    userId?: string | null
  ) {
    const factory = await tx.businessPartner.findUnique({
      where: { id: input.factoryId },
    });
    if (!factory) {
      throw new Error("Selected factory partner does not exist.");
    }

    const orderNumber = await DocumentSequenceService.getNextNumber(
      tx,
      "MANUFACTURING",
      input.startDate
    );

    const order = await tx.manufacturingOrder.create({
      data: {
        orderNumber,
        factoryId: input.factoryId,
        warehouseId: input.warehouseId,
        startDate: input.startDate,
        expectedCompletionDate: input.expectedCompletionDate,
        status: ManufacturingStatus.OPEN,
        notes: input.notes,
      },
    });

    await AuditService.log(tx, {
      userId,
      action: "MANUFACTURING_ORDER_CREATED",
      entity: "ManufacturingOrder",
      entityId: order.id,
      newState: { orderNumber, status: "OPEN" },
    });

    return order;
  }

  /**
   * Consumes a specific batch into an open manufacturing order.
   * Decrements stock immediately and absorbs batch cost into total material cost.
   */
  static async addInput(
    tx: Prisma.TransactionClient,
    input: AddManufacturingInputDto,
    userId?: string | null
  ) {
    const order = await tx.manufacturingOrder.findUnique({
      where: { id: input.manufacturingOrderId },
    });

    if (!order || order.status === "CLOSED" || order.status === "CANCELLED") {
      throw new Error("Cannot add materials to a closed or cancelled manufacturing order.");
    }

    // Safely decrement the chosen batch
    const { batch, unitCost, totalCost } = await InventoryService.decrementBatch(tx, {
      batchId: input.batchId,
      quantity: input.quantity,
      transactionType: "MANUFACTURING_CONSUMPTION",
      referenceDocumentType: "MANUFACTURING",
      referenceDocumentId: order.id,
      userId,
      notes: `Consumed in Manufacturing Order ${order.orderNumber}`,
    });

    const inputRecord = await tx.manufacturingInput.create({
      data: {
        manufacturingOrderId: order.id,
        productId: batch.productId,
        batchId: batch.id,
        quantity: new Decimal(input.quantity).toFixed(4),
        unitCost: unitCost.toFixed(4),
        totalCost: totalCost.toFixed(4),
        notes: input.notes,
      },
    });

    const newMaterialCost = new Decimal(order.totalMaterialCost.toString()).plus(totalCost);
    const newTotalCost = new Decimal(order.totalManufacturingCost.toString()).plus(totalCost);

    await tx.manufacturingOrder.update({
      where: { id: order.id },
      data: {
        totalMaterialCost: newMaterialCost.toFixed(4),
        totalManufacturingCost: newTotalCost.toFixed(4),
        status: ManufacturingStatus.IN_PROGRESS,
      },
    });

    return inputRecord;
  }

  /**
   * Adds an expense (Type A operational or Type B factory charge) to an open manufacturing order.
   */
  static async addExpense(
    tx: Prisma.TransactionClient,
    input: AddManufacturingExpenseDto,
    userId?: string | null
  ) {
    const order = await tx.manufacturingOrder.findUnique({
      where: { id: input.manufacturingOrderId },
    });

    if (!order || order.status === "CLOSED" || order.status === "CANCELLED") {
      throw new Error("Cannot add expenses to a closed or cancelled manufacturing order.");
    }

    const amount = new Decimal(input.amount);

    const expenseRecord = await tx.manufacturingExpense.create({
      data: {
        manufacturingOrderId: order.id,
        categoryId: input.categoryId,
        expenseType: input.expenseType,
        amount: amount.toFixed(4),
        factoryId: input.factoryId || null,
        cashAccountId: input.cashAccountId || null,
        description: input.description,
      },
    });

    const newTotalCost = new Decimal(order.totalManufacturingCost.toString()).plus(amount);

    if (input.expenseType === "FACTORY_PAYABLE") {
      const newFactoryCost = new Decimal(order.totalFactoryCost.toString()).plus(amount);
      await tx.manufacturingOrder.update({
        where: { id: order.id },
        data: {
          totalFactoryCost: newFactoryCost.toFixed(4),
          totalManufacturingCost: newTotalCost.toFixed(4),
        },
      });
    } else {
      const newExpenseCost = new Decimal(order.totalExpenseCost.toString()).plus(amount);
      await tx.manufacturingOrder.update({
        where: { id: order.id },
        data: {
          totalExpenseCost: newExpenseCost.toFixed(4),
          totalManufacturingCost: newTotalCost.toFixed(4),
        },
      });
    }

    return expenseRecord;
  }

  /**
   * Closes a manufacturing order atomically:
   * 1. Allocates total manufacturing costs across output products.
   * 2. Creates output inventory batches with calculated unit costs.
   * 3. Creates inward MANUFACTURING_OUTPUT inventory transactions.
   * 4. Credits factory ledger for Type B factory payable charges.
   * 5. Sets order status to CLOSED.
   */
  static async closeOrder(
    tx: Prisma.TransactionClient,
    input: CloseManufacturingOrderDto,
    userId?: string | null
  ) {
    const order = await tx.manufacturingOrder.findUnique({
      where: { id: input.manufacturingOrderId },
      include: {
        inputs: true,
        expenses: true,
      },
    });

    if (!order) {
      throw new Error("Manufacturing order not found.");
    }
    if (order.status === "CLOSED") {
      throw new Error("Manufacturing order is already closed.");
    }
    if (order.inputs.length === 0) {
      throw new Error("Cannot close a manufacturing order without any consumed materials.");
    }

    const totalManufacturingCost = new Decimal(order.totalManufacturingCost.toString());

    // 1. Allocate costs across output products
    const { allocatedOutputs } = allocateManufacturingCosts({
      totalManufacturingCost,
      outputs: input.outputs.map(o => ({
        productId: o.productId,
        warehouseId: o.warehouseId,
        quantity: o.quantity,
        allocationPercentage: o.allocationPercentage,
        notes: o.notes,
      })),
    });

    // 2. Create output batches and inventory transactions
    for (const out of allocatedOutputs) {
      const batch = await InventoryService.createBatch(tx, {
        productId: out.productId,
        warehouseId: out.warehouseId,
        quantity: out.quantity,
        unitCost: out.calculatedUnitCost,
        sourceType: "MANUFACTURING",
        sourceDocumentId: order.id,
        transactionType: "MANUFACTURING_OUTPUT",
        userId,
        notes: `Produced in Manufacturing Order ${order.orderNumber}`,
      });

      await tx.manufacturingOutput.create({
        data: {
          manufacturingOrderId: order.id,
          productId: out.productId,
          warehouseId: out.warehouseId,
          quantity: out.quantity.toFixed(4),
          allocationPercentage: out.allocationPercentage.toFixed(4),
          allocatedCost: out.allocatedCost.toFixed(4),
          calculatedUnitCost: out.calculatedUnitCost.toFixed(4),
          batchId: batch.id,
          notes: out.notes,
        },
      });
    }

    // 3. Post Factory Payable ledger entries for Type B factory charges
    const factoryExpenses = order.expenses.filter(e => e.expenseType === "FACTORY_PAYABLE");
    for (const exp of factoryExpenses) {
      const targetFactoryId = exp.factoryId || order.factoryId;
      await LedgerService.recordPartnerTransaction(tx, {
        partnerId: targetFactoryId,
        entryDate: input.actualCompletionDate,
        referenceType: "MANUFACTURING_CHARGE",
        referenceId: order.id,
        referenceNumber: order.orderNumber,
        credit: new Decimal(exp.amount.toString()),
        debit: 0,
        description: `Factory Charge: ${exp.description} (${order.orderNumber})`,
        userId,
      });
    }

    // 4. Mark order CLOSED
    const closedOrder = await tx.manufacturingOrder.update({
      where: { id: order.id },
      data: {
        status: ManufacturingStatus.CLOSED,
        actualCompletionDate: input.actualCompletionDate,
        closedById: userId || null,
        closedAt: new Date(),
      },
    });

    // 5. Audit log
    await AuditService.log(tx, {
      userId,
      action: "MANUFACTURING_ORDER_CLOSED",
      entity: "ManufacturingOrder",
      entityId: order.id,
      newState: {
        orderNumber: order.orderNumber,
        totalCost: totalManufacturingCost.toFixed(4),
        outputsCount: allocatedOutputs.length,
        status: "CLOSED",
      },
    });

    return closedOrder;
  }
}
