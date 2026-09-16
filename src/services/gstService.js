import { apiClient } from '../api/client';

/**
 * GST & Tax Service connected to live /gst backend
 */
export const gstService = {
    getSettings: () => apiClient.get('/gst/settings').then(res => res.data.data || res.data),
    getInvoices: () => apiClient.get('/compliance/invoices').then(res => res.data?.data || res.data?.results?.invoices || res.data || []).catch(() => apiClient.get('/gst/invoices').then(res => res.data?.data || res.data || [])),
    generateInvoice: (data) => apiClient.post('/compliance/generate-einvoice', data).catch((err) => {
        if (err.response?.status >= 400 && (err.response?.data?.errorMessage || err.response?.data?.message)) {
            throw err;
        }
        return apiClient.post('/gst/einvoice', data);
    }).then(res => res.data.data || res.data),
    getEways: () => apiClient.get('/compliance/ewaybills').then(res => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.results?.ewayBills)) return res.results.ewayBills;
        if (Array.isArray(res?.results?.message)) return res.results.message;
        return [];
    }).catch(() => apiClient.get('/gst/ewaybill').then(res => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        return [];
    })),
    createEway: (data) => apiClient.post('/compliance/generate-ewaybill', data).catch(() => apiClient.post('/gst/ewaybill', data)).then(res => res.data?.data || res.data),

    getReconciliations: () => apiClient.get('/gst/reconciliation').then(res => res.data.data || res.data),
    runReconciliation: (data) => apiClient.post('/gst/reconciliation/run', data).then(res => res.data.data || res.data),
    deleteInvoice: (id) => apiClient.delete(`/gst/invoices/${id}`).then(res => res.data.data || res.data),
    getGSTR3B: () => apiClient.get('/gst/reports/gstr3b').then(res => res.data.data || res.data),
    getGSTR9: (fy) => apiClient.get('/gst/reports/gstr9', { params: { fy } }).then(res => res.data.data || res.data)
};

export default gstService;
