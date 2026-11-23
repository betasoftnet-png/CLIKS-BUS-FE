/**
 * Subscription Plans & Features Matrix
 * Defines the features unlocked by each subscription plan.
 */

export const PLAN_FEATURES = {
    // Business Category Tiers
    'Free Plan': [],
    'Micro Plan': [
        'accounting-basic',
        'billing',
        'pos-basic',
        'escrow-basic',
        'cloud-storage-1gb',
        'custom-chart-of-accounts'
    ],
    'Trial Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'multi-warehouse',
        'api-webhooks',
        'fin-pro-export',
        'priority-support'
    ],
    'Starter Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support'
    ],
    'Standard Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'delivery-challan',
        'loyalty-points',
        'audit-center',
        'multi-branch',
        'automated-payroll',
        'automated-reminders',
        'bank-reconciliation',
        'balance-sheet',
        'request-stock',
        'price-lists'
    ],
    'Growth Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'delivery-challan',
        'loyalty-points',
        'audit-center',
        'multi-branch',
        'automated-payroll',
        'automated-reminders',
        'bank-reconciliation',
        'balance-sheet',
        'request-stock',
        'price-lists',
        'multi-warehouse',
        'api-webhooks',
        'fin-pro-export',
        'priority-support',
        'dashboard-customization',
        'voucher-audit-history',
        'late-fees',
        'external-franchise',
        'white-label-invoice'
    ],
    'Elite Suite': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'delivery-challan',
        'loyalty-points',
        'audit-center',
        'multi-branch',
        'automated-payroll',
        'automated-reminders',
        'bank-reconciliation',
        'balance-sheet',
        'request-stock',
        'price-lists',
        'multi-warehouse',
        'api-webhooks',
        'fin-pro-export',
        'priority-support',
        'dashboard-customization',
        'voucher-audit-history',
        'late-fees',
        'external-franchise',
        'white-label-invoice',
        'full-white-label',
        'unlimited-white-label',
        'vendor-portal',
        'multi-currency-landed-cost',
        'custom-kiosk-mode',
        'weigh-scale-sync',
        'mobile-barcode-scan',
        'dedicated-manager',
        'vip-phone-support'
    ],

    // FIN-PRO (CA) Category Tiers
    'Fin-Pro Solo': [
        'ledgers-25',
        'gst-reporting',
        'verification-logs',
        'export-csv',
        'email-support'
    ],
    'Fin-Pro Firm': [
        'ledgers-25',
        'gst-reporting',
        'verification-logs',
        'export-csv',
        'email-support',
        'unlimited-ledgers',
        'white-label-reports',
        'team-collaboration',
        'api-sandbox',
        'live-chat-support'
    ],

    // Beta Club (Investor) Tiers
    'Basic Investor': [
        'pitches-20',
        'filter-pitches',
        'founder-contact',
        'realtime-notifications'
    ],
    'Pro Investor': [
        'pitches-20',
        'filter-pitches',
        'founder-contact',
        'realtime-notifications',
        'pitches-50',
        'deal-rooms',
        'consultations'
    ],

    // Beta Club (Product & Ideas) Tiers
    'Monthly Innovator': [
        'early-access',
        'community-mastermind',
        'deal-marketplace-list',
        'pitch-templates'
    ],
    'Yearly Founder': [
        'early-access',
        'community-mastermind',
        'deal-marketplace-list',
        'pitch-templates',
        'unlimited-market-list',
        'homepage-spotlight',
        'vip-gala-ticket',
        'price-freeze'
    ]
};

/**
 * Plan numeric limits & feature flags mapping
 */
