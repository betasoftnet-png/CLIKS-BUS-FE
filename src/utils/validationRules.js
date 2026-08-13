/**
 * Global Validation Utilities for Cliks Business
 */

export const sanitizePhone = (val) => {
    if (!val) return '';
    return String(val).replace(/\D/g, '').slice(0, 10);
};

export const sanitizeGstin = (val) => {
    if (!val) return '';
    return String(val).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
};

export const sanitizePan = (val) => {
    if (!val) return '';
    return String(val).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
};

export const validatePhone = (phone, isRequired = true) => {
    const clean = phone ? String(phone).trim() : '';
    if (!clean) {
        if (isRequired) return 'Phone number is required.';
        return null;
    }
    if (!/^\d+$/.test(clean) || clean.length !== 10) {
        return 'Phone number must contain exactly 10 digits.';
    }
    return null;
};

export const validateEmail = (email, isRequired = true) => {
    const clean = email ? String(email).trim().toLowerCase() : '';
    if (!clean) {
        if (isRequired) return 'Email address is required.';
        return null;
    }
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(clean) || !clean.endsWith('@bnxmail.com')) {
        return 'Email must end with @bnxmail.com.';
    }
    return null;
};

export const validateGstin = (gstin, isRequired = false) => {
    const clean = gstin ? String(gstin).trim() : '';
    if (!clean) {
        if (isRequired) return 'GSTIN is required.';
        return null;
    }
    if (clean.length !== 15 || !/^[a-zA-Z0-9]{15}$/.test(clean)) {
        return 'GSTIN must contain exactly 15 alphanumeric characters.';
    }
    return null;
};

export const validatePan = (pan, isRequired = false) => {
    const clean = pan ? String(pan).trim() : '';
    if (!clean) {
        if (isRequired) return 'PAN is required.';
        return null;
    }
    if (clean.length !== 10 || !/^[a-zA-Z0-9]{10}$/.test(clean)) {
        return 'PAN must contain exactly 10 alphanumeric characters.';
    }
    return null;
};
