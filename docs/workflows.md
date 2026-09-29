# Trading, Manufacturing & Inventory Management System
## System Workflows, Sequence Diagrams & State Machines

---

## 1. Complete End-to-End Traceability Workflow

```mermaid
graph TD
    Supplier["Supplier (BusinessPartner)"] -->|1. Issues Invoice| PI["Purchase Invoice (PUR-2026-000001)"]
    PI -->|2. Inward Receipt| TX1["InventoryTransaction (PURCHASE_RECEIPT)"]
    TX1 -->|3. Creates Batch| B1["Raw Material Batch (BAT-001)<br/>Unit Cost: 80.00 EGP"]
    
    B1 -->|4. Consumed as Input| MO["Manufacturing Order (MFG-2026-000001)"]
    Factory["Factory / Contractor"] -->|5. Manufacturing Service Fee| MO
    Expenses["Direct Expenses (Transport/Packaging)"] -->|6. Operational Costs| MO
    
    MO -->|7. Closes & Allocates Cost| TX2["InventoryTransaction (MANUFACTURING_OUTPUT)"]
    TX2 -->|8. Creates Output Batches| B2["Finished Product Batch (BAT-002)<br/>Unit Cost: 120.00 EGP"]
    
    B2 -->|9. Selected for Sale Line| SAlloc["SaleLineBatchAllocation"]
    SAlloc -->|10. Fulfills Line Item| SI["Sales Invoice (SAL-2026-000001)"]
    Customer["Customer (BusinessPartner)"] -->|11. Purchases Goods| SI
    SI -->|12. Receives Payment| Rec["Customer Receipt / Cash Inflow"]
    
    style B1 fill:#f9f,stroke:#333,stroke-width:2px
    style MO fill:#bbf,stroke:#333,stroke-width:2px
    style B2 fill:#dfd,stroke:#333,stroke-width:2px
    style SI fill:#fdd,stroke:#333,stroke-width:2px
```

---

## 2. Purchase Posting & Inward Logistics Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Purchasing Officer
    participant UI as Next.js Purchases UI
    participant Service as PurchaseService
    participant Seq as DocumentSequenceService
    participant Inv as InventoryService
    participant Ledger as LedgerService
    participant DB as PostgreSQL (Prisma Tx)

    Buyer->>UI: Enter Supplier, Items, Quantities, Unit Costs
    UI->>Service: postPurchaseInvoice(dto)
    activate Service
    Service->>DB: Begin ACID Transaction
    Service->>Seq: getNextNumber("PURCHASE")
    Seq-->>Service: PUR-2026-000001
    Service->>DB: INSERT INTO "PurchaseInvoice" & Lines (Status: OPEN)
    
    loop For each Purchase Line
        Service->>Seq: getNextNumber("BATCH")
        Seq-->>Service: BAT-2026-000001
        Service->>Inv: createBatch(productId, warehouseId, qty, unitCost, "PURCHASE", docId)
        Inv->>DB: INSERT INTO "InventoryBatch" (remainingQty = qty)
        Service->>Inv: logInventoryTransaction(PURCHASE_RECEIPT, +qty, unitCost)
        Inv->>DB: INSERT INTO "InventoryTransaction"
    end
    
    Service->>Ledger: recordPartnerCredit(supplierId, totalAmount, "PURCHASE_INVOICE", docId)
    Ledger->>DB: INSERT INTO "PartnerLedgerEntry" (Credit: totalAmount)
    Ledger->>DB: UPDATE "BusinessPartner" SET currentBalance = currentBalance + totalAmount
    
    Service->>DB: INSERT INTO "AuditLog"
    Service->>DB: Commit Transaction
    Service-->>UI: Purchase Invoice Confirmed
    deactivate Service
    UI-->>Buyer: Show Success Notification & Batch Details
```

---

## 3. Outsourced Manufacturing Execution & Closure Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Production Supervisor
    participant UI as Manufacturing Cockpit
    participant Service as ManufacturingService
    participant Inv as InventoryService
    participant Ledger as LedgerService
    participant DB as PostgreSQL (Prisma Tx)

    Operator->>UI: Add Consumed Materials (Select Batch & Quantity)
    UI->>Service: addManufacturingInput(orderId, batchId, qty)
    Service->>DB: Begin Transaction
    Service->>Inv: decrementBatch(batchId, qty)
    Inv->>DB: UPDATE "InventoryBatch" SET remainingQty = remainingQty - qty WHERE remainingQty >= qty
    Service->>Inv: logTransaction(MANUFACTURING_CONSUMPTION, -qty, batch.unitCost)
    Service->>DB: INSERT INTO "ManufacturingInput" (absorbedCost = qty * unitCost)
    Service->>DB: Commit Transaction
    UI-->>Operator: Material Absorbed

    Operator->>UI: Add Factory Charges (15,000 EGP) & Expenses (2,000 EGP)
    UI->>Service: addManufacturingExpense(orderId, type, amount, factoryId)
    Service->>DB: INSERT INTO "ManufacturingExpense"

    Operator->>UI: Define Outputs & Allocation % (Output A 60%, Output B 40%)
    Operator->>UI: Click "Close Manufacturing Operation"
    UI->>Service: closeManufacturingOrder(orderId, outputDtos)
    activate Service
    Service->>DB: Begin ACID Transaction
    Service->>Service: Validate sum(allocationPercentages) == 100.00%
    Service->>Service: Calculate Total Cost = Materials + Expenses + Factory Charges
    
    loop For each Output Product
        Service->>Service: allocatedCost = TotalCost * (Percentage / 100)
        Service->>Service: unitCost = allocatedCost / outputQuantity
        Service->>Inv: createBatch(productId, outputQty, unitCost, "MANUFACTURING", orderId)
        Inv->>DB: INSERT INTO "InventoryBatch"
        Service->>Inv: logTransaction(MANUFACTURING_OUTPUT, +outputQty, unitCost)
        Inv->>DB: INSERT INTO "InventoryTransaction"
    end

    loop For each Factory Payable Expense
        Service->>Ledger: recordPartnerCredit(factoryId, amount, "MANUFACTURING_CHARGE", orderId)
        Ledger->>DB: INSERT INTO "PartnerLedgerEntry" (Credit: amount)
    end

    Service->>DB: UPDATE "ManufacturingOrder" SET status = 'CLOSED', closedAt = NOW()
    Service->>DB: INSERT INTO "AuditLog"
    Service->>DB: Commit Transaction
    Service-->>UI: Operation Closed & Batches Capitalized
    deactivate Service
    UI-->>Operator: Display Closed Order & Unit Cost Summary
```

