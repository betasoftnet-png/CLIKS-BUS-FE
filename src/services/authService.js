import { apiClient } from '../api/client';

/**
 * Authentication Service
 */
export const authService = {
    /**
     * SSO Login using BNX Token
     */
    ssoLogin: async (bnxToken) => {
        const res = await apiClient.post('/auth/sso', { bnxToken });
        return res.data;
    },

    /**
     * Get current user profile
     */
    getProfile: async () => {
        const res = await apiClient.get('/profile');
        return res.data;
    }
};

export default authService;
