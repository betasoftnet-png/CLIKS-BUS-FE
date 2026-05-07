/**
 * Payments & Bank Account Memory Store
 * Centralizes local storage logic to handle Bank Accounts, Transactions, 
 * and Balance adjustments across Sales and Purchases.
 */

const DEFAULT_BANK_ACCOUNTS = [
    {
        id: 1,
        bank_name: 'HDFC Bank',
        account_name: 'CLIKS Enterprise Account',
        account_number: '50100481239045',
        ifsc_code: 'HDFC0000123',
        opening_balance: 4500000,
        current_balance: 4418000,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        bank_name: 'ICICI Bank',
        account_name: 'CLIKS Petty Cash / Secondary',
        account_number: '000401569082',
        ifsc_code: 'ICIC0000004',
        opening_balance: 500000,
        current_balance: 500000,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const DEFAULT_TRANSACTIONS = [
    {
        id: 1,
        type: 'income',
        reference_type: 'sales',
        reference_id: 'INV-1001',
        bank_account_id: 1,
        amount: 60000,
        payment_method: 'upi',
        notes: 'Partial payment received for INV-1001',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        type: 'expense',
        reference_type: 'purchase',
        reference_id: 'PUR-1001',
        bank_account_id: 1,
        amount: 142000,
        payment_method: 'bank',
        notes: 'Full payment made for vendor inventory purchase',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
];

export const paymentsStore = {
    getBankAccounts: () => {
        const data = localStorage.getItem('cliks_bank_accounts');
        if (!data) {
            localStorage.setItem('cliks_bank_accounts', JSON.stringify(DEFAULT_BANK_ACCOUNTS));
            return DEFAULT_BANK_ACCOUNTS;
        }
        return JSON.parse(data);
    },

    saveBankAccounts: (accounts) => {
        localStorage.setItem('cliks_bank_accounts', JSON.stringify(accounts));
    },

    addBankAccount: (account) => {
        const accounts = paymentsStore.getBankAccounts();
        const newAccount = {
            ...account,
            id: accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1,
            current_balance: parseFloat(account.opening_balance) || 0,
            created_at: new Date().toISOString()
        };
        accounts.push(newAccount);
        paymentsStore.saveBankAccounts(accounts);
        return newAccount;
    },

    getTransactions: () => {
        const data = localStorage.getItem('cliks_transactions');
        if (!data) {
            localStorage.setItem('cliks_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
            return DEFAULT_TRANSACTIONS;
        }
        return JSON.parse(data);
    },

    saveTransactions: (transactions) => {
        localStorage.setItem('cliks_transactions', JSON.stringify(transactions));
    },

    addTransaction: (tx) => {
        const transactions = paymentsStore.getTransactions();
        const accounts = paymentsStore.getBankAccounts();

        const newTx = {
            ...tx,
            id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
            amount: parseFloat(tx.amount) || 0,
            created_at: new Date().toISOString()
        };

        transactions.push(newTx);
        paymentsStore.saveTransactions(transactions);

        // Update Bank Balance
        if (tx.bank_account_id) {
            const accIdx = accounts.findIndex(a => a.id === parseInt(tx.bank_account_id));
            if (accIdx !== -1) {
                if (tx.type === 'income') {
                    accounts[accIdx].current_balance += newTx.amount;
                } else if (tx.type === 'expense') {
                    accounts[accIdx].current_balance -= newTx.amount;
                }
                paymentsStore.saveBankAccounts(accounts);
            }
        }

        return newTx;
    }
};
