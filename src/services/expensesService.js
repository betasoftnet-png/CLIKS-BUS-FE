import { apiClient } from '../api/client';

const toParams = (arg) => {
    if (!arg) return undefined;
    if (typeof arg === 'object') return arg;
    return { branch_id: arg };
};

/**
 * Expenses & Budgeting Service connected to live /expenses backend
 */
export const expensesService = {
    getExpenses: (params) => apiClient.get('/expenses', { params: toParams(params) }).then(res => res.data.data || res.data),
    createExpense: (data) => apiClient.post('/expenses', data).then(res => res.data.data || res.data),
    getBudgets: () => apiClient.get('/expenses/budgets').then(res => res.data.data || res.data),
    createBudget: (data) => apiClient.post('/expenses/budgets', data).then(res => res.data.data || res.data),
    updateBudget: (id, data) => apiClient.put(`/expenses/budgets/${id}`, data).then(res => res.data.data || res.data),
    deleteBudget: (id) => apiClient.delete(`/expenses/budgets/${id}`).then(res => res.data.data || res.data),
    getClaims: () => apiClient.get('/expenses/reimbursements').then(res => res.data.data || res.data),
    lodgeClaim: (data) => apiClient.post('/finance/claims', data).catch(() => apiClient.post('/expenses/reimburse', data)).then(res => res.data.data || res.data),
    approveClaim: (id) => {
        const cleanId = String(id).replace(/^CLM-\d+-/i, '').replace(/^CLM-/i, '').replace(/^0+/, '') || id;
        return apiClient.post(`/expenses/${cleanId}/approve`, {})
            .catch(() => apiClient.post(`/reimbursements/${cleanId}/approve`, {}))
            .catch(() => apiClient.post(`/hr/reimbursements/${cleanId}/approve`, {}))
            .then(res => res?.data?.data || res?.data || res);
    },
    rejectClaim: (id, data) => {
        const cleanId = String(id).replace(/^CLM-\d+-/i, '').replace(/^CLM-/i, '').replace(/^0+/, '') || id;
        return apiClient.post(`/expenses/${cleanId}/reject`, data || {})
            .catch(() => apiClient.post(`/reimbursements/${cleanId}/reject`, data || {}))
            .catch(() => apiClient.post(`/hr/reimbursements/${cleanId}/reject`, data || {}))
            .then(res => res?.data?.data || res?.data || res);
    },
    payClaim: (id, data) => {
        const cleanId = String(id).replace(/^CLM-\d+-/i, '').replace(/^CLM-/i, '').replace(/^0+/, '') || id;
        return apiClient.post(`/expenses/${cleanId}/pay`, data || {})
            .catch(() => apiClient.post(`/reimbursements/${cleanId}/pay`, data || {}))
            .catch(() => apiClient.post(`/hr/reimbursements/${cleanId}/pay`, data || {}))
            .then(res => res?.data?.data || res?.data || res);
    },
    deleteClaim: (id) => apiClient.delete(`/expenses/${id}`).then(res => res.data.data || res.data),
    getRecurrings: () => apiClient.get('/expenses/recurring').then(res => res.data.data || res.data),
    createRecurring: (data) => apiClient.post('/expenses/recurring', data).then(res => res.data.data || res.data),
    updateRecurring: (id, data) => apiClient.put(`/expenses/recurring/${id}`, data).then(res => res.data.data || res.data),
    deleteRecurring: (id) => apiClient.delete(`/expenses/recurring/${id}`).then(res => res.data.data || res.data),
    getCategoryReport: (params) => apiClient.get('/expenses/reports/category', { params: toParams(params) }).then(res => res.data.data || res.data)
};

export default expensesService;

