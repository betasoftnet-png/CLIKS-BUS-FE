import { apiClient } from '../api/client';

/**
 * Admin Service
 * Interface for global multi-tenant platform management
 */
export const adminService = {
    // Platform Admin Native Login (Isolated DB / No SSO)
    adminLogin: async (email, password) => {
        const res = await apiClient.post('/admin/auth/login', { email, password });
        return res.data;
    },

    // Users
    getUsers: async (page = 1, limit = 20) => {
        const res = await apiClient.get('/admin/users', { params: { page, limit } });
        return res.data;
    },
    deleteUser: async (userId) => {
        await apiClient.delete(`/admin/users/${userId}`);
        return true;
    },
    updateUserRole: async (userId, role) => {
        const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
        return res.data;
    },

    // Public Feed Moderation
    getPublicPosts: async () => {
        const res = await apiClient.get('/admin/public');
        return res.data;
    },
    deletePublicPost: async (postId) => {
        await apiClient.delete(`/admin/public/${postId}`);
        return true;
    },

    // Platform Telemetry & Auditing
    getSystemStats: async () => {
        const res = await apiClient.get('/admin/stats');
        return res.data;
    },
    getAuditLogs: async () => {
        const res = await apiClient.get('/admin/logs');
        return res.data;
    }
};

export default adminService;
