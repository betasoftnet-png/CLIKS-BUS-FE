/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @param {boolean} [showSymbol=true] - Whether to show the currency symbol
 * @returns {string} Formatted currency string (e.g., "₹1,23,456" or "1,23,456")
 */
export const formatCurrency = (amount, showSymbol = true) => {
    if (amount === undefined || amount === null) return '';

    // Check if amount is a string that might need parsing
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return amount;

    try {
        const formatted = new Intl.NumberFormat('en-IN', {
            style: showSymbol ? 'currency' : 'decimal',
            currency: 'INR',
            maximumFractionDigits: 0, // Usually rounded for clean UI in dashboard
            minimumFractionDigits: 0
        }).format(numAmount);

        return formatted;
    } catch (error) {
        console.error("Currency formatting error:", error);
        return showSymbol ? `₹${numAmount}` : `${numAmount}`;
    }
};
