import { apiClient } from '../api/client';

export const pitchesService = {
    getPitches: () => apiClient.get('/pitches').then(res => res.data.data || res.data),
    createPitch: (data) => apiClient.post('/pitches', data).then(res => res.data.data || res.data),
    verifyPitch: (id, payload = {}) => apiClient.post(`/pitches/${id}/verify`, payload).then(res => res.data.data || res.data),
};
