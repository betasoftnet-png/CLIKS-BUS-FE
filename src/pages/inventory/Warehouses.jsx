import React from 'react';
import BusinessWarehouse from '../BusinessWarehouse';
import WarehouseStockRegistryTab from '../../components/inventory/WarehouseStockRegistryTab';

const Warehouses = (props) => {
  return <BusinessWarehouse {...props} />;
};

export default Warehouses;
export { Warehouses, BusinessWarehouse, WarehouseStockRegistryTab };
