import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    const location = useLocation();

    // Map common route segments to readable labels
    const labelMapping = {
        'books': 'Home',
        'home': 'Home',
        'finance': 'Finance',
        'public': 'Social',
        'financial-plan': 'Financial Plan',
        'plan': 'Financial Plan',
        'income': 'Income',
        'expenses': 'Expenses',
        'budget': 'Budget',
        'profile': 'Profile',
        'stock': 'Stock',
        'reports': 'Reports',
        'statistics': 'Statistics',
        'budgets': 'Budgets',
        'accounts': 'Accounts',
        'planned-payments': 'Planned Payments',
        'savings': 'Savings',
        'investments': 'Investments',
        'debts': 'Debts',
        'people': 'People',
        'overview': 'Overview',
        'transactions': 'Transactions',
        'reminders': 'Reminders',
        'records': 'Records',
        'contacts': 'Contacts',
        'segregation': 'Split & Collect',
        'referral': 'Refer & Earn',
        'bank-accounts': 'Bank Accounts',
        'split-expense': 'Split Expense',
        'calendar': 'Calendar',
        'goals': 'Goals',
        'analysis': 'Analysis',
        'dashboard': 'Dashboard',
    };

    // Redirect specific paths to valid routes
    const pathRedirects = {
        '/books/plan': '/books/financial-plan',
        '/books/people': '/books/people/overview',
    };

    let breadcrumbs = items;

    if (!breadcrumbs) {
        const pathnames = location.pathname.split('/').filter((x) => {
            const val = x.toLowerCase();
            return val && val !== 'business' && val !== 'dashboard' && val !== 'billing' && val !== 'books' && val !== 'home' && val !== 'crm' && val !== 'orders' && val !== 'accounting' && val !== 'expenses' && val !== 'gst';
        });
        breadcrumbs = pathnames.map((value, index) => {
            let to = `/${pathnames.slice(0, index + 1).join('/')}`;
            if (pathRedirects[to]) {
                to = pathRedirects[to];
            }
            const label = labelMapping[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
            return { href: to, label };
        }).filter((crumb, index, array) => {
            if (index > 0) {
                const prev = array[index - 1];
                if (prev.label === crumb.label) return false;
            }
            return true;
        });
    }

    if (breadcrumbs) {
        breadcrumbs = breadcrumbs.filter(crumb => {
            const val = crumb.label.toLowerCase();
            return val !== 'business' && val !== 'dashboard' && val !== 'billing' && val !== 'books' && val !== 'home' && val !== 'crm' && val !== 'orders' && val !== 'accounting' && val !== 'expenses' && val !== 'gst';
        });
    }

    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb">
            <ol style={{
                display: 'flex',
                alignItems: 'center',
                listStyle: 'none',
                padding: '0.5rem 1rem', // Pill like padding
                margin: '0 0 1.5rem 0',
                backgroundColor: 'white',
                borderRadius: '99px',
                width: 'fit-content',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)' // Subtle shadow for pill
            }}>
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <li key={`${item.href}-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            {index > 0 && (
                                <span style={{ margin: '0 0.5rem', color: '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </span>
                            )}

                            {isLast ? (
                                <span style={{
                                    color: '#1B6B3A',
                                    fontWeight: 700,
                                    fontSize: '1rem'
                                }}>
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    style={{
                                        color: '#64748B',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1B6B3A'}
                                    onMouseLeave={(e) => e.target.style.color = '#64748B'}
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
