# Trading, Manufacturing & Inventory Management System
## Core Business Rules, Costing Mechanics & Financial Invariants

---

## 1. The Specific Batch Costing Engine

### 1.1 Fundamental Principle
Every quantity entering the warehouse must maintain its exact origin, acquisition/manufacturing unit cost, and remaining quantity.
- **Rule 1.1**: The system shall **never** overwrite product cost globally when a new batch arrives.
- **Rule 1.2**: The system shall **never** use FIFO as an unalterable assumption; sales lines must explicitly allocate specific physical batches.
- **Rule 1.3**: The system shall **never** merge batches with different costs into a single blended average cost.

### 1.2 Batch Lifecycle
1. **Creation**:
   - Inward Purchase Receipt creates an `InventoryBatch` with `unitCost = (Line Total Cost / Quantity)`.
   - Closed Manufacturing Order creates output batches with `unitCost = (Allocated Output Cost / Quantity)`.
2. **Consumption & Allocation**:
   - When a batch is selected for a sale or manufacturing input, the system decrements `remainingQuantity` conditionally:
     $$\text{New Remaining} = \text{Current Remaining} - \text{Consumed Quantity}$$
     $$\text{Invariant: } \text{remainingQuantity} \ge 0.0000$$
3. **Exhaustion**:
   - When `remainingQuantity == 0.0000`, the batch remains permanently preserved in the database for historical auditability and backward traceability.

---

## 2. Sales Pricing, Profitability & Loss Protection

### 2.1 Pricing Separation
- **Cost**: The actual weighted batch cost drawn from `InventoryBatch.unitCost`.
- **Catalogue Price**: The reference default selling price configured on `Product`.
- **Gross Selling Price**: The unit price negotiated on the invoice line.
- **Net Unit Price**:
  $$\text{Net Unit Price} = \frac{(\text{Unit Price} \times \text{Quantity}) - \text{Discount}}{\text{Quantity}}$$
- **Cost of Goods Sold (COGS)**:
  $$\text{Line Cost} = \sum_{i} (\text{Allocated Quantity}_i \times \text{Batch Unit Cost}_i)$$
- **Line Gross Profit**:
  $$\text{Gross Profit} = \text{Line Subtotal} - \text{Line Cost}$$

### 2.2 Below-Cost Warning & Approval Matrix
When a user adds or edits a sales invoice line, the system calculates the relationship between Net Unit Price and Batch Cost:

| Condition | System Action | Required Permission |
|---|---|---|
| **Net Price > Batch Cost** | Allowed without interruption. Gross profit displayed in green. | `sales.create` / `sales.update` |
| **Net Price == Batch Cost** | **Warning Dialog**: *"Selling price equals product cost (Zero profit margin). Are you sure you want to proceed?"* | `sales.sell_at_cost` |
| **Net Price < Batch Cost** | **Strict Blocker / Override Modal**: *"Selling price is BELOW actual product cost. Unit loss: X EGP. Total Line Loss: Y EGP."* User cannot proceed without explicit override. | `sales.sell_below_cost` |

When a sale below cost is approved, an immutable entry is logged in `AuditLog` capturing:
`{ action: "SALE_BELOW_COST_APPROVED", lineId, productId, netPrice, unitCost, totalLoss, approverId }`.

---

## 3. Outsourced Manufacturing Costing & Multi-Output Allocation

