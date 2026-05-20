import { apiClient } from '../api/client';

/**
 * CA AI auditing & compliance service connected directly to the live backend
 */
export const caService = {
    runComplianceScan: () => apiClient.post('/ca/compliance-scan').then(res => res.data.data || res.data),
    getScanHistory: () => apiClient.get('/ca/scans').then(res => res.data.data || res.data),
    applyCrossBorderAudit: (standard) => apiClient.post('/ca/cross-border-audit', { standard }).then(res => res.data.data || res.data)
};

export default caService;
