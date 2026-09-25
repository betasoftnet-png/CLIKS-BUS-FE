import React from 'react';
import BusinessExpenses from '../BusinessExpenses';

export default function Departments(props) {
    return <BusinessExpenses {...props} defaultTab="budget" />;
}
