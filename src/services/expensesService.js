import { apiClient } from '../api/client';

/**
 * Expenses & Budgeting Service connected to live /expenses backend
 */
export const expensesService = {
    getExpenses: () => apiClient.get('/expenses').then(res => res.data.data || res.data),
    createExpense: (data) => apiClient.post('/expenses', data).then(res => res.data.data || res.data),
    getBudgets: () => apiClient.get('/expenses/budgets').then(res => res.data.data || res.data),
    createBudget: (data) => apiClient.post('/expenses/budgets', data).then(res => res.data.data || res.data),
    getClaims: () => apiClient.get('/expenses/reimbursements').then(res => res.data.data || res.data),
    lodgeClaim: (data) => apiClient.post('/expenses/reimburse', data).then(res => res.data.data || res.data),
    approveClaim: (id) => apiClient.post(`/expenses/${id}/approve`).then(res => res.data.data || res.data),
    getRecurrings: () => apiClient.get('/expenses/recurring').then(res => res.data.data || res.data)
};

export default expensesService;
