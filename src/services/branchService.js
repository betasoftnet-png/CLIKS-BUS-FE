import { apiClient } from '../api/client';

export const branchService = {
    // 1. Fetch all branches
    getBranches: async () => {
        const response = await apiClient.get('/branches');
        return response?.data || response || [];
    },

    // 2. Fetch single branch details
    getBranchById: async (id) => {
        const response = await apiClient.get(`/branches/${id}`);
        return response?.data || response;
    },

    // 3. Create new branch
    createBranch: async (branchData) => {
        const response = await apiClient.post('/branches', branchData);
        return response?.data || response;
    },

    // 4. Update branch details
    updateBranch: async (id, branchData) => {
        const response = await apiClient.put(`/branches/${id}`, branchData);
        return response?.data || response;
    },

    // 5. Delete / Deactivate branch
    deleteBranch: async (id) => {
        const response = await apiClient.delete(`/branches/${id}`);
        return response?.data || response;
    },

    // 6. Fetch stock for a specific branch
    getBranchStock: async (branchId) => {
        const response = await apiClient.get(`/branches/${branchId}/stock`);
        return response?.data || response || [];
    },

    // 7. Adjust stock level at a branch
    adjustBranchStock: async (data) => {
        const response = await apiClient.post('/branches/stock/adjust', data);
        return response?.data || response;
    },

    // 8. Create inter-branch stock transfer
    createTransfer: async (transferData) => {
        const response = await apiClient.post('/branches/transfers', transferData);
        return response?.data || response;
    },

    // 9. Fetch transfer history
    getTransfers: async () => {
        const response = await apiClient.get('/branches/transfers');
        return response?.data || response || [];
    },

    // 10. Re-assign Sub-ID to a branch (Java BNX Backend endpoint)
    updateSubIdBranch: async (subId, { branchId, branchName }) => {
        const API_BASE = import.meta.env.VITE_API_SUB_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.bnxmail.com';
        const token = localStorage.getItem('bnx_auth_token') || localStorage.getItem('books_auth_token');
        
        const response = await fetch(`${API_BASE}/api/subid/${subId}/branch`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ branchId, branchName })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to update Sub-ID branch assignment');
        }

        return await response.json();
    }
};
