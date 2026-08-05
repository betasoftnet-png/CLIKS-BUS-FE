import api from './api';

export const customerService = {
    getCustomers: async (params = {}) => {
        const response = await api.get('/customers', { params });
        const raw = response.data?.data ?? response.data;
        if (Array.isArray(raw)) return raw;
        if (raw?.customers && Array.isArray(raw.customers)) return raw.customers;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
    },
    getCustomerById: async (id) => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },
    createCustomer: async (customerData) => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },
    updateCustomer: async (id, customerData) => {
        const response = await api.put(`/customers/${id}`, customerData);
        return response.data;
    },
    deleteCustomer: async (id) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    }
};

export default customerService;
