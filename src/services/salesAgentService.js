import { apiClient } from '../api/client';

export const salesAgentService = {
    /**
     * Custom Auth handler for platform marketing representatives.
     */
    login: async (email, password) => {
        const res = await apiClient.post('/sales-agent/login', { email, password });
        
        // If login is successful, save token to standard books_auth_token for API Client Injection
        if (res && res.success && res.data && res.data.accessToken) {
            localStorage.setItem('books_auth_token', res.data.accessToken);
            localStorage.setItem('cliks_user_profile', JSON.stringify(res.data.user));
        }
        return res;
    },

    /**
     * Fetch prospects assigned exclusively to this agent.
     */
    getLeads: async () => {
        const res = await apiClient.get('/sales-agent/leads');
        return res;
    },

    /**
     * Push new acquisition vector to agent's pipeline.
     */
    createLead: async (data) => {
        const res = await apiClient.post('/sales-agent/leads', data);
        return res;
    },

    /**
     * Update lead coordinates, notes, or conversion flags.
     */
    updateLead: async (id, data) => {
        const res = await apiClient.patch(`/sales-agent/leads/${id}`, data);
        return res;
    },

    /**
     * Real-time agent stats grid.
     */
    getStats: async () => {
        const res = await apiClient.get('/sales-agent/stats');
        return res;
    }
};

export default salesAgentService;

