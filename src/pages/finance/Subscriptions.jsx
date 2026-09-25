import React from 'react';
import BusinessExpenses from '../BusinessExpenses';

export default function Subscriptions(props) {
    return <BusinessExpenses {...props} defaultTab="recurring" />;
}
