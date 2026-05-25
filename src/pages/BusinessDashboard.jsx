import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context';
import {
    LayoutDashboard,
    Briefcase,
    BarChart3,
    Users,
    TrendingUp,
    Package,
    ShoppingCart,
    Clock,
    Target,
    ArrowUpRight,
    Search,
    Plus,
    X,
    Settings,
    UserPlus,
    FileText,
    Receipt,
    Undo2,
    Warehouse,
    Barcode,
    Wallet,
    Gift,
    Coins,
    Truck,
    Factory,
    Users2,
    Activity,
    Wrench,
    ShoppingBag,
    ShieldCheck
} from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { reportsService, expensesService, purchasesService } from '../services';
import '../App.css';

const MASTER_SHORTCUTS = [
    { id: 'new_invoice', label: 'New Invoice', path: '/sales/invoice?create=true', icon: ShoppingBag, color: '#1B6B3A' },
    { id: 'sales_orders', label: 'Sales Orders', path: '/sales/orders', icon: ShoppingCart, color: '#2563EB' },
    { id: 'new_product', label: 'Add Product', path: '/inventory/products?create=true', icon: Package, color: '#EA580C' },
    { id: 'pos_billing', label: 'POS Billing', path: '/pos', icon: LayoutDashboard, color: '#0D9488' },
    { id: 'expenses', label: 'Add Expense', path: '/finance/expenses?create=true', icon: TrendingUp, color: '#DC2626' },
    { id: 'attendance', label: 'Attendance', path: '/hr/attendance', icon: Clock, color: '#0891B2' },
    { id: 'suppliers', label: 'Suppliers', path: '/purchases/suppliers?create=true', icon: Users, color: '#7C3AED' },

    // 🚀 Brand New Expansion Triggers
    { id: 'new_customer', label: 'Add Customer', path: '/sales/customers?create=true', icon: UserPlus, color: '#EC4899' },
    { id: 'new_purchase', label: 'New Purchase PO', path: '/purchases/purchases?create=true&tab=purchase-orders', icon: ShoppingCart, color: '#4338CA' },
    { id: 'staff_claim', label: 'Staff Claim', path: '/finance/expenses?claim=true', icon: FileText, color: '#BE185D' },
    { id: 'onboard_staff', label: 'Onboard Staff', path: '/hr/staff?create=true', icon: UserPlus, color: '#059669' },
    { id: 'gst_filing', label: 'GST Records', path: '/finance/gst', icon: BarChart3, color: '#F59E0B' },
    { id: 'marketing_hub', label: 'Marketing Hub', path: '/marketing', icon: Target, color: '#E11D48' },
    { id: 'ca_hub', label: 'FIN-PRO Audit Hub', path: '/ca', icon: Briefcase, color: '#004aad' },

    // 📦 Deep-linked Procurement & Returns
    { id: 'purchase_bills', label: 'Purchase Bills', path: '/purchases/purchases?tab=purchase-bills', icon: Receipt, color: '#0891B2' },
    { id: 'new_purchase_bill', label: 'New Purchase Bill', path: '/purchases/purchases?create=true&type=BILL&tab=purchase-bills', icon: Receipt, color: '#059669' },
    { id: 'purchase_returns', label: 'Purchase Returns', path: '/purchases/purchases?tab=purchase-returns', icon: Undo2, color: '#7C3AED' },
    { id: 'new_purchase_return', label: 'New Purchase Return', path: '/purchases/purchases?create=true&type=RETURN&tab=purchase-returns', icon: Undo2, color: '#DC2626' },
    { id: 'sales_returns', label: 'Sales Returns', path: '/sales/returns', icon: Undo2, color: '#EA580C' },

    // ⚙️ Inventory, Logistics & Barcoding
    { id: 'stock_management', label: 'Stock Management', path: '/inventory/stock', icon: Activity, color: '#2563EB' },
    { id: 'warehouse_godown', label: 'Godown/Warehouse', path: '/inventory/warehouse', icon: Warehouse, color: '#0284C7' },
    { id: 'barcode_gen', label: 'Barcode Generator', path: '/barcode', icon: Barcode, color: '#4F46E5' },

    // 💸 Payments, Ledger & Finance
    { id: 'split_collect', label: 'Split & Collect', path: '/payments/split-collect', icon: Users2, color: '#DB2777' },
    { id: 'payments_ledger', label: 'Payments Ledger', path: '/payments/transaction', icon: Coins, color: '#16A34A' },
    { id: 'company_wallet', label: 'Company Wallet', path: '/payments/wallet', icon: Wallet, color: '#7C3AED' },
    { id: 'loyalty_rewards', label: 'Loyalty Rewards', path: '/payments/rewards', icon: Gift, color: '#EA580C' },
    { id: 'staff_payroll', label: 'Staff Payroll', path: '/hr/payroll', icon: FileText, color: '#D97706' },
    { id: 'accounting_ledger', label: 'Double Entry Accounting', path: '/finance/accounting', icon: FileText, color: '#4F46E5' },

    // 🚚 Operations, Customization & CRM
    { id: 'delivery_challan', label: 'Delivery Challan', path: '/sales/delivery', icon: Truck, color: '#0891B2' },
    { id: 'manufacturing_bom', label: 'Manufacturing BOM', path: '/manufacturing', icon: Factory, color: '#65A30D' },
    { id: 'customization', label: 'Theme Customization', path: '/customization', icon: Wrench, color: '#475569' },
];

