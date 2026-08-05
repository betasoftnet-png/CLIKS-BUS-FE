import api from './api';

export const documentService = {
    getDocuments: async (params = {}) => {
        const response = await api.get('/documents', { params });
        return response.data;
    },
    getDocumentById: async (id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },
    createDocument: async (documentData) => {
        const response = await api.post('/documents', documentData);
        return response.data;
    },
    updateDocument: async (id, documentData) => {
        const response = await api.put(`/documents/${id}`, documentData);
        return response.data;
    },
    deleteDocument: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    }
};

export default documentService;
