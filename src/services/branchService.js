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

    // 9b. Reverse transfer (Return damaged / dead stock to Main Showroom)
    createReverseTransfer: async (transferData) => {
        const response = await apiClient.post('/branches/transfers/return-to-main', transferData);
        return response?.data || response;
    },

    // 9c. Fetch low-stock and out-of-stock items for a branch
    getBranchLowStock: async (branchId) => {
        const response = await apiClient.get(`/branches/${branchId}/low-stock`);
        return response?.data || response;
    },

    // 9d. 1-Click Auto Requisition from Main Showroom
    createAutoRequisition: async (branchId, payload = {}) => {
        const response = await apiClient.post(`/branches/${branchId}/auto-requisition`, payload);
        return response?.data || response;
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
    },

    // ==========================================
    // 3. SALES & CUSTOMER MODULES
    // ==========================================

    // 11a. Request showroom discount / price override (Branch -> Main Branch)
    requestShowroomPromotion: async (promoData) => {
        const response = await apiClient.post('/branches/promotions/request', promoData);
        return response?.data || response;
    },

    // 11b. Fetch all promotions & discount requests
    getShowroomPromotions: async (params = {}) => {
        const response = await apiClient.get('/branches/promotions', { params });
        return response?.data || response || [];
    },

    // 11c. Approve or Reject discount request (Main Branch / Owner)
    updateShowroomPromotionStatus: async (promoId, { status, rejection_reason }) => {
        const response = await apiClient.put(`/branches/promotions/${promoId}/status`, { status, rejection_reason });
        return response?.data || response;
    },

    // 11d. Delete promotion
    deleteShowroomPromotion: async (promoId) => {
        const response = await apiClient.delete(`/branches/promotions/${promoId}`);
        return response?.data || response;
    },

    // 11e. Get active approved promotions for a specific branch (for POS)
    getActiveBranchPromotions: async (branchId) => {
        const response = await apiClient.get(`/branches/${branchId}/active-promotions`);
        return response?.data || response || [];
    },

    // 12a. Fetch cross-branch customer registry (Unified loyalty & store credit)
    getCrossBranchCustomers: async (params = {}) => {
        const response = await apiClient.get('/branches/customers/cross-branch', { params });
        return response?.data || response;
    },

    // 12b. Issue or redeem store credit for customer at any showroom
    issueCrossBranchStoreCredit: async (customerId, payload) => {
        const response = await apiClient.post(`/branches/customers/${customerId}/store-credit`, payload);
        return response?.data || response;
    },

    // 12c. Fetch customer cross-branch activity history
    getCustomerCrossBranchHistory: async (customerId) => {
        const response = await apiClient.get(`/branches/customers/${customerId}/history`);
        return response?.data || response;
    }
};
