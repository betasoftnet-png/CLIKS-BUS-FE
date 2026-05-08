import { apiClient } from '../api/client';

export const returnsService = {
    // CRUD Operations (QueryFunctionContext safe)
    getReturns: (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        return apiClient.get('/returns', { params: cleanParams }).then(res => res.data.data || res.data);
    },

    createReturn: (data) => apiClient.post('/returns', data).then(res => res.data.data || res.data),

    updateReturn: (id, data) => apiClient.put(`/returns/${id}`, data).then(res => res.data.data || res.data),

    deleteReturn: (id) => apiClient.delete(`/returns/${id}`).then(res => res.data.data || res.data),

    searchReturns: (query) => apiClient.get(`/returns/search?q=${query}`).then(res => res.data.data || res.data),

    // Sub-items
    addReturnItem: (id, data) => apiClient.post(`/returns/${id}/items`, data).then(res => res.data.data || res.data),
    updateReturnItem: (id, itemId, data) => apiClient.put(`/returns/${id}/items/${itemId}`, data).then(res => res.data.data || res.data),
    deleteReturnItem: (id, itemId) => apiClient.delete(`/returns/${id}/items/${itemId}`).then(res => res.data.data || res.data),

    updateReturnStatus: (id, status) => apiClient.patch(`/returns/${id}/status`, { status }).then(res => res.data.data || res.data),

    // Actions
    approveReturn: (id) => apiClient.post(`/returns/${id}/approve`).then(res => res.data.data || res.data),
    rejectReturn: (id) => apiClient.post(`/returns/${id}/reject`).then(res => res.data.data || res.data),

    processRefund: (id, data) => apiClient.post(`/returns/${id}/refund`, data).then(res => res.data.data || res.data),
    getRefunds: (id) => apiClient.get(`/returns/${id}/refunds`).then(res => res.data.data || res.data),

    processReplacement: (id, data) => apiClient.post(`/returns/${id}/replacement`, data).then(res => res.data.data || res.data),
    getReplacement: (id) => apiClient.get(`/returns/${id}/replacement`).then(res => res.data.data || res.data),

    getReturnInvoice: (id) => apiClient.get(`/returns/${id}/invoice`).then(res => res.data.data || res.data),
    getReturnPayments: (id) => apiClient.get(`/returns/${id}/payments`).then(res => res.data.data || res.data),

    processStockAdjustment: (id, data) => apiClient.post(`/returns/${id}/stock-adjustment`, data).then(res => res.data.data || res.data),
    getStockHistory: (id) => apiClient.get(`/returns/${id}/stock-history`).then(res => res.data.data || res.data),

    shareReturn: (id) => apiClient.post(`/returns/${id}/share`).then(res => res.data.data || res.data),
    getReturnPdf: (id) => apiClient.get(`/returns/${id}/pdf`).then(res => res.data.data || res.data),
    printReturn: (id) => apiClient.get(`/returns/${id}/print`).then(res => res.data.data || res.data),

    sendWhatsapp: (id) => apiClient.post(`/returns/${id}/send-whatsapp`).then(res => res.data.data || res.data),
    sendEmail: (id) => apiClient.post(`/returns/${id}/send-email`).then(res => res.data.data || res.data),

    getReturnHistory: (id) => apiClient.get(`/returns/${id}/history`).then(res => res.data.data || res.data),
    getReturnTimeline: (id) => apiClient.get(`/returns/${id}/timeline`).then(res => res.data.data || res.data),

    // Reports
    getSummaryReport: () => apiClient.get('/returns/reports/summary').then(res => res.data.data || res.data),
    getCustomerReport: () => apiClient.get('/returns/reports/customer').then(res => res.data.data || res.data),
    getProductsReport: () => apiClient.get('/returns/reports/products').then(res => res.data.data || res.data),
    getRefundsReport: () => apiClient.get('/returns/reports/refunds').then(res => res.data.data || res.data),
    getDamagedItemsReport: () => apiClient.get('/returns/reports/damaged-items').then(res => res.data.data || res.data),

    // Import/Export
    importReturns: (data) => apiClient.post('/returns/import', data).then(res => res.data.data || res.data),
    exportReturns: () => apiClient.get('/returns/export').then(res => res.data.data || res.data),

    // Notes
    createReturnNote: (id, data) => apiClient.post(`/returns/${id}/notes`, data).then(res => res.data.data || res.data),
    getReturnNotes: (id) => apiClient.get(`/returns/${id}/notes`).then(res => res.data.data || res.data),

    // Documents
    createReturnDocument: (id, data) => apiClient.post(`/returns/${id}/documents`, data).then(res => res.data.data || res.data),
    getReturnDocuments: (id) => apiClient.get(`/returns/${id}/documents`).then(res => res.data.data || res.data),

    // Analytics
    getAnalytics: () => apiClient.get('/returns/analytics').then(res => res.data.data || res.data),
    getDashboardSummary: () => apiClient.get('/returns/dashboard-summary').then(res => res.data.data || res.data)
};

export default returnsService;
