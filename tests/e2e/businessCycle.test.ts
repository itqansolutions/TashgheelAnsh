import { describe, it, expect } from "vitest";
import { MasterDataRepository } from "../../src/server/repositories/masterData";
import { PartnersRepository } from "../../src/server/repositories/partnersRepository";
import { PurchasesRepository } from "../../src/server/repositories/purchasesRepository";
import { InventoryRepository, MockBatchItem } from "../../src/server/repositories/inventoryRepository";
import { ManufacturingRepository } from "../../src/server/repositories/manufacturingRepository";
import { SalesRepository } from "../../src/server/repositories/salesRepository";
import { allocateManufacturingCosts, calculateSaleLineCostAndProfit } from "../../src/server/domain/costing";

describe("Phase 2 — End-to-End Business Cycle Verification", () => {
  let rawProduct: any;
  let finishedProduct: any;
  let scrapProduct: any;
  let supplier: any;
  let factory: any;
  let customer: any;

  let rawBatchNumber = "";
  let finishedBatchNumber = "";
  let scrapBatchNumber = "";

  it("Step 1: Create raw material product and finished product and scrap product", async () => {
    rawProduct = await MasterDataRepository.createProduct({
      sku: "RAW-COTTON-001",
      name: "Raw Egyptian Cotton Fabric",
      nameAr: "قماش قطن خام - RAW-001",
      categoryId: "cat-1",
      uomId: "uom-meter",
      itemType: "RAW_MATERIAL",
      defaultSellingPrice: 65,
      minSellingPrice: 55,
      referenceCost: 50,
    });
    expect(rawProduct.id).toBeDefined();
    expect(rawProduct.sku).toBe("RAW-COTTON-001");
    expect(rawProduct.itemType).toBe("RAW_MATERIAL");

    finishedProduct = await MasterDataRepository.createProduct({
      sku: "FIN-SHIRT-001",
      name: "Men Classic White Shirt",
      nameAr: "قميص أبيض رجالي - FIN-001",
      categoryId: "cat-3",
      uomId: "uom-pcs",
      itemType: "FINISHED_PRODUCT",
      defaultSellingPrice: 180,
      minSellingPrice: 150,
      referenceCost: 110,
    });
    expect(finishedProduct.id).toBeDefined();
    expect(finishedProduct.itemType).toBe("FINISHED_PRODUCT");

    scrapProduct = await MasterDataRepository.createProduct({
      sku: "SCRAP-FABRIC-001",
      name: "Cotton Fabric Scraps",
      nameAr: "عوادم وهالك أقمشة قطنية - SCRAP-001",
      categoryId: "cat-1",
      uomId: "uom-kg",
      itemType: "RAW_MATERIAL",
      defaultSellingPrice: 250,
      minSellingPrice: 200,
      referenceCost: 234,
    });
    expect(scrapProduct.id).toBeDefined();
  });

  it("Step 2: Create supplier (شركة الغزل والنسيج المصرية)", async () => {
    supplier = await PartnersRepository.createPartner({
      code: "SUP-EGY-01",
      name: "Egyptian Spinning & Weaving Co.",
      nameAr: "شركة الغزل والنسيج المصرية",
      phone: "+2022334455",
      isSupplier: true,
      isCustomer: false,
      isFactory: false,
      creditLimit: 200000,
      paymentTermsDays: 45,
      openingBalance: 0,
      notes: "مورد معتمد للأقطان والأقمشة",
    });

    expect(supplier.id).toBeDefined();
    expect(supplier.isSupplier).toBe(true);
    expect(supplier.currentBalance).toBe(0);
  });

  it("Step 3: Create purchase invoice (1,000 meters @ 50 EGP = 50,000 EGP)", async () => {
    const purchase = await PurchasesRepository.postPurchase(
      {
        supplierId: supplier.id,
        warehouseId: "wh-1",
        invoiceDate: new Date("2026-06-01"),
        dueDate: new Date("2026-07-15"),
        paymentMethod: "CREDIT",
        notes: "توريد 1000 متر قماش قطن خام",
        lines: [
          {
            productId: rawProduct.id,
            quantity: 1000,
            unitCost: 50,
            discountAmount: 0,
          },
        ],
      },
      supplier.nameAr,
      "المستودع الرئيسي",
      { [rawProduct.id]: { name: rawProduct.nameAr, sku: rawProduct.sku } }
    );

    expect(purchase.totalAmount).toBe(50000);
    expect(purchase.lines).toHaveLength(1);
    expect(purchase.lines[0].quantity).toBe(1000);
    expect(purchase.lines[0].unitCost).toBe(50);
    expect(purchase.lines[0].lineTotal).toBe(50000);

    // Record invoice payable in supplier ledger
    await PartnersRepository.recordInvoice(
      supplier.id,
      50000,
      purchase.invoiceNumber,
      "فاتورة شراء قماش خام",
      false
    );

    const supCheck = await PartnersRepository.getPartnerById(supplier.id);
    expect(supCheck?.currentBalance).toBe(50000);

    // Create the batch in Inventory
    rawBatchNumber = `BAT-COTTON-${Date.now().toString().slice(-4)}`;
    const batch: MockBatchItem = {
      id: `bat-${Date.now()}`,
      batchNumber: rawBatchNumber,
      productId: rawProduct.id,
      productName: rawProduct.nameAr,
      productSku: rawProduct.sku,
      itemType: "RAW_MATERIAL",
      warehouseId: "wh-1",
      warehouseName: "المستودع الرئيسي",
      sourceType: "PURCHASE",
      sourceDocumentNumber: purchase.invoiceNumber,
      sourceDocumentId: purchase.id,
      initialQuantity: 1000,
      remainingQuantity: 1000,
      unitCost: 50,
      totalCost: 50000,
      createdAt: "2026-06-01",
      timeline: [
        {
          title: "استلام وتوريد خامات",
          description: `شراء 1000 متر بتكلفة 50 EGP من ${supplier.nameAr}`,
          date: "2026-06-01",
          documentType: "فاتورة توريد",
          documentNumber: purchase.invoiceNumber,
          linkUrl: `/purchases/${purchase.id}`,
          type: "in",
        },
      ],
    };
    await InventoryRepository.addBatch(batch);

    const fetchedBatch = await InventoryRepository.getBatchByIdOrNumber(rawBatchNumber);
    expect(fetchedBatch).not.toBeNull();
    expect(fetchedBatch?.remainingQuantity).toBe(1000);
    expect(fetchedBatch?.unitCost).toBe(50);
  });

  it("Step 4: Record partial payment to supplier (20,000 EGP, balance = 30,000 EGP)", async () => {
    await PartnersRepository.recordPayment(
      supplier.id,
      20000,
      "PAY-2026-000099",
      "دفعة نقدية تحت الحساب"
    );

    const supCheck = await PartnersRepository.getPartnerById(supplier.id);
    expect(supCheck?.currentBalance).toBe(30000);
  });

  it("Step 5: Create factory partner (مصنع النيل للحياكة)", async () => {
    factory = await PartnersRepository.createPartner({
      code: "FAC-NILE-01",
      name: "Nile Garments Stitching Factory",
      nameAr: "مصنع النيل للحياكة",
      phone: "+2023456789",
      isSupplier: true,
      isCustomer: false,
      isFactory: true,
      creditLimit: 100000,
      paymentTermsDays: 30,
      openingBalance: 0,
      notes: "مصنع تشغيل خارجي لقص وتفصيل القمصان",
    });

    expect(factory.id).toBeDefined();
    expect(factory.isFactory).toBe(true);
    expect(factory.currentBalance).toBe(0);
  });

  it("Step 6: Manufacturing order lifecycle with multi-output cost allocation", async () => {
    // 6a: Create Order
    const order = await ManufacturingRepository.createOrder(
      {
        factoryId: factory.id,
        warehouseId: "wh-1",
        startDate: new Date("2026-06-05"),
        expectedCompletionDate: new Date("2026-06-15"),
        notes: "تشغيل 380 قميص أبيض رجالي",
      },
      factory.nameAr,
      "المستودع الرئيسي"
    );
    expect(order.id).toBeDefined();
    expect(order.status).toBe("OPEN");

    // 6b: Add Raw Material Input (800 meters from cotton batch)
    await ManufacturingRepository.addInput(
      order.id,
      rawProduct.id,
      rawProduct.nameAr,
      rawBatchNumber,
      800,
      50
    );
    // Deduct 800 meters from raw batch in inventory
    await InventoryRepository.deductBatchQuantity(rawBatchNumber, 800);
    const updatedRawBatch = await InventoryRepository.getBatchByIdOrNumber(rawBatchNumber);
    expect(updatedRawBatch?.remainingQuantity).toBe(200);

    // 6c: Add Additional Expense (Thread & buttons = 3,000 EGP)
    await ManufacturingRepository.addExpense(
      order.id,
      "خيوط وأزرار وإكسسوارات",
      "GENERAL_OPERATIONAL",
      3000,
      "مستلزمات تشغيل للأمر"
    );

    // 6d: Add Factory Charge (10 EGP/shirt for 380 shirts = 3,800 EGP)
    await ManufacturingRepository.addExpense(
      order.id,
      "أجور حياكة وتشغيل",
      "FACTORY_PAYABLE",
      3800,
      "أتعاب خياطة 380 قميص @ 10 EGP"
    );

    // Check Total Cost = (800 * 50) + 3,000 + 3,800 = 46,800 EGP
    const currentOrder = await ManufacturingRepository.getOrderById(order.id);
    expect(currentOrder?.totalMaterialCost).toBe(40000);
    expect(currentOrder?.totalExpenseCost).toBe(3000);
    expect(currentOrder?.totalFactoryCost).toBe(3800);
    expect(currentOrder?.totalManufacturingCost).toBe(46800);

    // Record factory payable
    await PartnersRepository.recordInvoice(
      factory.id,
      3800,
      order.orderNumber,
      "أتعاب تشغيل أمر تصنيع قمصان",
      false
    );
    const facCheck = await PartnersRepository.getPartnerById(factory.id);
    expect(facCheck?.currentBalance).toBe(3800);

    // 6e: Close Order with multi-output allocation
    // 380 shirts @ 90% = 42,120 EGP (unit cost = 110.8421 EGP)
    // 20 kg scraps @ 10% = 4,680 EGP (unit cost = 234.00 EGP)
    const closedOrder = await ManufacturingRepository.closeOrder(order.id, [
      {
        productId: finishedProduct.id,
        productName: finishedProduct.nameAr,
        quantity: 380,
        allocationPercentage: 90,
      },
      {
        productId: scrapProduct.id,
        productName: scrapProduct.nameAr,
        quantity: 20,
        allocationPercentage: 10,
      },
    ]);

    expect(closedOrder.status).toBe("CLOSED");
    expect(closedOrder.outputs).toHaveLength(2);

    const shirtOutput = closedOrder.outputs[0];
    const scrapOutput = closedOrder.outputs[1];

    expect(shirtOutput.quantity).toBe(380);
    expect(shirtOutput.allocatedCost).toBe(42120);
    expect(shirtOutput.calculatedUnitCost).toBeCloseTo(110.8421, 4);

    expect(scrapOutput.quantity).toBe(20);
    expect(scrapOutput.allocatedCost).toBe(4680);
    expect(scrapOutput.calculatedUnitCost).toBe(234);

    // Register Finished Batch in Inventory
    finishedBatchNumber = `BAT-SHIRT-${Date.now().toString().slice(-4)}`;
    scrapBatchNumber = `BAT-SCRAP-${Date.now().toString().slice(-4)}`;

    await InventoryRepository.addBatch({
      id: `bat-fin-${Date.now()}`,
      batchNumber: finishedBatchNumber,
      productId: finishedProduct.id,
      productName: finishedProduct.nameAr,
      productSku: finishedProduct.sku,
      itemType: "FINISHED_PRODUCT",
      warehouseId: "wh-1",
      warehouseName: "المستودع الرئيسي",
      sourceType: "MANUFACTURING",
      sourceDocumentNumber: order.orderNumber,
      sourceDocumentId: order.id,
      initialQuantity: 380,
      remainingQuantity: 380,
      unitCost: shirtOutput.calculatedUnitCost,
      totalCost: shirtOutput.allocatedCost,
      createdAt: "2026-06-15",
      timeline: [
        {
          title: "إتمام تشغيل مخرجات",
          description: `إنتاج 380 قميص بتكلفة إجمالية 42,120 EGP`,
          date: "2026-06-15",
          documentType: "أمر تصنيع",
          documentNumber: order.orderNumber,
          linkUrl: `/manufacturing/${order.id}`,
          type: "mfg",
        },
      ],
    });

    const finishedBatch = await InventoryRepository.getBatchByIdOrNumber(finishedBatchNumber);
    expect(finishedBatch?.remainingQuantity).toBe(380);
    expect(finishedBatch?.unitCost).toBeCloseTo(110.8421, 4);
  });

  it("Step 7: Create customer (شركة الأناقة للملابس)", async () => {
    customer = await PartnersRepository.createPartner({
      code: "CUST-ELEGANCE-01",
      name: "Elegance Fashion Retail Stores",
      nameAr: "شركة الأناقة للملابس",
      phone: "+2025566778",
      isSupplier: false,
      isCustomer: true,
      isFactory: false,
      creditLimit: 150000,
      paymentTermsDays: 30,
      openingBalance: 0,
      notes: "سلسلة محلات أزياء تجارية",
    });

    expect(customer.id).toBeDefined();
    expect(customer.isCustomer).toBe(true);
    expect(customer.currentBalance).toBe(0);
  });

  it("Step 8: Create sales invoice (Sell 200 shirts @ 180 EGP = 36,000 EGP)", async () => {
    const unitCost = 110.8421;
    const sale = await SalesRepository.createSale(
      {
        customerId: customer.id,
        warehouseId: "wh-1",
        invoiceDate: new Date("2026-06-20"),
        dueDate: new Date("2026-07-20"),
        paymentMethod: "CREDIT",
        notes: "بيع 200 قميص قطن أبيض فاخر",
        lines: [
          {
            productId: finishedProduct.id,
            quantity: 200,
            unitPrice: 180,
            discountAmount: 0,
            allocations: [
              {
                batchId: finishedBatchNumber,
                quantity: 200,
              },
            ],
          },
        ],
      },
      customer.nameAr,
      "المستودع الرئيسي",
      { [finishedProduct.id]: { name: finishedProduct.nameAr, sku: finishedProduct.sku } },
      { [finishedBatchNumber]: { batchNumber: finishedBatchNumber, unitCost } }
    );

    expect(sale.totalAmount).toBe(36000);
    expect(sale.lines).toHaveLength(1);

    const saleLine = sale.lines[0];
    expect(saleLine.quantity).toBe(200);
    expect(saleLine.unitPrice).toBe(180);
    expect(saleLine.totalCost).toBeCloseTo(200 * unitCost, 2); // 22,168.42
    expect(saleLine.grossProfit).toBeCloseTo(36000 - 200 * unitCost, 2); // 13,831.58
    expect(saleLine.isBelowCost).toBe(false);

    // Deduct quantity from finished batch
    await InventoryRepository.deductBatchQuantity(finishedBatchNumber, 200);
    const updatedFinBatch = await InventoryRepository.getBatchByIdOrNumber(finishedBatchNumber);
    expect(updatedFinBatch?.remainingQuantity).toBe(180); // 380 - 200 = 180

    // Record Customer Receivable
    await PartnersRepository.recordInvoice(
      customer.id,
      36000,
      sale.invoiceNumber,
      "فاتورة مبيعات قمصان رجالي",
      true
    );
    const custCheck = await PartnersRepository.getPartnerById(customer.id);
    expect(custCheck?.currentBalance).toBe(36000);
  });

  it("Step 9: Record customer receipt (36,000 EGP, balance = 0)", async () => {
    await PartnersRepository.recordReceipt(
      customer.id,
      36000,
      "REC-2026-000088",
      "سداد قيمة فاتورة المبيعات بالكامل بشيك بنكي"
    );

    const custCheck = await PartnersRepository.getPartnerById(customer.id);
    expect(custCheck?.currentBalance).toBe(0);
  });

  it("Step 10: Complete Traceability Chain Verification", async () => {
    // 1. Get finished batch
    const finBatch = await InventoryRepository.getBatchByIdOrNumber(finishedBatchNumber);
    expect(finBatch).not.toBeNull();
    expect(finBatch?.sourceType).toBe("MANUFACTURING");
    expect(finBatch?.sourceDocumentNumber).toMatch(/^MFG-/);

    // 2. Look up the manufacturing order
    const mfgOrders = await ManufacturingRepository.getOrders();
    const relatedOrder = mfgOrders.find((o) => o.orderNumber === finBatch?.sourceDocumentNumber);
    expect(relatedOrder).toBeDefined();

    // 3. Inspect inputs of the manufacturing order
    const rawInput = relatedOrder?.inputs.find((i) => i.batchNumber === rawBatchNumber);
    expect(rawInput).toBeDefined();
    expect(rawInput?.quantity).toBe(800);
    expect(rawInput?.unitCost).toBe(50);

    // 4. Trace input batch back to purchase invoice
    const rawBatch = await InventoryRepository.getBatchByIdOrNumber(rawBatchNumber);
    expect(rawBatch).not.toBeNull();
    expect(rawBatch?.sourceType).toBe("PURCHASE");
    expect(rawBatch?.sourceDocumentNumber).toMatch(/^PUR-/);

    // 5. Look up purchase invoice
    const purchases = await PurchasesRepository.getPurchases();
    const relatedPurchase = purchases.find((p) => p.invoiceNumber === rawBatch?.sourceDocumentNumber);
    expect(relatedPurchase).toBeDefined();
    expect(relatedPurchase?.supplierId).toBe(supplier.id);

    // Traceability link holds 100%: Sale -> Finished Batch -> Mfg Order -> Raw Batch -> Purchase Invoice -> Supplier
  });
});
