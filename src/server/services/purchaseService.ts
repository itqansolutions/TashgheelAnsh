import { Prisma, PurchaseStatus } from "@prisma/client";
import Decimal from "decimal.js";
import { CreatePurchaseInvoiceInput } from "../validators/purchases";
import { DocumentSequenceService } from "./documentSequenceService";
import { InventoryService } from "./inventoryService";
import { LedgerService } from "./ledgerService";
import { AuditService } from "./auditService";

export class PurchaseService {
  /**
   * Posts and confirms a new purchase invoice in an atomic transaction:
   * Creates invoice, lines, inventory batches, inventory transactions, and supplier credit ledger entry.
   */
  static async postPurchaseInvoice(
    tx: Prisma.TransactionClient,
    input: CreatePurchaseInvoiceInput,
    userId?: string | null
  ) {
    const supplier = await tx.businessPartner.findUnique({
      where: { id: input.supplierId },
    });
    if (!supplier) {
      throw new Error("Selected supplier does not exist.");
    }

    const warehouse = await tx.warehouse.findUnique({
      where: { id: input.warehouseId },
    });
    if (!warehouse) {
      throw new Error("Selected warehouse does not exist.");
    }

    const invoiceNumber = await DocumentSequenceService.getNextNumber(tx, "PURCHASE", input.invoiceDate);

    let subtotal = new Decimal(0);
    let totalDiscount = new Decimal(0);
    let totalTax = new Decimal(0);

    const calculatedLines = input.lines.map(line => {
      const qty = new Decimal(line.quantity);
      const unitCost = new Decimal(line.unitCost);
      const discount = new Decimal(line.discountAmount || 0);
      const lineSub = qty.times(unitCost).minus(discount);
      const taxRate = new Decimal(line.taxRate || 0);
      const taxAmt = lineSub.times(taxRate).dividedBy(100);
      const lineTotal = lineSub.plus(taxAmt);

      subtotal = subtotal.plus(qty.times(unitCost));
      totalDiscount = totalDiscount.plus(discount);
      totalTax = totalTax.plus(taxAmt);

      return {
        productId: line.productId,
        quantity: qty,
        unitCost,
        discountAmount: discount,
        taxRate,
        taxAmount: taxAmt,
        lineTotal,
      };
    });

    const totalAmount = subtotal.minus(totalDiscount).plus(totalTax);

    // 1. Create Purchase Header
    const purchase = await tx.purchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierId: input.supplierId,
        warehouseId: input.warehouseId,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        paymentTerms: input.paymentTerms,
        status: PurchaseStatus.OPEN,
        subtotal: subtotal.toFixed(4),
        discountAmount: totalDiscount.toFixed(4),
        taxAmount: totalTax.toFixed(4),
        totalAmount: totalAmount.toFixed(4),
        paidAmount: "0.0000",
        remainingAmount: totalAmount.toFixed(4),
        notes: input.notes,
        createdById: userId || null,
      },
    });

    // 2. Create Lines and Inward Inventory Batches
    for (const line of calculatedLines) {
      // Calculate effective lot unit acquisition cost = lineTotal / quantity
      const effectiveUnitCost = line.lineTotal.dividedBy(line.quantity);

      const batch = await InventoryService.createBatch(tx, {
        productId: line.productId,
        warehouseId: input.warehouseId,
        quantity: line.quantity,
        unitCost: effectiveUnitCost,
        sourceType: "PURCHASE",
        sourceDocumentId: purchase.id,
        transactionType: "PURCHASE_RECEIPT",
        userId,
        notes: `Purchase Receipt for ${invoiceNumber}`,
      });

      await tx.purchaseInvoiceLine.create({
        data: {
          purchaseInvoiceId: purchase.id,
          productId: line.productId,
          quantity: line.quantity.toFixed(4),
          unitCost: line.unitCost.toFixed(4),
          discountAmount: line.discountAmount.toFixed(4),
          taxRate: line.taxRate.toFixed(2),
          taxAmount: line.taxAmount.toFixed(4),
          lineTotal: line.lineTotal.toFixed(4),
          batchId: batch.id,
        },
      });
    }

    // 3. Post Supplier Credit (We owe supplier total invoice amount)
    await LedgerService.recordPartnerTransaction(tx, {
      partnerId: input.supplierId,
      entryDate: input.invoiceDate,
      referenceType: "PURCHASE_INVOICE",
      referenceId: purchase.id,
      referenceNumber: invoiceNumber,
      credit: totalAmount,
      debit: 0,
      description: `Purchase Invoice ${invoiceNumber}`,
      userId,
    });

    // 4. Audit Log
    await AuditService.log(tx, {
      userId,
      action: "PURCHASE_POSTED",
      entity: "PurchaseInvoice",
      entityId: purchase.id,
      newState: { invoiceNumber, totalAmount: totalAmount.toFixed(4), status: "OPEN" },
    });

    return purchase;
  }
}
