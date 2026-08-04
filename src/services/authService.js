import { apiClient } from '../api/client';

/**
 * Authentication Service
 */
export const authService = {
    /**
     * SSO Login using BNX Token
     */
    ssoLogin: async (bnxToken, appType = null) => {
        const res = await apiClient.post('/auth/sso', { bnxToken, appType });
        return res.data;
    },

    /**
     * Get current user profile
     */
    /**
     * Update presence status
     */
    heartbeat: async () => {
        const res = await apiClient.get('/auth/heartbeat');
        return res.data;
    }
};

export default authService;
