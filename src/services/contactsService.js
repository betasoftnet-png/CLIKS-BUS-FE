import { apiClient } from '../api/client';

export const contactsService = {
    getContacts: (params) => apiClient.get('/contacts', { params }).then(res => res.data.data || res.data),
    getContactById: (id) => apiClient.get(`/contacts/${id}`).then(res => res.data.data || res.data),
    createContact: (data) => apiClient.post('/contacts', data).then(res => res.data.data || res.data),
    updateContact: (id, data) => apiClient.patch(`/contacts/${id}`, data).then(res => res.data.data || res.data),
    deleteContact: (id) => apiClient.delete(`/contacts/${id}`).then(res => res.data.data || res.data),
};

export default contactsService;
