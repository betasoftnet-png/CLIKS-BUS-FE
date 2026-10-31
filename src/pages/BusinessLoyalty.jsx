import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Award,
    Coins,
    Crown,
    Users,
    Receipt,
    Layers,
    Settings,
    CheckCircle2,
    Plus,
    Minus,
    Search,
    RefreshCw,
    Sparkles,
    Sliders,
    TrendingUp,
    Percent,
    Gift,
    Calendar,
    ArrowUpRight,
    Filter,
    AlertCircle,
    Info,
    HelpCircle
} from 'lucide-react';
import { loyaltyService } from '../services/loyaltyService';

const DEFAULT_TIERS = [
    {
        id: 'bronze',
        name: 'Bronze Club',
        min_spend: 0,
        multiplier: 1.0,
        color: '#CD7F32',
        badge_bg: '#FEF3C7',
        badge_text: '#92400E',
        perks: 'Standard earning rate (1x), Birthday bonus'
    },
    {
        id: 'silver',
        name: 'Silver Star',
        min_spend: 5000,
        multiplier: 1.25,
        color: '#94A3B8',
        badge_bg: '#F1F5F9',
        badge_text: '#334155',
        perks: '1.25x Points multiplier + Early access to seasonal sales'
    },
    {
        id: 'gold',
        name: 'Gold Premier',
        min_spend: 15000,
        multiplier: 1.5,
        color: '#EAB308',
        badge_bg: '#FEF9C3',
        badge_text: '#854D0E',
        perks: '1.5x Points multiplier + Priority express service'
    },
    {
        id: 'platinum',
        name: 'Platinum Elite',
        min_spend: 50000,
        multiplier: 2.0,
        color: '#6366F1',
        badge_bg: '#EEF2FF',
        badge_text: '#3730A3',
        perks: '2x Points on all purchases + Dedicated VIP manager'
    }
];

