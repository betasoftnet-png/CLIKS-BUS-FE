import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    CheckCircle2, 
    X, 
    Loader2, 
    User, 
    IndianRupee,
    Trash2,
    MoreVertical,
    ChevronRight,
    AlertCircle,
    Phone,
    Mail,
    Building2
} from 'lucide-react';
import { plannedPaymentsService, peopleService } from '../services';
import { customConfirm } from '../utils/customConfirm';
import { useCurrency } from '../context';
import '../App.css';

const BusinessPaymentPlan = () => {
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, send, receive

    const [formData, setFormData] = useState({
        person_id: '',
        name: '', // Display name for the plan
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        type: 'SEND', // SEND or RECEIVE
        category: 'General',
        description: ''
    });

    const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
    const [personForm, setPersonForm] = useState({
        name: '',
        phone: '',
        role_type: 'friend',
        relationship: '',
        company: '',
        email: '',
        contact_info: ''
    });

    const serializeContactMeta = (status, loyaltyPoints) => {
        return JSON.stringify({
            status: status || 'active',
            loyalty_points: parseInt(loyaltyPoints) || 0
        });
    };

    const createPersonMutation = useMutation({
        mutationFn: (data) => peopleService.createPerson(data),
        onSuccess: (newPerson) => {
            queryClient.invalidateQueries({ queryKey: ['people-list'] });
            const newPersonId = newPerson.id || newPerson.data?.id;
            if (newPersonId) {
                setFormData(prev => ({ ...prev, person_id: newPersonId.toString() }));
            }
            setIsAddPersonModalOpen(false);
            setPersonForm({
                name: '',
                phone: '',
                role_type: 'friend',
                relationship: '',
                company: '',
                email: '',
                contact_info: ''
            });
        },
        onError: (err) => {
            alert(err?.response?.data?.message || 'Error enrolling contact. Please check the inputs.');
        }
    });

    const handleAddPersonSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...personForm,
            role_type: personForm.role_type || 'friend',
            contact_info: serializeContactMeta('active', 0)
        };
        createPersonMutation.mutate(payload);
    };

    // Queries
    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['planned-payments'],
        queryFn: async () => {
            const res = await plannedPaymentsService.getPayments();
            return res.data || [];
        }
    });

    const { data: people = [] } = useQuery({
        queryKey: ['people-list'],
        queryFn: async () => {
            const res = await peopleService.getPeople();
            // peopleService.getPeople() already unwraps the response and returns the rows array directly
            return Array.isArray(res) ? res : (res.rows || res.data || []);
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: plannedPaymentsService.createPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planned-payments'] });
            closeModal();
        }
    });

    const markPaidMutation = useMutation({
        mutationFn: plannedPaymentsService.markAsPaid,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planned-payments'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: plannedPaymentsService.deletePayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planned-payments'] });
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            person_id: '',
            name: '',
            amount: '',
            due_date: new Date().toISOString().split('T')[0],
            type: 'SEND',
            category: 'General',
            description: ''
        });
    };

    const handleDelete = async (id) => {
        if (await customConfirm('Are you sure you want to cancel this scheduled payment?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredPlans = plans.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || p.type === filterType;
        return matchesSearch && matchesType;
    });

    const stats = {
        totalScheduled: plans.length,
        toSend: plans.filter(p => p.type === 'SEND' && p.status !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
        toReceive: plans.filter(p => p.type === 'RECEIVE' && p.status !== 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingCount: plans.filter(p => p.status !== 'paid').length
    };

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <CalendarIcon size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Payment Planner</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Schedule and manage upcoming transfers and collections with ease.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} />
                    Schedule Payment
                </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Scheduled', value: stats.totalScheduled, icon: CalendarIcon, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'To Send', value: formatCurrency(stats.toSend), icon: ArrowUpRight, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'To Receive', value: formatCurrency(stats.toReceive), icon: ArrowDownRight, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'Pending Task', value: stats.pendingCount, icon: Clock, color: '#F59E0B', bg: '#FEF3C7' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', margin: 0 }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E293B', margin: '0.2rem 0 0 0' }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters and List */}
            <div style={{ flex: 1, minHeight: 0, background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {['all', 'SEND', 'RECEIVE'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setFilterType(type)}
                                style={{ 
                                    padding: '0.5rem 1.25rem', borderRadius: '10px', 
                                    background: filterType === type ? '#F0FDF4' : 'transparent',
                                    color: filterType === type ? '#16A34A' : '#64748B',
                                    border: '1px solid',
                                    borderColor: filterType === type ? '#BBF7D0' : 'transparent',
                                    fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
                                }}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '0.5rem 1rem', borderRadius: '12px', width: '300px' }}>
                        <Search size={18} color="#94A3B8" />
                        <input 
                            placeholder="Search schedules..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '0.75rem', width: '100%', fontSize: '0.9rem' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {isLoading ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#1B6B3A" /></div>
                    ) : filteredPlans.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                            <CalendarIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ fontWeight: '600' }}>No scheduled payments found.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                            {filteredPlans.map(plan => (
                                <div key={plan.id} style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '15px', 
                                            background: plan.type === 'SEND' ? '#FEE2E2' : '#DCF2E4',
                                            color: plan.type === 'SEND' ? '#EF4444' : '#1B6B3A',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {plan.type === 'SEND' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>{plan.name}</h4>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
                                                    <Clock size={14} /> {new Date(plan.due_date).toLocaleDateString()}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#1B6B3A', background: '#DCF2E4', padding: '0.1rem 0.5rem', borderRadius: '6px', fontWeight: '750' }}>
                                                    {plan.status.toUpperCase()}
                                                </span>
                                                {plan.person_name && (
                                                    <span style={{ fontSize: '0.8rem', color: '#0369A1', background: '#E0F2FE', padding: '0.1rem 0.5rem', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <User size={12} /> {plan.person_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Amount</p>
                                            <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.25rem', fontWeight: '900', color: plan.type === 'SEND' ? '#EF4444' : '#10B981' }}>
                                                {formatCurrency(plan.amount)}
                                            </h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {plan.status !== 'paid' && (
                                                <button 
                                                    onClick={() => markPaidMutation.mutate(plan.id)}
                                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle2 size={20} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(plan.id)}
                                                style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF1F2', color: '#E11D48', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Cancel"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Schedule New Payment</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                createMutation.mutate(formData);
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'SEND'})}
                                    style={{ 
                                        padding: '1rem', borderRadius: '16px', border: '2px solid', 
                                        borderColor: formData.type === 'SEND' ? '#EF4444' : '#E2E8F0',
                                        background: formData.type === 'SEND' ? '#FEF2F2' : 'white',
                                        color: formData.type === 'SEND' ? '#EF4444' : '#64748B',
                                        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <ArrowUpRight size={18} /> I am Sending
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'RECEIVE'})}
                                    style={{ 
                                        padding: '1rem', borderRadius: '16px', border: '2px solid', 
                                        borderColor: formData.type === 'RECEIVE' ? '#10B981' : '#E2E8F0',
                                        background: formData.type === 'RECEIVE' ? '#F0FDF4' : 'white',
                                        color: formData.type === 'RECEIVE' ? '#10B981' : '#64748B',
                                        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <ArrowDownRight size={18} /> I am Receiving
                                </button>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Reference Name</label>
                                <input 
                                    required 
                                    placeholder="e.g. Monthly Rent, Client Payment" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Link to Person (Optional)</label>
                                <select 
                                    value={formData.person_id} 
                                    onChange={e => {
                                        if (e.target.value === 'ADD_NEW_PERSON') {
                                            setIsAddPersonModalOpen(true);
                                        } else {
                                            setFormData({...formData, person_id: e.target.value});
                                        }
                                    }} 
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                >
                                    <option value="">Select Person...</option>
                                    <option value="ADD_NEW_PERSON" style={{ fontWeight: 'bold', color: '#1B6B3A' }}>+ Add New Person...</option>
                                    {people.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Amount ({currency.symbol})</label>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={formData.amount} 
                                        onChange={e => setFormData({...formData, amount: e.target.value})} 
                                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Scheduled Date</label>
                                    <input 
                                        required 
                                        type="date" 
                                        value={formData.due_date} 
                                        onChange={e => setFormData({...formData, due_date: e.target.value})} 
                                        style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description (Optional)</label>
                                <textarea 
                                    placeholder="Add any notes..." 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '80px', resize: 'none' }} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={createMutation.isLoading}
                                style={{ 
                                    width: '100%', padding: '1.1rem', borderRadius: '18px', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', 
                                    marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                                }}
                            >
                                {createMutation.isLoading ? <Loader2 className="animate-spin" /> : 'Schedule Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Enroll New Contact Inline */}
            {isAddPersonModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '450px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Enroll New Contact</h3>
                            <button 
                                type="button"
                                onClick={() => setIsAddPersonModalOpen(false)} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddPersonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Full Identity Name <span style={{ color: '#EF4444' }}>*</span></label>
                                <input 
                                    required 
                                    placeholder="e.g., Rahul Dev" 
                                    type="text" 
                                    value={personForm.name} 
                                    onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })} 
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Phone Contact <span style={{ color: '#EF4444' }}>*</span></label>
                                <input 
                                    required 
                                    placeholder="+91 ..." 
                                    type="text" 
                                    value={personForm.phone} 
                                    onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value.replace(/[^0-9+]/g, '') })} 
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Network Role</label>
                                    <select 
                                        value={personForm.role_type} 
                                        onChange={(e) => setPersonForm({ ...personForm, role_type: e.target.value })} 
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
                                    >
                                        <option value="friend">Friend</option>
                                        <option value="family">Family</option>
                                        <option value="colleague">Colleague</option>
                                        <option value="business">Business Partner</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Group Cluster</label>
                                    <select 
                                        value={personForm.relationship} 
                                        onChange={(e) => setPersonForm({ ...personForm, relationship: e.target.value })}
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
                                    >
                                        <option value="">No Group</option>
                                        <option value="Family">Family</option>
                                        <option value="Friends">Friends</option>
                                        <option value="Clients">Clients</option>
                                        <option value="Vendors">Vendors</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Company</label>
                                    <input 
                                        placeholder="e.g., Cliks Inc" 
                                        type="text" 
                                        value={personForm.company} 
                                        onChange={(e) => setPersonForm({ ...personForm, company: e.target.value })} 
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>E-Mail</label>
                                    <input 
                                        placeholder="name@example.com" 
                                        type="email" 
                                        value={personForm.email} 
                                        onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })} 
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={createPersonMutation.isPending} 
                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                {createPersonMutation.isPending ? 'Enrolling Contact...' : 'Create Contact'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPaymentPlan;
