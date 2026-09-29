import { DocumentSequenceType, Prisma } from "@prisma/client";

const PREFIXES: Record<DocumentSequenceType, string> = {
  PURCHASE: "PUR",
  SALE: "SAL",
  MANUFACTURING: "MFG",
  PAYMENT: "PAY",
  RECEIPT: "REC",
  EXPENSE: "EXP",
  BATCH: "BAT",
  INVENTORY_TX: "ITX",
  LEDGER: "LED",
};

export class DocumentSequenceService {
  /**
   * Generates a contiguous, concurrency-safe document number within an existing Prisma transaction.
   * e.g., PUR-2026-000001
   */
  static async getNextNumber(
    tx: Prisma.TransactionClient,
    type: DocumentSequenceType,
    date: Date = new Date()
  ): Promise<string> {
    const year = date.getFullYear();
    const prefix = PREFIXES[type] || "DOC";

    // Upsert sequence counter atomically
    const sequence = await tx.documentSequence.upsert({
      where: {
        documentType_year: {
          documentType: type,
          year,
        },
      },
      update: {
        currentNumber: {
          increment: 1,
        },
      },
      create: {
        documentType: type,
        prefix,
        year,
        currentNumber: 1,
      },
    });

    const formattedNumber = String(sequence.currentNumber).padStart(6, "0");
    return `${prefix}-${year}-${formattedNumber}`;
  }
}
