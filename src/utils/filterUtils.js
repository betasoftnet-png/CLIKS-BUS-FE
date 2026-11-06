export const applyTableFilters = (item, filters) => {
    if (!filters) return true;
    const itemStr = JSON.stringify(item).toLowerCase();
    
    return Object.entries(filters).every(([key, val]) => {
        if (!val || typeof val !== 'string' || !val.trim()) return true;
        const searchVal = val.trim().toLowerCase();
        
        // Try to match specific keys based on common mappings
        const valMap = {
            'date': item.date || item.created_at || item.expense_date || item.dispatch_date,
            'category': item.category || item.category_name || item.type,
            'amount': item.amount || item.total || item.expense_amount || item.grand_total,
            'status': item.status || item.payment_status || item.payroll_status,
            'customer_name': item.customer_name || item.client_name,
            'supplier_name': item.supplier_name || item.vendor_name,
            'invoice_number': item.invoice_number || item.reference_id,
            'mode': item.mode || item.payment_mode || item.payment_method,
            'bank': item.bank_name || item.bank,
            'account_name': item.account_name,
            'account_no': item.account_number,
            'bank_account': item.bank_account || item.account_number || item.bank_name,
            'opening_balance': item.opening_balance,
            'current_balance': item.current_balance,
            'product_name': item.product_name || item.name,
            'employee': item.employee_name || item.name,
            'employee_name': item.employee_name || item.name,
            'in_transit': item.in_transit_stock !== undefined ? item.in_transit_stock : item.in_transit,
            'current_stock': item.current_stock !== undefined ? item.current_stock : item.quantity,
            'damaged': item.damaged_qty !== undefined ? item.damaged_qty : (item.damaged_stock !== undefined ? item.damaged_stock : item.damaged),
            'valuation': item.warehouse_stock_value !== undefined ? item.warehouse_stock_value : item.valuation,
            'base_salary': item.base_salary !== undefined ? item.base_salary : (item.basic_salary !== undefined ? item.basic_salary : item.salary),
            'basic_salary': item.basic_salary !== undefined ? item.basic_salary : item.base_salary,
            'salary': item.salary !== undefined ? item.salary : (item.basic_salary !== undefined ? item.basic_salary : item.base_salary),
            'earnings': item.earnings !== undefined ? item.earnings : item.total_earnings,
            'deductions': item.deductions !== undefined ? item.deductions : item.total_deductions,
            'net_pay': item.net_pay !== undefined ? item.net_pay : (item.net_take_home !== undefined ? item.net_take_home : item.take_home),
            'take_home': item.take_home !== undefined ? item.take_home : (item.net_take_home !== undefined ? item.net_take_home : item.net_pay),
            'net_take_home': item.net_take_home !== undefined ? item.net_take_home : item.net_pay,
            'payslip_ref': item.payslip_ref || item.payslip_number,
            'payslip_number': item.payslip_number || item.payslip_ref,
        };

        const targetVal = valMap[key] !== undefined ? valMap[key] : item[key];

        if (targetVal !== undefined && targetVal !== null) {
            const strVal = String(targetVal).toLowerCase();
            if (strVal.includes(searchVal)) return true;

            // Formatted without currency symbol or commas
            const cleanSearch = searchVal.replace(/[₹$,\s]/g, '');
            const cleanTarget = strVal.replace(/[₹$,\s]/g, '');
            if (cleanSearch && cleanTarget.includes(cleanSearch)) return true;

            // Numeric comparisons and locale formats
            if (typeof targetVal === 'number' || (!isNaN(Number(targetVal)) && !isNaN(parseFloat(targetVal)))) {
                const num = Number(targetVal);
                const inFormatted = num.toLocaleString('en-IN').toLowerCase();
                const usFormatted = num.toLocaleString('en-US').toLowerCase();
                if (inFormatted.includes(searchVal) || usFormatted.includes(searchVal)) return true;

                // Support abs search for deductions (e.g. typing 200 or -200 matches deductions of 200 or -200)
                const absSearch = cleanSearch.replace(/^-/, '');
                const absTarget = cleanTarget.replace(/^-/, '');
                if (absSearch && absTarget.includes(absSearch)) return true;

                // Support comparison operators e.g. >5000, <10000, >=6000, <=5800
                const compMatch = searchVal.match(/^([><]=?)\s*([0-9.,]+)$/);
                if (compMatch) {
                    const op = compMatch[1];
                    const compNum = parseFloat(compMatch[2].replace(/,/g, ''));
                    if (!isNaN(compNum)) {
                        if (op === '>' && num > compNum) return true;
                        if (op === '>=' && num >= compNum) return true;
                        if (op === '<' && num < compNum) return true;
                        if (op === '<=' && num <= compNum) return true;
                        return false;
                    }
                }
            }

            return false;
        }

        // Only fall back to itemStr if key was not a specific known column filter
        if (key === 'search' || key === 'q' || key === 'all') {
            return itemStr.includes(searchVal);
        }

        return false;
    });
};