export const PLAN_LIMITS = {
    'Free Plan': {
        websiteUsers: 1,
        warehouses: 0,
        invoicesPerYear: 500,
        billsExpensesPerYear: 500,
        products: 500,
        customers: 200,
        vendors: 50,
        staff: 1,
        inventory: 'Basic',
        eInvoiceEWayBill: 'None',
        apiWebhooks: false,
        whiteLabelInvoices: false,
        dataExport: 'Basic',
        mobileApp: true,
        support: 'VIP 24/7 Email Chat'
    },
    'Micro Plan': {
        websiteUsers: 1,
        branches: 1,
        warehouses: 0,
        invoicesPerYear: 1000,
        billsExpensesPerYear: 1000,
        products: 1000,
        customers: 100,
        vendors: 50,
        staff: 0,
        inventory: 'Basic',
        eInvoiceEWayBill: 'None',
        cloudStorageGB: 1,
        marketingPerDay: 5,
        reportsSales: 3,
        reportsPurchase: 2,
        reportsStock: 2,
        reportsCRM: 2,
        reportsFinance: 3,
        autoBackup: false,
        apiWebhooks: false,
        whiteLabelInvoices: false,
        dataExport: 'Limited',
        mobileApp: true,
        support: 'Standard Email Support'
    },
    'Trial Plan': {
        websiteUsers: 10,
        warehouses: 5,
        invoicesPerYear: 10000,
        billsExpensesPerYear: 10000,
        products: 10000,
        customers: 5000,
        vendors: 2000,
        staff: 50,
        inventory: 'Advanced',
        eInvoiceEWayBill: 'Full',
        apiWebhooks: true,
        whiteLabelInvoices: true,
        dataExport: 'Advanced',
        mobileApp: true,
        support: 'VIP 24/7 Email Chat'
    },
    'Starter Plan': {
        websiteUsers: 2, // Sub ID's Roles: 2 ID's
        branches: 1,
        warehouses: 0,
        invoicesPerYear: 5000,
        billsExpensesPerYear: 5000,
        products: 5000, // Active Stock SKUs
        customers: 1000, // Customer CRM Directory
        vendors: 100,
        staff: 2, // HR & Employees Database: Basic (2 Staff)
        cloudStorageGB: 5,
        autoBackup: 'Monthly',
        eInvoicingDaily: 5, // 150/month
        eWayBillsDaily: 2, // 60/month
        gstinValidationDaily: 1,
        marketingPerDay: 10,
        reportsSales: 5,
        reportsPurchase: 3,
        reportsStock: 3,
        reportsCRM: 3,
        reportsFinance: 5,
        posCounters: 1,
        thermalFormats: 1,
        segregationGoals: 10,
        splitwiseSplits: 10,
        inventory: 'Available',
        eInvoiceEWayBill: 'Up to 5 e-Inv / 2 E-Way per day',
        apiWebhooks: false,
        whiteLabelInvoices: false,
        dataExport: 'Offline CSV/PDF',
        mobileApp: true,
        support: 'Standard Email & Chat Support'
    },
    'Standard Plan': {
        websiteUsers: 5, // Sub ID's Roles: 5 ID's
        branches: 2, // Internal Showrooms / Godowns: 2 Branches
        warehouses: 1, // Godown / Warehouse Mapping: 1 Godown
        invoicesPerYear: 10000,
        billsExpensesPerYear: 10000,
        products: 10000, // Active Stock SKUs
        customers: 5000, // Customer CRM Directory
        vendors: 500,
        staff: 5, // HR & Employees Database: Basic (5 Staff)
        cloudStorageGB: 10,
        autoBackup: 'Weekly',
        eInvoicingDaily: 10, // 300/month
        eWayBillsDaily: 3, // 90/month
        gstinValidationDaily: 2,
        marketingPerDay: 15,
        reportsSales: 6,
        reportsPurchase: 4,
        reportsStock: 4,
        reportsCRM: 4,
        reportsFinance: 8,
        voucherScans: 10,
        posCounters: 2,
        thermalFormats: 2,
        segregationGoals: 20,
        splitwiseSplits: 20,
        automatedReminders: 10,
        multiSeriesPrefixes: 2,
        inventory: 'Available',
        eInvoiceEWayBill: 'Up to 10 e-Inv / 3 E-Way per day',
        apiWebhooks: false,
        whiteLabelInvoices: false,
        dataExport: 'GSTR-1 & 3B Reports',
        mobileApp: true,
        support: 'Priority Email & Chat Support'
    },
    'Growth Plan': {
        websiteUsers: 10, // Sub ID's Roles: 10 ID's
        branches: 5, // Internal Showrooms / Godowns: 5 Branches
        externalBranches: 2, // External Franchise / Partner Branches: Up to 2 External
        warehouses: 5, // Godown / Warehouse Mapping: 5 Godowns
        invoicesPerYear: 25000,
        billsExpensesPerYear: 25000,
        products: 50000, // Active Stock SKUs: 50,000
        customers: 15000, // Customer CRM Directory: 15,000 Customers
        vendors: 2500,
        staff: 25, // HR & Employees Database: Advanced (25 Staff)
        cloudStorageGB: 20,
        autoBackup: 'Daily',
        eInvoicingDaily: 20, // 600/month
        eWayBillsDaily: 5, // 150/month
        gstinValidationDaily: 3,
        marketingPerDay: 20,
        reportsSales: 8,
        reportsPurchase: 6,
        reportsStock: 5,
        reportsCRM: 5,
        reportsFinance: 13,
        voucherScans: 50,
        multiSeriesPrefixes: 5,
        voucherAuditDaily: 5,
        posCounters: 5,
        kioskMode: 'Basic Kiosk Mode',
        thermalLayouts: 'Custom Layouts',
        segregationGoals: 30,
        splitwiseSplits: 30,
        automatedRemindersDaily: 20,
        inventory: 'Basic Batching',
        eInvoiceEWayBill: 'Up to 20 e-Inv / 5 E-Way per day',
        apiWebhooks: true,
        whiteLabelInvoices: true,
        lateFees: true,
        dataExport: 'GSTR-1, 2B, 3B + IMS',
        mobileApp: true,
        support: 'Priority Email & 24/7 Chat Support'
    },
    'Elite Suite': {
        websiteUsers: 20, // Sub ID's Roles: 20 ID's
        branches: 15, // Internal Showrooms / Godowns: 15 Branches
        externalBranches: 10, // External Franchise / Partner Branches: Up to 10 External
        warehouses: 10, // Godown / Warehouse Mapping: 10 Godowns
        invoicesPerYear: 100000,
        billsExpensesPerYear: 100000,
        products: Infinity, // Active Stock SKUs: Unlimited
        customers: 25000, // Customer CRM Directory: 25,000 Customers
        vendors: Infinity,
        staff: 100, // HR & Employees Database: Elite (100 Staff)
        cloudStorageGB: 50,
        autoBackup: 'Daily',
        eInvoicingDaily: 30, // 900/month
        eWayBillsDaily: 10, // 300/month
        gstinValidationDaily: 5,
        marketingPerDay: 40,
        reportsSales: 8,
        reportsPurchase: 6,
        reportsStock: 6,
        reportsCRM: 5,
        reportsFinance: 17,
        voucherScans: 200,
        multiSeriesPrefixes: Infinity, // Unlimited Custom Series
        voucherAuditDaily: 15, // 15 limit/day
        posCounters: 15,
        kioskMode: 'Customizable Kiosk Mode',
        thermalLayouts: 'Custom Layouts + Logo',
        segregationGoals: Infinity, // Unlimited
        splitwiseSplits: Infinity, // Unlimited
        automatedRemindersDaily: 40,
        inventory: 'Full Batch/Expiry/Serial',
        eInvoiceEWayBill: 'Up to 30 e-Inv / 10 E-Way per day',
        apiWebhooks: true,
        whiteLabelInvoices: true,
        fullWhiteLabel: true,
        lateFees: true,
        vendorPortal: true,
        multiCurrencyLandedCost: true,
        dataExport: 'Full GSTR + JSON Export',
        mobileApp: true,
        support: 'Dedicated Manager & VIP 24/7 Phone Support'
    }
};

