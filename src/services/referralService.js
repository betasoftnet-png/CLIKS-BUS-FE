/**
 * Refer & Earn Premium System Service
 * Manages unique referral links, wallet point balances, stage-gated rewards,
 * anti-fraud validation, and point redemption options.
 */

const STORAGE_KEYS = {
    REFERRAL_CODE: 'cliks_user_referral_code',
    WALLET: 'cliks_referral_wallet',
    REFERRALS_LIST: 'cliks_referrals_list',
    REDEMPTIONS: 'cliks_referral_redemptions'
};

// Stage Points Map
export const STAGE_REWARDS = {
    REGISTERED: { name: 'Registered', points: 0, label: 'Pending', statusKey: 'pending' },
    SETUP_COMPLETE: { name: 'Setup Complete', points: 100, label: '100 Points', statusKey: 'completed' },
    ACTIVE: { name: 'Active', points: 500, label: '500 Points', statusKey: 'completed' },
    PREMIUM: { name: 'Premium', points: 1000, label: '1,000 Bonus Points', statusKey: 'completed' }
};

// Initial Seed Data (if empty)
const DEFAULT_REFERRALS = [
    {
        id: 'ref-101',
        name: 'Apex Retailers (Sanjay Kumar)',
        email: 'sanjay@apexretail.in',
        stage: 'PREMIUM', // Registered -> Setup -> Active -> Premium
        registered_at: '2026-08-20',
        points_earned: 1600, // 100 + 500 + 1000
        claimed_stages: ['SETUP_COMPLETE', 'ACTIVE', 'PREMIUM']
    },
    {
        id: 'ref-102',
        name: 'Siddharth Electronics',
        email: 'info@siddharthelec.com',
        stage: 'ACTIVE',
        registered_at: '2026-08-24',
        points_earned: 600, // 100 + 500
        claimed_stages: ['SETUP_COMPLETE', 'ACTIVE']
    },
    {
        id: 'ref-103',
        name: 'Modern Bakeries & Sweets',
        email: 'contact@modernbakeries.in',
        stage: 'SETUP_COMPLETE',
        registered_at: '2026-08-28',
        points_earned: 100, // 100
        claimed_stages: ['SETUP_COMPLETE']
    },
    {
        id: 'ref-104',
        name: 'Praveen Logistics Ltd',
        email: 'operations@praveenlogistics.com',
        stage: 'REGISTERED',
        registered_at: '2026-08-30',
        points_earned: 0,
        claimed_stages: []
    }
];

export const REDEMPTION_CATALOG = [
    {
        id: 'rdm-discount-50',
        title: '₹50 Subscription Discount',
        category: 'Subscription',
        cost: 500,
        desc: 'Instant ₹50 discount applied to your next billing cycle.',
        badge: 'Recommended'
    },
    {
        id: 'rdm-ext-7d',
        title: '7 Days Premium Extension',
        category: 'Extension',
        cost: 1000,
        desc: 'Add 7 full days of uninterrupted Premium Pro license.',
        badge: 'Popular'
    },
    {
        id: 'rdm-analytics',
        title: 'Business Analytics Suite',
        category: 'Feature',
        cost: 500,
        desc: 'Unlock 30 days of AI-powered sales & inventory analytics.',
        badge: 'Feature'
    },
    {
        id: 'rdm-gst-reports',
        title: 'Advanced GST Reports',
        category: 'Feature',
        cost: 400,
        desc: 'Export GSTR-1, GSTR-3B & Audit logs with 1-click.',
        badge: 'Compliance'
    },
    {
        id: 'rdm-reports-pro',
        title: 'Advanced Profit & Loss Reports',
        category: 'Feature',
        cost: 300,
        desc: 'Deep multi-branch financial reports & projections.',
        badge: 'Reports'
    },
    {
        id: 'rdm-storage-50gb',
        title: 'Additional 50GB Storage',
        category: 'Storage',
        cost: 800,
        desc: 'Expand document & invoice vault storage capacity.',
        badge: 'Storage'
    }
];

