/**
 * Global Validation Utilities for Cliks Business
 */

export const validatePhone = (phone, isRequired = false) => {
    if (!phone || !String(phone).trim()) {
        if (isRequired) return 'Phone number is required';
        return null;
    }
    const clean = String(phone).trim();
    if (!/^\d+$/.test(clean)) {
        return 'Phone number must contain numbers only';
    }
    if (clean.length !== 10) {
        return 'Phone number must contain exactly 10 digits';
    }
    return null;
};

export const validateEmail = (email, isRequired = false) => {
    if (!email || !String(email).trim()) {
        if (isRequired) return 'Email address is required';
        return null;
    }
    const clean = String(email).trim().toLowerCase();
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(clean)) {
        return 'Please enter a valid email address';
    }
    if (!clean.endsWith('@bnxmail.com')) {
        return 'Email address must end with @bnxmail.com';
    }
    return null;
};

export const validateGstin = (gstin, isRequired = false) => {
    if (!gstin || !String(gstin).trim()) {
        if (isRequired) return 'GSTIN is required';
        return null;
    }
    const clean = String(gstin).trim();
    if (clean.length !== 15 || !/^[a-zA-Z0-9]{15}$/.test(clean)) {
        return 'GSTIN must contain exactly 15 alphanumeric characters';
    }
    return null;
};

export const validatePan = (pan, isRequired = false) => {
    if (!pan || !String(pan).trim()) {
        if (isRequired) return 'PAN number is required';
        return null;
    }
    const clean = String(pan).trim();
    if (clean.length !== 10 || !/^[a-zA-Z0-9]{10}$/.test(clean)) {
        return 'PAN must contain exactly 10 alphanumeric characters';
    }
    return null;
};

export const validateFormFields = (fields = {}) => {
    const errors = {};
    if (fields.phone !== undefined) {
        const err = validatePhone(fields.phone, fields.phoneRequired);
        if (err) errors.phone = err;
    }
    if (fields.email !== undefined) {
        const err = validateEmail(fields.email, fields.emailRequired);
        if (err) errors.email = err;
    }
    if (fields.gstin !== undefined) {
        const err = validateGstin(fields.gstin, fields.gstinRequired);
        if (err) errors.gstin = err;
    }
    if (fields.pan !== undefined) {
        const err = validatePan(fields.pan, fields.panRequired);
        if (err) errors.pan = err;
    }
    return errors;
};