export const PLAN_RANKS = {
    'Free Plan': 0,
    'Micro Plan': 0.5,
    'Micro': 0.5,
    'Tier 1: Micro': 0.5,
    'Starter Plan': 1,
    'Starter': 1,
    'Tier 2: Starter': 1,
    'Standard Plan': 1.5,
    'Standard': 1.5,
    'Tier 3: Standard': 1.5,
    'Trial Plan': 2,
    'Trial': 2,
    'Growth Plan': 2,
    'Growth': 2,
    'Tier 4: Growth': 2,
    'Elite Suite': 3,
    'Elite Plan': 3,
    'Elite': 3,
    'Tier 5: Elite': 3,
    'Yearly Founder': 3,
    'Fin-Pro Solo': 1,
    'Fin-Pro Firm': 2,
    'Basic Investor': 1,
    'Pro Investor': 2,
    'Monthly Innovator': 1
};

export const FEATURE_REQUIRED_PLAN = {
    // Micro Plan (Rank 0.5)
    'pos-simple-billing': 'Micro Plan',
    'basic-invoicing': 'Micro Plan',
    'chart-of-accounts': 'Micro Plan',

    // Starter Plan Features (Rank 1 - Unlocked in Starter Tier 2)
    'accounting': 'Starter Plan',
    'gst-filings': 'Starter Plan',
    'payroll-attendance': 'Starter Plan',
    'hr-staff': 'Starter Plan',
    'sales-orders': 'Starter Plan',
    'sales-returns': 'Starter Plan',
    'sub-ids-roles': 'Starter Plan',
    'auto-backup': 'Starter Plan',
    'email-support': 'Starter Plan',
    'inventory-basic': 'Starter Plan',
    'mobile-app': 'Starter Plan',
    'low-stock-alerts': 'Starter Plan',
    'advance-payments': 'Starter Plan',

    // Standard Plan Features (Rank 1.5 - Locked in Tier 2 Starter)
    'delivery-challan': 'Standard Plan',
    'loyalty-points': 'Standard Plan',
    'audit-center': 'Standard Plan',
    'multi-branch': 'Standard Plan',
    'request-stock': 'Standard Plan',
    'price-lists': 'Standard Plan',
    'automated-payroll': 'Standard Plan',
    'automated-reminders': 'Standard Plan',

    // Growth Plan Features (Rank 2)
    'multi-warehouse': 'Growth Plan',
    'warehouses': 'Growth Plan',
    'api-webhooks': 'Growth Plan',
    'e-invoice-unlimited': 'Growth Plan',
    'advanced-inventory': 'Growth Plan',
    'batch-expiry-tracking': 'Growth Plan',
    'fin-pro-export': 'Growth Plan',
    'advanced-export': 'Growth Plan',
    'priority-support': 'Growth Plan',
    'late-fees': 'Growth Plan',
    'dashboard-customization': 'Growth Plan',
    'voucher-audit-history': 'Growth Plan',
    'external-franchise': 'Growth Plan',
    'white-label-invoice': 'Growth Plan',
    'white-label': 'Growth Plan',

    // Elite Suite Features (Rank 3)
    'unlimited-white-label': 'Elite Suite',
    'unlimited-staff': 'Elite Suite',
    'unlimited-products': 'Elite Suite',
    'unlimited-customers': 'Elite Suite',
    'unlimited-vendors': 'Elite Suite',
    'dedicated-manager': 'Elite Suite',
    'vip-phone-support': 'Elite Suite'
};

