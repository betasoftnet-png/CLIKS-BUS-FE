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
     * Standard Credential Login
     */
    login: async (identifier, password) => {
        const res = await apiClient.post('/auth/login', { identifier, password });
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
