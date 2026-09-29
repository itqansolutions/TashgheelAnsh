import prisma from "@/lib/db";
import { CreatePartnerInput } from "../validators/partners";

export interface MockPartner {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  isSupplier: boolean;
  isCustomer: boolean;
  isFactory: boolean;
  creditLimit: number;
  paymentTermsDays: number;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes?: string | null;
  totalPurchases?: number;
  totalPayments?: number;
  totalSales?: number;
  totalReceipts?: number;
}

export interface StatementEntry {
  id: string;
  entryDate: string;
  referenceType: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
}

let inMemoryPartners: MockPartner[] = [
  {
    id: "part-sup-1",
    code: "BP-SUP-01",
    name: "El Nasr Raw Materials Supply",
    nameAr: "شركة النصر لتوريد الخامات المعدنية",
    phone: "+20233445566",
    mobile: "+201001122334",
    email: "supplier@elnasr-metals.com",
    address: "العاشر من رمضان، المنطقة الصناعية الثالثة B4",
    taxNumber: "100-245-890",
    isSupplier: true,
    isCustomer: false,
    isFactory: false,
    creditLimit: 0,
    paymentTermsDays: 30,
    openingBalance: 0,
    currentBalance: 40000.0, // We owe them 40,000 EGP
    isActive: true,
    totalPurchases: 70000.0,
    totalPayments: 30000.0,
    notes: "مورد معتمد للصلب والصاج المدرفل",
  },
  {
    id: "part-fac-1",
    code: "BP-FAC-01",
    name: "El Amal Advanced Machining Factory",
    nameAr: "مصنع الأمل للصناعات الهندسية والتشكيل",
    phone: "+20238877665",
    mobile: "+201223344556",
    email: "orders@elamal-factory.com",
    address: "مجمع الصناعات المتطورة، بدر، عنبر 14",
    taxNumber: "220-456-789",
    isSupplier: true,
    isCustomer: false,
    isFactory: true,
    creditLimit: 0,
    paymentTermsDays: 15,
    openingBalance: 0,
    currentBalance: 15000.0, // We owe them 15,000 EGP for manufacturing service
    isActive: true,
    totalPurchases: 15000.0,
    totalPayments: 0,
    notes: "شريك تصنيع وتشغيل قطاعات وهياكل الكبائن",
  },
  {
    id: "part-cust-1",
    code: "BP-CUST-01",
    name: "Al Ahram Commercial & Distribution",
    nameAr: "شركة الأهرام للتجارة والمقاولات",
    phone: "+201012345678",
    mobile: "+201122334455",
    email: "procurement@alahram-trading.com",
    address: "شارع مصدق، الدقي، الجيزة",
    taxNumber: "330-987-654",
    isSupplier: false,
    isCustomer: true,
    isFactory: false,
    creditLimit: 150000.0,
    paymentTermsDays: 45,
    openingBalance: 0,
    currentBalance: 55000.0, // Customer owes us 55,000 EGP
    isActive: true,
    totalSales: 95000.0,
    totalReceipts: 40000.0,
    notes: "عميل تجاري رئيسي - فئة ائتمانية أولى",
  },
];

let inMemoryStatementEntries: Record<string, StatementEntry[]> = {
  "part-sup-1": [
    {
      id: "led-1",
      entryDate: "2026-05-01",
      referenceType: "PURCHASE_INVOICE",
      referenceNumber: "PUR-2026-000001",
      description: "فاتورة توريد خامات صاج 500 كجم",
      debit: 0,
      credit: 40000.0,
      balanceAfter: 40000.0,
    },
    {
      id: "led-2",
      entryDate: "2026-05-08",
      referenceType: "PURCHASE_INVOICE",
      referenceNumber: "PUR-2026-000002",
      description: "فاتورة توريد إضافية صاج 375 كجم",
      debit: 0,
      credit: 30000.0,
      balanceAfter: 70000.0,
    },
    {
      id: "led-3",
      entryDate: "2026-05-15",
      referenceType: "PAYMENT",
      referenceNumber: "PAY-2026-000001",
      description: "سداد دفعة نقدية من الخزينة الرئيسية",
      debit: 30000.0,
      credit: 0,
      balanceAfter: 40000.0,
    },
  ],
  "part-fac-1": [
    {
      id: "led-fac-1",
      entryDate: "2026-05-12",
      referenceType: "MANUFACTURING_CHARGE",
      referenceNumber: "MFG-2026-000001",
      description: "أتعاب تشغيل وتصنيع كبائن توزيع",
      debit: 0,
      credit: 15000.0,
      balanceAfter: 15000.0,
    },
  ],
  "part-cust-1": [
    {
      id: "led-cust-1",
      entryDate: "2026-05-14",
      referenceType: "SALES_INVOICE",
      referenceNumber: "SAL-2026-000001",
      description: "فاتورة مبيعات كبائن توزيع معتمدة",
      debit: 95000.0,
      credit: 0,
      balanceAfter: 95000.0,
    },
    {
      id: "led-cust-2",
      entryDate: "2026-05-20",
      referenceType: "RECEIPT",
      referenceNumber: "REC-2026-000001",
      description: "تحصيل شيك بنكي من العميل",
      debit: 0,
      credit: 40000.0,
      balanceAfter: 55000.0,
    },
  ],
};

