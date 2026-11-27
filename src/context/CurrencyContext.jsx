import React, { createContext, useContext, useState } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    // Default to INR (₹)
    const [currency, setCurrencyState] = useState(() => {
        const saved = localStorage.getItem('cliks_currency');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Ignore parse errors and fall back to default
            }
        }
        return { code: 'INR', symbol: '₹' };
    });

    const setCurrency = (newCurrency) => {
        let currencyObj = newCurrency;
        if (typeof newCurrency === 'string') {
            // Parses format "USD ($)" or "INR (₹)"
            const code = newCurrency.split(' ')[0];
            const symbolMatch = newCurrency.match(/\((.*?)\)/);
            const symbol = symbolMatch ? symbolMatch[1] : '';
            currencyObj = { code, symbol };
        }
        setCurrencyState(currencyObj);
        localStorage.setItem('cliks_currency', JSON.stringify(currencyObj));
        
        // Dispatch window event for custom listeners if needed
        window.dispatchEvent(new CustomEvent('cliks_currency_change', { detail: currencyObj }));
    };

    // Global helper function to format any numeric amount with high-precision support for large numbers
    const formatCurrency = (amount, options = {}) => {
        if (amount === undefined || amount === null || amount === '') return `${currency.symbol || '₹'}0`;

        // Handle BigInt or large numeric strings exceeding safe integer bounds
        if (typeof amount === 'bigint') {
            const sym = currency.symbol || '₹';
            const s = amount.toString();
            const isNeg = s.startsWith('-');
            const raw = isNeg ? s.slice(1) : s;
            if (raw.length <= 3) return `${isNeg ? '-' : ''}${sym}${raw}`;
            const last3 = raw.slice(-3);
            const rest = raw.slice(0, -3);
            const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
            return `${isNeg ? '-' : ''}${sym}${formattedRest},${last3}`;
        }

        const strVal = String(amount).trim();
        const cleanDigitsOnly = strVal.replace(/[^\d]/g, '');
        if (cleanDigitsOnly.length > 15 && !strVal.includes('e') && !strVal.includes('E')) {
            try {
                const sym = currency.symbol || '₹';
                const isNeg = strVal.startsWith('-');
                const parts = strVal.replace(/^[+-]/, '').split('.');
                const intPart = parts[0] || '0';
                const decPart = (parts[1] || '').slice(0, 2);
                let formattedInt = intPart;
                if (intPart.length > 3) {
                    const last3 = intPart.slice(-3);
                    const rest = intPart.slice(0, -3);
                    formattedInt = `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
                }
                const decSuffix = decPart ? `.${decPart}` : '';
                return `${isNeg ? '-' : ''}${sym}${formattedInt}${decSuffix}`;
            } catch (e) {}
        }

        const num = parseFloat(amount || 0);
        if (isNaN(num)) return `${currency.symbol || '₹'}0`;
        const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';
        const hasDecimals = Math.abs(num % 1) > 0.0001;
        const minDigits = options.minimumFractionDigits !== undefined 
            ? options.minimumFractionDigits 
            : (hasDecimals ? 2 : 0);
        const maxDigits = options.maximumFractionDigits !== undefined 
            ? options.maximumFractionDigits 
            : 2;

        return `${currency.symbol}${num.toLocaleString(locale, { 
            minimumFractionDigits: minDigits, 
            maximumFractionDigits: maxDigits 
        })}`;
    };

    // Default to India
    const [country, setCountryState] = useState(() => {
        const saved = localStorage.getItem('cliks_country');
        if (saved) return saved;
        return 'India';
    });

    const setCountry = (newCountry) => {
        setCountryState(newCountry);
        localStorage.setItem('cliks_country', newCountry);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, country, setCountry }}>
            {children}
        </CurrencyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
