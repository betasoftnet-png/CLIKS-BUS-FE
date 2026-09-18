import React from 'react';
import { Outlet } from 'react-router-dom';

const PaymentsLayout = () => {
    return (
        <div className="payments-module-layout" style={{ height: '100%', width: '100%', minHeight: 0 }}>
            <Outlet />
        </div>
    );
};

export default PaymentsLayout;
