import { apiClient } from '../api/client';

/**
 * Payroll Service connected to live /payroll backend
 */
export const payrollService = {
    getPayrollRecords: () => apiClient.get('/payroll').then(res => res.data.data || res.data),
    processPayroll: (data) => apiClient.post('/payroll', data).then(res => res.data.data || res.data),
    releaseSalary: (id) => apiClient.post(`/payroll/${id}/payment`).then(res => res.data.data || res.data),
    createLoan: (id, data) => apiClient.post(`/payroll/${id}/loan`, data).then(res => res.data.data || res.data),
};

export default payrollService;
