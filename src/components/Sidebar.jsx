import React, { useState } from 'react';
import { Tooltip } from './common';
import {
    LayoutDashboard,
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
    ChevronRight
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import logoPng from '../assets/cliks5.png';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveItemFromPath = (path) => {
        if (path.includes('/business/dashboard')) return 'Dashboard';
        if (path.includes('/business/billing')) return 'Billing';
        if (path.includes('/business/orders')) return 'Orders';
        if (path.includes('/business/delivery')) return 'Delivery';
        if (path.includes('/business/crm')) return 'Customers';
        if (path.includes('/business/returns')) return 'Returns';
        if (path.includes('/business/inventory')) return 'Products';
        if (path.includes('/business/barcode')) return 'Barcode Gen';
        if (path.includes('/business/stock')) return 'Stock';
        if (path.includes('/business/purchases')) return 'Purchases';
        if (path.includes('/business/suppliers')) return 'Suppliers';
        if (path.includes('/business/warehouse')) return 'Warehouse';
        if (path.includes('/business/accounting')) return 'Accounting';
        if (path.includes('/business/payments')) return 'Transaction';
        if (path.includes('/business/segregation')) return 'Split & Collect';
        if (path.includes('/business/referral')) return 'Refer & Earn';
        if (path.includes('/business/bank-accounts')) return 'Bank Accounts';
        if (path.includes('/business/expenses')) return 'Expenses';
        if (path.includes('/business/reports')) return 'Reports';
        if (path.includes('/business/gst')) return 'GST';
        if (path.includes('/business/staffing')) return 'Staff';
        if (path.includes('/business/attendance')) return 'Attendance';
        if (path.includes('/business/payroll')) return 'Payroll';
        if (path.includes('/business/marketing')) return 'Campaigns';
        if (path.includes('/business/investors')) return 'Investors';
        if (path.includes('/business/meetup')) return 'Meetup';
        if (path.includes('/subscription')) return 'Subscription';
        if (path.includes('/settings')) return 'Business Settings';
        if (path.includes('/faq')) return 'Backup & Sync';
        return 'Dashboard';
    };

    const isSocialMode = location.pathname.includes('/business/investors') || location.pathname.includes('/business/meetup');
    const isFinanceMode = location.pathname.includes('/business/payments') || location.pathname.includes('/business/segregation') || location.pathname.includes('/business/referral') || location.pathname.includes('/business/bank-accounts');

    const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
    const [openMenus, setOpenMenus] = useState({});

    const navigationConfig = {
        standard: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
            {
                label: 'Finance',
                icon: Banknote,
                children: [
                    { label: 'Accounting', icon: Calculator, path: '/business/accounting' },
                    { label: 'Expenses', icon: TrendingUp, path: '/business/expenses' },
                    { label: 'GST', icon: PercentCircle, path: '/business/gst' },
                    { label: 'Reports', icon: BarChart3, path: '/business/reports' }
                ]
            },
            {
                label: 'Sales',
                icon: ShoppingCart,
                children: [
                    { label: 'Billing', icon: Banknote, path: '/business/billing' },
                    { label: 'Orders', icon: ShoppingCart, path: '/business/orders' },
                    { label: 'Customers', icon: Users, path: '/business/crm' },
                    { label: 'Returns', icon: ArrowDownRight, path: '/business/returns' }
                ]
            },
            {
                label: 'Purchases',
                icon: ShoppingCart,
                children: [
                    { label: 'Purchases', icon: ShoppingCart, path: '/business/purchases' },
                    { label: 'Suppliers', icon: UsersRound, path: '/business/suppliers' }
                ]
            },
            {
                label: 'Inventory',
                icon: Package,
                children: [
                    { label: 'Products', icon: Package, path: '/business/inventory' },
                    { label: 'Stock', icon: Layers, path: '/business/stock' },
                    { label: 'Warehouse', icon: MapPin, path: '/business/warehouse' },
                    { label: 'Barcode Gen', icon: Barcode, path: '/business/barcode' }
                ]
            },
            {
                label: 'HR',
                icon: UsersRound,
                children: [
                    { label: 'Staff', icon: UsersRound, path: '/business/staffing' },
                    { label: 'Attendance', icon: Calendar, path: '/business/attendance' },
                    { label: 'Payroll', icon: FileCheck, path: '/business/payroll' }
                ]
            },
            {
                label: 'Subscription',
                icon: CreditCard,
                path: '/business/subscription'
            },
            {
                label: 'Settings',
                icon: SettingsIcon,
                children: [
                    { label: 'Business Settings', icon: SettingsIcon, path: '/settings' },
                    { label: 'Backup & Sync', icon: RefreshCw, path: '/faq' }
                ]
            }
        ],
        social: [
            { label: 'Investors', icon: UsersRound, path: '/business/investors' },
            { label: 'Meetup', icon: Calendar, path: '/business/meetup' }
        ],
        financeMode: [
            { label: 'Transaction', icon: CreditCard, path: '/business/payments' },
            { label: 'Bank Accounts', icon: Building, path: '/business/bank-accounts' },
            { label: 'Split & Collect', icon: Split, path: '/business/segregation' },
            { label: 'Refer & Earn', icon: Gift, path: '/business/referral' }
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

    const MenuItem = ({ item, isChild = false }) => {
        const IconComp = item.icon;
        const isActive = activeItem === item.label;
        const hasChildren = !!item.children && item.children.length > 0;
        const isOpen = !!openMenus[item.label];

        if (hasChildren) {
            return (
                <div style={{ marginBottom: '2px' }}>
                    <button
                        className={`sidebar-item`}
                        onClick={() => toggleMenu(item.label)}
                        style={{ 
                            justifyContent: 'space-between', 
                            width: '100%',
                            background: isOpen ? '#DCF2E4' : 'transparent',
                            transition: 'background 0.2s ease'
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
                                <div style={{ borderLeft: '2px solid #DCF2E4', marginLeft: '1.5rem', marginTop: '2px', marginBottom: '4px', paddingLeft: '2px' }}>
                                    {item.children.map((child) => (
                                        <MenuItem key={child.label} item={child} isChild={true} />
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
                    marginBottom: '2px',
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

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: 'transparent' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '24px', height: '24px' }} />
                </div>
                <h2 className="app-title">CLIKS BUS</h2>
            </div>

            <nav className="sidebar-nav" style={{ overflowY: 'auto', padding: '0.75rem' }}>
                {isSocialMode ? (
                    <>
                        <div style={{ padding: '0.5rem 1.25rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social</div>
                        {navigationConfig.social.map(item => <MenuItem key={item.label} item={item} />)}
                    </>
                ) : isFinanceMode ? (
                    <>
                        <div style={{ padding: '0.5rem 1.25rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance</div>
                        {navigationConfig.financeMode.map(item => <MenuItem key={item.label} item={item} />)}
                    </>
                ) : (
                    <>
                        {navigationConfig.standard.map(item => (
                            <MenuItem key={item.label} item={item} />
                        ))}
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
