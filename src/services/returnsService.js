import { apiClient } from '../api/client';

const getLocalReturns = () => {
    try {
        const local = localStorage.getItem('cliks_local_returns');
        return local ? JSON.parse(local) : [];
    } catch {
        return [];
    }
};

const saveLocalReturns = (returns) => {
    try {
        localStorage.setItem('cliks_local_returns', JSON.stringify(returns));
    } catch {
        // Ignored
    }
};

export const returnsService = {
    // CRUD Operations (QueryFunctionContext safe)
    getReturns: async (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        try {
            const res = await apiClient.get('/returns', { params: cleanParams });
            const rawData = res.data?.data ?? res.data;
            let serverData = [];
            if (Array.isArray(rawData)) {
                serverData = rawData;
            } else if (rawData?.returns && Array.isArray(rawData.returns)) {
                serverData = rawData.returns;
            } else if (rawData?.rows && Array.isArray(rawData.rows)) {
                serverData = rawData.rows;
            } else if (rawData?.items && Array.isArray(rawData.items)) {
                serverData = rawData.items;
            } else if (rawData?.data && Array.isArray(rawData.data)) {
                serverData = rawData.data;
            }
            const local = getLocalReturns();
            const safeLocal = Array.isArray(local) ? local : [];
            const serverIds = new Set((Array.isArray(serverData) ? serverData : []).map(r => r?.id?.toString()).filter(Boolean));
            const uniqueLocal = (Array.isArray(safeLocal) ? safeLocal : []).filter(r => !serverIds.has(r?.id?.toString()));
            return [...uniqueLocal, ...(Array.isArray(serverData) ? serverData : [])];
        } catch (error) {
            console.warn('[ReturnsService] Fallback to local storage returns due to connection issue.', error);
            const local = getLocalReturns();
            return Array.isArray(local) ? local : [];
        }
    },

    createReturn: async (data) => {
        try {
            const payload = {
                return_date: new Date().toISOString(),
                ...data
            };
            const res = await apiClient.post('/returns', payload);
            return res.data?.data || res.data;
        } catch (error) {
            console.warn('[ReturnsService] Saving return to local storage fallback due to connection issue.', error.message);
            const newReturn = {
                id: Date.now(),
                return_number: `RET-${Date.now().toString().slice(-6)}`,
                created_at: new Date().toISOString(),
                return_date: new Date().toISOString(),
                ...data
            };
            const currentLocal = getLocalReturns();
            const safeLocal = Array.isArray(currentLocal) ? currentLocal : [];
            const updated = [newReturn, ...safeLocal];
            saveLocalReturns(updated);
            return newReturn;
        }
    },

    updateReturn: async (id, data) => {
        try {
            const res = await apiClient.put(`/returns/${id}`, data);
            return res.data?.data || res.data;
        } catch (error) {
            console.warn('[ReturnsService] Local fallback updateReturn:', error.message);
            const local = getLocalReturns();
            const safeLocal = Array.isArray(local) ? local : [];
            const updated = safeLocal.map(r => {
                if (r.id?.toString() === id?.toString()) {
                    return { ...r, ...data };
                }
                return r;
            });
            saveLocalReturns(updated);
            return { id, ...data };
        }
    },

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
