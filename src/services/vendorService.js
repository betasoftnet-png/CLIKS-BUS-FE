import api from './api';

export const vendorService = {
    getVendors: async (params = {}) => {
        const response = await api.get('/vendors', { params });
        return response.data;
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
