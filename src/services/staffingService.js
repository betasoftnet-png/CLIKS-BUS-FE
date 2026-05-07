import { apiClient } from '../api/client';

/**
 * Staffing Service
 */
export const staffingService = {
    getEmployees: async () => await apiClient.get('/staffing/employees'),
    createEmployee: async (data) => await apiClient.post('/staffing/employees', data),
    updateEmployee: async (id, data) => await apiClient.patch(`/staffing/employees/${id}`, data),
    deleteEmployee: async (id) => await apiClient.delete(`/staffing/employees/${id}`),
};

export default staffingService;
