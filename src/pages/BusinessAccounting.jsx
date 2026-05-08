import React, { useState } from 'react';
import { 
    Calculator, 
    FileText, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    IndianRupee, 
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ShieldCheck,
    Briefcase,
    Plus,
    Building2,
    Wallet,
    CreditCard,
    Receipt,
    Layers,
    X,
    MoreHorizontal,
    Smartphone
} from 'lucide-react';
import '../App.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingService } from '../services/accountingService';

const BusinessAccounting = () => {
    const [activeTab, setActiveTab] = useState('p&l'); // 'p&l', 'gst', 'ledger', 'cash-bank', 'expenses'
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbPL } = useQuery({
        queryKey: ['profitLoss'],
        queryFn: () => accountingService.getProfitLoss()
    });

    const { data: dbLedger = [] } = useQuery({
        queryKey: ['ledger'],
        queryFn: () => accountingService.getLedger()
    });

    const { data: dbExpenses = [] } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => accountingService.getExpenses()
    });

    // Mutations
    const recordEntryMutation = useMutation({
        mutationFn: (data) => accountingService.recordEntry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsEntryModalOpen(false);
            alert('Financial Entry registered and saved successfully!');
        }
    });

    // Form inputs state
    const [entryForm, setEntryForm] = useState({
        entry_type: 'income',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: 'Sales Revenue',
        mode: 'Cash in Hand',
        notes: ''
    });

    const handleSaveEntry = (e) => {
        e.preventDefault();
        recordEntryMutation.mutate({
            entry_type: entryForm.entry_type,
            date: entryForm.date,
            amount: parseFloat(entryForm.amount) || 0,
            category: entryForm.category,
            mode: entryForm.mode,
            notes: entryForm.notes
        });
    };

    // fallback data
    const summaryStats = [
        { label: 'Gross Revenue', value: dbPL ? `₹${parseFloat(dbPL.gross_revenue).toLocaleString()}` : '₹12,45,000', icon: TrendingUp, color: '#1B6B3A' },
        { label: 'Total Expenses', value: dbPL ? `₹${parseFloat(dbPL.total_expenses).toLocaleString()}` : '₹8,12,000', icon: TrendingDown, color: '#EF4444' },
        { label: 'Net Profit', value: dbPL ? `₹${parseFloat(dbPL.net_profit).toLocaleString()}` : '₹4,33,000', icon: IndianRupee, color: '#064E3B' },
        { label: 'GST Payable', value: '₹54,200', icon: ShieldCheck, color: '#0D9488' }
    ];

    const gstReports = [
        { name: 'GSTR-1 Summary', period: 'April 2024', status: 'Ready to File', tax: '₹22,400' },
        { name: 'GSTR-3B Summary', period: 'April 2024', status: 'In Progress', tax: '₹31,800' },
        { name: 'ITC Summary', period: 'Q1 2024', status: 'Verified', tax: '₹12,500' }
    ];

    const dayBook = dbLedger.length > 0 ? dbLedger.map(item => ({
        id: item.id,
        type: item.entry_type === 'income' ? 'Income' : 'Expense',
        category: item.category || 'Revenue',
        amount: `₹${parseFloat(item.amount).toLocaleString()}`,
        mode: item.mode || 'Cash',
        date: item.date || '2026-05-08'
    })) : [
        { id: 1, type: 'Income', category: 'Sales', amount: '₹45,000', mode: 'UPI', date: '2024-05-04' },
        { id: 2, type: 'Expense', category: 'Inventory', amount: '₹12,000', mode: 'Bank', date: '2024-05-04' },
        { id: 3, type: 'Income', category: 'Services', amount: '₹8,500', mode: 'Cash', date: '2024-05-03' },
        { id: 4, type: 'Expense', category: 'Rent', amount: '₹25,000', mode: 'Bank', date: '2024-05-01' }
    ];

    const expensesList = dbExpenses.length > 0 ? dbExpenses.map((item, idx) => ({
        cat: item.category || 'General',
        desc: item.description || 'Operational Cost',
        date: item.date || '2026-05-08',
        amt: `₹${parseFloat(item.amount).toLocaleString()}`
    })) : [
        { cat: 'Rent & Utilities', desc: 'May Office Rent', date: '2024-05-01', amt: '₹1,50,000' },
        { cat: 'Marketing', desc: 'Google Ads Campaign', date: '2024-05-03', amt: '₹85,000' },
        { cat: 'Staffing', desc: 'Part-time contractor', date: '2024-05-04', amt: '₹12,000' }
    ];

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Calculator size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B' }}>Accounting & GST</h1>
                    </div>
                    <p style={{ color: '#475569', fontWeight: '500' }}>Compliance-ready financial management and GST reporting.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer' }}>
                        <Download size={18} /> Export for CA
                    </button>
                    <button 
                        onClick={() => setIsEntryModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <Plus size={18} /> Record Entry
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {summaryStats.map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: '#DCF2E4', padding: '0.5rem', borderRadius: '18px', width: 'fit-content' }}>
                {[
                    { id: 'p&l', label: 'P & L' },
                    { id: 'balance-sheet', label: 'Balance Sheet' },
                    { id: 'receivables', label: 'Receivables & Payables' },
                    { id: 'expenses', label: 'Expenses' },
                    { id: 'cash-bank', label: 'Cash & Bank' },
                    { id: 'gst', label: 'GST' },
                    { id: 'ledger', label: 'Day Book' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', 
                            background: activeTab === tab.id ? 'white' : 'transparent', 
                            color: activeTab === tab.id ? '#064E3B' : '#1B6B3A',
                            fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s',
                            textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                {activeTab === 'expenses' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            {[
                                { label: 'Fixed Expenses', value: '₹1,50,000', icon: Building2, color: '#1B6B3A' },
                                { label: 'Variable Expenses', value: '₹2,92,000', icon: Layers, color: '#0D9488' },
                                { label: 'Pending Bills', value: '₹42,000', icon: Receipt, color: '#B45309' },
                                { label: 'Total MTD', value: '₹4,42,000', icon: TrendingDown, color: '#EF4444' }
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1rem' }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>{stat.label}</p>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E293B' }}>{stat.value}</h4>
                                </div>
                            ))}
                        </div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#F8FAFC' }}>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Expense Category</th>
                                        <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Description</th>
                                        <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expensesList.map((exp, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '1.25rem' }}><span style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', background: '#F0FDF4', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '750' }}>{exp.cat}</span></td>
                                            <td style={{ padding: '1.25rem', fontWeight: '600', color: '#475569' }}>{exp.desc}</td>
                                            <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#94A3B8' }}>{exp.date}</td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '850', color: '#EF4444' }}>{exp.amt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'cash-bank' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                            {[
                                { name: 'Main Business Account', bank: 'HDFC Bank', balance: '₹4,45,000', icon: Building2, color: '#1B6B3A' },
                                { name: 'Cash in Hand', bank: 'Office Vault', balance: '₹1,25,000', icon: Wallet, color: '#0D9488' },
                                { name: 'Digital Payments', bank: 'Razorpay / UPI', balance: '₹88,200', icon: Smartphone, color: '#3B82F6' }
                            ].map((acc, i) => (
                                <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${acc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: acc.color }}>
                                            <acc.icon size={28} />
                                        </div>
                                        <button style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}><MoreHorizontal size={20} /></button>
                                    </div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>{acc.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem' }}>{acc.bank}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Balance</p>
                                            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: acc.color }}>{acc.balance}</h3>
                                        </div>
                                        <button style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #DCF2E4', background: 'white', color: acc.color, fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>History</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'p&l' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowUpRight color="#1B6B3A" /> Revenue Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Product Sales', amount: '₹8,45,000', pct: '68%' },
                                    { label: 'Services', amount: '₹3,12,000', pct: '25%' },
                                    { label: 'Other Income', amount: '₹88,000', pct: '7%' }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '600', color: '#475569' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B' }}>{item.amount} <small style={{ color: '#1B6B3A' }}>({item.pct})</small></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991B1B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ArrowDownRight color="#EF4444" /> Expense Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Cost of Goods', amount: '₹5,20,000', pct: '64%' },
                                    { label: 'Operational Rent', amount: '₹1,50,000', pct: '18%' },
                                    { label: 'Marketing', amount: '₹1,42,000', pct: '18%' }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FFF1F2', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '600', color: '#991B1B' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B' }}>{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'receivables' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '3rem' }}>
                            {/* Aging Report */}
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', marginBottom: '1.5rem' }}>Aging Report (Receivables)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[
                                        { label: '0-30 Days', amount: '₹1,24,000', pct: 60, color: '#1B6B3A' },
                                        { label: '31-60 Days', amount: '₹48,000', pct: 25, color: '#F59E0B' },
                                        { label: '60+ Days', amount: '₹38,000', pct: 15, color: '#EF4444' }
                                    ].map((age, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700' }}>
                                                <span style={{ color: '#64748B' }}>{age.label}</span>
                                                <span style={{ color: '#1E293B' }}>{age.amount}</span>
                                            </div>
                                            <div style={{ height: '8px', width: '100%', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${age.pct}%`, background: age.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#F0F9F4', borderRadius: '24px', border: '1px solid #DCF2E4' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>TOTAL RECEIVABLES</p>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>₹2,10,000</h3>
                                </div>
                            </div>

                            {/* Party-wise Outstanding */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B' }}>Party-wise Outstanding</h3>
                                    <button style={{ color: '#1B6B3A', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>VIEW ALL PARTY</button>
                                </div>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#F8FAFC' }}>
                                            <tr style={{ textAlign: 'left' }}>
                                                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Party Name</th>
                                                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Pending Amount</th>
                                                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Due Since</th>
                                                <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: 'Global Solutions', amount: '₹42,000', days: '12 Days', color: '#1B6B3A' },
                                                { name: 'Vertex Systems', amount: '₹28,500', days: '45 Days', color: '#F59E0B' },
                                                { name: 'Creative Agency', amount: '₹12,400', days: '68 Days', color: '#EF4444' }
                                            ].map((party, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1E293B' }}>{party.name}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '800', color: party.color }}>{party.amount}</td>
                                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#64748B', fontSize: '0.85rem' }}>{party.days}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <button style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #DCF2E4', background: 'white', color: '#1B6B3A', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Remind</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'balance-sheet' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={20} /> Assets
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Cash in Hand', amount: '₹1,25,000' },
                                    { label: 'Bank Balance', amount: '₹4,45,000' },
                                    { label: 'Inventory Value', amount: '₹8,12,000' },
                                    { label: 'Accounts Receivable', amount: '₹2,10,000' },
                                    { label: 'Fixed Assets', amount: '₹15,00,000' }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '600', color: '#475569' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#DCF2E4', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', border: '1px solid #1B6B3A' }}>
                                    <span style={{ fontWeight: '800', color: '#064E3B' }}>Total Assets</span>
                                    <span style={{ fontWeight: '900', color: '#064E3B' }}>₹30,92,000</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991B1B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingDown size={20} color="#EF4444" /> Liabilities & Equity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Accounts Payable', amount: '₹1,12,000' },
                                    { label: 'GST Payable', amount: '₹54,200' },
                                    { label: 'Loans / Credit', amount: '₹5,00,000' },
                                    { label: "Owner's Equity", amount: '₹24,25,800' }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FFF1F2', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '600', color: '#991B1B' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#FEE2E2', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', border: '1px solid #EF4444' }}>
                                    <span style={{ fontWeight: '800', color: '#991B1B' }}>Total Liab. & Equity</span>
                                    <span style={{ fontWeight: '900', color: '#991B1B' }}>₹30,92,000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gst' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {gstReports.map((report, i) => (
                            <div key={i} style={{ border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#F0FDFA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
                                        <FileText size={20} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: report.status === 'Ready to File' ? '#1B6B3A' : '#B45309', background: report.status === 'Ready to File' ? '#F0FDF4' : '#FFFBEB', padding: '0.4rem 0.6rem', borderRadius: '8px' }}>
                                        {report.status}
                                    </span>
                                </div>
                                <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>{report.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.25rem' }}>Period: {report.period}</p>
                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#064E3B' }}>{report.tax}</span>
                                    <button style={{ background: 'transparent', border: 'none', color: '#1B6B3A', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}>VIEW DETAIL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                                <th style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                                <th style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Mode</th>
                                <th style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dayBook.map(entry => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: '600', color: '#475569' }}>{entry.date}</td>
                                    <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: '#1E293B' }}>{entry.category}</td>
                                    <td style={{ padding: '1.25rem 1rem' }}><span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F1F5F9', fontSize: '0.75rem', fontWeight: '700' }}>{entry.mode}</span></td>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <span style={{ color: entry.type === 'Income' ? '#1B6B3A' : '#EF4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            {entry.type === 'Income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '850', color: '#1E293B' }}>{entry.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Record Entry Modal */}
            {isEntryModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>New Financial Entry</h2>
                            <button onClick={() => setIsEntryModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Entry Type</label>
                                    <select value={entryForm.entry_type} onChange={(e) => setEntryForm({ ...entryForm, entry_type: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="income">Income / Sales</option>
                                        <option value="expense">Expense / Purchase</option>
                                        <option value="transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Date</label>
                                    <input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Amount (₹)</label>
                                <input required type="number" placeholder="0.00" value={entryForm.amount} onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })} style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '2rem', fontWeight: '900', color: '#064E3B', textAlign: 'center' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category</label>
                                    <select value={entryForm.category} onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="Sales Revenue">Sales Revenue</option>
                                        <option value="Rent & Utilities">Rent & Utilities</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Inventory Purchase">Inventory Purchase</option>
                                        <option value="Salary / Payroll">Salary / Payroll</option>
                                        <option value="Other Income">Other Income</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Account / Mode</label>
                                    <select value={entryForm.mode} onChange={(e) => setEntryForm({ ...entryForm, mode: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="Cash in Hand">Cash in Hand</option>
                                        <option value="HDFC Bank Account">HDFC Bank Account</option>
                                        <option value="ICICI Bank Account">ICICI Bank Account</option>
                                        <option value="UPI / Razorpay">UPI / Razorpay</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Notes / Reference</label>
                                <input placeholder="e.g. Inv #123 or Bill Reference" value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1.25rem', borderRadius: '24px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.15rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Save Financial Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessAccounting;
