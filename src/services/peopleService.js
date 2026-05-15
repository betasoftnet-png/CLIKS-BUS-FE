import { apiClient } from '../api/client';

/**
 * People Service
 */
export const peopleService = {
    getPeople: async (params) => await apiClient.get('/people', { params }).then(res => res.data.data || res.data),
    getPersonById: async (id) => await apiClient.get(`/people/${id}`).then(res => res.data.data || res.data),
    createPerson: async (data) => await apiClient.post('/people', data).then(res => res.data.data || res.data),
    updatePerson: async (id, data) => await apiClient.patch(`/people/${id}`, data).then(res => res.data.data || res.data),
    deletePerson: async (id) => await apiClient.delete(`/people/${id}`).then(res => res.data.data || res.data),

    // Global aggregated views
    getAllTransactions: async () => await apiClient.get('/people/transactions').then(res => res.data.data || res.data),
    getAllReminders: async () => await apiClient.get('/people/reminders').then(res => res.data.data || res.data),
    getAllRecords: async () => await apiClient.get('/people/records').then(res => res.data.data || res.data),

    // Nested Transactions
    getTransactions: async (personId) => await apiClient.get(`/people/${personId}/transactions`).then(res => res.data.data || res.data),
    createTransaction: async (personId, data) => await apiClient.post(`/people/${personId}/transactions`, data).then(res => res.data.data || res.data),
    updateTransaction: async (personId, transactionId, data) => await apiClient.patch(`/people/${personId}/transactions/${transactionId}`, data).then(res => res.data.data || res.data),
    deleteTransaction: async (personId, transactionId) => await apiClient.delete(`/people/${personId}/transactions/${transactionId}`).then(res => res.data.data || res.data),

    // Nested Reminders
    getReminders: async (personId) => await apiClient.get(`/people/${personId}/reminders`).then(res => res.data.data || res.data),
    createReminder: async (personId, data) => await apiClient.post(`/people/${personId}/reminders`, data).then(res => res.data.data || res.data),
    updateReminder: async (personId, reminderId, data) => await apiClient.patch(`/people/${personId}/reminders/${reminderId}`, data).then(res => res.data.data || res.data),
    deleteReminder: async (personId, reminderId) => await apiClient.delete(`/people/${personId}/reminders/${reminderId}`).then(res => res.data.data || res.data),

    // Nested Records
    getRecords: async (personId) => await apiClient.get(`/people/${personId}/records`).then(res => res.data.data || res.data),
    createRecord: async (personId, data) => await apiClient.post(`/people/${personId}/records`, data).then(res => res.data.data || res.data),
    updateRecord: async (personId, recordId, data) => await apiClient.patch(`/people/${personId}/records/${recordId}`, data).then(res => res.data.data || res.data),
    deleteRecord: async (personId, recordId) => await apiClient.delete(`/people/${personId}/records/${recordId}`).then(res => res.data.data || res.data),
};

export default peopleService;
