import React from 'react';
import BusinessPayments from '../BusinessPayments';
import BankStatementReconciliationModal from '../../components/BankStatementReconciliationModal';

const Transaction = (props) => {
    return (
        <div className="relative overflow-visible">
            <BusinessPayments {...props} />
        </div>
    );
};

export default Transaction;
export { BankStatementReconciliationModal, Transaction, BusinessPayments };

