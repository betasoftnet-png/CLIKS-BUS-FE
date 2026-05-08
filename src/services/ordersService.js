import { apiClient } from '../api/client';

/**
 * Orders Service - Connected to orderController in CLIKS-BE
 */
export const ordersService = {
    getOrders: async (params) => await apiClient.get('/orders', { params }),
    
    createOrder: async (data) => await apiClient.post('/orders', data),
    
    updateOrder: async (id, data) => await apiClient.put(`/orders/${id}`, data),
    
    deleteOrder: async (id) => await apiClient.delete(`/orders/${id}`),

    searchOrders: async (query) => await apiClient.get(`/orders/search?q=${query}`),

    addOrderItem: async (id, data) => await apiClient.post(`/orders/${id}/items`, data),

    updateOrderItem: async (id, itemId, data) => await apiClient.put(`/orders/${id}/items/${itemId}`, data),

    deleteOrderItem: async (id, itemId) => await apiClient.delete(`/orders/${id}/items/${itemId}`),

    updateOrderStatus: async (id, status) => await apiClient.patch(`/orders/${id}/status`, { status }),

    convertToInvoice: async (id) => await apiClient.post(`/orders/${id}/convert-to-invoice`),

    createOrderNote: async (id, data) => await apiClient.post(`/orders/${id}/notes`, data),

    getOrderNotes: async (id) => await apiClient.get(`/orders/${id}/notes`),

    createOrderDocument: async (id, data) => await apiClient.post(`/orders/${id}/documents`, data),

    getOrderDocuments: async (id) => await apiClient.get(`/orders/${id}/documents`),

    getSalesReport: async () => await apiClient.get('/orders/reports/sales'),

    getStatusReport: async () => await apiClient.get('/orders/reports/status'),

    getPendingReport: async () => await apiClient.get('/orders/reports/pending'),

    getCompletedReport: async () => await apiClient.get('/orders/reports/completed'),

    getOrderAnalytics: async (id) => await apiClient.get(`/orders/${id}/analytics`)
};

export default ordersService;
