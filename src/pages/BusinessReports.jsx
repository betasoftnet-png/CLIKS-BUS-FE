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
    DollarSign
} from 'lucide-react';
import '../App.css';

const BusinessReports = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    const { data: summary } = useQuery({
        queryKey: ['reportsSummary'],
        queryFn: () => reportsService.getDashboardSummary()
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
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <BarChart3 size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B' }}>Business Reports</h1>
                    </div>
                    <p style={{ color: '#475569', fontWeight: '500' }}>Comprehensive analytical insights into every aspect of your operations.</p>
                </div>
            </div>

            {/* Category Switcher */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {reportCategories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.5rem', 
                            borderRadius: '16px', border: '1px solid',
                            borderColor: activeCategory === cat.id ? '#1B6B3A' : '#E2E8F0',
                            background: activeCategory === cat.id ? 'white' : 'transparent',
                            color: activeCategory === cat.id ? '#064E3B' : '#64748B',
                            fontWeight: '750', cursor: 'pointer', transition: 'all 0.2s',
                            whiteSpace: 'nowrap', boxShadow: activeCategory === cat.id ? '0 4px 12px rgba(27, 107, 58, 0.1)' : 'none'
                        }}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Reports Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {filteredReports.map(report => (
                    <div 
                        key={report.id} 
                        style={{ 
                            background: 'white', padding: '1.75rem', borderRadius: '28px', border: '1px solid #E2E8F0', 
                            transition: 'all 0.3s', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#1B6B3A';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A', marginBottom: '1.5rem' }}>
                            <report.icon size={26} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>{report.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5', marginBottom: '1.5rem' }}>{report.desc}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                            <button style={{ color: '#1B6B3A', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                VIEW REPORT <ChevronRight size={16} />
                            </button>
                            <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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
