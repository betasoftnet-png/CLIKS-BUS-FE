import { apiClient } from '../api/client';

const getLocalInvoices = () => {
    try {
        const local = localStorage.getItem('cliks_local_invoices');
        return local ? JSON.parse(local) : [];
    } catch {
        return [];
    }
};

const saveLocalInvoices = (invoices) => {
    try {
        localStorage.setItem('cliks_local_invoices', JSON.stringify(invoices));
    } catch {
        // Ignored
    }
};

export const billingService = {
    // Base CRUD Invoices (Supports both /billing and /billing/invoices patterns)
    getInvoices: async (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        try {
            const res = await apiClient.get('/billing/invoices', { params: cleanParams });
            const serverData = res.data?.data || res.data || [];
            const local = getLocalInvoices();
            
            // Merge unique server/local by ID
            const serverIds = new Set(serverData.map(i => i.id?.toString()));
            const uniqueLocal = local.filter(i => !serverIds.has(i.id?.toString()));
            
            return [...uniqueLocal, ...serverData];
        } catch (error) {
            console.warn('[BillingService] Fallback to local storage invoices due to connection issue.', error);
            return getLocalInvoices();
        }
    },
    
    createInvoice: async (data) => {
        const tempId = `INV-${Date.now()}`;
        const localInvoice = {
            id: tempId,
            invoice_number: data.invoice_number || `INV-${Math.floor(Math.random() * 100000)}`,
            ...data,
            created_at: new Date().toISOString(),
            status: data.status || 'Paid'
        };
        
        try {
            const res = await apiClient.post('/billing/invoices', data);
            // Standard handling if successful on server
            const savedInvoice = res.data?.data || res.data || localInvoice;
            
            // Persist client-side snapshot
            const local = getLocalInvoices();
            saveLocalInvoices([savedInvoice, ...local]);
            
            return savedInvoice;
        } catch (error) {
            console.warn('[BillingService] Error storing invoice, creating locally.', error);
            const local = getLocalInvoices();
            saveLocalInvoices([localInvoice, ...local]);
            return localInvoice;
        }
    },
    
    updateInvoice: (id, data) => apiClient.put(`/billing/invoices/${id}`, data).then(res => res.data?.data || res.data),
    
    deleteInvoice: async (id) => {
        try {
            await apiClient.delete(`/billing/invoices/${id}`);
        } finally {
            const local = getLocalInvoices();
            const filtered = local.filter(i => i.id !== id && i.id?.toString() !== id.toString());
            saveLocalInvoices(filtered);
        }
        return { success: true };
    },

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
