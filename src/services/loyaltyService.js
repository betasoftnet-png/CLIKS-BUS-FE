import { apiClient } from '../api/client';

/**
 * Loyalty Program Service
 * Communicates with CLIKS-BE /loyalty endpoints
 */
export const loyaltyService = {
    getProgramSettings: async () => {
        const res = await apiClient.get('/loyalty/program-settings');
        return res?.data?.data ?? res?.data ?? res;
    },
    updateProgramSettings: async (payload) => {
        const res = await apiClient.patch('/loyalty/program-settings', payload);
        return res?.data?.data ?? res?.data ?? res;
    },
    getLoyaltyStats: async () => {
        const res = await apiClient.get('/loyalty/stats');
        return res?.data?.data ?? res?.data ?? res;
    },
    getLoyaltyCustomers: async (params = {}) => {
        const res = await apiClient.get('/loyalty/customers', { params });
        return res?.data?.data ?? res?.data ?? res;
    },
    adjustCustomerPoints: async (customerId, payload) => {
        const res = await apiClient.post(`/loyalty/customers/${customerId}/adjust`, payload);
        return res?.data?.data ?? res?.data ?? res;
    },
    getLoyaltyTransactions: async (params = {}) => {
        const res = await apiClient.get('/loyalty/transactions', { params });
        return res?.data?.data ?? res?.data ?? res;
    }
};

export default loyaltyService;
