import { apiClient } from '../api/client';

export const calculatorService = {
  getHistory: async () => await apiClient.get('/calculator/history').then(res => res.data.data || res.data),
  saveHistory: async (data) => await apiClient.post('/calculator/history', data).then(res => res.data.data || res.data),
  deleteHistoryItem: async (id) => await apiClient.delete(`/calculator/history/${id}`).then(res => res.data.data || res.data),
  clearHistory: async () => await apiClient.delete('/calculator/history').then(res => res.data.data || res.data)
};

export default calculatorService;
