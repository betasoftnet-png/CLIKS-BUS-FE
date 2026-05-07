import { apiClient } from '../api/client';

/**
 * Payment Service
 */
export const paymentService = {
    // Record a new payment (incoming or outgoing)
    recordPayment: async (data) => await apiClient.post('/crm/payments', data),
    
    // Get all payments
    getPayments: async () => await apiClient.get('/crm/payments'),
    
    // Get ledger for a specific customer/supplier
    getLedger: async (partyId) => await apiClient.get(`/crm/ledger/${partyId}`),
    
    // Get stats
    getPaymentStats: async () => await apiClient.get('/crm/payments/stats'),
};

export default paymentService;
