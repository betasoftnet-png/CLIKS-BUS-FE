import { apiClient } from '../api/client';

/**
 * Split Expense / Split & Collect Service
 */
export const splitExpenseService = {
    getSplits: async () => await apiClient.get('/split-expenses').then(res => res.data.data || res.data),
    getSummary: async () => await apiClient.get('/split-expenses/summary').then(res => res.data.data || res.data),
    settleFriend: async (name) => await apiClient.patch('/split-expenses/settle-friend', { name }).then(res => res.data.data || res.data),
    getSplitById: async (id) => await apiClient.get(`/split-expenses/${id}`).then(res => res.data.data || res.data),
    createSplit: async (data) => await apiClient.post('/split-expenses', data).then(res => res.data.data || res.data),
    updateSplit: async (id, data) => await apiClient.patch(`/split-expenses/${id}`, data).then(res => res.data.data || res.data),
    deleteSplit: async (id) => await apiClient.delete(`/split-expenses/${id}`).then(res => res.data.data || res.data),

    // Participants
    getParticipants: async (splitId) => await apiClient.get(`/split-expenses/${splitId}/participants`).then(res => res.data.data || res.data),
    addParticipant: async (splitId, data) => await apiClient.post(`/split-expenses/${splitId}/participants`, data).then(res => res.data.data || res.data),
    updateParticipant: async (splitId, participantId, data) => await apiClient.patch(`/split-expenses/${splitId}/participants/${participantId}`, data).then(res => res.data.data || res.data),
    deleteParticipant: async (splitId, participantId) => await apiClient.delete(`/split-expenses/${splitId}/participants/${participantId}`).then(res => res.data.data || res.data),
    settleParticipant: async (splitId, participantId) => await apiClient.patch(`/split-expenses/${splitId}/participants/${participantId}/settle`).then(res => res.data.data || res.data),
    // Expenses
    addExpense: async (splitId, data) => await apiClient.post(`/split-expenses/${splitId}/expenses`, data).then(res => res.data.data || res.data),
    deleteExpense: async (splitId, expenseId) => await apiClient.delete(`/split-expenses/${splitId}/expenses/${expenseId}`).then(res => res.data.data || res.data),
    updateExpense: async (splitId, expenseId, data) => await apiClient.patch(`/split-expenses/${splitId}/expenses/${expenseId}`, data).then(res => res.data.data || res.data),
    uploadAttachment: async (fileData) => await apiClient.post('/split-expenses/upload', fileData).then(res => res.data.data || res.data),
};

export default splitExpenseService;
