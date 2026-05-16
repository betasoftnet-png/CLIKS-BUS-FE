import React, { useState, useMemo, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { splitExpenseService } from '../services';
import { EmptyState, PageHeader } from '../components/common';
import {
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2,
    Users,
    Receipt,
    Calendar,
    ChevronRight,
    CheckCircle2,
    Percent,
    Hash,
    PieChart,
    ShoppingCart,
    Sparkles,
    CreditCard,
    Trash2,
    X
} from 'lucide-react';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';

const BusinessSplitCollect = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('ALL PARTNERS'); // ALL PARTNERS, HISTORY
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [splitType, setSplitType] = useState('equal');
    
    const [formData, setFormData] = useState({ 
        title: '', 
        amount: '', 
        paidBy: 'You', 
        date: new Date().toISOString().split('T')[0],
        participants: [] 
    });
    
    const [formError, setFormError] = useState('');

    // ── Queries ─────────────────────────────────────────────────────────────
    
    // Summary by Friend/Partner
    const { 
        data: summaryResponse = [], 
        isLoading: isSummaryLoading
    } = useQuery({
        queryKey: ['business-split-summary'],
        queryFn: async () => {
            const res = await splitExpenseService.getSummary();
            return Array.isArray(res) ? res : (res.data || []);
        },
    });

    // Expense List
    const {
        data: expensesResponse = [],
        isLoading: isExpensesLoading
    } = useQuery({
        queryKey: ['business-split-list'],
        queryFn: async () => {
            const res = await splitExpenseService.getSplits();
            return Array.isArray(res) ? res : (res.data || []);
        }
    });

    const partners = useMemo(() => Array.isArray(summaryResponse) ? summaryResponse : [], [summaryResponse]);
    const expenses = useMemo(() => Array.isArray(expensesResponse) ? expensesResponse : [], [expensesResponse]);

    // ── Mutations ───────────────────────────────────────────────────────────
    
    const createMutation = useMutation({
        mutationFn: splitExpenseService.createSplit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-split-summary'] });
            queryClient.invalidateQueries({ queryKey: ['business-split-list'] });
            setIsModalOpen(false);
            resetForm();
            alert("🎯 Revenue / Expense split recorded successfully!");
        },
        onError: (err) => {
            setFormError(err?.response?.data?.message || err.message || 'Failed to register split');
        }
    });

    const settleMutation = useMutation({
        mutationFn: splitExpenseService.settleFriend,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-split-summary'] });
            queryClient.invalidateQueries({ queryKey: ['business-split-list'] });
            alert("💼 Balance settled successfully!");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: splitExpenseService.deleteSplit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-split-summary'] });
            queryClient.invalidateQueries({ queryKey: ['business-split-list'] });
            setSelectedExpense(null);
        }
    });

    // ── Logic ──────────────────────────────────────────────────────────────

    const calculateSplits = useCallback(() => {
        const totalAmount = parseFloat(formData.amount) || 0;
        const participants = formData.participants;
        if (participants.length === 0) return [];

        let results = [];

        if (splitType === 'equal') {
            const count = participants.length + 1;
            const share = totalAmount / count;
            results = participants.map(p => ({ ...p, share_amount: share }));
            results.push({ name: 'You', share_amount: share, isSelf: true });
        } 
        else if (splitType === 'exact') {
            results = participants.map(p => ({ ...p, share_amount: parseFloat(p.value) || 0 }));
            const sumOthers = results.reduce((s, p) => s + p.share_amount, 0);
            results.push({ name: 'You', share_amount: Math.max(0, totalAmount - sumOthers), isSelf: true });
        } 
        else if (splitType === 'percentage') {
            results = participants.map(p => ({ ...p, share_amount: (parseFloat(p.value) / 100) * totalAmount }));
            const sumPctOthers = participants.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
            results.push({ name: 'You', share_amount: Math.max(0, ((100 - sumPctOthers) / 100) * totalAmount), isSelf: true });
        } 
        else if (splitType === 'shares') {
            const sumSharesOthers = participants.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
            const totalShares = sumSharesOthers + 1;
            results = participants.map(p => ({ ...p, share_amount: ((parseFloat(p.value) || 0) / totalShares) * totalAmount }));
            results.push({ name: 'You', share_amount: (1 / totalShares) * totalAmount, isSelf: true });
        }

        return results;
    }, [formData, splitType]);

    const handleAddSplit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.date) {
            setFormError('Basic information (Title, Amount, Date) is mandatory.');
            return;
        }

        const calculated = calculateSplits();
        const finalParticipants = calculated.filter(p => !p.isSelf);
        
        if (finalParticipants.length === 0) {
            setFormError('Please include at least one co-participant to allocate shares.');
            return;
        }

        const totalAmount = parseFloat(formData.amount);

        if (splitType === 'exact') {
            const sumOthers = finalParticipants.reduce((s, p) => s + p.share_amount, 0);
            if (sumOthers > totalAmount) {
                setFormError('Partner shares exceed total bill amount.');
                return;
            }
        }

        if (splitType === 'percentage') {
            const sumPct = finalParticipants.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
            if (sumPct > 100) {
                setFormError('Cumulative percentage allocation exceeds 100%.');
                return;
            }
        }

        const payload = {
            title: formData.title,
            total_amount: totalAmount,
            date: formData.date,
            split_type: splitType,
            paid_by: formData.paidBy,
            participants: finalParticipants.map(p => ({
                name: p.name,
                share_amount: p.share_amount
            }))
        };

        createMutation.mutate(payload);
    };

    const resetForm = () => {
        setFormData({ title: '', amount: '', paidBy: 'You', date: new Date().toISOString().split('T')[0], participants: [] });
        setSplitType('equal');
        setFormError('');
    };

    const addParticipantField = () => {
        setFormData({ ...formData, participants: [...formData.participants, { name: '', value: '' }] });
    };

    const updateParticipant = (index, field, value) => {
        const newParticipants = [...formData.participants];
        newParticipants[index][field] = value;
        setFormData({ ...formData, participants: newParticipants });
    };

    const removeParticipant = (index) => {
        setFormData({ ...formData, participants: formData.participants.filter((_, i) => i !== index) });
    };

    const openExpenseDetail = async (expense) => {
        try {
            const detail = await splitExpenseService.getSplitById(expense.id);
            setSelectedExpense(detail.data || detail);
        } catch (err) {
            console.error('Failed to load details.', err);
        }
    };

    // Aggregations
    const totalReceivable = partners.reduce((sum, p) => sum + parseFloat(p.total_owed || 0), 0);
    const activeSplitsCount = expenses.length;

    const filteredPartners = partners.filter(p => 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredExpenses = expenses.filter(e =>
        (e.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const calculatedPreview = useMemo(() => calculateSplits(), [calculateSplits]);

    return (
        <div style={{ padding: '1rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Banner Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            boxShadow: '0 4px 10px rgba(27, 107, 58, 0.15)' 
                        }}>
                            <CreditCard size={16} />
                        </div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em', margin: 0 }}>Split & Collect</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>Divide collaborative payments and collective billing with partners easily.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', 
                        padding: '0.6rem 1rem', borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(27, 107, 58, 0.15)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={16} strokeWidth={3} />
                    New Split Ticket
                </button>
            </div>

            {/* Metric Cards Panel */}
            <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem 0' }}>Cumulative Receivable</p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '950', color: '#0F172A', margin: 0 }}>₹{totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.68rem', fontWeight: '650', color: '#059669' }}>Across {partners.length} associates</p>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                        <ArrowDownLeft size={18} strokeWidth={2.5} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.15rem 0' }}>Outbound Liabilities</p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '950', color: '#0F172A', margin: 0 }}>₹0.00</h3>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.68rem', fontWeight: '650', color: '#EF4444' }}>Zero outstanding</p>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Ratio</span>
                            <span style={{ fontWeight: '900', color: '#1B6B3A', fontSize: '0.75rem' }}>{activeSplitsCount} Splits</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                            <div style={{ width: `${Math.min(activeSplitsCount * 10, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #1B6B3A 100%)', borderRadius: '4px' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: '650', color: '#64748B' }}>Sync status: Normal</p>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0, marginLeft: '0.75rem' }}>
                        <Sparkles size={16} />
                    </div>
                </div>
            </div>

            {/* Tab Bar and Subsearch Overlay */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.1px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {['ALL PARTNERS', 'HISTORY'].map(tab => (
                        <button
                            key={tab}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                padding: '0 0 0.5rem 0', 
                                cursor: 'pointer',
                                fontSize: '0.78rem', 
                                fontWeight: '900', 
                                color: activeTab === tab ? '#1B6B3A' : '#64748B',
                                borderBottom: activeTab === tab ? '2.5px solid #1B6B3A' : '2.5px solid transparent',
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                top: '1px'
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div style={{ background: 'white', borderRadius: '8px', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #E2E8F0', width: '240px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', marginBottom: '0.4rem' }}>
                    <Search size={14} color="#94A3B8" />
                    <input
                        style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontWeight: '600', fontSize: '0.8rem', color: '#1E293B' }}
                        type="text"
                        placeholder={`Lookup ${activeTab === 'ALL PARTNERS' ? 'partners' : 'invoices'}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Interactive Dynamic Render */}
            <div>
                {activeTab === 'ALL PARTNERS' ? (
                    isSummaryLoading ? (
                        <div style={{ padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#059669' }}>
                            <Loader2 className="animate-spin" size={48} strokeWidth={2.5} />
                            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Compiling ledgers...</p>
                        </div>
                    ) : filteredPartners.length === 0 ? (
                        <EmptyState title="No Active Partners Found" description="When splitting combined billing across external agencies or partners, their receivable analytics will populate dynamically." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {filteredPartners.map(partner => (
                                <div key={partner.name} style={{ 
                                    background: 'white', 
                                    borderRadius: '12px', 
                                    border: '1px solid #E2E8F0', 
                                    padding: '0.75rem 1rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
                                }}>
                                    <div style={{ 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '10px', 
                                        background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '1rem', 
                                        fontWeight: '850', 
                                        color: 'white',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 6px rgba(6, 78, 59, 0.1)'
                                    }}>
                                        {partner.name && partner.name.trim().length > 0 ? partner.name.trim().charAt(0).toUpperCase() : 'P'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.9rem', fontWeight: '850', color: '#1F2937' }}>{partner.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#1B6B3A', background: '#F0FDF4', padding: '0.15rem 0.4rem', borderRadius: '5px', border: '1px solid #DCF2E4', display: 'inline-block', textTransform: 'uppercase' }}>
                                                {partner.split_count} Accounts
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '110px' }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: '950', color: '#059669' }}>
                                            ₹{(partner.total_owed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.6rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Balance</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', marginLeft: '0.4rem' }}>
                                        <button 
                                            onClick={() => alert(`Notification dispatch request queued for partner ${partner.name}`)}
                                            style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Remind
                                        </button>
                                        <button 
                                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '900', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(27,107,58,0.1)' }} 
                                            onClick={() => settleMutation.mutate(partner.name)}
                                        >
                                            Settle
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    isExpensesLoading ? (
                        <div style={{ padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#059669' }}>
                            <Loader2 className="animate-spin" size={48} strokeWidth={2.5} />
                            <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Polling database history...</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <EmptyState title="No Active Split History" description="Past split allocations and completed payment files will register automatically." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {filteredExpenses.map(expense => (
                                <div 
                                    key={expense.id} 
                                    style={{ 
                                        background: 'white', 
                                        borderRadius: '12px', 
                                        border: '1px solid #E2E8F0', 
                                        padding: '0.75rem 1.25rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1.25rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                                        transition: 'transform 0.2s ease'
                                    }} 
                                    onClick={() => openExpenseDetail(expense)}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A', flexShrink: 0 }}>
                                        <Receipt size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.1rem 0', fontSize: '0.88rem', fontWeight: '850', color: '#1F2937' }}>{expense.title}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '750', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Users size={10} /> {expense.participant_count} Partners
                                            </span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '750', color: '#64748B' }}>
                                                Funder: {expense.paid_by}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: '110px' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: '950', color: '#1E293B' }}>₹{expense.total_amount.toLocaleString('en-IN')}</div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '750', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '0.1rem' }}>
                                            <Calendar size={10} /> {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div style={{ color: '#CBD5E1' }}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
            </div>

            {/* ──────── VIEW RECORD MODAL ──────── */}
            <AnimatePresence>
                {selectedExpense && (
                    <div 
                        style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                        onClick={() => setSelectedExpense(null)}
                    >
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ width: '100%', maxWidth: '460px', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Allocation Receipt</h3>
                                <button style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }} onClick={() => setSelectedExpense(null)}><X size={18} /></button>
                            </div>
                            
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: '#0F172A', margin: '0 0 0.4rem 0' }}>{selectedExpense.title}</h3>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{new Date(selectedExpense.date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #F1F5F9' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>Total Bill</span>
                                        <div style={{ fontWeight: '950', color: '#1B6B3A', fontSize: '0.95rem' }}>₹{selectedExpense.total_amount.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>Funder</span>
                                        <div style={{ fontWeight: '950', fontSize: '0.95rem', color: '#1F2937' }}>{selectedExpense.paid_by}</div>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>Protocol</span>
                                        <div style={{ fontWeight: '950', fontSize: '0.95rem', color: '#1F2937', textTransform: 'capitalize' }}>{selectedExpense.split_type}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Breakdown</h4>
                                    {selectedExpense.participants?.map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '10px 12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                borderRadius: '8px', 
                                                background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                fontSize: '1rem', 
                                                fontWeight: '850', 
                                                color: 'white',
                                                flexShrink: 0
                                            }}>
                                                {p.name && p.name.trim().length > 0 ? p.name.trim().charAt(0).toUpperCase() : 'P'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '850', fontSize: '0.88rem', color: '#1E293B' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: p.is_settled ? '#059669' : '#F59E0B', textTransform: 'uppercase', marginTop: '1px' }}>
                                                    {p.is_settled ? 'Reconciled' : 'Pending'}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '950', fontSize: '0.92rem', color: '#1E293B' }}>₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                            {p.is_settled ? <CheckCircle2 size={16} color="#10B981" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', background: '#FAFAFA' }}>
                                <button 
                                    onClick={async () => { if(await customConfirm("Discard this whole split record?")) deleteMutation.mutate(selectedExpense.id); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: '800', fontSize: '0.8rem' }}
                                >
                                    <Trash2 size={14} /> Discard Entry
                                </button>
                                <button onClick={() => setSelectedExpense(null)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', fontWeight: '850', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    Close Info
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ──────── CREATE NEW RECORD MODAL ──────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ width: '100%', maxWidth: '600px', background: 'white', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064E3B', margin: 0, letterSpacing: '-0.3px' }}>Initiate Collective Split</h2>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            
                            <form onSubmit={handleAddSplit} style={{ overflowY: 'auto', flex: 1, background: '#FAFAFA' }}>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    
                                    {/* Basic metadata */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Payment Narrative</label>
                                            <input 
                                                required
                                                style={{ padding: '0.75rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}
                                                type="text" value={formData.title} 
                                                onChange={e => setFormData({...formData, title: e.target.value})}
                                                placeholder="e.g. Agency Costs, Dinner"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Amount (₹)</label>
                                            <input 
                                                required
                                                style={{ padding: '0.75rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '900', color: '#1B6B3A', fontSize: '1rem' }}
                                                type="number" value={formData.amount} 
                                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Funder and date */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Primary Payer</label>
                                            <select 
                                                style={{ padding: '0.75rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}
                                                value={formData.paidBy} 
                                                onChange={e => setFormData({...formData, paidBy: e.target.value})}
                                            >
                                                <option value="You">You (Main Account)</option>
                                                {formData.participants.map(p => p.name && (
                                                    <option key={p.name} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Date</label>
                                            <input 
                                                style={{ padding: '0.75rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: '600', color: '#1F2937' }}
                                                type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} 
                                            />
                                        </div>
                                    </div>

                                    {/* Split Methods */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Protocol</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                            {[
                                                { id: 'equal', label: 'Equally', icon: Users },
                                                { id: 'exact', label: 'Exact', icon: Hash },
                                                { id: 'percentage', label: 'Percent', icon: Percent },
                                                { id: 'shares', label: 'Shares', icon: PieChart },
                                            ].map(type => (
                                                <button 
                                                    key={type.id} type="button" 
                                                    style={{ 
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px 4px',
                                                        borderRadius: '14px', border: splitType === type.id ? '2px solid #1B6B3A' : '1.5px solid #E2E8F0',
                                                        background: splitType === type.id ? '#FFFFFF' : '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s ease'
                                                    }}
                                                    onClick={() => setSplitType(type.id)}
                                                >
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: splitType === type.id ? '#1B6B3A' : '#E2E8F0', color: splitType === type.id ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <type.icon size={16} />
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '850', color: splitType === type.id ? '#1B6B3A' : '#1F2937' }}>{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Allocation structure */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>Partners</label>
                                            <button 
                                                type="button" onClick={addParticipantField} 
                                                style={{ 
                                                    padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #D1FAE5', 
                                                    color: '#065F46', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' 
                                                }}
                                            >
                                                <Plus size={14} strokeWidth={2.5} /> Add Partner
                                            </button>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {formData.participants.map((p, index) => (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                                    <div style={{ 
                                                        width: '32px', 
                                                        height: '32px', 
                                                        borderRadius: '8px', 
                                                        background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        fontSize: '1rem', 
                                                        fontWeight: '850', 
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}>
                                                        {p.name && p.name.trim().length > 0 ? p.name.trim().charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <input 
                                                        required
                                                        style={{ margin: 0, padding: '0.4rem', flex: 2, background: 'transparent', border: 'none', borderBottom: '1.5px solid #E2E8F0', outline: 'none', fontSize: '0.88rem', fontWeight: '700', color: '#1E293B' }}
                                                        type="text" placeholder="Associate Name" 
                                                        value={p.name} 
                                                        onChange={e => updateParticipant(index, 'name', e.target.value)} 
                                                    />
                                                    {splitType !== 'equal' && (
                                                        <input 
                                                            required
                                                            style={{ margin: 0, padding: '0.5rem 0.75rem', flex: 0.8, border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC', outline: 'none', fontWeight: '900', textAlign: 'right', fontSize: '0.9rem', color: '#1B6B3A' }}
                                                            type="number" value={p.value} 
                                                            onChange={e => updateParticipant(index, 'value', e.target.value)} 
                                                            placeholder={splitType === 'percentage' ? '%' : 'Val'}
                                                        />
                                                    )}
                                                    <button type="button" onClick={() => removeParticipant(index)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', opacity: 0.6, display: 'flex' }}><X size={18} /></button>
                                                </div>
                                            ))}
                                            {formData.participants.length === 0 && (
                                                <div style={{ border: '2.5px dashed #CBD5E1', borderRadius: '20px', padding: '32px 24px', background: '#FFFFFF', textAlign: 'center', cursor: 'pointer', color: '#64748B' }} onClick={addParticipantField}>
                                                    <Users size={36} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
                                                    <div style={{ fontWeight: '850', fontSize: '1rem', color: '#334155', marginBottom: '4px' }}>Zero co-owners added</div>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: '500', color: '#64748B' }}>Click above or here to start allocating portions.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Live breakdown layout */}
                                    {calculatedPreview.length > 0 && parseFloat(formData.amount) > 0 && (
                                        <div style={{ background: '#0F172A', borderRadius: '20px', padding: '1.25rem', color: 'white', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.15)' }}>
                                            <div style={{ color: '#94A3B8', fontSize: '0.68rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Calculations Breakdown</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {calculatedPreview.map((p, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: '800', color: p.isSelf ? '#34D399' : '#F8FAFC', fontSize: '0.85rem' }}>{p.name} {p.isSelf && '(You)'}</span>
                                                        <div style={{ flex: 1, borderBottom: '1.5px dashed rgba(255,255,255,0.1)', margin: '0 0.75rem' }} />
                                                        <span style={{ fontWeight: '950', color: p.isSelf ? '#34D399' : '#38BDF8', fontSize: '0.9rem' }}>₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                ))}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', marginTop: '0.15rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                                    <span style={{ fontWeight: '900', color: 'white', fontSize: '0.9rem' }}>Total Manifest</span>
                                                    <div style={{ flex: 1, borderBottom: '1.5px dashed rgba(255,255,255,0.2)', margin: '0 0.75rem' }} />
                                                    <span style={{ fontWeight: '950', color: 'white', fontSize: '1rem' }}>₹{calculatedPreview.reduce((sum, p) => sum + p.share_amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {formError && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '10px', margin: '0 1.5rem', fontWeight: '800', textAlign: 'center', border: '1px solid #FCA5A5', fontSize: '0.8rem' }}>{formError}</div>}
                                
                                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'white' }}>
                                    <button type="button" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'transparent', color: '#475569', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" disabled={createMutation.isPending} style={{ padding: '0.75rem 1.75rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(27,107,58,0.2)' }}>
                                        {createMutation.isPending ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Commit Split'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessSplitCollect;
