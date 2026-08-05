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
    getClientDocuments: (clientId) => apiClient.get(`/ca/clients/${clientId}/documents`).then(res => res.data.data || res.data),
    getPhaseDocument: (clientId, phase) => apiClient.get(`/ca/clients/${clientId}/phase-document`, { params: { phase } }).then(res => res.data.data || res.data),
    uploadClientPhaseDoc: (clientId, phase, fileName) => apiClient.post(`/ca/clients/${clientId}/upload-phase`, { phase, fileName }).then(res => res.data.data || res.data),
    updateClientDocumentReview: (clientId, review) => apiClient.post(`/ca/clients/${clientId}/documents/review`, review).then(res => res.data.data || res.data),
    getDocumentVersions: (docId) => apiClient.get(`/ca/documents/versions/${docId}`).then(res => res.data.data || res.data),
    getTdsHistory: () => apiClient.get('/ca/tds/history').then(res => res.data.data || res.data).catch(() => []),
    saveTdsCalculation: (data) => apiClient.post('/ca/tds/calculate', data).then(res => res.data.data || res.data),
    updateTdsCalculation: (id, data) => apiClient.put(`/ca/tds/history/${id}`, data).then(res => res.data.data || res.data),
    deleteTdsCalculation: (id) => apiClient.delete(`/ca/tds/history/${id}`).then(res => res.data.data || res.data),
    getClientGstCredentials: (clientId) => apiClient.get(`/ca/clients/${clientId}/gst-credentials`).then(res => res?.data ?? res),
    getClientGstStatus: (clientId) => apiClient.get(`/ca/clients/${clientId}/gst-status`).then(res => res?.data ?? res),
    requestClientGstCredentials: (clientId) => apiClient.post(`/ca/clients/${clientId}/request-gst-credentials`).then(res => res?.data ?? res),
    logGstClientAction: (clientId, action) => apiClient.post(`/ca/clients/${clientId}/gst-audit`, { action }).then(res => res?.data ?? res),
    getOwnerGstCredentials: () => apiClient.get('/ca/owner/gst-credentials').then(res => res?.data ?? res),
    saveOwnerGstCredentials: (credentials) => apiClient.post('/ca/owner/gst-credentials', credentials).then(res => res?.data ?? res),
    revokeOwnerGstCredentials: () => apiClient.delete('/ca/owner/gst-credentials').then(res => res?.data ?? res),

    getRequests: () => apiClient.get('/ca/requests').then(res => res.data.data || res.data),
    addRequest: (req) => apiClient.post('/ca/requests', req).then(res => res.data.data || res.data),
    uploadRequestDoc: (id) => apiClient.post(`/ca/requests/${id}/upload`).then(res => res.data.data || res.data),
    approveRequestDoc: (id) => apiClient.post(`/ca/requests/${id}/approve`).then(res => res.data.data || res.data),

    getTasks: () => apiClient.get('/ca/tasks').then(res => res.data.data || res.data),
    addTask: (task) => apiClient.post('/ca/tasks', task).then(res => res.data.data || res.data),
    updateTask: (id, task) => apiClient.put(`/ca/tasks/${id}`, task).then(res => res.data.data || res.data),
    deleteTask: (id) => apiClient.delete(`/ca/tasks/${id}`).then(res => res.data.data || res.data),
    toggleTaskStatus: (id) => apiClient.post(`/ca/tasks/${id}/toggle`).then(res => res.data.data || res.data),
    uploadTaskDoc: (id, data) => apiClient.post(`/ca/tasks/${id}/upload`, data).then(res => res.data.data || res.data),

    // Notifications API
    getNotifications: () => apiClient.get('/notifications').then(res => res.data.data || res.data).catch(() => []),
    addNotification: (notif) => apiClient.post('/notifications', notif).then(res => res.data.data || res.data),
    markNotificationRead: (id) => apiClient.put(`/notifications/${id}/read`).then(res => res.data.data || res.data),
    markAllNotificationsRead: () => apiClient.put('/notifications/read-all').then(res => res.data.data || res.data),

    // Presence API
    getPresenceStatus: (userId) => apiClient.get(`/ca/presence${userId ? `?userId=${userId}&user_id=${userId}` : ''}`).then(res => res.data.data || res.data),
    setUserOnline: () => apiClient.post('/presence/login').then(res => res.data.data || res.data),
    setUserOffline: () => apiClient.post('/presence/logout').then(res => res.data.data || res.data),
    updatePresenceHeartbeat: () => apiClient.post('/presence/heartbeat').then(res => res.data.data || res.data),

    // GST Credentials API
    getGstCredentials: () => apiClient.get('/gst-credentials').then(res => res.data.data || res.data),
    saveGstCredentials: (creds) => apiClient.post('/gst-credentials', creds).then(res => res.data.data || res.data),
    requestGstCredentials: (data) => apiClient.post('/gst-credentials/request', data).then(res => res.data.data || res.data),
    revokeGstCredentials: () => apiClient.put('/gst-credentials/revoke').then(res => res.data.data || res.data),

    getTimesheets: () => apiClient.get('/ca/timesheets').then(res => res.data.data || res.data),
    addTimesheet: (session) => apiClient.post('/ca/timesheets', session).then(res => res.data.data || res.data),

    getFolders: () => apiClient.get('/ca/documents/folders').then(res => res.data.data || res.data),
    getFiles: () => apiClient.get('/ca/documents/files').then(res => res.data.data || res.data),
    addFile: (file) => apiClient.post('/ca/documents/files', file).then(res => res.data.data || res.data),
    deleteFile: (id) => apiClient.delete(`/ca/documents/files/${id}`).then(res => res.data.data || res.data),

    // Teams & Team Requests System
    getTeamMembers: () => apiClient.get('/ca/team-members').then(res => res.data.data || res.data),
    removeTeamMember: (id) => apiClient.delete(`/ca/team-members/${id}`).then(res => res.data.data || res.data),
    getTeamRequests: () => apiClient.get('/ca/team-requests').then(res => res.data.data || res.data),
    addTeamRequest: (email, role) => apiClient.post('/ca/team-requests', { email, role }).then(res => res.data.data || res.data),
    acceptTeamRequest: (id) => apiClient.post(`/ca/team-requests/${id}/accept`).then(res => res.data.data || res.data),
    rejectTeamRequest: (id) => apiClient.post(`/ca/team-requests/${id}/reject`).then(res => res.data.data || res.data),
    cancelTeamRequest: (id) => apiClient.delete(`/ca/team-requests/${id}`).then(res => res.data.data || res.data),

    // Billing & Audit Session Methods
    addAuditSession: (session) => apiClient.post('/ca/audit-sessions', session).then(res => res.data.data || res.data),
    getAuditSessions: () => apiClient.get('/ca/audit-sessions').then(res => res.data.data || res.data),
    generateProfessionalInvoice: (invoice) => apiClient.post('/ca/invoices/generate', invoice).then(res => res.data.data || res.data),
    getProfessionalInvoices: () => apiClient.get('/ca/invoices').then(res => res.data.data || res.data).catch(() => []),
    getProfessionalInvoicePdf: (id) => apiClient.get(`/ca/invoices/${id}/pdf`, { responseType: 'text' }).then(res => res.data),
    getEarningsDashboard: () => apiClient.get('/ca/earnings/dashboard').then(res => res.data.data || res.data),
    payInvoice: (id, paymentMethod) => apiClient.post(`/ca/invoices/${id}/pay`, { paymentMethod }).then(res => res.data.data || res.data),
    getPaymentHistory: () => apiClient.get('/ca/payment-history').then(res => res.data.data || res.data).catch(() => []),

    // Direct Messenger Chat API
    getChatMessages: (partnerId) => apiClient.get(`/ca/messages/${partnerId}`).then(res => res.data.data || res.data),
    sendChatMessage: (data) => apiClient.post('/ca/messages', data).then(res => res.data.data || res.data),
    getUnreadChatCount: () => apiClient.get('/ca/messages/unread-count').then(res => res.data.data || res.data)
};

export default caService;
