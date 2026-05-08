import { apiClient } from '../api/client';

export const suppliersService = {
    // CRUD Operations (QueryFunctionContext safe)
    getSuppliers: (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        return apiClient.get('/suppliers', { params: cleanParams }).then(res => res.data.data || res.data);
    },

    createSupplier: (data) => apiClient.post('/suppliers', data).then(res => res.data.data || res.data),

    updateSupplier: (id, data) => apiClient.put(`/suppliers/${id}`, data).then(res => res.data.data || res.data),

    deleteSupplier: (id) => apiClient.delete(`/suppliers/${id}`).then(res => res.data.data || res.data),

    searchSuppliers: (query) => apiClient.get(`/suppliers/search?q=${query}`).then(res => res.data.data || res.data),

    // Sub-items Ledger & Balance
    getLedger: (id) => apiClient.get(`/suppliers/${id}/ledger`).then(res => res.data.data || res.data),
    getOutstanding: (id) => apiClient.get(`/suppliers/${id}/outstanding`).then(res => res.data.data || res.data),
    getOutstandingList: () => apiClient.get('/suppliers/outstanding/list').then(res => res.data.data || res.data),

    // Purchases, Payments, Returns
    getPurchases: (id) => apiClient.get(`/suppliers/${id}/purchases`).then(res => res.data.data || res.data),
    getPayments: (id) => apiClient.get(`/suppliers/${id}/payments`).then(res => res.data.data || res.data),
    getReturns: (id) => apiClient.get(`/suppliers/${id}/returns`).then(res => res.data.data || res.data),

    // Log Payments
    createPayment: (id, data) => apiClient.post(`/suppliers/${id}/payments`, data).then(res => res.data.data || res.data),
    getPaymentHistory: (id) => apiClient.get(`/suppliers/${id}/payment-history`).then(res => res.data.data || res.data),

    // Addresses
    createAddress: (id, data) => apiClient.post(`/suppliers/${id}/address`, data).then(res => res.data.data || res.data),
    updateAddress: (id, addressId, data) => apiClient.put(`/suppliers/${id}/address/${addressId}`, data).then(res => res.data.data || res.data),

    // Contacts
    createContact: (id, data) => apiClient.post(`/suppliers/${id}/contacts`, data).then(res => res.data.data || res.data),
    getContacts: (id) => apiClient.get(`/suppliers/${id}/contacts`).then(res => res.data.data || res.data),
    updateContact: (id, contactId, data) => apiClient.put(`/suppliers/${id}/contacts/${contactId}`, data).then(res => res.data.data || res.data),
    deleteContact: (id, contactId) => apiClient.delete(`/suppliers/${id}/contacts/${contactId}`).then(res => res.data.data || res.data),

    // Notes
    createNote: (id, data) => apiClient.post(`/suppliers/${id}/notes`, data).then(res => res.data.data || res.data),
    getNotes: (id) => apiClient.get(`/suppliers/${id}/notes`).then(res => res.data.data || res.data),

    // Documents
    createDocument: (id, data) => apiClient.post(`/suppliers/${id}/documents`, data).then(res => res.data.data || res.data),
    getDocuments: (id) => apiClient.get(`/suppliers/${id}/documents`).then(res => res.data.data || res.data),

    // Analytics & Reports
    getAnalytics: (id) => apiClient.get(`/suppliers/${id}/analytics`).then(res => res.data.data || res.data),
    getPurchasesReport: () => apiClient.get('/suppliers/reports/purchases').then(res => res.data.data || res.data),
    getBalanceReport: () => apiClient.get('/suppliers/reports/balance').then(res => res.data.data || res.data),
    getTopSuppliersReport: () => apiClient.get('/suppliers/reports/top-suppliers').then(res => res.data.data || res.data),
    getPaymentsReport: () => apiClient.get('/suppliers/reports/payment').then(res => res.data.data || res.data),

    // Import / Export
    importSuppliers: (data) => apiClient.post('/suppliers/import', data).then(res => res.data.data || res.data),
    exportSuppliers: () => apiClient.get('/suppliers/export').then(res => res.data.data || res.data),

    // History & Timeline
    getHistory: (id) => apiClient.get(`/suppliers/${id}/history`).then(res => res.data.data || res.data),
    getTimeline: (id) => apiClient.get(`/suppliers/${id}/timeline`).then(res => res.data.data || res.data),

    // Actions
    blockSupplier: (id) => apiClient.post(`/suppliers/${id}/block`).then(res => res.data.data || res.data),
    unblockSupplier: (id) => apiClient.post(`/suppliers/${id}/unblock`).then(res => res.data.data || res.data),

    // Dashboard Summary
    getDashboardSummary: () => apiClient.get('/suppliers/dashboard-summary').then(res => res.data.data || res.data)
};

export default suppliersService;
