import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services';
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
    X
} from 'lucide-react';
import '../App.css';

const BusinessReports = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const { data: summary } = useQuery({
        queryKey: ['reportsSummary'],
        queryFn: () => reportsService.getDashboardSummary()
    });

    const [selectedReport, setSelectedReport] = useState(null);

    const { data: reportDetails, isLoading: isReportLoading } = useQuery({
        queryKey: ['reportDetails', selectedReport?.id],
        queryFn: () => {
            if (!selectedReport) return null;
            if (selectedReport.id === 1) return reportsService.getSales();
            if (selectedReport.id === 2) return reportsService.getSalesByProduct();
            if (selectedReport.id === 3) return reportsService.getSalesByCustomer();
            if (selectedReport.id === 10) return reportsService.getProfitLoss();
            if (selectedReport.id === 11) return reportsService.getBalanceSheet();
            return Promise.resolve([]);
        },
        enabled: !!selectedReport
    });

    const reportCategories = [
        { id: 'all', label: 'All Reports', icon: BarChart3 },
        { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
        { id: 'inventory', label: 'Stock & Inventory', icon: Package },
        { id: 'parties', label: 'Parties (CRM)', icon: Users },
        { id: 'accounting', label: 'Financial Statements', icon: FileText }
    ];

    const allReports = [
        // Sales Reports
        { id: 1, title: 'Sales Summary', desc: 'Daily, monthly and yearly sales performance.', category: 'sales', icon: TrendingUp },
        { id: 2, title: 'Item-wise Sales', desc: 'Breakdown of sales by individual products.', category: 'sales', icon: Package },
        { id: 3, title: 'Party-wise Sales', desc: 'Total sales attributed to each customer.', category: 'sales', icon: Users },
        
        // Inventory Reports
        { id: 4, title: 'Stock Summary', desc: 'Current stock levels and valuation.', category: 'inventory', icon: Package },
        { id: 5, title: 'Low Stock Report', desc: 'List of items below threshold levels.', category: 'inventory', icon: ArrowDownRight },
        { id: 6, title: 'Stock Movement', desc: 'History of stock induction and depletion.', category: 'inventory', icon: PieChart },

        // Party Reports
        { id: 7, title: 'Customer Statements', desc: 'Detailed transaction history for customers.', category: 'parties', icon: Users },
        { id: 8, title: 'Supplier Statements', desc: 'Detailed transaction history for suppliers.', category: 'parties', icon: Building2 },
        { id: 9, title: 'Aging Report', desc: 'Outstanding receivables by overdue days.', category: 'parties', icon: Calendar },

        // Financial Reports
        { id: 10, title: 'Profit & Loss', desc: 'Net income vs expenses analysis.', category: 'accounting', icon: PieChart },
        { id: 11, title: 'Balance Sheet', desc: 'Business assets and liabilities snapshot.', category: 'accounting', icon: Briefcase },
        { id: 12, title: 'GST Reports', desc: 'GSTR-1 and GSTR-3B filing summaries.', category: 'accounting', icon: ShieldCheck }
    ];

    const filteredReports = activeCategory === 'all' 
        ? allReports 
        : allReports.filter(r => r.category === activeCategory);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
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

            {/* Reports Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {filteredReports.map(report => (
                    <div 
                        key={report.id} 
                        onClick={() => setSelectedReport(report)}
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

            {/* Dynamic Report Details Modal */}
            {selectedReport && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '720px', maxHeight: '80vh', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>{selectedReport.title}</h2>
                                <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>{selectedReport.desc}</p>
                            </div>
                            <button onClick={() => setSelectedReport(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
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

                                    {![1, 2, 3, 10, 11].includes(selectedReport.id) && (
                                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                            No additional records found in live database for this specific operation.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button onClick={() => setSelectedReport(null)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}>
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
