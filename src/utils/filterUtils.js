export const applyTableFilters = (item, filters) => {
    if (!filters) return true;
    const itemStr = JSON.stringify(item).toLowerCase();
    
    return Object.entries(filters).every(([key, val]) => {
        if (!val) return true;
        const searchVal = val.toLowerCase();
        
        // Try to match specific keys based on common mappings
        const valMap = {
            'date': item.date || item.created_at || item.expense_date || item.dispatch_date,
            'category': item.category || item.category_name || item.type,
            'amount': item.amount || item.total || item.expense_amount || item.grand_total,
            'status': item.status || item.payment_status,
            'customer_name': item.customer_name || item.client_name,
            'supplier_name': item.supplier_name || item.vendor_name,
            'invoice_number': item.invoice_number || item.reference_id,
            'mode': item.mode || item.payment_mode || item.payment_method,
            'bank': item.bank_name || item.bank,
            'account_name': item.account_name,
            'account_no': item.account_number,
            'opening_balance': item.opening_balance,
            'current_balance': item.current_balance,
            'product_name': item.product_name || item.name,
            'employee': item.employee_name || item.name,
        };

        const exactMatch = valMap[key];
        if (exactMatch !== undefined) {
            return String(exactMatch).toLowerCase().includes(searchVal);
        }

        // If key directly exists
        if (item[key] !== undefined) {
            return String(item[key]).toLowerCase().includes(searchVal);
        }

        // Fallback: does the item contain this value anywhere?
        return itemStr.includes(searchVal);
    });
};
