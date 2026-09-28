import React from 'react';
import BusinessPOS from '../BusinessPOS';
import QuickRegisterItemModal from '../../components/pos/QuickRegisterItemModal';
import POSReceiptModal from '../../components/pos/POSReceiptModal';

const POSBilling = (props) => {
    return <BusinessPOS {...props} />;
};

export default POSBilling;
export { POSBilling, BusinessPOS, QuickRegisterItemModal, POSReceiptModal };


