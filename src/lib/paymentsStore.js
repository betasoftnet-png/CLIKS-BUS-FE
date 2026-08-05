import { apiClient } from '../api/client';

export const paymentsStore = {
    getBankAccounts: async () => {
        try {
            const res = await apiClient.get('/bank-accounts');
            return res?.data || [];
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
            return res?.data || [];
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
