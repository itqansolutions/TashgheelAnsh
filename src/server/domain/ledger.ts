import Decimal from "decimal.js";

export type PartnerRole = "CUSTOMER" | "SUPPLIER" | "FACTORY";

export interface LedgerPostingInput {
  previousBalance: number | string | Decimal;
  debit: number | string | Decimal;
  credit: number | string | Decimal;
  role: PartnerRole;
}

export interface LedgerPostingResult {
  debit: Decimal;
  credit: Decimal;
  newBalance: Decimal;
  balanceDelta: Decimal;
}

/**
 * Calculates new partner balance adhering to strict double-entry ERP accounting rules:
 * - Customer account: Debit increases debt (receivable), Credit reduces debt.
 * - Supplier/Factory account: Credit increases liability (payable), Debit reduces liability.
 */
export function calculateNewLedgerBalance(input: LedgerPostingInput): LedgerPostingResult {
  const prev = new Decimal(input.previousBalance || 0);
  const debit = new Decimal(input.debit || 0);
  const credit = new Decimal(input.credit || 0);

  if (debit.lt(0) || credit.lt(0)) {
    throw new Error("Debit and Credit amounts cannot be negative.");
  }
  if (debit.isZero() && credit.isZero()) {
    throw new Error("At least one of Debit or Credit must be greater than zero.");
  }

  let newBalance: Decimal;
  let balanceDelta: Decimal;

  if (input.role === "CUSTOMER") {
    // For customers: Balance = Receivables (Net amount customer owes us)
    // Debit (+) increases customer debt; Credit (-) settles customer debt
    balanceDelta = debit.minus(credit);
    newBalance = prev.plus(balanceDelta);
  } else {
    // For suppliers & factories: Balance = Payables (Net amount we owe them)
    // Credit (+) increases our payable; Debit (-) settles our payable
    balanceDelta = credit.minus(debit);
    newBalance = prev.plus(balanceDelta);
  }

  return {
    debit: debit.toDecimalPlaces(4),
    credit: credit.toDecimalPlaces(4),
    newBalance: newBalance.toDecimalPlaces(4),
    balanceDelta: balanceDelta.toDecimalPlaces(4),
  };
}

/**
 * Reconciles partner ledger entries against recorded balance.
 */
export function reconcileLedger(
  openingBalance: number | string | Decimal,
  entries: Array<{ debit: number | string | Decimal; credit: number | string | Decimal }>,
  role: PartnerRole
): {
  computedBalance: Decimal;
  totalDebits: Decimal;
  totalCredits: Decimal;
} {
  let totalDebits = new Decimal(0);
  let totalCredits = new Decimal(0);

  for (const entry of entries) {
    totalDebits = totalDebits.plus(new Decimal(entry.debit || 0));
    totalCredits = totalCredits.plus(new Decimal(entry.credit || 0));
  }

  const opening = new Decimal(openingBalance || 0);
  let computedBalance: Decimal;

  if (role === "CUSTOMER") {
    computedBalance = opening.plus(totalDebits).minus(totalCredits);
  } else {
    computedBalance = opening.plus(totalCredits).minus(totalDebits);
  }

  return {
    computedBalance: computedBalance.toDecimalPlaces(4),
    totalDebits: totalDebits.toDecimalPlaces(4),
    totalCredits: totalCredits.toDecimalPlaces(4),
  };
}
