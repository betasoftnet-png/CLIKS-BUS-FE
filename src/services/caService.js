import { apiClient } from '../api/client';

/**
 * CA AI auditing & compliance service connected directly to the live backend
 */
export const caService = {
    runComplianceScan: () => apiClient.post('/ca/compliance-scan').then(res => res.data.data || res.data),
    getScanHistory: () => apiClient.get('/ca/scans').then(res => res.data.data || res.data),
    applyCrossBorderAudit: (standard) => apiClient.post('/ca/cross-border-audit', { standard }).then(res => res.data.data || res.data),
    
    // CA Connection System
    sendInvitation: (email) => apiClient.post('/ca/invitations', { email }).then(res => res.data.data || res.data),
    getOutgoingInvitations: () => apiClient.get('/ca/invitations/outgoing').then(res => res.data.data || res.data),
    getIncomingInvitations: () => apiClient.get('/ca/invitations/incoming').then(res => res.data.data || res.data),
    acceptInvitation: (id) => apiClient.post(`/ca/invitations/${id}/accept`).then(res => res.data.data || res.data),
    revokeInvitation: (id) => apiClient.delete(`/ca/invitations/${id}`).then(res => res.data.data || res.data),

    // Practice Workspace Management
    getClients: () => apiClient.get('/ca/clients').then(res => res.data.data || res.data),
    addClient: (client) => apiClient.post('/ca/clients', client).then(res => res.data.data || res.data),

    getRequests: () => apiClient.get('/ca/requests').then(res => res.data.data || res.data),
    addRequest: (req) => apiClient.post('/ca/requests', req).then(res => res.data.data || res.data),
    uploadRequestDoc: (id) => apiClient.post(`/ca/requests/${id}/upload`).then(res => res.data.data || res.data),
    approveRequestDoc: (id) => apiClient.post(`/ca/requests/${id}/approve`).then(res => res.data.data || res.data),

    getTasks: () => apiClient.get('/ca/tasks').then(res => res.data.data || res.data),
    addTask: (task) => apiClient.post('/ca/tasks', task).then(res => res.data.data || res.data),
    toggleTaskStatus: (id) => apiClient.post(`/ca/tasks/${id}/toggle`).then(res => res.data.data || res.data),
    uploadTaskDoc: (id) => apiClient.post(`/ca/tasks/${id}/upload`).then(res => res.data.data || res.data),

    getTimesheets: () => apiClient.get('/ca/timesheets').then(res => res.data.data || res.data),
    addTimesheet: (session) => apiClient.post('/ca/timesheets', session).then(res => res.data.data || res.data),

    getFolders: () => apiClient.get('/ca/documents/folders').then(res => res.data.data || res.data),
    getFiles: () => apiClient.get('/ca/documents/files').then(res => res.data.data || res.data),
    addFile: (file) => apiClient.post('/ca/documents/files', file).then(res => res.data.data || res.data),
    deleteFile: (id) => apiClient.delete(`/ca/documents/files/${id}`).then(res => res.data.data || res.data)
};

export default caService;
