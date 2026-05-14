import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Wallet, 
    Plus, 
    Trash2, 
    Target, 
    CheckCircle2, 
    X, 
    Loader2,
    IndianRupee,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Lock
} from 'lucide-react';
import { goalWalletService } from '../services';
import '../App.css';

const BusinessPurposeWallet = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [addAmount, setAddAmount] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        description: ''
    });

    // Fetch all Purpose Wallets
    const { data: responseData = [], isLoading } = useQuery({
        queryKey: ['purpose-wallets'],
        queryFn: async () => {
            const res = await goalWalletService.getWallets();
            // Depending on pagination structure in goalWalletController: result.rows or res directly
            return Array.isArray(res) ? res : (res.rows || []);
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: goalWalletService.createWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purpose-wallets'] });
            closeCreateModal();
            alert("✨ New Purpose Wallet established successfully!");
        },
        onError: (err) => {
            alert(err?.response?.data?.message || "Failed to create new purpose wallet.");
        }
    });

    const addMoneyMutation = useMutation({
        mutationFn: ({ id, amount }) => goalWalletService.addMoney(id, parseFloat(amount)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purpose-wallets'] });
            closeAddMoneyModal();
            alert("💰 Funds allocated successfully!");
        },
        onError: (err) => {
            alert(err?.response?.data?.message || "Allocation failed.");
        }
    });

    const claimMutation = useMutation({
        mutationFn: goalWalletService.claimWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purpose-wallets'] });
            alert("🎉 Congratulations! Wallet target achieved and claimed successfully!");
        },
        onError: (err) => {
            alert(err?.response?.data?.message || "Could not claim. Ensure target threshold is reached.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: goalWalletService.deleteWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purpose-wallets'] });
        }
    });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setFormData({ name: '', target_amount: '', description: '' });
    };

    const openAddMoneyModal = (wallet) => {
        setSelectedWallet(wallet);
        setIsAddMoneyModalOpen(true);
    };

    const closeAddMoneyModal = () => {
        setIsAddMoneyModalOpen(false);
        setSelectedWallet(null);
        setAddAmount('');
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const amt = parseFloat(formData.target_amount);
        if (isNaN(amt) || amt <= 0) return alert("Please provide a valid target amount.");
        createMutation.mutate({ ...formData, target_amount: amt });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const amt = parseFloat(addAmount);
        if (isNaN(amt) || amt <= 0) return alert("Enter a valid allocation amount.");
        addMoneyMutation.mutate({ id: selectedWallet.id, amount: amt });
    };

    // Derived Statistics
    const wallets = Array.isArray(responseData) ? responseData : [];
    const activeWallets = wallets.filter(w => w.status !== 'completed').length;
    const totalAllocated = wallets.reduce((sum, w) => sum + (w.current_amount || 0), 0);
    const totalTarget = wallets.reduce((sum, w) => sum + (w.target_amount || 0), 0);
    const globalProgress = totalTarget > 0 ? Math.round((totalAllocated / totalTarget) * 100) : 0;

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Main Title Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '14px', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' 
                        }}>
                            <Target size={24} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em', margin: 0 }}>Segregation Wallets</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500', margin: 0 }}>Create target-based wallets to isolate and secure funds for specific business needs.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.9rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} strokeWidth={3} />
                    Setup Purpose Wallet
                </button>
            </div>

            {/* Statistics Overhead Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Target Wallets Active', value: activeWallets, icon: Target, color: '#059669', bg: '#ECFDF5' },
                    { label: 'Total Isolated Funds', value: `₹${totalAllocated.toLocaleString('en-IN')}`, icon: IndianRupee, color: '#10B981', bg: '#DCF2E4' },
                    { label: 'Goal Completion Target', value: `₹${totalTarget.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#2563EB', bg: '#E0F2FE' },
                    { label: 'Target Accomplishment', value: `${globalProgress}%`, icon: Sparkles, color: '#D97706', bg: '#FEF3C7' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'white', 
                        padding: '1.5rem', 
                        borderRadius: '20px', 
                        border: '1px solid #E2E8F0', 
                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.02)' 
                    }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic Masonry/Grid of Purpose Wallets */}
            {isLoading ? (
                <div style={{ padding: '8rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#059669' }}>
                    <Loader2 className="animate-spin" size={48} strokeWidth={2.5} />
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Polishing wallet interfaces...</p>
                </div>
            ) : wallets.length === 0 ? (
                <div style={{ 
                    background: 'white', 
                    borderRadius: '24px', 
                    border: '1px solid #E2E8F0', 
                    padding: '6rem 2rem', 
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '24px', 
                        background: '#F0FDF4', 
                        color: '#059669', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 1.5rem auto' 
                    }}>
                        <Wallet size={36} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1F2937', marginBottom: '0.5rem' }}>No Segregated Wallets</h3>
                    <p style={{ color: '#6B7280', maxWidth: '460px', margin: '0 auto 2rem auto', fontWeight: '500', lineHeight: 1.5 }}>
                        Setup isolated purpose-driven buckets! For example, reserve money sequentially to buy future equipment, specialized stationery, or tax deposits.
                    </p>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ 
                            padding: '0.85rem 1.75rem', borderRadius: '12px', border: 'none', 
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', 
                            fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(27,107,58,0.2)' 
                        }}
                    >
                        Create First Segregated Wallet
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
                    {wallets.map((wallet) => {
                        const isCompleted = wallet.status === 'completed';
                        const current = wallet.current_amount || 0;
                        const target = wallet.target_amount || 1;
                        const pct = Math.min(Math.round((current / target) * 100), 100);
                        const canClaim = current >= target && !isCompleted;

                        return (
                            <div key={wallet.id} style={{ 
                                background: 'white', 
                                borderRadius: '24px', 
                                border: '1px solid #E2E8F0', 
                                boxShadow: isCompleted ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.04)', 
                                opacity: isCompleted ? 0.85 : 1,
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Top Border accent */}
                                <div style={{ 
                                    height: '6px', 
                                    background: isCompleted ? '#64748B' : `linear-gradient(90deg, #1B6B3A ${pct}%, #E2E8F0 ${pct}%)` 
                                }} />

                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    {/* Header Row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', margin: '0 0 0.25rem 0' }}>{wallet.name}</h4>
                                            <span style={{ 
                                                fontSize: '0.7rem', 
                                                fontWeight: '800', 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.05em', 
                                                padding: '0.35rem 0.6rem', 
                                                borderRadius: '8px',
                                                background: isCompleted ? '#F1F5F9' : '#ECFDF5',
                                                color: isCompleted ? '#475569' : '#047857',
                                                display: 'inline-block'
                                            }}>
                                                {isCompleted ? '🎉 FULLY CLAIMED' : pct >= 100 ? '🎯 TARGET MET' : '🌱 GROWING'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => { if(window.confirm("Erase this segregation container forever? Accumulated funds tracking will resolve.")) deleteMutation.mutate(wallet.id); }}
                                            style={{ border: 'none', background: 'transparent', color: '#EF4444', opacity: 0.4, cursor: 'pointer', padding: '4px' }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = 0.4}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.5rem 0', flex: 1 }}>
                                        {wallet.description || 'No additional descriptions defined.'}
                                    </p>

                                    {/* Metrics breakdown */}
                                    <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700' }}>Saved Allocated</span>
                                            <span style={{ color: '#1E293B', fontSize: '0.85rem', fontWeight: '900' }}>₹{current.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700' }}>Target Ceiling</span>
                                            <span style={{ color: '#1E293B', fontSize: '0.85rem', fontWeight: '900' }}>₹{target.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Visual Progression */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '800' }}>Goal Status</span>
                                            <span style={{ color: '#059669', fontSize: '0.88rem', fontWeight: '950' }}>{pct}%</span>
                                        </div>
                                        <div style={{ height: '8px', borderRadius: '10px', background: '#E2E8F0', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${pct}%`, 
                                                background: isCompleted ? '#94A3B8' : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                                                borderRadius: '10px',
                                                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }} />
                                        </div>
                                    </div>

                                    {/* Interactive Controls */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <button
                                            disabled={isCompleted}
                                            onClick={() => openAddMoneyModal(wallet)}
                                            style={{ 
                                                padding: '0.85rem', 
                                                borderRadius: '12px', 
                                                border: '1px solid #D1FAE5', 
                                                background: isCompleted ? '#F1F5F9' : '#ECFDF5', 
                                                color: isCompleted ? '#94A3B8' : '#065F46', 
                                                fontWeight: '800', 
                                                fontSize: '0.88rem',
                                                cursor: isCompleted ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem'
                                            }}
                                        >
                                            <Plus size={16} strokeWidth={3} /> Add Cash
                                        </button>

                                        <button
                                            disabled={!canClaim}
                                            onClick={() => { if(window.confirm(`Extract ₹${current} accumulated for "${wallet.name}" into main reserves?`)) claimMutation.mutate(wallet.id); }}
                                            style={{ 
                                                padding: '0.85rem', 
                                                borderRadius: '12px', 
                                                background: canClaim 
                                                    ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' 
                                                    : (isCompleted ? '#F1F5F9' : '#F8FAFC'), 
                                                color: canClaim ? 'white' : '#94A3B8', 
                                                fontWeight: '850', 
                                                fontSize: '0.88rem',
                                                cursor: canClaim ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem',
                                                boxShadow: canClaim ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none',
                                                border: isCompleted ? 'none' : (canClaim ? 'none' : '1px solid #E2E8F0')
                                            }}

                                        >
                                            {isCompleted ? (
                                                <>
                                                    <CheckCircle2 size={16} color="#059669" /> Claimed
                                                </>
                                            ) : pct < 100 ? (
                                                <>
                                                    <Lock size={14} /> Locked
                                                </>
                                            ) : (
                                                <>
                                                    Claim Goal!
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* SETUP NEW WALLET MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '28px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Setup Target Wallet</h3>
                            <button onClick={closeCreateModal} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purpose / Item Name</label>
                                <input 
                                    required 
                                    placeholder="e.g. Office Printer, Future Stock, Buy a Pen" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600', color: '#1E293B' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Cap Amount (INR)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#0F172A' }}>₹</span>
                                    <input 
                                        required 
                                        type="number" 
                                        placeholder="5000" 
                                        value={formData.target_amount} 
                                        onChange={e => setFormData({...formData, target_amount: e.target.value})}
                                        style={{ width: '100%', padding: '0.9rem 1.1rem 0.9rem 2.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '800', fontSize: '1.1rem', color: '#0F172A' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Descriptive Notes</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Brief rationale for this segregation..." 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    style={{ width: '100%', padding: '0.9rem 1.1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', resize: 'none', fontFamily: 'inherit', color: '#475569' }}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={createMutation.isLoading}
                                style={{ 
                                    padding: '1.1rem', 
                                    borderRadius: '14px', 
                                    border: 'none', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    fontWeight: '850', 
                                    fontSize: '1rem', 
                                    marginTop: '0.5rem', 
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.2)'
                                }}
                            >
                                {createMutation.isLoading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Activate Isolated Container'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ALLOCATE CASH MODAL */}
            {isAddMoneyModalOpen && selectedWallet && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '28px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Fund Segregation</h3>
                            <button onClick={closeAddMoneyModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={18} /></button>
                        </div>

                        <div style={{ padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#DCF2E4', color: '#059669', padding: '8px', borderRadius: '8px' }}>
                                <Target size={18} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Targeting Wallet</span>
                                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1F2937' }}>{selectedWallet.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Allocation Value (INR)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#0F172A' }}>₹</span>
                                    <input 
                                        required 
                                        autoFocus
                                        type="number" 
                                        placeholder="100" 
                                        value={addAmount} 
                                        onChange={e => setAddAmount(e.target.value)}
                                        style={{ width: '100%', padding: '0.9rem 1.1rem 0.9rem 2.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '850', fontSize: '1.2rem', color: '#0F172A' }}
                                    />
                                </div>
                                <p style={{ color: '#64748B', fontSize: '0.75rem', margin: '0.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <AlertCircle size={12} /> Money is transferred from standard balances.
                                </p>
                            </div>

                            <button 
                                type="submit"
                                disabled={addMoneyMutation.isLoading}
                                style={{ 
                                    padding: '1.1rem', 
                                    borderRadius: '14px', 
                                    border: 'none', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    fontWeight: '850', 
                                    fontSize: '1rem', 
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {addMoneyMutation.isLoading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        Execute Push <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPurposeWallet;