const BusinessDashboard = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    
    // States for custom interactive SVGs
    const [hoveredSalesPoint, setHoveredSalesPoint] = useState(null);
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);
    
    const [selectedShortcuts, setSelectedShortcuts] = useState(() => {
        const saved = localStorage.getItem('cliks_dashboard_shortcuts');
        return saved ? JSON.parse(saved) : MASTER_SHORTCUTS.map(s => s.id);
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

    // Fetch top performing products by sales volume
    const { data: topProducts } = useQuery({
        queryKey: ['dashboardTopProducts'],
        queryFn: reportsService.getSalesByProduct
    });

    // Fetch live expenses list for the pie chart
    const { data: expensesList } = useQuery({
        queryKey: ['dashboardExpenses'],
        queryFn: expensesService.getExpenses
    });

    const stats = [
        { label: 'Total Sales Revenue', value: summary?.total_sales !== undefined ? formatCurrency(summary.total_sales) : formatCurrency(0), change: 'Live', icon: ShoppingBag, color: '#1B6B3A' },
        { label: 'Total Purchases', value: summary?.total_purchases !== undefined ? formatCurrency(summary.total_purchases) : formatCurrency(0), change: 'Live', icon: Briefcase, color: '#064E3B' },
        { label: 'Total Expenses', value: summary?.total_expenses !== undefined ? formatCurrency(summary.total_expenses) : formatCurrency(0), change: 'Live', icon: TrendingUp, color: '#059669' },
        {
            label: 'Est. Net Profit',
            value: (() => {
                const profit = (summary?.total_sales || 0) - (summary?.total_purchases || 0) - (summary?.total_expenses || 0);
                return formatCurrency(profit);
            })(),
            change: 'Live',
            icon: ArrowUpRight,
            color: '#10B981'
        }
    ];

    // Compute live expense groups for Donut Chart
    const rawExpenses = expensesList?.data || expensesList || [];
    const expenseGroups = rawExpenses.reduce((acc, exp) => {
        const cat = exp.category || exp.category_name || 'Operating';
        const amt = parseFloat(exp.amount || exp.expense_amount || 0);
        acc[cat] = (acc[cat] || 0) + amt;
        return acc;
    }, {});

    const totalExpensesSum = Object.values(expenseGroups).reduce((a, b) => a + b, 0);

    const expenseCategories = Object.entries(expenseGroups).map(([name, value]) => ({
        name,
        value,
        pct: totalExpensesSum > 0 ? (value / totalExpensesSum) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    const finalExpenseCategories = expenseCategories || [];
    const finalTotalExpensesSum = totalExpensesSum || 0;

    // Beautiful emerald/mint/rich color scheme
    const DONUT_COLORS = ['#1B6B3A', '#10B981', '#059669', '#34D399', '#6EE7B7', '#A7F3D0'];

    // Trigonometric coordinates for custom SVG Area/Line Graph
    const salesData = chartSales?.data || Array(12).fill(0);
    const maxSales = Math.max(...salesData, 1000);

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const monthsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const salesPoints = salesData.map((val, idx) => {
        const x = paddingLeft + (idx / 11) * chartWidth;
        const y = paddingTop + chartHeight - (val / maxSales) * chartHeight;
        return { x, y, val, month: monthsLabels[idx] };
    });

    const linePath = salesPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = salesPoints.length > 0 
        ? `${linePath} L ${salesPoints[salesPoints.length - 1].x} ${paddingTop + chartHeight} L ${salesPoints[0].x} ${paddingTop + chartHeight} Z`
        : '';

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

                {/* Redesigned Charts Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', boxSizing: 'border-box' }}>
                    {/* Left Column: Sales Area Graph & Top Products */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Sales Curve Graph */}
                        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Sales Performance</h2>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Interactive monthly sales aggregation graph.</p>
                                </div>
                                <div style={{ background: '#F0FDF4', color: '#1B6B3A', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                                    Live Stream
                                </div>
                            </div>

                            {/* Custom SVG Sales Line/Area Graph */}
                            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="auto" style={{ display: 'block', overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#1B6B3A" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#1B6B3A" stopOpacity="0.0" />
                                        </linearGradient>
                                        <linearGradient id="salesLineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10B981" />
                                            <stop offset="100%" stopColor="#047857" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal Gridlines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const y = paddingTop + ratio * chartHeight;
                                        return (
                                            <g key={i}>
                                                <line 
                                                    x1={paddingLeft} 
                                                    y1={y} 
                                                    x2={svgWidth - paddingRight} 
                                                    y2={y} 
                                                    stroke="#F1F5F9" 
                                                    strokeWidth="1.5" 
                                                    strokeDasharray="4 4"
                                                />
                                                <text 
                                                    x={paddingLeft - 10} 
                                                    y={y + 4} 
                                                    textAnchor="end" 
                                                    style={{ fontSize: '10px', fontWeight: '750', fill: '#94A3B8' }}
                                                >
                                                    {formatCurrency(maxSales * (1 - ratio)).split('.')[0]}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* SVG Area Under Path */}
                                    {areaPath && (
                                        <path d={areaPath} fill="url(#salesAreaGradient)" />
                                    )}

                                    {/* SVG Glowing Line */}
                                    {linePath && (
                                        <path 
                                            d={linePath} 
                                            fill="none" 
                                            stroke="url(#salesLineGradient)" 
                                            strokeWidth="3.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                        />
                                    )}

                                    {/* X-Axis labels & data node points */}
                                    {salesPoints.map((p, idx) => (
                                        <g key={idx}>
                                            <text 
                                                x={p.x} 
                                                y={paddingTop + chartHeight + 18} 
                                                textAnchor="middle" 
                                                style={{ fontSize: '10px', fontWeight: '800', fill: '#64748B' }}
                                            >
                                                {p.month}
                                            </text>
                                            
                                            {/* Hover Interaction Circle Group */}
                                            <circle 
                                                cx={p.x} 
                                                cy={p.y} 
                                                r={hoveredSalesPoint?.month === p.month ? "7" : "5"} 
                                                fill="#ffffff" 
                                                stroke="#1B6B3A" 
                                                strokeWidth="2.5" 
                                                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                            />
                                            
                                            {/* Large Invisible Hover Circle to ease interaction */}
                                            <circle 
                                                cx={p.x} 
                                                cy={p.y} 
                                                r="18" 
                                                fill="transparent" 
                                                style={{ cursor: 'pointer' }}
                                                onMouseEnter={() => setHoveredSalesPoint(p)}
                                                onMouseLeave={() => setHoveredSalesPoint(null)}
                                            />
                                        </g>
                                    ))}
                                </svg>

                                {/* HTML Tooltip Overlay inside responsive wrapper */}
                                {hoveredSalesPoint && (
                                    <div style={{
                                        position: 'absolute',
                                        top: `${(hoveredSalesPoint.y / svgHeight) * 100 - 18}%`,
                                        left: `${(hoveredSalesPoint.x / svgWidth) * 100}%`,
                                        transform: 'translate(-50%, -100%)',
                                        background: '#0F172A',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'none',
                                        zIndex: 10
                                    }}>
                                        <div style={{ color: '#34D399', fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px' }}>{hoveredSalesPoint.month} Sales</div>
                                        <div>{formatCurrency(hoveredSalesPoint.val)}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Performing Products */}
                        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Top Performing Products</h2>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Highest volume contributors matrix.</p>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '750', textTransform: 'uppercase', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '12px' }}>Volume Matrix</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {topProducts && topProducts.length > 0 ? (
                                    (topProducts?.data || topProducts).slice(0, 3).map((prod, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', transition: 'all 0.2s ease' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '850', color: '#1B6B3A', fontSize: '0.85rem', border: '1px solid #DCF2E4' }}>
                                                #{idx + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.15rem 0' }}>{prod.name || 'Active Item'}</h4>
                                                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, fontWeight: '650' }}>Sold: <span style={{ color: '#064E3B', fontWeight: '800' }}>{prod.total_quantity || prod.sold || 0} pcs</span></p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>{formatCurrency(prod.total_sales || 0)}</div>
                                                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '800', textTransform: 'uppercase' }}>Revenue Driver</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8', border: '1px dashed #CBD5E1', borderRadius: '16px' }}>
                                        No product sales analytics logged yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Custom SVG Donut Expense Chart */}
                    <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Expense Distribution</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>Expense allocation grouped by categories.</p>
                                        {finalExpenseCategories.length > 0 ? (
                            <>
                                {/* Interactive Donut SVG */}
                                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', margin: '10px 0' }}>
                                    <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle 
                                            cx="100" 
                                            cy="100" 
                                            r="65" 
                                            fill="transparent" 
                                            stroke="#F1F5F9" 
                                            strokeWidth="16" 
                                        />
                                        {(() => {
                                            let accumulatedPercent = 0;
                                            const circumference = 2 * Math.PI * 65; // ~408.4

                                            return finalExpenseCategories.map((c, i) => {
                                                const dashLength = (c.pct / 100) * circumference;
                                                const offset = -((accumulatedPercent / 100) * circumference);
                                                accumulatedPercent += c.pct;
                                                const color = DONUT_COLORS[i % DONUT_COLORS.length];

                                                const isHovered = hoveredDonutSegment?.name === c.name;

                                                return (
                                                    <circle
                                                        key={c.name}
                                                        cx="100"
                                                        cy="100"
                                                        r="65"
                                                        fill="transparent"
                                                        stroke={color}
                                                        strokeWidth={isHovered ? "22" : "16"}
                                                        strokeDasharray={`${dashLength} ${circumference}`}
                                                        strokeDashoffset={offset}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                                                        }}
                                                        onMouseEnter={() => setHoveredDonutSegment({ ...c, color })}
                                                        onMouseLeave={() => setHoveredDonutSegment(null)}
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>

                                    {/* Donut Center Display */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        pointerEvents: 'none',
                                        width: '110px'
                                    }}>
                                        <div style={{ 
                                            fontSize: '9px', 
                                            fontWeight: '800', 
                                            color: '#64748B', 
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {hoveredDonutSegment ? hoveredDonutSegment.name : 'Total Expense'}
                                        </div>
                                        <div style={{ 
                                            fontSize: '15px', 
                                            fontWeight: '900', 
                                            color: hoveredDonutSegment ? hoveredDonutSegment.color : '#0F172A',
                                            marginTop: '4px',
                                            lineHeight: '1.2'
                                        }}>
                                            {hoveredDonutSegment 
                                                ? formatCurrency(hoveredDonutSegment.value)
                                                : formatCurrency(finalExpenseCategories.reduce((acc, c) => acc + c.value, 0))
                                            }
                                        </div>
                                        <div style={{ 
                                            fontSize: '10px', 
                                            fontWeight: '800', 
                                            color: '#10B981', 
                                            marginTop: '2px' 
                                        }}>
                                            {hoveredDonutSegment 
                                                ? `${hoveredDonutSegment.pct.toFixed(1)}% Share`
                                                : '100% Volume'
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Color Legend */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                    {finalExpenseCategories.map((c, i) => {
                                        const color = DONUT_COLORS[i % DONUT_COLORS.length];
                                        const isHovered = hoveredDonutSegment?.name === c.name;
                                        return (
                                            <div 
                                                key={c.name}
                                                onMouseEnter={() => setHoveredDonutSegment({ ...c, color })}
                                                onMouseLeave={() => setHoveredDonutSegment(null)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: isHovered ? '#F8FAFC' : 'transparent',
                                                    padding: '8px 10px',
                                                    borderRadius: '12px',
                                                    border: '1px solid',
                                                    borderColor: isHovered ? '#E2E8F0' : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: color, flexShrink: 0 }} />
                                                    <span style={{ 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: '800', 
                                                        color: isHovered ? '#0F172A' : '#475569',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '120px'
                                                    }} title={c.name}>
                                                        {c.name}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E293B' }}>{formatCurrency(c.value)}</div>
                                                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8' }}>{c.pct.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '3.5rem 1.5rem',
                                border: '2px dashed #E2E8F0',
                                borderRadius: '20px',
                                background: '#F8FAFC',
                                textAlign: 'center',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', marginBottom: '1rem' }}>
                                    <TrendingUp size={24} />
                                </div>
                                <h3 style={{ fontSize: '0.92rem', fontWeight: '850', color: '#334155', margin: '0 0 0.5rem 0' }}>No Expense Data Logged</h3>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.4', maxWidth: '240px', fontWeight: '600' }}>
                                    Record business expenses under Purchases or Accounting to compile your category distribution breakdown.
                                </p>
                            </div>
                        )}          </div>
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
