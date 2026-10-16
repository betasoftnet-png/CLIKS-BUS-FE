import { apiClient } from '../api/client';

const toParams = (arg) => {
    if (!arg) return undefined;
    if (typeof arg === 'object') return arg;
    return { branch_id: arg };
};

/**
 * Reports & Statements Analytics Service connected to live /reports backend
 * Supports multi-branch scoping (branch_id query param or x-branch-id header)
 */
export const reportsService = {
    getDashboardSummary: (params) => apiClient.get('/reports/dashboard-summary', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getSalesOverview: (params) => apiClient.get('/reports/dashboard-summary', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getTopProducts: (params) => apiClient.get('/products/reports/top-products', { params: toParams(params) }).then(res => res.data?.data || res.data || res).catch(() => []),
    getProfitLoss: (params) => apiClient.get('/reports/profit-loss', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getBalanceSheet: (params) => apiClient.get('/reports/balance-sheet', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getSalesSummary: (params) => apiClient.get('/reports/sales-summary', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getPurchaseSummary: (params) => apiClient.get('/reports/purchase-summary', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getSales: (params) => apiClient.get('/reports/sales', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getSalesByCustomer: (params) => apiClient.get('/reports/sales-by-customer', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getSalesByProduct: (params) => apiClient.get('/reports/sales-by-product', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getChartSales: (params) => apiClient.get('/reports/charts/sales', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getStockMovement: (params) => apiClient.get('/reports/stock-movement', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    exportPdf: (params) => apiClient.get('/reports/export/pdf', { params: toParams(params) }).then(res => res.data?.data || res.data || res),
    getInvoices: (params) => apiClient.get('/billing/invoices', { params: toParams(params) }).then(res => res.data?.data || res.data || res)
};

export default reportsService;
