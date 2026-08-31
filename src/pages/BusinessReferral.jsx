import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
    Gift, 
    Copy, 
    Check, 
    Users, 
    Award, 
    ArrowRight, 
    Sparkles, 
    TrendingUp, 
    Share2, 
    Twitter, 
    Facebook, 
    Linkedin, 
    Coins,
    ChevronRight,
    MessageSquare,
    Clock,
    Trophy,
    ShieldAlert,
    CheckCircle2,
    Lock,
    ShoppingBag,
    Tag,
    Zap,
    FileSpreadsheet,
    HardDrive,
    BadgeCheck
} from 'lucide-react';
import referralService, { REDEMPTION_CATALOG, STAGE_REWARDS } from '../services/referralService';
import '../App.css';

const BusinessReferral = () => {
    const [copied, setCopied] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [referralLink, setReferralLink] = useState('');
    const [wallet, setWallet] = useState({ available_points: 0, pending_points: 0, total_earned_points: 0 });
    const [referralsList, setReferralsList] = useState([]);
    const [redemptionsLog, setRedemptionsLog] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'store' | 'anti-fraud'
    
    // Redeem Code State
    const [inputReferralCode, setInputReferralCode] = useState('');
    const [redeemMessage, setRedeemMessage] = useState(null);

    const refreshData = () => {
        const code = referralService.getUserReferralCode();
        const link = referralService.getReferralLink();
        const w = referralService.getWallet();
        const refs = referralService.getReferralsList();
        const rdms = referralService.getRedemptions();

        setReferralCode(code);
        setReferralLink(link);
        setWallet(w);
        setReferralsList(refs);
        setRedemptionsLog(rdms);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = (platform) => {
        const text = `Join Cliks Business and supercharge your ledger today! Use my invite link: ${referralLink}`;
        let url = '';
        if (platform === 'whatsapp') {
            url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        } else if (platform === 'facebook') {
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        } else if (platform === 'linkedin') {
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        } else if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        }
        
        if (url) window.open(url, '_blank');
    };

    const handleRedeemReward = (rewardId) => {
        try {
            const result = referralService.redeemPoints(rewardId);
            alert(`🎉 Success! You have redeemed "${result.title}". Item added to your active features.`);
            refreshData();
        } catch (err) {
            alert(err.message || 'Failed to redeem reward.');
        }
    };

    const handleApplyReferralCode = (e) => {
        e.preventDefault();
        if (!inputReferralCode.trim()) return;

        const res = referralService.validateAndApplyReferralCode(inputReferralCode, 'currentuser@business.in');
        setRedeemMessage(res);
        if (res.success) {
            refreshData();
            setInputReferralCode('');
        }
    };

    const handleAdvanceStage = (id, newStage) => {
        const res = referralService.advanceReferralStage(id, newStage);
        if (res.success) {
            refreshData();
        } else {
            alert(res.message);
        }
    };

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header Title Grid */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(6, 78, 59, 0.2)'
                        }}>
                            <Gift size={22} />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em', margin: 0 }}>Refer. Grow. Earn Premium.</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>
                        Refer a business owner → They join Cliks → They become active → You both earn rewards.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

                {/* Hero Splendor Banner */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)', 
                    borderRadius: '28px', 
                    padding: '2.5rem', 
                    color: 'white', 
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 40px rgba(6, 78, 59, 0.15)'
                }}>
                    <div style={{ maxWidth: '60%', zIndex: 1 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.4rem 0.9rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <Sparkles size={15} color="#FCD34D" />
                            <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliks Partner Network</span>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '950', margin: '0 0 0.75rem 0', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Refer & Earn Premium
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.95 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '700', color: '#A7F3D0' }}>
                                <span>🎁 You earn <strong>500 Points</strong> when your referral becomes active.</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '700', color: '#FCD34D' }}>
                                <span>🚀 Earn <strong>1,000 Bonus Points</strong> if they upgrade to Premium.</span>
                            </div>
                        </div>
                    </div>

                    {/* Referral Wallet Quick Pill */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.12)', 
                        backdropFilter: 'blur(16px)', 
                        border: '1px solid rgba(255,255,255,0.25)', 
                        borderRadius: '24px', 
                        padding: '1.75rem',
                        textAlign: 'center',
                        minWidth: '260px',
                        zIndex: 1
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FCD34D', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <Coins size={24} />
                        </div>
                        <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#D1FAE5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Referral Wallet Balance</span>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '950', margin: 0, color: '#FFFFFF', lineHeight: 1 }}>{wallet.available_points}</h3>
                        <p style={{ margin: '0.6rem 0 0 0', fontSize: '0.8rem', fontWeight: '700', color: '#A7F3D0' }}>
                            {wallet.pending_points} Points Pending 🕒
                        </p>
                    </div>
                </div>

                {/* 3 Referral Wallet Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                    
                    {/* Card 1: Available Points */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.35rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '850', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                🪙 Available Points
                            </span>
                            <h4 style={{ fontSize: '1.85rem', fontWeight: '950', margin: 0, color: '#064E3B' }}>{wallet.available_points} Pts</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>Ready to redeem for discounts & extensions</span>
                        </div>
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Coins size={22} />
                        </div>
                    </div>

                    {/* Card 2: Pending Points */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.35rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '850', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                🕒 Pending Points
                            </span>
                            <h4 style={{ fontSize: '1.85rem', fontWeight: '950', margin: 0, color: '#B45309' }}>{wallet.pending_points} Pts</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>Unlocks as referred users activate</span>
                        </div>
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={22} />
                        </div>
                    </div>

                    {/* Card 3: Total Points Earned */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.35rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '850', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                                🏆 Total Points Earned
                            </span>
                            <h4 style={{ fontSize: '1.85rem', fontWeight: '950', margin: 0, color: '#4C1D95' }}>{wallet.total_earned_points} Pts</h4>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>Lifetime earned across all stages</span>
                        </div>
                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trophy size={22} />
                        </div>
                    </div>

                </div>

                {/* Referral Link & Social Sharing Bar */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Your Exclusive Referral Link</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>Share with fellow business owners. Anti-fraud engine automatically tracks stage progress.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ background: '#F1F5F9', color: '#334155', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>Code: {referralCode}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1', padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input 
                                readOnly
                                value={referralLink}
                                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.9rem', fontWeight: '750', color: '#064E3B', outline: 'none' }}
                            />
                            <button 
                                onClick={copyToClipboard}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.1rem', 
                                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                                    background: copied ? '#059669' : '#1E293B', color: 'white',
                                    fontWeight: '800', fontSize: '0.8rem', transition: 'all 0.2s ease'
                                }}
                            >
                                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Referral Link</>}
                            </button>
                        </div>

                        {/* Social Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {[
                                { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, bg: '#25D366', color: 'white' },
                                { key: 'facebook', label: 'Facebook', icon: Facebook, bg: '#1877F2', color: 'white' },
                                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, bg: '#0A66C2', color: 'white' },
                                { key: 'twitter', label: 'Twitter', icon: Twitter, bg: '#1DA1F2', color: 'white' }
                            ].map(sns => (
                                <button 
                                    key={sns.key}
                                    onClick={() => shareUrl(sns.key)}
                                    style={{ 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        gap: '3px', padding: '0.55rem 0.3rem', borderRadius: '12px', border: 'none',
                                        background: sns.bg, color: sns.color, cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem'
                                    }}
                                >
                                    <sns.icon size={15} />
                                    <span>{sns.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        style={{ 
                            padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none',
                            background: activeTab === 'dashboard' ? '#064E3B' : '#FFFFFF',
                            color: activeTab === 'dashboard' ? '#FFFFFF' : '#475569',
                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === 'dashboard' ? '0 4px 12px rgba(6,78,59,0.2)' : 'none'
                        }}
                    >
                        <Users size={16} /> Referral Progress Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('store')}
                        style={{ 
                            padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none',
                            background: activeTab === 'store' ? '#064E3B' : '#FFFFFF',
                            color: activeTab === 'store' ? '#FFFFFF' : '#475569',
                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === 'store' ? '0 4px 12px rgba(6,78,59,0.2)' : 'none'
                        }}
                    >
                        <ShoppingBag size={16} /> Points Redemption Center ({REDEMPTION_CATALOG.length} Rewards)
                    </button>
                    <button 
                        onClick={() => setActiveTab('anti-fraud')}
                        style={{ 
                            padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none',
                            background: activeTab === 'anti-fraud' ? '#064E3B' : '#FFFFFF',
                            color: activeTab === 'anti-fraud' ? '#FFFFFF' : '#475569',
                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === 'anti-fraud' ? '0 4px 12px rgba(6,78,59,0.2)' : 'none'
                        }}
                    >
                        <Lock size={16} /> Anti-Fraud & Rules
                    </button>
                </div>

                {/* TAB 1: REFERRAL DASHBOARD TABLE */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Referral Stage Progress Tracker</h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>Track friend signups, business setups, active status, and premium upgrades.</p>
                                </div>
                                <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                    {referralsList.length} Total Referrals
                                </span>
                            </div>

                            {/* Dashboard Table */}
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#F8FAFC' }}>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '800' }}>Referred User</th>
                                            <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '800' }}>Status / Stage</th>
                                            <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '800' }}>Reward Earned</th>
                                            <th style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '800', textAlign: 'right' }}>Stage Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralsList.map((ref) => {
                                            const isRegistered = ref.stage === 'REGISTERED';
                                            const isSetup = ref.stage === 'SETUP_COMPLETE';
                                            const isActive = ref.stage === 'ACTIVE';
                                            const isPremium = ref.stage === 'PREMIUM';

                                            return (
                                                <tr key={ref.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <div style={{ fontWeight: '800', color: '#1E293B' }}>{ref.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{ref.email} • Joined {ref.registered_at}</div>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        {isRegistered && (
                                                            <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                                Registered (Pending)
                                                            </span>
                                                        )}
                                                        {isSetup && (
                                                            <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                                Setup Complete
                                                            </span>
                                                        )}
                                                        {isActive && (
                                                            <span style={{ background: '#D1FAE5', color: '#065F46', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                                Active User
                                                            </span>
                                                        )}
                                                        {isPremium && (
                                                            <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800' }}>
                                                                Premium User 👑
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        {isRegistered && <span style={{ color: '#94A3B8', fontWeight: '700' }}>Pending</span>}
                                                        {isSetup && <span style={{ color: '#2563EB', fontWeight: '900' }}>100 Points</span>}
                                                        {isActive && <span style={{ color: '#059669', fontWeight: '900' }}>600 Points (100 + 500)</span>}
                                                        {isPremium && <span style={{ color: '#7C3AED', fontWeight: '900' }}>1,600 Points (+1,000 Bonus)</span>}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                                                            {isRegistered && (
                                                                <button 
                                                                    onClick={() => handleAdvanceStage(ref.id, 'SETUP_COMPLETE')}
                                                                    style={{ border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                                                    title="Simulate completing business setup"
                                                                >
                                                                    + Complete Setup
                                                                </button>
                                                            )}
                                                            {(isRegistered || isSetup) && (
                                                                <button 
                                                                    onClick={() => handleAdvanceStage(ref.id, 'ACTIVE')}
                                                                    style={{ border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#047857', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                                                    title="Simulate becoming active user"
                                                                >
                                                                    + Activate (500 pts)
                                                                </button>
                                                            )}
                                                            {isActive && (
                                                                <button 
                                                                    onClick={() => handleAdvanceStage(ref.id, 'PREMIUM')}
                                                                    style={{ border: '1px solid #DDD6FE', background: '#F5F3FF', color: '#6D28D9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                                                                    title="Simulate upgrading to premium"
                                                                >
                                                                    + Upgrade Premium (1000 pts)
                                                                </button>
                                                            )}
                                                            {isPremium && (
                                                                <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '800' }}>✓ Max Rewards Earned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Redeem Code Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Apply Referral Code Card */}
                            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '850', color: '#1E293B' }}>Have a Referral Code?</h4>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                                    Enter your friend's invite code to claim 🎁 <strong>200 Welcome Points</strong>.
                                </p>

                                <form onSubmit={handleApplyReferralCode} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. CLIKS-BIZ-9821X"
                                        value={inputReferralCode}
                                        onChange={(e) => setInputReferralCode(e.target.value)}
                                        style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none' }}
                                    />
                                    <button 
                                        type="submit"
                                        style={{ padding: '0.75rem', borderRadius: '12px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '850', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Claim 200 Welcome Points
                                    </button>
                                </form>

                                {redeemMessage && (
                                    <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '10px', background: redeemMessage.success ? '#ECFDF5' : '#FEF2F2', border: redeemMessage.success ? '1px solid #A7F3D0' : '1px solid #FCA5A5', color: redeemMessage.success ? '#047857' : '#991B1B', fontSize: '0.78rem', fontWeight: '700' }}>
                                        {redeemMessage.message}
                                    </div>
                                )}
                            </div>

                            {/* Reward Conversion Rules Box */}
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: '850', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Conversion Rates
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', fontWeight: '700' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <span style={{ color: '#475569' }}>500 Points</span>
                                        <span style={{ color: '#059669', fontWeight: '900' }}>= ₹50 Discount</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                        <span style={{ color: '#475569' }}>1,000 Points</span>
                                        <span style={{ color: '#7C3AED', fontWeight: '900' }}>= 7 Days Extension</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: REDEMPTION CENTER */}
                {activeTab === 'store' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Points Redemption Store</h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>Use your available points for subscription discounts, extensions, advanced reports, and extra storage.</p>
                            </div>
                            <div style={{ background: '#ECFDF5', color: '#064E3B', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', border: '1px solid #A7F3D0' }}>
                                🪙 Balance: {wallet.available_points} Points
                            </div>
                        </div>

                        {/* Catalog Cards Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                            {REDEMPTION_CATALOG.map((item) => {
                                const canAfford = wallet.available_points >= item.cost;
                                return (
                                    <div key={item.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <span style={{ background: '#F1F5F9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                    {item.category}
                                                </span>
                                                <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: '850', color: '#1E293B' }}>{item.title}</h4>
                                            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>{item.desc}</p>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Points Cost</span>
                                                <span style={{ fontSize: '1.2rem', fontWeight: '950', color: '#064E3B' }}>{item.cost} Pts</span>
                                            </div>

                                            <button 
                                                onClick={() => handleRedeemReward(item.id)}
                                                disabled={!canAfford}
                                                style={{ 
                                                    width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none',
                                                    background: canAfford ? 'linear-gradient(135deg, #064E3B 0%, #047857 100%)' : '#E2E8F0',
                                                    color: canAfford ? 'white' : '#94A3B8',
                                                    fontWeight: '850', fontSize: '0.85rem', cursor: canAfford ? 'pointer' : 'not-allowed',
                                                    boxShadow: canAfford ? '0 4px 12px rgba(6,78,59,0.15)' : 'none'
                                                }}
                                            >
                                                {canAfford ? 'Redeem Now 🎁' : `Need ${item.cost - wallet.available_points} More Pts`}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Redemption Log Table */}
                        {redemptionsLog.length > 0 && (
                            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '850', color: '#1E293B' }}>Redemption History</h4>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                                        <thead style={{ background: '#F8FAFC' }}>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.75rem 1rem', color: '#64748B' }}>Reward Title</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#64748B' }}>Category</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#64748B' }}>Cost</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#64748B', textAlign: 'right' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {redemptionsLog.map(log => (
                                                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>{log.title}</td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>{log.category}</td>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '900', color: '#DC2626' }}>-{log.cost} Pts</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748B' }}>{new Date(log.redeemed_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: ANTI-FRAUD RULES & PROTECTION */}
                {activeTab === 'anti-fraud' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldAlert size={22} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B', margin: 0 }}>Strict Anti-Fraud Protection Rules</h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Active security protocols safeguarding the Refer & Earn ecosystem.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { title: 'Self-Referral Prevention', desc: 'A user cannot refer themselves or use their own referral code. Codes matching the logged-in account are automatically rejected.', status: 'Active Enforcement' },
                                    { title: 'Single Referral Code Limit', desc: 'Each new user account can only redeem a single referral code during setup.', status: 'Active Enforcement' },
                                    { title: 'Stage-Gated Reward Unlock', desc: 'Rewards are not issued immediately for simple registration. Registration remains Pending until setup and activation stages complete.', status: 'Active Enforcement' },
                                    { title: 'Duplicate Reward Prevention', desc: 'Points are credited exactly ONCE per qualifying stage for each referred user. Re-triggering stages does not generate duplicate rewards.', status: 'Active Enforcement' },
                                    { title: 'Stage-Based Tracking', desc: 'Referrals transition dynamically across Registered (Pending) → Setup Complete (100 Pts) → Active (500 Pts) → Premium (1,000 Bonus Pts).', status: 'Active Enforcement' }
                                ].map((rule, idx) => (
                                    <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1.1rem 1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.92rem', fontWeight: '800', color: '#1E293B' }}>{idx + 1}. {rule.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>{rule.desc}</p>
                                        </div>
                                        <span style={{ background: '#ECFDF5', color: '#047857', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '850', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                                            ✓ {rule.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Anti-Fraud Monitor Box */}
                        <div style={{ background: '#064E3B', color: 'white', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <BadgeCheck size={20} color="#FCD34D" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A7F3D0' }}>System Health</span>
                                </div>
                                <h3 style={{ fontSize: '1.65rem', fontWeight: '950', margin: '0 0 0.75rem 0', lineHeight: 1.2 }}>
                                    Anti-Fraud Engine Status: 100% Operational
                                </h3>
                                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.5' }}>
                                    All referral registrations, stage progressions, and points redemptions are verified against anti-fraud rules before points credit to wallet balances.
                                </p>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', marginTop: '2rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FCD34D', textTransform: 'uppercase' }}>Active Account Info</span>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: '750' }}>Referral Code: {referralCode}</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Status: Verified Partner</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BusinessReferral;
