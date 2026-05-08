import { apiClient } from '../api/client';

export const stockService = {
  getStocks: () => apiClient.get('/stock').then(res => res.data.data || res.data),
  getStockStats: () => apiClient.get('/stock/stats').then(res => res.data.data || res.data),
  getStock: (id) => apiClient.get(`/stock/${id}`).then(res => res.data.data || res.data),
  createStock: (data) => apiClient.post('/stock', data).then(res => res.data.data || res.data),
  updateStock: (id, data) => apiClient.patch(`/stock/${id}`, data).then(res => res.data.data || res.data),
  adjustQuantity: (id, delta) => apiClient.patch(`/stock/${id}/adjust-quantity`, { delta }).then(res => res.data.data || res.data),
  deleteStock: (id) => apiClient.delete(`/stock/${id}`).then(res => res.data.data || res.data),
  getStockHistory: (id) => apiClient.get(`/stock/${id}/history`).then(res => res.data.data || res.data)
};
