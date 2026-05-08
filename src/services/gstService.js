import { apiClient } from '../api/client';

/**
 * GST & Tax Service connected to live /gst backend
 */
export const gstService = {
    getInvoices: () => apiClient.get('/gst/invoices').then(res => res.data.data || res.data),
    generateInvoice: (data) => apiClient.post('/gst/einvoice', data).then(res => res.data.data || res.data),
    getEways: () => apiClient.get('/gst/ewaybill/1').then(res => [res.data.data || res.data].filter(Boolean)),
    createEway: (data) => apiClient.post('/gst/ewaybill', data).then(res => res.data.data || res.data),
    getReconciliations: () => apiClient.get('/gst/reconciliation').then(res => res.data.data || res.data),
    runReconciliation: (data) => apiClient.post('/gst/reconciliation/run', data).then(res => res.data.data || res.data)
};

export default gstService;
