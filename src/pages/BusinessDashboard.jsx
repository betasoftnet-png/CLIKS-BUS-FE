import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Briefcase, 
    BarChart3, 
    Users, 
    TrendingUp, 
    DollarSign, 
    Package, 
    ShoppingCart,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell,
    Plus,
    X,
    Settings,
    UserPlus,
    FileText
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services';

const MASTER_SHORTCUTS = [
    { id: 'new_invoice', label: 'New Invoice', path: '/sales/invoice?create=true', icon: DollarSign, color: '#1B6B3A' },
    { id: 'sales_orders', label: 'Sales Orders', path: '/sales/orders', icon: ShoppingCart, color: '#2563EB' },
    { id: 'new_product', label: 'Add Product', path: '/inventory/products?create=true', icon: Package, color: '#EA580C' },
    { id: 'pos_billing', label: 'POS Billing', path: '/sales/pos', icon: LayoutDashboard, color: '#0D9488' },
    { id: 'expenses', label: 'Add Expense', path: '/finance/expenses?create=true', icon: TrendingUp, color: '#DC2626' },
    { id: 'attendance', label: 'Attendance', path: '/hr/attendance', icon: Clock, color: '#0891B2' },
    { id: 'suppliers', label: 'Suppliers', path: '/purchases/suppliers?create=true', icon: Users, color: '#7C3AED' },
    // { id: 'bank_accounts', label: 'Bank Accounts', path: '/payments/bank-accounts?create=true', icon: Briefcase, color: '#4F46E5' }, // Will do in future
    
    // 🚀 Brand New Expansion Triggers
    { id: 'new_customer', label: 'Add Customer', path: '/sales/customers?create=true', icon: UserPlus, color: '#EC4899' },
    { id: 'new_purchase', label: 'New Purchase PO', path: '/purchases/purchases?create=true', icon: ShoppingCart, color: '#4338CA' },
    { id: 'staff_claim', label: 'Staff Claim', path: '/finance/expenses?claim=true', icon: FileText, color: '#BE185D' },
    { id: 'onboard_staff', label: 'Onboard Staff', path: '/hr/staff?create=true', icon: UserPlus, color: '#059669' },
    { id: 'gst_filing', label: 'GST Records', path: '/finance/gst', icon: BarChart3, color: '#F59E0B' },
    { id: 'marketing_hub', label: 'Marketing Hub', path: '/marketing', icon: Target, color: '#E11D48' },
];

