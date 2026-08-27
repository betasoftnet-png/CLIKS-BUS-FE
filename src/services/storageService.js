import { apiClient } from '../api/client';

export const storageService = {
    getStorageUsage: async () => {
        const response = await apiClient.get('/storage');
        return response.data?.data || response.data || response;
    },
    uploadFile: async (fileData) => {
        const response = await apiClient.post('/storage/upload', fileData);
        return response.data?.data || response.data || response;
    },
    deleteFile: async (id) => {
        const response = await apiClient.delete(`/storage/files/${id}`);
        return response.data?.data || response.data || response;
    }
};

export default storageService;
