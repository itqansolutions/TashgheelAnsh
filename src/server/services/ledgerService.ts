import { LedgerReferenceType, Prisma } from "@prisma/client";
import Decimal from "decimal.js";
import { calculateNewLedgerBalance, PartnerRole } from "../domain/ledger";
import { DocumentSequenceService } from "./documentSequenceService";

export class LedgerService {
  /**
   * Posts an auditable debit/credit entry to a partner's ledger and updates their running balance.
   */
  static async recordPartnerTransaction(
    tx: Prisma.TransactionClient,
    params: {
      partnerId: string;
      entryDate?: Date;
      referenceType: LedgerReferenceType;
      referenceId: string;
      referenceNumber: string;
      debit?: Decimal | number | string;
      credit?: Decimal | number | string;
      description: string;
      userId?: string | null;
    }
  ) {
    const partner = await tx.businessPartner.findUnique({
      where: { id: params.partnerId },
    });

    if (!partner) {
      throw new Error(`Business Partner with ID ${params.partnerId} not found.`);
    }

    // Determine partner accounting role for balance direction
    let role: PartnerRole = "SUPPLIER";
    if (params.referenceType === "SALES_INVOICE" || partner.isCustomer) {
      role = "CUSTOMER";
    } else if (params.referenceType === "MANUFACTURING_CHARGE" || partner.isFactory) {
      role = "FACTORY";
    }

    const posting = calculateNewLedgerBalance({
      previousBalance: partner.currentBalance.toString(),
      debit: params.debit || 0,
      credit: params.credit || 0,
      role,
    });

    const entryNumber = await DocumentSequenceService.getNextNumber(tx, "LEDGER");

    const entry = await tx.partnerLedgerEntry.create({
      data: {
        entryNumber,
        partnerId: params.partnerId,
        entryDate: params.entryDate || new Date(),
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        referenceNumber: params.referenceNumber,
        debit: posting.debit.toFixed(4),
        credit: posting.credit.toFixed(4),
        balanceAfter: posting.newBalance.toFixed(4),
        description: params.description,
        createdById: params.userId || null,
      },
    });

    await tx.businessPartner.update({
      where: { id: params.partnerId },
      data: {
        currentBalance: posting.newBalance.toFixed(4),
      },
    });

    return entry;
  }
}
