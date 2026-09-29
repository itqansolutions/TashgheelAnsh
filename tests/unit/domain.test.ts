import { describe, it, expect } from "vitest";
import {
  calculateSaleLineCostAndProfit,
  allocateManufacturingCosts,
} from "../../src/server/domain/costing";
import {
  calculateNewLedgerBalance,
  reconcileLedger,
} from "../../src/server/domain/ledger";

describe("Domain: Specific Batch Costing & Profitability", () => {
  it("should calculate exact weighted cost and profit across multiple allocated batches", () => {
    // 100 units total: 60 from Batch A @ 80, 40 from Batch B @ 95
    // Selling price: 120 per unit. Subtotal: 12,000. Discount: 0.
    const result = calculateSaleLineCostAndProfit({
      orderedQuantity: 100,
      unitPrice: 120,
      discountAmount: 0,
      allocations: [
        { batchId: "BAT-001", quantity: 60, unitCost: 80 },
        { batchId: "BAT-002", quantity: 40, unitCost: 95 },
      ],
    });

    // Total Cost = (60 * 80) + (40 * 95) = 4800 + 3800 = 8600
    expect(result.totalCost.toNumber()).toBe(8600);
    // Average Unit Cost = 8600 / 100 = 86
    expect(result.averageUnitCost.toNumber()).toBe(86);
    // Gross Selling = 12000, Net Selling = 12000
    expect(result.netSellingAmount.toNumber()).toBe(12000);
    // Gross Profit = 12000 - 8600 = 3400
    expect(result.grossProfit.toNumber()).toBe(3400);
    // Profit margin = 3400 / 12000 * 100 = 28.33%
    expect(result.profitMarginPercentage.toNumber()).toBe(28.33);
    expect(result.isBelowCost).toBe(false);
    expect(result.isAtCost).toBe(false);
    expect(result.expectedLoss.toNumber()).toBe(0);
  });

  it("should detect selling exactly at cost", () => {
    // 50 units @ 100 cost, sold at 100
    const result = calculateSaleLineCostAndProfit({
      orderedQuantity: 50,
      unitPrice: 100,
      allocations: [{ batchId: "BAT-001", quantity: 50, unitCost: 100 }],
    });

    expect(result.isAtCost).toBe(true);
    expect(result.isBelowCost).toBe(false);
    expect(result.grossProfit.toNumber()).toBe(0);
  });

  it("should detect selling below cost and compute expected loss", () => {
    // 100 units @ 100 cost, sold at 90
    const result = calculateSaleLineCostAndProfit({
      orderedQuantity: 100,
      unitPrice: 90,
      allocations: [{ batchId: "BAT-001", quantity: 100, unitCost: 100 }],
    });

    expect(result.isBelowCost).toBe(true);
    expect(result.isAtCost).toBe(false);
    // Total Cost = 10,000, Net Selling = 9,000, Expected Loss = 1,000
    expect(result.expectedLoss.toNumber()).toBe(1000);
    expect(result.grossProfit.toNumber()).toBe(-1000);
  });

  it("should detect selling below cost when discount brings net price below cost", () => {
    // 100 units @ 100 cost, unit price 120, discount 3,000 -> Net = 9,000 (90/unit)
    const result = calculateSaleLineCostAndProfit({
      orderedQuantity: 100,
      unitPrice: 120,
      discountAmount: 3000,
      allocations: [{ batchId: "BAT-001", quantity: 100, unitCost: 100 }],
    });

    expect(result.isBelowCost).toBe(true);
    expect(result.expectedLoss.toNumber()).toBe(1000);
  });

  it("should reject allocation when allocated quantity does not match ordered quantity", () => {
    expect(() =>
      calculateSaleLineCostAndProfit({
        orderedQuantity: 100,
        unitPrice: 120,
        allocations: [{ batchId: "BAT-001", quantity: 80, unitCost: 80 }],
      })
    ).toThrowError(/does not match ordered quantity/);
  });
});

