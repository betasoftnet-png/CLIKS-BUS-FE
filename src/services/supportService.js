import { apiClient } from '../api/client';

export const supportService = {
    // ── 1. SUPPORT AGENT LOGIN ─────────────────────────────────────────────
    supportAgentLogin: async (email, password) => {
        const res = await apiClient.post('/support-agent/login', { email, password });
        return res.data;
    },

    // ── 2. ADMIN PROVISIONING OF SUPPORT ROSTER ─────────────────────────────
    getSupportAgents: async () => {
        const res = await apiClient.get('/admin/support/agents');
        return res.data;
    },

    createSupportAgent: async (data) => {
        const res = await apiClient.post('/admin/support/agents', data);
        return res.data;
    },

    toggleSupportAgent: async (id) => {
        const res = await apiClient.patch(`/admin/support/agents/${id}/toggle`);
        return res.data;
    },

    getEscalatedTickets: async () => {
        const res = await apiClient.get('/admin/support/tickets');
        return res.data;
    },

    resolveEscalatedTicket: async (id, resolutionNotes) => {
        const res = await apiClient.patch(`/admin/support/tickets/${id}/resolve`, { resolution_notes: resolutionNotes });
        return res.data;
    },

    // ── 3. USER TICKETS (FAQ SECTION) ──────────────────────────────────────
    getUserTickets: async () => {
        const res = await apiClient.get('/support/tickets');
        return res.data;
    },

    createUserTicket: async (data) => {
        const res = await apiClient.post('/support/tickets', data);
        return res.data;
    },

    // ── 4. SUPPORT AGENT WORKSPACE ACTIONS ─────────────────────────────────
    getAgentTickets: async () => {
        const res = await apiClient.get('/support-agent/tickets');
        return res.data;
    },

    claimTicket: async (id) => {
        const res = await apiClient.patch(`/support-agent/tickets/${id}/claim`);
        return res.data;
    },

    respondTicket: async (id, status, resolutionNotes) => {
        const res = await apiClient.patch(`/support-agent/tickets/${id}/respond`, {
            status,
            resolution_notes: resolutionNotes
        });
        return res.data;
    },

    escalateTicket: async (id, adminNote) => {
        const res = await apiClient.patch(`/support-agent/tickets/${id}/escalate`, {
            admin_note: adminNote
        });
        return res.data;
    }
};

export default supportService;
