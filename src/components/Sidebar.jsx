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
    LineChart
} from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import logoPng from '../assets/cliks5.png';

const MenuItem = ({ item, isChild = false, activeItem, openMenus, toggleMenu, handleItemClick, isAdmin = false, isSales = false }) => {
    const IconComp = item.icon;
    const isActive = activeItem === item.label;
    const hasChildren = !!item.children && item.children.length > 0;
    const isOpen = !!openMenus[item.label];
    const isChildActive = hasChildren && item.children.some(child => activeItem === child.label);

    // Dynamic styling variables mapping User Green vs Admin Indigo vs Sales Orange
    const primaryColor = isSales ? '#EA580C' : (isAdmin ? '#4F46E5' : '#1B6B3A');
    const activeBg = isSales ? '#FFF7ED' : (isAdmin ? '#EEF2FF' : '#DCF2E4');
    const activeText = isActive ? '#ffffff' : (isSales ? '#EA580C' : (isAdmin ? '#1E293B' : '#111827'));
    const darkTextColor = isSales ? '#9A3412' : (isAdmin ? '#3730A3' : '#135029');
    
    let backgroundStyle = 'transparent';
    if (isActive) {
        if (isSales) {
            backgroundStyle = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
        } else if (isAdmin) {
            backgroundStyle = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
        } else {
            backgroundStyle = '#1B6B3A';
        }
    }

    if (hasChildren) {
        return (
            <div style={{ marginBottom: '6px' }}>
                <button
                    className={`sidebar-item`}
                    onClick={() => toggleMenu(item.label)}
                    style={{ 
                        justifyContent: 'space-between', 
                        width: '100%',
                        background: (isOpen || isChildActive) ? activeBg : 'transparent',
                        boxShadow: isChildActive ? `inset 4px 0 0 ${primaryColor}` : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <IconComp size={20} style={{ color: primaryColor }} />
                        <span className="sidebar-label" style={{ fontWeight: '750', color: darkTextColor }}>{item.label}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', color: primaryColor, opacity: 0.7 }}
                    >
                        <ChevronRight size={16} />
                    </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ borderLeft: `2px solid ${activeBg}`, marginLeft: '1.5rem', marginTop: '6px', marginBottom: '6px', paddingLeft: '2px' }}>
                                {item.children.map((child) => (
                                    <MenuItem 
                                        key={child.label} 
                                        item={child} 
                                        isChild={true} 
                                        activeItem={activeItem}
                                        openMenus={openMenus}
                                        toggleMenu={toggleMenu}
                                        handleItemClick={handleItemClick}
                                        isAdmin={isAdmin}
                                        isSales={isSales}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                borderLeft: isChild && isActive ? `3px solid ${isSales ? '#EA580C' : (isAdmin ? '#3730A3' : '#135029')}` : 'none',
                boxShadow: isActive && (isAdmin || isSales) ? `0 4px 12px ${isSales ? 'rgba(234, 88, 12, 0.2)' : 'rgba(79, 70, 229, 0.2)'}` : 'none'
            }}
        >
            <div className="flex items-center gap-3">
                <IconComp size={isChild ? 18 : 20} style={{ color: isActive ? '#ffffff' : primaryColor }} />
                <span className="sidebar-label" style={{ fontWeight: isActive ? '750' : 'inherit' }}>{item.label}</span>
            </div>
        </button>
    );
};

const Sidebar = ({ isOpen, onClose, onReferralClick }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveItemFromPath = (path) => {
        if (path.includes('/admin/dashboard')) return 'Admin Console';
        if (path.includes('/admin/users')) return 'Tenant Matrix';
        if (path.includes('/admin/sales-team')) return 'Sales Team';
        if (path.includes('/admin/sales-leads')) return 'Leads Matrix';
        if (path.includes('/admin/sales')) return 'Platform Sales';
        if (path.includes('/sales-portal/dashboard')) return 'Sales Overview';
        if (path.includes('/sales-portal/leads')) return 'My Prospects';
        if (path.includes('/admin/moderation')) return 'Feed Monitor';
        if (path.includes('/admin/logs')) return 'Audit Trail';
        if (path.includes('/admin/settings')) return 'Engine Overrides';
        if (path.includes('/sales/pos')) return 'POS Billing';
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/sales/invoice')) return 'Sales Invoice';
        if (path.includes('/sales/orders')) return 'Orders';
        if (path.includes('/sales/delivery')) return 'Delivery';
        if (path.includes('/sales/customers')) return 'Customers';
        if (path.includes('/sales/returns')) return 'Returns';
        if (path.includes('/inventory/products')) return 'Products';
        if (path.includes('/inventory/barcode')) return 'Barcode Gen';
        if (path.includes('/inventory/stock')) return 'Stock';
        if (path.includes('/purchases/purchases')) return 'Purchases';
        if (path.includes('/purchases/suppliers')) return 'Suppliers';
        if (path.includes('/inventory/warehouse')) return 'Warehouse';
        if (path.includes('/finance/accounting')) return 'Accounting';
        if (path.includes('/payments/transaction')) return 'Transaction';
        if (path.includes('/payments/wallet')) return 'Wallet';
        if (path.includes('/payments/segregation')) return 'Segregation';
        if (path.includes('/payments/split-collect')) return 'Split & Collect';
        if (path.includes('/payments/rewards')) return 'Rewards & Offers';
        if (path.includes('/payments/people')) return 'People';

        if (path.includes('/referral')) return 'Refer & Earn';
        if (path.includes('/payments/bank-accounts')) return 'Bank Accounts';
        if (path.includes('/finance/expenses')) return 'Expenses';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/finance/gst')) return 'GST';
        if (path.includes('/hr/staff')) return 'Staff';
        if (path.includes('/hr/attendance')) return 'Attendance';
        if (path.includes('/hr/payroll')) return 'Payroll';
        if (path.includes('/marketing')) return 'Marketing';
        if (path.includes('/social/investors')) return 'Beta Club';
        if (path.includes('/social/meetup')) return 'Meetup';
        if (path.includes('/social/trading')) return 'Social Trading';
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

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
    const [openMenus, setOpenMenus] = useState({});

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
            { label: 'Feed Monitor', icon: ShieldAlert, path: '/admin/moderation' },
            { label: 'Audit Trail', icon: FileCheck, path: '/admin/logs' },
            { label: 'Engine Overrides', icon: Sliders, path: '/admin/settings' }
        ],
        salesAgent: [
            { label: 'Sales Overview', icon: LayoutDashboard, path: '/sales-portal/dashboard' },
            { label: 'My Prospects', icon: Users, path: '/sales-portal/leads' }
        ],
        standard: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
                label: 'Finance',
                icon: Banknote,
                children: [
                    { label: 'Accounting', icon: Calculator, path: '/finance/accounting' },
                    { label: 'Expenses', icon: TrendingUp, path: '/finance/expenses' },
                    { label: 'GST', icon: PercentCircle, path: '/finance/gst' }
                ]
            },
            {
                label: 'Sales',
                icon: ShoppingCart,
                children: [
                    { label: 'Sales Invoice', icon: Receipt, path: '/sales/invoice' },
                    { label: 'Orders', icon: ShoppingCart, path: '/sales/orders' },
                    { label: 'Customers', icon: Users, path: '/sales/customers' },
                    { label: 'Returns', icon: ArrowDownRight, path: '/sales/returns' }
                ]
            },
            {
                label: 'Purchases',
                icon: ShoppingCart,
                children: [
                    { label: 'Purchases', icon: ShoppingCart, path: '/purchases/purchases' },
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
            { label: 'POS Billing', icon: Monitor, path: '/sales/pos' },
            { label: 'Reports', icon: BarChart3, path: '/reports' },
            { label: 'Barcode Gen', icon: Barcode, path: '/inventory/barcode' },
            { label: 'Marketing', icon: Megaphone, path: '/marketing' }

        ],
        social: [
            { label: 'Beta Club', icon: UsersRound, path: '/social/investors' },
            { label: 'Meetup', icon: Calendar, path: '/social/meetup' },
            { label: 'Social Trading', icon: LineChart, path: '/social/trading' }
        ],
        financeMode: [
            { label: 'Transaction', icon: CreditCard, path: '/payments/transaction' },
            { label: 'Wallet', icon: Wallet, path: '/payments/wallet' },
            { label: 'Segregation', icon: Target, path: '/payments/segregation' },
            // { label: 'Bank Accounts', icon: Building, path: '/payments/bank-accounts' }, // Will do in future
            { label: 'Split & Collect', icon: Split, path: '/payments/split-collect' },
            { label: 'Rewards & Offers', icon: Gift, path: '/payments/rewards' },
            { label: 'People', icon: Users, path: '/payments/people' }
        ]

    };

    // Smart Expansion Detection
    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname);
        setActiveItem(newItem);
        
        navigationConfig.standard.forEach(item => {
            if (item.children && item.children.some(child => location.pathname.includes(child.path))) {
                setOpenMenus(prev => ({ ...prev, [item.label]: true }));
            }
        });
        navigationConfig.admin.forEach(item => {
            if (item.children && item.children.some(child => location.pathname.includes(child.path))) {
                setOpenMenus(prev => ({ ...prev, [item.label]: true }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        if (path) navigate(path);
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

            <nav className="sidebar-nav" style={{ overflowY: 'auto', padding: '0.75rem' }}>
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
                ) : isSocialMode ? (
                    <>
                        <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social</div>
                        {navigationConfig.social.map(item => <MenuItem key={item.label} item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />)}
                    </>
                ) : isFinanceMode ? (
                    <>
                        {/* No "Finance" title - removed per user request */}
                        {/* Add Money CTA - shows on all Finance mode pages */}
                        <button
                            onClick={() => handleItemClick('Wallet', '/payments/wallet?addMoney=true')}
                            style={{
                                width: 'calc(100% - 2rem)',
                                margin: '0.5rem 1rem 0.25rem 1rem',
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
                        {navigationConfig.financeMode.map(item => <MenuItem key={item.label} item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />)}
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

            {/* Refer & Earn Block (Moved outside the white footer box as requested) */}
            {(isFinanceMode || isSocialMode) && (
                <div style={{ padding: '1.25rem 1rem 1rem 1rem', flexShrink: 0 }}>
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
                            padding: '0.65rem 1rem',
                            background: 'transparent',
                            color: '#0F172A',
                            borderRadius: '12px',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none',
                            marginTop: '0.6rem'
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

            {/* Fixed Sidebar Footer - Relocated based on User Specification */}
            <div style={{ 
                padding: '1rem', 
                borderTop: '1px solid #F1F5F9', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.6rem',
                flexShrink: 0,
                background: '#FFFFFF'
            }}>
                {/* Unified Subscription Conversion Card (Requested 'Connected' Look) */}
                {!isSocialMode && !isFinanceMode && !isAdminMode && !isSalesAgentMode && (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                <Crown size={18} strokeWidth={2.5} />
                            </div>
                            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)', color: '#FBBF24' }}>Get Subscription</span>
                        </div>
                        
                        {/* Integrated Dynamic Progress Circle requested by user */}
                        <div style={{ 
                            position: 'relative',
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {/* Background Circular Track & Filled Disc using SVG */}
                            <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)', position: 'absolute', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                {/* Inner solid white disc and container circle */}
                                <circle 
                                    cx="20" cy="20" r="18" 
                                    fill="#FFFFFF" 
                                    stroke="rgba(255,255,255,0.25)" 
                                    strokeWidth="3" 
                                />
                                {/* Gold Dynamic Progress Arc overlay (calculating ratio 20/30) */}
                                <circle 
                                    cx="20" cy="20" r="18" 
                                    fill="none" 
                                    stroke="#FBBF24" 
                                    strokeWidth="3" 
                                    strokeDasharray="113" /* 2 * PI * r(18) */
                                    strokeDashoffset={113 * (1 - 20 / 30)} 
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                            </svg>
                            {/* Center Content positioned on top */}
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, marginTop: '1px' }}>
                                <span style={{ color: '#1E3A8A', fontSize: '0.72rem', fontWeight: '900', lineHeight: 1 }}>20</span>
                                <span style={{ color: '#1E3A8A', fontSize: '0.45rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.9 }}>Days</span>
                            </div>
                        </div>
                    </button>
                )}



                {/* Bottom Settings Block (Replaced 'My Company' from example) */}
                <button
                    // onClick={() => handleItemClick('Settings', isAdminMode ? '/admin/settings' : '/settings')}
                    onClick={() => handleItemClick('Settings', isAdminMode ? '/admin/settings' : '/customization')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        // background: location.pathname.includes('/settings') ? (isAdminMode ? '#EEF2FF' : '#F0FDF4') : '#F8FAFC',
                        background: (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#EEF2FF' : '#F0FDF4') : '#F8FAFC',
                        // color: location.pathname.includes('/settings') ? (isAdminMode ? '#4F46E5' : '#1B6B3A') : '#334155',
                        color: (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#4F46E5' : '#1B6B3A') : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        // borderColor: location.pathname.includes('/settings') ? (isAdminMode ? '#C7D2FE' : '#BBF7D0') : '#E2E8F0',
                        borderColor: (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#C7D2FE' : '#BBF7D0') : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    // onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/settings') ? (isAdminMode ? '#E0E7FF' : '#F0FDF4') : '#F1F5F9'}
                    onMouseOver={(e) => e.currentTarget.style.background = (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#E0E7FF' : '#F0FDF4') : '#F1F5F9'}
                    // onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/settings') ? (isAdminMode ? '#EEF2FF' : '#F0FDF4') : '#F8FAFC'}
                    onMouseOut={(e) => e.currentTarget.style.background = (location.pathname.includes('/settings') || location.pathname.includes('/customization')) ? (isAdminMode ? '#EEF2FF' : '#F0FDF4') : '#F8FAFC'}
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
                        background: location.pathname.includes('/faq') 
                            ? (isAdminMode ? '#EEF2FF' : (isSalesAgentMode ? '#FFF7ED' : '#F0FDF4')) 
                            : '#F8FAFC',
                        color: location.pathname.includes('/faq') 
                            ? (isAdminMode ? '#4F46E5' : (isSalesAgentMode ? '#EA580C' : '#1B6B3A')) 
                            : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: location.pathname.includes('/faq') 
                            ? (isAdminMode ? '#C7D2FE' : (isSalesAgentMode ? '#FED7AA' : '#BBF7D0')) 
                            : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/faq') 
                        ? (isAdminMode ? '#E0E7FF' : (isSalesAgentMode ? '#FFEDD5' : '#F0FDF4')) 
                        : '#F1F5F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/faq') 
                        ? (isAdminMode ? '#EEF2FF' : (isSalesAgentMode ? '#FFF7ED' : '#F0FDF4')) 
                        : '#F8FAFC'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <HelpCircle size={18} style={{ opacity: 0.8 }} />
                        <span>Help & Support</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
