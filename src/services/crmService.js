import { apiClient } from '../api/client';

/**
 * CRM Service
 */
export const crmService = {
    // Customers
    getCustomers: async () => await apiClient.get('/crm/customers'),
    
    createCustomer: async (data) => await apiClient.post('/crm/customers', data),
    
    updateCustomer: async (id, data) => await apiClient.patch(`/crm/customers/${id}`, data),
    
    deleteCustomer: async (id) => await apiClient.delete(`/crm/customers/${id}`),
};

export default crmService;
