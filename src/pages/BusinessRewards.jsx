import React, { useState } from 'react';
import { 
    Gift, 
    Coins, 
    Sparkles, 
    ArrowRight, 
    Wallet, 
    BadgePercent, 
    Clock,
    Flame
} from 'lucide-react';
import { useCurrency } from '../context';

const BusinessRewards = () => {
    const { currency, formatCurrency } = useCurrency();
    
    const [rewardPoints, setRewardPoints] = useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1450;
    });

    const handleConvertPoints = () => {
        if (rewardPoints <= 0) return;
        
        // Let's say 1 point = 1 unit of currency
        const conversionValue = rewardPoints * 1;
        
        // Add to wallet balance in localStorage (as a quick mock update)
        const currentWallet = parseFloat(localStorage.getItem('cliks_wallet_balance') || '0');
        localStorage.setItem('cliks_wallet_balance', (currentWallet + conversionValue).toString());
        
        // Reset points
        setRewardPoints(0);
        localStorage.setItem('cliks_reward_points', '0');
        
        alert(`Successfully converted ${rewardPoints} points into ${formatCurrency(conversionValue)} for your wallet!`);
    };

    const premiumOffers = [
        {
            id: 'offer_1',
            title: 'Starter Wallet Load Reward',
            description: 'Load ₹5,000 or more into your Cliks Wallet and claim a 2% flat discount on your next monthly or annual Cliks Pro subscription.',
            shortLabel: '2% OFF PRO',
            type: 'wallet_starter',
            icon: Wallet,
            badgeColor: '#ECFDF5',
            accentColor: '#10B981',
            textColor: '#065F46',
            actionLabel: 'Load Wallet Now',
            link: '/payments/wallet?addMoney=true'
        },
        {
            id: 'offer_2',
            title: 'Silver Wallet Load Reward',
            description: 'Load ₹10,000 or more into your Cliks Wallet and claim a 3.5% flat discount on your next monthly or annual Cliks Pro subscription.',
            shortLabel: '3.5% OFF PRO',
            type: 'wallet_silver',
            icon: Coins,
            badgeColor: '#EFF6FF',
            accentColor: '#3B82F6',
            textColor: '#1E40AF',
            actionLabel: 'Load Wallet Now',
            link: '/payments/wallet?addMoney=true'
        },
        {
            id: 'offer_3',
            title: 'Gold Wallet Load Reward',
            description: 'Load ₹25,000 or more into your Cliks Wallet and claim a 5% flat discount on your next monthly or annual Cliks Pro subscription.',
            shortLabel: '5% OFF PRO',
            type: 'wallet_gold',
            icon: BadgePercent,
            badgeColor: '#FFFBEB',
            accentColor: '#F59E0B',
            textColor: '#78350F',
            actionLabel: 'Load Wallet Now',
            link: '/payments/wallet?addMoney=true'
        },
        {
            id: 'offer_4',
            title: 'Platinum Wallet Load Reward',
            description: 'Load ₹50,000 or more into your Cliks Wallet and claim an 8% flat discount on your next monthly or annual Cliks Pro subscription.',
            shortLabel: '8% OFF PRO',
            type: 'wallet_platinum',
            icon: Flame,
            badgeColor: '#FDF2F8',
            accentColor: '#EC4899',
            textColor: '#9D174D',
            actionLabel: 'Load Wallet Now',
            link: '/payments/wallet?addMoney=true'
        }
    ];



    return (
        <div style={{ 
            padding: '1.5rem', 
            background: '#F8FAFC', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            boxSizing: 'border-box', 
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' 
        }}>
            
            {/* Sleek Title Banner */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#34D399',
                        boxShadow: '0 4px 12px rgba(6, 78, 59, 0.15)'
                    }}>
                        <Gift size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Rewards & Offers</h1>
                        <p style={{ color: '#64748B', fontSize: '0.825rem', fontWeight: '500', margin: '0.1rem 0 0 0' }}>Unlock special platform deals, discounts, and premium tier unlocks.</p>
                    </div>
                </div>
            </div>

            {/* Scrollable View */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1.5rem' }}>
                
                {/* Banner Balance Section */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)', 
                    borderRadius: '24px', 
                    padding: '2rem', 
                    color: 'white', 
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.75rem',
                    boxShadow: '0 12px 30px rgba(6, 78, 59, 0.12)'
                }}>
                    {/* Glow background design elements */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px', background: 'rgba(52, 211, 153, 0.2)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '140px', height: '140px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

                    <div style={{ maxWidth: '65%', zIndex: 1 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Sparkles size={14} color="#FCD34D" />
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A7F3D0' }}>Active Rewards Plan</span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '850', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Grow Your Business, Collect Premium Perks</h2>
                        <p style={{ opacity: 0.85, fontSize: '0.9rem', lineHeight: 1.4, margin: 0, color: '#ECFDF5' }}>
                            Complete milestones, scale your active ledger, and transact consistently to stack loyalty points and unlock deep discounts across your workspace subscriptions.
                        </p>
                    </div>

                    {/* Live Points Visual */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.08)', 
                        backdropFilter: 'blur(12px)', 
                        border: '1px solid rgba(255, 255, 255, 0.15)', 
                        borderRadius: '20px', 
                        padding: '1.5rem',
                        textAlign: 'center',
                        minWidth: '180px',
                        zIndex: 1,
                        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)', 
                            color: '#78350F', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 0.75rem auto', 
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' 
                        }}>
                            <Coins size={22} />
                        </div>
                        <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Total Wallet Points</span>
                        <h3 style={{ fontSize: '2.25rem', fontWeight: '900', margin: 0, color: '#FFFFFF', lineHeight: 1 }}>{rewardPoints.toLocaleString()}</h3>
                        <div style={{ 
                            marginTop: '0.65rem', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '8px', 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            color: '#D1FAE5', 
                            display: 'inline-block' 
                        }}>
                            Gold Elite 👑
                        </div>
                        
                        <button
                            onClick={handleConvertPoints}
                            disabled={rewardPoints <= 0}
                            style={{
                                marginTop: '1rem',
                                padding: '0.6rem 1rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: rewardPoints > 0 ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' : 'rgba(255, 255, 255, 0.1)',
                                color: rewardPoints > 0 ? '#78350F' : '#94A3B8',
                                fontWeight: '850',
                                fontSize: '0.75rem',
                                cursor: rewardPoints > 0 ? 'pointer' : 'not-allowed',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s',
                                boxShadow: rewardPoints > 0 ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (rewardPoints > 0) e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={(e) => {
                                if (rewardPoints > 0) e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Wallet size={14} />
                            Convert to Wallet
                        </button>
                    </div>
                </div>

                {/* Content Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Exclusive Offers & Boosters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Exclusive Offers & Boosters</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>
                                <Clock size={13} /> Updated Hourly
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
                            {premiumOffers.map((offer) => (
                                <div 
                                    key={offer.id}
                                    style={{
                                        background: '#FFFFFF',
                                        borderRadius: '18px',
                                        border: '1px solid #E2E8F0',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        gap: '1.25rem',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.03)';
                                        e.currentTarget.style.borderColor = offer.accentColor;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                    }}
                                >
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '14px', 
                                        background: offer.badgeColor, 
                                        color: offer.accentColor, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <offer.icon size={24} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>{offer.title}</h4>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                borderRadius: '6px', 
                                                background: offer.badgeColor, 
                                                color: offer.textColor, 
                                                fontSize: '0.65rem', 
                                                fontWeight: '850', 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.02em' 
                                            }}>
                                                {offer.shortLabel}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: '#64748B', margin: '0 0 1rem 0' }}>
                                            {offer.description}
                                        </p>
                                        
                                        <a 
                                            href={offer.link}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                fontSize: '0.8rem',
                                                fontWeight: '800',
                                                color: offer.accentColor,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span>{offer.actionLabel}</span>
                                            <ArrowRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessRewards;
