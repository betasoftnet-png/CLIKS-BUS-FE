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
        'basic-warehousing',
        'payroll-attendance',
        'email-support'
    ],
    'Growth Plan': [
        'accounting',
        'gst-filings',
        'basic-warehousing',
        'payroll-attendance',
        'email-support',
        'multi-warehouse',
        'bom',
        'api-webhooks',
        'fin-pro-export',
        'priority-support'
    ],
    'Elite Suite': [
        'accounting',
        'gst-filings',
        'basic-warehousing',
        'payroll-attendance',
        'email-support',
        'multi-warehouse',
        'bom',
        'api-webhooks',
        'fin-pro-export',
        'priority-support',
        'unlimited-staff',
        'white-label-invoice',
        'unlimited-batches',
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
