import { apiClient } from '../api/client';

/**
 * Settings Service
 * (Usually mapped to profile endpoints)
 */
export const settingsService = {
    getSettings: async () => await apiClient.get('/profile'),
    updateSettings: async (data) => await apiClient.patch('/profile', data),
};

export default settingsService;
