import { apiClient } from '../api/client';

export const billingService = {
    // Base CRUD Invoices (Supports both /billing and /billing/invoices patterns)
    getInvoices: (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        return apiClient.get('/billing/invoices', { params: cleanParams }).then(res => res.data.data || res.data);
    },
    
    createInvoice: (data) => apiClient.post('/billing/invoices', data).then(res => res.data.data || res.data),
    
    updateInvoice: (id, data) => apiClient.put(`/billing/invoices/${id}`, data).then(res => res.data.data || res.data),
    
    deleteInvoice: (id) => apiClient.delete(`/billing/invoices/${id}`).then(res => res.data.data || res.data),

    searchInvoices: (query) => apiClient.get(`/billing/invoices/search?q=${query}`).then(res => res.data.data || res.data),

    updateInvoiceStatus: (id, status) => apiClient.patch(`/billing/invoices/${id}/status`, { status }).then(res => res.data.data || res.data),

    // Sub-items
    addInvoiceItem: (id, data) => apiClient.post(`/billing/invoices/${id}/items`, data).then(res => res.data.data || res.data),
    updateInvoiceItem: (id, itemId, data) => apiClient.put(`/billing/invoices/${id}/items/${itemId}`, data).then(res => res.data.data || res.data),
    deleteInvoiceItem: (id, itemId) => apiClient.delete(`/billing/invoices/${id}/items/${itemId}`).then(res => res.data.data || res.data),

    // Payments
    createInvoicePayment: (id, data) => apiClient.post(`/billing/invoices/${id}/payments`, data).then(res => res.data.data || res.data),
    getInvoicePayments: (id) => apiClient.get(`/billing/invoices/${id}/payments`).then(res => res.data.data || res.data),

    // Returns
    createInvoiceReturn: (id, data) => apiClient.post(`/billing/invoices/${id}/returns`, data).then(res => res.data.data || res.data),
    getInvoiceReturns: (id) => apiClient.get(`/billing/invoices/${id}/returns`).then(res => res.data.data || res.data),

    // Custom actions
    shareInvoice: (id) => apiClient.post(`/billing/invoices/${id}/share`).then(res => res.data.data || res.data),
    getInvoicePdf: (id) => apiClient.get(`/billing/invoices/${id}/pdf`).then(res => res.data.data || res.data),
    printInvoice: (id) => apiClient.get(`/billing/invoices/${id}/print`).then(res => res.data.data || res.data),
    sendWhatsapp: (id) => apiClient.post(`/billing/invoices/${id}/send-whatsapp`).then(res => res.data.data || res.data),
    sendEmail: (id) => apiClient.post(`/billing/invoices/${id}/send-email`).then(res => res.data.data || res.data),
    cancelInvoice: (id) => apiClient.post(`/billing/invoices/${id}/cancel`).then(res => res.data.data || res.data),
    duplicateInvoice: (id) => apiClient.post(`/billing/invoices/${id}/duplicate`).then(res => res.data.data || res.data),
    einvoice: (id) => apiClient.post(`/billing/invoices/${id}/einvoice`).then(res => res.data.data || res.data),
    ewaybill: (id) => apiClient.post(`/billing/invoices/${id}/ewaybill`).then(res => res.data.data || res.data),

    // History
    getInvoiceHistory: (id) => apiClient.get(`/billing/invoices/${id}/history`).then(res => res.data.data || res.data),
    getInvoiceTimeline: (id) => apiClient.get(`/billing/invoices/${id}/timeline`).then(res => res.data.data || res.data),

    // Reports
    getSalesReport: () => apiClient.get('/billing/reports/sales').then(res => res.data.data || res.data),
    getGstReport: () => apiClient.get('/billing/reports/gst').then(res => res.data.data || res.data),
    getPaymentReport: () => apiClient.get('/billing/reports/payment').then(res => res.data.data || res.data),
    getOutstandingReport: () => apiClient.get('/billing/reports/outstanding').then(res => res.data.data || res.data),

    // Import/Export
    importBilling: (data) => apiClient.post('/billing/import', data).then(res => res.data.data || res.data),
    exportBilling: () => apiClient.get('/billing/export').then(res => res.data.data || res.data),

    // Notes
    createInvoiceNote: (id, data) => apiClient.post(`/billing/invoices/${id}/notes`, data).then(res => res.data.data || res.data),
    getInvoiceNotes: (id) => apiClient.get(`/billing/invoices/${id}/notes`).then(res => res.data.data || res.data),

    // Documents
    createInvoiceDocument: (id, data) => apiClient.post(`/billing/invoices/${id}/documents`, data).then(res => res.data.data || res.data),
    getInvoiceDocuments: (id) => apiClient.get(`/billing/invoices/${id}/documents`).then(res => res.data.data || res.data),

    // Analytics
    getAnalytics: () => apiClient.get('/billing/analytics').then(res => res.data.data || res.data),
    getDashboardSummary: () => apiClient.get('/billing/dashboard-summary').then(res => res.data.data || res.data)
};

export default billingService;
