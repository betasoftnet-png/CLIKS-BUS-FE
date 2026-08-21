import React, { useState } from 'react';
import { Tooltip } from './common';
import {
    LayoutDashboard,
    Plus,
    Banknote,
    ShoppingCart,
    Users,
    ArrowDownRight,
    Package,
    Layers,
    MapPin,
    Calculator,
    CreditCard,
    TrendingUp,
    BarChart3,
    PercentCircle,
    UsersRound,
    Calendar,
    FileCheck,
    Megaphone,
    Smartphone,
    Truck,
    Cpu,
    User,
    Settings as SettingsIcon,
    RefreshCw,
    Split,
    Gift,
    Building,
    Briefcase,
    Barcode,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    Receipt,
    Crown,
    Monitor,
    Globe,
    Sliders,
    Activity,
    ShieldAlert,
    Target,
    Wallet,
    LineChart,
    Cloud,
    X
} from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth-context';
import { useLanguage } from '../context/LanguageContext';
import '../App.css';
import logoPng from '../assets/cliks6.png';
import inventoryIconPng from '../assets/image.png';
import hrIconPng from '../assets/image copy.png';
import storageLogo from '../assets/storagelogo.png';

const MenuItem = ({ item, isChild = false, activeItem, openMenus, toggleMenu, handleItemClick, isAdmin = false, isSales = false, isSupport = false }) => {
    const IconComp = item.icon;
    const isActive = activeItem === item.label;
    const hasChildren = !!item.children && item.children.length > 0;
    const isOpen = !!openMenus[item.label];
    const isChildActive = hasChildren && item.children.some(child => activeItem === child.label);

    const isBetaClub = item.label === 'BETA Club';
    const isCa = item.label === 'FIN-PRO';

    // Dynamic styling variables mapping User Green vs Admin Indigo vs Sales Orange vs Support Blue
    let primaryColor = isSales ? '#EA580C' : (isAdmin ? '#4F46E5' : (isSupport ? '#3B82F6' : '#1B6B3A'));
    let activeBg = isSales ? '#FFF7ED' : (isAdmin ? '#EEF2FF' : (isSupport ? '#EFF6FF' : '#DCF2E4'));
    let activeText = isActive ? '#ffffff' : (isSales ? '#EA580C' : (isAdmin ? '#1E293B' : (isSupport ? '#3B82F6' : '#111827')));
    let darkTextColor = isSales ? '#9A3412' : (isAdmin ? '#3730A3' : (isSupport ? '#1D4ED8' : '#135029'));

    if (isBetaClub) {
        primaryColor = '#FFD700'; // Vibrant gold icon (#FFD700)
        activeBg = '#FFFDF0'; // Soft golden background hover states
        darkTextColor = '#D97706'; // Warm golden amber for subheader labels
    } else if (isCa) {
        primaryColor = '#D4AF37'; // Elegant gold icon (#D4AF37)
        activeBg = '#FFFDF0'; // Soft golden background hover states
        activeText = '#D4AF37'; // Set text color explicitly to gold
        darkTextColor = '#B8860B'; // Warm golden amber for subheader labels
    }

    let backgroundStyle = 'transparent';
    if (isActive) {
        if (isSales) {
            backgroundStyle = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
        } else if (isAdmin) {
            backgroundStyle = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
        } else if (isSupport) {
            backgroundStyle = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)';
        } else if (isBetaClub) {
            backgroundStyle = '#FFFDF0';
            primaryColor = '#FFD700';
            darkTextColor = '#D97706';
        } else if (isCa) {
            primaryColor = '#B8860B';
            activeBg = 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)';
            darkTextColor = '#B8860B';
            backgroundStyle = activeBg;
        } else {
            backgroundStyle = '#1B6B3A';
        }
    }

    const { t } = useLanguage();
    const displayLabel = (t && typeof t === 'function') ? t(item.label, item.label) : item.label;

    if (hasChildren) {
        return (
            <div className="sidebar-group" style={{ marginBottom: '6px' }}>
                <button
                    className={`sidebar-item has-children ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}`}
                    onClick={() => toggleMenu(item.label)}
                    style={{
                        background: backgroundStyle,
                        color: activeText
                    }}
                >
                    <div className="flex items-center gap-3">
                        {item.label === 'Inventory' ? (
                            <img src={inventoryIconPng} alt="Inventory" style={{ width: '20px', height: '20px', objectFit: 'contain', display: 'block' }} />
                        ) : item.label === 'HR' ? (
                            <img src={hrIconPng} alt="HR" style={{ width: '20px', height: '20px', objectFit: 'contain', display: 'block' }} />
                        ) : (
                            <IconComp size={20} style={{ color: (isActive && !isBetaClub && !isCa) ? '#ffffff' : primaryColor }} />
                        )}
                        <span className="sidebar-label" style={{ fontWeight: '750', color: darkTextColor }}>{displayLabel}</span>
                    </div>
                    {isOpen ? <ChevronDown size={16} style={{ color: darkTextColor }} /> : <ChevronRight size={16} style={{ color: darkTextColor }} />}
                </button>

                {isOpen && (
                    <div className="sidebar-submenu pl-4" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {item.children.map((child, idx) => (
                            <MenuItem
                                key={idx}
                                item={child}
                                isChild={true}
                                activeItem={activeItem}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
                                handleItemClick={handleItemClick}
                                isAdmin={isAdmin}
                                isSales={isSales}
                                isSupport={isSupport}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            className={`sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(item.label, item.path)}
            style={{
                marginBottom: '6px',
                paddingLeft: isChild ? '1.2rem' : '0.75rem',
                fontSize: isChild ? '0.85rem' : '0.92rem',
                background: backgroundStyle,
                color: activeText,
                borderLeft: isChild && isActive ? `3px solid ${isSales ? '#EA580C' : (isAdmin ? '#3730A3' : (isSupport ? '#1D4ED8' : '#135029'))}` : 'none',
                boxShadow: isActive && (isAdmin || isSales || isSupport) ? `0 4px 12px ${isSales ? 'rgba(234, 88, 12, 0.2)' : (isAdmin ? 'rgba(79, 70, 229, 0.2)' : 'rgba(59, 130, 246, 0.2)')}` : 'none'
            }}
        >
            <div className="flex items-center gap-3">
                {item.label === 'Inventory' ? (
                    <img src={inventoryIconPng} alt="Inventory" style={{ width: isChild ? '18px' : '20px', height: isChild ? '18px' : '20px', objectFit: 'contain', display: 'block' }} />
                ) : item.label === 'HR' ? (
                    <img src={hrIconPng} alt="HR" style={{ width: isChild ? '18px' : '20px', height: isChild ? '18px' : '20px', objectFit: 'contain', display: 'block' }} />
                ) : (
                    <IconComp size={isChild ? 18 : 20} style={{ color: (isActive && !isBetaClub && !isCa) ? '#ffffff' : primaryColor }} />
                )}
                <span className="sidebar-label" style={{ fontWeight: isActive ? '800' : 'inherit' }}>{displayLabel}</span>
            </div>
        </button>
    );
};

const Sidebar = ({ isOpen, onClose, onReferralClick }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedPlan, planDaysRemaining } = useAuth();

    const getActiveItemFromPath = (path) => {
        if (path.includes('/admin/dashboard')) return 'Admin Console';
        if (path.includes('/admin/users')) return 'Tenant Matrix';
        if (path.includes('/admin/sales-team')) return 'Sales Team';
        if (path.includes('/admin/sales-leads')) return 'Leads Matrix';
        if (path.includes('/admin/sales')) return 'Platform Sales';
        if (path.includes('/admin/support-team')) return 'Support Desk';
        if (path.includes('/sales-portal/dashboard')) return 'Sales Overview';
        if (path.includes('/sales-portal/leads')) return 'My Prospects';
        if (path.includes('/support-portal/dashboard')) return 'Support Overview';
        if (path.includes('/support-portal/faq')) return 'FAQ Registry';
        if (path.includes('/admin/moderation')) return 'Feed Monitor';
        if (path.includes('/admin/logs')) return 'Audit Trail';
        if (path.includes('/admin/settings')) return 'Engine Overrides';
        if (path.includes('/pos')) return 'POS Billing';
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/sales/invoice')) return 'Sales Invoice';
        if (path.includes('/sales/orders')) return 'Orders';
        if (path.includes('/sales/delivery')) return 'Delivery';
        if (path.includes('/sales/customers')) return 'Customers';
        if (path.includes('/sales/returns')) return 'Returns';
        if (path.includes('/inventory/products')) return 'Products';
        if (path.includes('/barcode')) return 'Barcode Gen';
        if (path.includes('/inventory/stock')) return 'Stock';
        if (path.includes('/purchases/purchases')) return 'Purchase Invoice';
        if (path.includes('/purchases/suppliers')) return 'Suppliers';
        if (path.includes('/inventory/warehouse')) return 'Warehouse';
        if (path.includes('/finance/purchases/new')) return 'New Purchase';
        if (path.includes('/finance/purchases/register')) return 'Purchase Register';
        if (path.includes('/finance/purchases/vendors')) return 'Vendors';
        if (path.includes('/finance/purchases/bills')) return 'Vendor Bills';
        if (path.includes('/finance/purchases/details')) return 'Purchase Details';
        if (path.includes('/finance/purchases/reports')) return 'Purchase Reports';
        if (path.includes('/finance/accounting')) return 'Accounting';
        if (path.includes('/payments/transaction')) return 'Transaction';
        if (path.includes('/payments/wallet')) return 'Wallet';
        if (path.includes('/payments/segregation')) return 'Segregation';
        if (path.includes('/payments/split-collect')) return 'Split & Collect';
        if (path.includes('/payments/rewards')) return 'Rewards & Offers';
        if (path.includes('/payments/people')) return 'People';
        if (path.includes('/payments/plan')) return 'Planner';

        if (path.includes('/referral')) return 'Refer & Earn';
        if (path.includes('/payments/bank-accounts')) return 'Bank Accounts';
        if (path.includes('/finance/expenses')) return 'Expenses';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/finance/gst')) return 'Tax';
        if (path.includes('/hr/staff')) return 'Staff';
        if (path.includes('/hr/attendance')) return 'Attendance';
        if (path.includes('/hr/payroll')) return 'Payroll';
        if (path.includes('/marketing')) return 'Marketing';
        if (path.includes('/ca')) return 'FIN-PRO';
        if (path.includes('/social/betaclub')) return 'BETA Club';
        if (path.includes('/social/meetup')) return 'BETA Club';
        if (path.includes('/social/trading')) return 'Trading docs';
        if (path.includes('/subscription')) return 'Subscription';
        if (path.includes('/settings')) return 'Business Settings';
        if (path.includes('/faq')) return 'Help & Support';
        return 'Dashboard';
    };

    // Synchronous Persistent Module Derivation
    let activeModule = sessionStorage.getItem('active_cliks_module') || 'books';
    if (location.pathname.startsWith('/social/')) {
        activeModule = 'social';
        sessionStorage.setItem('active_cliks_module', 'social');
    } else if (location.pathname.startsWith('/payments/')) {
        activeModule = 'payments';
        sessionStorage.setItem('active_cliks_module', 'payments');
    } else if (
        !location.pathname.includes('/admin/') &&
        !['/settings', '/faq', '/subscription', '/profile', '/referral'].some(p => location.pathname.startsWith(p)) &&
        location.pathname !== '/'
    ) {
        activeModule = 'books';
        sessionStorage.setItem('active_cliks_module', 'books');
    }

    const isSocialMode = activeModule === 'social';
    const isFinanceMode = activeModule === 'payments';
    const isAdminMode = location.pathname.includes('/admin/');
    const isSalesAgentMode = location.pathname.includes('/sales-portal/');
    const isSupportAgentMode = location.pathname.includes('/support-portal/');

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
    const [openMenus, setOpenMenus] = useState({});
    const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

    const navigationConfig = {
        admin: [
            { label: 'Admin Console', icon: Activity, path: '/admin/dashboard' },
            { label: 'Tenant Matrix', icon: Users, path: '/admin/users' },
            {
                label: 'Sales Control',
                icon: ShoppingCart,
                children: [
                    { label: 'Platform Sales', icon: Receipt, path: '/admin/sales' },
                    { label: 'Sales Team', icon: Users, path: '/admin/sales-team' },
                    { label: 'Leads Matrix', icon: FileCheck, path: '/admin/sales-leads' }
                ]
            },
            {
                label: 'Support Control',
                icon: HelpCircle,
                children: [
                    { label: 'Support Desk', icon: Users, path: '/admin/support-team' }
                ]
            },
            { label: 'Feed Monitor', icon: ShieldAlert, path: '/admin/moderation' },
            { label: 'Audit Trail', icon: FileCheck, path: '/admin/logs' },
            { label: 'Engine Overrides', icon: Sliders, path: '/admin/settings' }
        ],
        salesAgent: [
            { label: 'Sales Overview', icon: LayoutDashboard, path: '/sales-portal/dashboard' },
            { label: 'My Prospects', icon: Users, path: '/sales-portal/leads' }
        ],
        supportAgent: [
            { label: 'Support Overview', icon: LayoutDashboard, path: '/support-portal/dashboard' },
            { label: 'Help Desk FAQ', icon: HelpCircle, path: '/support-portal/faq' }
        ],
        standard: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
                label: 'Finance',
                icon: Banknote,
                children: [
                    { label: 'Accounting', icon: Calculator, path: '/finance/accounting' },
                    { label: 'Expenses', icon: TrendingUp, path: '/finance/expenses' },
                    { label: 'Tax', icon: PercentCircle, path: '/finance/gst' }
                ]
            },
            {
                label: 'Sales',
                icon: ShoppingCart,
                children: [
                    { label: 'Sales Invoice', icon: Receipt, path: '/sales/invoice' },
                    { label: 'Customers', icon: Users, path: '/sales/customers' }
                ]
            },
            {
                label: 'Purchases',
                icon: ShoppingCart,
                children: [
                    { label: 'Purchase Invoice', icon: ShoppingCart, path: '/purchases/purchases' },
                    { label: 'Suppliers', icon: UsersRound, path: '/purchases/suppliers' }
                ]
            },
            {
                label: 'Inventory',
                icon: Package,
                children: [
                    { label: 'Products', icon: Package, path: '/inventory/products' },
                    { label: 'Stock', icon: Layers, path: '/inventory/stock' },
                    { label: 'Warehouse', icon: MapPin, path: '/inventory/warehouse' }
                ]
            },
            {
                label: 'HR',
                icon: UsersRound,
                children: [
                    { label: 'Staff', icon: UsersRound, path: '/hr/staff' },
                    { label: 'Attendance', icon: Calendar, path: '/hr/attendance' },
                    { label: 'Payroll', icon: FileCheck, path: '/hr/payroll' }
                ]
            },
            { label: 'POS Billing', icon: Monitor, path: '/pos' },
            { label: 'Reports', icon: BarChart3, path: '/reports' },
            { label: 'Barcode Gen', icon: Barcode, path: '/barcode' },
            { label: 'Marketing', icon: Megaphone, path: '/marketing' }
        ],
        social: [
            { label: 'BETA Club', icon: UsersRound, path: '/social/betaclub', color: '#FFD700' },
            { label: 'Trading docs', icon: LineChart, path: '/social/trading' }
        ],
        financeMode: [
            { label: 'People', icon: Users, path: '/payments/people' },
            { label: 'Wallet', icon: Wallet, path: '/payments/wallet' },
            { label: 'Transaction', icon: CreditCard, path: '/payments/transaction' },
            { label: 'Segregation', icon: Target, path: '/payments/segregation' },
            { label: 'Split & Collect', icon: Split, path: '/payments/split-collect' },
            { label: 'Planner', icon: Calendar, path: '/payments/plan' },
            { label: 'Rewards & Offers', icon: Gift, path: '/payments/rewards' }
        ]

    };

    // Smart Expansion Detection
    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname);
        setActiveItem(newItem);

        const initialOpenMenus = {};
        const checkAndOpen = (items) => {
            items.forEach(item => {
                if (item.children) {
                    const hasActiveChild = item.children.some(child => {
                        return child.path && (
                            location.pathname === child.path ||
                            (child.path !== '/' && location.pathname.startsWith(child.path + '/')) ||
                            location.pathname.includes(child.path)
                        );
                    });
                    if (hasActiveChild) {
                        initialOpenMenus[item.label] = true;
                    }
                }
            });
        };

        checkAndOpen(navigationConfig.standard);
        checkAndOpen(navigationConfig.admin);

        setOpenMenus(prev => ({ ...prev, ...initialOpenMenus }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        
        if (path) {
            // Intercept clicks if the user is on the Free Plan (allow essential pages)
            const allowedFreePlanPages = ['Dashboard', 'Settings', 'Subscription', 'Help & Support', 'Business Settings', 'Profile'];
            
            if (selectedPlan === 'Free Plan' && !allowedFreePlanPages.includes(label)) {
                alert('You are on the Free Plan! Please subscribe to unlock full access to this feature.');
                navigate('/subscription');
            } else {
                navigate(path);
            }
        }

        if (onClose && typeof window !== 'undefined' && window.innerWidth <= 768) {
            onClose();
        }
    };

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };


    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: 'transparent' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '24px', height: '24px' }} />
                </div>
                <h2 className="app-title">CLIKS BUS</h2>
            </div>

            <div className="sidebar-scroll-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
                <nav className="sidebar-nav" style={{ flex: 'none', overflowY: 'visible', padding: '0.75rem' }}>
                    {isAdminMode ? (
                        <>
                            <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#4F46E5', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>PLATFORM CONTROL</div>
                            {navigationConfig.admin.map(item => (
                                <MenuItem
                                    key={item.label}
                                    item={item}
                                    activeItem={activeItem}
                                    openMenus={openMenus}
                                    toggleMenu={toggleMenu}
                                    handleItemClick={handleItemClick}
                                    isAdmin={true}
                                />
                            ))}
                        </>
                    ) : isSalesAgentMode ? (
                        <>
                            <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#EA580C', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>SALES DESK</div>
                            {navigationConfig.salesAgent.map(item => (
                                <MenuItem
                                    key={item.label}
                                    item={item}
                                    activeItem={activeItem}
                                    openMenus={openMenus}
                                    toggleMenu={toggleMenu}
                                    handleItemClick={handleItemClick}
                                    isSales={true}
                                />
                            ))}
                        </>
                    ) : isSupportAgentMode ? (
                        <>
                            <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#3B82F6', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>SUPPORT DESK</div>
                            {navigationConfig.supportAgent.map(item => (
                                <MenuItem
                                    key={item.label}
                                    item={item}
                                    activeItem={activeItem}
                                    openMenus={openMenus}
                                    toggleMenu={toggleMenu}
                                    handleItemClick={handleItemClick}
                                    isSupport={true}
                                />
                            ))}
                        </>
                    ) : isSocialMode ? (
                        <>
                            {/* No "Social" title - removed per user request */}
                            <div style={{ paddingTop: '1.5rem' }}>
                                {navigationConfig.social.map(item => (
                                    <React.Fragment key={item.label}>
                                        <MenuItem item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />
                                        {item.label === 'Trading docs' && (
                                            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '10px 0.75rem', opacity: 0.6 }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    ) : isFinanceMode ? (
                        <>
                            {/* No "Finance" title - removed per user request */}
                            {/* Add Money CTA - shows on all Finance mode pages */}
                            <button
                                onClick={() => handleItemClick('Wallet', '/payments/wallet?addMoney=true')}
                                style={{
                                    width: 'calc(100% - 2rem)',
                                    margin: '0.5rem 1rem 1.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 1rem',
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                                    color: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Plus size={15} strokeWidth={3} /> Add Money
                            </button>
                            {navigationConfig.financeMode.map(item => (
                                <React.Fragment key={item.label}>
                                    <MenuItem item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />
                                </React.Fragment>
                            ))}
                        </>
                    ) : (
                        <>
                            {navigationConfig.standard.map(item => (
                                <React.Fragment key={item.label}>
                                    <MenuItem item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />
                                    {item.label === 'Dashboard' && (
                                        <>
                                            <button
                                                onClick={() => handleItemClick('Generate Invoice', '/sales/invoice?create=true')}
                                                style={{
                                                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #135029 100%)',
                                                    color: 'white', border: 'none', cursor: 'pointer',
                                                    fontWeight: '800', fontSize: '0.85rem', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                    boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)',
                                                    marginBottom: '8px',
                                                    marginTop: '2px'
                                                }}>
                                                <Plus size={16} strokeWidth={3} /> Generate Invoice
                                            </button>
                                            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0.75rem 10px 0.75rem', opacity: 0.6 }} />
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </>
                    )}
                </nav>
 

 
                <div style={{ flex: 1 }} />
            </div> {/* END OF sidebar-scroll-container */}

            {/* Refer & Earn Block (Original style) - rendered for Social/Finance mode above the footer */}
            {(isSocialMode || isFinanceMode) && (
                <div style={{ padding: '0 1rem', marginBottom: '0.75rem', flexShrink: 0 }}>
                    <button
                        onClick={() => {
                            if (onReferralClick) onReferralClick();
                            if (onClose && typeof window !== 'undefined' && window.innerWidth <= 768) onClose();
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.65rem',
                            padding: '0.60rem',
                            background: 'transparent',
                            color: '#6B7280',
                            borderRadius: '12px',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '750',
                            fontSize: '0.875rem',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)';
                            e.currentTarget.style.color = '#7C3AED';
                            e.currentTarget.style.borderColor = '#DDD6FE';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#6B7280';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Gift size={18} strokeWidth={2.5} style={{ color: '#8B5CF6', flexShrink: 0 }} />
                        <span>Refer &amp; Earn</span>
                    </button>
                </div>
            )}

            {/* Fixed Sidebar Footer - Relocated outside scroll container based on User Specification */}
            <div style={{
                padding: '0.75rem 1rem 1rem 1rem',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                flexShrink: 0,
                background: '#FFFFFF',
                zIndex: 10
            }}>
                {/* Storage Card - Relocated in removed FIN-PRO sidebar area */}
                {!isSocialMode && !isFinanceMode && !isAdminMode && !isSalesAgentMode && (
                    <div 
                        onClick={() => setIsStorageModalOpen(true)}
                        title="Click to view Storage Allocation & Breakdown"
                        style={{
                            width: '100%',
                            backgroundColor: '#EFF6FF',
                            borderRadius: '12px',
                            padding: '0.75rem 0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #DBEAFE',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#E0F2FE';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#EFF6FF';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Left Info Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <Cloud size={18} color="#2563EB" strokeWidth={2.2} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1E293B' }}>
                                    Storage
                                </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#475569' }}>
                                0 KB of 1 GB used
                            </div>
                        </div>

                        {/* Right Neat Circular Progress Ring with % Inside */}
                        {(() => {
                            const storagePercent = 0;
                            const radius = 15;
                            const circ = 2 * Math.PI * radius;
                            const strokeDashoffset = circ * (1 - storagePercent / 100);

                            return (
                                <div style={{
                                    position: 'relative',
                                    width: '38px',
                                    height: '38px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <svg width="38" height="38" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r={radius}
                                            fill="none"
                                            stroke="#DBEAFE"
                                            strokeWidth="3"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r={radius}
                                            fill="none"
                                            stroke="#2563EB"
                                            strokeWidth="3"
                                            strokeDasharray={circ}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                                        />
                                    </svg>
                                    <span style={{
                                        position: 'absolute',
                                        fontSize: '0.72rem',
                                        fontWeight: '800',
                                        color: '#2563EB'
                                    }}>
                                        {Math.round(storagePercent)}%
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                )}
 
                {/* Unified Subscription Conversion Card */}
                {(!isAdminMode && !isSalesAgentMode) && (() => {
                    const displayPlan = selectedPlan;
                    const displayDays = planDaysRemaining;

                    const isAnnual = ['Starter Plan', 'Growth Plan', 'Elite Suite', 'Yearly Founder'].includes(displayPlan);
                    const totalDays = isAnnual ? 365 : 30;
                    const progressPercent = Math.min(100, Math.max(0, (displayDays / totalDays) * 100));
                    const strokeDashoffset = 113 * (1 - progressPercent / 100);

                    return (
                        <button
                            onClick={() => handleItemClick('Subscription', '/subscription')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.6rem 0.5rem 0.85rem',
                                background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '750',
                                fontSize: '0.85rem',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                                transition: 'all 0.2s ease',
                                minHeight: '52px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <style>{`
                                @keyframes circular-spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                    <Crown size={18} strokeWidth={2.5} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#FBBF24', fontSize: '0.82rem', fontWeight: '800' }}>
                                        {displayPlan}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', fontWeight: '500' }}>
                                        Manage Plan
                                    </span>
                                </div>
                            </div>

                            {/* Integrated Dynamic Progress Circle */}
                            <div style={{
                                position: 'relative',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', position: 'absolute', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                    <circle
                                        cx="20" cy="20" r="18"
                                        fill="#FFFFFF"
                                        stroke="rgba(255,255,255,0.25)"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        fill="none"
                                        stroke="rgba(251, 191, 36, 0.45)"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                        style={{
                                            transformOrigin: '20px 20px',
                                            animation: 'circular-spin 6s linear infinite'
                                        }}
                                    />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        fill="none"
                                        stroke="#FBBF24"
                                        strokeWidth="3"
                                        strokeDasharray="113"
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                    />
                                </svg>
                                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, marginTop: '1px' }}>
                                    <span style={{ color: '#1E3A8A', fontSize: '0.72rem', fontWeight: '900', lineHeight: 1 }}>{displayDays}</span>
                                    <span style={{ color: '#1E3A8A', fontSize: '0.45rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.9 }}>Days</span>
                                </div>
                            </div>
                        </button>
                    );
                })()}


                {/* Bottom Settings Block */}
                <button
                    onClick={() => handleItemClick('Settings', isAdminMode ? '/admin/settings' : '/customization')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#FFFFFF',
                        color: (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#4F46E5' : '#1B6B3A') : '#334155',
                        borderRadius: '10px',
                        border: '1px solid #D8F3E5',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F9FBF9'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <SettingsIcon size={18} style={{ opacity: 0.8 }} />
                        <span>Settings</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>
 
                {/* Help & Support Block */}
                <button
                    onClick={() => handleItemClick('Help & Support', isAdminMode ? '/admin/faq' : (isSalesAgentMode ? '/sales-portal/faq' : '/faq'))}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#FFFFFF',
                        color: location.pathname.includes('/faq')
                            ? (isAdminMode ? '#4F46E5' : (isSalesAgentMode ? '#EA580C' : '#1B6B3A'))
                            : '#334155',
                        borderRadius: '10px',
                        border: '1px solid #D8F3E5',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#F9FBF9'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <HelpCircle size={18} style={{ opacity: 0.8 }} />
                        <span>Help & Support</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>
            </div>

            {/* Storage Allocation & Content Breakdown Modal */}
            <AnimatePresence>
                {isStorageModalOpen && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                        onClick={() => setIsStorageModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '680px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                fontFamily: "'Inter', sans-serif"
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid #F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        backgroundColor: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                    }}>
                                        <Cloud size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>
                                            Storage Allocation & Content
                                        </h3>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>
                                            Workspace Storage Breakdown (0 KB of 1 GB used)
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsStorageModalOpen(false)}
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #CBD5E1',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748B',
                                        transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
                                {/* Summary Stat Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Capacity</span>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>1.00 GB</div>
                                    </div>
                                    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>Used Storage</span>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1E40AF', marginTop: '2px' }}>0 KB (0%)</div>
                                    </div>
                                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#16A34A', textTransform: 'uppercase' }}>Free Available</span>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#15803D', marginTop: '2px' }}>1.00 GB</div>
                                    </div>
                                </div>

                                {/* Multi-Color Segmented Storage Quota Distribution Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>
                                        <span>Module Storage Quota Distribution</span>
                                        <span>100% Allocated</span>
                                    </div>
                                    <div style={{ display: 'flex', height: '10px', width: '100%', borderRadius: '999px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                                        <div style={{ width: '40%', backgroundColor: '#2563EB' }} title="Audit & Tax (FIN-PRO): 40%" />
                                        <div style={{ width: '25%', backgroundColor: '#10B981' }} title="Sales & Purchases: 25%" />
                                        <div style={{ width: '15%', backgroundColor: '#8B5CF6' }} title="Expenses: 15%" />
                                        <div style={{ width: '10%', backgroundColor: '#F59E0B' }} title="HR & Payroll: 10%" />
                                        <div style={{ width: '10%', backgroundColor: '#06B6D4' }} title="Inventory & Media: 10%" />
                                    </div>
                                </div>

                                {/* Table Requested by User */}
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569' }}>Module</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569', textAlign: 'center' }}>Typical Storage Share</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '750', color: '#475569' }}>Main File Types</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { module: 'Audit & Tax (FIN-PRO)', share: '40%', files: 'PDFs, XLS, Signed Certificates', color: '#2563EB', badgeBg: '#EFF6FF' },
                                                { module: 'Sales & Purchases', share: '25%', files: 'PDF Invoices, Vendor Bills', color: '#10B981', badgeBg: '#ECFDF5' },
                                                { module: 'Expenses', share: '15%', files: 'Receipt Scans, Images', color: '#8B5CF6', badgeBg: '#F5F3FF' },
                                                { module: 'HR & Payroll', share: '10%', files: 'ID Documents, Payslip PDFs', color: '#F59E0B', badgeBg: '#FFFBEB' },
                                                { module: 'Inventory & Media', share: '10%', files: 'Product Photos, Barcodes', color: '#06B6D4', badgeBg: '#ECFEFF' }
                                            ].map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid #F1F5F9' : 'none' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                                                        {item.module}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        <span style={{ backgroundColor: item.badgeBg, color: item.color, padding: '2px 8px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '800', border: `1px solid ${item.color}33` }}>
                                                            {item.share}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '500' }}>
                                                        {item.files}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid #F1F5F9',
                                backgroundColor: '#F8FAFC',
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={() => setIsStorageModalOpen(false)}
                                    style={{
                                        padding: '0.55rem 1.25rem',
                                        backgroundColor: '#2563EB',
                                        color: '#FFFFFF',
                                        borderRadius: '10px',
                                        border: 'none',
                                        fontWeight: '750',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                                    }}
                                >
                                    Close Breakdown
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </aside>
    );
};

export default Sidebar;
