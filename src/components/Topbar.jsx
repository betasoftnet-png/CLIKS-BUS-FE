import React from 'react';
import { 
    BookOpen, Calculator, Users, Coins, X, Search, Sliders, Calendar, Contact, 
    Keyboard, Languages, Scan, ShieldCheck, CloudSun, Newspaper, Edit, Plus, 
    Minus, Check, ChevronRight, SlidersHorizontal, Palette, Bell, User, Lock, Info,
    LayoutDashboard, PercentCircle, Receipt, Package, Layers, TrendingUp, BarChart3,
    UsersRound, LineChart, FileText, ShoppingCart, MapPin, Truck, Monitor, Barcode,
    HelpCircle, Gift, Target, Split, Wallet, CreditCard
} from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { apiClient } from '../api/client';
import logoPng from '../assets/cliks6.png'; // Final branding
import accessKitPng from '../assets/ACCESS_KIT.png';
import { motion, AnimatePresence } from 'framer-motion';

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';
import ProductLauncher from './ProductLauncher';





const staticPages = [
    // Ranks: 1 = Module, 2 = Submodule, 3 = Page/Utility
    { name: 'Books', path: '/dashboard', module: 'Books', desc: 'Books Main Workspace', icon: 'BookOpen', rank: 1, synonyms: ['books', 'erp', 'business'] },
    { name: 'Payments', path: '/payments/transaction', module: 'Payments', desc: 'Payments Main Workspace', icon: 'CreditCard', rank: 1, synonyms: ['payments', 'finance', 'billing', 'upi'] },
    { name: 'Social', path: '/social/betaclub', module: 'Social', desc: 'Social Workspace', icon: 'Users', rank: 1, synonyms: ['social', 'network', 'chat'] },
    { name: 'Beta Products', path: '/beta-launcher', module: 'Beta Products', desc: 'Beta Products Workspace', icon: 'Sliders', rank: 1, synonyms: ['beta products', 'launcher', 'apps', 'utilities'] },

    { name: 'Dashboard', path: '/dashboard', module: 'Books', desc: 'Overview of business performance', icon: 'LayoutDashboard', rank: 2, synonyms: ['dashboard', 'home', 'overview', 'matrix'] },
    { name: 'Finance', path: '/finance/accounting', module: 'Books', desc: 'Financial Management', icon: 'Calculator', rank: 2, synonyms: ['finance', 'money', 'capital', 'fin'] },
    { name: 'Sales', path: '/sales/invoice', module: 'Books', desc: 'Sales & Customer Management', icon: 'Receipt', rank: 2, synonyms: ['sales', 'sell', 'orders', 'sa'] },
    { name: 'Purchases', path: '/purchases/purchases', module: 'Books', desc: 'Vendor purchases & bills', icon: 'ShoppingCart', rank: 2, synonyms: ['purchases', 'buy', 'suppliers', 'pur'] },
    { name: 'Inventory', path: '/inventory/stock', module: 'Books', desc: 'Manage Products & Stock', icon: 'Layers', rank: 2, synonyms: ['inventory', 'stock', 'warehouse', 'godown', 'inv'] },
    { name: 'HR', path: '/hr/staff', module: 'Books', desc: 'Human Resource Management', icon: 'UsersRound', rank: 2, synonyms: ['hr', 'staff', 'payroll', 'salary', 'attendance'] },

    { name: 'Accounting', path: '/finance/accounting', module: 'Finance', desc: 'P&L, Balance Sheet, Ledger', icon: 'Calculator', rank: 3, synonyms: ['accounting', 'acct', 'p&l', 'ledger', 'profit', 'loss', 'balance sheet', 'acc', 'fin'] },
    { name: 'Expenses', path: '/finance/expenses', module: 'Finance', desc: 'Business expenses logs', icon: 'TrendingUp', rank: 3, synonyms: ['expenses', 'expense', 'spend', 'bill', 'fin'] },
    { name: 'GST', path: '/finance/gst', module: 'Finance', desc: 'GSTR-1, GSTR-3B & ITC summaries', icon: 'PercentCircle', rank: 3, synonyms: ['gst', 'tax', 'gstr', 'compliance', 'filings', 'fin'] },
    { name: 'GSTR-1', path: '/finance/gst?tab=gstr1', module: 'Finance', desc: 'GSTR-1 Sales Summary', icon: 'PercentCircle', rank: 3, synonyms: ['gstr-1', 'gstr1', 'gst'] },
    { name: 'GSTR-3B', path: '/finance/gst?tab=gstr3b', module: 'Finance', desc: 'GSTR-3B Tax Summary', icon: 'PercentCircle', rank: 3, synonyms: ['gstr-3b', 'gstr3b', 'gst'] },
    { name: 'ITC Summary', path: '/finance/gst?tab=gstr2', module: 'Finance', desc: 'Input Tax Credit Summary', icon: 'PercentCircle', rank: 3, synonyms: ['itc summary', 'itc', 'gstr2', 'gst'] },
    { name: 'Savings', path: '/finance/accounting?tab=p&l', module: 'Finance', desc: 'Savings & Profit logs', icon: 'Coins', rank: 3, synonyms: ['savings', 'savings goals', 'capital', 'sa'] },
    { name: 'Income', path: '/finance/accounting?tab=p&l', module: 'Finance', desc: 'Income & profit statement', icon: 'TrendingUp', rank: 3, synonyms: ['income', 'earnings', 'revenue', 'fin'] },

    { name: 'Sales Orders', path: '/sales/orders', module: 'Sales', desc: 'Customer Sales Orders', icon: 'ShoppingCart', rank: 3, synonyms: ['sales orders', 'orders', 'booking', 'sa'] },
    { name: 'Sales Invoice', path: '/sales/invoice', module: 'Sales', desc: 'Billing & Invoicing', icon: 'Receipt', rank: 3, synonyms: ['sales invoice', 'invoice', 'billing', 'bill', 'sa'] },
    { name: 'Sales Return', path: '/sales/returns', module: 'Sales', desc: 'Sales returns & credit notes', icon: 'ArrowDownRight', rank: 3, synonyms: ['sales return', 'refund', 'credit note', 'sa'] },
    { name: 'Customers', path: '/sales/customers', module: 'Sales', desc: 'CRM and Client list', icon: 'Users', rank: 3, synonyms: ['customers', 'crm', 'client', 'buyers', 'loyalty'] },
    { name: 'Delivery Challan', path: '/sales/delivery', module: 'Sales', desc: 'Logistics & shipping delivery challans', icon: 'Truck', rank: 3, synonyms: ['delivery', 'shipping', 'dispatch', 'challan'] },
    { name: 'POS Billing', path: '/pos', module: 'Sales', desc: 'Retail point of sale counter', icon: 'Monitor', rank: 3, synonyms: ['pos billing', 'pos', 'counter', 'quick bill', 'sa'] },

    { name: 'Purchase Invoice', path: '/purchases/purchases', module: 'Purchases', desc: 'Supplier bill entries', icon: 'ShoppingCart', rank: 3, synonyms: ['purchase invoice', 'purchases', 'bill', 'inward', 'pur'] },
    { name: 'Suppliers', path: '/purchases/suppliers', module: 'Purchases', desc: 'Vendor management', icon: 'UsersRound', rank: 3, synonyms: ['suppliers', 'vendor', 'seller', 'payee'] },

    { name: 'Products', path: '/inventory/products', module: 'Inventory', desc: 'Products & service catalog', icon: 'Package', rank: 3, synonyms: ['products', 'item', 'catalog', 'sku', 'price', 'inv'] },
    { name: 'Stock', path: '/inventory/stock', module: 'Inventory', desc: 'Inventory stock levels tracking', icon: 'Layers', rank: 3, synonyms: ['stock', 'quantity', 'levels', 'inv'] },
    { name: 'Warehouse', path: '/inventory/warehouse', module: 'Inventory', desc: 'Multiple godowns tracking', icon: 'MapPin', rank: 3, synonyms: ['warehouse', 'godown', 'store', 'inv'] },

    { name: 'Staff', path: '/hr/staff', module: 'HR', desc: 'Employees list', icon: 'UsersRound', rank: 3, synonyms: ['staff', 'employee', 'team'] },
    { name: 'Attendance', path: '/hr/attendance', module: 'HR', desc: 'Daily attendance shifts', icon: 'Calendar', rank: 3, synonyms: ['attendance', 'shift', 'checkin', 'present'] },
    { name: 'Payroll', path: '/hr/payroll', module: 'HR', desc: 'Employee payroll & payslips', icon: 'FileText', rank: 3, synonyms: ['payroll', 'salary', 'payslip', 'wages'] },

    { name: 'Reports', path: '/reports', module: 'Reports', desc: 'Financial reports & analytics', icon: 'BarChart3', rank: 3, synonyms: ['reports', 'rep', 'charts', 'graphs'] },
    { name: 'Sales Report', path: '/reports', module: 'Reports', desc: 'Sales & performance reports', icon: 'BarChart3', rank: 3, synonyms: ['sales report', 'report', 'analytics', 'sa'] },

    { name: 'Barcode Generator', path: '/barcode', module: 'Books', desc: 'Barcode labeling', icon: 'Barcode', rank: 3, synonyms: ['barcode generator', 'barcode', 'label', 'scan'] },
    { name: 'FIN-PRO Audit Hub', path: '/ca', module: 'Books', desc: 'CA portal integration', icon: 'ShieldCheck', rank: 3, synonyms: ['fin-pro audit hub', 'ca', 'audit', 'chartered accountant', 'fi'] },
    { name: 'Settings', path: '/settings', module: 'Application Settings', desc: 'Configure application preferences', icon: 'Sliders', rank: 3, synonyms: ['settings', 'config', 'setup', 'preferences', 'set'] },
    { name: 'Help & Support', path: '/faq', module: 'Help & Support', desc: 'FAQ & User Support desk', icon: 'HelpCircle', rank: 3, synonyms: ['help & support', 'support', 'faq', 'help', 'ticket'] },

    // Payments Pages
    { name: 'People', path: '/payments/people', module: 'Payments', desc: 'Send/receive payment contacts', icon: 'Users', rank: 3, synonyms: ['people', 'contacts', 'party'] },
    { name: 'Wallet', path: '/payments/wallet', module: 'Payments', desc: 'Business bank wallets', icon: 'Wallet', rank: 3, synonyms: ['wallet', 'balance', 'bank account'] },
    { name: 'Transaction', path: '/payments/transaction', module: 'Payments', desc: 'Bank transfer transactions', icon: 'CreditCard', rank: 3, synonyms: ['transaction', 'payment', 'upi', 'card'] },
    { name: 'Segregation', path: '/payments/segregation', module: 'Payments', desc: 'Allocate funds to purpose wallets', icon: 'Target', rank: 3, synonyms: ['segregation', 'purpose wallet'] },
    { name: 'Split & Collect', path: '/payments/split-collect', module: 'Payments', desc: 'Group expense bill splitting', icon: 'Split', rank: 3, synonyms: ['split & collect', 'bill split', 'group'] },
    { name: 'Planner', path: '/payments/plan', module: 'Payments', desc: 'Schedule recurring payments', icon: 'Calendar', rank: 3, synonyms: ['planner', 'reminder', 'recurring'] },
    { name: 'Rewards & Offers', path: '/payments/rewards', module: 'Payments', desc: 'Loyalty cashback offers', icon: 'Gift', rank: 3, synonyms: ['rewards & offers', 'cashback', 'coupon'] },

    // Social Pages
    { name: 'Beta Club', path: '/social/betaclub', module: 'Social', desc: 'BETA Club social feed & startup pitches', icon: 'UsersRound', rank: 3, synonyms: ['beta club', 'social feed', 'pitches', 'startups'] },
    { name: 'Trading Docs', path: '/social/trading', module: 'Social', desc: 'Shares & trading contract documentation', icon: 'LineChart', rank: 3, synonyms: ['trading docs', 'trading', 'shares', 'contract'] },

    // Beta Launcher Page & Utilities
    { name: 'Beta Products', path: '/beta-launcher', module: 'Beta Products', desc: 'Beta Products Workspace', icon: 'Sliders', rank: 3, synonyms: ['beta products', 'launcher', 'apps', 'utilities'] },
    { name: 'Calculator', path: '/calculator', module: 'Beta Products', desc: 'Premium calculator utility', icon: 'Calculator', rank: 3, synonyms: ['calculator', 'calc', 'math'] },
    { name: 'Calendar', path: '/calendar', module: 'Beta Products', desc: 'Business calendar schedules', icon: 'Calendar', rank: 3, synonyms: ['calendar', 'events', 'schedule'] },
    { name: 'Contact', path: '/contact', module: 'Beta Products', desc: 'Generate contact cards', icon: 'Contact', rank: 3, synonyms: ['contact', 'id card', 'vcard'] },
    { name: 'Beta Trust', path: '/beta-trust', module: 'Beta Products', desc: 'Secure vaults and credentials', icon: 'ShieldCheck', rank: 3, synonyms: ['beta trust', 'vault', 'security'] },
    { name: 'Keyboard', path: '/keyboard', module: 'Beta Products', desc: 'Typing helper utilities', icon: 'Keyboard', rank: 3, synonyms: ['keyboard', 'typing', 'input'] },
    { name: 'Translator', path: '/translator', module: 'Beta Products', desc: 'Translate languages instantly', icon: 'Languages', rank: 3, synonyms: ['translator', 'translation', 'language'] },
    { name: 'Lens', path: '/lens', module: 'Beta Products', desc: 'Image recognition OCR lens', icon: 'Scan', rank: 3, synonyms: ['lens', 'ocr', 'camera'] },
    { name: 'Weather', path: '/weather', module: 'Beta Products', desc: 'Live climate forecasts', icon: 'CloudSun', rank: 3, synonyms: ['weather', 'climate', 'forecast'] },
    { name: 'News', path: '/news', module: 'Beta Products', desc: 'Daily business news updates', icon: 'Newspaper', rank: 3, synonyms: ['news', 'feed', 'headlines'] },

    // Actions
    { name: 'Generate Invoice', path: '/sales/invoice?create=true', module: 'Actions', desc: 'Create a new sales invoice', icon: 'Plus', rank: 3, synonyms: ['generate invoice', 'new invoice', 'create invoice', 'billing'] },
    { name: 'Add Customer', path: '/sales/customers?create=true', module: 'Actions', desc: 'Register a new customer profile', icon: 'Plus', rank: 3, synonyms: ['add customer', 'new customer', 'create customer'] },
    { name: 'Add Product', path: '/inventory/products?create=true', module: 'Actions', desc: 'Add new product/service to catalog', icon: 'Plus', rank: 3, synonyms: ['add product', 'new product', 'create product'] },
    { name: 'Purchase Bill', path: '/purchases/purchases?create=true&type=BILL&tab=purchase-bills', module: 'Actions', desc: 'Log a new purchase bill from supplier', icon: 'Plus', rank: 3, synonyms: ['purchase bill', 'new purchase bill', 'record bill'] },
    { name: 'Purchase Order', path: '/purchases/purchases?create=true&tab=purchase-orders', module: 'Actions', desc: 'Create a new purchase order', icon: 'Plus', rank: 3, synonyms: ['purchase order', 'new purchase order', 'po'] },
    { name: 'Marketing Hub', path: '/marketing', module: 'Actions', desc: 'Promote business and manage campaigns', icon: 'Target', rank: 3, synonyms: ['marketing hub', 'marketing', 'advertising', 'promo'] },
    { name: 'Audit Hub', path: '/ca', module: 'Actions', desc: 'Access CA audit tools and files', icon: 'ShieldCheck', rank: 3, synonyms: ['audit hub', 'audit', 'ca portal'] },
    { name: 'Stock Management', path: '/inventory/stock', module: 'Actions', desc: 'Track and manage stock levels', icon: 'Layers', rank: 3, synonyms: ['stock management', 'inventory levels'] }
];

