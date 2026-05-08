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
};

export default accountingService;
