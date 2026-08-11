import { apiClient } from '../api/client';

export const hsnService = {
    searchHSN: (query) => {
        if (!query || !query.trim()) {
            return Promise.resolve([]);
        }
        return apiClient.get('/hsn/search', { params: { q: query } })
            .then(res => {
                const raw = res.data?.data ?? res.data ?? [];
                return Array.isArray(raw) ? raw : [];
            })
            .catch(err => {
                console.error('[HSN Service Error]', err);
                return [];
            });
    }
};

export default hsnService;
