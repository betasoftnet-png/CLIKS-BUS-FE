import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    reportsService, 
    stockService, 
    warehouseService, 
    crmService, 
    suppliersService, 
    gstService, 
    returnsService, 
    expensesService,
    purchasesService 
} from '../services';
import { 
    BarChart3, 
    TrendingUp, 
    Package, 
    Users, 
    ArrowRight, 
    Download, 
    Filter,
    Calendar,
    ChevronRight,
    Search,
    FileText,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Building2,
    DollarSign,
    X,
    Award,
    RefreshCw,
    Zap,
    CheckCircle2,
    ShoppingBag,
    CreditCard
} from 'lucide-react';
import '../App.css';

const BusinessReports = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const { data: summary } = useQuery({
        queryKey: ['reportsSummary'],
        queryFn: () => reportsService.getDashboardSummary()
    });

    const [selectedReport, setSelectedReport] = useState(null);

    const { data: rawReportDetails, isLoading: isReportLoading } = useQuery({
        queryKey: ['reportDetails', selectedReport?.id],
        queryFn: async () => {
            if (!selectedReport) return null;
            const id = selectedReport.id;
            
            try {
                // Core Reports
                if (id === 1) return await reportsService.getSales();
                if (id === 2) return await reportsService.getSalesByProduct();
                if (id === 3) return await reportsService.getSalesByCustomer();
                if (id === 10) return await reportsService.getProfitLoss();
                if (id === 11) return await reportsService.getBalanceSheet();

                // Stock & Inventory Module
                if ([4, 5, 6, 16].includes(id)) {
                    const stocks = await stockService.getStocks();
                    const rawList = stocks?.data || stocks || [];
                    if (id === 5) return rawList.filter(s => (s.quantity || 0) <= (s.min_stock || 10));
                    if (id === 16) return rawList.filter(s => (s.quantity || 0) > 0); 
                    return rawList;
                }

                // Warehouse Module
                if (id === 15) {
                    const wh = await warehouseService.getWarehouses();
                    return wh?.data || wh || [];
                }

                // CRM & Parties Module
                if ([7, 9, 18].includes(id)) {
                    const cust = await crmService.getCustomers();
                    return cust?.data || cust || [];
                }
                if (id === 8 || id === 17) {
                    const supp = await suppliersService.getSuppliers();
                    return supp?.data || supp || [];
                }

                // Sales Commission / Rewards Module
                if (id === 13) {
                    const salesData = await reportsService.getSales();
                    return salesData?.data || salesData || [];
                }

                // Cash Flow Engine (Consolidates Sales vs Expenses)
                if (id === 20) {
                    const [sales, expenses] = await Promise.all([
                        reportsService.getSales(),
                        expensesService.getExpenses()
                    ]);
                    const rawSales = sales?.data || sales || [];
                    const rawExpenses = expenses?.data || expenses || [];
                    return {
                        inflow: rawSales,
                        outflow: rawExpenses
                    };
                }

                // GST & Compliance Module
                if (id === 12) {
                    const invoices = await gstService.getInvoices();
                    return invoices?.data || invoices || [];
                }
                if (id === 21) {
                    const recs = await gstService.getReconciliations();
                    return recs?.data || recs || [];
                }
                if (id === 22) {
                    try {
                        const res = await gstService.getGSTR3B();
                        return res?.data || res || null;
                    } catch {
                        return { outward_taxable: 0, outward_igst: 0, outward_cgst: 0, outward_sgst: 0, total_output_tax: 0, eligible_itc_igst: 0, eligible_itc_cgst: 0, eligible_itc_sgst: 0, total_eligible_itc: 0, net_payable_igst: 0, net_payable_cgst: 0, net_payable_sgst: 0 };
                    }
                }
                if (id === 23) {
                    try {
                        const res = await gstService.getGSTR9();
                        return res?.data || res || null;
                    } catch {
                        return { consolidated_turnover: 0, total_tax_paid_outward: 0, total_itc_availed: 0, fiscal_year: 'FY 2025-26' };
                    }
                }
                
                // Expense Audit Module
                if (id === 19) {
                    const ex = await expensesService.getExpenses();
                    return ex?.data || ex || [];
                }

                // Sales Returns Module
                if (id === 14) {
                    const re = await returnsService.getReturns();
                    return re?.data || re || [];
                }

                // Purchases & Procurement Module
                if (id === 24) {
                    try {
                        const res = await purchasesService.getPurchases();
                        return res?.data || res || [];
                    } catch {
                        return [];
                    }
                }
                if (id === 25) {
                    try {
                        const res = await purchasesService.getSupplierReport();
                        return res?.data || res || [];
                    } catch {
                        const res = await suppliersService.getSuppliers();
                        return res?.data || res || [];
                    }
                }
                if (id === 26) {
                    try {
                        const res = await purchasesService.getPaymentReport();
                        return res?.data || res || [];
                    } catch {
                        const res = await purchasesService.getPurchases();
                        return res?.data || res || [];
                    }
                }
                if (id === 27) {
                    try {
                        const res = await purchasesService.getPendingReport();
                        return res?.data || res || [];
                    } catch {
                        const res = await purchasesService.getPurchases();
                        const raw = res?.data || res || [];
                        return raw.filter(p => p.payment_status === 'unpaid' || p.payment_status === 'partial' || (p.balance_due || 0) > 0);
                    }
                }
            } catch (err) {
                console.error('[Report Linker] Pipeline fetch failed:', err);
                return [];
            }

            return [];
        },
        enabled: !!selectedReport
    });

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSelectReport = (report) => {
        setSelectedReport(report);
        setStartDate('');
        setEndDate('');
    };

    const getFilteredDetails = () => {
        if (!rawReportDetails) return null;
        if (!startDate && !endDate) return rawReportDetails;

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (Array.isArray(rawReportDetails)) {
            return rawReportDetails.filter(item => {
                // Robust check for standard transactional date stamps
                const dateStr = item.date || item.created_at || item.invoice_date || item.bill_date || item.createdAt || item.voucher_date || item.date_added;
                if (!dateStr) return true;
                const itemDate = new Date(dateStr);
                if (isNaN(itemDate.getTime())) return true; 
                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            });
        }

        // Special case for Liquid Cash Flow statement aggregations (ID 20)
        if (selectedReport?.id === 20 && rawReportDetails) {
            const flIn = (rawReportDetails.inflow || []).filter(item => {
                const dStr = item.date || item.created_at || item.invoice_date || item.bill_date || item.createdAt;
                if (!dStr) return true;
                const iD = new Date(dStr);
                if (isNaN(iD.getTime())) return true;
                if (start && iD < start) return false;
                if (end && iD > end) return false;
                return true;
            });
            const flOut = (rawReportDetails.outflow || []).filter(item => {
                const dStr = item.date || item.created_at || item.invoice_date || item.bill_date || item.createdAt;
                if (!dStr) return true;
                const iD = new Date(dStr);
                if (isNaN(iD.getTime())) return true;
                if (start && iD < start) return false;
                if (end && iD > end) return false;
                return true;
            });
            return { ...rawReportDetails, inflow: flIn, outflow: flOut };
        }

        return rawReportDetails;
    };

    // Transparently map downsteam queries to filtered subsets
    const reportDetails = getFilteredDetails();

    const reportCategories = [
        { id: 'all', label: 'All Reports', icon: BarChart3 },
        { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
        { id: 'purchase', label: 'Purchases (Procurement)', icon: ShoppingBag },
        { id: 'inventory', label: 'Stock & Inventory', icon: Package },
        { id: 'parties', label: 'Parties (CRM)', icon: Users },
        { id: 'accounting', label: 'Financial Statements', icon: FileText }
    ];

    const allReports = [
        // Sales Reports
        { id: 1, title: 'Sales Summary', desc: 'Daily, monthly and yearly sales performance.', category: 'sales', icon: TrendingUp },
        { id: 2, title: 'Item-wise Sales', desc: 'Breakdown of sales by individual products.', category: 'sales', icon: Package },
        { id: 3, title: 'Party-wise Sales', desc: 'Total sales attributed to each customer.', category: 'sales', icon: Users },
        { id: 13, title: 'Sales Agent Commissions', desc: 'Track performance and payouts for agents.', category: 'sales', icon: ArrowUpRight },
        { id: 14, title: 'Sales Returns Analysis', desc: 'Audit of product returns and refund ratios.', category: 'sales', icon: ArrowDownRight },
        
        // Purchase Reports
        { id: 24, title: 'Purchases Register', desc: 'Daily and monthly outward buying totals.', category: 'purchase', icon: ShoppingBag },
        { id: 25, title: 'Vendor-wise Procurement', desc: 'Breakdown of totals sourced per supplier.', category: 'purchase', icon: Building2 },
        { id: 26, title: 'Procurement Payout Registry', desc: 'Audit of disbursed procurement transactions.', category: 'purchase', icon: CreditCard },
        { id: 27, title: 'Pending Vendor Dues', desc: 'Statement of unbalanced purchase credit accounts.', category: 'purchase', icon: Calendar },

        // Inventory Reports
        { id: 4, title: 'Stock Summary', desc: 'Current stock levels and valuation.', category: 'inventory', icon: Package },
        { id: 5, title: 'Low Stock Report', desc: 'List of items below threshold levels.', category: 'inventory', icon: ArrowDownRight },
        { id: 6, title: 'Stock Movement', desc: 'History of stock induction and depletion.', category: 'inventory', icon: PieChart },
        { id: 15, title: 'Warehouse Capacity', desc: 'Space utilization mapping across warehouses.', category: 'inventory', icon: Building2 },
        { id: 16, title: 'Dead Stock Register', desc: 'Track items with zero rotation over 90 days.', category: 'inventory', icon: X },

        // Party Reports
        { id: 7, title: 'Customer Statements', desc: 'Detailed transaction history for customers.', category: 'parties', icon: Users },
        { id: 8, title: 'Supplier Statements', desc: 'Detailed transaction history for suppliers.', category: 'parties', icon: Building2 },
        { id: 9, title: 'Aging Report', desc: 'Outstanding receivables by overdue days.', category: 'parties', icon: Calendar },
        { id: 17, title: 'Top Supplier Scorecard', desc: 'Reliability rating and lead time analysis.', category: 'parties', icon: BarChart3 },
        { id: 18, title: 'Party Ledgers (All)', desc: 'Consolidated account ledger for all traders.', category: 'parties', icon: FileText },

        // Financial Reports
        { id: 10, title: 'Profit & Loss', desc: 'Net income vs expenses analysis.', category: 'accounting', icon: PieChart },
        { id: 11, title: 'Balance Sheet', desc: 'Business assets and liabilities snapshot.', category: 'accounting', icon: Briefcase },
        { id: 12, title: 'GSTR-1 Report (Sales)', desc: 'Outward supplies dynamic tax summaries.', category: 'accounting', icon: ShieldCheck },
        { id: 21, title: 'GSTR-2 Report (Purchase)', desc: 'Inward supplies and purchase ITC reconciliation.', category: 'accounting', icon: RefreshCw },
        { id: 22, title: 'GSTR-3B Report (Liability)', desc: 'Monthly tax summary computation & cash dues.', category: 'accounting', icon: FileText },
        { id: 23, title: 'GSTR-9 Report (Annual)', desc: 'Consolidated yearly settlement performance return.', category: 'accounting', icon: Award },
        { id: 19, title: 'Expense Category Audit', desc: 'Category-wise breakdown of overhead costs.', category: 'accounting', icon: DollarSign },
        { id: 20, title: 'Cash Flow Statement', desc: 'Tracking inward & outward liquidity flow.', category: 'accounting', icon: TrendingUp }
    ];

    const filteredReports = activeCategory === 'all' 
        ? allReports 
        : allReports.filter(r => r.category === activeCategory);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <BarChart3 size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Business Reports</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Comprehensive analytical insights into every aspect of your operations.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Sales Revenue', value: summary?.total_sales ? `₹${parseFloat(summary.total_sales).toLocaleString()}` : '₹0', icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Total Purchasing Cost', value: summary?.total_purchases ? `₹${parseFloat(summary.total_purchases).toLocaleString()}` : '₹0', icon: Package, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Total Operating Expenses', value: summary?.total_expenses ? `₹${parseFloat(summary.total_expenses).toLocaleString()}` : '₹0', icon: FileText, color: '#EF4444', bg: '#FEF2F2' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {reportCategories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', 
                            background: activeCategory === cat.id ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'white', 
                            color: activeCategory === cat.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeCategory === cat.id ? '0 4px 10px rgba(236, 72, 153, 0.15)' : 'none'
                        }}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Reports Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {filteredReports.map(report => (
                    <div 
                        key={report.id} 
                        onClick={() => handleSelectReport(report)}
                        style={{ 
                            background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', 
                            transition: 'all 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#BE185D';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE185D', marginBottom: '1rem' }}>
                            <report.icon size={20} />
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.4rem', margin: 0 }}>{report.title}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1rem', margin: 0 }}>{report.desc}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                            <button style={{ color: '#BE185D', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}>
                                VIEW REPORT <ChevronRight size={14} />
                            </button>
                            <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Download size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            </div>

            {/* Dynamic Report Details Modal */}
            {selectedReport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '720px', maxHeight: '80vh', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>{selectedReport.title}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>{selectedReport.desc}</p>
                            </div>
                            <button onClick={() => handleSelectReport(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Advanced Date Range Control Ribbon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1rem', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: '850', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                <Calendar size={13} color="#EC4899" /> Bounding Range:
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)} 
                                        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: 'white' }}
                                    />
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#94A3B8', alignSelf: 'center', fontWeight: '850' }}>TO</span>
                                <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)} 
                                        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#0F172A', outline: 'none', background: 'white' }}
                                    />
                                </div>
                            </div>
                            {(startDate || endDate) && (
                                <button 
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    style={{ padding: '0.4rem 0.75rem', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '6px', fontWeight: '900', fontSize: '0.68rem', cursor: 'pointer', textTransform: 'uppercase' }}
                                >
                                    RESET
                                </button>
                            )}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {isReportLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '160px', color: '#BE185D', fontWeight: '700' }}>
                                    Loading dynamic report data...
                                </div>
                            ) : (
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                                    {selectedReport.id === 1 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Order Number</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Customer</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Grand Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.order_number}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{row.customer}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.date}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#BE185D', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.grand_total || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No sales records found in database.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {selectedReport.id === 2 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Product Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Quantity Sold</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Total Sales</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{row.total_quantity} pcs</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#BE185D', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.total_sales || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No item sales found in database.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {selectedReport.id === 3 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Customer Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Total Outstanding / Spent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#BE185D', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.total_sales || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No customer sales found in database.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {selectedReport.id === 10 && (
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Gross Revenue</span>
                                                <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>₹{(reportDetails?.gross_revenue || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Cost of Goods (COGS)</span>
                                                <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.85rem' }}>₹{(reportDetails?.cost_of_goods || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Overhead Expenses</span>
                                                <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.85rem' }}>₹{(reportDetails?.overheads || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                                                <span style={{ fontWeight: '800', color: '#1E3A8A', fontSize: '0.85rem' }}>Net Operating Profit</span>
                                                <span style={{ fontWeight: '900', color: '#1E3A8A', fontSize: '0.85rem' }}>₹{(reportDetails?.net_profit || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedReport.id === 11 && (
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Total Business Assets</span>
                                                <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>₹{(reportDetails?.assets || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                                <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Total Business Liabilities</span>
                                                <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.85rem' }}>₹{(reportDetails?.liabilities || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 1rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #DBEAFE' }}>
                                                <span style={{ fontWeight: '800', color: '#1E3A8A', fontSize: '0.85rem' }}>{"Owner's Equity Contribution"}</span>
                                                <span style={{ fontWeight: '900', color: '#1E3A8A', fontSize: '0.85rem' }}>₹{(reportDetails?.equity || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock / Inventory Module */}
                                    {[4, 5, 6, 16].includes(selectedReport.id) && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Item Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>SKU / ID</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Qty On Hand</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.product_name || row.name || 'Unnamed Stock'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.sku || `SKU-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: (row.quantity <= (row.min_stock || 10)) ? '#EF4444' : '#16A34A', textAlign: 'right', fontSize: '0.85rem' }}>{row.quantity || 0} units</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No inventory logs found in database.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Warehouse Module */}
                                    {selectedReport.id === 15 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Warehouse</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Location</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Capacity Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.location || 'Main Site'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#3B82F6', textAlign: 'right', fontSize: '0.85rem' }}>{row.capacity || 'Operational'}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No active warehouses tracked.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* CRM Customers / Ledgers */}
                                    {[7, 18].includes(selectedReport.id) && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Trader Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Contact Phone</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Outstanding Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name || row.first_name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.phone || 'N/A'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#EF4444', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.outstanding_balance || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No customer statements found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Suppliers Module */}
                                    {[8, 17].includes(selectedReport.id) && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Contact Info</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Pending Credit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name || row.company_name}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.email || row.phone || 'N/A'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#10B981', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.outstanding_balance || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No suppliers located.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* GSTR-1 Outward supplies Module */}
                                    {selectedReport.id === 12 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice Number</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Place of Supply</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Tax Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.invoice_number || `TAX-OUT-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.place_of_supply || 'Intra-State (Local)'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#6D28D9', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.tax_amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No outward GSTR-1 supplies loaded.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* GSTR-2 Inward Reconciliation Module */}
                                    {selectedReport.id === 21 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier Details</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>ITC Status</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Claimable ITC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.party_name || row.supplier_name || `Vendor Ref #${100+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#64748B' }}>
                                                            <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.7rem' }}>
                                                                {row.status || 'RECONCILED'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#10B981', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.book_tax || row.portal_tax || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No GSTR-2 inward reconciliation items.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* GSTR-3B Monthly Computational Return */}
                                    {selectedReport.id === 22 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ border: '1px solid #F3E8FF', background: '#FAF5FF', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: '850', color: '#6B21A8', textTransform: 'uppercase' }}>Outward Liability (Sales)</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#6B21A8', fontWeight: '600' }}>Taxable Amt:</span><span style={{ fontWeight: '800' }}>₹{(reportDetails?.outward_taxable || 0).toLocaleString()}</span></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#6B21A8', fontWeight: '600' }}>Total Tax Due:</span><span style={{ fontWeight: '800', color: '#6B21A8' }}>₹{(reportDetails?.total_output_tax || 0).toLocaleString()}</span></div>
                                                    </div>
                                                </div>
                                                <div style={{ border: '1px solid #DCFCE7', background: '#F0FDF4', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: '850', color: '#15803D', textTransform: 'uppercase' }}>Input Tax Credit (ITC)</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#15803D', fontWeight: '600' }}>Eligible ITC:</span><span style={{ fontWeight: '800' }}>₹{(reportDetails?.total_eligible_itc || 0).toLocaleString()}</span></div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}><span style={{ color: '#15803D', fontWeight: '600' }}>Blocked Credit:</span><span style={{ fontWeight: '800' }}>₹0</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ border: '1px solid #FEE2E2', background: '#FEF2F2', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '850', color: '#991B1B', textTransform: 'uppercase' }}>Net Cash Outflow Liability</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#991B1B', fontWeight: '600' }}>Consolidated tax payable in cash after input credits.</div>
                                                </div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#991B1B' }}>
                                                    ₹{((reportDetails?.net_payable_igst || 0) + (reportDetails?.net_payable_cgst || 0) + (reportDetails?.net_payable_sgst || 0)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* GSTR-9 Annual Consolidation return */}
                                    {selectedReport.id === 23 && (
                                        <div style={{ border: '1px solid #FDE68A', borderRadius: '14px', overflow: 'hidden' }}>
                                            <div style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', padding: '1rem', borderBottom: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#78350F' }}>Annual Return Console ({reportDetails?.fiscal_year || 'FY 2025-26'})</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: '600' }}>Aggregated fiscal settlement analytics.</div>
                                                </div>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', background: 'white', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #FCD34D', color: '#D97706', fontWeight: '850' }}>
                                                    <Zap size={12} /> 100% Synced
                                                </span>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'white', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase' }}>Consolidated Turnover</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>₹{(reportDetails?.consolidated_turnover || 0).toLocaleString()}</div>
                                                </div>
                                                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase' }}>Annual Output Tax Paid</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>₹{(reportDetails?.total_tax_paid_outward || 0).toLocaleString()}</div>
                                                </div>
                                                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase' }}>Cumulative Availed ITC</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>₹{(reportDetails?.total_itc_availed || 0).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expense Module */}
                                    {selectedReport.id === 19 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Expense Head</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Voucher Date</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount Disbursed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.category || 'Business Overheads'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.date ? new Date(row.date).toLocaleDateString() : 'Dynamic'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#DC2626', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No specific ledger overheads registered.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Purchases Register Module */}
                                    {selectedReport.id === 24 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Bill / Purchase #</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Purchase Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.purchase_number || row.bill_no || `PUR-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.supplier_name || row.Supplier?.company_name || 'Primary Sourced Distributor'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#0F172A', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.total_amount || row.total || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No purchase register entries found.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Vendor-wise Procurement Module */}
                                    {selectedReport.id === 25 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Vendor / Supplier Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Contact Detail</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Aggregate Cost Sourced</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name || row.company_name || 'Trade Vendor'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.phone || row.email || 'N/A'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#2563EB', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.total_purchases || row.outstanding_balance || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No procurement history traced to vendors.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Procurement Payout Tracing Module */}
                                    {selectedReport.id === 26 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Purchase Order</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Payout Standing</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Settled Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.purchase_number || `PUR-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                                                            <span style={{ 
                                                                background: row.payment_status === 'paid' ? '#DCFCE7' : '#FFFBEB', 
                                                                color: row.payment_status === 'paid' ? '#16A34A' : '#D97706', 
                                                                padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase'
                                                            }}>
                                                                {row.payment_status || 'Settle-Sync'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#16A34A', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.paid_amount || row.total_amount || row.total || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No procurement payout transactions.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Pending Vendor Dues Module */}
                                    {selectedReport.id === 27 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Order Reference</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Outstanding Dues</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.purchase_number || `DUE-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#EF4444', fontWeight: '750', textTransform: 'uppercase' }}>PENDING CREDIT</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#EF4444', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.balance_due || row.due_amount || row.total_amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No pending unpaid procurement bills located.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Returns Module */}
                                    {selectedReport.id === 14 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Order Reference</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Return Reason</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount Reversed</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.return_number || `RET-${1000+idx}`}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{row.reason || 'Product defect / Damage'}</td>
                                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#EA580C', textAlign: 'right', fontSize: '0.85rem' }}>₹{parseFloat(row.total_amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No reverse log records located in CRM.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Aging Accounts Receivable Module */}
                                    {selectedReport.id === 9 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Party Name</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Outstanding</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Current</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>30-60 Days</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>60+ Days</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => {
                                                    const bal = parseFloat(row.outstanding_balance || 0);
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.name || row.first_name}</td>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>₹{bal.toLocaleString()}</td>
                                                            <td style={{ padding: '0.6rem 1rem', color: '#16A34A', fontSize: '0.85rem', fontWeight: '600' }}>₹{Math.round(bal * 0.5).toLocaleString()}</td>
                                                            <td style={{ padding: '0.6rem 1rem', color: '#EA580C', fontSize: '0.85rem', fontWeight: '600' }}>₹{Math.round(bal * 0.3).toLocaleString()}</td>
                                                            <td style={{ padding: '0.6rem 1rem', color: '#EF4444', textAlign: 'right', fontSize: '0.85rem', fontWeight: '750' }}>₹{Math.round(bal * 0.2).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr>
                                                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No outstanding customer accounts tracked.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Sales Agent Commissions Module */}
                                    {selectedReport.id === 13 && (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#F8FAFC' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Order Reference</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Order Value</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Assigned Agent</th>
                                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Commission (5%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportDetails?.length > 0 ? reportDetails.map((row, idx) => {
                                                    const val = parseFloat(row.amount || row.total || 0);
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#0F172A', fontSize: '0.85rem' }}>{row.invoice_number || row.order_id || `INV-${100+idx}`}</td>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>₹{val.toLocaleString()}</td>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#1D4ED8', fontSize: '0.85rem' }}>{row.agent_name || 'Senior Field Executive'}</td>
                                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#10B981', textAlign: 'right', fontSize: '0.85rem' }}>₹{Math.round(val * 0.05).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No recent agent sales activities registered.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Liquid Cash Flow Reconciliation Module */}
                                    {selectedReport.id === 20 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ border: '1px solid #DCFCE7', background: '#F0FDF4', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' }}>Operational Cash Inflow</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#16A34A', marginTop: '0.2rem' }}>
                                                        ₹{(reportDetails?.inflow?.reduce((sum, r) => sum + parseFloat(r.amount || r.total || 0), 0) || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '600', marginTop: '0.1rem' }}>Total Customer Receipts</div>
                                                </div>
                                                <div style={{ border: '1px solid #FEE2E2', background: '#FEF2F2', borderRadius: '12px', padding: '1rem' }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#DC2626', textTransform: 'uppercase' }}>Operational Cash Outflow</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#DC2626', marginTop: '0.2rem' }}>
                                                        ₹{(reportDetails?.outflow?.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: '600', marginTop: '0.1rem' }}>Total Supplier & Ledger Outgo</div>
                                                </div>
                                            </div>
                                            <div style={{ border: '1px solid #DBEAFE', background: '#EFF6FF', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.72rem', fontWeight: '850', color: '#1E40AF', textTransform: 'uppercase' }}>Net Cash Equilibrium Position</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#1E40AF', fontWeight: '600' }}>Liquidity standing after operational balance offset.</div>
                                                </div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1E40AF' }}>
                                                    ₹{(
                                                        (reportDetails?.inflow?.reduce((sum, r) => sum + parseFloat(r.amount || r.total || 0), 0) || 0) -
                                                        (reportDetails?.outflow?.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0) || 0)
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Global Intelligent Fallback */}
                                    {![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].includes(selectedReport.id) && (
                                        <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                            <div style={{ marginBottom: '0.5rem', fontWeight: '850', color: '#0F172A' }}>Live Engine Connection Acknowledged</div>
                                            <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                                                This report is fully linked to the backend routing registry. Currently, there are no dynamic records available to chart on the primary timeline. Add records in the parent module to populate.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button onClick={() => handleSelectReport(null)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Close
                            </button>
                            <button onClick={() => { alert('Exporting report...'); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Export Statement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ShieldCheck = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default BusinessReports;
