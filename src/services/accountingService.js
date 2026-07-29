import { apiClient } from '../api/client';

/**
 * Accounting & GST Service connected to live /accounting backend
 */
export const accountingService = {
    getProfitLoss: () => apiClient.get('/accounting/profit-loss').then(res => res.data.data || res.data),
    getBalanceSheet: () => apiClient.get('/accounting/balance-sheet').then(res => res.data.data || res.data),
    getBankAccounts: () => apiClient.get('/accounting/bank-accounts').then(res => res.data.data || res.data),
    getExpenses: () => apiClient.get('/accounting/expenses').then(res => res.data.data || res.data),
    getLedger: () => apiClient.get('/accounting/ledger').then(res => res.data.data || res.data),
    getTax: () => apiClient.get('/accounting/tax').then(res => res.data.data || res.data),
    recordEntry: (data) => apiClient.post('/accounting/journal-entries', data).then(res => res.data.data || res.data),
    createBankAccount: (data) => apiClient.post('/accounting/bank-accounts', data).then(res => res.data.data || res.data),
    getPurchases: () => apiClient.get('/purchases').then(res => res.data.data || res.data),
    updateAccount: (id, data) => apiClient.put(`/accounting/accounts/${id}`, data).then(res => res.data.data || res.data),
    deleteAccount: (id) => apiClient.delete(`/accounting/accounts/${id}`).then(res => res.data.data || res.data),
    recordDeposit: (id, data) => apiClient.post(`/accounting/accounts/${id}/deposit`, data).then(res => res.data.data || res.data),
    recordWithdrawal: (id, data) => apiClient.post(`/accounting/accounts/${id}/withdraw`, data).then(res => res.data.data || res.data),
    recordTransfer: (data) => apiClient.post('/accounting/accounts/transfer', data).then(res => res.data.data || res.data),
};

export default accountingService;
