import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

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

    // Global helper function to format any numeric amount
    const formatCurrency = (amount) => {
        const num = parseFloat(amount || 0);
        const locale = currency.code === 'INR' ? 'en-IN' : 'en-US';
        return `${currency.symbol}${num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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
