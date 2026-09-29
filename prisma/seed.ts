import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "../src/server/permissions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ERP database seeding...");

  // 1. Seed Permissions
  console.log("1. Seeding Permissions...");
  for (const [key, code] of Object.entries(PERMISSIONS)) {
    const module = code.split(".")[0];
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        module,
        description: `Permission to perform ${code}`,
      },
    });
  }

  // 2. Seed Roles & Assign Permissions
  console.log("2. Seeding Roles & Permissions...");
  for (const [roleCode, permCodes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: {},
      create: {
        code: roleCode,
        name: roleCode,
        description: `${roleCode} Role with standard ERP privileges`,
      },
    });

    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // 3. Seed Default Admin User
  console.log("3. Seeding Default Admin User...");
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { code: "ADMIN" },
  });

  const passwordHash = await bcrypt.hash("Admin@123456", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@enterprise.com" },
    update: { passwordHash },
    create: {
      name: "مدير النظام العام (Admin)",
      email: "admin@enterprise.com",
      passwordHash,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 4. Seed Units of Measure
  console.log("4. Seeding Units of Measure...");
  const uoms = [
    { code: "KG", name: "Kilogram", nameAr: "كيلوجرام", symbol: "كجم" },
    { code: "PCS", name: "Piece", nameAr: "قطعة", symbol: "ق" },
    { code: "MTR", name: "Meter", nameAr: "متر", symbol: "م" },
    { code: "TON", name: "Ton", nameAr: "طن", symbol: "طن" },
  ];

  const createdUoms: Record<string, string> = {};
  for (const uom of uoms) {
    const created = await prisma.unitOfMeasure.upsert({
      where: { code: uom.code },
      update: {},
      create: uom,
    });
    createdUoms[uom.code] = created.id;
  }

  // 5. Seed Product Categories
  console.log("5. Seeding Product Categories...");
  const categories = [
    { code: "CAT-RAW", name: "Raw Materials", nameAr: "مواد خام أساسية" },
    { code: "CAT-SEMI", name: "Semi-Finished Goods", nameAr: "منتجات نصف مصنعة" },
    { code: "CAT-FIN", name: "Finished Products", nameAr: "منتجات تامة الصنع" },
    { code: "CAT-SRV", name: "Industrial Services", nameAr: "خدمات تصنيع وتشغيل" },
  ];

  const createdCats: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.productCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
    createdCats[cat.code] = created.id;
  }

  // 6. Seed Default Warehouse
  console.log("6. Seeding Warehouses...");
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      code: "WH-MAIN",
      name: "Main Industrial Warehouse",
      nameAr: "المستودع الرئيسي - المنطقة الصناعية",
      address: "المنطقة الصناعية الثالثة، السادس من أكتوبر، الجيزة",
    },
  });

  // 7. Seed Business Partners
  console.log("7. Seeding Business Partners...");
  // Supplier
  await prisma.businessPartner.upsert({
    where: { code: "BP-SUP-01" },
    update: {},
    create: {
      code: "BP-SUP-01",
      name: "El Nasr Raw Materials Supply",
      nameAr: "شركة النصر لتوريد الخامات المعدنية",
      isSupplier: true,
      phone: "+20233445566",
      email: "supplier@elnasr-metals.com",
      address: "العاشر من رمضان، الشرقية",
      openingBalance: "0.0000",
      currentBalance: "0.0000",
    },
  });

  // Factory (Contract Manufacturer + Raw material supplier hybrid)
  await prisma.businessPartner.upsert({
    where: { code: "BP-FAC-01" },
    update: {},
    create: {
      code: "BP-FAC-01",
      name: "El Amal Advanced Machining Factory",
      nameAr: "مصنع الأمل للصناعات الهندسية والتشكيل",
      isFactory: true,
      isSupplier: true,
      phone: "+20238877665",
      email: "orders@elamal-factory.com",
      address: "مجمع الصناعات المتطورة، بدر",
      openingBalance: "0.0000",
      currentBalance: "0.0000",
    },
  });

  // Customer
  await prisma.businessPartner.upsert({
    where: { code: "BP-CUST-01" },
    update: {},
    create: {
      code: "BP-CUST-01",
      name: "Al Ahram Commercial & Distribution",
      nameAr: "شركة الأهرام للتجارة والمقاولات",
      isCustomer: true,
      phone: "+201012345678",
      email: "procurement@alahram-trading.com",
      address: "المهندسين، الجيزة",
      creditLimit: "100000.0000",
      openingBalance: "0.0000",
      currentBalance: "0.0000",
    },
  });

  // 8. Seed Master Products
  console.log("8. Seeding Master Products...");
  await prisma.product.upsert({
    where: { sku: "RM-STEEL-01" },
    update: {},
    create: {
      sku: "RM-STEEL-01",
      name: "Steel Sheet Roll 2mm",
      nameAr: "لفائف صاج معالج سمك 2 مم",
      categoryId: createdCats["CAT-RAW"],
      uomId: createdUoms["KG"],
      itemType: "RAW_MATERIAL",
      defaultSellingPrice: "95.0000",
      referenceCost: "80.0000",
    },
  });

  await prisma.product.upsert({
    where: { sku: "SF-FRAME-01" },
    update: {},
    create: {
      sku: "SF-FRAME-01",
      name: "Pre-formed Cabinet Chassis",
      nameAr: "هيكل كابينة نصف مجمع",
      categoryId: createdCats["CAT-SEMI"],
      uomId: createdUoms["PCS"],
      itemType: "SEMI_FINISHED",
      defaultSellingPrice: "250.0000",
      referenceCost: "190.0000",
    },
  });

  await prisma.product.upsert({
    where: { sku: "FP-CABINET-01" },
    update: {},
    create: {
      sku: "FP-CABINET-01",
      name: "Heavy Duty Electrical Distribution Panel",
      nameAr: "لوحة توزيع كهربائية قياسية كاملة التجهيز",
      categoryId: createdCats["CAT-FIN"],
      uomId: createdUoms["PCS"],
      itemType: "FINISHED_PRODUCT",
      defaultSellingPrice: "850.0000",
      minSellingPrice: "750.0000",
      referenceCost: "550.0000",
    },
  });

  // 9. Seed Cash / Treasury Account
  console.log("9. Seeding Cash & Treasury Accounts...");
  await prisma.cashAccount.upsert({
    where: { code: "TREASURY-01" },
    update: {},
    create: {
      code: "TREASURY-01",
      name: "Main Corporate Cash Drawer",
      nameAr: "خزينة المركز الرئيسي النقدية",
      accountType: "CASH_DRAWER",
      currency: "EGP",
      balance: "50000.0000",
    },
  });

  // 10. Seed Expense Categories
  console.log("10. Seeding Expense Categories...");
  const expenseCategories = [
    { code: "EXP-TRANS", name: "Transportation & Freight", nameAr: "نقل ومشال ومناولة" },
    { code: "EXP-PKG", name: "Packaging & Crating", nameAr: "تغليف وتعبئة صناعية" },
    { code: "EXP-MFG", name: "Contract Manufacturing Fee", nameAr: "أتعاب تشغيل وتصنيع خارجي" },
    { code: "EXP-UTIL", name: "Factory Utilities", nameAr: "كهرباء وطاقة إنتاجية" },
  ];

  for (const exp of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { code: exp.code },
      update: {},
      create: exp,
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
