import { apiClient } from '../api/client';

export const productsService = {
    // CRUD Operations (QueryFunctionContext safe)
    getProducts: (params) => {
        const cleanParams = params && !params.queryKey ? params : undefined;
        return apiClient.get('/products', { params: cleanParams }).then(res => res.data.data || res.data);
    },

    createProduct: (data) => apiClient.post('/products', data).then(res => res.data.data || res.data),

    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data.data || res.data),

    deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data.data || res.data),

    searchProducts: (query) => apiClient.get(`/products/search?q=${query}`).then(res => res.data.data || res.data),

    // Sub resource routes
    createImage: (id, data) => apiClient.post(`/products/${id}/images`, data).then(res => res.data.data || res.data),
    getImages: (id) => apiClient.get(`/products/${id}/images`).then(res => res.data.data || res.data),
    deleteImage: (id, imageId) => apiClient.delete(`/products/${id}/images/${imageId}`).then(res => res.data.data || res.data),

    createDocument: (id, data) => apiClient.post(`/products/${id}/documents`, data).then(res => res.data.data || res.data),
    getDocuments: (id) => apiClient.get(`/products/${id}/documents`).then(res => res.data.data || res.data),

    createBarcode: (id, data) => apiClient.post(`/products/${id}/barcodes`, data).then(res => res.data.data || res.data),
    getBarcode: (id) => apiClient.get(`/products/${id}/barcodes`).then(res => res.data.data || res.data),

    createSerialNumber: (id, data) => apiClient.post(`/products/${id}/serial-numbers`, data).then(res => res.data.data || res.data),
    getSerialNumber: (id) => apiClient.get(`/products/${id}/serial-numbers`).then(res => res.data.data || res.data),

    createBatch: (id, data) => apiClient.post(`/products/${id}/batches`, data).then(res => res.data.data || res.data),
    getBatches: (id) => apiClient.get(`/products/${id}/batches`).then(res => res.data.data || res.data),

    createPricing: (id, data) => apiClient.post(`/products/${id}/pricing`, data).then(res => res.data.data || res.data),
    getPricing: (id) => apiClient.get(`/products/${id}/pricing`).then(res => res.data.data || res.data),

    getStock: (id) => apiClient.get(`/products/${id}/stock`).then(res => res.data.data || res.data),
    getStockHistory: (id) => apiClient.get(`/products/${id}/stock-history`).then(res => res.data.data || res.data),

    getPurchases: (id) => apiClient.get(`/products/${id}/purchases`).then(res => res.data.data || res.data),
    getSales: (id) => apiClient.get(`/products/${id}/sales`).then(res => res.data.data || res.data),
    getReturns: (id) => apiClient.get(`/products/${id}/returns`).then(res => res.data.data || res.data),

    getSuppliers: (id) => apiClient.get(`/products/${id}/suppliers`).then(res => res.data.data || res.data),

    createTax: (id, data) => apiClient.post(`/products/${id}/tax`, data).then(res => res.data.data || res.data),
    getTax: (id) => apiClient.get(`/products/${id}/tax`).then(res => res.data.data || res.data),

    createCategory: (id, data) => apiClient.post(`/products/${id}/categories`, data).then(res => res.data.data || res.data),
    getCategories: () => apiClient.get('/products/categories').then(res => res.data.data || res.data),
    updateCategory: (categoryId, data) => apiClient.put(`/products/categories/${categoryId}`, data).then(res => res.data.data || res.data),
    deleteCategory: (categoryId) => apiClient.delete(`/products/categories/${categoryId}`).then(res => res.data.data || res.data),

    getUnits: () => apiClient.get('/products/units').then(res => res.data.data || res.data),

    createWarehouse: (id, data) => apiClient.post(`/products/${id}/warehouse`, data).then(res => res.data.data || res.data),
    getWarehouse: (id) => apiClient.get(`/products/${id}/warehouse`).then(res => res.data.data || res.data),

    createNote: (id, data) => apiClient.post(`/products/${id}/notes`, data).then(res => res.data.data || res.data),
    getNotes: (id) => apiClient.get(`/products/${id}/notes`).then(res => res.data.data || res.data),

    getAnalytics: (id) => apiClient.get(`/products/${id}/analytics`).then(res => res.data.data || res.data),

    // Reports
    getStockReport: () => apiClient.get('/products/reports/stock').then(res => res.data.data || res.data),
    getSalesReport: () => apiClient.get('/products/reports/sales').then(res => res.data.data || res.data),
    getProfitReport: () => apiClient.get('/products/reports/profit').then(res => res.data.data || res.data),
    getLowStockReport: () => apiClient.get('/products/reports/low-stock').then(res => res.data.data || res.data),
    getExpiryReport: () => apiClient.get('/products/reports/expiry').then(res => res.data.data || res.data),
    getTopProductsReport: () => apiClient.get('/products/reports/top-products').then(res => res.data.data || res.data),

    // Import / Export
    importProducts: (data) => apiClient.post('/products/import', data).then(res => res.data.data || res.data),
    exportProducts: () => apiClient.get('/products/export').then(res => res.data.data || res.data),

    // Actions
    blockProduct: (id) => apiClient.post(`/products/${id}/block`).then(res => res.data.data || res.data),
    unblockProduct: (id) => apiClient.post(`/products/${id}/unblock`).then(res => res.data.data || res.data),

    // Summaries & History
    getDashboardSummary: () => apiClient.get('/products/dashboard-summary').then(res => res.data.data || res.data),
    getHistory: (id) => apiClient.get(`/products/${id}/history`).then(res => res.data.data || res.data),
    getTimeline: (id) => apiClient.get(`/products/${id}/timeline`).then(res => res.data.data || res.data)
};

export default productsService;
