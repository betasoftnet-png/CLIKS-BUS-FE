import { apiClient } from '../api/client';

/**
 * CRM Service - Connected to backend customers DB API with 100% database persistence.
 */
export const crmService = {
    getCustomers: async (params) => {
        try {
            const res = await apiClient.get('/customers', { params });
            return res;
        } catch (error) {
            console.error('[CRM Service Error]', error.message);
            throw error;
        }
    },
    
    createCustomer: async (data) => {
        try {
            const res = await apiClient.post('/customers', data);
            return res;
        } catch (error) {
            console.error('[CRM Service Create Error]', error.message);
            throw error;
        }
    },

    updateCustomer: async (id, data) => {
        try {
            const res = await apiClient.patch(`/customers/${id}`, data);
            return res;
        } catch (error) {
            console.error('[CRM Service Update Error]', error.message);
            throw error;
        }
    },

    deleteCustomer: async (id) => {
        try {
            const res = await apiClient.delete(`/customers/${id}`);
            return res;
        } catch (error) {
            console.error('[CRM Service Delete Error]', error.message);
            throw error;
        }
    }
};

export default crmService;
