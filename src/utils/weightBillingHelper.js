/**
 * Weight-Based Billing & Multi-Branch Price Governance Helper
 * Supports loose bulk commodities sold by weight (Dhal, Rice, Flour, Grains, Vegetables, Spices, Sugar)
 */

export const WEIGHT_UNITS = [
    'KG', 'KGS', 'KILOGRAM', 'KILOGRAMS', 
    'G', 'GM', 'GMS', 'GRAM', 'GRAMS', 
    'L', 'ML', 'LITRE', 'LITRES', 
    'TON', 'TONNE', 'QUINTAL'
];

export const WEIGHT_COMMODITY_KEYWORDS = [
    'dhal', 'dhall', 'toor dal', 'moong dal', 'urad dal', 'chana dal', 'masoor dal', 'dal',
    'rice', 'basmati', 'ponni', 'raw rice', 'boiled rice', 'sona masoori', 'idli rice',
    'wheat', 'flour', 'atta', 'maida', 'sooji', 'rava', 'besan',
    'sugar', 'jaggery', 'salt', 'pepper', 'cardamom', 'clove', 'mustard', 'cumin', 'jeera', 'fenugreek',
    'pulses', 'grains', 'spices', 'vegetable', 'potato', 'onion', 'tomato', 'dry fruits', 'cashew', 'badam'
];

export const QUICK_WEIGHT_PRESETS = [
    { label: '100g', kg: 0.100 },
    { label: '250g', kg: 0.250 },
    { label: '500g', kg: 0.500 },
    { label: '750g', kg: 0.750 },
    { label: '1 kg', kg: 1.000 },
    { label: '2 kg', kg: 2.000 },
    { label: '5 kg', kg: 5.000 }
];

/**
 * Checks if a product is sold by weight (loose item like dhal or rice)
 */
export const isProductWeighted = (item) => {
    if (!item) return false;
    if (item.is_weighted === true || item.is_weighted === 1 || item.sold_by_weight === true || item.sold_by_weight === 1) {
        return true;
    }

    const u = String(item.unit || '').toUpperCase().trim();
    if (WEIGHT_UNITS.includes(u)) {
        return true;
    }

    // Discrete packaged unit guard
    if (['PCS', 'PIECE', 'PIECES', 'BOX', 'BOTTLE', 'STRIP', 'CAN', 'PACKET', 'DOZEN'].includes(u)) {
        return false;
    }

    const name = String(item.name || item.product_name || item.description || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    if (WEIGHT_COMMODITY_KEYWORDS.some(kw => name.includes(kw) || cat.includes(kw))) {
        return true;
    }

    return false;
};

/**
 * Evaluates whether the current active user / branch is the Main Branch.
 * Main Branch can decide / set / change price per KG.
 * Sub Branch can only view the price and enters the weight of the bag.
 */
export const checkIsMainBranch = (user, branchObj) => {
    // If the authenticated account is a Showroom Sub-ID, it is strictly a Sub Branch
    if (user?.is_sub_id === true || user?.role === 'sub_id' || user?.role === 'SUB_ID') {
        return false;
    }

    // If no branch object specified, default to company owner/HQ (Main Branch)
    if (!branchObj) return true;

    // All Showrooms Consolidated or HQ
    if (branchObj.is_all || branchObj.id === 'all' || branchObj.code === 'HQ') {
        return true;
    }

    // Explicit is_main_branch flag
    if (branchObj.is_main_branch === 1 || branchObj.is_main_branch === true) {
        return true;
    }

    // Otherwise it is a secondary / sub branch
    return false;
};

/**
 * Calculate line item total based on weight and price per unit
 */
export const calculateWeightTotal = (weight, ratePerUnit) => {
    const w = parseFloat(weight) || 0;
    const r = parseFloat(ratePerUnit) || 0;
    return Math.round(w * r * 100) / 100;
};

/**
 * Convert weight between Grams and KG
 */
export const convertGramsToKg = (grams) => {
    const g = parseFloat(grams) || 0;
    return Math.round((g / 1000) * 1000) / 1000;
};

export const convertKgToGrams = (kg) => {
    const k = parseFloat(kg) || 0;
    return Math.round(k * 1000);
};

export default {
    WEIGHT_UNITS,
    WEIGHT_COMMODITY_KEYWORDS,
    QUICK_WEIGHT_PRESETS,
    isProductWeighted,
    checkIsMainBranch,
    calculateWeightTotal,
    convertGramsToKg,
    convertKgToGrams
};
