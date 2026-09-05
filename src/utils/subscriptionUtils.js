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
    const activePlan = planName || 'Free Plan';
    const features = PLAN_FEATURES[activePlan];
    if (!features) return false;
    return features.includes(featureId);
};

