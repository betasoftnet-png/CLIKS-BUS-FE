import { apiClient } from '../api/client';

export const businessSegregationService = {
    getSegregations: async () => {
        const response = await apiClient.get('/business-segregation');
        return response.data;
    },
    createSegregation: async (data) => {
        const response = await apiClient.post('/business-segregation', data);
        return response.data;
    },
    deleteSegregation: async (id) => {
        const response = await apiClient.delete(`/business-segregation/${id}`);
        return response.data;
    }
};

export default businessSegregationService;
