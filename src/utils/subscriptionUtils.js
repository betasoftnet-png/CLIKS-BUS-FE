/**
 * Subscription Plans & Features Matrix
 * Defines the features unlocked by each subscription plan.
 */

export const PLAN_FEATURES = {
    // Business Category Tiers
    'Free Plan': [],
    'Starter Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support'
    ],
    'Growth Plan': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'multi-warehouse',
        'api-webhooks',
        'fin-pro-export',
        'priority-support'
    ],
    'Elite Suite': [
        'accounting',
        'gst-filings',
        'payroll-attendance',
        'email-support',
        'multi-warehouse',
        'api-webhooks',
        'fin-pro-export',
        'priority-support',
        'unlimited-staff',
        'white-label-invoice',
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
    'Starter Plan': {
        websiteUsers: 3,
        warehouses: 0,
        invoicesPerYear: 5000,
        billsExpensesPerYear: 5000,
        products: 5000,
        customers: 2000,
        vendors: 500,
        staff: 5,
        inventory: 'Basic',
        eInvoiceEWayBill: 'Limited',
        apiWebhooks: false,
        whiteLabelInvoices: false,
        dataExport: 'Basic',
        mobileApp: true,
        support: 'VIP 24/7 Email Chat'
    },
    'Growth Plan': {
        websiteUsers: 10,
        warehouses: 3,
        invoicesPerYear: 25000,
        billsExpensesPerYear: 25000,
        products: 25000,
        customers: 10000,
        vendors: 2500,
        staff: 25,
        inventory: 'Advanced',
        eInvoiceEWayBill: 'Full',
        apiWebhooks: true,
        whiteLabelInvoices: false,
        dataExport: 'Advanced',
        mobileApp: true,
        support: 'VIP 24/7 Email Chat'
    },
    'Elite Suite': {
        websiteUsers: 25,
        warehouses: 10,
        invoicesPerYear: 100000,
        billsExpensesPerYear: 100000,
        products: Infinity,
        customers: Infinity,
        vendors: Infinity,
        staff: Infinity,
        inventory: 'Advanced',
        eInvoiceEWayBill: 'Full',
        apiWebhooks: true,
        whiteLabelInvoices: true,
        dataExport: 'Advanced',
        mobileApp: true,
        support: 'VIP 24/7 Email Chat'
    }
};

export const PLAN_RANKS = {
    'Free Plan': 0,
    'Starter Plan': 1,
    'Starter': 1,
    'Growth Plan': 2,
    'Growth': 2,
    'Elite Suite': 3,
    'Elite Plan': 3,
    'Elite': 3,
    'Yearly Founder': 3,
    'Fin-Pro Solo': 1,
    'Fin-Pro Firm': 2,
    'Basic Investor': 1,
    'Pro Investor': 2,
    'Monthly Innovator': 1
};

export const FEATURE_REQUIRED_PLAN = {
    // Starter Plan Features (Rank 1)
    'accounting': 'Starter Plan',
    'gst-filings': 'Starter Plan',
    'payroll-attendance': 'Starter Plan',
    'email-support': 'Starter Plan',
    'inventory-basic': 'Starter Plan',
    'mobile-app': 'Starter Plan',

    // Growth Plan Features (Rank 2)
    'multi-warehouse': 'Growth Plan',
    'warehouses': 'Growth Plan',
    'api-webhooks': 'Growth Plan',
    'e-invoice': 'Growth Plan',
    'e-way-bill': 'Growth Plan',
    'advanced-inventory': 'Growth Plan',
    'fin-pro-export': 'Growth Plan',
    'advanced-export': 'Growth Plan',
    'priority-support': 'Growth Plan',

    // Elite Suite Features (Rank 3)
    'white-label-invoice': 'Elite Suite',
    'white-label': 'Elite Suite',
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
    if (norm.includes('starter') || norm.includes('solo') || norm.includes('basic investor') || norm.includes('monthly innovator')) return 1;
    return 0;
};

export const getRequiredPlanForFeature = (featureId) => {
    return FEATURE_REQUIRED_PLAN[featureId] || 'Starter Plan';
};

/**
 * Get specific numeric or feature limit for a given plan.
 */
export const getPlanLimit = (planName, limitKey) => {
    const activePlan = planName || 'Free Plan';
    const limits = PLAN_LIMITS[activePlan] || PLAN_LIMITS['Starter Plan'];
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
 * Get the total subscription duration (in days) based on the plan type.
 * Annual plans get 365 days, monthly plans get 30 days.
 * 
 * @param {string} planName 
 * @returns {number} duration in days
 */
export const getPlanDuration = (planName) => {
    const annualPlans = ['Starter Plan', 'Growth Plan', 'Elite Suite', 'Yearly Founder'];
    return annualPlans.includes(planName) ? 365 : 30;
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