const iconMap = {
    LayoutDashboard,
    BookOpen,
    CreditCard,
    Users,
    Calculator,
    PercentCircle,
    Receipt,
    User,
    Package,
    Layers,
    TrendingUp,
    BarChart3,
    UsersRound,
    LineChart,
    Sliders,
    FileText,
    ShoppingCart,
    MapPin,
    Truck,
    Monitor,
    Barcode,
    HelpCircle,
    Gift,
    Target,
    Split,
    Wallet
};

const Topbar = ({ onToggleSidebar, isSidebarOpen, activePanel, setActivePanel }) => {
    const { logout, user, selectedPlan } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Reward points state synced with localStorage
    const [rewardPoints, setRewardPoints] = React.useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1000; // default 1000 Pts
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('cliks_reward_points');
            setRewardPoints(saved ? parseInt(saved, 10) : 1000);
        };
        window.addEventListener('storage', handleStorageChange);
        // Also poll every 1 second to keep it perfectly updated across standard react page changes
        const interval = setInterval(handleStorageChange, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);

    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const queryLower = searchQuery.toLowerCase();
                const matchedPages = staticPages.filter(p => 
                    p.name.toLowerCase().includes(queryLower) ||
                    p.module.toLowerCase().includes(queryLower) ||
                    p.desc.toLowerCase().includes(queryLower) ||
                    (p.synonyms && p.synonyms.some(syn => syn.toLowerCase().includes(queryLower)))
                ).map(p => ({
                    type: p.module,
                    name: p.name,
                    desc: p.desc,
                    icon: p.icon,
                    path: p.path,
                    rank: p.rank,
                    isStatic: true
                }));

                let dbResults = [];
                try {
                    const response = await apiClient.get(`/search/global?q=${encodeURIComponent(searchQuery)}`);
                    dbResults = response.data?.data || response.data || [];
                } catch (apiErr) {
                    console.warn('Backend search API failed, using static pages only:', apiErr.message);
                }

                const combined = [...matchedPages, ...dbResults];
                combined.sort((a, b) => {
                    const rankA = a.rank !== undefined ? a.rank : 99;
                    const rankB = b.rank !== undefined ? b.rank : 99;
                    return rankA - rankB;
                });

                setSearchResults(combined);
            } catch (err) {
                console.error('Global search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 150);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "New sales invoice generated #INV-2026-004", time: "5 mins ago", read: false },
        { id: 2, text: "Monthly tax compliance report is ready for audit", time: "2 hours ago", read: false },
        { id: 3, text: "Welcome to Cliks Business standard dashboard!", time: "1 day ago", read: true }
    ]);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false);
    const [isEditingAccess, setIsEditingAccess] = React.useState(false);
    const [isAccessPopoverOpen, setIsAccessPopoverOpen] = React.useState(false);
    
    const isLauncherActive = activePanel === 'Beta Products';
    const isCalcActive = activePanel === 'Calculator';
    const [pinnedTools, setPinnedTools] = React.useState(() => {
        const saved = localStorage.getItem('cliks_pinned_tools');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return ['Calendar', 'Calculator', 'Contact', 'Beta Trust'];
    });

    React.useEffect(() => {
        localStorage.setItem('cliks_pinned_tools', JSON.stringify(pinnedTools));
    }, [pinnedTools]);

    const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Push main content aside when right toolbar or drawer panels are opened
    React.useEffect(() => {
        const appBody = document.querySelector('.app-body');
        if (!appBody) return;

        const updatePadding = () => {
            appBody.style.transition = 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            let paddingRight = 0;
            const isDesktop = window.innerWidth > 768;

            if (isDesktop) {
                if (isRightSidebarOpen) {
                    paddingRight = 64; // Toolbar always takes 64px
                } else {
                    paddingRight = 0; // Toolbar hidden by default
                }
            } else {
                paddingRight = 0; // Overlays on mobile
            }
            appBody.style.paddingRight = `${paddingRight}px`;
        };

        updatePadding();
        window.addEventListener('resize', updatePadding);
        return () => window.removeEventListener('resize', updatePadding);
    }, [isRightSidebarOpen]);

    // Rigid Mode Derivation for Admin & Sales desks to omit redundant consumer modules
    const isAdminOrSales = 
        ['admin', 'sales'].includes(user?.role) || 
        location.pathname.includes('/admin/') || 
        location.pathname.includes('/sales-portal/');

    const handleNavigation = (path) => {
        const isSocialOrPayment = path.startsWith('/social/') || path.startsWith('/payments/');
        if (selectedPlan === 'Free Plan' && path !== '/dashboard' && !isSocialOrPayment) {
            alert('You are on the Free Plan! Please subscribe to unlock full access to this feature.');
            navigate('/subscription');
        } else {
            navigate(path);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
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

    const isSocialActive = activeModule === 'social';
    const isFinanceActive = activeModule === 'payments';

    const navItems = [
        { name: 'Books', url: '/dashboard', icon: BookOpen, active: activeModule === 'books' },
        { name: 'Payments', url: '/payments/people', icon: Calculator, active: isFinanceActive },
        { name: 'Social', url: '/social/betaclub', icon: Users, active: isSocialActive },
    ];

    return (
        <header className="topbar" style={{ paddingLeft: '1.5rem', paddingRight: '64px' }}>
            {/* Left: Branding / App Switcher */}
            <div className="topbar-left">
                {/* ... existing logo code ... */}
                <div
                    className="logo-area"
                    onClick={onToggleSidebar}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle Sidebar"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onToggleSidebar();
                        }
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    title="Toggle Sidebar"
                >
                    <div className="brand-logo-small" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Cliks<span className="logo-business-text"> Business</span>
                    </span>
                </div>
            </div>

            {/* Hamburger Button (Mobile) - Now toggles Sidebar! */}
            <button
                className={`hamburger ${isSidebarOpen ? 'active' : ''}`}
                onClick={onToggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Center: Navigation (New Lamp Style) - Hidden for Platform Control / Sales Representative desks */}
            {!isAdminOrSales && (
                <div className="top-nav-links" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.active;

                        return (
                            <button
                                key={item.name}
                                onClick={() => item.action ? item.action() : handleNavigation(item.url)}
                                aria-label={item.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 20px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            )}

            {/* Right Group (Audit + Profile) */}
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '0' }}>
                {/* Search circular button */}
                {(() => {
                    const searchInputRef = React.useRef(null);
                    React.useEffect(() => {
                        if (isSearchExpanded) {
                            searchInputRef.current?.focus();
                        }
                    }, [isSearchExpanded]);

                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isSearchExpanded ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    borderRadius: '999px',
                                    padding: '5px 12px',
                                    width: '180px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative'
                                }}>
                                    <Search size={14} color="#FFFFFF" style={{ opacity: 0.8 }} />
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        placeholder="Search..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            width: '100%',
                                            fontWeight: '600',
                                            padding: 0
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setIsSearchExpanded(false);
                                                setSearchQuery('');
                                            }, 200);
                                        }}
                                    />
                                    {searchQuery && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '36px',
                                            right: '0',
                                            width: '280px',
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                            zIndex: 9999,
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            padding: '4px 0'
                                        }}>
                                            {isSearching ? (
                                                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748B', fontWeight: '500' }}>
                                                    Searching...
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((item, index) => {
                                                    const IconComponent = iconMap[item.icon] || Info;
                                                    return (
                                                        <div 
                                                            key={index}
                                                            onClick={() => {
                                                                let pathWithQuery = item.path;
                                                                if (item.state?.invoiceNumber) {
                                                                    pathWithQuery += `?q=${encodeURIComponent(item.state.invoiceNumber)}`;
                                                                } else if (item.state?.customerName) {
                                                                    pathWithQuery += `?q=${encodeURIComponent(item.state.customerName)}`;
                                                                } else if (item.state?.productName) {
                                                                    pathWithQuery += `?q=${encodeURIComponent(item.state.productName)}`;
                                                                }
                                                                
                                                                if (item.path.startsWith('/social/')) {
                                                                    sessionStorage.setItem('active_cliks_module', 'social');
                                                                } else if (item.path.startsWith('/payments/')) {
                                                                    sessionStorage.setItem('active_cliks_module', 'payments');
                                                                } else {
                                                                    sessionStorage.setItem('active_cliks_module', 'books');
                                                                }
                                                                navigate(pathWithQuery);
                                                                setIsSearchExpanded(false);
                                                                setSearchQuery('');
                                                            }}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '10px',
                                                                padding: '8px 12px',
                                                                cursor: 'pointer',
                                                                borderBottom: index < searchResults.length - 1 ? '1px solid #F1F5F9' : 'none',
                                                                transition: 'background-color 0.15s'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        >
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#EFF6FF',
                                                                color: '#1D4ED8',
                                                                flexShrink: 0,
                                                                marginTop: '2px'
                                                            }}>
                                                                <IconComponent size={14} />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                                                <div style={{ fontSize: '10px', fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                                    {item.type}
                                                                </div>
                                                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {item.name}
                                                                </div>
                                                                {item.desc && (
                                                                    <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                                                                        {item.desc}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748B', fontWeight: '500' }}>
                                                    No results found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchExpanded(true)}
                                    title="Search"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        cursor: 'pointer',
                                        color: '#FFFFFF',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                >
                                    <Search size={18} />
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Notification Bell Button */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        title="Notifications"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            color: '#FFFFFF',
                            outline: 'none',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    >
                        {/* Custom bell svg matching screenshot */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                        </svg>
                        
                        {/* Red Badge */}
                        {notifications.filter(n => !n.read).length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-3px',
                                right: '-3px',
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                fontWeight: '900',
                                border: '2px solid #135029'
                            }}>
                                {notifications.filter(n => !n.read).length}
                            </div>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {isNotificationOpen && (
                            <>
                                <div 
                                    onClick={() => setIsNotificationOpen(false)}
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2008 }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 10px)',
                                        right: '-40px',
                                        width: '280px',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '14px',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                        border: '1px solid #E2E8F0',
                                        zIndex: 2009,
                                        padding: '12px',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>Notifications</span>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setNotifications(notifications.map(n => ({ ...n, read: true })));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#1B6B3A', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notifications.map(notification => (
                                            <div 
                                                key={notification.id}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    backgroundColor: notification.read ? 'transparent' : '#F0FDF4',
                                                    border: notification.read ? 'none' : '1px solid #DCF2E4',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                }}
                                            >
                                                <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: notification.read ? '500' : '650' }}>{notification.text}</span>
                                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{notification.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <ProfileDropdown
                    onAccount={() => navigate('/profile')}
                    onSettings={() => navigate('/settings')}
                    onFAQ={() => navigate('/faq')}
                    onLogout={handleLogout}
                />

                {/* Vertical Divider */}
                <div style={{ 
                    width: '1px', 
                    height: '28px', 
                    minHeight: '28px',
                    maxHeight: '28px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)', 
                    marginLeft: '8px',
                    marginRight: '-5px',
                    alignSelf: 'center',
                    flexShrink: 0
                }} />
            </div>

            {/* Sliding Drawer Panels */}
            <AnimatePresence>

                {/* Fixed Right Toolbar */}
                {isRightSidebarOpen && (
                    <motion.div
                        key="right-toolbar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        style={{
                            position: 'fixed',
                            top: '64px',
                            right: 0,
                            height: 'calc(100vh - 64px)',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2005,
                            width: '64px',
                            fontFamily: "'Inter', sans-serif",
                            borderLeft: '1px solid #99DBC3'
                        }}
                    >
                        {/* Toolbar Body Container */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '20px',
                            paddingTop: '20px'
                        }}>
                            {/* Scrollable Tool List */}
                            <div className="access-tools-scroll" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1,
                                overflowY: 'auto',
                                width: '100%',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none'
                            }}>
                                <style>{`
                                    .access-tools-scroll::-webkit-scrollbar { display: none; }
                                `}</style>

                                {/* Blue B Logo Button */}
                                <button
                                    onClick={() => {
                                        setActivePanel(activePanel === 'Beta Products' ? null : 'Beta Products');
                                    }}
                                    title="Beta Products Launcher"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '12px',
                                        backgroundColor: isLauncherActive ? '#DCF2E4' : '#FFFFFF',
                                        border: isLauncherActive ? '1.5px solid #1B6B3A' : '1.5px solid #CBD5E1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = isLauncherActive ? '#1B6B3A' : '#94A3B8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = isLauncherActive ? '#1B6B3A' : '#CBD5E1';
                                    }}
                                >
                                    <img src="/beta_logo.png" alt="Beta Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                </button>

                                {/* Horizontal Separator */}
                                <div style={{ width: '24px', height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0', opacity: 0.8, flexShrink: 0 }} />

                                {/* Dynamic tools mapping */}
                                {(() => {
                                    const getToolPath = (name) => '/' + name.toLowerCase().replace('contact', 'contact').replace('beta trust', 'beta-trust');

                                    const allAvailableTools = [
                                        { name: 'Calendar', icon: Calendar, color: '#F59E0B', bg: '#FEF3C7', action: () => setActivePanel(activePanel === 'Calendar' ? null : 'Calendar') },
                                        { name: 'Calculator', icon: Calculator, color: '#10B981', bg: '#ECFDF5', action: () => setActivePanel(activePanel === 'Calculator' ? null : 'Calculator') },
                                        { name: 'Contact', icon: Contact, color: '#3B82F6', bg: '#EFF6FF', action: () => setActivePanel(activePanel === 'Contact' ? null : 'Contact') },
                                        { name: 'Beta Trust', icon: ShieldCheck, color: '#14B8A6', bg: '#F0FDFA', action: () => setActivePanel(activePanel === 'Beta Trust' ? null : 'Beta Trust') },
                                        { name: 'Keyboard', icon: Keyboard, color: '#8B5CF6', bg: '#F5F3FF', action: () => setActivePanel(activePanel === 'Keyboard' ? null : 'Keyboard') },
                                        { name: 'Translator', icon: Languages, color: '#EC4899', bg: '#FDF2F8', action: () => setActivePanel(activePanel === 'Translator' ? null : 'Translator') },
                                        { name: 'Lens', icon: Scan, color: '#06B6D4', bg: '#ECFEFF', action: () => setActivePanel(activePanel === 'Lens' ? null : 'Lens') },
                                        { name: 'Weather', icon: CloudSun, color: '#F97316', bg: '#FFF7ED', action: () => setActivePanel(activePanel === 'Weather' ? null : 'Weather') },
                                        { name: 'News', icon: Newspaper, color: '#6366F1', bg: '#EEF2FF', action: () => setActivePanel(activePanel === 'News' ? null : 'News') }
                                    ];

                                    const toggleToolPin = (toolName) => {
                                        setPinnedTools(prev => {
                                            if (prev.includes(toolName)) {
                                                if (prev.length === 1) return prev; // Keep at least one tool
                                                return prev.filter(name => name !== toolName);
                                            } else {
                                                return [...prev, toolName];
                                            }
                                        });
                                    };

                                    if (isEditingAccess) {
                                        return (
                                            <>
                                                <div style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', textAlign: 'center' }}>Edit Pins</div>
                                                {allAvailableTools.map((tool, idx) => {
                                                    const Icon = tool.icon;
                                                    const isPinned = pinnedTools.includes(tool.name);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => toggleToolPin(tool.name)}
                                                            title={`${isPinned ? 'Unpin' : 'Pin'} ${tool.name}`}
                                                            style={{
                                                                width: '38px', height: '38px', borderRadius: '12px',
                                                                backgroundColor: isPinned ? tool.bg : '#F8FAFC',
                                                                border: isPinned ? `2px solid ${tool.color}` : '1.5px dashed #CBD5E1',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: isPinned ? tool.color : '#94A3B8',
                                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                                outline: 'none', flexShrink: 0,
                                                                position: 'relative',
                                                                opacity: isPinned ? 1 : 0.6
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            <Icon size={18} />
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setIsEditingAccess(false)}
                                                    title="Done Editing"
                                                    style={{
                                                        width: '38px', height: '38px', borderRadius: '12px',
                                                        backgroundColor: '#10B981', border: 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s ease',
                                                        outline: 'none', flexShrink: 0,
                                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                                        marginTop: '4px'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </>
                                        );
                                    }

                                    // Normal Mode: Show only pinned tools
                                    const visibleTools = allAvailableTools.filter(t => pinnedTools.includes(t.name));

                                    return (
                                        <>
                                            {visibleTools.map((tool, idx) => {
                                                const Icon = tool.icon;
                                                const isActive = location.pathname === getToolPath(tool.name);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={tool.action}
                                                        title={tool.name}
                                                        style={{
                                                            width: '38px', height: '38px', borderRadius: '12px',
                                                            backgroundColor: isActive ? '#DCF2E4' : tool.bg,
                                                            border: isActive ? `2px solid ${tool.color}` : 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: tool.color, cursor: 'pointer', transition: 'all 0.2s ease',
                                                            outline: 'none', flexShrink: 0
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <Icon size={18} />
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setIsEditingAccess(true)}
                                                title="Add/Edit Icons"
                                                style={{
                                                    width: '38px', height: '38px', borderRadius: '12px',
                                                    backgroundColor: 'transparent', border: '1.5px dashed #CBD5E1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease',
                                                    outline: 'none', flexShrink: 0
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Bottom Area: Edit & Settings */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                paddingTop: '16px',
                                width: '100%',
                                flexShrink: 0
                            }}>
                                {/* Horizontal Separator */}
                                <div style={{ width: '24px', height: '1px', backgroundColor: '#E2E8F0', margin: '0 0 4px 0', opacity: 0.8, flexShrink: 0 }} />

                                <button
                                    onClick={() => setIsEditingAccess(!isEditingAccess)}
                                    title="Edit Access Kit"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    title="Settings / Customization"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Sliders size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Always Visible Top-Right Toolbar Toggle Button */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '64px',
                height: '64px',
                backgroundColor: '#135029',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button
                    onClick={() => {
                        if (isRightSidebarOpen) {
                            setIsRightSidebarOpen(false);
                            if (setActivePanel) setActivePanel(null);
                        } else {
                            setIsRightSidebarOpen(true);
                        }
                    }}
                    title={isRightSidebarOpen ? "Close Toolbar" : "Open Toolbar"}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '11px',
                        backgroundColor: isRightSidebarOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Sliders size={18} />
                </button>
            </div>
        </header>
    );
};

export default Topbar;
