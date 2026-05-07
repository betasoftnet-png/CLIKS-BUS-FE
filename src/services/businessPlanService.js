import { apiClient } from '../api/client';

export const businessPlanService = {
    getPlans: async () => {
        const response = await apiClient.get('/business-plans');
        return response.data;
    },
    createPlan: async (planData) => {
        const response = await apiClient.post('/business-plans', planData);
        return response.data;
    },
    deletePlan: async (id) => {
        const response = await apiClient.delete(`/business-plans/${id}`);
        return response.data;
    },
    getPlanItems: async (planId) => {
        const response = await apiClient.get(`/business-plans/${planId}/items`);
        return response.data;
    },
    addPlanItem: async (planId, itemData) => {
        const response = await apiClient.post(`/business-plans/${planId}/items`, itemData);
        return response.data;
    }
};

export default businessPlanService;
