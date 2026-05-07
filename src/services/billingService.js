import { apiClient } from '../api/client';

export const billingService = {
  getInvoices: () => apiClient.get('/billing').then(res => res.data.data || res.data),
  createInvoice: (data) => apiClient.post('/billing', data).then(res => res.data.data || res.data),
  updateInvoice: (id, data) => apiClient.patch(`/billing/${id}`, data).then(res => res.data.data || res.data),
  deleteInvoice: (id) => apiClient.delete(`/billing/${id}`).then(res => res.data.data || res.data),
};
