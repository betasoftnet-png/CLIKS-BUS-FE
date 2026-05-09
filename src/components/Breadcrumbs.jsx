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
        const pathnames = location.pathname.split('/').filter((x) => x);
        breadcrumbs = pathnames.map((value, index) => {
            let to = `/${pathnames.slice(0, index + 1).join('/')}`;
            if (pathRedirects[to]) {
                to = pathRedirects[to];
            }
            const label = labelMapping[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
            return { href: to, label };
        }).filter((crumb, index) => {
            // Remove the first crumb if it's "Home" or the base "Books" route,
            // because we already show the Home Icon.
            if (index === 0 && (crumb.label === 'Home' || crumb.href === '/books')) {
                return false;
            }
            return true;
        }).filter((crumb, index, array) => {
            // Deduplicate consecutive items with same label or href
            if (index > 0) {
                const prev = array[index - 1];
                if (prev.label === crumb.label || prev.href === crumb.href) {
                    // Keep the current one? Or the previous one?
                    // Usually the later one is more specific (or same).
                    // If labels are same, drop one.
                    // If hrefs are same (e.g. redirect), we might have "People" -> "Overview" (both pointing to overview).
                    // In that case, we probably only want "Overview".
                    // So if hrefs match, we should drop the *previous* one, but filter works forward.
                    // Let's filter out the *current* one if it matches previous label.
                    // But if href matches, we want the LAST one usually (most specific label).

                    // Actually, if we have People (href=A) and Overview (href=A).
                    // We probably want just "Overview". 
                    // But here we are iterating. 

                    // Let's just fix the blatant "People > People > People" repeats first.
                    if (prev.label === crumb.label) return false;
                }
            }
            return true;
        });

        // Ensure "Books" (Home) is always first if not already, or treat the first segment as home if clearer.
        // Actually, the request image shows a Home icon.
        // Let's ensure strict separation:
        // If the path starts with /books/..., the first crumb is usually "Home" (Books).
        // If the array is empty (root), we might want to handle that, but normally we are on a page.
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
                {/* Always specific Home Home Icon at start if following design exactly */}
                <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/books/dashboard" style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#1B6B3A',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.75rem',
                        transition: 'transform 0.2s',
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Home size={16} strokeWidth={2.5} />
                    </Link>
                </li>

                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    // Skip the first breadcrumb text if it maps to 'Home' and we rely on the icon
                    // OR, keep it if the user wants text too. The image implies Icon > Text > Text.
                    // If the first item is "Home" (from 'books'), we might duplicate the icon meaning.
                    // Let's render all items but separating them.

                    return (
                        <li key={`${item.href}-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ margin: '0 0.5rem', color: '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={16} strokeWidth={2.5} />
                            </span>

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
