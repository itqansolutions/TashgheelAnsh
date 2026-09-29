import Decimal from "decimal.js";

// Set precision for high-accuracy financial math
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface BatchAllocationInput {
  batchId: string;
  quantity: number | string | Decimal;
  unitCost: number | string | Decimal;
}

export interface SaleLineCostResult {
  totalAllocatedQuantity: Decimal;
  totalCost: Decimal;
  averageUnitCost: Decimal;
  grossSellingAmount: Decimal;
  netSellingAmount: Decimal;
  netUnitPrice: Decimal;
  grossProfit: Decimal;
  profitMarginPercentage: Decimal;
  isAtCost: boolean;
  isBelowCost: boolean;
  expectedLoss: Decimal;
}

/**
 * Calculates Cost of Goods Sold (COGS), Gross Profit, and Below-Cost condition
 * for a sale line across one or more allocated batches.
 */
export function calculateSaleLineCostAndProfit(params: {
  orderedQuantity: number | string | Decimal;
  unitPrice: number | string | Decimal;
  discountAmount?: number | string | Decimal;
  allocations: BatchAllocationInput[];
}): SaleLineCostResult {
  const orderedQty = new Decimal(params.orderedQuantity);
  const unitPrice = new Decimal(params.unitPrice);
  const discount = new Decimal(params.discountAmount || 0);

  if (orderedQty.lte(0)) {
    throw new Error("Sale line quantity must be strictly greater than 0.");
  }
  if (unitPrice.lt(0)) {
    throw new Error("Unit price cannot be negative.");
  }
  if (discount.lt(0)) {
    throw new Error("Discount cannot be negative.");
  }

  let totalAllocatedQty = new Decimal(0);
  let totalCost = new Decimal(0);

  for (const alloc of params.allocations) {
    const allocQty = new Decimal(alloc.quantity);
    const allocCost = new Decimal(alloc.unitCost);

    if (allocQty.lte(0)) {
      throw new Error(`Allocated quantity for batch ${alloc.batchId} must be positive.`);
    }
    if (allocCost.lt(0)) {
      throw new Error(`Batch unit cost cannot be negative.`);
    }

    totalAllocatedQty = totalAllocatedQty.plus(allocQty);
    totalCost = totalCost.plus(allocQty.times(allocCost));
  }

  // Verify total allocations equal requested quantity (within 0.0001 precision)
  if (!totalAllocatedQty.toDecimalPlaces(4).equals(orderedQty.toDecimalPlaces(4))) {
    throw new Error(
      `Allocated batch quantity (${totalAllocatedQty.toFixed(4)}) does not match ordered quantity (${orderedQty.toFixed(4)}).`
    );
  }

  const averageUnitCost = totalCost.dividedBy(orderedQty);
  const grossSellingAmount = orderedQty.times(unitPrice);
  const netSellingAmount = grossSellingAmount.minus(discount);
  const netUnitPrice = netSellingAmount.dividedBy(orderedQty);
  const grossProfit = netSellingAmount.minus(totalCost);

  const profitMarginPercentage = netSellingAmount.gt(0)
    ? grossProfit.dividedBy(netSellingAmount).times(100)
    : new Decimal(0);

  // Compare net unit price vs average batch unit cost
  const isAtCost = netUnitPrice.toDecimalPlaces(4).equals(averageUnitCost.toDecimalPlaces(4));
  const isBelowCost = netUnitPrice.lt(averageUnitCost);
  const expectedLoss = isBelowCost ? totalCost.minus(netSellingAmount) : new Decimal(0);

  return {
    totalAllocatedQuantity: totalAllocatedQty,
    totalCost: totalCost.toDecimalPlaces(4),
    averageUnitCost: averageUnitCost.toDecimalPlaces(4),
    grossSellingAmount: grossSellingAmount.toDecimalPlaces(4),
    netSellingAmount: netSellingAmount.toDecimalPlaces(4),
    netUnitPrice: netUnitPrice.toDecimalPlaces(4),
    grossProfit: grossProfit.toDecimalPlaces(4),
    profitMarginPercentage: profitMarginPercentage.toDecimalPlaces(2),
    isAtCost,
    isBelowCost,
    expectedLoss: expectedLoss.toDecimalPlaces(4),
  };
}

