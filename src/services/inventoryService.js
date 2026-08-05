import { apiClient } from '../api/client';

export const inventoryService = {
  getInventory: () => apiClient.get('/inventory').then(res => {
    const raw = res.data?.data ?? res.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.inventory && Array.isArray(raw.inventory)) return raw.inventory;
    if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
    if (raw?.items && Array.isArray(raw.items)) return raw.items;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  }).catch(err => {
    console.error('[Inventory Service Error]', err);
    return [];
  }),
  addItem: (data) => apiClient.post('/inventory', data).then(res => res.data.data || res.data),
  updateItem: (id, data) => apiClient.patch(`/inventory/${id}`, data).then(res => res.data.data || res.data),
  adjustStock: (id, amount) => apiClient.patch(`/inventory/${id}/stock`, { amount }).then(res => res.data.data || res.data),
  deleteItem: (id) => apiClient.delete(`/inventory/${id}`).then(res => res.data.data || res.data),
};
