import { apiClient } from '../api/client';

export const marketingService = {
    getCampaigns: async () => {
        try {
            const res = await apiClient.get('/marketing');
            return res.data || [];
        } catch (error) {
            console.error('[Marketing Service] Fetch Error:', error.message);
            return [];
        }
    },

    createCampaign: async (data) => {
        try {
            return await apiClient.post('/marketing', data);
        } catch (error) {
            console.error('[Marketing Service] Create Error:', error.message);
            throw error;
        }
    },

    updateCampaign: async (id, data) => {
        try {
            return await apiClient.put(`/marketing/${id}`, data);
        } catch (error) {
            console.error('[Marketing Service] Update Error:', error.message);
            throw error;
        }
    },

    deleteCampaign: async (id) => {
        try {
            return await apiClient.delete(`/marketing/${id}`);
        } catch (error) {
            console.error('[Marketing Service] Delete Error:', error.message);
            throw error;
        }
    }
};

export default marketingService;
