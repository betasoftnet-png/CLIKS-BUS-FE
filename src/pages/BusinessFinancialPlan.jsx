import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Target, 
    Plus, 
    Search, 
    Filter, 
    TrendingUp, 
    TrendingDown, 
    Calendar,
    Briefcase,
    IndianRupee,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Loader2,
    ChevronRight,
    Building,
    Edit2,
    Trash2
} from 'lucide-react';
import { businessPlanService } from '../services';
import '../App.css';

const BusinessFinancialPlan = () => {
    const queryClient = useQueryClient();
    const [searchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', total_budget: '', start_date: '', end_date: '', status: 'Draft' });

    // Fetch Plans
    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['business-plans'],
        queryFn: async () => {
            const res = await businessPlanService.getPlans();
            return res.data || [];
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: businessPlanService.createPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-plans'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: businessPlanService.deletePlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-plans'] });
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', total_budget: '', start_date: '', end_date: '', status: 'Draft' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredPlans = plans.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        activePlans: plans.filter(p => p.status === 'Active').length,
        totalBudget: plans.reduce((sum, p) => sum + parseFloat(p.total_budget || 0), 0),
        draftPlans: plans.filter(p => p.status === 'Draft').length,
        upcomingMilestones: plans.length // Simplified for now
    };

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Target size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Strategic Planning</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Architect your business future with precision financial modeling.</p>
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
                    New Strategic Plan
                </button>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Active Initiatives', value: stats.activePlans, icon: Briefcase, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Projected Capital', value: `₹${stats.totalBudget.toLocaleString()}`, icon: IndianRupee, color: '#0D9488', bg: '#F0FDFA' },
                    { label: 'Drafting Phase', value: stats.draftPlans, icon: PieChart, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Milestones Due', value: stats.upcomingMilestones, icon: Calendar, color: '#064E3B', bg: '#ECFDF5' }
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

            {/* Plans List Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {isLoading ? (
                    <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#1B6B3A" /></div>
                ) : filteredPlans.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '32px', padding: '5rem 2rem', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', margin: '0 auto 1.5rem' }}>
                            <Target size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>No Active Plans</h3>
                        <p style={{ color: '#64748B', fontWeight: '500', maxWidth: '400px', margin: '0 auto' }}>Start your first strategic financial plan to track growth and project your business future.</p>
                    </div>
                ) : (
                    filteredPlans.map(plan => (
                        <div key={plan.id} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCF2E4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.25rem' }}>{plan.name}</h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={14} /> {plan.start_date} — {plan.end_date}
                                        </span>
                                        <span style={{ 
                                            padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                                            background: plan.status === 'Active' ? '#F0FDF4' : '#F8FAFC',
                                            color: plan.status === 'Active' ? '#15803D' : '#64748B'
                                        }}>
                                            {plan.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Planned Budget</p>
                                    <h5 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#064E3B' }}>₹{parseFloat(plan.total_budget || 0).toLocaleString()}</h5>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan.id)}
                                        style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#F8FAFC', color: '#1B6B3A', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '560px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>Initialize Strategic Plan</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                createMutation.mutate(formData);
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Plan Title</label>
                                <input required placeholder="e.g. FY 2026 Operational Budget" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Description / Strategy</label>
                                <textarea placeholder="Outline the strategic objectives for this period..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '100px', fontSize: '0.95rem', fontWeight: '500' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Start Date</label>
                                    <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>End Date</label>
                                    <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Capital Allocation (₹)</label>
                                    <input required type="number" placeholder="0.00" value={formData.total_budget} onChange={e => setFormData({...formData, total_budget: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Initial Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={createMutation.isLoading} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer' }}>
                                {createMutation.isLoading ? <Loader2 className="animate-spin" /> : 'Create Strategic Plan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessFinancialPlan;
