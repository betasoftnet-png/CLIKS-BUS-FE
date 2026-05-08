import { apiClient } from '../api/client';

export const purchasesService = {
    // CRUD Operations (QueryFunctionContext safe)
    getPurchases: (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        return apiClient.get('/purchases', { params: cleanParams }).then(res => res.data.data || res.data);
    },

    createPurchase: (data) => apiClient.post('/purchases', data).then(res => res.data.data || res.data),

    updatePurchase: (id, data) => apiClient.put(`/purchases/${id}`, data).then(res => res.data.data || res.data),

    deletePurchase: (id) => apiClient.delete(`/purchases/${id}`).then(res => res.data.data || res.data),

    searchPurchases: (query) => apiClient.get(`/purchases/search?q=${query}`).then(res => res.data.data || res.data),

    // Sub-items
    addPurchaseItem: (id, data) => apiClient.post(`/purchases/${id}/items`, data).then(res => res.data.data || res.data),
    updatePurchaseItem: (id, itemId, data) => apiClient.put(`/purchases/${id}/items/${itemId}`, data).then(res => res.data.data || res.data),
    deletePurchaseItem: (id, itemId) => apiClient.delete(`/purchases/${id}/items/${itemId}`).then(res => res.data.data || res.data),

    updatePurchaseStatus: (id, status) => apiClient.patch(`/purchases/${id}/status`, { status }).then(res => res.data.data || res.data),

    // Payments
    processPurchasePayments: (id, data) => apiClient.post(`/purchases/${id}/payments`, data).then(res => res.data.data || res.data),
    getPurchasePayments: (id) => apiClient.get(`/purchases/${id}/payments`).then(res => res.data.data || res.data),

    // Returns
    processPurchaseReturns: (id, data) => apiClient.post(`/purchases/${id}/returns`, data).then(res => res.data.data || res.data),
    getPurchaseReturns: (id) => apiClient.get(`/purchases/${id}/returns`).then(res => res.data.data || res.data),

    // Stock Adjustments
    processStockUpdate: (id, data) => apiClient.post(`/purchases/${id}/stock-update`, data).then(res => res.data.data || res.data),
    getStockHistory: (id) => apiClient.get(`/purchases/${id}/stock-history`).then(res => res.data.data || res.data),

    // Invoices & Bills
    getPurchaseInvoice: (id) => apiClient.get(`/purchases/${id}/invoice`).then(res => res.data.data || res.data),
    getPurchaseBill: (id) => apiClient.get(`/purchases/${id}/bill`).then(res => res.data.data || res.data),

    // Sharing, PDFs & Prints
    sharePurchase: (id) => apiClient.post(`/purchases/${id}/share`).then(res => res.data.data || res.data),
    getPurchasePdf: (id) => apiClient.get(`/purchases/${id}/pdf`).then(res => res.data.data || res.data),
    printPurchase: (id) => apiClient.get(`/purchases/${id}/print`).then(res => res.data.data || res.data),

    sendWhatsapp: (id) => apiClient.post(`/purchases/${id}/send-whatsapp`).then(res => res.data.data || res.data),
    sendEmail: (id) => apiClient.post(`/purchases/${id}/send-email`).then(res => res.data.data || res.data),

    // Cancel / Duplicate
    cancelPurchase: (id) => apiClient.post(`/purchases/${id}/cancel`).then(res => res.data.data || res.data),
    duplicatePurchase: (id) => apiClient.post(`/purchases/${id}/duplicate`).then(res => res.data.data || res.data),

    // eWay Bill
    processEwaybill: (id) => apiClient.post(`/purchases/${id}/ewaybill`).then(res => res.data.data || res.data),

    // History & Timeline
    getPurchaseHistory: (id) => apiClient.get(`/purchases/${id}/history`).then(res => res.data.data || res.data),
    getPurchaseTimeline: (id) => apiClient.get(`/purchases/${id}/timeline`).then(res => res.data.data || res.data),

    // Notes
    createPurchaseNote: (id, data) => apiClient.post(`/purchases/${id}/notes`, data).then(res => res.data.data || res.data),
    getPurchaseNotes: (id) => apiClient.get(`/purchases/${id}/notes`).then(res => res.data.data || res.data),

    // Documents
    createPurchaseDocument: (id, data) => apiClient.post(`/purchases/${id}/documents`, data).then(res => res.data.data || res.data),
    getPurchaseDocuments: (id) => apiClient.get(`/purchases/${id}/documents`).then(res => res.data.data || res.data),

    // Reports
    getSummaryReport: () => apiClient.get('/purchases/reports/summary').then(res => res.data.data || res.data),
    getSupplierReport: () => apiClient.get('/purchases/reports/supplier').then(res => res.data.data || res.data),
    getGstReport: () => apiClient.get('/purchases/reports/gst').then(res => res.data.data || res.data),
    getPaymentReport: () => apiClient.get('/purchases/reports/payment').then(res => res.data.data || res.data),
    getPendingReport: () => apiClient.get('/purchases/reports/pending').then(res => res.data.data || res.data),

    // Analytics
    getAnalytics: () => apiClient.get('/purchases/analytics').then(res => res.data.data || res.data),
    getDashboardSummary: () => apiClient.get('/purchases/dashboard-summary').then(res => res.data.data || res.data)
};

export default purchasesService;
