import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Mobile-First UX & Responsive Design Audit Suite", () => {
  const rootDir = path.resolve(__dirname, "../../");

  it("1. Global Viewport & Safe Area Configuration", () => {
    const layoutPath = path.join(rootDir, "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    // Viewport meta checks
    expect(layoutContent).toContain("viewport: Viewport = {");
    expect(layoutContent).toContain("width: \"device-width\"");
    expect(layoutContent).toContain("viewportFit: \"cover\"");

    const cssPath = path.join(rootDir, "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // No page-level horizontal overflow
    expect(cssContent).toContain("overflow-x: hidden");
    expect(cssContent).toContain("max-width: 100vw");
    expect(cssContent).toContain("-webkit-tap-highlight-color: transparent");

    // Safe area utility classes
    expect(cssContent).toContain("pb-safe");
    expect(cssContent).toContain("safe-area-inset-bottom");
  });

  it("2. AppShell Mobile Header, Bottom Navigation Bar & Quick Action Sheet", () => {
    const appShellPath = path.join(rootDir, "src/components/layout/AppShell.tsx");
    const appShellContent = fs.readFileSync(appShellPath, "utf-8");

    // Mobile Topbar with touch hamburger
    expect(appShellContent).toContain("lg:hidden");
    expect(appShellContent).toContain("min-h-[44px]");
    expect(appShellContent).toContain("min-w-[44px]");

    // Mobile Sticky Bottom Navigation Bar
    expect(appShellContent).toContain("fixed bottom-0 inset-x-0");
    expect(appShellContent).toContain("pb-safe");
    expect(appShellContent).toContain("الرئيسية");
    expect(appShellContent).toContain("المخزون");
    expect(appShellContent).toContain("التصنيع");
    expect(appShellContent).toContain("المبيعات");

    // Mobile Quick Action Drawer
    expect(appShellContent).toContain("bottom-sheet");
    expect(appShellContent).toContain("إجراء سريع");
  });

  it("3. Dashboard Mobile Cards and 2-Col KPI Grid", () => {
    const pagePath = path.join(rootDir, "src/app/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // 2-column mobile KPI grid
    expect(pageContent).toContain("grid grid-cols-2 lg:grid-cols-4");
    // Mobile card list (< sm)
    expect(pageContent).toContain("sm:hidden");
    // Desktop table (>= sm)
    expect(pageContent).toContain("hidden sm:block");
  });

  it("4. Products Catalog Mobile Cards", () => {
    const productsPage = fs.readFileSync(path.join(rootDir, "src/app/products/page.tsx"), "utf-8");
    expect(productsPage).toContain("sm:hidden");
    expect(productsPage).toContain("hidden sm:block");
    expect(productsPage).toContain("min-h-[44px]");
  });

  it("5. Partners (Suppliers, Customers, Factories) Mobile Cards & Touch Targets", () => {
    const supPage = fs.readFileSync(path.join(rootDir, "src/app/suppliers/page.tsx"), "utf-8");
    expect(supPage).toContain("sm:hidden");
    expect(supPage).toContain("hidden sm:block");
    expect(supPage).toContain("tel:");
    expect(supPage).toContain("min-h-[44px]");

    const custPage = fs.readFileSync(path.join(rootDir, "src/app/customers/page.tsx"), "utf-8");
    expect(custPage).toContain("sm:hidden");
    expect(custPage).toContain("hidden sm:block");
    expect(custPage).toContain("min-h-[44px]");

    const facPage = fs.readFileSync(path.join(rootDir, "src/app/factories/page.tsx"), "utf-8");
    expect(facPage).toContain("sm:hidden");
    expect(facPage).toContain("hidden sm:block");
    expect(facPage).toContain("min-h-[44px]");
  });

  it("6. Purchases Workflow (List, New Form with Sticky Bar, Detail)", () => {
    const purListPage = fs.readFileSync(path.join(rootDir, "src/app/purchases/page.tsx"), "utf-8");
    expect(purListPage).toContain("sm:hidden");
    expect(purListPage).toContain("hidden sm:block");

    const purNewPage = fs.readFileSync(path.join(rootDir, "src/app/purchases/new/page.tsx"), "utf-8");
    expect(purNewPage).toContain("sm:hidden");
    expect(purNewPage).toContain("hidden sm:block");
    expect(purNewPage).toContain("fixed bottom-14 sm:static");
    expect(purNewPage).toContain("min-h-[44px]");

    const purDetailPage = fs.readFileSync(path.join(rootDir, "src/app/purchases/[id]/page.tsx"), "utf-8");
    expect(purDetailPage).toContain("grid grid-cols-2 lg:grid-cols-4");
    expect(purDetailPage).toContain("sm:hidden");
    expect(purDetailPage).toContain("min-h-[44px]");
  });

  it("7. Inventory & Traceability Mobile Cards and Vertical Stepper", () => {
    const invPage = fs.readFileSync(path.join(rootDir, "src/app/inventory/page.tsx"), "utf-8");
    expect(invPage).toContain("grid grid-cols-2 lg:grid-cols-4");
    expect(invPage).toContain("sm:hidden");
    expect(invPage).toContain("hidden sm:block");

    const batchPage = fs.readFileSync(path.join(rootDir, "src/app/inventory/batches/[batchId]/page.tsx"), "utf-8");
    expect(batchPage).toContain("grid grid-cols-2 lg:grid-cols-4");
    expect(batchPage).toContain("Traceability Timeline");

    const movPage = fs.readFileSync(path.join(rootDir, "src/app/inventory/movements/page.tsx"), "utf-8");
    expect(movPage).toContain("sm:hidden");
    expect(movPage).toContain("hidden sm:block");
  });

  it("8. Manufacturing Workspace Mobile Tabs and Responsive Cards", () => {
    const mfgListPage = fs.readFileSync(path.join(rootDir, "src/app/manufacturing/page.tsx"), "utf-8");
    expect(mfgListPage).toContain("sm:hidden");
    expect(mfgListPage).toContain("hidden sm:block");

    const mfgDetailPage = fs.readFileSync(path.join(rootDir, "src/app/manufacturing/[id]/page.tsx"), "utf-8");
    expect(mfgDetailPage).toContain("overflow-x-auto whitespace-nowrap");
    expect(mfgDetailPage).toContain("sm:hidden");
    expect(mfgDetailPage).toContain("hidden sm:block");
    expect(mfgDetailPage).toContain("min-h-[44px]");
  });

  it("9. Sales Workflow (List, Batch Allocator with Sticky Bar & Warning, Detail)", () => {
    const salesListPage = fs.readFileSync(path.join(rootDir, "src/app/sales/page.tsx"), "utf-8");
    expect(salesListPage).toContain("sm:hidden");
    expect(salesListPage).toContain("hidden sm:block");

    const salesNewPage = fs.readFileSync(path.join(rootDir, "src/app/sales/new/page.tsx"), "utf-8");
    expect(salesNewPage).toContain("fixed bottom-14 sm:static");
    expect(salesNewPage).toContain("min-h-[44px]");
    expect(salesNewPage).toContain("تحذير رقابي حرج");

    const salesDetailPage = fs.readFileSync(path.join(rootDir, "src/app/sales/[id]/page.tsx"), "utf-8");
    expect(salesDetailPage).toContain("grid grid-cols-2 lg:grid-cols-4");
    expect(salesDetailPage).toContain("sm:hidden");
    expect(salesDetailPage).toContain("hidden sm:block");
  });

  it("10. Treasury & Expenses Mobile Cards", () => {
    const expPage = fs.readFileSync(path.join(rootDir, "src/app/expenses/page.tsx"), "utf-8");
    expect(expPage).toContain("sm:hidden");
    expect(expPage).toContain("hidden sm:block");

    const trPage = fs.readFileSync(path.join(rootDir, "src/app/treasury/page.tsx"), "utf-8");
    expect(trPage).toContain("sm:hidden");
    expect(trPage).toContain("hidden sm:block");
  });

  it("11. Reports Portal Responsive Grids & Scoped Scroll", () => {
    const repPage = fs.readFileSync(path.join(rootDir, "src/app/reports/page.tsx"), "utf-8");
    expect(repPage).toContain("scrollbar-none");
    expect(repPage).toContain("grid-cols-2 sm:grid-cols-3");
    expect(repPage).toContain("min-h-[40px]");
  });
});
