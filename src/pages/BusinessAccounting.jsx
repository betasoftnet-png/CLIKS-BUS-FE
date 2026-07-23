import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import FilterableTableHead from '../components/FilterableTableHead';
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
import { gstService, settingsService } from '../services';
import * as XLSX from 'xlsx';
import { useCurrency } from '../context';

const BusinessAccounting = () => {
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    // Fetch customization settings dynamically to enforce master configurations
    const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const activeConfig = userSettings?.data || userSettings || {};

    const [activeTab, setActiveTab] = useState('p&l');
    const [colFilters, setColFilters] = React.useState({}); // 'p&l', 'gst', 'ledger', 'cash-bank', 'expenses'
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFromDate, setExportFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [exportToDate, setExportToDate] = useState(new Date().toISOString().split('T')[0]);
    const [exportFormat, setExportFormat] = useState('xlsx');



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

    const { data: dbReconciliations = [] } = useQuery({
        queryKey: ['gstReconciliationsData'],
        queryFn: () => gstService.getReconciliations()
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
            resetForm();
            alert('Financial Entry registered and saved successfully!');
        }
    });

    const handleExecuteExport = () => {
        if (!dbLedger || dbLedger.length === 0) {
            alert('No accounting ledger data found in database to export.');
            return;
        }

        // Filter logic for accounting records between specific dates
        const filteredLedger = dbLedger.filter(item => {
            if (!item.date) return false;
            const itemDateStr = item.date.split('T')[0];
            return itemDateStr >= exportFromDate && itemDateStr <= exportToDate;
        });

        if (filteredLedger.length === 0) {
            alert(`No entries recorded between ${exportFromDate} and ${exportToDate}. Please adjust the date limits.`);
            return;
        }

        let exportPayload = [];
        if (exportFormat === 'xlsx') {
            // Structured precisely for professional FIN-PRO (Auditor) Audits
            exportPayload = filteredLedger.map((item, index) => {
                const isIncome = item.entry_type === 'income';
                return {
                    'Voucher Date': item.date ? item.date.split('T')[0] : '',
                    'Voucher Type': isIncome ? 'Receipt' : (item.entry_type === 'transfer' ? 'Contra' : 'Payment'),
                    'Voucher Reference': item.id || (index + 1),
                    'Account Particulars': item.category || 'General Ledger',
                    'Transaction Mode': item.mode || 'Other',
                    'Notes / Memo': item.notes || '',
                    'Debit (Expenses) - INR': !isIncome && item.entry_type !== 'transfer' ? parseFloat(item.amount || 0) : 0,
                    'Credit (Incomes) - INR': isIncome ? parseFloat(item.amount || 0) : 0,
                    'Total Net Amount': parseFloat(item.amount || 0)
                };
            });
        } else {
            // Clean raw CSV dump
            exportPayload = filteredLedger.map((item, index) => ({
                'Record_ID': item.id || index + 1,
                'Date': item.date ? item.date.split('T')[0] : '',
                'Type': item.entry_type,
                'Category': item.category || '',
                'Mode': item.mode || '',
                'Amount_INR': parseFloat(item.amount || 0),
                'Notes': item.notes || ''
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportPayload);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'FIN_PRO_Audit_Ledger');

        const fileName = `CLIKS_FIN_PRO_Audit_${exportFromDate}_to_${exportToDate}.${exportFormat}`;
        if (exportFormat === 'xlsx') {
            XLSX.writeFile(wb, fileName);
        } else {
            XLSX.writeFile(wb, fileName, { bookType: 'csv' });
        }

        setIsExportModalOpen(false);
    };

    // Form inputs state
    const [entryForm, setEntryForm] = useState({
        entry_type: 'income',
        date: new Date().toISOString().split('T')[0],
        amount: '0',
        category: 'Sales Revenue',
        mode: 'Cash in Hand',
        notes: ''
    });

    const resetForm = () => {
        setEntryForm({
            entry_type: 'income',
            date: new Date().toISOString().split('T')[0],
            amount: '0',
            category: 'Sales Revenue',
            mode: 'Cash in Hand',
            notes: ''
        });
    };

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
        { label: 'Gross Revenue', value: dbPL ? formatCurrency(dbPL.gross_revenue || 0) : formatCurrency(0), icon: TrendingUp, color: '#7C3AED', bg: '#F3E8FF' },
        { label: 'Total Expenses', value: dbPL ? formatCurrency(dbPL.total_expenses || 0) : formatCurrency(0), icon: TrendingDown, color: '#EF4444', bg: '#FEF2F2' },
        { label: 'Net Profit', value: dbPL ? formatCurrency(dbPL.net_profit || 0) : formatCurrency(0), icon: IndianRupee, color: '#0891B2', bg: '#E0F2FE' },
        { label: 'GST Payable', value: dbBalanceSheet?.liabilities?.gst_payable ? formatCurrency(dbBalanceSheet.liabilities.gst_payable) : formatCurrency(0), icon: ShieldCheck, color: '#0D9488', bg: '#DCFCE7' }
    ];

    const gstReports = [
        { name: 'GSTR-1 Summary', period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), status: 'Action Needed', tax: dbBalanceSheet?.liabilities?.gst_payable ? formatCurrency(dbBalanceSheet.liabilities.gst_payable) : formatCurrency(0) },
        { name: 'GSTR-3B Summary', period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), status: 'Ready', tax: formatCurrency(0) },
        { name: 'ITC Summary', period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), status: 'Auto-populated', tax: dbBalanceSheet?.assets?.receivables ? formatCurrency(dbBalanceSheet.assets.receivables) : formatCurrency(0) }
    ];

    const dayBook = dbLedger.map(item => ({
        id: item.id,
        type: item.entry_type === 'income' ? 'Income' : 'Expense',
        category: item.category || 'Transaction',
        amount: formatCurrency(item.amount || 0),
        mode: item.mode || 'Other',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const expensesList = dbExpenses.map(item => ({
        cat: item.category || 'Uncategorized',
        desc: item.notes || 'Recorded Expense',
        date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
        amt: formatCurrency(item.amount || 0),
        rawAmt: parseFloat(item.amount) || 0
    }));

    const pAndLIncomeGroups = dbLedger.filter(item => item.entry_type === 'income').reduce((acc, item) => {
        const cat = item.category || 'General Income';
        acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
        return acc;
    }, {});

    const pAndLExpenseGroups = dbLedger.filter(item => item.entry_type === 'expense').reduce((acc, item) => {
        const cat = item.category || 'General Expense';
        acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
        return acc;
    }, {});

    dbExpenses.forEach(item => {
        const cat = item.category || item.category_name || 'Operational Expense';
        pAndLExpenseGroups[cat] = (pAndLExpenseGroups[cat] || 0) + (parseFloat(item.amount || item.expense_amount) || 0);
    });

    dbReconciliations.forEach(item => {
        const cat = 'Vendor Purchase (GST)';
        pAndLExpenseGroups[cat] = (pAndLExpenseGroups[cat] || 0) + (parseFloat(item.invoice_amount || 0) + parseFloat(item.eligible_itc || 0));
    });

    const totalIncomeGroupSum = Object.values(pAndLIncomeGroups).reduce((sum, val) => sum + val, 0);
    const totalExpenseGroupSum = Object.values(pAndLExpenseGroups).reduce((sum, val) => sum + val, 0);

    const totalAssets = (parseFloat(dbBalanceSheet?.assets?.cash) || 0) +
        (parseFloat(dbBalanceSheet?.assets?.bank) || 0) +
        (parseFloat(dbBalanceSheet?.assets?.inventory) || 0) +
        (parseFloat(dbBalanceSheet?.assets?.receivables) || 0) +
        (parseFloat(dbBalanceSheet?.assets?.fixed_assets) || 0);

    const totalLiabilities = (parseFloat(dbBalanceSheet?.liabilities?.payables) || 0) +
        (parseFloat(dbBalanceSheet?.liabilities?.gst_payable) || 0) +
        (parseFloat(dbBalanceSheet?.liabilities?.loans) || 0) +
        (parseFloat(dbBalanceSheet?.liabilities?.equity) || 0);

    if (!isLoadingSettings && activeConfig.accountingModule === false) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '3rem', borderRadius: '24px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.1)' }}>
                        <Calculator size={40} style={{ color: '#7C3AED' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Double Entry Accounting Locked</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', fontWeight: '500' }}>
                        The general ledgers, trial balances, and Profit & Loss sheet features are currently disabled. You can activate full Double Entry Accounting anytime from the Engine Customizer panel.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.href = '/customization'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none',
                                fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.2)'
                            }}
                        >
                            Activate Accounting Engine
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#FFFFFF', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .crm-table-row:hover {
                    background-color: #FDF4FF !important;
                }
                .crm-btn {
                    transition: all 0.2s ease-in-out !important;
                }
                .crm-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 12px 24px rgba(190, 24, 93, 0.25) !important;
                    opacity: 0.95;
                }
                .crm-btn-secondary {
                    transition: all 0.2s ease-in-out !important;
                }
                .crm-btn-secondary:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05) !important;
                    opacity: 0.95;
                }
                .stat-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01) !important;
                    border-color: #D8B4FE !important;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-track {
                    background: #F1F5F9;
                    border-radius: 10px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 10px;
                }
                .ledger-modal-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
            `}</style>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Calculator size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Accounting & GST</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Compliance-ready financial management and GST reporting.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="crm-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: '#FFF1F2', color: '#BE185D', border: '1px solid #FECDD3', fontWeight: '850', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(190,24,93,0.03)' }}
                    >
                        <Download size={15} /> Secure FIN-PRO Export
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsEntryModalOpen(true);
                        }}
                        className="crm-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}
                    >
                        <Plus size={15} /> Record Entry
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            {/* Specialized Accounting Prime Stats Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {summaryStats.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((stat, idx) => (
                    <div
                        key={idx}
                        className="stat-card"
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: 'white',
                            padding: '1.5rem 1.75rem',
                            borderRadius: '20px',
                            border: '1px solid #E2E8F0',
                            borderTop: `4px solid ${stat.color}`,
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -2px rgba(0,0,0,0.01)',
                            cursor: 'default',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            </div>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0, boxShadow: `0 4px 12px ${stat.color}15` }}>
                                <stat.icon size={18} />
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.85rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 0.4rem 0', lineHeight: 1 }}>{stat.value}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stat.color }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Live Position</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Selector */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'p&l', label: 'P & L', gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', shadowColor: 'rgba(99, 102, 241, 0.15)' },
                    { id: 'balance-sheet', label: 'Balance Sheet', gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'receivables', label: 'Receivables & Payables', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'expenses', label: 'Expenses', gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', shadowColor: 'rgba(239, 68, 68, 0.15)' },
                    { id: 'cash-bank', label: 'Cash & Bank', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' },
                    { id: 'gst', label: 'GST', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' },
                    { id: 'ledger', label: 'Day Book', gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)', shadowColor: 'rgba(100, 116, 139, 0.15)' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '8px',
                            background: activeTab === tab.id ? tab.gradient : 'white',
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeTab === tab.id ? `0 4px 10px ${tab.shadowColor}` : 'none'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                {activeTab === 'expenses' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                            {[
                                { label: 'Total MTD', value: formatCurrency(totalExpenseGroupSum), icon: TrendingDown, color: '#EF4444' },
                                { label: 'Operating Costs', value: formatCurrency(totalExpenseGroupSum * 0.7), icon: Layers, color: '#0D9488' }, // Derived generically from recorded entries
                                { label: 'Top Expense Cat.', value: Object.keys(pAndLExpenseGroups).length > 0 ? Object.keys(pAndLExpenseGroups)[0] : 'N/A', icon: Building2, color: '#7C3AED' },
                                { label: 'Payables Balance', value: dbBalanceSheet?.liabilities?.payables ? formatCurrency(dbBalanceSheet.liabilities.payables) : formatCurrency(0), icon: Receipt, color: '#B45309' }
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '0.85rem 1.1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', margin: 0, textTransform: 'uppercase' }}>{stat.label}</p>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>{stat.value}</h4>
                                    </div>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
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
                                    {expensesList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((exp, i) => (
                                        <tr key={i} className="crm-table-row" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '0.6rem 1rem' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#E0E7FF', color: '#4338CA', fontSize: '0.75rem', fontWeight: '800' }}>{exp.cat}</span></td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{exp.desc}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>{exp.date}</td>
                                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '850', color: '#B91C1C', fontSize: '0.85rem' }}>{exp.amt}</td>
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
                                            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1D4ED8', margin: 0 }}>{formatCurrency(acc.balance || 0)}</h3>
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
                                            <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{formatCurrency(amt)} <small style={{ color: '#10B981', fontWeight: '700' }}>({pct}%)</small></span>
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
                                            <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{formatCurrency(amt)} <small style={{ color: '#EF4444', fontWeight: '700' }}>({pct}%)</small></span>
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
                                        { label: 'Pending Receivables', amount: formatCurrency(dbBalanceSheet?.assets?.receivables || 0), pct: (dbBalanceSheet?.assets?.receivables > 0 ? 100 : 0), color: '#10B981' }
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
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#1D4ED8', margin: 0 }}>{formatCurrency(dbBalanceSheet?.assets?.receivables || 0)}</h3>
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
                                            <tr>
                                                <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>
                                                    No outstanding payments pending.
                                                </td>
                                            </tr>
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
                                    { label: 'Cash in Hand', amount: formatCurrency(dbBalanceSheet?.assets?.cash || 0) },
                                    { label: 'Bank Balance', amount: formatCurrency(dbBalanceSheet?.assets?.bank || 0) },
                                    { label: 'Inventory Value', amount: formatCurrency(dbBalanceSheet?.assets?.inventory || 0) },
                                    { label: 'Accounts Receivable', amount: formatCurrency(dbBalanceSheet?.assets?.receivables || 0) },
                                    { label: 'Fixed Assets', amount: formatCurrency(dbBalanceSheet?.assets?.fixed_assets || 0) }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#E6F4EA', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', border: '1px solid #A7F3D0', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#137333', fontSize: '0.85rem' }}>Total Assets</span>
                                    <span style={{ fontWeight: '900', color: '#137333', fontSize: '0.95rem' }}>{formatCurrency(totalAssets)}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <TrendingDown size={18} color="#EF4444" /> Liabilities & Equity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {[
                                    { label: 'Accounts Payable', amount: formatCurrency(dbBalanceSheet?.liabilities?.payables || 0) },
                                    { label: 'GST Payable', amount: formatCurrency(dbBalanceSheet?.liabilities?.gst_payable || 0) },
                                    { label: 'Loans / Credit', amount: formatCurrency(dbBalanceSheet?.liabilities?.loans || 0) },
                                    { label: "Owner's Equity", amount: formatCurrency(dbBalanceSheet?.liabilities?.equity || 0) }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FFF1F2', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', color: '#991B1B', fontSize: '0.85rem' }}>{item.label}</span>
                                        <span style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem' }}>{item.amount}</span>
                                    </div>
                                ))}
                                <div style={{ background: '#FEE2E2', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', border: '1px solid #FCA5A5', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.85rem' }}>Total Liab. & Equity</span>
                                    <span style={{ fontWeight: '900', color: '#991B1B', fontSize: '0.95rem' }}>{formatCurrency(totalLiabilities)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gst' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {gstReports.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((report, i) => (
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
                            <FilterableTableHead columns={[
                                { key: 'date', label: 'Date', placeholder: 'e.g. 2026-05' },
                                { key: 'category', label: 'Category', placeholder: 'e.g. Sales' },
                                { key: 'mode', label: 'Mode', placeholder: 'e.g. UPI' },
                                { key: 'type', label: 'Type', placeholder: 'e.g. Income' },
                                { key: 'amount', label: 'Amount', placeholder: 'e.g. 5000' }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {dayBook.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(entry => (
                                    <tr key={entry.id} className="crm-table-row" style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#64748B', fontSize: '0.8rem' }}>{entry.date}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', color: '#1E293B', fontSize: '0.85rem' }}>{entry.category}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#F3F4F6', color: '#4B5563', fontSize: '0.75rem', fontWeight: '800' }}>{entry.mode}</span></td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: entry.type === 'Income' ? '#DCFCE7' : '#FEE2E2', color: entry.type === 'Income' ? '#166534' : '#991B1B', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                                                {entry.type === 'Income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {entry.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right', fontWeight: '900', color: entry.type === 'Income' ? '#047857' : '#B91C1C', fontSize: '0.88rem' }}>{entry.amount}</td>
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
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Amount ({currency.symbol})</label>
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

            {/* Unified FIN-PRO Export Limits Console */}
            {isExportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>

                        {/* Decorative Branding Bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #EC4899 0%, #7C3AED 100%)' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE185D' }}>
                                    <Download size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Secure FIN-PRO Audit Export</h2>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600', margin: 0 }}>Select your timeline and format options.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsExportModalOpen(false)} style={{ border: 'none', background: '#F8FAFC', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Set Date Range Limits */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Set Date Limits</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            <Calendar size={11} color="#EC4899" /> From
                                        </label>
                                        <input
                                            type="date"
                                            value={exportFromDate}
                                            onChange={(e) => setExportFromDate(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '750', background: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                                            <Calendar size={11} color="#7C3AED" /> To
                                        </label>
                                        <input
                                            type="date"
                                            value={exportToDate}
                                            onChange={(e) => setExportToDate(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '750', background: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Format Selector */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '850', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Select File Format</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {[
                                        { id: 'xlsx', label: 'Tally/Excel Doc', sub: '.xlsx Spreadsheet', color: '#10B981' },
                                        { id: 'csv', label: 'Raw Flat Data', sub: '.csv File', color: '#3B82F6' }
                                    ].map((fmt) => (
                                        <div
                                            key={fmt.id}
                                            onClick={() => setExportFormat(fmt.id)}
                                            style={{
                                                padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid',
                                                borderColor: exportFormat === fmt.id ? fmt.color : '#F1F5F9',
                                                background: exportFormat === fmt.id ? `${fmt.color}05` : '#FFFFFF',
                                                cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.8rem', fontWeight: '850', color: exportFormat === fmt.id ? '#0F172A' : '#475569' }}>{fmt.label}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '650', marginTop: '0.15rem' }}>{fmt.sub}</div>
                                            {exportFormat === fmt.id && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: fmt.color }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Footer */}
                            <div style={{ display: 'flex', gap: '0.5rem', background: '#ECFDF5', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #D1FAE5', alignItems: 'center', boxSizing: 'border-box' }}>
                                <ShieldCheck size={15} color="#059669" />
                                <span style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: '700' }}>Audit ready structures generated according to accounting principles.</span>
                            </div>

                            <button
                                onClick={handleExecuteExport}
                                style={{
                                    width: '100%', padding: '0.9rem', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                                    color: 'white', border: 'none', fontWeight: '850', fontSize: '0.88rem',
                                    cursor: 'pointer', boxShadow: '0 6px 15px rgba(190, 24, 93, 0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem'
                                }}
                            >
                                <Download size={15} /> EXPORT LEDGER NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessAccounting;
