import { apiClient } from '../api/client';

export const manufacturingService = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard: () => 
    apiClient.get('/manufacturing/dashboard').then(res => res.data.data || res.data),

  // ── Production Orders ─────────────────────────────────────────────────────
  getOrders: (params) => 
    apiClient.get('/manufacturing/orders', { params }).then(res => res.data.data || res.data),
  
  getOrderById: (id) => 
    apiClient.get(`/manufacturing/orders/${id}`).then(res => res.data.data || res.data),
  
  createOrder: (data) => 
    apiClient.post('/manufacturing/orders', data).then(res => res.data.data || res.data),
  
  checkAvailability: (id) => 
    apiClient.get(`/manufacturing/orders/${id}/availability`).then(res => res.data.data || res.data),
  
  confirmOrder: (id, data = {}) => 
    apiClient.post(`/manufacturing/orders/${id}/confirm`, data).then(res => res.data.data || res.data),
  
  issueMaterials: (id, data = {}) => 
    apiClient.post(`/manufacturing/orders/${id}/issue`, data).then(res => res.data.data || res.data),
  
  recordConsumption: (id, data) => 
    apiClient.post(`/manufacturing/orders/${id}/consume`, data).then(res => res.data.data || res.data),
  
  completeProduction: (id, data) => 
    apiClient.post(`/manufacturing/orders/${id}/complete`, data).then(res => res.data.data || res.data),
  
  cancelOrder: (id, data = {}) => 
    apiClient.post(`/manufacturing/orders/${id}/cancel`, data).then(res => res.data.data || res.data),

  // ── Reports ───────────────────────────────────────────────────────────────
  getReports: (reportType = 'production-orders', params = {}) => 
    apiClient.get(`/manufacturing/reports/${reportType}`, { params }).then(res => res.data.data || res.data),

  // ── Bill of Materials (BOM) ───────────────────────────────────────────────
  getBoms: (params) => 
    apiClient.get('/bom', { params }).then(res => res.data.data || res.data),
  
  getBomById: (id) => 
    apiClient.get(`/bom/${id}`).then(res => res.data.data || res.data),
  
  createBom: (data) => 
    apiClient.post('/bom', data).then(res => res.data.data || res.data),
  
  updateBom: (id, data) => 
    apiClient.put(`/bom/${id}`, data).then(res => res.data.data || res.data),
  
  duplicateBom: (id, data = {}) => 
    apiClient.post(`/bom/${id}/duplicate`, data).then(res => res.data.data || res.data),
  
  deleteBom: (id) => 
    apiClient.delete(`/bom/${id}`).then(res => res.data.data || res.data),
  
  calculateRequirements: (id, quantity) => 
    apiClient.get(`/bom/${id}/calculate-requirements`, { params: { quantity } }).then(res => res.data.data || res.data),

  // ── Shared Product, Category & Warehouse Metadata ─────────────────────────
  getProducts: (params) => 
    apiClient.get('/products', { params }).then(res => res.data.data || res.data),
  
  getCategories: () => 
    apiClient.get('/products/categories').then(res => res.data.data || res.data),
  
  getUnits: () => 
    apiClient.get('/products/units').then(res => res.data.data || res.data),
  
  getWarehouses: () => 
    apiClient.get('/warehouses').then(res => res.data.data || res.data)
};

export default manufacturingService;
