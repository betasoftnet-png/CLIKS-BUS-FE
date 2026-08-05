import api from './api';

export const auditLogService = {
    getAuditLogs: async (params = {}) => {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    }
};

export default auditLogService;
