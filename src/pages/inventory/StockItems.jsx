import React from 'react';
import BusinessStock from '../BusinessStock';
import StockItemDetailsModal from '../../components/inventory/StockItemDetailsModal';
import BatchesExpiriesTab from '../../components/inventory/BatchesExpiriesTab';

const StockItems = (props) => {
  return <BusinessStock {...props} />;
};

export default StockItems;
export { StockItems, BusinessStock, StockItemDetailsModal, BatchesExpiriesTab };
