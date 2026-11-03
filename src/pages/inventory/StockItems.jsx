import React from 'react';
import BusinessStock from '../BusinessStock';
import StockItemDetailsModal from '../../components/inventory/StockItemDetailsModal';
import BatchesExpiriesTab from '../../components/inventory/BatchesExpiriesTab';
import StockItemDetailView from './StockItemDetailView';

const StockItems = (props) => {
  return <BusinessStock {...props} />;
};

export default StockItems;
export { StockItems, BusinessStock, StockItemDetailsModal, BatchesExpiriesTab, StockItemDetailView };
