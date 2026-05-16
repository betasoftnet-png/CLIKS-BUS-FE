import { apiClient } from '../api/client';

export const plannedPaymentsService = {
    getPayments: async (params) => await apiClient.get('/planned-payments', { params }).then(res => res.data.data || res.data),
    getPayment: async (id) => await apiClient.get(`/planned-payments/${id}`).then(res => res.data.data || res.data),
    createPayment: async (data) => await apiClient.post('/planned-payments', data).then(res => res.data.data || res.data),
    updatePayment: async (id, data) => await apiClient.patch(`/planned-payments/${id}`, data).then(res => res.data.data || res.data),
    markAsPaid: async (id) => await apiClient.patch(`/planned-payments/${id}/paid`).then(res => res.data.data || res.data),
    deletePayment: async (id) => await apiClient.delete(`/planned-payments/${id}`).then(res => res.data.data || res.data)
};

export default plannedPaymentsService;
