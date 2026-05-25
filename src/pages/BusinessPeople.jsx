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
    CheckCircle2,
    Edit2,
    Pin,
    MoreVertical,
    Share2
} from 'lucide-react';
import { peopleService } from '../services/peopleService';
import { settingsService } from '../services/settingsService';
import FilterableTableHead from '../components/FilterableTableHead';
import { applyTableFilters } from '../utils/filterUtils';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import { useCurrency } from '../context';

const BusinessPeople = () => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('contacts'); // 'contacts', 'transactions', 'reminders'
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const queryClient = useQueryClient();

    // Modals states
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [editingContactId, setEditingContactId] = useState(null);
    const [editingTxId, setEditingTxId] = useState(null);
    const [editingRemId, setEditingRemId] = useState(null);

    // Customization Filters state
    const [groupFilter, setGroupFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [colFilters, setColFilters] = useState({});

    React.useEffect(() => {
        setColFilters({});
    }, [activeTab]);

    // Forms input states
    const [contactForm, setContactForm] = useState({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '', contact_info: '' });
    const [txForm, setTxForm] = useState({ person_id: '', type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const [reminderForm, setReminderForm] = useState({ person_id: '', title: '', amount: '', due_date: new Date().toISOString().split('T')[0], notes: '' });

    // Inline Transaction state inside popup
    const [isInlineTxOpen, setIsInlineTxOpen] = useState(false);
    const [inlineTxForm, setInlineTxForm] = useState({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });

    // Inline Reminder/Maturity state inside popup
    const [isInlineRemOpen, setIsInlineRemOpen] = useState(false);
    const [inlineRemForm, setInlineRemForm] = useState({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });

    // Ledger search inside person detail modal
    const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');
    const [showLedgerSearch, setShowLedgerSearch] = useState(false);

    const [pinnedPeopleIds, setPinnedPeopleIds] = useState(() => {
        const saved = localStorage.getItem('cliks_pinned_people');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeMenuId, setActiveMenuId] = useState(null);

    React.useEffect(() => {
        const handleGlobalClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    React.useEffect(() => {
        setIsInlineTxOpen(false);
        setIsInlineRemOpen(false);
        setEditingTxId(null);
        setLedgerSearchTerm('');
        setShowLedgerSearch(false);
        setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        setInlineRemForm({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });
    }, [selectedPersonId]);

    // Settings Configuration
    const { data: userSettings } = useQuery({
        queryKey: ['business-settings'],
        queryFn: settingsService.getSettings,
    });
    const activeConfig = userSettings?.data || userSettings || {};

    const getContactMeta = (contactInfo) => {
        try {
            if (contactInfo && (contactInfo.startsWith('{') || contactInfo.startsWith('['))) {
                return JSON.parse(contactInfo);
            }
        } catch {
            // fallback to default metadata
        }
        return {
            status: contactInfo === 'inactive' ? 'inactive' : 'active',
            loyalty_points: 0
        };
    };

    const serializeContactMeta = (status, loyaltyPoints) => {
        return JSON.stringify({
            status: status || 'active',
            loyalty_points: parseInt(loyaltyPoints) || 0
        });
    };

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
            setContactForm({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '', contact_info: '' });
            alert('Contact added to your network.');
        }
    });

    const updateContactMutation = useMutation({
        mutationFn: (variables) => peopleService.updatePerson(variables.id, variables.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['people-list']);
            queryClient.invalidateQueries(['person-detail', variables.id]);
            setIsContactModalOpen(false);
            setEditingContactId(null);
            setContactForm({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '', contact_info: '' });
            alert('Contact profile updated.');
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

    const updateTxMutation = useMutation({
        mutationFn: (data) => peopleService.updateTransaction(data.person_id, data.id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['people-transactions-all']);
            queryClient.invalidateQueries(['people-list']);
            if (variables.person_id) {
                queryClient.invalidateQueries(['person-transactions', variables.person_id]);
                queryClient.invalidateQueries(['person-detail', variables.person_id]);
            }
            setIsInlineTxOpen(false);
            setEditingTxId(null);
            setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
            alert('Transaction updated successfully.');
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

    const updateReminderMutation = useMutation({
        mutationFn: (data) => peopleService.updateReminder(data.person_id, data.id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['people-reminders-all'] });
            queryClient.invalidateQueries({ queryKey: ['person-reminders', variables.person_id] });
            setIsInlineRemOpen(false);
            setEditingRemId(null);
            setInlineRemForm({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] });
            alert('Reminder updated successfully.');
        }
    });

    const deleteReminderMutation = useMutation({
        mutationFn: (rem) => peopleService.deleteReminder(rem.person_id, rem.id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['people-reminders-all'] });
            queryClient.invalidateQueries({ queryKey: ['person-reminders', variables.person_id] });
            alert('Reminder dismissed.');
        }
    });

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSaveContact = (e) => {
        e.preventDefault();
        const meta = getContactMeta(contactForm.contact_info);
        const payload = {
            ...contactForm,
            contact_info: serializeContactMeta(meta.status, meta.loyalty_points)
        };
        if (editingContactId) {
            updateContactMutation.mutate({ id: editingContactId, data: payload });
        } else {
            createContactMutation.mutate(payload);
        }
    };

    const handleSendWhatsAppReminder = (person, balance) => {
        if (!person.phone) {
            alert('No phone number registered for this contact.');
            return;
        }
        const amtStr = formatCurr(Math.abs(balance));
        const direction = balance >= 0 ? 'receivable outstanding balance' : 'payable balance';
        const message = `Hello ${person.name},\n\nThis is a friendly reminder regarding our pending P2P ledger account status:\n\n*Current Balance:* ${amtStr} (${direction})\n\nPlease check and let me know. Thank you,\nCLIKS BUSINESS.`;
        const whatsappUrl = `https://wa.me/${person.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDeleteContact = async (id) => {
        if (await customConfirm('Are you sure you want to delete this contact and all associated transactions?')) {
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
        if (editingTxId) {
            updateTxMutation.mutate({ ...inlineTxForm, person_id: selectedPersonId, id: editingTxId });
        } else {
            createTxMutation.mutate({ ...inlineTxForm, person_id: selectedPersonId });
        }
    };

    const handleSaveInlineRem = (e) => {
        e.preventDefault();
        if (!selectedPersonId) return alert('Target registry contact missing.');
        
        if (editingRemId) {
            updateReminderMutation.mutate(
                { ...inlineRemForm, person_id: selectedPersonId, id: editingRemId }
            );
        } else {
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
        }
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
        return formatCurrency(val);
    };

    const uniqueGroups = useMemo(() => {
        const groups = new Set(['Family', 'Friends', 'Clients', 'Vendors', 'Staff']);
        people.forEach(p => {
            if (p.relationship) groups.add(p.relationship);
        });
        return Array.from(groups);
    }, [people]);

    const filteredPeople = people.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (p.company || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = groupFilter === 'All' || p.relationship === groupFilter;
        const meta = getContactMeta(p.contact_info);
        const matchesStatus = statusFilter === 'All' || meta.status === statusFilter;
        return matchesSearch && matchesGroup && matchesStatus;
    });

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
                    {activeTab === 'contacts' && activeConfig.partyGroup && (
                        <select 
                            value={groupFilter} 
                            onChange={(e) => setGroupFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem', fontWeight: '700', color: '#475569', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="All">All Groups</option>
                            {uniqueGroups.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    )}

                    {activeTab === 'contacts' && activeConfig.partyStatus && (
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem', fontWeight: '700', color: '#475569', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    )}

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
                            <FilterableTableHead 
                                columns={[
                                    { key: 'name', label: 'Profile Contact', placeholder: 'Name...' },
                                    { key: 'role_type', label: 'Classification', placeholder: 'Role...' },
                                    ...(activeConfig.partyGroup ? [{ key: 'relationship', label: 'Group Cluster', placeholder: 'Group...' }] : []),
                                    ...(activeConfig.partyStatus ? [{ key: 'status', label: 'Status', placeholder: 'Status...' }] : []),
                                    { key: 'company', label: 'Company / Link', placeholder: 'Company...' },
                                    { key: 'phone_email', label: 'Phone / Email', placeholder: 'Contact...' },
                                    ...(activeConfig.loyalty ? [{ key: 'loyalty_points', label: 'Loyalty Points', placeholder: 'Points...', align: 'center' }] : []),
                                    { key: 'net_balance', label: 'Net Exposure', placeholder: 'Exposure...', align: 'right' },
                                    { key: '_actions', label: '', noFilter: true }
                                ]} 
                                onFilterChange={setColFilters} 
                                thStyle={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem' }}
                            />
                            <tbody>
                                {isPeopleLoading ? (
                                    <tr><td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Streaming network directory...</td></tr>
                                ) : filteredPeople
                                    .map(p => {
                                        const meta = getContactMeta(p.contact_info);
                                        return {
                                            ...p,
                                            status: meta.status,
                                            loyalty_points: meta.loyalty_points,
                                            phone_email: `${p.phone || ''} ${p.email || ''}`
                                        };
                                    })
                                    .filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).length === 0 ? (
                                    <tr><td colSpan={10} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Zero network contacts found. Start adding!</td></tr>
                                ) : filteredPeople
                                    .map(p => {
                                        const meta = getContactMeta(p.contact_info);
                                        return {
                                            ...p,
                                            status: meta.status,
                                            loyalty_points: meta.loyalty_points,
                                            phone_email: `${p.phone || ''} ${p.email || ''}`
                                        };
                                    })
                                    .filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {}))
                                    .sort((a, b) => {
                                        const aPinned = pinnedPeopleIds.includes(a.id);
                                        const bPinned = pinnedPeopleIds.includes(b.id);
                                        if (aPinned && !bPinned) return -1;
                                        if (!aPinned && bPinned) return 1;
                                        return 0;
                                    })
                                    .map((p) => {
                                        const meta = getContactMeta(p.contact_info);
                                        const netBal = parseFloat(p.net_balance || 0);
                                        const isPinned = pinnedPeopleIds.includes(p.id);
                                        return (
                                            <tr key={p.id} 
                                                style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s', background: 'white' }} 
                                                onClick={() => setSelectedPersonId(p.id)}
                                                onMouseOver={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                                            >
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        {renderAvatar(p.name, 42)}
                                                        {isPinned && (
                                                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#004aad', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                                <Pin size={10} style={{ transform: 'rotate(45deg)' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '1rem', margin: 0 }}>{p.name}</p>
                                                        {activeConfig.payReminder && netBal !== 0 && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleSendWhatsAppReminder(p, netBal); }}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: '#ECFDF5', color: '#047857', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '750', marginTop: '4px', cursor: 'pointer' }}
                                                            >
                                                                Send Reminder 💬
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#EFF6FF', color: '#1E40AF', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>{p.role_type}</span>
                                            </td>
                                            {activeConfig.partyGroup && (
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    {p.relationship ? (
                                                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#FEF3C7', color: '#D97706', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>{p.relationship}</span>
                                                    ) : (
                                                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>None</span>
                                                    )}
                                                </td>
                                            )}
                                            {activeConfig.partyStatus && (
                                                <td style={{ padding: '1.5rem 2rem' }}>
                                                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: meta.status === 'active' ? '#ECFDF5' : '#FEE2E2', color: meta.status === 'active' ? '#047857' : '#EF4444', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                                        {meta.status}
                                                    </span>
                                                </td>
                                            )}
                                            <td style={{ padding: '1.5rem 2rem', color: '#64748B', fontWeight: '600' }}>{p.company || 'Individual'}</td>
                                            <td style={{ padding: '1.5rem 2rem', color: '#475569' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '650' }}>{p.phone || 'N/A'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{p.email || ''}</div>
                                            </td>
                                            {activeConfig.loyalty && (
                                                <td style={{ padding: '1.5rem 2rem', textAlign: 'center' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.6rem', borderRadius: '6px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7', fontWeight: '800', fontSize: '0.72rem' }}>
                                                        <Tag size={12} /> {meta.loyalty_points || 0} pts
                                                    </span>
                                                </td>
                                            )}
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                <span style={{ fontWeight: '900', fontSize: '1.1rem', color: netBal >= 0 ? '#16A34A' : '#EF4444' }}>
                                                    {formatCurr(p.net_balance)}
                                                </span>
                                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '700' }}>{netBal >= 0 ? 'RECEIVABLE' : 'PAYABLE'}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right', position: 'relative' }}>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(activeMenuId === p.id ? null : p.id);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s', padding: '6px 12px', borderRadius: '8px' }}
                                                        onMouseOver={(e) => e.currentTarget.style.color = '#004aad'}
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    
                                                    {activeMenuId === p.id && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: '100%',
                                                            background: 'white',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                                                            border: '1px solid #E2E8F0',
                                                            padding: '6px',
                                                            zIndex: 100,
                                                            minWidth: '160px',
                                                            textAlign: 'left'
                                                        }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const next = pinnedPeopleIds.includes(p.id)
                                                                        ? pinnedPeopleIds.filter(id => id !== p.id)
                                                                        : [...pinnedPeopleIds, p.id];
                                                                    setPinnedPeopleIds(next);
                                                                    localStorage.setItem('cliks_pinned_people', JSON.stringify(next));
                                                                    setActiveMenuId(null);
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%',
                                                                    padding: '8px 12px',
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    color: '#334155',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '8px',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <Pin size={14} style={{ color: '#004aad', transform: isPinned ? 'rotate(45deg)' : 'none' }} />
                                                                {isPinned ? 'Unpin Contact' : 'Pin to top'}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingContactId(p.id);
                                                                    setContactForm({
                                                                        name: p.name || '',
                                                                        role_type: p.role_type || 'friend',
                                                                        phone: p.phone || '',
                                                                        email: p.email || '',
                                                                        company: p.company || '',
                                                                        relationship: p.relationship || '',
                                                                        contact_info: p.contact_info || JSON.stringify({ status: 'active', loyalty_points: 0 })
                                                                    });
                                                                    setIsContactModalOpen(true);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%',
                                                                    padding: '8px 12px',
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    color: '#334155',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '8px',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <Edit2 size={14} style={{ color: '#64748B' }} />
                                                                Edit Profile
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteContact(p.id);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%',
                                                                    padding: '8px 12px',
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    color: '#EF4444',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '8px',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <Trash2 size={14} style={{ color: '#EF4444' }} />
                                                                Delete Contact
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* TAB 2: Transactions Ledger */}
                    {activeTab === 'transactions' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead 
                                columns={[
                                    { key: 'date', label: 'Execution Date', placeholder: 'Date...' },
                                    { key: 'person_name', label: 'Network Contact', placeholder: 'Contact...' },
                                    { key: 'description', label: 'Activity Description', placeholder: 'Description...' },
                                    { key: 'type', label: 'Classification', placeholder: 'Type...' },
                                    { key: 'amount', label: 'Ledger Flow', placeholder: 'Flow...', align: 'right' },
                                    { key: '_actions', label: '', noFilter: true }
                                ]} 
                                onFilterChange={setColFilters} 
                                thStyle={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem' }}
                            />
                            <tbody>
                                {isTxLoading ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Accessing Ledger Database...</td></tr>
                                ) : filteredTx.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>No logged P2P activities found.</td></tr>
                                ) : filteredTx.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((t) => (
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
                            <FilterableTableHead 
                                columns={[
                                    { key: 'due_date', label: 'Maturity / Due Date', placeholder: 'Due Date...' },
                                    { key: 'person_name', label: 'Target Contact', placeholder: 'Contact...' },
                                    { key: 'title', label: 'Memo Label', placeholder: 'Memo...' },
                                    { key: 'amount', label: 'Claim Cap', placeholder: 'Claim...', align: 'right' },
                                    { key: '_actions', label: '', noFilter: true }
                                ]} 
                                onFilterChange={setColFilters} 
                                thStyle={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFF', padding: '1.25rem 2rem' }}
                            />
                            <tbody>
                                {isRemindersLoading ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Resolving dispatch statuses...</td></tr>
                                ) : reminders.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>Zero pending alerts scheduled.</td></tr>
                                ) : reminders.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((r) => (
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

            {/* Modal 1: Add/Edit People Contact */}
            <AnimatePresence>
                {isContactModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>{editingContactId ? 'Edit Contact Profile' : 'Enroll New Contact'}</h3>
                                <button onClick={() => { setIsContactModalOpen(false); setEditingContactId(null); setContactForm({ name: '', role_type: 'friend', phone: '', email: '', company: '', relationship: '', contact_info: '' }); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveContact} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Full Identity Name <span style={{ color: '#EF4444' }}>*</span></label>
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
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Phone Contact <span style={{ color: '#EF4444' }}>*</span></label>
                                        <input required placeholder="+91 ..." type="text" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value.replace(/[^0-9+]/g, '') })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>E-Mail Address</label>
                                        <input placeholder="name@example.com" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                    </div>
                                </div>

                                {activeConfig.partyGroup && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Group / Relationship Cluster</label>
                                        <select 
                                            value={contactForm.relationship || ''} 
                                            onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
                                        >
                                            <option value="">No Group Cluster</option>
                                            <option value="Family">Family</option>
                                            <option value="Friends">Friends</option>
                                            <option value="Clients">Clients</option>
                                            <option value="Vendors">Vendors</option>
                                            <option value="Staff">Staff</option>
                                            <option value="Consultants">Consultants</option>
                                        </select>
                                    </div>
                                )}

                                {activeConfig.partyStatus && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Status</label>
                                        <select 
                                            value={getContactMeta(contactForm.contact_info).status || 'active'} 
                                            onChange={(e) => {
                                                const meta = getContactMeta(contactForm.contact_info);
                                                setContactForm({ 
                                                    ...contactForm, 
                                                    contact_info: serializeContactMeta(e.target.value, meta.loyalty_points) 
                                                });
                                            }}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}

                                {activeConfig.loyalty && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Initial Loyalty Points</label>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            value={getContactMeta(contactForm.contact_info).loyalty_points || 0} 
                                            onChange={(e) => {
                                                const meta = getContactMeta(contactForm.contact_info);
                                                setContactForm({ 
                                                    ...contactForm, 
                                                    contact_info: serializeContactMeta(meta.status, e.target.value) 
                                                });
                                            }} 
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                        />
                                    </div>
                                )}

                                <button type="submit" disabled={createContactMutation.isPending || updateContactMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                    {editingContactId ? (updateContactMutation.isPending ? 'Updating Profile...' : 'Save Profile Changes') : (createContactMutation.isPending ? 'Saving Contact...' : 'Create Contact Node')}
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Value Cap Amount ({currency.symbol})</label>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: '#064E3B', textTransform: 'uppercase' }}>{personDetails?.name}</h2>
                                                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', background: '#EFF6FF', color: '#1E40AF', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{personDetails?.role_type}</span>
                                                {activeConfig.partyGroup && personDetails?.relationship && (
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>Group: {personDetails.relationship}</span>
                                                )}
                                                {activeConfig.partyStatus && (
                                                    <span 
                                                        onClick={() => {
                                                            const meta = getContactMeta(personDetails.contact_info);
                                                            const newStatus = meta.status === 'active' ? 'inactive' : 'active';
                                                            const updatedMeta = serializeContactMeta(newStatus, meta.loyalty_points);
                                                            updateContactMutation.mutate({
                                                                id: personDetails.id,
                                                                data: { ...personDetails, contact_info: updatedMeta }
                                                            });
                                                        }}
                                                        style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', background: getContactMeta(personDetails.contact_info).status === 'active' ? '#DCF2E4' : '#FEE2E2', color: getContactMeta(personDetails.contact_info).status === 'active' ? '#16A34A' : '#EF4444', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer' }}
                                                        title="Click to toggle status"
                                                    >
                                                        {getContactMeta(personDetails.contact_info).status}
                                                    </span>
                                                )}
                                                {activeConfig.loyalty && (
                                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Tag size={10} /> {getContactMeta(personDetails.contact_info).loyalty_points || 0} pts
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ margin: 0, color: '#64748B', fontWeight: '600', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                {personDetails?.company && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {personDetails.company}</span>}
                                                {personDetails?.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {personDetails.phone}</span>}
                                                {personDetails?.email && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {personDetails.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => {
                                            const shareText = `Contact Details:\nName: ${personDetails?.name || 'N/A'}\nPhone: ${personDetails?.phone || 'N/A'}\nEmail: ${personDetails?.email || 'N/A'}\nNet Balance: ${formatCurrency(personDetails?.net_balance || 0)}`;
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: `Contact Info - ${personDetails?.name}`,
                                                    text: shareText
                                                }).catch(err => console.error('Share failed', err));
                                            } else {
                                                navigator.clipboard.writeText(shareText);
                                                alert('Contact details copied to clipboard!');
                                            }
                                        }}
                                        style={{ border: 'none', background: 'white', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        title="Share Contact"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button onClick={() => setSelectedPersonId(null)} style={{ border: 'none', background: 'white', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: '#FAFAF9' }}>
                                {!isPersonDetailLoading && personDetails && (
                                    <>
                                        {/* Loyalty & Action Center */}
                                        {activeConfig.loyalty && (
                                            <div style={{ background: '#F0FDF4', padding: '1.25rem 1.5rem', borderRadius: '24px', border: '1px solid #DCFCE7', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: '850', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loyalty Points Stand</span>
                                                    <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem', fontWeight: '900', color: '#166534' }}>{getContactMeta(personDetails.contact_info).loyalty_points || 0} Points Available</h4>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => {
                                                            const meta = getContactMeta(personDetails.contact_info);
                                                            const updatedMeta = serializeContactMeta(meta.status, (meta.loyalty_points || 0) + 10);
                                                            updateContactMutation.mutate({
                                                                id: personDetails.id,
                                                                data: { ...personDetails, contact_info: updatedMeta }
                                                            });
                                                        }}
                                                        style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', background: '#16A34A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        +10 PTS
                                                    </button>
                                                    <button 
                                                        disabled={(getContactMeta(personDetails.contact_info).loyalty_points || 0) < 10}
                                                        onClick={() => {
                                                            const meta = getContactMeta(personDetails.contact_info);
                                                            const updatedMeta = serializeContactMeta(meta.status, Math.max(0, (meta.loyalty_points || 0) - 10));
                                                            updateContactMutation.mutate({
                                                                id: personDetails.id,
                                                                data: { ...personDetails, contact_info: updatedMeta }
                                                            });
                                                        }}
                                                        style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', background: '#EF4444', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', opacity: (getContactMeta(personDetails.contact_info).loyalty_points || 0) < 10 ? 0.5 : 1 }}
                                                    >
                                                        -10 PTS
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Exposure Card */}
                                        <div style={{ background: computedNetBalance >= 0 ? '#ECFDF5' : '#FEF2F2', padding: '1.75rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: '1.5px solid', borderColor: computedNetBalance >= 0 ? '#A7F3D0' : '#FCA5A5', boxShadow: '0 4px 10px -2px rgba(0,0,0,0.02)' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '850', textTransform: 'uppercase', color: computedNetBalance >= 0 ? '#047857' : '#B91C1C', letterSpacing: '0.05em' }}>Consolidated Ledger Stand</p>
                                                <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '2.25rem', fontWeight: '950', color: computedNetBalance >= 0 ? '#065F46' : '#991B1B', letterSpacing: '-0.03em' }}>
                                                    {formatCurr(computedNetBalance)}
                                                </h3>
                                                {activeConfig.payReminder && computedNetBalance !== 0 && (
                                                    <button 
                                                        onClick={() => handleSendWhatsAppReminder(personDetails, computedNetBalance)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: computedNetBalance >= 0 ? '#D1FAE5' : '#FEE2E2', color: computedNetBalance >= 0 ? '#065F46' : '#991B1B', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', marginTop: '0.75rem', cursor: 'pointer' }}
                                                    >
                                                        Send Payment Reminder 💬
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: computedNetBalance >= 0 ? '#059669' : '#DC2626', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
                                                {computedNetBalance >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                                            {/* Recent Ledger List */}
                                           <div>
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
        }}
    >
        <h4
            style={{
                fontSize: '0.95rem',
                fontWeight: '900',
                color: '#1E293B',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
            }}
        >
            Direct Ledger Activity
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
                onClick={() => {
                    setShowLedgerSearch(prev => !prev);

                    if (showLedgerSearch) {
                        setLedgerSearchTerm('');
                    }
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: showLedgerSearch ? '#1B6B3A' : '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex'
                }}
                title="Search entries"
            >
                <Search size={16} />
            </button>

            <ArrowLeftRight size={16} style={{ color: '#94A3B8' }} />
        </div>
    </div>

    {showLedgerSearch && (
        <div style={{ marginBottom: '0.75rem' }}>
            <input
                type="text"
                placeholder="Search by amount, date, or memo..."
                value={ledgerSearchTerm}
                onChange={(e) => setLedgerSearchTerm(e.target.value)}
                autoFocus
                style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    outline: 'none',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    color: '#1E293B',
                    background: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    )}

    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxHeight: '320px',
            overflowY: 'auto'
        }}
    >
        {isPersonTxLoading ? (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Loading transactions...
            </p>
        ) : (!personTx ||
          (personTx.data
              ? personTx.data.length === 0
              : personTx.length === 0)) ? (
            <div
                style={{
                    padding: '2rem',
                    border: '2px dashed #E2E8F0',
                    borderRadius: '16px',
                    textAlign: 'center',
                    background: 'white'
                }}
            >
                <p
                    style={{
                        margin: 0,
                        color: '#94A3B8',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        fontWeight: '600'
                    }}
                >
                    Zero financial assets logged.
                </p>
            </div>
        ) : (
            (() => {
                const allTx = [...(personTx.data || personTx || [])].sort((a, b) => Number(a.id) - Number(b.id));

                const filtered = ledgerSearchTerm.trim()
                    ? allTx.filter(t => {
                          const term = ledgerSearchTerm.toLowerCase().trim();

                          const matchDesc = (t.description || '')
                              .toLowerCase()
                              .includes(term);

                          const matchAmt = String(t.amount).includes(term);

                          const matchDate = new Date(t.date)
                              .toLocaleDateString('en-IN')
                              .includes(term);

                          const matchType = (t.type || '')
                              .toLowerCase()
                              .includes(term);

                          return (
                              matchDesc ||
                              matchAmt ||
                              matchDate ||
                              matchType
                          );
                      })
                    : allTx;

                return filtered.length === 0 ? (
                    <div
                        style={{
                            padding: '1.5rem',
                            border: '2px dashed #E2E8F0',
                            borderRadius: '16px',
                            textAlign: 'center',
                            background: 'white'
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                color: '#94A3B8',
                                fontSize: '0.85rem',
                                fontStyle: 'italic',
                                fontWeight: '600'
                            }}
                        >
                            No matching entries found for "
                            {ledgerSearchTerm}"
                        </p>
                    </div>
                ) : (
                    filtered.map((t, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '1.1rem 1.25rem',
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                                gap: '1rem'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.25rem',
                                    flex: 1
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        color: '#334155'
                                    }}
                                >
                                    {t.description || 'Registry entry'}
                                </p>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        color: '#94A3B8',
                                        fontWeight: '600'
                                    }}
                                >
                                    {new Date(t.date).toLocaleDateString(
                                        'en-IN'
                                    )}
                                </p>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <span
                                        style={{
                                            fontSize: '1.05rem',
                                            fontWeight: '900',
                                            color:
                                                t.type === 'lent'
                                                    ? '#059669'
                                                    : '#DC2626'
                                        }}
                                    >
                                        {t.type === 'lent' ? '+' : '-'}
                                        {formatCurr(t.amount)}
                                    </span>

                                    <div
                                        style={{
                                            fontSize: '0.65rem',
                                            fontWeight: '850',
                                            textTransform: 'uppercase',
                                            color:
                                                t.type === 'lent'
                                                    ? '#10B981'
                                                    : '#EF4444',
                                            marginTop: '2px'
                                        }}
                                    >
                                        {t.type}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '0.35rem',
                                        borderLeft: '1px solid #E2E8F0',
                                        paddingLeft: '0.75rem',
                                        alignItems: 'center'
                                    }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setEditingTxId(t.id);

                                            setInlineTxForm({
                                                type: t.type,
                                                amount: t.amount,
                                                date: new Date(t.date)
                                                    .toISOString()
                                                    .split('T')[0],
                                                description:
                                                    t.description || ''
                                            });

                                            setIsInlineTxOpen(true);
                                            setIsInlineRemOpen(false);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#94A3B8',
                                            cursor: 'pointer',
                                            transition: 'color 0.2s',
                                            padding: '4px'
                                        }}
                                        onMouseOver={(e) =>
                                            (e.currentTarget.style.color =
                                                '#7C3AED')
                                        }
                                        onMouseOut={(e) =>
                                            (e.currentTarget.style.color =
                                                '#94A3B8')
                                        }
                                        title="Edit Transaction"
                                    >
                                        <Edit2 size={15} />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (
                                                confirm(
                                                    'Are you sure you want to delete this transaction?'
                                                )
                                            ) {
                                                deleteTxMutation.mutate(t);
                                            }
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#94A3B8',
                                            cursor: 'pointer',
                                            transition: 'color 0.2s',
                                            padding: '4px'
                                        }}
                                        onMouseOver={(e) =>
                                            (e.currentTarget.style.color =
                                                '#EF4444')
                                        }
                                        onMouseOut={(e) =>
                                            (e.currentTarget.style.color =
                                                '#94A3B8')
                                        }
                                        title="Delete Transaction"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                );
            })()
        )}
    </div>
</div>

                                            {/* Specific Reminder Flows */}
                                            {/* Right Column: Reminders OR Inline Transaction Form OR Inline Reminder Form */}
                                            <AnimatePresence mode="wait">
                                                {isInlineTxOpen ? (
                                                    <Motion.div key="tx-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#064E3B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                                {editingTxId ? 'Edit Registry Entry' : 'Log New Entry'}
                                                            </h4>
                                                            <button type="button" onClick={() => { setIsInlineTxOpen(false); setEditingTxId(null); setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' }); }} style={{ border: 'none', background: 'white', padding: '4px', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#64748B' }}><X size={16} /></button>
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
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.25rem' }}>AMOUNT ({currency.symbol})</label>
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
                                                            <button type="submit" disabled={createTxMutation.isPending || updateTxMutation.isPending} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                                                {createTxMutation.isPending || updateTxMutation.isPending ? 'Saving...' : editingTxId ? 'Update Entry' : 'Submit Entry'}
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
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#B45309', marginBottom: '0.25rem' }}>EXPECTED ({currency.symbol})</label>
                                                                    <input required type="number" placeholder="0.00" value={inlineRemForm.amount} onChange={(e) => setInlineRemForm({ ...inlineRemForm, amount: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FCD34D', outline: 'none', fontWeight: '800', fontSize: '0.9rem' }} />
                                                                </div>
                                                                <div>
                                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#B45309', marginBottom: '0.25rem' }}>DUE MATURITY</label>
                                                                    <input required type="date" value={inlineRemForm.due_date} onChange={(e) => setInlineRemForm({ ...inlineRemForm, due_date: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #FCD34D', outline: 'none', fontSize: '0.85rem' }} />
                                                                </div>
                                                            </div>
                                                            <button type="submit" disabled={createReminderMutation.isPending || updateReminderMutation.isPending} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                                                                {createReminderMutation.isPending || updateReminderMutation.isPending ? 'Saving...' : editingRemId ? 'Update Alarm' : 'Enable Alarm 🔔'}
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
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#E11D48', fontWeight: '800' }}>
                                                                                <Calendar size={12} />
                                                                                <span>Matures: {new Date(rem.due_date).toLocaleDateString('en-IN')}</span>
                                                                            </div>
                                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setEditingRemId(rem.id);
                                                                                        setInlineRemForm({
                                                                                            title: rem.title,
                                                                                            amount: rem.amount,
                                                                                            due_date: new Date(rem.due_date).toISOString().split('T')[0]
                                                                                        });
                                                                                        setIsInlineRemOpen(true);
                                                                                        setIsInlineTxOpen(false);
                                                                                    }}
                                                                                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                                                                    title="Edit Alert"
                                                                                >
                                                                                    <Edit2 size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        if (window.confirm('Are you sure you want to delete this alert?')) {
                                                                                            deleteReminderMutation.mutate(rem);
                                                                                        }
                                                                                    }}
                                                                                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                                                                    title="Delete Alert"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
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
                                    <button onClick={() => { setIsInlineTxOpen(prev => !prev); setIsInlineRemOpen(false); if (isInlineTxOpen) { setEditingTxId(null); setInlineTxForm({ type: 'lent', amount: '', date: new Date().toISOString().split('T')[0], description: '' }); } }} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: isInlineTxOpen ? '#FEE2E2' : '#F1F5F9', border: 'none', color: isInlineTxOpen ? '#991B1B' : '#475569', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isInlineTxOpen ? 'Cancel Entry' : <><Plus size={15} /> Record Transaction</>}
                                    </button>
                                )}
                                {!isInlineTxOpen && (
                                    <button onClick={() => { setIsInlineRemOpen(prev => !prev); setIsInlineTxOpen(false); if (isInlineRemOpen) { setEditingRemId(null); setInlineRemForm({ title: '', amount: '', due_date: new Date().toISOString().split('T')[0] }); } }} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: isInlineRemOpen ? '#FEF2F2' : '#FEF3C7', border: 'none', color: isInlineRemOpen ? '#991B1B' : '#D97706', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isInlineRemOpen ? 'Cancel Alarm' : <><Bell size={15} /> Set Maturity Due</>}
                                    </button>
                                )}
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessPeople;