describe("Domain: Outsourced Manufacturing Multi-Output Cost Allocation", () => {
  it("should allocate costs accurately across multiple outputs using manual percentages", () => {
    // Total cost: 120,000 EGP
    // Output A: 500 units @ 60%
    // Output B: 300 units @ 30%
    // Output C: 100 units @ 10%
    const allocation = allocateManufacturingCosts({
      totalManufacturingCost: 120000,
      outputs: [
        {
          productId: "PROD-A",
          warehouseId: "WH-1",
          quantity: 500,
          allocationPercentage: 60,
        },
        {
          productId: "PROD-B",
          warehouseId: "WH-1",
          quantity: 300,
          allocationPercentage: 30,
        },
        {
          productId: "PROD-C",
          warehouseId: "WH-1",
          quantity: 100,
          allocationPercentage: 10,
        },
      ],
    });

    expect(allocation.totalManufacturingCost.toNumber()).toBe(120000);

    const outA = allocation.allocatedOutputs[0];
    expect(outA.allocatedCost.toNumber()).toBe(72000); // 120,000 * 60%
    expect(outA.calculatedUnitCost.toNumber()).toBe(144); // 72,000 / 500

    const outB = allocation.allocatedOutputs[1];
    expect(outB.allocatedCost.toNumber()).toBe(36000); // 120,000 * 30%
    expect(outB.calculatedUnitCost.toNumber()).toBe(120); // 36,000 / 300

    const outC = allocation.allocatedOutputs[2];
    expect(outC.allocatedCost.toNumber()).toBe(12000); // 120,000 * 10%
    expect(outC.calculatedUnitCost.toNumber()).toBe(120); // 12,000 / 100
  });

  it("should enforce that allocation percentages sum to exactly 100%", () => {
    expect(() =>
      allocateManufacturingCosts({
        totalManufacturingCost: 50000,
        outputs: [
          {
            productId: "PROD-A",
            warehouseId: "WH-1",
            quantity: 100,
            allocationPercentage: 50,
          },
          {
            productId: "PROD-B",
            warehouseId: "WH-1",
            quantity: 100,
            allocationPercentage: 40, // Sum = 90%
          },
        ],
      })
    ).toThrowError(/must sum exactly to 100.00%/);
  });
});

describe("Domain: Ledger Architecture & Accounting Invariants", () => {
  it("should increase customer balance on debit (sale) and decrease on credit (receipt)", () => {
    // 1. Initial credit sale of 15,000 EGP
    const salePost = calculateNewLedgerBalance({
      previousBalance: 0,
      debit: 15000,
      credit: 0,
      role: "CUSTOMER",
    });
    expect(salePost.newBalance.toNumber()).toBe(15000);

    // 2. Customer pays 10,000 EGP (Credit)
    const paymentPost = calculateNewLedgerBalance({
      previousBalance: salePost.newBalance,
      debit: 0,
      credit: 10000,
      role: "CUSTOMER",
    });
    expect(paymentPost.newBalance.toNumber()).toBe(5000); // 5,000 remaining receivable
  });

  it("should increase supplier balance on credit (purchase) and decrease on debit (payment)", () => {
    // 1. Initial purchase invoice of 50,000 EGP
    const purchasePost = calculateNewLedgerBalance({
      previousBalance: 0,
      debit: 0,
      credit: 50000,
      role: "SUPPLIER",
    });
    expect(purchasePost.newBalance.toNumber()).toBe(50000);

    // 2. Company pays 30,000 EGP to supplier (Debit)
    const paymentPost = calculateNewLedgerBalance({
      previousBalance: purchasePost.newBalance,
      debit: 30000,
      credit: 0,
      role: "SUPPLIER",
    });
    expect(paymentPost.newBalance.toNumber()).toBe(20000); // 20,000 remaining payable
  });

  it("should accurately reconcile ledger entries against recorded balance", () => {
    const entries = [
      { debit: 10000, credit: 0 }, // Sale
      { debit: 5000, credit: 0 },  // Sale
      { debit: 0, credit: 8000 },  // Receipt
    ];
    const rec = reconcileLedger(0, entries, "CUSTOMER");
    expect(rec.totalDebits.toNumber()).toBe(15000);
    expect(rec.totalCredits.toNumber()).toBe(8000);
    expect(rec.computedBalance.toNumber()).toBe(7000);
  });
});
