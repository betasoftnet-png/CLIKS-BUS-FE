import { apiClient } from '../api/client';

/**
 * Attendance Service connected to live /attendance backend
 */
export const attendanceService = {
    getAttendanceLogs: () => apiClient.get('/attendance').then(res => res.data.data || res.data),
    createPunch: (data) => apiClient.post('/attendance', data).then(res => res.data.data || res.data),
    updateAttendance: (id, data) => apiClient.put(`/attendance/${id}`, data).then(res => res.data.data || res.data),
    createRegularization: (data) => apiClient.post('/attendance/regularization', data).then(res => res.data.data || res.data),
    approveRegularization: (id) => apiClient.post(`/attendance/${id}/approve`).then(res => res.data.data || res.data),
    rejectRegularization: (id) => apiClient.post(`/attendance/${id}/reject`).then(res => res.data.data || res.data),
    getShifts: () => apiClient.get('/attendance/shifts').then(res => res.data.data || res.data),
    createShift: (data) => apiClient.post('/attendance/shift', data).then(res => res.data.data || res.data),
    updateShift: (id, data) => apiClient.put(`/attendance/shift/${id}`, data).then(res => res.data.data || res.data),
};

export default attendanceService;
