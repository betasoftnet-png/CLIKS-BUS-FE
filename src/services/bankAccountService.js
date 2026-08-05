import api from './api';

export const bankAccountService = {
    getBankAccounts: async (params = {}) => {
        const response = await api.get('/bank-accounts', { params });
        const raw = response.data?.data ?? response.data;
        if (Array.isArray(raw)) return raw;
        if (raw?.accounts && Array.isArray(raw.accounts)) return raw.accounts;
        if (raw?.bankAccounts && Array.isArray(raw.bankAccounts)) return raw.bankAccounts;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
    },
    getBankAccountById: async (id) => {
        const response = await api.get(`/bank-accounts/${id}`);
        return response.data;
    },
    createBankAccount: async (accountData) => {
        const response = await api.post('/bank-accounts', accountData);
        return response.data;
    },
    updateBankAccount: async (id, accountData) => {
        const response = await api.put(`/bank-accounts/${id}`, accountData);
        return response.data;
    },
    updateBalance: async (id, transactionData) => {
        const response = await api.post(`/bank-accounts/${id}/update-balance`, transactionData);
        return response.data;
    },
    deleteBankAccount: async (id) => {
        const response = await api.delete(`/bank-accounts/${id}`);
        return response.data;
    }
};

export default bankAccountService;
