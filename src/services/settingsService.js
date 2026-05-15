import { apiClient } from '../api/client';

/**
 * Settings Service
 * (Usually mapped to profile endpoints)
 */
export const settingsService = {
    getSettings: async () => await apiClient.get('/settings'),
    updateSettings: async (data) => await apiClient.patch('/settings', data),
};

export default settingsService;
