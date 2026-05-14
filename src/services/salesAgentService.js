import { apiClient } from '../api/client';

export const salesAgentService = {
    /**
     * Custom Auth handler for platform marketing representatives.
     */
    login: async (email, password) => {
        const res = await apiClient.post('/sales-agent/login', { email, password });
        if (res.data && res.data.data && res.data.data.accessToken) {
            localStorage.setItem('cliks_auth_token', res.data.data.accessToken);
            localStorage.setItem('cliks_user_profile', JSON.stringify(res.data.data.user));
        }
        return res.data;
    },

    /**
     * Fetch prospects assigned exclusively to this agent.
     */
    getLeads: async () => {
        const res = await apiClient.get('/sales-agent/leads');
        return res.data;
    },

    /**
     * Push new acquisition vector to agent's pipeline.
     */
    createLead: async (data) => {
        const res = await apiClient.post('/sales-agent/leads', data);
        return res.data;
    },

    /**
     * Update lead coordinates, notes, or conversion flags.
     */
    updateLead: async (id, data) => {
        const res = await apiClient.patch(`/sales-agent/leads/${id}`, data);
        return res.data;
    },

    /**
     * Real-time agent stats grid.
     */
    getStats: async () => {
        const res = await apiClient.get('/sales-agent/stats');
        return res.data;
    }
};

export default salesAgentService;
