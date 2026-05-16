import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Split, 
    Plus, 
    Trash2, 
    PieChart, 
    ArrowUpRight, 
    Info, 
    CheckCircle2, 
    X, 
    Loader2,
    DollarSign,
    Zap,
    ShieldCheck,
    Target,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    Building,
    Edit2
} from 'lucide-react';
import { businessSegregationService } from '../services';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';

const BusinessSegregation = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        allocations: [{ label: '', percentage: '', notes: '' }]
    });

    // Fetch Segregations
    const { data: segregations = [], isLoading } = useQuery({
        queryKey: ['business-segregations'],
        queryFn: async () => {
            const res = await businessSegregationService.getSegregations();
            return res.data || [];
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: businessSegregationService.createSegregation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-segregations'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: businessSegregationService.deleteSegregation,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(['business-segregations'], (old = []) => 
                Array.isArray(old) ? old.filter(seg => String(seg.id) !== String(deletedId)) : []
            );
            queryClient.invalidateQueries({ queryKey: ['business-segregations'] });
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', description: '', allocations: [{ label: '', percentage: '', notes: '' }] });
    };

    const addAllocationRow = () => {
        setFormData({ ...formData, allocations: [...formData.allocations, { label: '', percentage: '', notes: '' }] });
    };

    const removeAllocationRow = (index) => {
        const newAllocations = formData.allocations.filter((_, i) => i !== index);
        setFormData({ ...formData, allocations: newAllocations });
    };

    const handleAllocationChange = (index, field, value) => {
        const newAllocations = [...formData.allocations];
        newAllocations[index][field] = value;
        setFormData({ ...formData, allocations: newAllocations });
    };

    const calculateTotalPercentage = () => {
        return formData.allocations.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0);
    };

    const filteredSegregations = segregations.filter(seg => 
        seg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Split size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Fund Segregation</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage automated revenue split strategies for your business.</p>
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
                >
                    <Plus size={20} />
                    Create Strategy
                </button>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Stats Grid - Matching Gold Standard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Strategies', value: segregations.length, icon: Zap, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Avg. Split Pct', value: '100%', icon: PieChart, color: '#0D9488', bg: '#CCFBF1' },
                    { label: 'Verified Rules', value: segregations.length, icon: ShieldCheck, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Active Reserves', value: segregations.reduce((acc, s) => acc + (s.allocations?.length || 0), 0), icon: Target, color: '#8B5CF6', bg: '#EDE9FE' }
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

            {/* List View - Matching Billing UI */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search strategies..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ padding: '6rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={40} color="#1B6B3A" /></div>
                    ) : filteredSegregations.length === 0 ? (
                        <div style={{ padding: '5rem', textAlign: 'center', color: '#64748B' }}>No strategies found.</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Strategy Name</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Allocation Split</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSegregations.map((seg) => (
                                    <tr key={seg.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                    <Zap size={20} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#1E293B' }}>{seg.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500' }}>{seg.description || 'N/A'}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {seg.allocations?.map((a, i) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', fontWeight: '800', background: '#F0FDF4', color: '#1B6B3A', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid #DCF2E4' }}>
                                                        {a.label}: {a.percentage}%
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '10px', background: '#F0FDF4', color: '#15803D', fontSize: '0.8rem', fontWeight: '800' }}>
                                                <CheckCircle2 size={12} /> ACTIVE
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={async () => { if(await customConfirm('Delete this strategy?')) deleteMutation.mutate(seg.id); }} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            </div>

            {/* Modal - Matching Billing UI */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '600px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#064E3B' }}>Create Strategy</h2>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={22} /></button>
                        </div>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (calculateTotalPercentage() !== 100) return alert('Total allocation must be exactly 100%');
                                createMutation.mutate(formData);
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Strategy Name</label>
                                <input required placeholder="e.g. Standard Revenue Split" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Description</label>
                                <input placeholder="Brief purpose..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Allocation Breakdown</label>
                                    <button type="button" onClick={addAllocationRow} style={{ background: '#F0FDF4', border: '1px solid #DCF2E4', color: '#1B6B3A', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>+ Add Row</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {formData.allocations.map((alloc, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                                            <input required placeholder="Label" value={alloc.label} onChange={e => handleAllocationChange(idx, 'label', e.target.value)} style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                            <input required type="number" placeholder="%" value={alloc.percentage} onChange={e => handleAllocationChange(idx, 'percentage', e.target.value)} style={{ width: '80px', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                            {formData.allocations.length > 1 && (
                                                <button type="button" onClick={() => removeAllocationRow(idx)} style={{ padding: '0.85rem', borderRadius: '14px', border: 'none', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1rem', borderRadius: '16px', background: calculateTotalPercentage() === 100 ? '#F0FDF4' : '#FEF2F2', color: calculateTotalPercentage() === 100 ? '#15803D' : '#B91C1C', fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>
                                Total Allocation: {calculateTotalPercentage()}% (Must be 100%)
                            </div>

                            <button type="submit" disabled={createMutation.isLoading || calculateTotalPercentage() !== 100} style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', opacity: calculateTotalPercentage() === 100 ? 1 : 0.5 }}>
                                {createMutation.isLoading ? <Loader2 className="animate-spin" /> : 'Finalize Strategy'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessSegregation;
