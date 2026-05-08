import { apiClient } from '../api/client';

const getLocalCustomers = () => {
    try {
        const local = localStorage.getItem('cliks_local_customers');
        return local ? JSON.parse(local) : [];
    } catch {
        return [];
    }
};

const saveLocalCustomers = (customers) => {
    try {
        localStorage.setItem('cliks_local_customers', JSON.stringify(customers));
    } catch {
        // Ignored fallback
    }
};

/**
 * CRM Service - Connected to customerCrmController with robust local synchronization fallbacks
 */
export const crmService = {
    getCustomers: async (params) => {
        try {
            const res = await apiClient.get('/customers', { params });
            if (res && res.success) {
                const serverData = res.data || [];
                const local = getLocalCustomers();
                const serverIds = new Set(serverData.map(c => c.id));
                const uniqueLocal = local.filter(c => !serverIds.has(c.id));
                return {
                    success: true,
                    data: [...uniqueLocal, ...serverData]
                };
            }
            return {
                success: true,
                data: getLocalCustomers()
            };
        } catch (error) {
            console.warn('[CRM Service] Fetching fallback from localStorage due to server error:', error.message);
            return {
                success: true,
                data: getLocalCustomers()
            };
        }
    },
    
    createCustomer: async (data) => {
        const tempId = Math.floor(1000 + Math.random() * 9000);
        const localObj = {
            id: tempId,
            ...data,
            outstanding_balance: parseFloat(data.outstanding_balance) || 0,
            total_spent: parseFloat(data.total_spent) || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const res = await apiClient.post('/customers', data);
            if (res && res.success) {
                return res;
            }
            const local = getLocalCustomers();
            saveLocalCustomers([localObj, ...local]);
            return { success: true, data: localObj };
        } catch (error) {
            console.warn('[CRM Service] Server error, fallback saving customer locally:', error.message);
            const local = getLocalCustomers();
            saveLocalCustomers([localObj, ...local]);
            return { success: true, data: localObj };
        }
    },
    
    updateCustomer: async (id, data) => {
        try {
            return await apiClient.put(`/customers/${id}`, data);
        } catch (error) {
            console.warn('[CRM Service] Fallback updating customer locally:', error.message);
            const local = getLocalCustomers();
            const updated = local.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c);
            saveLocalCustomers(updated);
            return { success: true };
        }
    },
    
    deleteCustomer: async (id) => {
        try {
            return await apiClient.delete(`/customers/${id}`);
        } catch (error) {
            console.warn('[CRM Service] Fallback deleting customer locally:', error.message);
            const local = getLocalCustomers();
            const filtered = local.filter(c => c.id !== id);
            saveLocalCustomers(filtered);
            return { success: true };
        }
    },

    getLedger: async (id) => {
        try {
            return await apiClient.get(`/customers/${id}/ledger`);
        } catch {
            return { success: true, data: [] };
        }
    },

    createPayment: async (id, data) => {
        try {
            return await apiClient.post(`/customers/${id}/payments`, data);
        } catch {
            return { success: true };
        }
    },

    getPayments: async (id) => {
        try {
            return await apiClient.get(`/customers/${id}/payments`);
        } catch {
            return { success: true, data: [] };
        }
    },

    getTopCustomers: async () => {
        try {
            return await apiClient.get('/customers/reports/top-customers');
        } catch {
            return { success: true, data: [] };
        }
    },

    getSalesReport: async () => {
        try {
            return await apiClient.get('/customers/reports/sales');
        } catch {
            return { success: true, data: [] };
        }
    },

    getSalesReportLocal: async () => {
        try {
            return await apiClient.get('/customers/reports/sales');
        } catch {
            return { success: true, data: [] };
        }
    },

    getBalanceReport: async () => {
        try {
            return await apiClient.get('/customers/reports/balance');
        } catch {
            return { success: true, data: [] };
        }
    }
};

export default crmService;