export const getPlanRank = (planName) => {
    if (!planName) return 0;
    if (PLAN_RANKS[planName] !== undefined) return PLAN_RANKS[planName];
    const norm = String(planName).trim().toLowerCase();
    if (norm.includes('elite') || norm.includes('founder')) return 3;
    if (norm.includes('growth') || norm.includes('firm') || norm.includes('pro investor')) return 2;
    if (norm.includes('standard')) return 1.5;
    if (norm.includes('starter') || norm.includes('solo') || norm.includes('basic investor') || norm.includes('monthly innovator')) return 1;
    if (norm.includes('micro') || norm.includes('tier 1')) return 0.5;
    return 0;
};

export const getRequiredPlanForFeature = (featureId) => {
    return FEATURE_REQUIRED_PLAN[featureId] || 'Starter Plan';
};

export const normalizePlanKey = (planName) => {
    if (!planName) return 'Free Plan';
    if (PLAN_LIMITS[planName]) return planName;
    const norm = String(planName).trim().toLowerCase();
    if (norm.includes('elite')) return 'Elite Suite';
    if (norm.includes('growth')) return 'Growth Plan';
    if (norm.includes('standard') || norm.includes('tier 3')) return 'Standard Plan';
    if (norm.includes('starter') || norm.includes('tier 2')) return 'Starter Plan';
    if (norm.includes('micro') || norm.includes('tier 1')) return 'Micro Plan';
    if (norm.includes('trial')) return 'Trial Plan';
    return planName;
};

