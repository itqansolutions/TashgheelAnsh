import { PaymentMethod, Prisma, SalesStatus } from "@prisma/client";
import Decimal from "decimal.js";
import { calculateSaleLineCostAndProfit } from "../domain/costing";
import { CreateSalesInvoiceInput } from "../validators/sales";
import { AuditService } from "./auditService";
import { DocumentSequenceService } from "./documentSequenceService";
import { InventoryService } from "./inventoryService";
import { LedgerService } from "./ledgerService";

export class SalesService {
  /**
   * Posts and confirms a sales invoice atomically:
   * - Allocates specific batches across lines
   * - Evaluates pricing against cost
   * - Deducts stock and logs SALE inventory transactions
   * - Debits customer ledger (receivable booked)
   */
  static async postSalesInvoice(
    tx: Prisma.TransactionClient,
    input: CreateSalesInvoiceInput,
    userId?: string | null,
    hasBelowCostPermission: boolean = false
  ) {
    const customer = await tx.businessPartner.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) {
      throw new Error("Selected customer does not exist.");
    }

    const warehouse = await tx.warehouse.findUnique({
      where: { id: input.warehouseId },
    });
    if (!warehouse) {
      throw new Error("Selected warehouse does not exist.");
    }

    const invoiceNumber = await DocumentSequenceService.getNextNumber(
      tx,
      "SALE",
      input.invoiceDate
    );

    let invoiceSubtotal = new Decimal(0);
    let invoiceDiscount = new Decimal(0);
    let invoiceTotalCost = new Decimal(0);
    let invoiceGrossProfit = new Decimal(0);
    let hasBelowCostLines = false;

    // Phase 1: Pre-validate all line allocations and batch costs
    const processedLines = [];

    for (const line of input.lines) {
      const batchAllocationsWithCost = [];

      for (const alloc of line.allocations) {
        const batch = await tx.inventoryBatch.findUnique({
          where: { id: alloc.batchId },
        });

        if (!batch) {
          throw new Error(`Inventory batch with ID ${alloc.batchId} not found.`);
        }

        const remaining = new Decimal(batch.remainingQuantity.toString());
        const allocQty = new Decimal(alloc.quantity);

        if (remaining.lt(allocQty)) {
          throw new Error(
            `Insufficient stock in batch ${batch.batchNumber}. Available: ${remaining.toFixed(4)}, Requested: ${allocQty.toFixed(4)}`
          );
        }

        batchAllocationsWithCost.push({
          batchId: batch.id,
          quantity: allocQty,
          unitCost: new Decimal(batch.unitCost.toString()),
        });
      }

      const calculation = calculateSaleLineCostAndProfit({
        orderedQuantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount || 0,
        allocations: batchAllocationsWithCost,
      });

      if (calculation.isBelowCost) {
        hasBelowCostLines = true;
        if (!line.allowBelowCost && !hasBelowCostPermission) {
          throw new Error(
            `Line for product is BELOW cost. Expected loss: ${calculation.expectedLoss.toFixed(2)} EGP. Requires managerial approval.`
          );
        }
      }

      invoiceSubtotal = invoiceSubtotal.plus(calculation.grossSellingAmount);
      invoiceDiscount = invoiceDiscount.plus(line.discountAmount || 0);
      invoiceTotalCost = invoiceTotalCost.plus(calculation.totalCost);
      invoiceGrossProfit = invoiceGrossProfit.plus(calculation.grossProfit);

      processedLines.push({
        line,
        calculation,
        allocations: batchAllocationsWithCost,
      });
    }

    const totalInvoiceAmount = invoiceSubtotal.minus(invoiceDiscount);

    // Phase 2: Create Sales Invoice Header
    const salesInvoice = await tx.salesInvoice.create({
      data: {
        invoiceNumber,
        customerId: input.customerId,
        warehouseId: input.warehouseId,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        paymentMethod: input.paymentMethod as PaymentMethod,
        status: SalesStatus.OPEN,
        subtotal: invoiceSubtotal.toFixed(4),
        discountAmount: invoiceDiscount.toFixed(4),
        taxAmount: "0.0000",
        totalAmount: totalInvoiceAmount.toFixed(4),
        paidAmount: "0.0000",
        remainingAmount: totalInvoiceAmount.toFixed(4),
        totalCost: invoiceTotalCost.toFixed(4),
        grossProfit: invoiceGrossProfit.toFixed(4),
        hasBelowCostLines,
        notes: input.notes,
        createdById: userId || null,
      },
    });

    // Phase 3: Create Lines, Batch Allocations, and Decrement Inventory
    for (const item of processedLines) {
      const createdLine = await tx.salesInvoiceLine.create({
        data: {
          salesInvoiceId: salesInvoice.id,
          productId: item.line.productId,
          quantity: item.calculation.totalAllocatedQuantity.toFixed(4),
          unitPrice: new Decimal(item.line.unitPrice).toFixed(4),
          discountAmount: new Decimal(item.line.discountAmount || 0).toFixed(4),
          netUnitPrice: item.calculation.netUnitPrice.toFixed(4),
          lineSubtotal: item.calculation.netSellingAmount.toFixed(4),
          totalCost: item.calculation.totalCost.toFixed(4),
          grossProfit: item.calculation.grossProfit.toFixed(4),
          isBelowCost: item.calculation.isBelowCost,
          belowCostApprovedById: item.calculation.isBelowCost ? userId : null,
        },
      });

      for (const alloc of item.allocations) {
        // Decrement physical batch
        await InventoryService.decrementBatch(tx, {
          batchId: alloc.batchId,
          quantity: alloc.quantity,
          transactionType: "SALE",
          referenceDocumentType: "SALES_INVOICE",
          referenceDocumentId: salesInvoice.id,
          referenceLineId: createdLine.id,
          userId,
          notes: `Sold in Invoice ${invoiceNumber}`,
        });

        // Store batch allocation record
        await tx.saleLineBatchAllocation.create({
          data: {
            salesInvoiceLineId: createdLine.id,
            batchId: alloc.batchId,
            quantity: alloc.quantity.toFixed(4),
            unitCost: alloc.unitCost.toFixed(4),
            totalCost: alloc.quantity.times(alloc.unitCost).toFixed(4),
          },
        });
      }
    }

    // Phase 4: Debit Customer Ledger (Customer owes us total invoice amount)
    await LedgerService.recordPartnerTransaction(tx, {
      partnerId: input.customerId,
      entryDate: input.invoiceDate,
      referenceType: "SALES_INVOICE",
      referenceId: salesInvoice.id,
      referenceNumber: invoiceNumber,
      debit: totalInvoiceAmount,
      credit: 0,
      description: `Sales Invoice ${invoiceNumber}`,
      userId,
    });

    // Phase 5: Audit Log
    await AuditService.log(tx, {
      userId,
      action: "SALE_POSTED",
      entity: "SalesInvoice",
      entityId: salesInvoice.id,
      newState: {
        invoiceNumber,
        totalAmount: totalInvoiceAmount.toFixed(4),
        totalCost: invoiceTotalCost.toFixed(4),
        grossProfit: invoiceGrossProfit.toFixed(4),
        hasBelowCostLines,
        status: "OPEN",
      },
    });

    return salesInvoice;
  }
}
