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
    Trash
} from 'lucide-react';
import '../App.css';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '../services';

const BusinessExpenses = () => {
    const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'recurring', 'budget', 'claims'
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

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
        payee_name: item.payee_name || 'Generic Merchant',
        payee_phone: item.payee_phone || '+91 xxxxx xxxxx',
        payee_gstin: item.payee_gstin || '27XXXXX0000X0Z0',
        expense_amount: parseFloat(item.expense_amount) || 0,
        gst_percentage: parseFloat(item.gst_percentage) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
        tax_amount: parseFloat(item.tax_amount) || 0,
        payment_mode: item.payment_mode || 'UPI',
        transaction_reference: item.transaction_reference || 'TXN-908122',
        input_tax_credit: item.input_tax_credit || 'Not Applicable'
    }));

    const budgets = dbBudgets.map(item => ({
        category_name: item.category_name || 'Fuel & Logistics',
        budget_limit: parseFloat(item.budget_limit) || 15000,
        spent_amount: parseFloat(item.spent_amount) || 0,
        alert_status: item.alert_status || 'Optimal'
    }));

    const claims = dbClaims.map(item => ({
        claim_id: item.id,
        employee_name: item.employee_name || 'Rajesh Mishra',
        travel_expense: item.travel_expense || 'Travel Meet',
        claim_amount: parseFloat(item.claim_amount) || 0,
        reimbursement_status: item.reimbursement_status || 'Pending',
        approval_by: item.approval_by || '',
        date: item.date || '2026-05-08'
    }));

    const { data: dbRecurrings = [] } = useQuery({
        queryKey: ['recurringsList'],
        queryFn: () => expensesService.getRecurrings()
    });

    const recurrings = dbRecurrings.map(item => ({
        id: item.id || `REC-${item.id}`,
        category_name: item.category_name || 'General',
        recurring_type: item.recurring_type || 'monthly',
        next_due_date: item.next_due_date || '2026-06-01',
        auto_create: item.auto_create || 'Active',
        recurring_status: item.recurring_status || 'active',
        amount: parseFloat(item.amount) || 0
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

    const filteredExpenses = expenses.filter(e => 
        e.payee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalExpenseSpent = expenses.reduce((sum, e) => sum + e.expense_amount, 0);
    const totalITCClaimsAccumulated = expenses.reduce((sum, e) => sum + (e.tax_amount || 0), 0);

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <TrendingUp size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Expenses & Operational Costs</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Add operational spendings, manage departmental budgets, track GST Input Tax Credit (ITC), automate recurring bills, and process staff reimbursement claims.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsClaimModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <User size={16} /> Lodge Staff Claim
                    </button>
                    <button 
                        onClick={() => setIsExpenseModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <Plus size={16} /> Record Expense
                    </button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Operational Costs (MTD)', value: `₹${totalExpenseSpent.toLocaleString()}`, icon: TrendingUp, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'GST Input Tax Credits (ITC)', value: `₹${Math.round(totalITCClaimsAccumulated).toLocaleString()}`, icon: Percent, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Active Monthly Recurrings', value: `${recurrings.length} Automation`, icon: Calendar, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Pending Staff Claims', value: `${claims.filter(c => c.reimbursement_status === 'Pending').length} Claims`, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'registry', label: 'Expenses Registry & ITC', icon: Tag },
                    { id: 'recurring', label: 'Recurring Subscriptions', icon: Calendar },
                    { id: 'budget', label: 'Department Budgets & Limits', icon: BarChart3 },
                    { id: 'claims', label: 'Staff Reimbursements', icon: User }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '12px', 
                            background: activeTab === tab.id ? '#064E3B' : 'white', 
                            color: activeTab === tab.id ? 'white' : '#475569',
                            border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === tab.id ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Expense Registry */}
            {activeTab === 'registry' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search category or payees..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Voucher No</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Category Description</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Payee / Merchant</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GST Subtotal</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>ITC Tax Claim</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Total Paid</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((ex) => (
                                    <tr key={ex.expense_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{ex.expense_number}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B' }}>{ex.expense_date}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#1E293B' }}>{ex.category_name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{ex.subcategory}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>{ex.payee_name}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>₹{ex.subtotal.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ color: '#10B981', fontWeight: '700' }}>₹{Math.round(ex.tax_amount).toLocaleString()} ({ex.gst_percentage}%)</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>₹{ex.expense_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#F0FDF4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>{ex.payment_mode}</span>
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
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Active Recurring bills & Subscriptions</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Automation ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Category Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Frequency</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Next Due Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Auto-Post</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Recurring Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recurrings.map((rec) => (
                                <tr key={rec.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{rec.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{rec.category_name}</td>
                                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{rec.recurring_type}</td>
                                    <td style={{ padding: '1rem', color: '#1B6B3A', fontWeight: '700' }}>{rec.next_due_date}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', fontWeight: '800', fontSize: '0.75rem' }}>{rec.auto_create.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>₹{rec.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Department Budgets */}
            {activeTab === 'budget' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Departmental Budgets & Spending Limits</h3>
                        <button onClick={() => setIsBudgetModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Set Budget Limit</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Category Group</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Monthly Allocated Limit</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Actual Spent (MTD)</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Utilization Index</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Budget Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((bg) => {
                                const percent = Math.min(100, Math.round((bg.spent_amount / bg.budget_limit) * 100));
                                const isOver = percent >= 80;
                                return (
                                    <tr key={bg.category_name} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{bg.category_name}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700' }}>₹{bg.budget_limit.toLocaleString()}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: isOver ? '#EF4444' : '#1B6B3A' }}>₹{bg.spent_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1rem', width: '240px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                                                    <div style={{ width: `${percent}%`, height: '100%', background: isOver ? 'linear-gradient(90deg, #EF4444 0%, #B91C1C 100%)' : 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderRadius: '4px' }}></div>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>{percent}%</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                background: isOver ? '#FEF2F2' : '#ECFDF5',
                                                color: isOver ? '#EF4444' : '#10B981',
                                                fontWeight: '800', fontSize: '0.75rem'
                                            }}>{isOver ? 'WARNING OVER LIMIT' : 'OPTIMAL'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 4: Reimbursement claims */}
            {activeTab === 'claims' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Employee Reimbursements & Travel claims</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Claim ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Employee Profile</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Claim Purpose Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Lodge Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Claim Amount</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Verification Approval By</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Verify Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map((cl) => (
                                <tr key={cl.claim_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{cl.claim_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{cl.employee_name}</td>
                                    <td style={{ padding: '1rem' }}>{cl.travel_expense}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{cl.date}</td>
                                    <td style={{ padding: '1rem', fontWeight: '850', color: '#064E3B' }}>₹{cl.claim_amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', color: '#64748B', fontWeight: '700' }}>{cl.approval_by || 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            display: 'inline-flex', padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            background: cl.reimbursement_status === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                                            color: cl.reimbursement_status === 'Approved' ? '#10B981' : '#B45309',
                                            fontSize: '0.75rem', fontWeight: '800'
                                        }}>{cl.reimbursement_status.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {cl.reimbursement_status !== 'Approved' && (
                                            <button 
                                                onClick={() => handleApproveClaim(cl.claim_id)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >Approve Claim</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Record Business Expense Modal */}
            {isExpenseModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Business Expense</h3>
                            <button onClick={() => setIsExpenseModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expense Category</label>
                                <select value={newExpense.category_name} onChange={(e) => setNewExpense({ ...newExpense, category_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    <option value="Rent">Rent (Operational)</option>
                                    <option value="Electricity">Electricity Utility</option>
                                    <option value="Internet">Internet Broadband</option>
                                    <option value="Salary">Salary Staff payouts</option>
                                    <option value="Fuel">Fuel & Logistics</option>
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Expense Amount (INR)</label>
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle & Post Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Budget Limit Modal */}
            {isBudgetModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Set Department Budget</h3>
                            <button onClick={() => setIsBudgetModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Category Group</label>
                                <input required type="text" value={newBudget.category_name} onChange={(e) => setNewBudget({ ...newBudget, category_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Fuel & Logistics" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Allocated Monthly Spending Limit (INR)</label>
                                <input required type="number" value={newBudget.budget_limit} onChange={(e) => setNewBudget({ ...newBudget, budget_limit: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Budget Target
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Lodge Staff Claim Modal */}
            {isClaimModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Lodge Staff Claim</h3>
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
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Claim Amount (INR)</label>
                                <input required type="number" value={newClaim.claim_amount} onChange={(e) => setNewClaim({ ...newClaim, claim_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Lodge Reimbursement Claim
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessExpenses;
