import React, { useState } from 'react';
import { 
    TrendingUp, 
    Plus, 
    Search, 
    DollarSign, 
    Calendar, 
    AlertTriangle, 
    User, 
    FileText, 
    X, 
    CheckCircle2, 
    ArrowUpRight, 
    Percent, 
    Activity, 
    BarChart3, 
    Clock, 
    Settings, 
    Smartphone,
    Layers,
    Tag,
    Trash,
    ChevronDown,
    Filter
} from 'lucide-react';
import '../App.css';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { expensesService } from '../services';
import { useCurrency } from '../context';

const BusinessExpenses = () => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'recurring', 'budget', 'claims'
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [modeFilter, setModeFilter] = useState('All');
    const [columnFilters, setColumnFilters] = useState({ voucher: '', date: '', category: '', payee: '', subtotal: '', itc: '', total: '', mode: '' });
    const updateColumnFilter = (col, val) => setColumnFilters(prev => ({ ...prev, [col]: val }));
    const [openFilterCols, setOpenFilterCols] = useState({});
    const toggleColFilter = (key) => {
        setOpenFilterCols(prev => {
            const isOpen = !!prev[key];
            if (isOpen) updateColumnFilter(key, ''); // clear on close
            return { ...prev, [key]: !isOpen };
        });
    };
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    
    // Auto-trigger expense modal via search instructions
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsExpenseModalOpen(true);
            setSearchParams({}, { replace: true });
        } else if (searchParams.get('claim') === 'true') {
            setActiveTab('claims');
            setIsClaimModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbExpenses = [] } = useQuery({
        queryKey: ['expensesList'],
        queryFn: () => expensesService.getExpenses()
    });

    const { data: dbBudgets = [] } = useQuery({
        queryKey: ['budgetsList'],
        queryFn: () => expensesService.getBudgets()
    });

    const { data: dbClaims = [] } = useQuery({
        queryKey: ['claimsList'],
        queryFn: () => expensesService.getClaims()
    });

    // Mutations
    const createExpenseMutation = useMutation({
        mutationFn: (data) => expensesService.createExpense(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            setIsExpenseModalOpen(false);
            alert('Operational Business Expense successfully tracked and allocated!');
        }
    });

    const createBudgetMutation = useMutation({
        mutationFn: (data) => expensesService.createBudget(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetsList'] });
            setIsBudgetModalOpen(false);
            alert('New Departmental Budget target successfully allocated!');
        }
    });

    const lodgeClaimMutation = useMutation({
        mutationFn: (data) => expensesService.lodgeClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            setIsClaimModalOpen(false);
            alert('Employee reimbursement claim logged in managers verification queue!');
        }
    });

    const approveClaimMutation = useMutation({
        mutationFn: (id) => expensesService.approveClaim(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claimsList'] });
            alert('Claim approved and reimbursed successfully!');
        }
    });

    // fallbacks mapping
    const expenses = dbExpenses.map(item => ({
        expense_id: item.id,
        expense_number: item.expense_number || `EXP-2026-${item.id}`,
        expense_date: item.expense_date || (item.created_at || '').split('T')[0] || '2026-05-08',
        expense_status: item.expense_status || 'paid',
        category_name: item.category_name || 'General',
        subcategory: item.subcategory || 'Miscellaneous',
        payee_name: item.payee_name || '-',
        payee_phone: item.payee_phone || '',
        payee_gstin: item.payee_gstin || '',
        expense_amount: parseFloat(item.expense_amount) || 0,
        gst_percentage: parseFloat(item.gst_percentage) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
        tax_amount: parseFloat(item.tax_amount) || 0,
        payment_mode: item.payment_mode || 'N/A',
        transaction_reference: item.transaction_reference || '-',
        input_tax_credit: item.input_tax_credit || 'N/A'
    }));

    const budgets = dbBudgets.map(item => ({
        category_name: item.category_name || 'Uncategorized',
        budget_limit: parseFloat(item.budget_limit) || 0,
        spent_amount: parseFloat(item.spent_amount) || 0,
        alert_status: item.alert_status || 'Optimal'
    }));

    // Merge default categories with custom categories created under budgets
    const defaultCategories = ['Rent', 'Electricity', 'Internet', 'Salary', 'Fuel', 'General'];
    const budgetCategories = budgets.map(b => b.category_name).filter(name => name !== 'Uncategorized');
    const categoryOptions = Array.from(new Set([...defaultCategories, ...budgetCategories]));

    const claims = dbClaims.map(item => ({
        claim_id: item.id,
        employee_name: item.employee_name || 'Anonymous Staff',
        travel_expense: item.travel_expense || '-',
        claim_amount: parseFloat(item.claim_amount) || 0,
        reimbursement_status: item.reimbursement_status || 'Pending',
        approval_by: item.approval_by || '',
        date: item.date || (item.created_at ? item.created_at.split('T')[0] : '-')
    }));

    const { data: dbRecurrings = [] } = useQuery({
        queryKey: ['recurringsList'],
        queryFn: () => expensesService.getRecurrings()
    });

    const recurrings = dbRecurrings.map(item => ({
        id: item.id || `REC-${item.id}`,
        category_name: item.category_name || 'General',
        recurring_type: item.recurring_type || 'monthly',
        next_due_date: item.next_due_date || '-',
        auto_create: item.auto_create || 'Inactive',
        recurring_status: item.recurring_status || 'active',
        amount: parseFloat(item.amount) || parseFloat(item.expense_amount) || 0
    }));

    // Form states
    const [newExpense, setNewExpense] = useState({
        category_name: 'Rent',
        subcategory: '',
        payee_name: '',
        expense_amount: '',
        gst_percentage: 0,
        payment_mode: 'UPI',
        transaction_reference: ''
    });

    const [newBudget, setNewBudget] = useState({
        category_name: '',
        budget_limit: '',
        spent_amount: 0
    });

    const [newClaim, setNewClaim] = useState({
        employee_name: '',
        travel_expense: '',
        claim_amount: ''
    });

    const handleCreateExpense = (e) => {
        e.preventDefault();
        createExpenseMutation.mutate(newExpense);
    };

    const handleCreateBudget = (e) => {
        e.preventDefault();
        createBudgetMutation.mutate(newBudget);
    };

    const handleCreateClaim = (e) => {
        e.preventDefault();
        lodgeClaimMutation.mutate(newClaim);
    };

    const handleApproveClaim = (claimId) => {
        approveClaimMutation.mutate(claimId);
    };

    const filteredExpenses = expenses.filter(e => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !term ||
            e.payee_name.toLowerCase().includes(term) ||
            e.category_name.toLowerCase().includes(term) ||
            (e.subcategory || '').toLowerCase().includes(term) ||
            (e.expense_number || '').toLowerCase().includes(term) ||
            (e.expense_date || '').toLowerCase().includes(term) ||
            String(e.expense_amount).includes(term) ||
            (e.payment_mode || '').toLowerCase().includes(term);
        
        const matchesCategory = categoryFilter === 'All' || e.category_name === categoryFilter;
        const matchesMode = modeFilter === 'All' || e.payment_mode === modeFilter;

        // Per-column filters
        const cf = columnFilters;
        const matchVoucher = !cf.voucher || (e.expense_number || '').toLowerCase().includes(cf.voucher.toLowerCase());
        const matchDate = !cf.date || (e.expense_date || '').toLowerCase().includes(cf.date.toLowerCase());
        const matchCat = !cf.category || (e.category_name + ' ' + (e.subcategory || '')).toLowerCase().includes(cf.category.toLowerCase());
        const matchPayee = !cf.payee || (e.payee_name || '').toLowerCase().includes(cf.payee.toLowerCase());
        const matchSubtotal = !cf.subtotal || String(e.subtotal).includes(cf.subtotal);
        const matchItc = !cf.itc || String(Math.round(e.tax_amount)).includes(cf.itc);
        const matchTotal = !cf.total || String(e.expense_amount).includes(cf.total);
        const matchModeCol = !cf.mode || (e.payment_mode || '').toLowerCase().includes(cf.mode.toLowerCase());

        return matchesSearch && matchesCategory && matchesMode && matchVoucher && matchDate && matchCat && matchPayee && matchSubtotal && matchItc && matchTotal && matchModeCol;
    });

    const totalExpenseSpent = expenses.reduce((sum, e) => sum + e.expense_amount, 0);
    const totalITCClaimsAccumulated = expenses.reduce((sum, e) => sum + (e.tax_amount || 0), 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <TrendingUp size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Expenses & Operational Costs</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Add operational spendings, manage departmental budgets, track GST Input Tax Credit (ITC), automate recurring bills, and process staff reimbursement claims.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsClaimModalOpen(true)}
                        className="crm-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <User size={15} /> Lodge Staff Claim
                    </button>
                    <button 
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="crm-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Stats Summary Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Operational Costs (MTD)', value: formatCurrency(totalExpenseSpent), icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'GST Input Tax Credits (ITC)', value: formatCurrency(Math.round(totalITCClaimsAccumulated)), icon: Percent, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Active Monthly Recurrings', value: `${recurrings.length} Automation`, icon: Calendar, color: '#8B5CF6', bg: '#F5F3FF' },
                    { label: 'Pending Staff Claims', value: `${claims.filter(c => c.reimbursement_status === 'Pending').length} Claims`, icon: Clock, color: '#10B981', bg: '#ECFDF5' }
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

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'registry', label: 'Expenses Registry & ITC', icon: Tag, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'recurring', label: 'Recurring Subscriptions', icon: Calendar, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'budget', label: 'Department Budgets & Limits', icon: BarChart3, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'claims', label: 'Staff Reimbursements', icon: User, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="crm-btn-secondary"
                        style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', 
                            background: activeTab === tab.id ? tab.gradient : 'white', 
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeTab === tab.id ? '0 4px 8px rgba(255, 160, 122, 0.1)' : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Expense Registry */}
            {activeTab === 'registry' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', overflow: 'visible' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search any column (date, payee, amount)..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select 
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                            >
                                <option value="All">All Categories</option>
                                {categoryOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select 
                                value={modeFilter}
                                onChange={(e) => setModeFilter(e.target.value)}
                                style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                            >
                                <option value="All">All Modes</option>
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'visible', overflowY: 'visible', padding: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                {(() => {
                                    const cols = [
                                        { key: 'voucher',   label: 'Voucher No',          placeholder: 'e.g. EXP-001' },
                                        { key: 'date',      label: 'Date',                placeholder: 'e.g. 2026-05' },
                                        { key: 'category',  label: 'Category Description',placeholder: 'e.g. Rent' },
                                        { key: 'payee',     label: 'Payee / Merchant',    placeholder: 'e.g. Vendor' },
                                        { key: 'subtotal',  label: 'GST Subtotal',        placeholder: 'e.g. 5000' },
                                        { key: 'itc',       label: 'ITC Tax Claim',       placeholder: 'e.g. 900' },
                                        { key: 'total',     label: 'Total Paid',          placeholder: 'e.g. 10000' },
                                        { key: 'mode',      label: 'Mode',                placeholder: 'e.g. UPI' },
                                    ];
                                    const hasAnyOpen = cols.some(c => openFilterCols[c.key]);
                                    return (
                                        <>
                                            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                {cols.map(col => {
                                                    const isOpen = !!openFilterCols[col.key];
                                                    const hasValue = !!columnFilters[col.key];
                                                    return (
                                                        <th key={col.key} style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <span>{col.label}</span>
                                                                <button
                                                                    onClick={() => toggleColFilter(col.key)}
                                                                    title={`Filter by ${col.label}`}
                                                                    style={{
                                                                        background: isOpen || hasValue ? '#EDE9FE' : 'transparent',
                                                                        border: '1px solid ' + (isOpen || hasValue ? '#7C3AED' : '#E2E8F0'),
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer',
                                                                        padding: '2px 4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        color: isOpen || hasValue ? '#7C3AED' : '#CBD5E1',
                                                                        transition: 'all 0.15s',
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    <Filter size={10} />
                                                                    <ChevronDown size={9} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                                                                </button>
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                            {hasAnyOpen && (
                                                <tr style={{ borderBottom: '2px solid #7C3AED22', background: '#FAFAFA' }}>
                                                    {cols.map(col => (
                                                        <th key={col.key} style={{ padding: '0.25rem 0.5rem' }}>
                                                            {openFilterCols[col.key] ? (
                                                                <div style={{ position: 'relative' }}>
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        placeholder={col.placeholder}
                                                                        value={columnFilters[col.key]}
                                                                        onChange={(e) => updateColumnFilter(col.key, e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '0.3rem 1.4rem 0.3rem 0.5rem',
                                                                            borderRadius: '6px',
                                                                            border: '1.5px solid #7C3AED',
                                                                            outline: 'none',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: '600',
                                                                            color: '#1E293B',
                                                                            background: 'white',
                                                                            boxSizing: 'border-box',
                                                                            boxShadow: '0 0 0 3px rgba(124,58,237,0.08)',
                                                                        }}
                                                                    />
                                                                    {columnFilters[col.key] && (
                                                                        <button
                                                                            onClick={() => updateColumnFilter(col.key, '')}
                                                                            style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : null}
                                                        </th>
                                                    ))}
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </thead>
                            <tbody>
                                {filteredExpenses.map((ex) => (
                                    <tr key={ex.expense_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '800', color: '#7C3AED', fontSize: '0.85rem', margin: 0 }}>{ex.expense_number}</p>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>{ex.expense_date}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.85rem', margin: 0 }}>{ex.category_name}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{ex.subcategory}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{ex.payee_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{formatCurrency(ex.subtotal)}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#10B981', fontWeight: '700' }}>{formatCurrency(Math.round(ex.tax_amount))} ({ex.gst_percentage}%)</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(ex.expense_amount)}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>{ex.payment_mode}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Recurrings automatic entries */}
            {activeTab === 'recurring' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', marginTop: 0 }}>Active Recurring bills & Subscriptions</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Automation ID</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Category Name</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Frequency</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Next Due Date</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Auto-Post</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Recurring Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurrings.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', fontSize: '0.85rem' }}>{rec.id}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: '#1E293B' }}>{rec.category_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', textTransform: 'capitalize', fontSize: '0.8rem', color: '#475569' }}>{rec.recurring_type}</td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#BE185D', fontWeight: '700', fontSize: '0.8rem' }}>{rec.next_due_date}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>{rec.auto_create.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(rec.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Department Budgets */}
            {activeTab === 'budget' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Departmental Budgets & Spending Limits</h3>
                        <button onClick={() => setIsBudgetModalOpen(true)} className="crm-btn" style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#BE185D', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>+ Set Budget Limit</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Category Group</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Monthly Allocated Limit</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Actual Spent (MTD)</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Utilization Index</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Budget Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map((bg) => {
                                    const percent = Math.min(100, Math.round((bg.spent_amount / bg.budget_limit) * 100));
                                    const isOver = percent >= 80;
                                    return (
                                        <tr key={bg.category_name} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '800', fontSize: '0.85rem', color: '#1E293B' }}>{bg.category_name}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem' }}>{formatCurrency(bg.budget_limit)}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: isOver ? '#EF4444' : '#7C3AED', fontSize: '0.85rem' }}>{formatCurrency(bg.spent_amount)}</td>
                                            <td style={{ padding: '0.6rem 1rem', width: '200px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                        <div style={{ width: `${percent}%`, height: '100%', background: isOver ? 'linear-gradient(90deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderRadius: '3px' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>{percent}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <span style={{ 
                                                    padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                    background: isOver ? '#FCE8E6' : '#E6F4EA',
                                                    color: isOver ? '#C5221F' : '#137333',
                                                    fontWeight: '800', fontSize: '0.7rem'
                                                }}>{isOver ? 'WARNING OVER LIMIT' : 'OPTIMAL'}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Reimbursement claims */}
            {activeTab === 'claims' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', marginBottom: '1rem', marginTop: 0 }}>Employee Reimbursements & Travel claims</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim ID</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Employee Profile</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Purpose Description</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Lodge Date</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Claim Amount</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Verification Approval By</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Verify Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map((cl) => (
                                    <tr key={cl.claim_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', fontSize: '0.85rem' }}>{cl.claim_id}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: '#1E293B' }}>{cl.employee_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>{cl.travel_expense}</td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>{cl.date}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#7C3AED', fontSize: '0.88rem' }}>{formatCurrency(cl.claim_amount)}</td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#64748B', fontWeight: '700', fontSize: '0.8rem' }}>{cl.approval_by || 'N/A'}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                background: cl.reimbursement_status === 'Approved' ? '#E6F4EA' : '#FEF3C7',
                                                color: cl.reimbursement_status === 'Approved' ? '#137333' : '#B45309',
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>{cl.reimbursement_status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                            {cl.reimbursement_status !== 'Approved' && (
                                                <button 
                                                    onClick={() => handleApproveClaim(cl.claim_id)}
                                                    className="crm-btn"
                                                    style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', background: '#BE185D', color: 'white', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >Approve Claim</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
            {/* Record Business Expense Modal */}
            {isExpenseModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#7C3AED' }}>Record Business Expense</h3>
                            <button onClick={() => setIsExpenseModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expense Category</label>
                                <select value={newExpense.category_name} onChange={(e) => setNewExpense({ ...newExpense, category_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    {categoryOptions.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Subcategory / Spares description</label>
                                <input required type="text" value={newExpense.subcategory} onChange={(e) => setNewExpense({ ...newExpense, subcategory: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Office space rent" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payee / Merchant Merchant Profile</label>
                                <input required type="text" value={newExpense.payee_name} onChange={(e) => setNewExpense({ ...newExpense, payee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expense Amount ({currency.code})</label>
                                    <input required type="number" value={newExpense.expense_amount} onChange={(e) => setNewExpense({ ...newExpense, expense_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GST % Percentage</label>
                                    <select value={newExpense.gst_percentage} onChange={(e) => setNewExpense({ ...newExpense, gst_percentage: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="0">0% Excluded</option>
                                        <option value="5">5% GST</option>
                                        <option value="12">12% GST</option>
                                        <option value="18">18% GST</option>
                                        <option value="28">28% GST</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Payment Mode</label>
                                    <select value={newExpense.payment_mode} onChange={(e) => setNewExpense({ ...newExpense, payment_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Bank Transfer</option>
                                        <option>UPI</option>
                                        <option>Cash</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Ref / UPI reference</label>
                                    <input required type="text" value={newExpense.transaction_reference} onChange={(e) => setNewExpense({ ...newExpense, transaction_reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" disabled={createExpenseMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: createExpenseMutation.isPending ? 'not-allowed' : 'pointer', opacity: createExpenseMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)' }}>
                                {createExpenseMutation.isPending ? 'Posting...' : 'Settle & Post Expense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Budget Limit Modal */}
            {isBudgetModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Set Department Budget</h3>
                            <button onClick={() => setIsBudgetModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Category Group</label>
                                <input required type="text" value={newBudget.category_name} onChange={(e) => setNewBudget({ ...newBudget, category_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Fuel & Logistics" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Allocated Monthly Spending Limit ({currency.code})</label>
                                <input required type="number" value={newBudget.budget_limit} onChange={(e) => setNewBudget({ ...newBudget, budget_limit: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" disabled={createBudgetMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: createBudgetMutation.isPending ? 'not-allowed' : 'pointer', opacity: createBudgetMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)' }}>
                                {createBudgetMutation.isPending ? 'Setting...' : 'Settle Budget Target'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Lodge Staff Claim Modal */}
            {isClaimModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Lodge Staff Claim</h3>
                            <button onClick={() => setIsClaimModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateClaim} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Employee Profile Name</label>
                                <input required type="text" value={newClaim.employee_name} onChange={(e) => setNewClaim({ ...newClaim, employee_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Karan Mehra (Inventory)" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Travel / Out-of-pocket Description</label>
                                <input required type="text" value={newClaim.travel_expense} onChange={(e) => setNewClaim({ ...newClaim, travel_expense: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Client Sample Box Dispatches" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Claim Amount ({currency.code})</label>
                                <input required type="number" value={newClaim.claim_amount} onChange={(e) => setNewClaim({ ...newClaim, claim_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" disabled={lodgeClaimMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: lodgeClaimMutation.isPending ? 'not-allowed' : 'pointer', opacity: lodgeClaimMutation.isPending ? 0.7 : 1, boxShadow: '0 10px 20px rgba(124, 58, 237, 0.15)' }}>
                                {lodgeClaimMutation.isPending ? 'Lodging...' : 'Lodge Reimbursement Claim'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessExpenses;