const BusinessDashboard = () => {
    const navigate = useNavigate();
    const [selectedShortcuts, setSelectedShortcuts] = useState(() => {
        const saved = localStorage.getItem('cliks_dashboard_shortcuts');
        return saved ? JSON.parse(saved) : ['new_invoice', 'sales_orders', 'new_product', 'pos_billing'];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleShortcut = (id) => {
        setSelectedShortcuts(prev => {
            const next = prev.includes(id) 
                ? prev.filter(s => s !== id) 
                : [...prev, id];
            localStorage.setItem('cliks_dashboard_shortcuts', JSON.stringify(next));
            return next;
        });
    };

    // Fetch live dashboard summary
    const { data: summary } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: reportsService.getDashboardSummary
    });

    // Fetch live sales chart data
    const { data: chartSales } = useQuery({
        queryKey: ['dashboardChartSales'],
        queryFn: reportsService.getChartSales
    });

    const stats = [
        { label: 'Total Sales Revenue', value: summary?.total_sales !== undefined ? `₹${(summary.total_sales).toLocaleString()}` : '₹0', change: 'Live', icon: DollarSign, color: '#1B6B3A' },
        { label: 'Total Purchases', value: summary?.total_purchases !== undefined ? `₹${(summary.total_purchases).toLocaleString()}` : '₹0', change: 'Live', icon: Briefcase, color: '#064E3B' },
        { label: 'Total Expenses', value: summary?.total_expenses !== undefined ? `₹${(summary.total_expenses).toLocaleString()}` : '₹0', change: 'Live', icon: TrendingUp, color: '#059669' },
        { label: 'System Health', value: summary?.status ? summary.status.toUpperCase() : 'HEALTHY', change: 'Live', icon: Users, color: '#10B981' }
    ];

    return (
        <div className="premium-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
            {/* Header */}
            <div className="dashboard-header" style={{ flexShrink: 0 }}>
                <div className="dashboard-header-title">
                    <h1>Business Overview</h1>
                    <p>Monitor your enterprise performance and operations.</p>
                </div>
                <div className="dashboard-header-actions">
                    <div className="dashboard-search-wrapper">
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search analytics..." 
                            className="dashboard-search-input"
                        />
                    </div>
                    <button style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B' }}>
                        <Bell size={20} />
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ 
                            padding: '0.65rem 1.5rem', 
                            borderRadius: '12px', 
                            background: '#1B6B3A', 
                            color: 'white', 
                            border: 'none', 
                            fontWeight: '700', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.15)'
                        }}
                    >
                        <Settings size={16} /> Customise
                    </button>
                </div>
            </div>

            {/* Scrollable Dashboard Content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>
                {/* Stats Grid */}
                <div className="dashboard-stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="dashboard-stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', background: '#F0FDF4', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{stat.change}</span>
                        </div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions Row */}
            <div style={{ marginTop: '2.25rem', marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', marginBottom: '1.25rem', letterSpacing: '-0.3px' }}>Quick Action Center</h2>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {MASTER_SHORTCUTS.filter(s => selectedShortcuts.includes(s.id)).map(shortcut => {
                        const Icon = shortcut.icon;
                        return (
                            <button
                                key={shortcut.id}
                                onClick={() => navigate(shortcut.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.85rem',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '16px',
                                    background: 'white',
                                    border: '1px solid #E2E8F0',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = shortcut.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                            >
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '10px', 
                                    background: `${shortcut.color}12`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: shortcut.color 
                                }}>
                                    <Icon size={16} strokeWidth={2.5} />
                                </div>
                                <span style={{ fontWeight: '750', fontSize: '0.9rem', color: '#1E293B' }}>{shortcut.label}</span>
                            </button>
                        );
                    })}
                    
                    {/* Add/Manage Button Card */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '16px',
                            background: 'transparent',
                            border: '2px dashed #CBD5E1',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: '#64748B'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#1B6B3A';
                            e.currentTarget.style.color = '#1B6B3A';
                            e.currentTarget.style.background = '#F0FDF4';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.color = '#64748B';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        <span style={{ fontWeight: '750', fontSize: '0.9rem' }}>Manage Shortcuts</span>
                    </button>
                </div>
            </div>

            {/* Charts & Activity */}
            <div className="content-grid">
                <div className="dashboard-main-col">
                    {/* Revenue Chart */}
                    <div className="dashboard-chart-card">
                        <div className="dashboard-chart-header">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B' }}>Revenue Performance</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#1B6B3A' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B6B3A' }} /> Sales
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#DCF2E4' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DCF2E4' }} /> Services
                                </span>
                            </div>
                        </div>
                        <div className="dashboard-chart-bars-container">
                            {(() => {
                                const salesData = chartSales?.data || Array(12).fill(0);
                                const maxSales = Math.max(...salesData, 1000);
                                return salesData.map((val, i) => {
                                    const heightPct = val > 0 ? (val / maxSales) * 100 : 5;
                                    return (
                                        <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                                            <div style={{ height: `${heightPct}%`, width: '100%', background: 'linear-gradient(to top, #1B6B3A, #064E3B)', borderRadius: '8px 8px 4px 4px', position: 'relative' }}>
                                                {val > 0 && (
                                                    <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#064E3B', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800', whiteSpace: 'nowrap' }}>
                                                        ₹{val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${(val / 1000).toFixed(1)}k`}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: '700', color: '#94A3B8', textAlign: 'center' }}>
                                                {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Inventory Health */}
                    <div className="dashboard-chart-card">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', marginBottom: '1.5rem' }}>Inventory Health</h2>
                        <div className="inventory-health-grid">
                            {[
                                { label: 'Fast Moving', count: 142, color: '#1B6B3A', pct: 65 },
                                { label: 'Slow Moving', count: 48, color: '#F59E0B', pct: 22 },
                                { label: 'Dead Stock', count: 24, color: '#EF4444', pct: 13 }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '1.25rem', borderRadius: '20px', background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{item.label}</p>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.75rem' }}>{item.count}</h4>
                                    <div style={{ height: '6px', width: '100%', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="dashboard-goal-card">
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Target size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>Enterprise Goal</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>You've achieved 82% of your quarterly revenue target.</p>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '82%', background: 'white' }} />
                            </div>
                            <button style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'white', color: '#064E3B', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>View Strategy</button>
                        </div>
                    </div>

                    <div className="dashboard-ops-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>Recent Ops</h3>
                            <Clock size={18} color="#94A3B8" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { title: 'GST Filing', time: '2h ago', status: 'Completed', color: '#10B981' },
                                { title: 'Inventory Sync', time: '5h ago', status: 'Pending', color: '#F59E0B' },
                                { title: 'Payroll Run', time: 'Yesterday', status: 'Completed', color: '#10B981' }
                            ].map((op, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: op.color }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>{op.title}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{op.time}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: op.color }}>{op.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Customisation Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                        }} 
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 25 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 25 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                            style={{
                                width: '90%',
                                maxWidth: '460px',
                                background: 'white',
                                borderRadius: '24px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                padding: '2rem',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1E293B', letterSpacing: '-0.5px' }}>Configure Quick Actions</h2>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem', lineHeight: 1.4 }}>Pin your most frequent workflows straight to the Dashboard overview.</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <X size={18} color="#64748B" />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px', marginBottom: '1.75rem' }}>
                                {MASTER_SHORTCUTS.map(shortcut => {
                                    const Icon = shortcut.icon;
                                    const isActive = selectedShortcuts.includes(shortcut.id);
                                    return (
                                        <div 
                                            key={shortcut.id}
                                            onClick={() => toggleShortcut(shortcut.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.9rem 1rem',
                                                borderRadius: '16px',
                                                background: isActive ? `${shortcut.color}05` : '#F8FAFC',
                                                border: '2px solid',
                                                borderColor: isActive ? shortcut.color : '#F1F5F9',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isActive) e.currentTarget.style.borderColor = '#E2E8F0';
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isActive) e.currentTarget.style.borderColor = '#F1F5F9';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                <div style={{ 
                                                    width: '38px', 
                                                    height: '38px', 
                                                    borderRadius: '10px', 
                                                    background: isActive ? `${shortcut.color}15` : 'white', 
                                                    border: isActive ? 'none' : '1px solid #E2E8F0',
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: isActive ? shortcut.color : '#94A3B8'
                                                }}>
                                                    <Icon size={18} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#1E293B' }}>{shortcut.label}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Checkbox Switch Indicator */}
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '7px',
                                                border: '2.5px solid',
                                                borderColor: isActive ? shortcut.color : '#CBD5E1',
                                                background: isActive ? shortcut.color : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                {isActive && <Plus size={14} strokeWidth={3.5} color="white" style={{ transform: 'rotate(45deg)' }} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    fontWeight: '850', 
                                    fontSize: '0.95rem',
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    boxShadow: '0 10px 20px -5px rgba(27, 107, 58, 0.35)',
                                    letterSpacing: '0.2px'
                                }}
                            >
                                Save Configuration
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDashboard;
