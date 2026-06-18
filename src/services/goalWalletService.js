import { apiClient } from '../api/client';

/**
 * Goal/Purpose Segregated Wallets Service
 */
export const goalWalletService = {
    // Fetch all wallets for the business
    getWallets: async (params) => await apiClient.get('/goal-wallets', { params }).then(res => res.data.data || res.data),
    
    // Get detailed single wallet info
    getWallet: async (id) => await apiClient.get(`/goal-wallets/${id}`).then(res => res.data.data || res.data),
    
    // Create a new segregated wallet
    createWallet: async (data) => await apiClient.post('/goal-wallets', data).then(res => res.data.data || res.data),
    
    // Add funds into a wallet
    addMoney: async (id, amount) => await apiClient.post(`/goal-wallets/${id}/add-money`, { amount }).then(res => res.data.data || res.data),
    
    // Claim/Close out the wallet
    claimWallet: async (id) => await apiClient.post(`/goal-wallets/${id}/claim`).then(res => res.data.data || res.data),
    
    // Delete wallet
    deleteWallet: async (id) => await apiClient.delete(`/goal-wallets/${id}`).then(res => res ? (res.data?.data || res.data || res) : null),

    // Update wallet
    updateWallet: async (id, data) => await apiClient.patch(`/goal-wallets/${id}`, data).then(res => res.data.data || res.data),
};

export default goalWalletService;