---

## 4. Sales Invoicing & Multi-Batch Allocation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Salesman as Sales Executive
    participant UI as Sales Invoice Portal
    participant Service as SalesService
    participant Inv as InventoryService
    participant Ledger as LedgerService
    participant DB as PostgreSQL (Prisma Tx)

    Salesman->>UI: Select Customer & Item (100 units @ 120 EGP)
    UI->>UI: Prompt User to Allocate Available Batches
    Salesman->>UI: Allocate: 60 units from Batch 1 (cost 80), 40 units from Batch 2 (cost 95)
    UI->>UI: Calculate Line Cost = (60*80) + (40*95) = 8,600 EGP (Unit Cost: 86 EGP)
    UI->>UI: Check: Net Price (120) >= Cost (86) -> Profit: 3,400 EGP (Pass)
    
    Salesman->>UI: Post Sales Invoice
    UI->>Service: postSalesInvoice(dto)
    activate Service
    Service->>DB: Begin ACID Transaction
    
    loop For each Allocated Batch
        Service->>Inv: decrementBatch(batchId, allocQty)
        Inv->>DB: UPDATE "InventoryBatch" SET remainingQty = remainingQty - allocQty WHERE remainingQty >= allocQty
        Service->>Inv: logTransaction(SALE, -allocQty, batch.unitCost)
        Inv->>DB: INSERT INTO "InventoryTransaction"
        Service->>DB: INSERT INTO "SaleLineBatchAllocation"
    end
    
    Service->>DB: INSERT INTO "SalesInvoice" & Lines (totalCost: 8600, grossProfit: 3400)
    Service->>Ledger: recordPartnerDebit(customerId, totalAmount, "SALES_INVOICE", invoiceId)
    Ledger->>DB: INSERT INTO "PartnerLedgerEntry" (Debit: totalAmount)
    Ledger->>DB: UPDATE "BusinessPartner" SET currentBalance = currentBalance + totalAmount
    
    Service->>DB: INSERT INTO "AuditLog"
    Service->>DB: Commit Transaction
    Service-->>UI: Invoice Confirmed & Receivable Booked
    deactivate Service
```

---

## 5. Document State Machine Diagrams

### 5.1 Purchase Invoice State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create New
    DRAFT --> OPEN : Post / Confirm (Stock & Ledger Posted)
    DRAFT --> CANCELLED : Discard
    OPEN --> PARTIALLY_PAID : Partial Payment Received
    OPEN --> PAID : Full Payment Settled
    PARTIALLY_PAID --> PAID : Balance Settled
    OPEN --> CANCELLED : Cancel (Compensatory Reversal Required)
    PAID --> [*]
    CANCELLED --> [*]
```

### 5.2 Manufacturing Order State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Order
    DRAFT --> OPEN : Confirm Order
    OPEN --> IN_PROGRESS : Consume Materials / Add Expenses
    IN_PROGRESS --> READY_TO_CLOSE : All Inputs & Costs Logged
    READY_TO_CLOSE --> CLOSED : Allocate Costs & Capitalize Outputs (Batches Created)
    OPEN --> CANCELLED : Void Order (Reverse Any Consumed Stock)
    IN_PROGRESS --> CANCELLED : Void Order (Reverse Consumed Stock)
    CLOSED --> [*]
    CANCELLED --> [*]
```

### 5.3 Sales Invoice State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Prepare Quotation / Draft
    DRAFT --> OPEN : Confirm Sale (Stock Decremented & Receivable Booked)
    DRAFT --> CANCELLED : Discard Draft
    OPEN --> PARTIALLY_PAID : Customer Partial Payment
    OPEN --> PAID : Customer Settles Full Amount
    PARTIALLY_PAID --> PAID : Final Installment Received
    OPEN --> CANCELLED : Void Sale (Full Stock Reversal & Credit Note)
    PAID --> [*]
    CANCELLED --> [*]
```
