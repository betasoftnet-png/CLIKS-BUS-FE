import { apiClient } from '../api/client';

/**
 * Profile Service
 */
export const profileService = {
    getProfile: async () => {
        const res = await apiClient.get('/profile');
        return res.data;
    },
    updateProfile: async (data) => {
        const res = await apiClient.patch('/profile', data);
        return res.data;
    },
    changePassword: async (data) => {
        const res = await apiClient.post('/profile/change-password', data);
        return res.data;
    },
};

export default profileService;
