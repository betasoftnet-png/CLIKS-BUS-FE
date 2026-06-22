import { apiClient } from '../api/client';

export const businessWalletService = {
    // Fetch the main business wallet and its transactions
    getWallet: async () => {
        const res = await apiClient.get('/business-wallet');
        return res.data;
    },

    // Add money to the wallet (called after successful payment gateway)
    addMoney: async ({ amount, description, transaction_ref }) => {
        const res = await apiClient.post('/business-wallet/add', { amount, description, transaction_ref });
        return res.data;
    },

    // Convert reward points into wallet balance
    convertPoints: async ({ points, conversionRate }) => {
        const res = await apiClient.post('/business-wallet/convert-points', { points, conversionRate });
        return res.data;
    }
};

export default businessWalletService;
