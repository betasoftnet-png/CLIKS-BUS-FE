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
    revokeInvitation: (id) => apiClient.delete(`/ca/invitations/${id}`).then(res => res.data.data || res.data)
};

export default caService;