/**
 * Get specific numeric or feature limit for a given plan.
 */
export const getPlanLimit = (planName, limitKey) => {
    const key = normalizePlanKey(planName);
    const limits = PLAN_LIMITS[key] || PLAN_LIMITS['Starter Plan'];
    return limits[limitKey] !== undefined ? limits[limitKey] : Infinity;
};

/**
 * Check if a plan limit has been reached or exceeded.
 */
export const isPlanLimitExceeded = (planName, limitKey, currentCount) => {
    const limit = getPlanLimit(planName, limitKey);
    return currentCount >= limit;
};

/**
 * Calculates remaining days between an expiry timestamp and now.
 * 
 * @param {string|Date} expiryDate - Expiry ISO timestamp or Date object
 * @returns {number} Days remaining (0 if expired)
 */
export const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const target = new Date(expiryDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

/**
 * Get the total subscription duration (in days) based on the plan type.
 * Annual plans get 365 days, monthly plans get 30 days.
 * 
 * @param {string} planName 
 * @returns {number} duration in days
 */
export const getPlanDuration = (planName) => {
    if (!planName) return 15;
    if (String(planName).toLowerCase().includes('trial')) return 15;
    const annualPlans = ['Micro Plan', 'Starter Plan', 'Standard Plan', 'Growth Plan', 'Elite Suite', 'Yearly Founder'];
    const key = normalizePlanKey(planName);
    return annualPlans.includes(key) ? 365 : 30;
};

/**
 * Checks if a specific feature is enabled/allowed on a given plan.
 * 
 * @param {string} planName - Active subscription plan name
 * @param {string} featureId - Feature code to verify
 * @returns {boolean} True if the feature is unlocked, false otherwise
 */
export const isFeatureAllowed = (planName, featureId) => {
    const userRank = getPlanRank(planName);
    const requiredPlan = getRequiredPlanForFeature(featureId);
    const requiredRank = getPlanRank(requiredPlan);
    return userRank >= requiredRank;
};

/**
 * Helper to check whether user's plan meets or exceeds a required plan or feature.
 * 
 * @param {string} userPlan - Logged-in user's subscription plan/tier
 * @param {string} requiredPlanOrFeature - Plan name (e.g. 'Growth Plan') or feature ID (e.g. 'multi-warehouse')
 * @returns {boolean} True if user has access, false otherwise
 */
export const hasPlanAccess = (userPlan, requiredPlanOrFeature) => {
    const userRank = getPlanRank(userPlan);
    const targetRank = PLAN_RANKS[requiredPlanOrFeature] !== undefined 
        ? PLAN_RANKS[requiredPlanOrFeature] 
        : getPlanRank(getRequiredPlanForFeature(requiredPlanOrFeature));
    return userRank >= targetRank;
};


