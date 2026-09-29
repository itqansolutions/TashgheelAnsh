import prisma from "@/lib/db";
import { CreateProductInput, UpdateProductInput } from "../validators/products";

export interface MockProduct {
  id: string;
  sku: string;
  name: string;
  nameAr: string;
  description?: string | null;
  categoryId: string;
  categoryName?: string;
  uomId: string;
  uomSymbol?: string;
  itemType: "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED_PRODUCT" | "SERVICE" | "OTHER";
  defaultSellingPrice: number;
  minSellingPrice: number;
  referenceCost: number;
  isActive: boolean;
  currentStock: number;
  batchesCount: number;
  totalInventoryValue: number;
}

// In-memory initial data for master data
let inMemoryProducts: MockProduct[] = [
  {
    id: "prod-1",
    sku: "RM-STEEL-01",
    name: "Steel Sheet Roll 2mm",
    nameAr: "لفائف صاج معالج سمك 2 مم",
    description: "لفائف صاج بارد مجلفن عالي الجودة للأعمال الهندسية",
    categoryId: "cat-1",
    categoryName: "مواد خام أساسية",
    uomId: "uom-1",
    uomSymbol: "كجم",
    itemType: "RAW_MATERIAL",
    defaultSellingPrice: 95.0,
    minSellingPrice: 85.0,
    referenceCost: 80.0,
    isActive: true,
    currentStock: 300,
    batchesCount: 1,
    totalInventoryValue: 24000.0,
  },
  {
    id: "prod-2",
    sku: "SF-FRAME-01",
    name: "Pre-formed Cabinet Chassis",
    nameAr: "هيكل كابينة نصف مجمع",
    description: "هياكل حديدية مشكلة ومثقبة جاهزة للدهان والتقفيل",
    categoryId: "cat-2",
    categoryName: "منتجات نصف مصنعة",
    uomId: "uom-2",
    uomSymbol: "قطعة",
    itemType: "SEMI_FINISHED",
    defaultSellingPrice: 250.0,
    minSellingPrice: 220.0,
    referenceCost: 185.0,
    isActive: true,
    currentStock: 120,
    batchesCount: 1,
    totalInventoryValue: 22200.0,
  },
  {
    id: "prod-3",
    sku: "FP-CABINET-01",
    name: "Heavy Duty Electrical Distribution Panel",
    nameAr: "لوحة توزيع كهربائية قياسية كاملة التجهيز",
    description: "كابينة توزيع جهد منخفض معتمدة بالمكونات الداخلية",
    categoryId: "cat-3",
    categoryName: "منتجات تامة الصنع",
    uomId: "uom-2",
    uomSymbol: "قطعة",
    itemType: "FINISHED_PRODUCT",
    defaultSellingPrice: 850.0,
    minSellingPrice: 750.0,
    referenceCost: 520.0,
    isActive: true,
    currentStock: 35,
    batchesCount: 1,
    totalInventoryValue: 18200.0,
  },
];

let inMemoryCategories = [
  { id: "cat-1", code: "CAT-RAW", name: "Raw Materials", nameAr: "مواد خام أساسية", count: 1 },
  { id: "cat-2", code: "CAT-SEMI", name: "Semi-Finished Goods", nameAr: "منتجات نصف مصنعة", count: 1 },
  { id: "cat-3", code: "CAT-FIN", name: "Finished Products", nameAr: "منتجات تامة الصنع", count: 1 },
  { id: "cat-4", code: "CAT-SRV", name: "Industrial Services", nameAr: "خدمات تصنيع وتشغيل", count: 0 },
];

let inMemoryUoms = [
  { id: "uom-1", code: "KG", name: "Kilogram", nameAr: "كيلوجرام", symbol: "كجم" },
  { id: "uom-2", code: "PCS", name: "Piece", nameAr: "قطعة", symbol: "ق" },
  { id: "uom-3", code: "MTR", name: "Meter", nameAr: "متر", symbol: "م" },
  { id: "uom-4", code: "TON", name: "Ton", nameAr: "طن", symbol: "طن" },
];

let inMemoryWarehouses = [
  {
    id: "wh-1",
    code: "WH-MAIN",
    name: "Main Industrial Warehouse",
    nameAr: "المستودع الرئيسي - المنطقة الصناعية",
    address: "المنطقة الصناعية الثالثة، السادس من أكتوبر، الجيزة",
    isActive: true,
  },
  {
    id: "wh-2",
    code: "WH-FACTORY",
    name: "Factory In-Transit Warehouse",
    nameAr: "مستودع تشغيلات المصانع الخارجية",
    address: "مجمع الصناعات المتطورة، بدر",
    isActive: true,
  },
];

export class MasterDataRepository {
  static async getProducts(search?: string, categoryId?: string, itemType?: string) {
    try {
      const dbProducts = await prisma.product.findMany({
        include: {
          category: true,
          uom: true,
          batches: true,
        },
      });
      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map((p) => {
          const currentStock = p.batches.reduce(
            (acc, b) => acc + parseFloat(b.remainingQuantity.toString()),
            0
          );
          const totalInventoryValue = p.batches.reduce(
            (acc, b) =>
              acc +
              parseFloat(b.remainingQuantity.toString()) *
                parseFloat(b.unitCost.toString()),
            0
          );
          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            nameAr: p.nameAr,
            description: p.description,
            categoryId: p.categoryId,
            categoryName: p.category.nameAr,
            uomId: p.uomId,
            uomSymbol: p.uom.symbol,
            itemType: p.itemType,
            defaultSellingPrice: parseFloat(p.defaultSellingPrice.toString()),
            minSellingPrice: parseFloat(p.minSellingPrice.toString()),
            referenceCost: parseFloat(p.referenceCost.toString()),
            isActive: p.isActive,
            currentStock,
            batchesCount: p.batches.length,
            totalInventoryValue,
          };
        });
      }
    } catch {
      // fallback to in-memory
    }

    let filtered = [...inMemoryProducts];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q)
      );
    }
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }
    if (itemType) {
      filtered = filtered.filter((p) => p.itemType === itemType);
    }
    return filtered;
  }

  static async getProductById(id: string) {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  }

  static async createProduct(input: CreateProductInput) {
    const id = `prod-${Date.now()}`;
    const category = inMemoryCategories.find((c) => c.id === input.categoryId);
    const uom = inMemoryUoms.find((u) => u.id === input.uomId);

    const newProd: MockProduct = {
      id,
      sku: input.sku,
      name: input.name,
      nameAr: input.nameAr,
      description: input.description,
      categoryId: input.categoryId,
      categoryName: category?.nameAr || "عام",
      uomId: input.uomId,
      uomSymbol: uom?.symbol || "وحدة",
      itemType: input.itemType,
      defaultSellingPrice: input.defaultSellingPrice,
      minSellingPrice: input.minSellingPrice,
      referenceCost: input.referenceCost,
      isActive: true,
      currentStock: 0,
      batchesCount: 0,
      totalInventoryValue: 0,
    };

    inMemoryProducts.unshift(newProd);
    return newProd;
  }

  static async getCategories() {
    return inMemoryCategories;
  }

  static async getUnitsOfMeasure() {
    return inMemoryUoms;
  }

  static async getWarehouses() {
    return inMemoryWarehouses;
  }
}