### 3.1 Cost Accumulation Formula
An open manufacturing order accumulates costs incrementally until closure:
$$\text{Total Manufacturing Cost} = \text{Material Cost} + \text{Operational Expenses} + \text{Factory Charges}$$
Where:
- **Material Cost**: $\sum (\text{Consumed Input Batch Quantity} \times \text{Input Batch Unit Cost})$.
- **Operational Expenses (Type A)**: Transportation, packaging, fuel, loading (paid directly via treasury or accrued as general expense).
- **Factory Charges (Type B)**: Manufacturing service fee invoiced by the factory (credited directly to the factory's ledger balance).

### 3.2 Multi-Output Joint Product Cost Allocation
When an operation produces multiple output products, costs are partitioned using validated allocation algorithms:
1. **Manual Percentage Allocation (`MANUAL_PERCENTAGE`)**:
   $$\sum_{j=1}^{n} \text{Allocation Percentage}_j = 100.0000\%$$
   $$\text{Allocated Cost}_j = \text{Total Manufacturing Cost} \times \frac{\text{Allocation Percentage}_j}{100}$$
   $$\text{Unit Cost}_j = \frac{\text{Allocated Cost}_j}{\text{Output Quantity}_j}$$
2. **Rounding Reconciliation**: Any fractional cent discrepancy from rounding is automatically attributed to output index 1 (the primary output item), guaranteeing that:
   $$\sum_{j} \text{Allocated Cost}_j \equiv \text{Total Manufacturing Cost}$$

---

## 4. Ledger Architecture & Accounting Invariants

### 4.1 Ledger Invariance
- Balance columns on `BusinessPartner` and `CashAccount` are strictly derived projections.
- Reconciliation rule:
  $$\text{Calculated Customer Balance} = \text{Opening Balance} + \sum \text{Debits} - \sum \text{Credits}$$
  $$\text{Calculated Supplier/Factory Balance} = \text{Opening Balance} + \sum \text{Credits} - \sum \text{Debits}$$
- Any discrepancy between cached balance and computed ledger sum is surfaced as an integrity alert.

### 4.2 Immutable Financial Postings
Once posted to the ledger, entries are **never deleted or updated in place**. Any correction requires an offsetting reversing entry (`RETURN`, `ADJUSTMENT`, `CREDIT_NOTE`, `DEBIT_NOTE`).

---

## 5. Open Document Lifecycle & Reversible Stock Movements

### 5.1 Document Statuses
- **`DRAFT`**: Document is in preparation. Stock is verified but not yet committed.
- **`OPEN` / `CONFIRMED`**: Batches are committed from inventory; accounts ledger entries are posted.
- **`CLOSED` / `FINALIZED`**: Commercial terms frozen; immutable except via formal reversal workflows.
- **`CANCELLED`**: All associated inventory and ledger postings are completely reversed via compensatory entries.

### 5.2 Safe In-Place Modification of Open Documents
If an operator edits a line quantity on an `OPEN` sales invoice (e.g. reducing quantity from 100 to 70 units):
1. **Never simply overwrite numbers**.
2. Calculate delta: $100 - 70 = 30$ units excess.
3. Increment `InventoryBatch.remainingQuantity` by 30 units.
4. Record an `InventoryTransaction` of type `ADJUSTMENT_IN` / `SALE_DELTA` referencing the invoice.
5. Create a compensatory credit ledger entry on the customer's account for the price difference.
6. Record full before/after snapshot in `AuditLog`.

---

## 6. Granular Permission Matrix (RBAC)

| Permission Code | Admin | Manager | Accountant | Sales | Warehouse | User |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `users.manage` | Yes | - | - | - | - | - |
| `products.manage` | Yes | Yes | - | - | Read | Read |
| `inventory.view` | Yes | Yes | Yes | Read | Yes | Read |
| `inventory.adjust` | Yes | Yes | - | - | Yes | - |
| `purchases.create` | Yes | Yes | Yes | - | - | - |
| `purchases.post` | Yes | Yes | Yes | - | - | - |
| `purchases.cancel` | Yes | Yes | - | - | - | - |
| `manufacturing.create`| Yes | Yes | - | - | - | - |
| `manufacturing.update`| Yes | Yes | - | - | - | - |
| `manufacturing.close` | Yes | Yes | Yes | - | - | - |
| `sales.create` | Yes | Yes | - | Yes | - | - |
| `sales.update` | Yes | Yes | - | Yes | - | - |
| `sales.close` | Yes | Yes | Yes | Yes | - | - |
| `sales.sell_at_cost` | Yes | Yes | Yes | Yes | - | - |
| `sales.sell_below_cost`| Yes | Yes | - | - | - | - |
| `sales.override_credit`| Yes | Yes | - | - | - | - |
| `partners.manage` | Yes | Yes | Yes | Read | Read | Read |
| `payments.create` | Yes | Yes | Yes | - | - | - |
| `receipts.create` | Yes | Yes | Yes | Yes | - | - |
| `reports.financial` | Yes | Yes | Yes | - | - | - |
| `reports.operational`| Yes | Yes | Yes | Yes | Yes | - |
