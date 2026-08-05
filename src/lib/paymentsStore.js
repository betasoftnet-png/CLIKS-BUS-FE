import { apiClient } from '../api/client';

export const paymentsStore = {
    getBankAccounts: async () => {
        try {
            const res = await apiClient.get('/bank-accounts');
            const raw = res.data?.data ?? res.data;
            if (Array.isArray(raw)) return raw;
            if (raw?.accounts && Array.isArray(raw.accounts)) return raw.accounts;
            if (raw?.bankAccounts && Array.isArray(raw.bankAccounts)) return raw.bankAccounts;
            if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
            if (raw?.items && Array.isArray(raw.items)) return raw.items;
            if (raw?.data && Array.isArray(raw.data)) return raw.data;
            return [];
        } catch (err) {
            console.error('[PaymentsStore getBankAccounts Error]', err.message);
            return [];
        }
    },

    addBankAccount: async (account) => {
        try {
            const res = await apiClient.post('/bank-accounts', account);
            return res?.data;
        } catch (err) {
            console.error('[PaymentsStore addBankAccount Error]', err.message);
            throw err;
        }
    },

    getTransactions: async () => {
        try {
            const res = await apiClient.get('/transactions');
            const raw = res.data?.data ?? res.data;
            if (Array.isArray(raw)) return raw;
            if (raw?.transactions && Array.isArray(raw.transactions)) return raw.transactions;
            if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
            if (raw?.items && Array.isArray(raw.items)) return raw.items;
            if (raw?.data && Array.isArray(raw.data)) return raw.data;
            return [];
        } catch (err) {
            console.error('[PaymentsStore getTransactions Error]', err.message);
            return [];
        }
    },

    addTransaction: async (tx) => {
        try {
            const res = await apiClient.post('/transactions', tx);
            if (tx.bank_account_id && tx.amount) {
                await apiClient.post(`/bank-accounts/${tx.bank_account_id}/update-balance`, {
                    amount: tx.amount,
                    type: tx.type === 'income' ? 'credit' : 'debit',
                    description: tx.notes || 'Transaction'
                });
            }
            return res?.data;
        } catch (err) {
            console.error('[PaymentsStore addTransaction Error]', err.message);
            throw err;
        }
    }
};

export default paymentsStore;
