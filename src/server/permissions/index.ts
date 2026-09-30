export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Master Data & Catalog
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_UPDATE: "products.update", // compatibility alias

  // Inventory & Batches
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MOVEMENTS_VIEW: "inventory.movements.view",
  INVENTORY_BATCH_VIEW: "inventory.batch.view",
  INVENTORY_ADJUST: "inventory.adjust",

  // Suppliers & Raw Material Vendors
  SUPPLIERS_VIEW: "suppliers.view",
  SUPPLIERS_CREATE: "suppliers.create",
  SUPPLIERS_EDIT: "suppliers.edit",
  SUPPLIERS_PAYMENTS: "suppliers.payments",

  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_EDIT: "customers.edit",
  CUSTOMERS_RECEIPTS: "customers.receipts",

  // Partners aliases
  PARTNERS_VIEW: "partners.view",
  PARTNERS_MANAGE: "partners.manage",

  // Purchases
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_CREATE: "purchases.create",
  PURCHASES_EDIT: "purchases.edit",
  PURCHASES_POST: "purchases.post",
  PURCHASES_PRINT: "purchases.print",
  PURCHASES_CANCEL: "purchases.cancel",

  // Outsourced Manufacturing
  MANUFACTURING_VIEW: "manufacturing.view",
  MANUFACTURING_CREATE: "manufacturing.create",
  MANUFACTURING_EDIT: "manufacturing.edit",
  MANUFACTURING_UPDATE: "manufacturing.update",
  MANUFACTURING_CLOSE: "manufacturing.close",
  MANUFACTURING_PRINT: "manufacturing.print",
  MANUFACTURING_CANCEL: "manufacturing.cancel",

  // Sales & Loss Prevention
  SALES_VIEW: "sales.view",
  SALES_CREATE: "sales.create",
  SALES_EDIT: "sales.edit",
  SALES_UPDATE: "sales.update",
  SALES_POST: "sales.post",
  SALES_PRINT: "sales.print",
  SALES_CLOSE: "sales.close",
  SALES_CANCEL: "sales.cancel",
  SALES_SELL_AT_COST: "sales.sell_at_cost",
  SALES_SELL_BELOW_COST: "sales.sell_below_cost",
  SALES_OVERRIDE_CREDIT: "sales.override_credit",

  // Financials & Treasury
  TREASURY_VIEW: "treasury.view",
  TREASURY_RECEIPTS: "treasury.receipts",
  TREASURY_PAYMENTS: "treasury.payments",
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  RECEIPTS_VIEW: "receipts.view",
  RECEIPTS_CREATE: "receipts.create",

  // Expenses
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_CREATE: "expenses.create",
  EXPENSES_EDIT: "expenses.edit",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  REPORTS_PRINT: "reports.print",
  REPORTS_OPERATIONAL: "reports.operational",
  REPORTS_FINANCIAL: "reports.financial",

  // Users & Administration
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DEACTIVATE: "users.deactivate",
  USERS_MANAGE: "users.manage",

  // Company Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionCategory {
  id: string;
  nameAr: string;
  permissions: {
    code: PermissionCode;
    labelAr: string;
    descriptionAr: string;
  }[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "dashboard",
    nameAr: "لوحة التحكم",
    permissions: [
      {
        code: PERMISSIONS.DASHBOARD_VIEW,
        labelAr: "عرض لوحة التحكم",
        descriptionAr: "معاينة المؤشرات العامة والتقييمات السريعة",
      },
    ],
  },
  {
    id: "products",
    nameAr: "الأصناف والمنتجات",
    permissions: [
      {
        code: PERMISSIONS.PRODUCTS_VIEW,
        labelAr: "عرض كتالوج الأصناف",
        descriptionAr: "استعراض الأصناف وتفاصيلها وأسعارها",
      },
      {
        code: PERMISSIONS.PRODUCTS_CREATE,
        labelAr: "إضافة صنف جديد",
        descriptionAr: "تعريف خامات ومنتجات وتصنيفات جديدة",
      },
      {
        code: PERMISSIONS.PRODUCTS_EDIT,
        labelAr: "تعديل الصنف",
        descriptionAr: "تحديث أسعار البيع والتكلفة المرجعية والمواصفات",
      },
    ],
  },
  {
    id: "inventory",
    nameAr: "المخزون والباتشات",
    permissions: [
      {
        code: PERMISSIONS.INVENTORY_VIEW,
        labelAr: "عرض رصيد المخزون",
        descriptionAr: "استعراض الباتشات والكميات المتاحة والتكلفة",
      },
      {
        code: PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
        labelAr: "عرض حركات المخزون الرقابي",
        descriptionAr: "مراجعة سجل حركات التوريد والصرف والتسوية",
      },
      {
        code: PERMISSIONS.INVENTORY_BATCH_VIEW,
        labelAr: "تتبع شجرة الباتش",
        descriptionAr: "استعراض أصل ومصادقة الباتش وسلسلة الإمداد",
      },
      {
        code: PERMISSIONS.INVENTORY_ADJUST,
        labelAr: "تسوية المخزون",
        descriptionAr: "إجراء تسويات الجرد بالزيادة أو العجز",
      },
    ],
  },
  {
    id: "suppliers",
    nameAr: "الموردون والمشتريات",
    permissions: [
      {
        code: PERMISSIONS.SUPPLIERS_VIEW,
        labelAr: "عرض الموردين",
        descriptionAr: "استعراض الموردين وأرصدتهم الحالية",
      },
      {
        code: PERMISSIONS.SUPPLIERS_CREATE,
        labelAr: "إضافة مورد جديد",
        descriptionAr: "تسجيل بيانات مورد وشروط السداد",
      },
      {
        code: PERMISSIONS.SUPPLIERS_EDIT,
        labelAr: "تعديل بيانات مورد",
        descriptionAr: "تحديث بيانات الاتصال والحد الائتماني",
      },
      {
        code: PERMISSIONS.SUPPLIERS_PAYMENTS,
        labelAr: "سداد مستحقات الموردين",
        descriptionAr: "إصدار سندات صرف وتسوية فواتير الشراء",
      },
      {
        code: PERMISSIONS.PURCHASES_VIEW,
        labelAr: "عرض فواتير الشراء",
        descriptionAr: "معاينة فواتير توريد الخامات وموقف السداد",
      },
      {
        code: PERMISSIONS.PURCHASES_CREATE,
        labelAr: "إنشاء فاتورة شراء",
        descriptionAr: "تسجيل شحنة خامات وتوليد باتشات جديدة",
      },
      {
        code: PERMISSIONS.PURCHASES_PRINT,
        labelAr: "طباعة فاتورة الشراء",
        descriptionAr: "طباعة نموذج استلام الخامات A4",
      },
    ],
  },
  {
    id: "manufacturing",
    nameAr: "التصنيع لدى الغير",
    permissions: [
      {
        code: PERMISSIONS.MANUFACTURING_VIEW,
        labelAr: "عرض أوامر التشغيل",
        descriptionAr: "متابعة أوامر التشغيل لدى المصانع الخارجية",
      },
      {
        code: PERMISSIONS.MANUFACTURING_CREATE,
        labelAr: "إنشاء أمر تشغيل",
        descriptionAr: "فتح أمر تصنيع وصرف خامات لمصنع شريك",
      },
      {
        code: PERMISSIONS.MANUFACTURING_EDIT,
        labelAr: "إدارة مساحة عمل التصنيع",
        descriptionAr: "تسجيل أجور المصنع والمصاريف وتوزيع التكاليف",
      },
      {
        code: PERMISSIONS.MANUFACTURING_CLOSE,
        labelAr: "إغلاق أمر التصنيع",
        descriptionAr: "استلام المخرجات التامة وتوليد باتشاتها رسمياً",
      },
      {
        code: PERMISSIONS.MANUFACTURING_PRINT,
        labelAr: "طباعة أمر التصنيع",
        descriptionAr: "طباعة نموذج تسليم الخامات والمخرجات A4",
      },
    ],
  },
  {
    id: "sales",
    nameAr: "العملاء والمبيعات",
    permissions: [
      {
        code: PERMISSIONS.CUSTOMERS_VIEW,
        labelAr: "عرض العملاء",
        descriptionAr: "استعراض قائمة العملاء ومديونياتهم",
      },
      {
        code: PERMISSIONS.CUSTOMERS_CREATE,
        labelAr: "إضافة عميل جديد",
        descriptionAr: "تسجيل بيانات عميل وحدوده الائتمانية",
      },
      {
        code: PERMISSIONS.CUSTOMERS_RECEIPTS,
        labelAr: "تحصيل مستحقات العملاء",
        descriptionAr: "تسجيل سندات قبض نقدية وبنكية من العملاء",
      },
      {
        code: PERMISSIONS.SALES_VIEW,
        labelAr: "عرض فواتير المبيعات",
        descriptionAr: "استعراض فواتير البيع وأرباحها المحققة",
      },
      {
        code: PERMISSIONS.SALES_CREATE,
        labelAr: "إنشاء فاتورة بيع",
        descriptionAr: "تخصيص الباتشات وصرف البضاعة للعميل",
      },
      {
        code: PERMISSIONS.SALES_PRINT,
        labelAr: "طباعة فاتورة البيع",
        descriptionAr: "طباعة الفاتورة الضريبية للعميل A4",
      },
      {
        code: PERMISSIONS.SALES_SELL_BELOW_COST,
        labelAr: "الموافقة على البيع بأقل من التكلفة",
        descriptionAr: "إمكانية تجاوز تحذير الخسارة واعتماد البيع",
      },
    ],
  },
  {
    id: "treasury",
    nameAr: "الخزينة والمصروفات",
    permissions: [
      {
        code: PERMISSIONS.TREASURY_VIEW,
        labelAr: "عرض الخزائن والأرصدة",
        descriptionAr: "متابعة النقدية بالخزائن والحسابات البنكية",
      },
      {
        code: PERMISSIONS.TREASURY_RECEIPTS,
        labelAr: "تسجيل مقبوضات",
        descriptionAr: "إيداع مبالغ نقدية بالخزينة",
      },
      {
        code: PERMISSIONS.TREASURY_PAYMENTS,
        labelAr: "تسجيل مدفوعات",
        descriptionAr: "صرف مبالغ من الخزائن والعهد",
      },
      {
        code: PERMISSIONS.EXPENSES_VIEW,
        labelAr: "عرض المصروفات",
        descriptionAr: "استعراض بنود وسندات الصرف الإداري والعمومي",
      },
      {
        code: PERMISSIONS.EXPENSES_CREATE,
        labelAr: "تسجيل مصروف جديد",
        descriptionAr: "قيد سند مصروف تشغيلي أو عمومي",
      },
    ],
  },
  {
    id: "reports",
    nameAr: "التقارير الرقابية والمالية",
    permissions: [
      {
        code: PERMISSIONS.REPORTS_VIEW,
        labelAr: "عرض بوابة التقارير",
        descriptionAr: "الاطلاع على التقارير المالية والتحليلية الـ 11",
      },
      {
        code: PERMISSIONS.REPORTS_EXPORT,
        labelAr: "تصدير التقارير (Excel/CSV)",
        descriptionAr: "تحميل بيانات التقارير بترميز UTF-8",
      },
      {
        code: PERMISSIONS.REPORTS_PRINT,
        labelAr: "طباعة التقارير",
        descriptionAr: "توليد نسخ ورقية منسقة A4 للتقارير",
      },
    ],
  },
  {
    id: "users",
    nameAr: "المستخدمون والصلاحيات",
    permissions: [
      {
        code: PERMISSIONS.USERS_VIEW,
        labelAr: "عرض المستخدمين",
        descriptionAr: "معاينة قائمة حسابات الموظفين وحالاتهم",
      },
      {
        code: PERMISSIONS.USERS_CREATE,
        labelAr: "إضافة مستخدم جديد",
        descriptionAr: "إنشاء حساب موظف وتعيين دوره وكلمة مروره",
      },
      {
        code: PERMISSIONS.USERS_EDIT,
        labelAr: "تعديل المستخدمين",
        descriptionAr: "تعديل البيانات وإعادة تعيين كلمات المرور وتعديل الصلاحيات",
      },
      {
        code: PERMISSIONS.USERS_DEACTIVATE,
        labelAr: "تعطيل/تفعيل الحسابات",
        descriptionAr: "إيقاف حساب موظف دون حذف سجلاته الرقابية",
      },
    ],
  },
  {
    id: "settings",
    nameAr: "إعدادات الشركة والهوية",
    permissions: [
      {
        code: PERMISSIONS.SETTINGS_VIEW,
        labelAr: "عرض إعدادات الشركة",
        descriptionAr: "معاينة بيانات المنشأة والشعار وإعدادات الطباعة",
      },
      {
        code: PERMISSIONS.SETTINGS_EDIT,
        labelAr: "تعديل إعدادات الشركة",
        descriptionAr: "تحديث الشعار، الاسم، السجل التجاري، والأرقام الضريبية",
      },
    ],
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  ADMIN: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
    PERMISSIONS.INVENTORY_BATCH_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_CREATE,
    PERMISSIONS.SUPPLIERS_EDIT,
    PERMISSIONS.SUPPLIERS_PAYMENTS,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_RECEIPTS,
    PERMISSIONS.PARTNERS_VIEW,
    PERMISSIONS.PARTNERS_MANAGE,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_EDIT,
    PERMISSIONS.PURCHASES_POST,
    PERMISSIONS.PURCHASES_PRINT,
    PERMISSIONS.MANUFACTURING_VIEW,
    PERMISSIONS.MANUFACTURING_CREATE,
    PERMISSIONS.MANUFACTURING_EDIT,
    PERMISSIONS.MANUFACTURING_UPDATE,
    PERMISSIONS.MANUFACTURING_CLOSE,
    PERMISSIONS.MANUFACTURING_PRINT,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.SALES_POST,
    PERMISSIONS.SALES_PRINT,
    PERMISSIONS.SALES_CLOSE,
    PERMISSIONS.SALES_SELL_AT_COST,
    PERMISSIONS.SALES_SELL_BELOW_COST,
    PERMISSIONS.SALES_OVERRIDE_CREDIT,
    PERMISSIONS.TREASURY_VIEW,
    PERMISSIONS.TREASURY_RECEIPTS,
    PERMISSIONS.TREASURY_PAYMENTS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_CREATE,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_PRINT,
    PERMISSIONS.REPORTS_OPERATIONAL,
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.USERS_VIEW,
  ],
  ACCOUNTANT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.SUPPLIERS_PAYMENTS,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_RECEIPTS,
    PERMISSIONS.PARTNERS_VIEW,
    PERMISSIONS.PARTNERS_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_POST,
    PERMISSIONS.PURCHASES_PRINT,
    PERMISSIONS.MANUFACTURING_VIEW,
    PERMISSIONS.MANUFACTURING_CLOSE,
    PERMISSIONS.MANUFACTURING_PRINT,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_POST,
    PERMISSIONS.SALES_PRINT,
    PERMISSIONS.TREASURY_VIEW,
    PERMISSIONS.TREASURY_RECEIPTS,
    PERMISSIONS.TREASURY_PAYMENTS,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_CREATE,
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_PRINT,
    PERMISSIONS.REPORTS_OPERATIONAL,
    PERMISSIONS.REPORTS_FINANCIAL,
  ],
  SALES: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_RECEIPTS,
    PERMISSIONS.PARTNERS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_PRINT,
    PERMISSIONS.SALES_SELL_AT_COST,
    PERMISSIONS.TREASURY_RECEIPTS,
    PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_CREATE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_OPERATIONAL,
  ],
  WAREHOUSE: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MOVEMENTS_VIEW,
    PERMISSIONS.INVENTORY_BATCH_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.PURCHASES_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_PRINT,
    PERMISSIONS.MANUFACTURING_VIEW,
    PERMISSIONS.MANUFACTURING_PRINT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_OPERATIONAL,
  ],
  USER: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
  ],
};

export function hasPermission(
  roleOrPermissions: string | string[],
  userPermissionsOrRequired: string[] | PermissionCode,
  requiredPermission?: PermissionCode
): boolean {
  if (typeof roleOrPermissions === "string") {
    if (roleOrPermissions === "ADMIN") return true;
    const permissions = (userPermissionsOrRequired as string[]) || [];
    return permissions.includes(requiredPermission as PermissionCode);
  } else {
    const permissions = roleOrPermissions || [];
    return permissions.includes(userPermissionsOrRequired as PermissionCode);
  }
}

