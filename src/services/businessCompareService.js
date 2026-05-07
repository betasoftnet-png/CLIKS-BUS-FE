import { apiClient } from '../api/client';

export const businessCompareService = {
    getScenarioComparison: async (planIds) => {
        const response = await apiClient.get(`/business-compare/scenarios?planIds=${planIds.join(',')}`);
        return response.data;
    },
    getPeriodicComparison: async () => {
        const response = await apiClient.get('/business-compare/periodic');
        return response.data;
    }
};

export default businessCompareService;
