import React from 'react';
import BusinessInventory from '../BusinessInventory';

const Products = (props) => {
    return <BusinessInventory {...props} />;
};

export const ProductList = Products;
export default Products;
export { Products, BusinessInventory };
