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

    launchCampaign: async (id) => {
        try {
            return await apiClient.post(`/marketing/${id}/launch`);
        } catch (error) {
            console.error('[Marketing Service] Launch Error:', error.message);
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
    },

    getTemplates: async () => {
        try {
            const res = await apiClient.get('/marketing/templates');
            return res.data || [];
        } catch (error) {
            console.error('[Marketing Service] Fetch Templates Error:', error.message);
            return [];
        }
    },

    createTemplate: async (data) => {
        try {
            const res = await apiClient.post('/marketing/templates', data);
            return res.data;
        } catch (error) {
            console.error('[Marketing Service] Create Template Error:', error.message);
            throw error;
        }
    },

    updateTemplate: async (id, data) => {
        try {
            const res = await apiClient.put(`/marketing/templates/${id}`, data);
            return res.data;
        } catch (error) {
            console.error('[Marketing Service] Update Template Error:', error.message);
            throw error;
        }
    },

    deleteTemplate: async (id) => {
        try {
            const res = await apiClient.delete(`/marketing/templates/${id}`);
            return res.data;
        } catch (error) {
            console.error('[Marketing Service] Delete Template Error:', error.message);
            throw error;
        }
    }
};

export default marketingService;
