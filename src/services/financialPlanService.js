import { apiClient } from '../api/client';

export const financialPlanService = {
    getPlans: async () => await apiClient.get('/plans').then(res => res.data),
    getPlan: async (id) => await apiClient.get(`/plans/${id}`).then(res => res.data),
    createPlan: async (data) => await apiClient.post('/plans', data).then(res => res.data),
    updatePlan: async (id, data) => await apiClient.patch(`/plans/${id}`, data).then(res => res.data),
    deletePlan: async (id) => await apiClient.delete(`/plans/${id}`).then(res => res.data),
    getPlanGoals: async (planId) => await apiClient.get(`/plans/${planId}/goals`).then(res => res.data),
    createPlanGoal: async (planId, data) => await apiClient.post(`/plans/${planId}/goals`, data).then(res => res.data),
    updatePlanGoal: async (planId, id, data) => await apiClient.patch(`/plans/${planId}/goals/${id}`, data).then(res => res.data),
    deletePlanGoal: async (planId, id) => await apiClient.delete(`/plans/${planId}/goals/${id}`).then(res => res.data),
};

export default financialPlanService;
