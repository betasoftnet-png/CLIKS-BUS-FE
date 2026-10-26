import { apiClient } from '../api/client';

export const posService = {
    checkout: async (data) => {
        try {
            const res = await apiClient.post('/pos/checkout', data);
            return res.data?.data || res.data;
        } catch (error) {
            console.error('[POS Service] Checkout error:', error);
            throw error;
        }
    },

    getTodaySummary: async () => {
        try {
            const res = await apiClient.get('/pos/today-summary');
            return res.data?.data || res.data || {
                total_orders: 0,
                total_sales: 0,
                cash_sales: 0,
                upi_sales: 0,
                card_sales: 0
            };
        } catch (error) {
            console.error('[POS Service] Fetching today summary error:', error);
            return {
                total_orders: 0,
                total_sales: 0,
                cash_sales: 0,
                upi_sales: 0,
                card_sales: 0
            };
        }
    },

    getOrders: async (params = {}) => {
        try {
            const res = await apiClient.get('/pos/orders', { params });
            return res.data?.data || res.data || [];
        } catch (error) {
            console.error('[POS Service] Fetching orders error:', error);
            return [];
        }
    },

    getPosSession: async () => {
        try {
            const res = await apiClient.get('/pos/session');
            return res.data?.data || null;
        } catch (error) {
            console.error('[POS Service] Fetching POS session error:', error);
            return null;
        }
    },

    savePosSession: async (sessionData) => {
        try {
            const res = await apiClient.post('/pos/session', { session_data: sessionData });
            return res.data?.data || null;
        } catch (error) {
            console.error('[POS Service] Saving POS session error:', error);
            return null;
        }
    },

    clearPosSession: async () => {
        try {
            const res = await apiClient.delete('/pos/session');
            return res.data?.data || null;
        } catch (error) {
            console.error('[POS Service] Clearing POS session error:', error);
            return null;
        }
    },

    getHeldCarts: async () => {
        try {
            const res = await apiClient.get('/pos/held-carts');
            return res.data?.data || [];
        } catch (error) {
            console.error('[POS Service] Fetching held carts error:', error);
            return [];
        }
    },

    saveHeldCarts: async (heldCarts) => {
        try {
            const res = await apiClient.post('/pos/held-carts', { held_carts: heldCarts });
            return res.data?.data || [];
        } catch (error) {
            console.error('[POS Service] Saving held carts error:', error);
            return [];
        }
    },

    deleteHeldCart: async (id) => {
        try {
            const res = await apiClient.delete(`/pos/held-carts/${id}`);
            return res.data?.data || null;
        } catch (error) {
            console.error('[POS Service] Deleting held cart error:', error);
            return null;
        }
    }
};

export default posService;

