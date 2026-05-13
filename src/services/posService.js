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
    }
};

export default posService;
