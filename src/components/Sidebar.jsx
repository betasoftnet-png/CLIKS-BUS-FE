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
    Building
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';
import logoPng from '../assets/image copy.png';

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

    React.useEffect(() => {
        const newItem = getActiveItemFromPath(location.pathname);
        setActiveItem(newItem);
    }, [location.pathname]);

    const handleItemClick = (label, path) => {
        setActiveItem(label);
        if (path) navigate(path);
        if (onClose && typeof window !== 'undefined' && window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="brand-logo" style={{ background: 'transparent' }}>
                    <img src={logoPng} alt="CLIKS Logo" style={{ width: '24px', height: '24px' }} />
                </div>
                <h2 className="app-title">CLIKS BUS</h2>
            </div>

            <nav className="sidebar-nav">
                {isSocialMode ? (
                    <>
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Investors' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Investors', '/business/investors')}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Investors</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Meetup' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Meetup', '/business/meetup')}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Meetup</span>
                            </div>
                        </button>
                    </>
                ) : isFinanceMode ? (
                    <>
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Transaction' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Transaction', '/business/payments')}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Transaction</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Bank Accounts' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Bank Accounts', '/business/bank-accounts')}
                        >
                            <div className="flex items-center gap-3">
                                <Building size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Bank Accounts</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Split & Collect' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Split & Collect', '/business/segregation')}
                        >
                            <div className="flex items-center gap-3">
                                <Split size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Split & Collect</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Refer & Earn' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Refer & Earn', '/business/referral')}
                        >
                            <div className="flex items-center gap-3">
                                <Gift size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Refer & Earn</span>
                            </div>
                        </button>
                    </>
                ) : (
                    <>
                        {/* Dashboard */}
                        <button
                            className={`sidebar-item ${activeItem === 'Dashboard' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Dashboard', '/business/dashboard')}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutDashboard size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Dashboard</span>
                            </div>
                        </button>

                        {/* Finance */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Accounting' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Accounting', '/business/accounting')}
                        >
                            <div className="flex items-center gap-3">
                                <Calculator size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Accounting</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Expenses' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Expenses', '/business/expenses')}
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Expenses</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'GST' ? 'active' : ''}`}
                            onClick={() => handleItemClick('GST', '/business/gst')}
                        >
                            <div className="flex items-center gap-3">
                                <PercentCircle size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">GST</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Reports' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Reports', '/business/reports')}
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Reports</span>
                            </div>
                        </button>

                        {/* Sales */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Billing' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Billing', '/business/billing')}
                        >
                            <div className="flex items-center gap-3">
                                <Banknote size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Billing</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Orders' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Orders', '/business/orders')}
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Orders</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Customers' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Customers', '/business/crm')}
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Customers</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Returns' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Returns', '/business/returns')}
                        >
                            <div className="flex items-center gap-3">
                                <ArrowDownRight size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Returns</span>
                            </div>
                        </button>

                        {/* Purchases */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purchases</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Purchases' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Purchases', '/business/purchases')}
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingCart size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Purchases</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Suppliers' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Suppliers', '/business/suppliers')}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Suppliers</span>
                            </div>
                        </button>

                        {/* Inventory */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Products' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Products', '/business/inventory')}
                        >
                            <div className="flex items-center gap-3">
                                <Package size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Products</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Stock' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Stock', '/business/stock')}
                        >
                            <div className="flex items-center gap-3">
                                <Layers size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Stock</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Warehouse' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Warehouse', '/business/warehouse')}
                        >
                            <div className="flex items-center gap-3">
                                <MapPin size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Warehouse</span>
                            </div>
                        </button>

                        {/* Manufacturing */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manufacturing</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Manufacturing' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Manufacturing', '/business/manufacturing')}
                        >
                            <div className="flex items-center gap-3">
                                <Cpu size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Manufacturing</span>
                            </div>
                        </button>

                        {/* HR */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HR</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Staff' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Staff', '/business/staffing')}
                        >
                            <div className="flex items-center gap-3">
                                <UsersRound size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Staff</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Attendance' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Attendance', '/business/attendance')}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Attendance</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Payroll' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Payroll', '/business/payroll')}
                        >
                            <div className="flex items-center gap-3">
                                <FileCheck size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Payroll</span>
                            </div>
                        </button>

                        {/* Settings */}
                        <div style={{ padding: '1.25rem 1.5rem 0.5rem', color: '#94A3B8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</div>
                        <button
                            className={`sidebar-item ${activeItem === 'Subscription' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Subscription', '/business/subscription')}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Subscription</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Business Settings' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Business Settings', '/settings')}
                        >
                            <div className="flex items-center gap-3">
                                <SettingsIcon size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Business Settings</span>
                            </div>
                        </button>
                        <button
                            className={`sidebar-item ${activeItem === 'Backup & Sync' ? 'active' : ''}`}
                            onClick={() => handleItemClick('Backup & Sync', '/faq')}
                        >
                            <div className="flex items-center gap-3">
                                <RefreshCw size={20} style={{ color: '#1B6B3A' }} />
                                <span className="sidebar-label">Backup & Sync</span>
                            </div>
                        </button>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
