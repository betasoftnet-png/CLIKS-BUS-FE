import React from 'react';
import BusinessStock from '../BusinessStock';
import StockItemDetailsModal from '../../components/inventory/StockItemDetailsModal';

const StockItems = (props) => {
  return <BusinessStock {...props} />;
};

export default StockItems;
export { StockItems, BusinessStock, StockItemDetailsModal };