export interface OutputAllocationInput {
  productId: string;
  warehouseId: string;
  quantity: number | string | Decimal;
  allocationPercentage: number | string | Decimal;
  notes?: string | null;
}

export interface OutputAllocationResult {
  productId: string;
  warehouseId: string;
  quantity: Decimal;
  allocationPercentage: Decimal;
  allocatedCost: Decimal;
  calculatedUnitCost: Decimal;
  notes?: string | null;
}

/**
 * Validates and allocates total manufacturing costs across multiple output products.
 * Handles rounding fractions by reconciling any discrepancy onto the primary output line.
 */
export function allocateManufacturingCosts(params: {
  totalManufacturingCost: number | string | Decimal;
  outputs: OutputAllocationInput[];
}): {
  totalManufacturingCost: Decimal;
  allocatedOutputs: OutputAllocationResult[];
} {
  const totalCost = new Decimal(params.totalManufacturingCost);

  if (totalCost.lt(0)) {
    throw new Error("Total manufacturing cost cannot be negative.");
  }
  if (!params.outputs || params.outputs.length === 0) {
    throw new Error("At least one output product is required to close manufacturing operation.");
  }

  let totalPercentage = new Decimal(0);
  for (const out of params.outputs) {
    const pct = new Decimal(out.allocationPercentage);
    if (pct.lt(0) || pct.gt(100)) {
      throw new Error("Output allocation percentage must be between 0 and 100.");
    }
    const qty = new Decimal(out.quantity);
    if (qty.lte(0)) {
      throw new Error(`Output quantity for product ${out.productId} must be greater than 0.`);
    }
    totalPercentage = totalPercentage.plus(pct);
  }

  // Validate percentage sums to 100.00% (within 0.001 margin)
  if (!totalPercentage.toDecimalPlaces(3).equals(new Decimal(100))) {
    throw new Error(
      `Cost allocation percentages must sum exactly to 100.00%. Current sum: ${totalPercentage.toFixed(2)}%`
    );
  }

  let allocatedSum = new Decimal(0);
  const results: OutputAllocationResult[] = [];

  for (let i = 0; i < params.outputs.length; i++) {
    const out = params.outputs[i];
    const qty = new Decimal(out.quantity);
    const pct = new Decimal(out.allocationPercentage);

    // Allocated cost = TotalCost * (pct / 100)
    let itemAllocatedCost = totalCost.times(pct).dividedBy(100).toDecimalPlaces(4);

    allocatedSum = allocatedSum.plus(itemAllocatedCost);

    results.push({
      productId: out.productId,
      warehouseId: out.warehouseId,
      quantity: qty,
      allocationPercentage: pct,
      allocatedCost: itemAllocatedCost,
      calculatedUnitCost: itemAllocatedCost.dividedBy(qty).toDecimalPlaces(4),
      notes: out.notes,
    });
  }

  // Fractional cent reconciliation: Add or subtract remainder to the largest line
  const difference = totalCost.minus(allocatedSum);
  if (!difference.isZero() && results.length > 0) {
    // Find index of maximum allocated cost
    let maxIdx = 0;
    for (let i = 1; i < results.length; i++) {
      if (results[i].allocatedCost.gt(results[maxIdx].allocatedCost)) {
        maxIdx = i;
      }
    }
    results[maxIdx].allocatedCost = results[maxIdx].allocatedCost.plus(difference);
    results[maxIdx].calculatedUnitCost = results[maxIdx].allocatedCost
      .dividedBy(results[maxIdx].quantity)
      .toDecimalPlaces(4);
  }

  return {
    totalManufacturingCost: totalCost.toDecimalPlaces(4),
    allocatedOutputs: results,
  };
}
