/**
 * Barcode & QR Code Supermarket Scanner Utility
 * Supports:
 * - Real POS audio feedback (supermarket scanner beep via Web Audio API)
 * - Barcode & QR code payload parsing (plain code, SKU, ID, JSON QR payloads, URL QR payloads, weight barcodes)
 * - Ultra-fast product lookup across catalog & inventory
 * - Hardware USB/Bluetooth barcode scanner gun detection (keyboard wedge listener)
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    getContext() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    /**
     * Supermarket Register Beep (1800Hz pure sine wave, 65ms duration)
     */
    playSuccessBeep() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1850, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.075);
        } catch (_) {}
    }

    /**
     * Warning / Error Double Beep (low buzz 350Hz)
     */
    playErrorBeep() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'square';
            osc1.frequency.setValueAtTime(360, now);
            gain1.gain.setValueAtTime(0.12, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.09);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(280, now + 0.12);
            gain2.gain.setValueAtTime(0.12, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.22);
        } catch (_) {}
    }

    /**
     * Scale / Weight chime
     */
    playWeightChime() {
        try {
            const ctx = this.getContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.14);
        } catch (_) {}
    }
}

export const soundEngine = new SoundEngine();

export const playPosBeep = (type = 'success') => {
    if (type === 'error') {
        soundEngine.playErrorBeep();
    } else if (type === 'weight') {
        soundEngine.playWeightChime();
    } else {
        soundEngine.playSuccessBeep();
    }
};

/**
 * Robust Barcode or QR Code Payload Extractor
 * Can parse:
 * - Direct Barcode string: '8901030383847', 'SKU-001', 'PROD-12'
 * - JSON QR Code: '{"barcode":"8901030","sku":"XYZ","weight":1.25}'
 * - URL QR Code: 'https://cliksbusiness.com/product/8901030' -> '8901030'
 * - Embedded Weight Barcodes (EAN-13 starting with 20-29 for supermarket scales)
 */
export const parseBarcodeOrQr = (rawInput) => {
    if (!rawInput || typeof rawInput !== 'string') {
        return { code: '', raw: rawInput, weight: null };
    }

    const trimmed = rawInput.trim();
    let detectedWeight = null;
    let extractedCode = trimmed;

    // 1. Check if payload is JSON (common in modern smart QR labels)
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
            const parsed = JSON.parse(trimmed);
            extractedCode = parsed.barcode || parsed.sku || parsed.code || parsed.id || parsed.product_id || trimmed;
            if (parsed.weight !== undefined && parsed.weight !== null) {
                detectedWeight = parseFloat(parsed.weight) || null;
            }
            return {
                code: String(extractedCode).trim(),
                raw: trimmed,
                weight: detectedWeight,
                isJson: true,
                payload: parsed
            };
        } catch (_) {}
    }

    // 2. Check if payload is a URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            const url = new URL(trimmed);
            const queryCode = url.searchParams.get('barcode') || url.searchParams.get('sku') || url.searchParams.get('code') || url.searchParams.get('id');
            if (queryCode) {
                extractedCode = queryCode;
            } else {
                const parts = url.pathname.split('/').filter(Boolean);
                if (parts.length > 0) {
                    extractedCode = parts[parts.length - 1];
                }
            }
        } catch (_) {}
    }

    // 3. Supermarket In-Store Scale Barcode (GS1 / EAN-13 price-embedded / weight-embedded):
    // Standard format: 20AAAAA WWWW C where 20 is in-store prefix, AAAAA is item code, WWWW is grams
    if (/^2[0-9]{12}$/.test(extractedCode)) {
        const itemCode = extractedCode.slice(2, 7);
        const weightGrams = parseInt(extractedCode.slice(7, 12), 10);
        if (!isNaN(weightGrams) && weightGrams > 0) {
            detectedWeight = weightGrams / 1000;
            return {
                code: itemCode,
                raw: trimmed,
                weight: detectedWeight,
                isScaleBarcode: true
            };
        }
    }

    return {
        code: extractedCode,
        raw: trimmed,
        weight: detectedWeight
    };
};

/**
 * Ultra-fast Product Finder by Barcode or QR
 * Prioritizes:
 * 1. Exact barcode match
 * 2. Exact SKU match
 * 3. Exact ID match
 * 4. Case-insensitive barcode / SKU match
 * 5. HSN code match
 * 6. Product name match
 */
export const findProductByBarcodeOrQr = (searchCode, catalogList = []) => {
    if (!searchCode || !Array.isArray(catalogList) || catalogList.length === 0) {
        return null;
    }

    const cleanCode = String(searchCode).trim();
    const lowerCode = cleanCode.toLowerCase();

    // Pass 1: Exact matches (barcode, sku, id)
    for (const prod of catalogList) {
        if (!prod) continue;
        if (prod.barcode && String(prod.barcode).trim() === cleanCode) return prod;
        if (prod.sku && String(prod.sku).trim() === cleanCode) return prod;
        if (prod.id && String(prod.id).trim() === cleanCode) return prod;
        if (prod.rawProduct?.barcode && String(prod.rawProduct.barcode).trim() === cleanCode) return prod;
        if (prod.rawProduct?.sku && String(prod.rawProduct.sku).trim() === cleanCode) return prod;
    }

    // Pass 2: Case-insensitive match on barcode, sku, or id
    for (const prod of catalogList) {
        if (!prod) continue;
        const pBarcode = String(prod.barcode || prod.rawProduct?.barcode || '').trim().toLowerCase();
        const pSku = String(prod.sku || prod.rawProduct?.sku || '').trim().toLowerCase();
        const pId = String(prod.id || '').trim().toLowerCase();
        if (pBarcode && pBarcode === lowerCode) return prod;
        if (pSku && pSku === lowerCode) return prod;
        if (pId && pId === lowerCode) return prod;
    }

    // Pass 3: HSN match
    for (const prod of catalogList) {
        if (!prod) continue;
        const pHsn = String(prod.hsn_code || prod.hsnCode || prod.hsn || prod.rawProduct?.hsn_code || '').trim().toLowerCase();
        if (pHsn && pHsn === lowerCode) return prod;
    }

    // Pass 4: Clean Name exact match
    for (const prod of catalogList) {
        if (!prod) continue;
        const pName = String(prod.name || prod.product_name || '').trim().toLowerCase();
        if (pName && pName === lowerCode) return prod;
    }

    return null;
};

/**
 * Calculates GS1 Modulo-10 checksum digit for 12 numeric digits
 */
export const calculateEan13Checksum = (first12Digits) => {
    const str = String(first12Digits).replace(/\D/g, '').padStart(12, '0').slice(-12);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(str[i], 10);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const rem = sum % 10;
    return rem === 0 ? 0 : 10 - rem;
};

/**
 * Generates a valid standard 13-digit EAN-13 barcode
 */
export const generateEan13Barcode = (prefix = '890') => {
    const cleanPrefix = String(prefix || '890').slice(0, 3);
    const nowStr = Date.now().toString().slice(-7);
    const randPart = Math.floor(10 + Math.random() * 90).toString();
    const first12 = `${cleanPrefix}${nowStr}${randPart}`;
    const check = calculateEan13Checksum(first12);
    return `${first12}${check}`;
};


