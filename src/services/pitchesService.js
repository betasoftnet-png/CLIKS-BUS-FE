import { apiClient } from '../api/client';

export const pitchesService = {
    getPitches: () => apiClient.get('/pitches').then(res => res.data.data || res.data),
    getMarketplacePitches: (params = {}) => apiClient.get('/pitches/marketplace', { params }).then(res => res.data.data || res.data),
    getMyStudioPitches: () => apiClient.get('/pitches/my-studio').then(res => res.data.data || res.data),
    createPitch: (data) => apiClient.post('/pitches', data).then(res => res.data.data || res.data),
    resubmitPitch: (id, data) => apiClient.put(`/pitches/${id}/resubmit`, data).then(res => res.data.data || res.data),
    unlockPitch: (id) => apiClient.post(`/pitches/${id}/unlock`).then(res => res.data),
    getQuotaStatus: () => apiClient.get('/pitches/quota-status').then(res => res.data),
    verifyPitch: (id, payload = {}) => apiClient.post(`/pitches/${id}/verify`, payload).then(res => res.data.data || res.data),
    
    // Admin Review Endpoints
    adminLogin: (payload) => apiClient.post('/admin/auth/login', payload).then(res => res.data),
    getAdminPitches: () => apiClient.get('/admin/ventures/pitches').then(res => res.data.data || res.data),
    reviewPitch: (id, payload) => apiClient.put(`/admin/ventures/pitches/${id}/review`, payload).then(res => res.data),
    
    // Notification Endpoints
    getNotifications: () => apiClient.get('/notifications').then(res => res.data.data || res.data),
    markNotificationRead: (id) => apiClient.put(`/notifications/${id}/read`).then(res => res.data)
};
