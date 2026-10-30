import { apiClient } from '../api/client';

export const budgetsService = {
    getBudgets: async () => await apiClient.get('/budgets').then(res => res.data?.data || res.data || []),
    getBudget: async (id) => await apiClient.get(`/budgets/${id}`).then(res => res.data?.data || res.data),
    createBudget: async (data) => await apiClient.post('/budgets', data).then(res => res.data?.data || res.data),
    updateBudget: async (id, data) => await apiClient.patch(`/budgets/${id}`, data).then(res => res.data?.data || res.data),
    deleteBudget: async (id) => await apiClient.delete(`/budgets/${id}`).then(res => res.data),
};

export default budgetsService;
