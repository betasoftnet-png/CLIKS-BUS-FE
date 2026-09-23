import { apiClient } from '../api/client';

/**
 * Payment Service
 */
export const paymentService = {
    // Record a new payment (incoming or outgoing)
    receivePayment: async (data) => {
        try {
            return await apiClient.post('/payments/customer-receipts', data).then(res => res.data?.data || res.data);
        } catch (err) {
            return await apiClient.post('/payments/receive', data).then(res => res.data?.data || res.data);
        }
    },
    
    paySupplier: async (data) => {
        const res = await apiClient.post('/payments/pay', data);
        const result = res?.data?.data || res?.data || res;
        if (result && typeof result === 'object') {
            if (result.status === undefined) result.status = res?.status || 201;
            result.statusCode = res?.statusCode || res?.status || 201;
            result.success = res?.success ?? true;
        }
        return result;
    },

    transferVault: async (data) => await apiClient.post('/payments/transfer', data).then(res => res.data.data || res.data),

    // Get unified reports data containing receivables, payables, accounts
    getReports: async () => await apiClient.get('/payments/reports').then(res => res.data.data || res.data),
    
    // Get stats
    getPaymentStats: async () => await apiClient.get('/payments/outstanding').then(res => res.data.data || res.data),
};

export default paymentService;
