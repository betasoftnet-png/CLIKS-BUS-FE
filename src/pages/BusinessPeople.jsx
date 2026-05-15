import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Plus, 
    Search, 
    TrendingUp, 
    TrendingDown, 
    Building2, 
    Phone, 
    Mail, 
    X, 
    Trash2, 
    ChevronRight, 
    ArrowLeftRight, 
    Coins, 
    Calendar, 
    Bell, 
    MessageSquare, 
    CheckCircle2
} from 'lucide-react';
import { peopleService } from '../services/peopleService';
import '../App.css';

const BusinessPeople = () => {
    const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'transactions', 'reminders'
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const queryClient = useQueryClient();

    // Modals states
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState(null);

    // Forms input states
    const [contactForm, setContactForm] = useState({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '' });
    const [txForm, setTxForm] = useState({ person_id: '', type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const [reminderForm, setReminderForm] = useState({ person_id: '', title: '', amount: '', due_date: new Date().toISOString().split('T')[0], notes: '' });

    // Inline Transaction state inside popup
    const [isInlineTxOpen, setIsInlineTxOpen] = useState(false);
    const [inlineTxForm, setInlineTxForm] = useState({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });

    // Inline Reminder/Maturity state inside popup
    const [isInlineRemOpen, setIsInlineRemOpen] = useState(false);
    const [inlineRemForm, setInlineRemForm] = useState({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });

    React.useEffect(() => {
        setIsInlineTxOpen(false);
        setIsInlineRemOpen(false);
        setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        setInlineRemForm({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });
    }, [selectedPersonId]);

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: peopleRes = [], isLoading: isPeopleLoading } = useQuery({
        queryKey: ['people-list', searchTerm],
        queryFn: () => peopleService.getPeople({ search: searchTerm }),
    });

    const { data: transactionsRes = [], isLoading: isTxLoading } = useQuery({
        queryKey: ['people-transactions-all'],
        queryFn: () => peopleService.getAllTransactions(),
    });

    const { data: remindersRes = [], isLoading: isRemindersLoading } = useQuery({
        queryKey: ['people-reminders-all'],
        queryFn: () => peopleService.getAllReminders(),
    });

    // ── Top-level person query detail hooks ─────────────────────────────────
    const { data: personDetails, isLoading: isPersonDetailLoading } = useQuery({
        queryKey: ['person-detail', selectedPersonId],
        queryFn: () => peopleService.getPersonById(selectedPersonId),
        enabled: !!selectedPersonId
    });

    const { data: personTx, isLoading: isPersonTxLoading } = useQuery({
        queryKey: ['person-transactions', selectedPersonId],
        queryFn: () => peopleService.getTransactions(selectedPersonId),
        enabled: !!selectedPersonId
    });

    const { data: personReminders, isLoading: isPersonRemLoading } = useQuery({
        queryKey: ['person-reminders', selectedPersonId],
        queryFn: () => peopleService.getReminders(selectedPersonId),
        enabled: !!selectedPersonId
    });

    const computedNetBalance = React.useMemo(() => {
        const txList = personTx?.data || personTx || [];
        if (!Array.isArray(txList) || txList.length === 0) {
            return parseFloat(personDetails?.net_balance || 0);
        }
        return txList.reduce((acc, curr) => {
            const amt = parseFloat(curr.amount || 0);
            return curr.type === 'lent' ? acc + amt : acc - amt;
        }, 0);
    }, [personTx, personDetails]);

    const people = useMemo(() => peopleRes.data || peopleRes || [], [peopleRes]);
    const transactions = transactionsRes.data || transactionsRes || [];
    const reminders = remindersRes.data || remindersRes || [];

    const summary = useMemo(() => {
        const totalContacts = people.length;
        const totalReceivables = people.reduce((sum, p) => sum + Math.max(0, parseFloat(p.net_balance || 0)), 0);
        const totalPayables = people.reduce((sum, p) => sum + Math.abs(Math.min(0, parseFloat(p.net_balance || 0))), 0);
        return { totalContacts, totalReceivables, totalPayables };
    }, [people]);

    // ── Mutations ───────────────────────────────────────────────────────────
    const createContactMutation = useMutation({
        mutationFn: (data) => peopleService.createPerson(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['people-list']);
            setIsContactModalOpen(false);
            setContactForm({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '' });
            alert('Contact added to your network.');
        }
    });

    const deleteContactMutation = useMutation({
        mutationFn: (id) => peopleService.deletePerson(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['people-list']);
            alert('Contact deleted successfully.');
        }
    });

    const createTxMutation = useMutation({
        mutationFn: (data) => peopleService.createTransaction(data.person_id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['people-transactions-all']);
            queryClient.invalidateQueries(['people-list']);
            if (variables.person_id) {
                queryClient.invalidateQueries(['person-transactions', variables.person_id]);
                queryClient.invalidateQueries(['person-detail', variables.person_id]);
            }
            setIsTxModalOpen(false);
            setIsInlineTxOpen(false);
            setTxForm({ person_id: '', type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
            setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
            alert('Transaction logged successfully.');
        }
    });

    const deleteTxMutation = useMutation({
        mutationFn: (txn) => peopleService.deleteTransaction(txn.person_id, txn.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['people-transactions-all']);
            queryClient.invalidateQueries(['people-list']);
            alert('Transaction removed.');
        }
    });

    const createReminderMutation = useMutation({
        mutationFn: (data) => peopleService.createReminder(data.person_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['people-reminders-all']);
            setIsReminderModalOpen(false);
            setReminderForm({ person_id: '', title: '', amount: '', due_date: new Date().toISOString().split('T')[0], notes: '' });
            alert('Reminder dispatched successfully.');
        }
    });

    const deleteReminderMutation = useMutation({
        mutationFn: (rem) => peopleService.deleteReminder(rem.person_id, rem.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['people-reminders-all']);
            alert('Reminder dismissed.');
        }
    });

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSaveContact = (e) => {
        e.preventDefault();
        createContactMutation.mutate(contactForm);
    };

    const handleDeleteContact = (id) => {
        if (window.confirm('Are you sure you want to delete this contact and all associated transactions?')) {
            deleteContactMutation.mutate(id);
        }
    };

    const handleSaveTx = (e) => {
        e.preventDefault();
        if (!txForm.person_id) return alert('Please select a contact.');
        createTxMutation.mutate(txForm);
    };

    const handleSaveInlineTx = (e) => {
        e.preventDefault();
        if (!selectedPersonId) return alert('Target registry contact missing.');
        createTxMutation.mutate({ ...inlineTxForm, person_id: selectedPersonId });
    };

    const handleSaveInlineRem = (e) => {
        e.preventDefault();
        if (!selectedPersonId) return alert('Target registry contact missing.');
        createReminderMutation.mutate(
            { ...inlineRemForm, person_id: selectedPersonId },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['person-reminders', selectedPersonId] });
                    setIsInlineRemOpen(false);
                    setInlineRemForm({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });
                }
            }
        );
    };

    const handleSaveReminder = (e) => {
        e.preventDefault();
        if (!reminderForm.person_id) return alert('Please select a contact.');
        createReminderMutation.mutate(reminderForm);
    };

    const renderAvatar = (name, size = 42) => {
        const firstLetter = (name || '?').trim().charAt(0).toUpperCase();
        let hash = 0;
        const str = name || '';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hues = [145, 195, 220, 260, 310, 340, 25, 55];
        const hue = hues[Math.abs(hash) % hues.length];
        return (
            <div style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                borderRadius: size > 50 ? '24px' : '12px', 
                background: `hsl(${hue}, 75%, 93%)`, 
                color: `hsl(${hue}, 75%, 32%)`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '900', 
                fontSize: `${size * 0.45}px`,
                fontFamily: "'Outfit', 'Inter', sans-serif",
                flexShrink: 0
            }}>
                {firstLetter}
            </div>
        );
    };

    const formatCurr = (val) => {
        const num = parseFloat(val || 0);
        return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const filteredPeople = people.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.company || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTx = transactions.filter(t =>
        (t.person_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Users size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>People Network & Escrow</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Track peer-to-peer relationships, log personal advances, track friendly loans, and set ledger alerts.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsTxModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <ArrowLeftRight size={16} /> Log Transaction
                    </button>
                    <button 
                        onClick={() => setIsContactModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <Plus size={16} /> Add People Contact
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Contacts', value: summary.totalContacts, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Net Receivables', value: formatCurr(summary.totalReceivables), icon: TrendingUp, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Net Payables', value: formatCurr(summary.totalPayables), icon: TrendingDown, color: '#EF4444', bg: '#FEE2E2' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Row & Global Tools */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                        { id: 'contacts', label: 'Active Directory', icon: Users },
                        { id: 'transactions', label: 'Global Ledger Ledger', icon: ArrowLeftRight },
                        { id: 'reminders', label: 'Repayment Alerts', icon: Bell }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                padding: '0.85rem 1.75rem', borderRadius: '14px', 
                                background: activeTab === tab.id ? '#064E3B' : 'white', 
                                color: activeTab === tab.id ? 'white' : '#475569',
                                border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                boxShadow: activeTab === tab.id ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: '#FFF', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '12px', 
                        padding: showSearch ? '0.5rem 1rem' : '0.5rem', 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                        width: showSearch ? '280px' : '40px', 
                        height: '40px',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}>
                        <Search 
                            size={18} 
                            style={{ color: '#64748B', cursor: 'pointer', flexShrink: 0 }} 
                            onClick={() => setShowSearch(!showSearch)} 
                        />
                        <input 
                            type="text" 
                            placeholder={`Lookup ${activeTab === 'contacts' ? 'contacts...' : activeTab === 'transactions' ? 'transactions...' : 'reminders...'}`} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                border: 'none', 
                                outline: 'none', 
                                background: 'transparent', 
                                marginLeft: '0.75rem', 
                                width: '100%', 
                                fontSize: '0.9rem', 
                                color: '#1E293B',
                                display: showSearch ? 'block' : 'none'
                            }}
                            autoFocus={showSearch}
                        />
                    </div>
                    {activeTab === 'reminders' && (
                        <button 
                            onClick={() => setIsReminderModalOpen(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.15rem', borderRadius: '12px', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: '750', cursor: 'pointer', flexShrink: 0 }}
                        >
                            <Bell size={16} /> Dispatch Alert
                        </button>
                    )}
                </div>
            </div>

            {/* Main Dynamic Content */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                    {/* TAB 1: Contacts List */}
                    {activeTab === 'contacts' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Profile Contact</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Classification</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Company / Link</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Phone / Email</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Net Exposure</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPeopleLoading ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Streaming network directory...</td></tr>
                                ) : filteredPeople.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Zero network contacts found. Start adding!</td></tr>
                                ) : filteredPeople.map((p) => (
                                    <tr key={p.id} 
                                        style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s', background: 'white' }} 
                                        onClick={() => setSelectedPersonId(p.id)}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                                    >
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {renderAvatar(p.name, 42)}
                                                <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '1rem', margin: 0 }}>{p.name}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#EFF6FF', color: '#1E40AF', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>{p.role_type}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B', fontWeight: '600' }}>{p.company || 'Individual'}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '650' }}>{p.phone || 'N/A'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{p.email || ''}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <span style={{ fontWeight: '900', fontSize: '1.1rem', color: parseFloat(p.net_balance || 0) >= 0 ? '#16A34A' : '#EF4444' }}>
                                                {formatCurr(p.net_balance)}
                                            </span>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>{parseFloat(p.net_balance || 0) >= 0 ? 'RECEIVABLE' : 'PAYABLE'}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteContact(p.id); }}
                                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* TAB 2: Transactions Ledger */}
                    {activeTab === 'transactions' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Execution Date</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Network Contact</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Activity Description</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Classification</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Ledger Flow</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isTxLoading ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Accessing Ledger Database...</td></tr>
                                ) : filteredTx.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>No logged P2P activities found.</td></tr>
                                ) : filteredTx.map((t) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem', color: '#64748B', fontWeight: '600' }}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: '#1E293B' }}>{t.person_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '600' }}>{t.description}</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: t.type === 'lent' ? '#ECFDF5' : '#FEF2F2', color: t.type === 'lent' ? '#059669' : '#DC2626', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem', color: t.type === 'lent' ? '#059669' : '#DC2626' }}>
                                            {t.type === 'lent' ? '+' : '-'}{formatCurr(t.amount)}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => deleteTxMutation.mutate(t)}
                                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* TAB 3: Reminders & Tasks */}
                    {activeTab === 'reminders' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Maturity / Due Date</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Target Contact</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Memo Label</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Claim Cap</th>
                                    <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isRemindersLoading ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Resolving dispatch statuses...</td></tr>
                                ) : reminders.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Zero pending alerts scheduled.</td></tr>
                                ) : reminders.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem', color: '#E11D48', fontWeight: '800' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} />
                                                {new Date(r.due_date).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: '#1E293B' }}>{r.person_name}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569', fontWeight: '650' }}>{r.title}</td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right', fontWeight: '900', color: '#0F172A' }}>{formatCurr(r.amount)}</td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                <button 
                                                    onClick={() => alert(`Dispatched WhatsApp alert reminder to client.`)}
                                                    style={{ border: 'none', background: '#F0FDF4', padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#1B6B3A', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Alert
                                                </button>
                                                <button 
                                                    onClick={() => deleteReminderMutation.mutate(r)}
                                                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal 1: Add People Contact */}
            <AnimatePresence>
                {isContactModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Enroll New Contact</h3>
                                <button onClick={() => setIsContactModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Full Identity Name</label>
                                    <input required placeholder="e.g., Rahul Dev" type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Network Role</label>
                                        <select 
                                            value={['friend', 'family', 'colleague', 'business'].includes(contactForm.role_type) ? contactForm.role_type : 'others'} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setContactForm({ ...contactForm, role_type: val === 'others' ? '' : val });
                                            }} 
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
                                        >
                                            <option value="friend">Friend</option>
                                            <option value="family">Family</option>
                                            <option value="colleague">Colleague</option>
                                            <option value="business">Business Partner</option>
                                            <option value="others">Others (Custom)</option>
                                        </select>
                                        {!['friend', 'family', 'colleague', 'business'].includes(contactForm.role_type) && (
                                            <input 
                                                placeholder="Specify custom role..." 
                                                type="text" 
                                                value={contactForm.role_type} 
                                                onChange={(e) => setContactForm({ ...contactForm, role_type: e.target.value })} 
                                                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', marginTop: '0.5rem' }} 
                                                required
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Company Label</label>
                                        <input placeholder="Dunder Mifflin" type="text" value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Phone Contact</label>
                                        <input placeholder="+91 ..." type="text" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>E-Mail Address</label>
                                        <input placeholder="name@example.com" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                </div>
                                <button type="submit" disabled={createContactMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                    {createContactMutation.isPending ? 'Saving Contact...' : 'Create Contact Node'}
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 2: Log Escrow Transaction */}
            <AnimatePresence>
                {isTxModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Peer Transaction</h3>
                                <button onClick={() => setIsTxModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveTx} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Target Network User</label>
                                    <select required value={txForm.person_id} onChange={(e) => setTxForm({ ...txForm, person_id: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option value="">Select contact from registry...</option>
                                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Entry Direction</label>
                                        <select value={txForm.type} onChange={(e) => setTxForm({ ...txForm, type: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                                            <option value="lent">I Lent Assets / Money</option>
                                            <option value="borrowed">I Borrowed Assets / Money</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Ledger Date</label>
                                        <input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Value Cap Amount (₹)</label>
                                    <input required type="number" placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.1rem', fontWeight: '900' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Asset narrative / Memo</label>
                                    <input placeholder="e.g., Advance for marketing services" type="text" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}>
                                    Authorize Entry Log
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 3: Setup Alert / Reminder */}
            <AnimatePresence>
                {isReminderModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Schedule Return Reminder</h3>
                                <button onClick={() => setIsReminderModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Dispatch to Contact</label>
                                    <select required value={reminderForm.person_id} onChange={(e) => setReminderForm({ ...reminderForm, person_id: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}>
                                        <option value="">Select contact...</option>
                                        {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reminder Title</label>
                                        <input required placeholder="Repayment of Friendly Loan" type="text" value={reminderForm.title} onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Cap Value</label>
                                        <input type="number" placeholder="0.00" value={reminderForm.amount} onChange={(e) => setReminderForm({ ...reminderForm, amount: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '900' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Execution Maturity Date</label>
                                    <input required type="date" value={reminderForm.due_date} onChange={(e) => setReminderForm({ ...reminderForm, due_date: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer' }}>
                                    Commit Reminder Flow
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Modal 4: Person Detail Profile Modal */}
            <AnimatePresence>
                {selectedPersonId && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', width: '100%', maxWidth: '750px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '2rem', background: '#F0F9F4', borderBottom: '1px solid #DCF2E4' }}>
                                {isPersonDetailLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '80px' }}>
                                        <div className="premium-loader" style={{ width: '24px', height: '24px', border: '3px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#064E3B' }}>Accessing network dossier...</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        {renderAvatar(personDetails?.name, 80)}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: '#064E3B', textTransform: 'uppercase' }}>{personDetails?.name}</h2>
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', background: '#EFF6FF', color: '#1E40AF', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{personDetails?.role_type}</span>
                                            </div>
                                            <div style={{ margin: 0, color: '#64748B', fontWeight: '600', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                {personDetails?.company && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {personDetails.company}</span>}
                                                {personDetails?.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {personDetails.phone}</span>}
                                                {personDetails?.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {personDetails.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button onClick={() => setSelectedPersonId(null)} style={{ border: 'none', background: 'white', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', color: '#475569' }}><X size={20} /></button>
                            </div>

                            {/* Content Body */}
                            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#FAFAF9' }}>
                                {!isPersonDetailLoading && personDetails && (
                                    <>
                                        {/* Exposure Card */}
                                        {/* Exposure Card */}
                                        <div style={{ background: computedNetBalance >= 0 ? '#ECFDF5' : '#FEF2F2', padding: '1.75rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: '1.5px solid', borderColor: computedNetBalance >= 0 ? '#A7F3D0' : '#FCA5A5', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.02)' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '850', textTransform: 'uppercase', color: computedNetBalance >= 0 ? '#047857' : '#B91C1C', letterSpacing: '0.05em' }}>Consolidated Ledger Stand</p>
                                                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '2.25rem', fontWeight: '950', color: computedNetBalance >= 0 ? '#065F46' : '#991B1B', letterSpacing: '-0.03em' }}>
                                                    {formatCurr(computedNetBalance)}
                                                </h3>
                                            </div>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: computedNetBalance >= 0 ? '#059669' : '#DC2626', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
                                                {computedNetBalance >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                                            {/* Recent Ledger List */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#1E293B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Direct Ledger Activity</h4>
                                                    <ArrowLeftRight size={16} style={{ color: '#94A3B8' }} />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {isPersonTxLoading ? (
                                                        <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Loading transactions...</p>
                                                    ) : (!personTx || (personTx.data ? personTx.data.length === 0 : personTx.length === 0)) ? (
                                                        <div style={{ padding: '2rem', border: '2px dashed #E2E8F0', borderRadius: '16px', textAlign: 'center', background: 'white' }}>
                                                            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: '600' }}>Zero financial assets logged.</p>
                                                        </div>
                                                    ) : (
                                                        (personTx.data || personTx || []).slice(0, 6).map((t, i) => (
                                                            <div key={i} style={{ padding: '1.1rem 1.25rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#334155' }}>{t.description || 'Registry entry'}</p>
                                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: '600' }}>{new Date(t.date).toLocaleDateString('en-IN')}</p>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <span style={{ fontSize: '1.05rem', fontWeight: '900', color: t.type === 'lent' ? '#059669' : '#DC2626' }}>
                                                                        {t.type === 'lent' ? '+' : '-'}{formatCurr(t.amount)}
                                                                    </span>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: '850', textTransform: 'uppercase', color: t.type === 'lent' ? '#10B981' : '#EF4444', marginTop: '2px' }}>{t.type}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Specific Reminder Flows */}
                                            {/* Right Column: Reminders OR Inline Transaction Form OR Inline Reminder Form */}
                                            <AnimatePresence mode="wait">
                                                {isInlineTxOpen ? (
                                                    <Motion.div key="tx-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#064E3B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Log New Entry</h4>
                                                            <button type="button" onClick={() => setIsInlineTxOpen(false)} style={{ border: 'none', background: 'white', padding: '4px', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#64748B' }}><X size={16} /></button>
                                                        </div>
                                                        <form onSubmit={handleSaveInlineTx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>DIRECTION</label>
                                                                <select value={inlineTxForm.type} onChange={(e) => setInlineTxForm({ ...inlineTxForm, type: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem' }}>
                                                                    <option value="lent">I Lent Money (+)</option>
                                                                    <option value="borrowed">I Borrowed Money (-)</option>
                                                                </select>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>AMOUNT (₹)</label>
                                                                    <input required type="number" placeholder="0.00" value={inlineTxForm.amount} onChange={(e) => setInlineTxForm({ ...inlineTxForm, amount: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '800', fontSize: '0.9rem' }} />
                                                                </div>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>DATE</label>
                                                                    <input type="date" value={inlineTxForm.date} onChange={(e) => setInlineTxForm({ ...inlineTxForm, date: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>MEMO / NARRATIVE</label>
                                                                <input placeholder="Registry note..." type="text" value={inlineTxForm.description} onChange={(e) => setInlineTxForm({ ...inlineTxForm, description: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }} />
                                                            </div>
                                                            <button type="submit" disabled={createTxMutation.isPending} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                                                {createTxMutation.isPending ? 'Saving...' : 'Submit Entry'}
                                                            </button>
                                                        </form>
                                                    </Motion.div>
                                                ) : isInlineRemOpen ? (
                                                    <Motion.div key="rem-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ background: '#FFFBEB', padding: '1.5rem', borderRadius: '24px', border: '1px solid #FEF3C7' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#B45309', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Set Maturity Alarm</h4>
                                                            <button type="button" onClick={() => setIsInlineRemOpen(false)} style={{ border: 'none', background: 'white', padding: '4px', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#D97706' }}><X size={16} /></button>
                                                        </div>
                                                        <form onSubmit={handleSaveInlineRem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                            <div>
                                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#B45309', marginBottom: '0.25rem' }}>PURPOSE / DETAILS</label>
                                                                <input required placeholder="e.g. Handloan Repayment Date" type="text" value={inlineRemForm.title} onChange={(e) => setInlineRemForm({ ...inlineRemForm, title: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FCD34D', outline: 'none', fontSize: '0.85rem' }} />
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#B45309', marginBottom: '0.25rem' }}>EXPECTED (₹)</label>
                                                                    <input required type="number" placeholder="0.00" value={inlineRemForm.amount} onChange={(e) => setInlineRemForm({ ...inlineRemForm, amount: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FCD34D', outline: 'none', fontWeight: '800', fontSize: '0.9rem' }} />
                                                                </div>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#B45309', marginBottom: '0.25rem' }}>DUE MATURITY</label>
                                                                    <input required type="date" value={inlineRemForm.due_date} onChange={(e) => setInlineRemForm({ ...inlineRemForm, due_date: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FCD34D', outline: 'none', fontSize: '0.85rem' }} />
                                                                </div>
                                                            </div>
                                                            <button type="submit" disabled={createReminderMutation.isPending} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                                                {createReminderMutation.isPending ? 'Enabling...' : 'Enable Alarm 🔔'}
                                                            </button>
                                                        </form>
                                                    </Motion.div>
                                                ) : (
                                                    <Motion.div key="reminders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#1E293B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Maturity Due Alerts</h4>
                                                            <Bell size={16} style={{ color: '#94A3B8' }} />
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            {isPersonRemLoading ? (
                                                                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Fetching deadlines...</p>
                                                            ) : (!personReminders || (personReminders.data ? personReminders.data.length === 0 : personReminders.length === 0)) ? (
                                                                <div style={{ padding: '2rem', border: '2px dashed #E2E8F0', borderRadius: '16px', textAlign: 'center', background: 'white' }}>
                                                                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic', fontWeight: '600' }}>All accounts cleared.</p>
                                                                </div>
                                                            ) : (
                                                                (personReminders.data || personReminders || []).slice(0, 4).map((rem, i) => (
                                                                    <div key={i} style={{ padding: '1.1rem 1.25rem', background: 'white', border: '1px solid #E2E8F0', borderLeft: '4px solid #F59E0B', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155' }}>{rem.title}</span>
                                                                            <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#1E293B' }}>{formatCurr(rem.amount)}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#E11D48', fontWeight: '800' }}>
                                                                            <Calendar size={12} />
                                                                            <span>Matures: {new Date(rem.due_date).toLocaleDateString('en-IN')}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </Motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Footer */}
                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #E2E8F0', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                {!isInlineRemOpen && (
                                    <button onClick={() => { setIsInlineTxOpen(prev => !prev); setIsInlineRemOpen(false); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: isInlineTxOpen ? '#FEE2E2' : '#F1F5F9', border: 'none', color: isInlineTxOpen ? '#991B1B' : '#475569', fontWeight: '750', cursor: 'pointer' }}>
                                        {isInlineTxOpen ? 'Cancel Entry' : 'Record Transaction'}
                                    </button>
                                )}
                                {!isInlineTxOpen && (
                                    <button onClick={() => { setIsInlineRemOpen(prev => !prev); setIsInlineTxOpen(false); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: isInlineRemOpen ? '#FEF2F2' : '#FEF3C7', border: 'none', color: isInlineRemOpen ? '#991B1B' : '#D97706', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isInlineRemOpen ? 'Cancel Alarm' : <><Bell size={15} /> Set Maturity Due</>}
                                    </button>
                                )}
                                <button onClick={() => setSelectedPersonId(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#1B6B3A', border: 'none', color: 'white', fontWeight: '750', cursor: 'pointer' }}>
                                    Dismiss Records
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessPeople;
