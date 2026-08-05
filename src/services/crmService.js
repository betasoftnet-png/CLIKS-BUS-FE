import { apiClient } from '../api/client';

/**
 * CRM Service - Connected to backend customers DB API with 100% database persistence.
 */
export const crmService = {
    getCustomers: async (params) => {
        try {
            const res = await apiClient.get('/customers', { params });
            const raw = res.data?.data ?? res.data;
            if (Array.isArray(raw)) return raw;
            if (raw?.customers && Array.isArray(raw.customers)) return raw.customers;
            if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
            if (raw?.items && Array.isArray(raw.items)) return raw.items;
            if (raw?.data && Array.isArray(raw.data)) return raw.data;
            return [];
        } catch (error) {
            console.error('[CRM Service Error]', error.message);
            return [];
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
