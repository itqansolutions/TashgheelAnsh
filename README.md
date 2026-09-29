# Trading, Manufacturing & Inventory Management System (ERP)
## منظومة إدارة التجارة والتصنيع لدى الغير والمخازن

A production-grade, transaction-driven Enterprise Resource Planning (ERP) platform architected for trading and outsourced manufacturing businesses.

---

## 🌟 Key Architectural Pillars

1. **Specific Batch / Lot Costing**:
   - Every stock entry retains its exact origin and unit cost.
   - Strictly prohibits arbitrary average costing or forced FIFO.
   - Sales lines allocate across one or multiple batches (`SaleLineBatchAllocation`) to reflect true physical lot consumption.

2. **Outsourced Manufacturing Cost Accumulation**:
   - Consumes specific raw material and semi-finished batches (reducing inventory immediately).
   - Incurs general operational expenses (Type A: transport, packaging).
   - Accrues factory payable service charges (Type B: credited directly to factory ledger).
   - Multi-output cost allocation with manual percentage validation (100.00%) and automatic penny reconciliation.

3. **Transaction & Ledger-Based Accounting**:
   - Double-entry ledger architecture for Suppliers, Customers, Factories, and Treasury.
   - Balances are strictly derived from and reconcilable against underlying ledger entries.

4. **Sales Loss Prevention & Margin Protection**:
   - At-cost warning: alerts when selling price equals product cost.
   - Below-cost blocking: requires managerial approval (`sales.sell_below_cost`) and calculates exact line loss.

5. **End-to-End Traceability**:
   - Complete bidirectional audit trail:
     `Purchase Invoice → Inward Batch → Manufacturing Order → Finished Batch → Sales Invoice → Customer Payment`

---

## 🛠 Technology Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons.
- **RTL & Localization**: Arabic-first user interface with native RTL layout (`dir="rtl"`) and Cairo typography.
- **Backend**: Next.js Server Actions, Route Handlers, Layered Domain Architecture.
- **Database & ORM**: PostgreSQL 16+ on Railway, Prisma ORM with `Decimal(18, 4)` precision.
- **Security & RBAC**: Auth.js / NextAuth with bcryptjs password hashing and server-side permission matrix.
- **Testing**: Vitest for unit & domain tests.

---

## 📂 Project Directory Structure

```text
├── docs/
│   ├── architecture.md       # Full system architecture, layer diagrams, and concurrency design
│   ├── database.md           # PostgreSQL schema, ERD, indexes, and constraints
│   ├── business-rules.md     # Specific batch costing, loss prevention, and ledger rules
│   └── workflows.md          # State machines, sequence diagrams, and traceability flows
├── prisma/
│   ├── schema.prisma         # Normalized database schema
│   └── seed.ts               # Production-grade seed script for master data, roles, partners
├── src/
│   ├── app/
│   │   ├── api/health/       # Railway container readiness & DB health check
│   │   ├── globals.css       # Tailwind RTL tokens & styles
│   │   ├── layout.tsx        # Arabic RTL root layout
│   │   └── page.tsx          # Management dashboard cockpit & traceability explorer
│   ├── components/
│   │   └── layout/AppShell.tsx # Enterprise RTL sidebar & responsive shell
│   ├── server/
│   │   ├── domain/           # Pure domain calculation models (costing, profit, ledgers)
│   │   ├── permissions/      # RBAC permission matrix & role definitions
│   │   ├── services/         # Transactional orchestration services (atomic Prisma transactions)
│   │   └── validators/       # Zod schemas for all API payloads and forms
│   └── lib/                  # Database singleton, formatters, and utilities
└── tests/
    └── unit/                 # Vitest domain & service integration test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v20+ or v24+
- pnpm (recommended) or npm
- PostgreSQL database (local or hosted on Railway)

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_mfg_erp?schema=public"
AUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Migrate
```bash
# Generate Prisma Client
pnpm db:generate

# Push schema or run migrations
pnpm db:push
# or
pnpm db:migrate
```

### 4. Seed Master Data & Roles
```bash
pnpm db:seed
```
Default Administrator credentials:
- **Email**: `admin@enterprise.com`
- **Password**: `Admin@123456`

### 5. Run the Application
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Run the domain and service tests:
```bash
pnpm test
```

Tests verify:
- Specific batch costing & weighted allocation.
- Selling below-cost and at-cost detection.
- Outsourced manufacturing multi-output cost allocation & penny balancing.
- Double-entry customer and supplier ledger balance invariants.
- Concurrency protection and document sequence numbering.

---

## 🚂 Railway Deployment Guide

1. **Connect GitHub Repository**: Link this repository in your Railway project dashboard.
2. **Add PostgreSQL Service**: Provision a PostgreSQL database plugin in the same Railway project.
3. **Configure Environment Variables**:
   - `DATABASE_URL`: Automatically linked from the Railway PostgreSQL plugin (`${{Postgres.DATABASE_URL}}`).
   - `AUTH_SECRET`: Generate a secure 32+ character random string.
   - `NODE_ENV`: `production`
4. **Build & Start Commands**:
   - Build Command: `pnpm run build` (runs `prisma generate && next build`)
   - Pre-deploy Command: `pnpm run db:deploy`
   - Start Command: `pnpm start`
5. **Health Check**:
   Configure Railway health check path to: `/api/health`
