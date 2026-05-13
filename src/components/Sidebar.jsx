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
    ShieldAlert
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import logoPng from '../assets/cliks5.png';

const MenuItem = ({ item, isChild = false, activeItem, openMenus, toggleMenu, handleItemClick }) => {
    const IconComp = item.icon;
    const isActive = activeItem === item.label;
    const hasChildren = !!item.children && item.children.length > 0;
    const isOpen = !!openMenus[item.label];
    const isChildActive = hasChildren && item.children.some(child => activeItem === child.label);

    if (hasChildren) {
        return (
            <div style={{ marginBottom: '6px' }}>
                <button
                    className={`sidebar-item`}
                    onClick={() => toggleMenu(item.label)}
                    style={{ 
                        justifyContent: 'space-between', 
                        width: '100%',
                        background: (isOpen || isChildActive) ? '#DCF2E4' : 'transparent',
                        boxShadow: isChildActive ? 'inset 4px 0 0 #1B6B3A' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <IconComp size={20} style={{ color: '#1B6B3A' }} />
                        <span className="sidebar-label" style={{ fontWeight: '750', color: '#135029' }}>{item.label}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', color: '#1B6B3A', opacity: 0.7 }}
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
                            <div style={{ borderLeft: '2px solid #DCF2E4', marginLeft: '1.5rem', marginTop: '6px', marginBottom: '6px', paddingLeft: '2px' }}>
                                {item.children.map((child) => (
                                    <MenuItem 
                                        key={child.label} 
                                        item={child} 
                                        isChild={true} 
                                        activeItem={activeItem}
                                        openMenus={openMenus}
                                        toggleMenu={toggleMenu}
                                        handleItemClick={handleItemClick}
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
                background: isActive ? '#1B6B3A' : 'transparent',
                color: isActive ? '#ffffff' : '#111827',
                borderLeft: isChild && isActive ? '3px solid #135029' : 'none'
            }}
        >
            <div className="flex items-center gap-3">
                <IconComp size={isChild ? 18 : 20} style={{ color: isActive ? '#ffffff' : '#1B6B3A' }} />
                <span className="sidebar-label">{item.label}</span>
            </div>
        </button>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveItemFromPath = (path) => {
        if (path.includes('/admin/dashboard')) return 'Admin Console';
        if (path.includes('/admin/users')) return 'Tenant Matrix';
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
        if (path.includes('/payments/split-collect')) return 'Split & Collect';
        if (path.includes('/referral')) return 'Refer & Earn';
        if (path.includes('/payments/bank-accounts')) return 'Bank Accounts';
        if (path.includes('/finance/expenses')) return 'Expenses';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/finance/gst')) return 'GST';
        if (path.includes('/hr/staff')) return 'Staff';
        if (path.includes('/hr/attendance')) return 'Attendance';
        if (path.includes('/hr/payroll')) return 'Payroll';
        if (path.includes('/marketing')) return 'Marketing';
        if (path.includes('/social/investors')) return 'Investors';
        if (path.includes('/social/meetup')) return 'Meetup';
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

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
    const [openMenus, setOpenMenus] = useState({});

    const navigationConfig = {
        admin: [
            { label: 'Admin Console', icon: Activity, path: '/admin/dashboard' },
            { label: 'Tenant Matrix', icon: Users, path: '/admin/users' },
            { label: 'Feed Monitor', icon: ShieldAlert, path: '/admin/moderation' },
            { label: 'Audit Trail', icon: FileCheck, path: '/admin/logs' },
            { label: 'Engine Overrides', icon: Sliders, path: '/admin/settings' }
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
            { label: 'Investors', icon: UsersRound, path: '/social/investors' },
            { label: 'Meetup', icon: Calendar, path: '/social/meetup' }
        ],
        financeMode: [
            { label: 'Transaction', icon: CreditCard, path: '/payments/transaction' },
            { label: 'Bank Accounts', icon: Building, path: '/payments/bank-accounts' },
            { label: 'Split & Collect', icon: Split, path: '/payments/split-collect' }
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
                            <button
                                key={item.label}
                                className={`sidebar-item ${activeItem === item.label ? 'active' : ''}`}
                                onClick={() => handleItemClick(item.label, item.path)}
                                style={{ 
                                    marginBottom: '6px',
                                    background: activeItem === item.label ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' : 'transparent',
                                    color: activeItem === item.label ? '#ffffff' : '#1E293B',
                                    boxShadow: activeItem === item.label ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} style={{ color: activeItem === item.label ? '#ffffff' : '#4F46E5' }} />
                                    <span className="sidebar-label" style={{ fontWeight: 750 }}>{item.label}</span>
                                </div>
                            </button>
                        ))}
                    </>
                ) : isSocialMode ? (
                    <>
                        <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social</div>
                        {navigationConfig.social.map(item => <MenuItem key={item.label} item={item} activeItem={activeItem} openMenus={openMenus} toggleMenu={toggleMenu} handleItemClick={handleItemClick} />)}
                    </>
                ) : isFinanceMode ? (
                    <>
                        <div className="sidebar-nav-header" style={{ padding: '0.5rem 1.25rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance</div>
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
                {!isSocialMode && !isFinanceMode && !isAdminMode && (
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

                {/* Refer & Earn Block */}
                {(isFinanceMode || isSocialMode) && (
                    <button
                        onClick={() => handleItemClick('Refer & Earn', '/referral')}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.75rem 0.6rem 0.85rem',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                            color: '#FFFFFF',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '48px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(139, 92, 246, 0.35)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.25)';
                        }}
                    >
                        {/* Background ambient accent circle */}
                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            bottom: '-10px',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            zIndex: 0
                        }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                            <div style={{ 
                                background: 'rgba(255, 255, 255, 0.2)', 
                                padding: '6px', 
                                borderRadius: '8px', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <Gift size={18} strokeWidth={2.5} color="#FFFFFF" />
                            </div>
                            <span style={{ fontWeight: '800', letterSpacing: '0.2px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Refer & Earn</span>
                        </div>
                        
                        <div style={{ 
                            background: '#FFFFFF', 
                            color: '#6366F1', 
                            padding: '2px 8px', 
                            borderRadius: '20px', 
                            fontSize: '0.7rem', 
                            fontWeight: '900',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 1,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Earn
                        </div>
                    </button>
                )}

                {/* Bottom Settings Block (Replaced 'My Company' from example) */}
                <button
                    onClick={() => handleItemClick('Settings', '/settings')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: location.pathname.includes('/settings') ? '#F0FDF4' : '#F8FAFC',
                        color: location.pathname.includes('/settings') ? '#1B6B3A' : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: location.pathname.includes('/settings') ? '#BBF7D0' : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/settings') ? '#F0FDF4' : '#F1F5F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/settings') ? '#F0FDF4' : '#F8FAFC'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <SettingsIcon size={18} style={{ opacity: 0.8 }} />
                        <span>Settings</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>

                {/* Help & Support Block */}
                <button
                    onClick={() => handleItemClick('Help & Support', '/faq')}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: location.pathname.includes('/faq') ? '#F0FDF4' : '#F8FAFC',
                        color: location.pathname.includes('/faq') ? '#1B6B3A' : '#334155',
                        borderRadius: '10px',
                        border: '1px solid',
                        borderColor: location.pathname.includes('/faq') ? '#BBF7D0' : '#E2E8F0',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = location.pathname.includes('/faq') ? '#F0FDF4' : '#F1F5F9'}
                    onMouseOut={(e) => e.currentTarget.style.background = location.pathname.includes('/faq') ? '#F0FDF4' : '#F8FAFC'}
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