export class PartnersRepository {
  static async getPartners(role?: "SUPPLIER" | "CUSTOMER" | "FACTORY", search?: string): Promise<MockPartner[]> {
    try {
      const where: any = {};
      if (role === "SUPPLIER") where.isSupplier = true;
      if (role === "CUSTOMER") where.isCustomer = true;
      if (role === "FACTORY") where.isFactory = true;

      const dbPartners = await prisma.businessPartner.findMany({ where });
      if (dbPartners && dbPartners.length > 0) {
        return dbPartners.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          nameAr: p.nameAr,
          phone: p.phone,
          mobile: p.mobile,
          email: p.email,
          address: p.address,
          taxNumber: p.taxNumber,
          isSupplier: p.isSupplier,
          isCustomer: p.isCustomer,
          isFactory: p.isFactory,
          creditLimit: parseFloat(p.creditLimit.toString()),
          paymentTermsDays: p.paymentTermsDays,
          openingBalance: parseFloat(p.openingBalance.toString()),
          currentBalance: parseFloat(p.currentBalance.toString()),
          isActive: p.isActive,
          notes: p.notes,
          totalPurchases: 0,
          totalPayments: 0,
          totalSales: 0,
          totalReceipts: 0,
        }));
      }
    } catch {
      // fallback
    }

    let result = [...inMemoryPartners];
    if (role === "SUPPLIER") result = result.filter((p) => p.isSupplier);
    if (role === "CUSTOMER") result = result.filter((p) => p.isCustomer);
    if (role === "FACTORY") result = result.filter((p) => p.isFactory);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          (p.phone && p.phone.includes(q))
      );
    }
    return result;
  }

  static async getPartnerById(id: string) {
    const all = await this.getPartners();
    return all.find((p) => p.id === id) || inMemoryPartners.find((p) => p.id === id) || null;
  }

  static async createPartner(input: CreatePartnerInput) {
    const id = `part-${Date.now()}`;
    const newPartner: MockPartner = {
      id,
      code: input.code,
      name: input.name,
      nameAr: input.nameAr,
      phone: input.phone,
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      taxNumber: input.taxNumber,
      isSupplier: !!input.isSupplier,
      isCustomer: !!input.isCustomer,
      isFactory: !!input.isFactory,
      creditLimit: input.creditLimit || 0,
      paymentTermsDays: input.paymentTermsDays || 0,
      openingBalance: input.openingBalance || 0,
      currentBalance: input.openingBalance || 0,
      isActive: true,
      notes: input.notes,
      totalPurchases: 0,
      totalPayments: 0,
      totalSales: 0,
      totalReceipts: 0,
    };
    inMemoryPartners.unshift(newPartner);
    inMemoryStatementEntries[id] = [];
    return newPartner;
  }

  static async getStatement(partnerId: string, fromDate?: string, toDate?: string) {
    const entries = inMemoryStatementEntries[partnerId] || [];
    let filtered = [...entries];
    if (fromDate) {
      filtered = filtered.filter((e) => e.entryDate >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((e) => e.entryDate <= toDate);
    }
    return filtered;
  }

  static async recordPayment(
    partnerId: string,
    amount: number,
    referenceNumber: string,
    description: string
  ) {
    const partner = inMemoryPartners.find((p) => p.id === partnerId);
    if (!partner) throw new Error("Partner not found");

    partner.currentBalance -= amount;
    if (!partner.totalPayments) partner.totalPayments = 0;
    partner.totalPayments += amount;

    const entry: StatementEntry = {
      id: `led-${Date.now()}`,
      entryDate: new Date().toISOString().split("T")[0],
      referenceType: "PAYMENT",
      referenceNumber,
      description,
      debit: amount,
      credit: 0,
      balanceAfter: partner.currentBalance,
    };

    if (!inMemoryStatementEntries[partnerId]) {
      inMemoryStatementEntries[partnerId] = [];
    }
    inMemoryStatementEntries[partnerId].push(entry);
    return entry;
  }

  static async recordReceipt(
    partnerId: string,
    amount: number,
    referenceNumber: string,
    description: string
  ) {
    const partner = inMemoryPartners.find((p) => p.id === partnerId);
    if (!partner) throw new Error("Partner not found");

    partner.currentBalance -= amount;
    if (!partner.totalReceipts) partner.totalReceipts = 0;
    partner.totalReceipts += amount;

    const entry: StatementEntry = {
      id: `led-${Date.now()}`,
      entryDate: new Date().toISOString().split("T")[0],
      referenceType: "RECEIPT",
      referenceNumber,
      description,
      debit: 0,
      credit: amount,
      balanceAfter: partner.currentBalance,
    };

    if (!inMemoryStatementEntries[partnerId]) {
      inMemoryStatementEntries[partnerId] = [];
    }
    inMemoryStatementEntries[partnerId].push(entry);
    return entry;
  }

  static async recordInvoice(
    partnerId: string,
    amount: number,
    referenceNumber: string,
    description: string,
    isSales: boolean
  ) {
    const partner = inMemoryPartners.find((p) => p.id === partnerId);
    if (!partner) throw new Error("Partner not found");

    if (isSales) {
      // Customer receivable increases (debit)
      partner.currentBalance += amount;
      if (!partner.totalSales) partner.totalSales = 0;
      partner.totalSales += amount;
    } else {
      // Supplier or Factory payable increases (credit)
      partner.currentBalance += amount;
      if (!partner.totalPurchases) partner.totalPurchases = 0;
      partner.totalPurchases += amount;
    }

    const entry: StatementEntry = {
      id: `led-${Date.now()}`,
      entryDate: new Date().toISOString().split("T")[0],
      referenceType: isSales ? "SALES_INVOICE" : "PURCHASE_INVOICE",
      referenceNumber,
      description,
      debit: isSales ? amount : 0,
      credit: isSales ? 0 : amount,
      balanceAfter: partner.currentBalance,
    };

    if (!inMemoryStatementEntries[partnerId]) {
      inMemoryStatementEntries[partnerId] = [];
    }
    inMemoryStatementEntries[partnerId].push(entry);
    return entry;
  }
}
