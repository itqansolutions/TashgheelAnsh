import { NextResponse } from "next/server";
import { MasterDataRepository } from "@/server/repositories/masterData";
import { InventoryRepository } from "@/server/repositories/inventoryRepository";
import { PartnersRepository } from "@/server/repositories/partnersRepository";
import { PurchasesRepository } from "@/server/repositories/purchasesRepository";
import { ManufacturingRepository } from "@/server/repositories/manufacturingRepository";
import { SalesRepository } from "@/server/repositories/salesRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({
      products: [],
      batches: [],
      partners: [],
      purchases: [],
      manufacturing: [],
      sales: [],
    });
  }

  try {
    const [allProducts, allBatches, allPartners, allPurchases, allOrders, allSales] =
      await Promise.all([
        MasterDataRepository.getProducts(),
        InventoryRepository.getBatches(),
        PartnersRepository.getPartners(),
        PurchasesRepository.getPurchases(),
        ManufacturingRepository.getOrders(),
        SalesRepository.getSales(),
      ]);

    const products = allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.nameAr,
        subtitle: `${p.sku} • ${p.name}`,
        url: `/products/${p.id}`,
        category: "منتجات وأصناف",
      }));

    const batches = allBatches
      .filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(q) ||
          b.productName.toLowerCase().includes(q) ||
          b.productSku.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        title: b.batchNumber,
        subtitle: `${b.productName} • رصيد: ${b.remainingQuantity}`,
        url: `/inventory/batches/${b.id}`,
        category: "لوتات وباتشات المخزون",
      }));

    const partners = allPartners
      .filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          (p.phone && p.phone.includes(q))
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.nameAr,
        subtitle: `${p.code} • ${p.isSupplier ? "مورد" : p.isCustomer ? "عميل" : "مصنع"}`,
        url: p.isCustomer ? `/customers` : p.isFactory ? `/factories` : `/suppliers/${p.id}`,
        category: "شركاء الأعمال",
      }));

    const purchases = allPurchases
      .filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.invoiceNumber,
        subtitle: `${p.supplierName} • ${p.invoiceDate}`,
        url: `/purchases/${p.id}`,
        category: "فواتير المشتريات",
      }));

    const manufacturing = allOrders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.factoryName.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        title: o.orderNumber,
        subtitle: `${o.factoryName} • الحالة: ${o.status}`,
        url: `/manufacturing/${o.id}`,
        category: "أوامر التصنيع والتشغيل",
      }));

    const sales = allSales
      .filter(
        (s) =>
          s.invoiceNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        title: s.invoiceNumber,
        subtitle: `${s.customerName} • ${s.invoiceDate}`,
        url: `/sales/${s.id}`,
        category: "فواتير المبيعات",
      }));

    return NextResponse.json({
      products,
      batches,
      partners,
      purchases,
      manufacturing,
      sales,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
