import { apiClient } from '../api/client';

/**
 * Loyalty Program Service
 * Communicates with CLIKS-BE /loyalty endpoints
 */
export const loyaltyService = {
    getProgramSettings: async () => {
        const res = await apiClient.get('/loyalty/program-settings');
        return res?.data?.data ?? res?.data ?? res;
    },
    updateProgramSettings: async (payload) => {
        const res = await apiClient.patch('/loyalty/program-settings', payload);
        return res?.data?.data ?? res?.data ?? res;
    }
};

export default loyaltyService;
