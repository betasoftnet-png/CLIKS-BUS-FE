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

    const { data: dbBalanceSheet } = useQuery({
        queryKey: ['balanceSheet'],
        queryFn: () => accountingService.getBalanceSheet()
    });

    const { data: dbBankAccounts = [] } = useQuery({
        queryKey: ['bankAccounts'],
        queryFn: () => accountingService.getBankAccounts()
    });

    // Mutations
    const recordEntryMutation = useMutation({
        mutationFn: (data) => accountingService.recordEntry(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profitLoss'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['balanceSheet'] });
            queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
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
        { label: 'Gross Revenue', value: dbPL ? `₹${parseFloat(dbPL.gross_revenue || 0).toLocaleString()}` : '₹0', icon: TrendingUp, color: '#7C3AED' },
        { label: 'Total Expenses', value: dbPL ? `₹${parseFloat(dbPL.total_expenses || 0).toLocaleString()}` : '₹0', icon: TrendingDown, color: '#EF4444' },
        { label: 'Net Profit', value: dbPL ? `₹${parseFloat(dbPL.net_profit || 0).toLocaleString()}` : '₹0', icon: IndianRupee, color: '#0891B2' },
        { label: 'GST Payable', value: dbBalanceSheet?.liabilities?.gst_payable ? `₹${parseFloat(dbBalanceSheet.liabilities.gst_payable).toLocaleString()}` : '₹0', icon: ShieldCheck, color: '#0D9488' }
    ];

    const gstReports = [
        { name: 'GSTR-1 Summary', period: 'May 2026', status: 'Ready to File', tax: dbBalanceSheet?.liabilities?.gst_payable ? `₹${Math.round(parseFloat(dbBalanceSheet.liabilities.gst_payable) * 0.45).toLocaleString()}` : '₹0' },
        { name: 'GSTR-3B Summary', period: 'May 2026', status: 'In Progress', tax: dbBalanceSheet?.liabilities?.gst_payable ? `₹${Math.round(parseFloat(dbBalanceSheet.liabilities.gst_payable) * 0.55).toLocaleString()}` : '₹0' },
        { name: 'ITC Summary', period: 'May 2026', status: 'Verified', tax: dbBalanceSheet?.assets?.receivables ? `₹${Math.round(parseFloat(dbBalanceSheet.assets.receivables) * 0.1).toLocaleString()}` : '₹0' }
    ];

    const dayBook = dbLedger.map(item => ({
        id: item.id,
        type: item.entry_type === 'income' ? 'Income' : 'Expense',
        category: item.category || 'Revenue',
        amount: `₹${parseFloat(item.amount || 0).toLocaleString()}`,
        mode: item.mode || 'Cash',
        date: item.date || '2026-05-08'
    }));

    const expensesList = dbExpenses.map(item => ({
        cat: item.category || 'General',
        desc: item.notes || 'Operational Cost',
        date: item.date || '2026-05-08',
        amt: `₹${parseFloat(item.amount || 0).toLocaleString()}`
    }));

    const pAndLIncomeGroups = dbLedger.filter(item => item.entry_type === 'income').reduce((acc, item) => {
        const cat = item.category || 'Sales Revenue';
        acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
        return acc;
    }, {});

    const pAndLExpenseGroups = dbLedger.filter(item => item.entry_type === 'expense').reduce((acc, item) => {
        const cat = item.category || 'General Expense';
        acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
        return acc;
    }, {});

    const totalIncomeGroupSum = Object.values(pAndLIncomeGroups).reduce((sum, val) => sum + val, 0);
    const totalExpenseGroupSum = Object.values(pAndLExpenseGroups).reduce((sum, val) => sum + val, 0);

    const totalAssets = (dbBalanceSheet?.assets?.cash || 0) +
                        (dbBalanceSheet?.assets?.bank || 0) +
                        (dbBalanceSheet?.assets?.inventory || 0) +
                        (dbBalanceSheet?.assets?.receivables || 0) +
                        (dbBalanceSheet?.assets?.fixed_assets || 0);

    const totalLiabilities = (dbBalanceSheet?.liabilities?.payables || 0) +
                             (dbBalanceSheet?.liabilities?.gst_payable || 0) +
                             (dbBalanceSheet?.liabilities?.loans || 0) +
                             (dbBalanceSheet?.liabilities?.equity || 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)' }}>
                            <Calculator size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Accounting & GST</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.88rem', fontWeight: '500', margin: 0 }}>Compliance-ready financial management and GST reporting.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        className="crm-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', borderRadius: '10px', background: 'white', color: '#1D4ED8', border: '1px solid #DBEAFE', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.02)' }}
                    >
                        <Download size={16} /> Export for CA
                    </button>
                    <button 
                        onClick={() => setIsEntryModalOpen(true)}
                        className="crm-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(27, 107, 58, 0.15)' }}
                    >
                        <Plus size={16} /> Record Entry
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {summaryStats.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E293B', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.25rem', background: '#F1F5F9', borderRadius: '10px', width: 'fit-content' }}>
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
                            padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', 
                            background: activeTab === tab.id ? '#D97706' : 'transparent', 
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            fontWeight: '800', cursor: 'pointer', transition: 'all 0.15s',
                            textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                {activeTab === 'expenses' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                            {[
                                { label: 'Fixed Expenses', value: '₹1,50,000', icon: Building2, color: '#7C3AED' },
                                { label: 'Variable Expenses', value: '₹2,92,000', icon: Layers, color: '#0D9488' },
                                { label: 'Pending Bills', value: '₹42,000', icon: Receipt, color: '#B45309' },
                                { label: 'Total MTD', value: '₹4,42,000', icon: TrendingDown, color: '#EF4444' }
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '0.85rem 1.1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>{stat.label}</p>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>{stat.value}</h4>
                                    </div>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                        <stat.icon size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#F8FAFC' }}>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Expense Category</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Description</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expensesList.map((exp, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 1rem' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontSize: '0.75rem', fontWeight: '750' }}>{exp.cat}</span></td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{exp.desc}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#94A3B8' }}>{exp.date}</td>
                                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '850', color: '#EF4444', fontSize: '0.85rem' }}>{exp.amt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'cash-bank' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {dbBankAccounts.length > 0 ? dbBankAccounts.map((acc, i) => (
                                <div key={i} style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `#1D4ED815`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                                            <Building2 size={20} />
                                        </div>
                                        <button style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                                    </div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.15rem', margin: 0 }}>{acc.account_name}</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem', margin: 0 }}>{acc.bank_name || 'HDFC Bank'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.2rem', margin: 0 }}>Balance</p>
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1D4ED8', margin: 0 }}>₹{parseFloat(acc.balance || 0).toLocaleString()}</h3>
                                        </div>
                                        <button style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', color: '#1D4ED8', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}>History</button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                    <p style={{ color: '#64748B', fontWeight: '600', fontSize: '0.88rem', margin: 0 }}>No cash or bank accounts configured yet. Please configure your financial profiles.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'p&l' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ArrowUpRight color="#10B981" size={18} /> Revenue Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {Object.keys(pAndLIncomeGroups).length > 0 ? Object.entries(pAndLIncomeGroups).map(([cat, amt], i) => {
                                    const pct = totalIncomeGroupSum > 0 ? Math.round((amt / totalIncomeGroupSum) * 100) : 0;
                                    return (
                                        <div key={i} style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{cat}</span>
                                            <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>₹{amt.toLocaleString()} <small style={{ color: '#10B981', fontWeight: '700' }}>({pct}%)</small></span>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>
                                        No revenues recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ArrowDownRight color="#EF4444" size={18} /> Expense Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {Object.keys(pAndLExpenseGroups).length > 0 ? Object.entries(pAndLExpenseGroups).map(([cat, amt], i) => {
                                    const pct = totalExpenseGroupSum > 0 ? Math.round((amt / totalExpenseGroupSum) * 100) : 0;
                                    return (
                                        <div key={i} style={{ background: '#FFF1F2', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#991B1B', fontSize: '0.85rem' }}>{cat}</span>
                                            <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>₹{amt.toLocaleString()} <small style={{ color: '#EF4444', fontWeight: '700' }}>({pct}%)</small></span>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ background: '#FFF1F2', padding: '1rem', borderRadius: '10px', color: '#991B1B', fontWeight: '600', fontSize: '0.85rem' }}>
                                        No expenses recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'receivables' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
                            {/* Aging Report */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0 }}>Aging Report (Receivables)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {[
                                        { label: '0-30 Days', amount: `₹${Math.round((dbBalanceSheet?.assets?.receivables || 0) * 0.6).toLocaleString()}`, pct: (dbBalanceSheet?.assets?.receivables ? 60 : 0), color: '#10B981' },
                                        { label: '31-60 Days', amount: `₹${Math.round((dbBalanceSheet?.assets?.receivables || 0) * 0.25).toLocaleString()}`, pct: (dbBalanceSheet?.assets?.receivables ? 25 : 0), color: '#F59E0B' },
                                        { label: '60+ Days', amount: `₹${Math.round((dbBalanceSheet?.assets?.receivables || 0) * 0.15).toLocaleString()}`, pct: (dbBalanceSheet?.assets?.receivables ? 15 : 0), color: '#EF4444' }
                                    ].map((age, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem', fontWeight: '700' }}>
                                                <span style={{ color: '#64748B' }}>{age.label}</span>
                                                <span style={{ color: '#1E293B' }}>{age.amount}</span>
                                            </div>
                                            <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${age.pct}%`, background: age.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#F0F9F4', borderRadius: '12px', border: '1px solid #DCF2E4' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7C3AED', marginBottom: '0.2rem', margin: 0 }}>TOTAL RECEIVABLES</p>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#1D4ED8', margin: 0 }}>₹{parseFloat(dbBalanceSheet?.assets?.receivables || 0).toLocaleString()}</h3>
                                </div>
                            </div>

                            {/* Party-wise Outstanding */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Party-wise Outstanding</h3>
                                    <button style={{ color: '#1D4ED8', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}>VIEW ALL PARTY</button>
                                </div>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#F8FAFC' }}>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Party Name</th>
                                                <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Pending Amount</th>
                                                <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Due Since</th>
                                                <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dbBalanceSheet?.assets?.receivables > 0 ? [
                                                { name: 'Global Solutions', amount: `₹${Math.round(dbBalanceSheet.assets.receivables * 0.5).toLocaleString()}`, days: '12 Days', color: '#7C3AED' },
                                                { name: 'Vertex Systems', amount: `₹${Math.round(dbBalanceSheet.assets.receivables * 0.3).toLocaleString()}`, days: '45 Days', color: '#F59E0B' },
                                                { name: 'Creative Agency', amount: `₹${Math.round(dbBalanceSheet.assets.receivables * 0.2).toLocaleString()}`, days: '68 Days', color: '#EF4444' }
                                            ].map((party, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{party.name}</td>
                                                    <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: party.color, fontSize: '0.85rem' }}>{party.amount}</td>
                                                    <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.8rem' }}>{party.days}</td>
                                                    <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                                        <button style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>Remind</button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>
                                                        No outstanding payments pending.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'balance-sheet' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Briefcase size={18} color="#1D4ED8" /> Assets
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    { label: 'Cash in Hand', amount: `₹${parseFloat(dbBalanceSheet?.assets?.cash || 0).toLocaleString()}` },
                                    { label: 'Bank Balance', amount: `₹${parseFloat(dbBalanceSheet?.assets?.bank || 0).toLocaleString()}` },
                                    { label: 'Inventory Value', amount: `₹${parseFloat(dbBalanceSheet?.assets?.inventory || 0).toLocaleString()}` },
                                    { label: 'Accounts Receivable', amount: `₹${parseFloat(dbBalanceSheet?.assets?.receivables || 0).toLocaleString()}` },
                                    { label: 'Fixed Assets', amount: `₹${parseFloat(dbBalanceSheet?.assets?.fixed_assets || 0).toLocaleString()}` }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#E6F4EA', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', border: '1px solid #A7F3D0', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#137333', fontSize: '0.85rem' }}>Total Assets</span>
                                    <span style={{ fontWeight: '900', color: '#137333', fontSize: '0.95rem' }}>₹{totalAssets.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <TrendingDown size={18} color="#EF4444" /> Liabilities & Equity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    { label: 'Accounts Payable', amount: `₹${parseFloat(dbBalanceSheet?.liabilities?.payables || 0).toLocaleString()}` },
                                    { label: 'GST Payable', amount: `₹${parseFloat(dbBalanceSheet?.liabilities?.gst_payable || 0).toLocaleString()}` },
                                    { label: 'Loans / Credit', amount: `₹${parseFloat(dbBalanceSheet?.liabilities?.loans || 0).toLocaleString()}` },
                                    { label: "Owner's Equity", amount: `₹${parseFloat(dbBalanceSheet?.liabilities?.equity || 0).toLocaleString()}` }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FFF1F2', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#991B1B', fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#FEE2E2', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', border: '1px solid #FCA5A5', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.85rem' }}>Total Liab. & Equity</span>
                                    <span style={{ fontWeight: '900', color: '#991B1B', fontSize: '0.95rem' }}>₹{totalLiabilities.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gst' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {gstReports.map((report, i) => (
                            <div key={i} style={{ border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                                        <FileText size={18} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: report.status === 'Ready to File' ? '#137333' : '#B45309', background: report.status === 'Ready to File' ? '#E6F4EA' : '#FFFBEB', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                                        {report.status}
                                    </span>
                                </div>
                                <h4 style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.2rem', margin: 0 }}>{report.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem', margin: 0 }}>Period: {report.period}</p>
                                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1D4ED8' }}>{report.tax}</span>
                                    <button style={{ background: 'transparent', border: 'none', color: '#1D4ED8', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}>VIEW DETAIL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                                    <th style={{ padding: '0.6rem 1rem', color: '#94A3B8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '0.6rem 1rem', color: '#94A3B8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Category</th>
                                    <th style={{ padding: '0.6rem 1rem', color: '#94A3B8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Mode</th>
                                    <th style={{ padding: '0.6rem 1rem', color: '#94A3B8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ padding: '0.6rem 1rem', color: '#94A3B8', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dayBook.map(entry => (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{entry.date}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{entry.category}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#F1F5F9', fontSize: '0.75rem', fontWeight: '700' }}>{entry.mode}</span></td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ color: entry.type === 'Income' ? '#137333' : '#EF4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                                                {entry.type === 'Income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '850', color: '#1E293B', fontSize: '0.85rem' }}>{entry.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Entry Modal */}
            {isEntryModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>New Financial Entry</h2>
                            <button onClick={() => setIsEntryModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Entry Type</label>
                                    <select value={entryForm.entry_type} onChange={(e) => setEntryForm({ ...entryForm, entry_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="income">Income / Sales</option>
                                        <option value="expense">Expense / Purchase</option>
                                        <option value="transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Date</label>
                                    <input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Amount (₹)</label>
                                <input required type="number" placeholder="0.00" value={entryForm.amount} onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', textAlign: 'center' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Category</label>
                                    <select value={entryForm.category} onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="Sales Revenue">Sales Revenue</option>
                                        <option value="Rent & Utilities">Rent & Utilities</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Inventory Purchase">Inventory Purchase</option>
                                        <option value="Salary / Payroll">Salary / Payroll</option>
                                        <option value="Other Income">Other Income</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Account / Mode</label>
                                    <select value={entryForm.mode} onChange={(e) => setEntryForm({ ...entryForm, mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}>
                                        <option value="Cash in Hand">Cash in Hand</option>
                                        <option value="HDFC Bank Account">HDFC Bank Account</option>
                                        <option value="ICICI Bank Account">ICICI Bank Account</option>
                                        <option value="UPI / Razorpay">UPI / Razorpay</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Notes / Reference</label>
                                <input placeholder="e.g. Inv #123 or Bill Reference" value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}>
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
