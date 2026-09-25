import React from 'react';
import BusinessPayments from '../BusinessPayments';
import BankStatementReconciliationModal from '../../components/BankStatementReconciliationModal';

const Transaction = (props) => {
    return <BusinessPayments {...props} />;
};

export default Transaction;
export { BankStatementReconciliationModal, Transaction, BusinessPayments };

