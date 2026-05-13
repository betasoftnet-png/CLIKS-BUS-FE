import { apiClient } from '../api/client';

/**
 * GST & Tax Service connected to live /gst backend
 */
export const gstService = {
    getSettings: () => apiClient.get('/gst/settings').then(res => res.data.data || res.data),
    getInvoices: () => apiClient.get('/gst/invoices').then(res => res.data.data || res.data),
    generateInvoice: (data) => apiClient.post('/gst/einvoice', data).then(res => res.data.data || res.data),
    getEways: () => apiClient.get('/gst/ewaybill').then(res => res.data.data || res.data || []),
    createEway: (data) => apiClient.post('/gst/ewaybill', data).then(res => res.data.data || res.data),
    getReconciliations: () => apiClient.get('/gst/reconciliation').then(res => res.data.data || res.data),
    runReconciliation: (data) => apiClient.post('/gst/reconciliation/run', data).then(res => res.data.data || res.data),
    deleteInvoice: (id) => apiClient.delete(`/gst/invoices/${id}`).then(res => res.data.data || res.data)
};

export default gstService;
