import { apiClient } from '../api/client';

/**
 * Payment Service
 */
export const paymentService = {
    // Record a new payment (incoming or outgoing)
    receivePayment: async (data) => await apiClient.post('/payments/receive', data).then(res => res.data.data || res.data),
    
    paySupplier: async (data) => await apiClient.post('/payments/pay', data).then(res => res.data.data || res.data),

    // Get unified reports data containing receivables, payables, accounts
    getReports: async () => await apiClient.get('/payments/reports').then(res => res.data.data || res.data),
    
    // Get stats
    getPaymentStats: async () => await apiClient.get('/payments/outstanding').then(res => res.data.data || res.data),
};

export default paymentService;
