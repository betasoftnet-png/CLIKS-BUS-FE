import api from './api';

export const vendorService = {
    getVendors: async (params = {}) => {
        const response = await api.get('/vendors', { params });
        const raw = response.data?.data ?? response.data;
        if (Array.isArray(raw)) return raw;
        if (raw?.vendors && Array.isArray(raw.vendors)) return raw.vendors;
        if (raw?.data && Array.isArray(raw.data)) return raw.data;
        return [];
    },
    getVendorById: async (id) => {
        const response = await api.get(`/vendors/${id}`);
        return response.data;
    },
    createVendor: async (vendorData) => {
        const response = await api.post('/vendors', vendorData);
        return response.data;
    },
    updateVendor: async (id, vendorData) => {
        const response = await api.put(`/vendors/${id}`, vendorData);
        return response.data;
    },
    deleteVendor: async (id) => {
        const response = await api.delete(`/vendors/${id}`);
        return response.data;
    }
};

export default vendorService;
