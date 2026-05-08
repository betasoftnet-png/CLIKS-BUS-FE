import { apiClient } from '../api/client';

/**
 * Staffing Service connected to live /staff backend
 */
export const staffingService = {
    getEmployees: () => apiClient.get('/staff').then(res => res.data.data || res.data),
    createEmployee: (data) => apiClient.post('/staff', data).then(res => res.data.data || res.data),
    updateEmployee: (id, data) => apiClient.put(`/staff/${id}`, data).then(res => res.data.data || res.data),
    deleteEmployee: (id) => apiClient.delete(`/staff/${id}`).then(res => res.data.data || res.data),
    searchEmployees: (q) => apiClient.get(`/staff/search`, { params: { q } }).then(res => res.data.data || res.data),
    
    // Extra live updates
    updateAddress: (id, address) => apiClient.post(`/staff/${id}/address`, address).then(res => res.data.data || res.data),
    updateEmergencyContact: (id, contact) => apiClient.post(`/staff/${id}/emergency-contact`, contact).then(res => res.data.data || res.data),
    updateBankDetails: (id, bank) => apiClient.post(`/staff/${id}/bank-details`, bank).then(res => res.data.data || res.data),
    updateSalaryStructure: (id, salary) => apiClient.post(`/staff/${id}/salary-structure`, salary).then(res => res.data.data || res.data),
    updateShift: (id, shift) => apiClient.post(`/staff/${id}/shift`, { shift }).then(res => res.data.data || res.data),
    updateRoles: (id, roles) => apiClient.post(`/staff/${id}/roles`, { roles }).then(res => res.data.data || res.data),
    updatePermissions: (id, permissions) => apiClient.post(`/staff/${id}/permissions`, { permissions }).then(res => res.data.data || res.data),
    
    // Appraisal rating update
    updatePerformance: (id, rating, target_score) => apiClient.put(`/staff/${id}`, { performance_rating: rating, target_score }).then(res => res.data.data || res.data),
    
    // Notes
    addNote: (id, note) => apiClient.post(`/staff/${id}/notes`, { note }).then(res => res.data.data || res.data),
    getNotes: (id) => apiClient.get(`/staff/${id}/notes`).then(res => res.data.data || res.data),
    
    // Block / Unblock
    blockEmployee: (id) => apiClient.post(`/staff/${id}/block`).then(res => res.data.data || res.data),
    unblockEmployee: (id) => apiClient.post(`/staff/${id}/unblock`).then(res => res.data.data || res.data),
};

export default staffingService;
