import { apiClient } from '../api/client';

/**
 * Reports & Statements Analytics Service connected to live /reports backend
 */
export const reportsService = {
    getDashboardSummary: () => apiClient.get('/reports/dashboard-summary').then(res => res.data.data || res.data),
    getProfitLoss: () => apiClient.get('/reports/profit-loss').then(res => res.data.data || res.data),
    getBalanceSheet: () => apiClient.get('/reports/balance-sheet').then(res => res.data.data || res.data),
    getSalesSummary: () => apiClient.get('/reports/sales-summary').then(res => res.data.data || res.data),
    getPurchaseSummary: () => apiClient.get('/reports/purchase-summary').then(res => res.data.data || res.data),
    getSales: () => apiClient.get('/reports/sales').then(res => res.data.data || res.data),
    getSalesByCustomer: () => apiClient.get('/reports/sales-by-customer').then(res => res.data.data || res.data),
    getSalesByProduct: () => apiClient.get('/reports/sales-by-product').then(res => res.data.data || res.data),
    exportPdf: () => apiClient.get('/reports/export/pdf').then(res => res.data.data || res.data)
};

export default reportsService;
