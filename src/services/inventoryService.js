import { apiClient } from '../api/client';

export const inventoryService = {
  getInventory: () => apiClient.get('/inventory').then(res => res.data.data || res.data),
  addItem: (data) => apiClient.post('/inventory', data).then(res => res.data.data || res.data),
  updateItem: (id, data) => apiClient.patch(`/inventory/${id}`, data).then(res => res.data.data || res.data),
  adjustStock: (id, amount) => apiClient.patch(`/inventory/${id}/stock`, { amount }).then(res => res.data.data || res.data),
  deleteItem: (id) => apiClient.delete(`/inventory/${id}`).then(res => res.data.data || res.data),
};
