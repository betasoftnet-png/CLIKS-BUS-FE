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
    Lock,
    History,
    Search,
    MoreVertical,
    Edit2
} from 'lucide-react';
import { goalWalletService } from '../services';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import { useCurrency } from '../context';

const BusinessPurposeWallet = () => {
    const { currency, formatCurrency } = useCurrency();
    const CurrencyIcon = () => (
        <span style={{ fontSize: '1.25rem', fontWeight: '950', fontFamily: 'inherit' }}>
            {currency.symbol}
        </span>
    );
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
    const [error, setError] = useState('');

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyWalletId, setHistoryWalletId] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingWalletId, setEditingWalletId] = useState(null);

    React.useEffect(() => {
        const handleGlobalClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'in_progress' | 'target_met' | 'claimed'

    // Fetch Singular Wallet Details & History
    const { data: historyWalletRes, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['purpose-wallet-detail', historyWalletId],
        queryFn: () => goalWalletService.getWallet(historyWalletId),
        enabled: !!historyWalletId
    });
    const historyWallet = historyWalletRes?.data || historyWalletRes || {};

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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => goalWalletService.updateWallet(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purpose-wallets'] });
            closeCreateModal();
            alert("✨ Purpose Wallet updated successfully!");
        },
        onError: (err) => {
            alert(err?.response?.data?.message || "Failed to update purpose wallet.");
        }
    });

    const targetAmount = formData.target_amount;
    const editingWallet = useMemo(() => wallets.find(w => String(w.id) === String(editingWalletId)), [wallets, editingWalletId]);
    const savedAllocated = editingWallet ? parseFloat(editingWallet.current_amount ?? editingWallet.savedAllocated ?? editingWallet.savedAmount ?? 0) : 0;
    const isTargetLessThanSaved = Boolean(editingWalletId && targetAmount !== '' && Number(targetAmount) < savedAllocated);
    const isTargetAmountValid = Boolean(targetAmount && Number(targetAmount) > 0 && !isTargetLessThanSaved);
    const isSubmitDisabled = createMutation.isPending || updateMutation.isPending || !targetAmount || Number(targetAmount) <= 0 || isTargetLessThanSaved;

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingWalletId(null);
        setFormData({ name: '', target_amount: '', description: '' });
        setError('');
    };

    const isWalletClaimed = (wallet) => Boolean(
        wallet?.isClaimed || 
        wallet?.status === 'completed' || 
        wallet?.status === 'claimed' || 
        wallet?.status === 'FULLY CLAIMED' || 
        String(wallet?.status || '').toLowerCase() === 'completed' ||
        String(wallet?.status || '').toLowerCase() === 'claimed'
    );

    const openEditModal = (wallet) => {
        if (isWalletClaimed(wallet)) {
            return alert("Fully claimed wallets cannot be edited.");
        }
        setEditingWalletId(wallet.id);
        const roundedTarget = Math.round(parseFloat(wallet.target_amount || 0));
        setFormData({
            name: wallet.name,
            target_amount: roundedTarget > 0 ? roundedTarget.toString() : '',
            description: wallet.description || ''
        });
        setError('');
        setIsCreateModalOpen(true);
    };

    const openAddMoneyModal = (wallet) => {
        if (isWalletClaimed(wallet)) {
            return alert("Funds cannot be added to a fully claimed wallet.");
        }
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
        if (!targetAmount || Number(targetAmount) <= 0) {
            setError("Target amount must be strictly greater than 0");
            return; // Prevent API post completely
        }
        const amt = parseInt(targetAmount, 10);
        if (isNaN(amt) || amt <= 0) {
            setError("Target amount must be strictly greater than 0");
            return;
        }
        if (editingWalletId && amt < savedAllocated) {
            setError("The target amount cannot be less than the amount already saved.");
            return;
        }
        if (editingWalletId) {
            updateMutation.mutate({ id: editingWalletId, data: { ...formData, target_amount: amt } });
        } else {
            createMutation.mutate({ ...formData, target_amount: amt });
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!selectedWallet) return;
        const currentSaved = parseFloat(selectedWallet.current_amount || 0);
        const targetCeiling = parseFloat(selectedWallet.target_amount || 0);
        const remainingTarget = Math.max(0, targetCeiling - currentSaved);

        if (!addAmount || Number(addAmount) <= 0) return alert("Enter a valid deposit amount greater than 0.");
        let amt = parseFloat(addAmount);
        if (isNaN(amt) || amt <= 0) return alert("Enter a valid deposit amount greater than 0.");

        if (amt > remainingTarget) {
            amt = remainingTarget;
        }

        addMoneyMutation.mutate({ id: selectedWallet.id, amount: amt });
    };

    // Derived Statistics
    const wallets = Array.isArray(responseData) ? responseData : [];
    const activeWallets = wallets.filter(w => !isWalletClaimed(w)).length;
    const totalAllocated = wallets.reduce((sum, w) => sum + parseFloat(w.current_amount || 0), 0);
    const totalTarget = wallets.reduce((sum, w) => sum + parseFloat(w.target_amount || 0), 0);
    const globalProgress = totalTarget > 0 ? Math.round((totalAllocated / totalTarget) * 100) : 0;

    const categoryCounts = React.useMemo(() => {
        let inProgress = 0;
        let targetMet = 0;
        let claimed = 0;

        wallets.forEach(w => {
            const isClaimed = isWalletClaimed(w);
            const saved = parseFloat(w.current_amount || 0);
            const target = parseFloat(w.target_amount || 0);

            if (isClaimed) {
                claimed++;
            } else if (target > 0 && saved >= target) {
                targetMet++;
            } else {
                inProgress++;
            }
        });

        return {
            all: wallets.length,
            inProgress,
            targetMet,
            claimed
        };
    }, [wallets]);

    const filteredWallets = wallets.filter(wallet => {
        // 1. Category Filter
        const isClaimed = isWalletClaimed(wallet);
        const saved = parseFloat(wallet.current_amount || 0);
        const target = parseFloat(wallet.target_amount || 0);
        const isTargetMet = !isClaimed && target > 0 && saved >= target;
        const isInProgress = !isClaimed && (target === 0 || saved < target);

        if (categoryFilter === 'in_progress' && !isInProgress) return false;
        if (categoryFilter === 'target_met' && !isTargetMet) return false;
        if (categoryFilter === 'claimed' && !isClaimed) return false;

        // 2. Search Term Filter
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (wallet.name || '').toLowerCase().includes(term) ||
            (wallet.description || '').toLowerCase().includes(term)
        );
    });

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Main Title Bar */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
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
                        
                        <button 
                            onClick={() => {
                                setShowSearch(!showSearch);
                                if (showSearch) setSearchTerm('');
                            }}
                            style={{
                                background: showSearch ? '#DCF2E4' : 'transparent',
                                border: 'none',
                                color: '#064E3B',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                marginLeft: '0.5rem'
                            }}
                            title="Search Wallets"
                        >
                            <Search size={22} style={{ opacity: showSearch ? 1 : 0.6 }} />
                        </button>

                        {showSearch && (
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '1rem', animation: 'fadeIn 0.2s ease' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', color: '#64748B' }} />
                                <input 
                                    type="text"
                                    placeholder="Search wallets by name or rationale..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                    style={{
                                        padding: '0.6rem 1.25rem 0.6rem 2.25rem',
                                        borderRadius: '12px',
                                        border: '1px solid #BBF7D0',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        width: '260px',
                                        background: 'white',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                    }}
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#94A3B8',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            padding: '2px'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        )}
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

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Statistics Overhead Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Target Wallets Active', value: activeWallets, icon: Target, color: '#059669', bg: '#ECFDF5' },
                    { label: 'Total Isolated Funds', value: formatCurrency(totalAllocated), icon: CurrencyIcon, color: '#10B981', bg: '#DCF2E4' },
                    { label: 'Goal Completion Target', value: formatCurrency(totalTarget), icon: TrendingUp, color: '#2563EB', bg: '#E0F2FE' },
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

            {/* Container Category Filter Pill Navigation Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {[
                    { key: 'all', label: `All Containers [${categoryCounts.all}]` },
                    { key: 'in_progress', label: `In Progress [${categoryCounts.inProgress}]` },
                    { key: 'target_met', label: `Target Met [${categoryCounts.targetMet}]` },
                    { key: 'claimed', label: `Claimed [${categoryCounts.claimed}]` }
                ].map(pill => {
                    const isActive = categoryFilter === pill.key;
                    return (
                        <button
                            key={pill.key}
                            type="button"
                            onClick={() => setCategoryFilter(pill.key)}
                            className={`rounded-full px-4 py-2 font-bold transition-all duration-150 ${
                                isActive
                                    ? 'bg-[#0d3829] text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                            style={{
                                padding: '0.5rem 1.15rem',
                                borderRadius: '9999px',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                border: isActive ? 'none' : '1px solid #E2E8F0',
                                background: isActive ? '#0d3829' : '#FFFFFF',
                                color: isActive ? '#FFFFFF' : '#374151',
                                cursor: 'pointer',
                                boxShadow: isActive ? '0 4px 12px rgba(13, 56, 41, 0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {pill.label}
                        </button>
                    );
                })}
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
                    <p style={{ color: '#6B7280', maxWidth: '460px', margin: '0 auto', fontWeight: '500', lineHeight: 1.5 }}>
                        Setup isolated purpose-driven buckets! For example, reserve money sequentially to buy future equipment, specialized stationery, or tax deposits.
                    </p>
                </div>
            ) : filteredWallets.length === 0 ? (
                <div style={{ 
                    background: 'white', 
                    borderRadius: '24px', 
                    border: '1px solid #E2E8F0', 
                    padding: '5rem 2rem', 
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '20px', 
                        background: '#F1F5F9', 
                        color: '#94A3B8', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 1.25rem auto' 
                    }}>
                        <Search size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#1F2937', marginBottom: '0.5rem' }}>No Matching Wallets</h3>
                    <p style={{ color: '#6B7280', maxWidth: '380px', margin: '0 auto', fontWeight: '500', fontSize: '0.9rem' }}>
                        We couldn't find any segregated wallets matching "{searchTerm}". Check the spelling or clear the filter.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.75rem' }}>
                    {filteredWallets.map((wallet) => {
                        const isClaimed = Boolean(
                            wallet.isClaimed || 
                            wallet.status === 'completed' || 
                            wallet.status === 'claimed' || 
                            wallet.status === 'FULLY CLAIMED' || 
                            String(wallet.status || '').toLowerCase() === 'completed' ||
                            String(wallet.status || '').toLowerCase() === 'claimed'
                        );
                        const isCompleted = isClaimed;
                        const allocated = parseFloat(wallet.current_amount || 0);
                        const targetCeiling = parseFloat(wallet.target_amount || 0);
                        const percent = targetCeiling > 0 ? Math.round((allocated / targetCeiling) * 100) : 0;
                        const pct = Math.min(percent, 100);
                        const current = allocated;
                        const target = targetCeiling;
                        const canClaim = targetCeiling > 0 && current >= target && !isCompleted;

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
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => { setHistoryWalletId(wallet.id); setIsHistoryModalOpen(true); }}
                                                style={{ border: 'none', background: 'transparent', color: '#059669', opacity: 0.6, cursor: 'pointer', padding: '4px', transition: 'opacity 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                                onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                                                title="View Allocation Log"
                                            >
                                                <History size={17} />
                                            </button>
                                            
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === wallet.id ? null : wallet.id);
                                                    }}
                                                    style={{ border: 'none', background: 'transparent', color: '#64748B', opacity: 0.6, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                                                    title="More actions"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                
                                                {activeMenuId === wallet.id && (
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
                                                        minWidth: '130px',
                                                        textAlign: 'left',
                                                        marginTop: '4px'
                                                    }}>
                                                        {!isClaimed ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openEditModal(wallet);
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
                                                                    fontSize: '0.82rem',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '8px',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.background = '#F1F5F9'}
                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <Edit2 size={13} style={{ color: '#059669' }} />
                                                                Edit Wallet
                                                            </button>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="opacity-50 cursor-not-allowed pointer-events-none"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    width: '100%',
                                                                    padding: '8px 12px',
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    color: '#94A3B8',
                                                                    fontSize: '0.82rem',
                                                                    fontWeight: '700',
                                                                    cursor: 'not-allowed',
                                                                    borderRadius: '8px',
                                                                    opacity: 0.5,
                                                                    pointerEvents: 'none'
                                                                }}
                                                                title="Claimed wallets cannot be edited"
                                                            >
                                                                <Edit2 size={13} style={{ color: '#94A3B8' }} />
                                                                Edit (Locked)
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                                if(await customConfirm("Erase this segregation container forever? Accumulated funds tracking will resolve.")) {
                                                                    deleteMutation.mutate(wallet.id);
                                                                }
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
                                                                fontSize: '0.82rem',
                                                                fontWeight: '700',
                                                                cursor: 'pointer',
                                                                borderRadius: '8px',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
                                                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                        >
                                                            <Trash2 size={13} style={{ color: '#EF4444' }} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.5rem 0', flex: 1 }}>
                                        {wallet.description || 'No additional descriptions defined.'}
                                    </p>

                                    {/* Metrics breakdown */}
                                    <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700' }}>Saved Allocated</span>
                                            <span style={{ color: '#1E293B', fontSize: '0.85rem', fontWeight: '900' }}>{formatCurrency(current)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700' }}>Target Ceiling</span>
                                            <span style={{ color: '#1E293B', fontSize: '0.85rem', fontWeight: '900' }}>{formatCurrency(target)}</span>
                                        </div>
                                    </div>

                                    {/* Visual Progression */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#334155', fontSize: '0.82rem', fontWeight: '800' }}>Goal Status</span>
                                            <span style={{ color: '#059669', fontSize: '0.88rem', fontWeight: '950' }}>{percent}%</span>
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
                                        {canClaim ? (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (await customConfirm(`Extract ${formatCurrency(current)} accumulated for "${wallet.name}" into main reserves?`)) {
                                                        claimMutation.mutate(wallet.id);
                                                    }
                                                }}
                                                style={{
                                                    gridColumn: 'span 2',
                                                    padding: '0.85rem',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                                                    color: 'white',
                                                    fontWeight: '850',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                🏆 Claim Goal Target
                                            </button>
                                        ) : isClaimed ? (
                                            <div
                                                style={{
                                                    gridColumn: 'span 2',
                                                    padding: '0.85rem',
                                                    borderRadius: '12px',
                                                    background: '#F1F5F9',
                                                    color: '#059669',
                                                    fontWeight: '850',
                                                    fontSize: '0.88rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.4rem',
                                                    border: '1px solid #E2E8F0'
                                                }}
                                            >
                                                <CheckCircle2 size={16} color="#059669" /> Claimed
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openAddMoneyModal(wallet)}
                                                    style={{
                                                        padding: '0.85rem',
                                                        borderRadius: '12px',
                                                        border: '1px solid #D1FAE5',
                                                        background: '#ECFDF5',
                                                        color: '#065F46',
                                                        fontWeight: '800',
                                                        fontSize: '0.88rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4rem'
                                                    }}
                                                >
                                                    <Plus size={16} strokeWidth={3} /> Add Cash
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={true}
                                                    style={{
                                                        padding: '0.85rem',
                                                        borderRadius: '12px',
                                                        background: '#F8FAFC',
                                                        color: '#94A3B8',
                                                        fontWeight: '850',
                                                        fontSize: '0.88rem',
                                                        cursor: 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4rem',
                                                        border: '1px solid #E2E8F0'
                                                    }}
                                                >
                                                    <Lock size={14} /> Locked
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>

            {/* SETUP NEW WALLET MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '28px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>{editingWalletId ? 'Edit Target Wallet' : 'Setup Target Wallet'}</h3>
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
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Cap Amount ({currency.code})</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#0F172A' }}>{currency.symbol}</span>
                                    <input 
                                        required 
                                        type="number" 
                                        min={editingWalletId ? savedAllocated : 1}
                                        step="1"
                                        placeholder="0" 
                                        value={formData.target_amount} 
                                        onKeyDown={(e) => { 
                                            if (e.key === '-' || e.key === '.' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                                e.preventDefault(); 
                                            }
                                        }}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/[^0-9]/g, '');
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '') || '0';
                                            }
                                            setFormData({ ...formData, target_amount: val });
                                            const numVal = Number(val);
                                            if (editingWalletId && val !== '' && numVal < savedAllocated) {
                                                setError('The target amount cannot be less than the amount already saved.');
                                            } else if (val && numVal > 0) {
                                                setError('');
                                            } else if (val !== '') {
                                                setError('Target amount must be greater than 0');
                                            } else {
                                                setError('');
                                            }
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.9rem 1.1rem 0.9rem 2.25rem', 
                                            borderRadius: '14px', 
                                            border: (isTargetLessThanSaved || (targetAmount !== '' && (!targetAmount || Number(targetAmount) <= 0)) || error) ? '1px solid #EF4444' : '1px solid #E2E8F0', 
                                            outline: 'none', 
                                            fontWeight: '800', 
                                            fontSize: '1.1rem', 
                                            color: '#0F172A' 
                                        }}
                                    />
                                </div>
                                {((targetAmount !== '' && Number(targetAmount) <= 0) || isTargetLessThanSaved || error) && (
                                    <div 
                                        className="validation-alert"
                                        style={{ 
                                            color: '#EF4444', 
                                            background: '#FEF2F2',
                                            border: '1px solid #FEE2E2',
                                            borderRadius: '10px',
                                            padding: '0.5rem 0.75rem',
                                            fontSize: '0.8rem', 
                                            marginTop: '0.5rem', 
                                            fontWeight: 600, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.4rem' 
                                        }}
                                    >
                                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                        <span>
                                            {isTargetLessThanSaved 
                                                ? "The target amount cannot be less than the amount already saved." 
                                                : (error || "Target amount must be greater than 0")}
                                        </span>
                                    </div>
                                )}
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
                                disabled={isSubmitDisabled}
                                className={isSubmitDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                                style={{ 
                                    padding: '1.1rem', 
                                    borderRadius: '14px', 
                                    border: 'none', 
                                    background: isSubmitDisabled ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    fontWeight: '850', 
                                    fontSize: '1rem', 
                                    marginTop: '0.5rem', 
                                    cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                                    boxShadow: isSubmitDisabled ? 'none' : '0 8px 20px rgba(27, 107, 58, 0.2)',
                                    opacity: isSubmitDisabled ? 0.5 : 1,
                                    pointerEvents: isSubmitDisabled ? 'none' : 'auto'
                                }}
                            >
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : (editingWalletId ? 'Save Changes' : 'Activate Isolated Container')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ALLOCATE CASH MODAL */}
            {isAddMoneyModalOpen && selectedWallet && (() => {
                const currentSaved = parseFloat(selectedWallet.current_amount || 0);
                const targetCeiling = parseFloat(selectedWallet.target_amount || 0);
                const remainingTarget = Math.max(0, targetCeiling - currentSaved);
                const enteredAmount = parseFloat(addAmount) || 0;
                const projectedBalance = currentSaved + enteredAmount;

                const handleAddAmountChange = (e) => {
                    let raw = e.target.value.replace(/[^0-9.]/g, '');
                    let num = parseFloat(raw) || 0;
                    if (num > remainingTarget) {
                        setAddAmount(String(remainingTarget));
                    } else {
                        setAddAmount(raw);
                    }
                };

                const handleQuickIncrement = (inc) => {
                    const currentEntered = parseFloat(addAmount) || 0;
                    let nextVal = currentEntered + inc;
                    if (nextVal > remainingTarget) {
                        nextVal = remainingTarget;
                    }
                    setAddAmount(String(nextVal));
                };

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '28px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                            {/* Modal Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#DCF2E4', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Plus size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                                            Add Cash to {selectedWallet.name}
                                        </h3>
                                        <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                                            Saved: ₹{currentSaved.toLocaleString('en-IN')} of ₹{targetCeiling.toLocaleString('en-IN')} • Remaining: <strong style={{ color: '#DC2626' }}>₹{remainingTarget.toLocaleString('en-IN')}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closeAddMoneyModal} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Amount Input with Badge */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        ENTER DEPOSIT AMOUNT (INR)
                                    </label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: '#F1F5F9',
                                            color: '#334155',
                                            border: '1px solid #CBD5E1',
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            zIndex: 2
                                        }}>
                                            ₹ INR
                                        </span>
                                        <input
                                            required
                                            autoFocus
                                            type="number"
                                            placeholder="0"
                                            min="1"
                                            max={remainingTarget}
                                            step="any"
                                            value={addAmount}
                                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }}
                                            onChange={handleAddAmountChange}
                                            style={{
                                                width: '100%',
                                                padding: '0.85rem 1.1rem 0.85rem 4.5rem',
                                                borderRadius: '14px',
                                                border: '1.5px solid #CBD5E1',
                                                outline: 'none',
                                                fontWeight: '850',
                                                fontSize: '1.2rem',
                                                color: '#0F172A',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    {/* Quick Action Chips Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setAddAmount(String(remainingTarget))}
                                            style={{
                                                background: '#FEF2F2',
                                                color: '#DC2626',
                                                border: '1px solid #FECACA',
                                                padding: '0.3rem 0.65rem',
                                                borderRadius: '8px',
                                                fontSize: '0.72rem',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseOver={(ev) => ev.currentTarget.style.background = '#FEE2E2'}
                                            onMouseOut={(ev) => ev.currentTarget.style.background = '#FEF2F2'}
                                        >
                                            Fill Remaining (₹{remainingTarget.toLocaleString('en-IN')})
                                        </button>

                                        {[1000, 5000, 10000, 25000].map(inc => (
                                            <button
                                                key={inc}
                                                type="button"
                                                onClick={() => handleQuickIncrement(inc)}
                                                style={{
                                                    background: '#F0FDF4',
                                                    color: '#15803D',
                                                    border: '1px solid #BBF7D0',
                                                    padding: '0.3rem 0.65rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '800',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                }}
                                                onMouseOver={(ev) => ev.currentTarget.style.background = '#DCFCE7'}
                                                onMouseOut={(ev) => ev.currentTarget.style.background = '#F0FDF4'}
                                            >
                                                +₹{inc.toLocaleString('en-IN')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Projected Balance Box */}
                                <div style={{
                                    background: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '14px', 
                                    padding: '0.85rem 1.1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#64748B' }}>
                                        Projected Balance After Deposit:
                                    </span>
                                    <span style={{ fontSize: '1.05rem', fontWeight: '950', color: '#064E3B' }}>
                                        ₹{projectedBalance.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Bottom Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={closeAddMoneyModal}
                                        style={{
                                            padding: '0.75rem 1.4rem',
                                            borderRadius: '12px',
                                            border: '1px solid #CBD5E1',
                                            background: '#FFFFFF',
                                            color: '#334155',
                                            fontWeight: '800',
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={addMoneyMutation.isPending || !enteredAmount || enteredAmount <= 0}
                                        style={{
                                            padding: '0.75rem 1.6rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: (addMoneyMutation.isPending || !enteredAmount || enteredAmount <= 0) ? '#94A3B8' : '#0d3829',
                                            color: '#FFFFFF',
                                            fontWeight: '800',
                                            fontSize: '0.88rem',
                                            cursor: (addMoneyMutation.isPending || !enteredAmount || enteredAmount <= 0) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: (addMoneyMutation.isPending || !enteredAmount || enteredAmount <= 0) ? 'none' : '0 4px 14px rgba(13, 56, 41, 0.3)',
                                            opacity: (addMoneyMutation.isPending || !enteredAmount || enteredAmount <= 0) ? 0.6 : 1,
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {addMoneyMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (
                                            <>
                                                ✓ Deposit Cash
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* ALLOCATION HISTORY MODAL */}
            {isHistoryModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '28px', padding: '2.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064E3B' }}>
                                <History size={20} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>Allocation Ledger</h3>
                            </div>
                            <button onClick={() => { setIsHistoryModalOpen(false); setHistoryWalletId(null); }} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {isHistoryLoading ? (
                            <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#059669' }}>
                                <Loader2 className="animate-spin" size={32} strokeWidth={2.5} />
                                <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Compiling transfer logs...</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '1.75rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.25rem' }}>Selected Wallet</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>{historyWallet.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Total Isolated</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#059669' }}>{formatCurrency(parseFloat(historyWallet.current_amount || 0))}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>Allocation History</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {!historyWallet.transactions || historyWallet.transactions.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', border: '2px dashed #F1F5F9', borderRadius: '14px' }}>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>No money transfers recorded yet.</p>
                                            </div>
                                        ) : (
                                            historyWallet.transactions.map((tx, idx) => (
                                                <div key={tx.id || idx} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center', 
                                                    padding: '0.85rem 1rem', 
                                                    background: 'white', 
                                                    border: '1px solid #E2E8F0', 
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em', color: tx.type === 'debit' ? '#DC2626' : '#059669' }}>
                                                            {tx.type === 'debit' ? '🔻 OUT / DEBIT' : '🔹 IN / CREDIT'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                                                            {tx.created_at ? new Date(tx.created_at).toLocaleString(undefined, {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            }) : 'Record Date missing'}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: '900', color: tx.type === 'debit' ? '#DC2626' : '#0F172A' }}>
                                                        {tx.type === 'debit' ? '-' : '+'} {formatCurrency(parseFloat(tx.amount || 0))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPurposeWallet;