export default function BusinessLoyalty() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('earning');
    const [searchCustomer, setSearchCustomer] = useState('');
    const [selectedTierFilter, setSelectedTierFilter] = useState('all');
    const [banner, setBanner] = useState(null);

    // Modal state for manual point adjustment
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [adjustForm, setAdjustForm] = useState({
        action: 'CREDIT',
        points: '',
        reason: 'Customer goodwill / appreciation',
        notes: ''
    });

    // Fetch Program Settings
    const { data: settingsData, isLoading: loadingSettings } = useQuery({
        queryKey: ['loyalty-program-settings'],
        queryFn: loyaltyService.getProgramSettings
    });

    // Fetch Program Statistics
    const { data: statsData, isLoading: loadingStats, refetch: refetchStats } = useQuery({
        queryKey: ['loyalty-stats'],
        queryFn: loyaltyService.getLoyaltyStats
    });

    // Fetch Customers
    const { data: customersData, isLoading: loadingCustomers, refetch: refetchCustomers } = useQuery({
        queryKey: ['loyalty-customers', searchCustomer, selectedTierFilter],
        queryFn: () => loyaltyService.getLoyaltyCustomers({ search: searchCustomer, tier: selectedTierFilter })
    });

    // Fetch Transactions
    const { data: transactionsData, isLoading: loadingTransactions, refetch: refetchTransactions } = useQuery({
        queryKey: ['loyalty-transactions'],
        queryFn: () => loyaltyService.getLoyaltyTransactions({ limit: 50 })
    });

    // Local form state initialized from fetched settings
    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        if (settingsData && !formData) {
            setFormData({
                loyaltyEnabled: settingsData.loyaltyEnabled ?? true,
                customProgramName: settingsData.customProgramName || 'Cliks VIP Rewards',
                loyaltyRsPer1Point: settingsData.loyaltyRsPer1Point ?? 100,
                pointValueCurrency: settingsData.pointValueCurrency ?? 1.0,
                minOrderSpend: settingsData.minOrderSpend ?? 0,
                minPointsToRedeem: settingsData.minPointsToRedeem ?? 10,
                loyaltyMaxClaimPercent: settingsData.loyaltyMaxClaimPercent ?? 50,
                maxPointsPerOrder: settingsData.maxPointsPerOrder ?? 5000,
                pointsExpiryMonths: settingsData.pointsExpiryMonths ?? 0,
                welcomeBonusPoints: settingsData.welcomeBonusPoints ?? 50,
                birthdayBonusPoints: settingsData.birthdayBonusPoints ?? 100,
                enableTiers: settingsData.enableTiers ?? true,
                tierConfig: settingsData.tierConfig || DEFAULT_TIERS,
                excludeTaxFromPoints: settingsData.excludeTaxFromPoints ?? true,
                roundDownPoints: settingsData.roundDownPoints ?? true,
                printShowLoyalty: settingsData.printShowLoyalty ?? false,
                printShowPointsEarned: settingsData.printShowPointsEarned ?? true,
                smsNotificationsEnabled: settingsData.smsNotificationsEnabled ?? false
            });
        }
    }, [settingsData, formData]);

    // Save Settings Mutation
    const saveMutation = useMutation({
        mutationFn: loyaltyService.updateProgramSettings,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-program-settings'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-stats'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-customers'] });
            showBanner('Loyalty program settings saved successfully!', 'success');
        },
        onError: (err) => {
            showBanner(err.response?.data?.message || 'Failed to save loyalty settings', 'error');
        }
    });

    // Adjust Points Mutation
    const adjustMutation = useMutation({
        mutationFn: ({ customerId, payload }) => loyaltyService.adjustCustomerPoints(customerId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-customers'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-stats'] });
            setAdjustModalOpen(false);
            showBanner(`Updated ${selectedCustomer?.name || 'Customer'}'s points to ${data?.data?.newBalance ?? 'new balance'}!`, 'success');
        },
        onError: (err) => {
            showBanner(err.response?.data?.message || 'Failed to adjust points', 'error');
        }
    });

    const showBanner = (text, type = 'info') => {
        setBanner({ text, type });
        setTimeout(() => setBanner(null), 4000);
    };

    const handleSave = () => {
        if (!formData) return;
        saveMutation.mutate(formData);
    };

    const handleResetDefaults = () => {
        if (window.confirm('Reset all loyalty rules and membership tiers back to system defaults?')) {
            setFormData({
                loyaltyEnabled: true,
                customProgramName: 'Cliks VIP Rewards',
                loyaltyRsPer1Point: 100,
                pointValueCurrency: 1.0,
                minOrderSpend: 0,
                minPointsToRedeem: 10,
                loyaltyMaxClaimPercent: 50,
                maxPointsPerOrder: 5000,
                pointsExpiryMonths: 0,
                welcomeBonusPoints: 50,
                birthdayBonusPoints: 100,
                enableTiers: true,
                tierConfig: DEFAULT_TIERS,
                excludeTaxFromPoints: true,
                roundDownPoints: true,
                printShowLoyalty: true,
                printShowPointsEarned: true,
                smsNotificationsEnabled: false
            });
            showBanner('Reset to default rules. Click "Save Changes" to apply.', 'info');
        }
    };

    const openAdjustModal = (customer) => {
        setSelectedCustomer(customer);
        setAdjustForm({
            action: 'CREDIT',
            points: '',
            reason: 'Customer goodwill / appreciation',
            notes: ''
        });
        setAdjustModalOpen(true);
    };

    const handleAdjustSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        const pts = parseInt(adjustForm.points, 10);
        if (!pts || pts <= 0) {
            alert('Please enter a valid positive points quantity.');
            return;
        }

        adjustMutation.mutate({
            customerId: selectedCustomer.id,
            payload: {
                action: adjustForm.action,
                points: pts,
                reason: adjustForm.reason,
                notes: adjustForm.notes
            }
        });
    };

    // Quick calculation helper for preview
    const sampleSpend = 500;
    const earnedPreview = useMemo(() => {
        if (!formData || !formData.loyaltyRsPer1Point) return 0;
        const pts = (sampleSpend / formData.loyaltyRsPer1Point);
        return formData.roundDownPoints ? Math.floor(pts) : Math.round(pts * 10) / 10;
    }, [formData]);

    const samplePointsRedeem = 100;
    const redeemPreview = useMemo(() => {
        if (!formData) return 0;
        return (samplePointsRedeem * (formData.pointValueCurrency || 1.0)).toFixed(2);
    }, [formData]);

    if (!formData) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#1B6B3A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '0.75rem', fontWeight: '600' }}>Loading Loyalty & Rewards Engine...</p>
            </div>
        );
    }

    const customersList = customersData?.customers || [];
    const transactionsList = Array.isArray(transactionsData) ? transactionsData : (transactionsData?.data || []);

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
            {/* Notification Banner */}
            {banner && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    background: banner.type === 'success' ? '#1B6B3A' : banner.type === 'error' ? '#EF4444' : '#0F172A',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                }}>
                    {banner.type === 'success' && <CheckCircle2 size={16} />}
                    {banner.type === 'error' && <AlertCircle size={16} />}
                    {banner.type === 'info' && <Info size={16} />}
                    <span>{banner.text}</span>
                </div>
            )}

            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #0F3D20 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 16px rgba(27, 107, 58, 0.25)'
                    }}>
                        <Award size={28} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                                Loyalty Points & Rewards
                            </h1>
                            <span style={{
                                padding: '0.2rem 0.65rem',
                                borderRadius: '20px',
                                fontSize: '0.74rem',
                                fontWeight: '850',
                                background: formData.loyaltyEnabled ? '#DCFCE7' : '#F1F5F9',
                                color: formData.loyaltyEnabled ? '#15803D' : '#64748B',
                                border: formData.loyaltyEnabled ? '1px solid #86EFAC' : '1px solid #CBD5E1'
                            }}>
                                ● {formData.loyaltyEnabled ? 'Program Active' : 'Program Paused'}
                            </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', color: '#64748B', fontSize: '0.88rem', fontWeight: '500' }}>
                            Configure points earning rules, redemption values, VIP membership tiers, and manage customer reward balances.
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        style={{
                            padding: '0.65rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            background: '#FFFFFF',
                            color: '#475569',
                            fontWeight: '750',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={14} /> Reset Defaults
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        style={{
                            padding: '0.65rem 1.4rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#1B6B3A',
                            color: '#FFFFFF',
                            fontWeight: '850',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)'
                        }}
                    >
                        <CheckCircle2 size={16} />
                        {saveMutation.isPending ? 'Saving Rules...' : 'Save All Customizations'}
                    </button>
                </div>
            </div>

            {/* Program Master Switch Banner */}
            <div style={{
                background: formData.loyaltyEnabled ? '#F0FDF4' : '#FFFBEB',
                border: formData.loyaltyEnabled ? '1px solid #BBF7D0' : '1px solid #FDE68A',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: formData.loyaltyEnabled ? '#DCFCE7' : '#FEF3C7',
                        color: formData.loyaltyEnabled ? '#16A34A' : '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <span style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', display: 'block' }}>
                            Customer Loyalty Program: <b>{formData.customProgramName}</b>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {formData.loyaltyEnabled 
                                ? 'Points are actively earned on POS/Sales invoices and redeemable by customers.'
                                : 'Loyalty program is temporarily paused. Customers will not earn or redeem points.'}
                        </span>
                    </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                        {formData.loyaltyEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <input
                        type="checkbox"
                        checked={formData.loyaltyEnabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, loyaltyEnabled: e.target.checked }))}
                        style={{ width: '20px', height: '20px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                    />
                </label>
            </div>

            {/* KPI Performance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: '750' }}>
                        <span>ACTIVE MEMBERS</span>
                        <Users size={16} color="#1B6B3A" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                        {loadingStats ? '...' : (statsData?.totalMembers ?? 0)}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        out of {statsData?.totalCustomers ?? 0} registered customers
                    </span>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: '750' }}>
                        <span>TOTAL POINTS ISSUED</span>
                        <Coins size={16} color="#10B981" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                        {loadingStats ? '...' : (statsData?.totalPointsIssued ?? 0).toLocaleString()} pts
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#16A34A', fontWeight: '700' }}>
                        Lifetime rewards granted
                    </span>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: '750' }}>
                        <span>TOTAL POINTS REDEEMED</span>
                        <Receipt size={16} color="#F59E0B" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                        {loadingStats ? '...' : (statsData?.totalPointsRedeemed ?? 0).toLocaleString()} pts
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Claimed on sales invoices
                    </span>
                </div>

                <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: '750' }}>
                        <span>OUTSTANDING POINTS LIABILITY</span>
                        <Crown size={16} color="#6366F1" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0F172A', marginTop: '0.35rem' }}>
                        ₹{loadingStats ? '...' : (statsData?.liabilityValue ?? 0).toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {(statsData?.outstandingPoints ?? 0).toLocaleString()} active points held
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {[
                    { id: 'earning', label: 'Earning Rules', icon: Coins },
                    { id: 'redemption', label: 'Redemption & Value', icon: Receipt },
                    { id: 'tiers', label: 'VIP Membership Tiers', icon: Crown },
                    { id: 'customers', label: `Customer Balances (${customersList.length})`, icon: Users },
                    { id: 'history', label: 'Transaction Audit Trail', icon: Layers },
                    { id: 'receipt', label: 'Receipt & Display', icon: Settings }
                ].map(tab => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.2rem',
                                borderRadius: '10px 10px 0 0',
                                border: 'none',
                                borderBottom: isActive ? '3px solid #1B6B3A' : '3px solid transparent',
                                background: isActive ? '#FFFFFF' : 'transparent',
                                color: isActive ? '#1B6B3A' : '#64748B',
                                fontWeight: isActive ? '850' : '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <IconComp size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: EARNING RULES */}
            {activeTab === 'earning' && (
                <div style={{ maxWidth: '680px' }}>
                    {/* Program Branding & Core Ratio */}
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Coins size={18} color="#1B6B3A" /> Base Points Earning Rate
                        </h3>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Loyalty Program Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.customProgramName}
                                onChange={(e) => setFormData(prev => ({ ...prev, customProgramName: e.target.value }))}
                                placeholder="e.g. Cliks VIP Rewards, Gold Club"
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Amount to Spend to Earn 1 Point (₹)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: '800', color: '#64748B' }}>₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.loyaltyRsPer1Point}
                                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyRsPer1Point: Math.max(1, Number(e.target.value)) }))}
                                    style={{ width: '140px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '800', outline: 'none' }}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
                                    spent = <b>1 Loyalty Point</b>
                                </span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                e.g. Setting ₹100 means a customer spending ₹500 earns 5 points.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Minimum Invoice Spend to Qualify (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.minOrderSpend}
                                onChange={(e) => setFormData(prev => ({ ...prev, minOrderSpend: Math.max(0, Number(e.target.value)) }))}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Orders below this amount won't generate points. Set to 0 to reward all orders.
                            </p>
                        </div>

                        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #F1F5F9', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '750', color: '#334155' }}>
                                    Round down points (No decimals)
                                </span>
                                <input
                                    type="checkbox"
                                    checked={formData.roundDownPoints}
                                    onChange={(e) => setFormData(prev => ({ ...prev, roundDownPoints: e.target.checked }))}
                                    style={{ width: '18px', height: '18px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                                />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '0.2rem' }}>
                                e.g. Spending ₹150 with a ₹100 rate awards 1 point instead of 1.5.
                            </span>
                        </div>

                        {/* Live Simulator Preview */}
                        <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '1rem', border: '1px solid #DCFCE7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' }}>
                                <Sparkles size={14} /> Live Calculation Preview
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0.4rem 0 0', fontWeight: '600' }}>
                                On a sample invoice of <b>₹{sampleSpend}</b>, the customer will earn:
                            </p>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1B6B3A', marginTop: '0.25rem' }}>
                                {earnedPreview} Points
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: REDEMPTION & VALUE */}
            {activeTab === 'redemption' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {/* Points Conversion & Cap */}
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Receipt size={18} color="#1B6B3A" /> Point Monetary Valuation & Limits
                        </h3>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Value of 1 Loyalty Point (₹)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: '800', color: '#64748B' }}>1 pt = ₹</span>
                                <input
                                    type="number"
                                    step="0.05"
                                    min="0.01"
                                    value={formData.pointValueCurrency}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pointValueCurrency: Math.max(0.01, Number(e.target.value)) }))}
                                    style={{ width: '120px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '800', outline: 'none' }}
                                />
                                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>discount</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Set to 1.00 for 1 point = ₹1, or 0.50 for 1 point = 50 paise.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Minimum Points Required Before Redeeming
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.minPointsToRedeem}
                                onChange={(e) => setFormData(prev => ({ ...prev, minPointsToRedeem: Math.max(1, Number(e.target.value)) }))}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Customer must accumulate at least this balance before redemption is unlocked.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Max Claim Percentage of Invoice Total (%)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.loyaltyMaxClaimPercent}
                                    onChange={(e) => setFormData(prev => ({ ...prev, loyaltyMaxClaimPercent: Math.min(100, Math.max(1, Number(e.target.value))) }))}
                                    style={{ width: '120px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '800', outline: 'none' }}
                                />
                                <span style={{ fontWeight: '800', color: '#64748B' }}>%</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Prevents 100% free bills by capping redemption (e.g. max 50% of the invoice can be paid with points).
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Maximum Points Cap per Order
                            </label>
                            <input
                                type="number"
                                min="10"
                                value={formData.maxPointsPerOrder}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxPointsPerOrder: Math.max(10, Number(e.target.value)) }))}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                            />
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Maximum number of points that can be redeemed in a single transaction.
                            </p>
                        </div>
                    </div>

                    {/* Expiry Policy & Simulator */}
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} color="#1B6B3A" /> Points Expiry Policy
                        </h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                Points Validity Duration
                            </label>
                            <select
                                value={formData.pointsExpiryMonths}
                                onChange={(e) => setFormData(prev => ({ ...prev, pointsExpiryMonths: Number(e.target.value) }))}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                            >
                                <option value="0">Never Expire (Lifetime validity)</option>
                                <option value="3">3 Months from invoice date</option>
                                <option value="6">6 Months from invoice date</option>
                                <option value="12">1 Year (12 Months)</option>
                                <option value="24">2 Years (24 Months)</option>
                            </select>
                            <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                                Unused points will automatically retire after this validity duration.
                            </p>
                        </div>

                        {/* Redemption Simulator */}
                        <div style={{ background: '#EFF6FF', borderRadius: '14px', padding: '1.25rem', border: '1px solid #BFDBFE' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase' }}>
                                <Sparkles size={14} /> Redemption Value Preview
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#1E40AF', margin: '0.4rem 0 0', fontWeight: '600' }}>
                                If a customer redeems <b>{samplePointsRedeem} points</b>, their bill discount is:
                            </p>
                            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1D4ED8', marginTop: '0.25rem' }}>
                                ₹{redeemPreview}
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#3B82F6', display: 'block', marginTop: '0.25rem' }}>
                                (At ₹{formData.pointValueCurrency} per point)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: VIP MEMBERSHIP TIERS */}
            {activeTab === 'tiers' && (
                <div>
                    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Crown size={20} color="#EAB308" /> VIP Membership Tier Customization
                                </h3>
                                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                                    Customers automatically level up based on lifetime spending, unlocking point multipliers and exclusive perks.
                                </p>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>
                                    Enable Tiers
                                </span>
                                <input
                                    type="checkbox"
                                    checked={formData.enableTiers}
                                    onChange={(e) => setFormData(prev => ({ ...prev, enableTiers: e.target.checked }))}
                                    style={{ width: '18px', height: '18px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                                />
                            </label>
                        </div>

                        {/* Tier Grid Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                            {formData.tierConfig.map((tier, idx) => (
                                <div
                                    key={tier.id}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '16px',
                                        border: `2px solid ${tier.color}30`,
                                        padding: '1.25rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.65rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '850',
                                            background: tier.badge_bg,
                                            color: tier.badge_text,
                                            border: `1px solid ${tier.color}40`
                                        }}>
                                            {tier.name}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: tier.color }}>
                                            {tier.multiplier}x Multiplier
                                        </span>
                                    </div>

                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                            Tier Name
                                        </label>
                                        <input
                                            type="text"
                                            value={tier.name}
                                            onChange={(e) => {
                                                const updated = [...formData.tierConfig];
                                                updated[idx].name = e.target.value;
                                                setFormData(prev => ({ ...prev, tierConfig: updated }));
                                            }}
                                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '750' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                            Min Lifetime Spend (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={tier.min_spend}
                                            onChange={(e) => {
                                                const updated = [...formData.tierConfig];
                                                updated[idx].min_spend = Math.max(0, Number(e.target.value));
                                                setFormData(prev => ({ ...prev, tierConfig: updated }));
                                            }}
                                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '750' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '0.85rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                            Points Multiplier (e.g. 1.25x)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="1"
                                            value={tier.multiplier}
                                            onChange={(e) => {
                                                const updated = [...formData.tierConfig];
                                                updated[idx].multiplier = Math.max(1, Number(e.target.value));
                                                setFormData(prev => ({ ...prev, tierConfig: updated }));
                                            }}
                                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '750' }}
                                        />
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                            Perks & Privileges
                                        </label>
                                        <input
                                            type="text"
                                            value={tier.perks}
                                            onChange={(e) => {
                                                const updated = [...formData.tierConfig];
                                                updated[idx].perks = e.target.value;
                                                setFormData(prev => ({ ...prev, tierConfig: updated }));
                                            }}
                                            placeholder="Perks description"
                                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: CUSTOMER BALANCES & LEDGER */}
            {activeTab === 'customers' && (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={18} color="#1B6B3A" /> Enrolled Customer Balances
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                                View live customer loyalty balances and credit or debit reward points manually with an audit record.
                            </p>
                        </div>

                        {/* Search and Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', width: '240px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone..."
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                                />
                            </div>

                            <select
                                value={selectedTierFilter}
                                onChange={(e) => setSelectedTierFilter(e.target.value)}
                                style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none', background: 'white' }}
                            >
                                <option value="all">All VIP Tiers</option>
                                <option value="bronze">Bronze Club</option>
                                <option value="silver">Silver Star</option>
                                <option value="gold">Gold Premier</option>
                                <option value="platinum">Platinum Elite</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => refetchCustomers()}
                                style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: '750' }}
                            >
                                <RefreshCw size={13} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Phone / Contact</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>VIP Tier</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Lifetime Spend</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Points Balance</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Currency Value</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingCustomers ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                                            Loading customer reward balances...
                                        </td>
                                    </tr>
                                ) : customersList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                                            No customers found matching the search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    customersList.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ fontWeight: '800', color: '#0F172A' }}>{c.name}</div>
                                                {c.email && <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{c.email}</div>}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: '600' }}>
                                                {c.phone || '—'}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.55rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '800',
                                                    background: c.tier?.badge_bg || '#F1F5F9',
                                                    color: c.tier?.badge_text || '#334155',
                                                    border: `1px solid ${c.tier?.color || '#CBD5E1'}40`
                                                }}>
                                                    {c.tier?.name || 'Bronze'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#334155' }}>
                                                ₹{Number(c.total_spent || 0).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#1B6B3A' }}>
                                                    {c.loyalty_points || 0} pts
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#0F172A' }}>
                                                ₹{(c.points_currency_value || 0).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => openAdjustModal(c)}
                                                    style={{
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid #CBD5E1',
                                                        background: '#FFFFFF',
                                                        color: '#0F172A',
                                                        fontSize: '0.74rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                                    }}
                                                >
                                                    <Sliders size={12} color="#1B6B3A" /> Adjust Points
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 5: TRANSACTION AUDIT TRAIL */}
            {activeTab === 'history' && (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={18} color="#1B6B3A" /> Loyalty Transactions Audit Log
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                                Detailed history of points earned from invoices, redeemed discounts, and manual merchant credits/debits.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => refetchTransactions()}
                            style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <RefreshCw size={12} /> Refresh Log
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                    <th style={{ padding: '0.85rem 1rem' }}>Date & Time</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Points Delta</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Balance After</th>
                                    <th style={{ padding: '0.85rem 1rem' }}>Reference / Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTransactions ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                                            Loading transaction ledger...
                                        </td>
                                    </tr>
                                ) : transactionsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                                            No loyalty transactions recorded yet. Points will record when customers complete sales or receive manual credits.
                                        </td>
                                    </tr>
                                ) : (
                                    transactionsList.map(tx => {
                                        const isCredit = (tx.points_earned > 0) || (tx.points > 0);
                                        const delta = tx.points !== undefined && tx.points !== 0 ? tx.points : (isCredit ? tx.points_earned : -tx.points_redeemed);
                                        const type = tx.transaction_type || (tx.points_redeemed > 0 ? 'REDEEMED' : 'EARNED');

                                        return (
                                            <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                                                <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                    {tx.created_at ? new Date(tx.created_at).toLocaleString() : '—'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#0F172A' }}>
                                                    {tx.customer_name || 'Customer'}
                                                    {tx.customer_phone && <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: '500' }}>{tx.customer_phone}</span>}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem' }}>
                                                    <span style={{
                                                        padding: '0.2rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        background: isCredit ? '#DCFCE7' : '#FEE2E2',
                                                        color: isCredit ? '#15803D' : '#DC2626'
                                                    }}>
                                                        {type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '900', color: isCredit ? '#16A34A' : '#EF4444' }}>
                                                    {delta > 0 ? `+${delta}` : delta} pts
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#334155' }}>
                                                    {tx.balance_after ? `${tx.balance_after} pts` : '—'}
                                                </td>
                                                <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                    {tx.invoice_number ? `Invoice #${tx.invoice_number}` : (tx.description || tx.notes || 'Points adjustment')}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 6: RECEIPT & DISPLAY SETTINGS */}
            {activeTab === 'receipt' && (
                <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.5rem', maxWidth: '700px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={18} color="#1B6B3A" /> Thermal Receipt & Notification Customization
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                                    Print Customer Points Balance on Receipts
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                                    Displays total available reward points on printed POS & Billing receipts.
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.printShowLoyalty}
                                onChange={(e) => setFormData(prev => ({ ...prev, printShowLoyalty: e.target.checked }))}
                                style={{ width: '20px', height: '20px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                                    Print Points Earned on this Invoice
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                                    Highlights the exact reward points gained from the current purchase.
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.printShowPointsEarned}
                                onChange={(e) => setFormData(prev => ({ ...prev, printShowPointsEarned: e.target.checked }))}
                                style={{ width: '20px', height: '20px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                                    SMS / WhatsApp Points Update Alerts
                                </span>
                                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                                    Send automatic notification to customer when points are earned or redeemed.
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.smsNotificationsEnabled}
                                onChange={(e) => setFormData(prev => ({ ...prev, smsNotificationsEnabled: e.target.checked }))}
                                style={{ width: '20px', height: '20px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Points Adjustment Modal */}
            {adjustModalOpen && selectedCustomer && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    background: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        maxWidth: '460px',
                        width: '100%',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sliders size={18} color="#1B6B3A" /> Adjust Points Balance
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0' }}>
                                    Customer: <b>{selectedCustomer.name}</b> ({selectedCustomer.phone || 'No phone'})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAdjustModalOpen(false)}
                                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: '800' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAdjustSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Current Balance card */}
                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#64748B' }}>Current Points Balance:</span>
                                <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1B6B3A' }}>
                                    {selectedCustomer.loyalty_points || 0} pts
                                </span>
                            </div>

                            {/* Action Choice: Credit or Debit */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                                    Adjustment Action
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAdjustForm(p => ({ ...p, action: 'CREDIT' }))}
                                        style={{
                                            padding: '0.65rem',
                                            borderRadius: '10px',
                                            border: adjustForm.action === 'CREDIT' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                                            background: adjustForm.action === 'CREDIT' ? '#DCFCE7' : '#FFFFFF',
                                            color: adjustForm.action === 'CREDIT' ? '#15803D' : '#64748B',
                                            fontWeight: '850',
                                            fontSize: '0.84rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Plus size={14} /> Credit Points (+)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAdjustForm(p => ({ ...p, action: 'DEBIT' }))}
                                        style={{
                                            padding: '0.65rem',
                                            borderRadius: '10px',
                                            border: adjustForm.action === 'DEBIT' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                                            background: adjustForm.action === 'DEBIT' ? '#FEE2E2' : '#FFFFFF',
                                            color: adjustForm.action === 'DEBIT' ? '#B91C1C' : '#64748B',
                                            fontWeight: '850',
                                            fontSize: '0.84rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Minus size={14} /> Deduct Points (-)
                                    </button>
                                </div>
                            </div>

                            {/* Points Input */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                                    Points to {adjustForm.action === 'CREDIT' ? 'Add' : 'Deduct'} *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    placeholder="e.g. 50"
                                    value={adjustForm.points}
                                    onChange={(e) => setAdjustForm(p => ({ ...p, points: e.target.value }))}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
                                />
                            </div>

                            {/* Reason Choice */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                                    Adjustment Reason
                                </label>
                                <select
                                    value={adjustForm.reason}
                                    onChange={(e) => setAdjustForm(p => ({ ...p, reason: e.target.value }))}
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                                >
                                    <option value="Customer goodwill / appreciation">Customer goodwill / appreciation</option>
                                    <option value="Store campaign / promotion">Store campaign / promotion</option>
                                    <option value="Referral bonus reward">Referral bonus reward</option>
                                    <option value="Sales return / correction">Sales return / correction</option>
                                    <option value="Manual admin correction">Manual admin correction</option>
                                    <option value="Other">Other (specify in notes)</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                                    Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Internal memo or audit reference"
                                    value={adjustForm.notes}
                                    onChange={(e) => setAdjustForm(p => ({ ...p, notes: e.target.value }))}
                                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', outline: 'none' }}
                                />
                            </div>

                            {/* Footer Submit */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setAdjustModalOpen(false)}
                                    style={{ padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: '750', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustMutation.isPending}
                                    style={{
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: adjustForm.action === 'CREDIT' ? '#1B6B3A' : '#DC2626',
                                        color: 'white',
                                        fontWeight: '850',
                                        fontSize: '0.88rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {adjustMutation.isPending ? 'Updating...' : `Confirm ${adjustForm.action === 'CREDIT' ? 'Credit' : 'Deduction'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
