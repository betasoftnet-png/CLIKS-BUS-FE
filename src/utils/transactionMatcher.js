/**
 * Smart Transaction Matcher Utility
 * Compares parsed bank statement transactions with real system application records
 * (Customers, Suppliers, Invoices, Purchases, Expenses, and Ledger Entries).
 */

export const matchBankTransactions = (bankTransactions = [], systemContext = {}) => {
    const {
        customers = [],
        suppliers = [],
        invoices = [],
        purchases = [],
        expenses = [],
        ledgerEntries = []
    } = systemContext;

    return bankTransactions.map(txn => {
        const narration = (txn.narration || '').toLowerCase();
        const amt = parseFloat(txn.amount) || 0;
        const isCredit = txn.type === 'Credit' || (txn.credit > 0);

        let matchCategory = 'Unmatched';
        let matchedRecord = null;
        let confidence = 'Low';
        let matchReason = 'No automatic match found';

        // 1. Credit Transactions (Deposits / Customer Payments / Incomes)
        if (isCredit) {
            // Check matching Customer Invoice
            const invoiceMatch = invoices.find(inv => {
                const invAmt = parseFloat(inv.total_amount || inv.amount || inv.grand_total || 0);
                const isAmtMatch = Math.abs(invAmt - amt) < 1.0;
                const clientName = (inv.client_name || inv.customer_name || '').toLowerCase();
                const invNo = (inv.invoice_number || '').toLowerCase();

                const isNameInNarration = clientName && clientName.length > 2 && narration.includes(clientName);
                const isInvNoInNarration = invNo && narration.includes(invNo);

                return isAmtMatch || isNameInNarration || isInvNoInNarration;
            });

            if (invoiceMatch) {
                matchCategory = 'Customer Payment';
                matchedRecord = {
                    id: invoiceMatch.id,
                    type: 'Invoice',
                    name: invoiceMatch.client_name || invoiceMatch.customer_name || 'Customer',
                    ref: invoiceMatch.invoice_number || `INV-${invoiceMatch.id}`,
                    amount: parseFloat(invoiceMatch.total_amount || invoiceMatch.amount || 0)
                };
                confidence = 'High';
                matchReason = `Matched with Customer Invoice ${matchedRecord.ref}`;
            } else {
                // Check Customer Master name
                const customerMatch = customers.find(c => {
                    const cName = (c.name || c.first_name || '').toLowerCase();
                    return cName && cName.length > 2 && narration.includes(cName);
                });

                if (customerMatch) {
                    matchCategory = 'Customer Payment';
                    matchedRecord = {
                        id: customerMatch.id,
                        type: 'Customer',
                        name: customerMatch.name || customerMatch.first_name,
                        ref: `Customer #${customerMatch.id}`,
                        amount: amt
                    };
                    confidence = 'Medium';
                    matchReason = `Matched with Customer ${matchedRecord.name}`;
                } else if (narration.includes('salary') || narration.includes('personal') || narration.includes('savings') || narration.includes('self')) {
                    matchCategory = 'Personal Transaction';
                    confidence = 'Medium';
                    matchReason = 'Identified as non-business personal deposit';
                } else {
                    matchCategory = 'Business Income';
                    confidence = 'Low';
                    matchReason = 'General business deposit';
                }
            }
        } 
        // 2. Debit Transactions (Withdrawals / Vendor Payments / Expenses)
        else {
            // Check Purchase / Supplier Order
            const purchaseMatch = purchases.find(p => {
                const purAmt = parseFloat(p.total_amount || p.amount || 0);
                const isAmtMatch = Math.abs(purAmt - amt) < 1.0;
                const suppName = (p.supplier_name || p.supplier || '').toLowerCase();
                const purNo = (p.purchase_number || '').toLowerCase();

                const isNameInNarration = suppName && suppName.length > 2 && narration.includes(suppName);
                const isPurNoInNarration = purNo && narration.includes(purNo);

                return isAmtMatch || isNameInNarration || isPurNoInNarration;
            });

            if (purchaseMatch) {
                matchCategory = 'Vendor Payment';
                matchedRecord = {
                    id: purchaseMatch.id,
                    type: 'Purchase',
                    name: purchaseMatch.supplier_name || 'Vendor',
                    ref: purchaseMatch.purchase_number || `PUR-${purchaseMatch.id}`,
                    amount: parseFloat(purchaseMatch.total_amount || purchaseMatch.amount || 0)
                };
                confidence = 'High';
                matchReason = `Matched with Vendor Bill ${matchedRecord.ref}`;
            } else {
                // Check Supplier Master name
                const supplierMatch = suppliers.find(s => {
                    const sName = (s.supplier_name || s.name || s.company_name || '').toLowerCase();
                    return sName && sName.length > 2 && narration.includes(sName);
                });

                if (supplierMatch) {
                    matchCategory = 'Vendor Payment';
                    matchedRecord = {
                        id: supplierMatch.id,
                        type: 'Supplier',
                        name: supplierMatch.supplier_name || supplierMatch.name,
                        ref: `Vendor #${supplierMatch.id}`,
                        amount: amt
                    };
                    confidence = 'Medium';
                    matchReason = `Matched with Supplier ${matchedRecord.name}`;
                } else if (narration.includes('rent') || narration.includes('bill') || narration.includes('fee') || narration.includes('tax') || narration.includes('charge') || narration.includes('salary')) {
                    matchCategory = 'Business Expense';
                    confidence = 'Medium';
                    matchReason = 'Identified operating business expense';
                } else if (narration.includes('atm') || narration.includes('personal') || narration.includes('drawings') || narration.includes('food') || narration.includes('movie')) {
                    matchCategory = 'Personal Transaction';
                    confidence = 'Medium';
                    matchReason = 'Identified non-business personal withdrawal';
                } else {
                    matchCategory = 'Business Expense';
                    confidence = 'Low';
                    matchReason = 'General business withdrawal';
                }
            }
        }

        return {
            ...txn,
            matchCategory,
            matchedRecord,
            confidence,
            matchReason,
            status: 'Pending Review'
        };
    });
};