export const referralService = {
    // Generate or fetch user's unique referral code
    getUserReferralCode: () => {
        let code = localStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
        if (!code) {
            code = `CLIKS-BIZ-${Math.floor(10000 + Math.random() * 90000)}X`;
            localStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, code);
        }
        return code;
    },

    getReferralLink: () => {
        const code = referralService.getUserReferralCode();
        return `https://cliksbusiness.com/join?ref=${code}`;
    },

    // Get referral list
    getReferralsList: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.REFERRALS_LIST);
            return raw ? JSON.parse(raw) : DEFAULT_REFERRALS;
        } catch {
            return DEFAULT_REFERRALS;
        }
    },

    // Get Wallet Metrics (Available, Pending, Total Earned)
    getWallet: () => {
        const referrals = referralService.getReferralsList();
        
        // Calculate points dynamically from referral list
        let totalEarned = 0;
        let pendingPoints = 0;

        referrals.forEach(ref => {
            if (ref.stage === 'REGISTERED') {
                pendingPoints += 500; // Expected potential active reward
            }
            totalEarned += (ref.points_earned || 0);
        });

        // Fetch spent/redeemed points
        const redemptions = referralService.getRedemptions();
        const totalRedeemed = redemptions.reduce((sum, r) => sum + r.cost, 0);

        const availablePoints = Math.max(0, totalEarned - totalRedeemed);

        return {
            available_points: availablePoints,
            pending_points: pendingPoints,
            total_earned_points: totalEarned,
            total_redeemed_points: totalRedeemed,
            total_referrals_count: referrals.length,
            active_users_count: referrals.filter(r => r.stage === 'ACTIVE' || r.stage === 'PREMIUM').length
        };
    },

    // Get Redemptions Log
    getRedemptions: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    // Redeem Points for rewards
    redeemPoints: (rewardId) => {
        const item = REDEMPTION_CATALOG.find(r => r.id === rewardId);
        if (!item) throw new Error('Invalid reward item selected.');

        const wallet = referralService.getWallet();
        if (wallet.available_points < item.cost) {
            throw new Error(`Insufficient Available Points. You need ${item.cost} points, but only have ${wallet.available_points} available.`);
        }

        const redemptions = referralService.getRedemptions();
        const newRecord = {
            id: `RDM-${Date.now()}`,
            reward_id: item.id,
            title: item.title,
            cost: item.cost,
            category: item.category,
            redeemed_at: new Date().toISOString()
        };

        const updated = [newRecord, ...redemptions];
        localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(updated));

        return newRecord;
    },

    // Anti-fraud check for applying a referral code during signup
    validateAndApplyReferralCode: (code, userEmail) => {
        const ownCode = referralService.getUserReferralCode();
        const cleanCode = (code || '').trim().toUpperCase();

        // Anti-Fraud Rule 1: Cannot refer self
        if (cleanCode === ownCode.toUpperCase()) {
            return { success: false, message: 'Anti-Fraud Alert: You cannot use your own referral code.' };
        }

        // Anti-Fraud Rule 2: Code format check
        if (!cleanCode.startsWith('CLIKS-') && !cleanCode.startsWith('REF-')) {
            return { success: false, message: 'Invalid referral code format. Please verify the code.' };
        }

        // Add referred user (welcome reward = 200 pts)
        const referrals = referralService.getReferralsList();
        const exists = referrals.some(r => r.email.toLowerCase() === (userEmail || '').toLowerCase());
        
        if (exists) {
            return { success: false, message: 'Anti-Fraud Alert: This email has already redeemed a referral code.' };
        }

        const newReferral = {
            id: `ref-${Date.now()}`,
            name: userEmail.split('@')[0] || 'New Business User',
            email: userEmail,
            stage: 'REGISTERED',
            registered_at: new Date().toISOString().split('T')[0],
            points_earned: 0,
            claimed_stages: []
        };

        const updated = [newReferral, ...referrals];
        localStorage.setItem(STORAGE_KEYS.REFERRALS_LIST, JSON.stringify(updated));

        return {
            success: true,
            welcome_points: 200,
            message: 'Referral code accepted! 200 Welcome Points credited to your new account.'
        };
    },

    // Advance referral stage (Anti-Fraud: single credit per stage)
    advanceReferralStage: (referralId, targetStage) => {
        const referrals = referralService.getReferralsList();
        const refIndex = referrals.findIndex(r => r.id === referralId);

        if (refIndex === -1) return { success: false, message: 'Referral record not found.' };

        const ref = referrals[refIndex];
        const claimed = new Set(ref.claimed_stages || []);

        let addedPoints = 0;

        // Stage progression logic
        if (targetStage === 'SETUP_COMPLETE' && !claimed.has('SETUP_COMPLETE')) {
            addedPoints += 100;
            claimed.add('SETUP_COMPLETE');
        } else if (targetStage === 'ACTIVE') {
            if (!claimed.has('SETUP_COMPLETE')) {
                addedPoints += 100;
                claimed.add('SETUP_COMPLETE');
            }
            if (!claimed.has('ACTIVE')) {
                addedPoints += 500;
                claimed.add('ACTIVE');
            }
        } else if (targetStage === 'PREMIUM') {
            if (!claimed.has('SETUP_COMPLETE')) {
                addedPoints += 100;
                claimed.add('SETUP_COMPLETE');
            }
            if (!claimed.has('ACTIVE')) {
                addedPoints += 500;
                claimed.add('ACTIVE');
            }
            if (!claimed.has('PREMIUM')) {
                addedPoints += 1000;
                claimed.add('PREMIUM');
            }
        }

        ref.stage = targetStage;
        ref.points_earned = (ref.points_earned || 0) + addedPoints;
        ref.claimed_stages = Array.from(claimed);

        referrals[refIndex] = ref;
        localStorage.setItem(STORAGE_KEYS.REFERRALS_LIST, JSON.stringify(referrals));

        return {
            success: true,
            added_points: addedPoints,
            new_stage: targetStage,
            message: `Stage updated to ${targetStage}. ${addedPoints} Points credited.`
        };
    }
};

export default referralService;
