import { apiClient } from '../api/client';

/**
 * Authentication Service
 */
export const authService = {
    /**
     * SSO Login using BNX Token
     */
    ssoLogin: async (bnxToken, appType = null) => {
        try {
            const res = await apiClient.post('/auth/sso', { bnxToken, appType });
            return res.data || res;
        } catch (err) {
            // Fallback for Nginx 405 Method Not Allowed
            if (err.status === 405 || err.statusCode === 405 || String(err.message).includes('405')) {
                try {
                    const res2 = await apiClient.get('/auth/sso', { params: { bnxToken, appType } });
                    return res2.data || res2;
                } catch (err2) {
                    const res3 = await apiClient.post('/auth/sso-login', { bnxToken, appType });
                    return res3.data || res3;
                }
            }
            throw err;
        }
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
