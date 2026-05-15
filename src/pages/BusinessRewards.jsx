import React from 'react';
import { 
    Gift, 
    Coins, 
    Sparkles, 
    ArrowRight, 
    Wallet, 
    BadgePercent, 
    Clock,
    Star,
    Users,
    ShieldCheck,
    Building,
    ChevronRight,
    Flame
} from 'lucide-react';

const BusinessRewards = () => {
    const rewardPoints = 1450;

    const premiumOffers = [
        {
            id: 'offer_1',
            title: 'Wallet Load Reward',
            description: 'Load ₹5,000 or more into your Cliks Wallet and claim a 2% flat discount on your next annual or monthly Cliks Pro subscription.',
            shortLabel: '2% OFF PRO',
            type: 'wallet',
            icon: Wallet,
            badgeColor: '#ECFDF5',
            accentColor: '#10B981',
            textColor: '#065F46',
            actionLabel: 'Load Wallet Now',
            link: '/payments/wallet'
        },
        {
            id: 'offer_2',
            title: 'Split & Collect Bonus',
            description: 'Successfully record and reconcile your first split ledger with a business associate to claim extra bonus points instantly.',
            shortLabel: '+200 POINTS',
            type: 'split',
            icon: Users,
            badgeColor: '#EEF2FF',
            accentColor: '#4F46E5',
            textColor: '#3730A3',
            actionLabel: 'Create Split Ticket',
            link: '/payments/split-collect'
        },
        {
            id: 'offer_3',
            title: 'GST Premium Launch',
            description: 'Submit your quarterly GST logs using Cliks Automated Ledger and receive exclusive priority audit scoring for free.',
            shortLabel: 'FREE AUDIT',
            type: 'gst',
            icon: ShieldCheck,
            badgeColor: '#FFFBEB',
            accentColor: '#D97706',
            textColor: '#92400E',
            actionLabel: 'Configure GST',
            link: '/finance/gst'
        },
        {
            id: 'offer_4',
            title: 'High-Value Ledger Perks',
            description: 'Maintain an average quarterly wallet balance of ₹25,000+ to lock in premium business tier privileges and reduced transaction clearing delays.',
            shortLabel: 'ELITE STATUS',
            type: 'balance',
            icon: Flame,
            badgeColor: '#FEF2F2',
            accentColor: '#EF4444',
            textColor: '#991B1B',
            actionLabel: 'Boost Balance',
            link: '/payments/wallet'
        }
    ];

    const milestoneRedeemables = [
        { points: 500, item: '⭐ 1-Month Pro Pack', desc: 'Redeem to unlock fully automated AI Cashflow Analytics.', cost: 500, isAvailable: true },
        { points: 1000, item: '🎗️ Business Spotlight', desc: 'Featured banner spot on CLIKS Deal Marketplace search streams.', cost: 1000, isAvailable: true },
        { points: 2500, item: '🎁 Cliks Swag Box', desc: 'Premium branded merchandise kit delivered right to your desk.', cost: 2500, isAvailable: false },
        { points: 5000, item: '💳 ₹5,000 Direct Credits', desc: 'Convert points directly to loaded wallet balances for instant spend.', cost: 5000, isAvailable: false }
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
                    </div>
                </div>

                {/* Content Two-Column Split Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Left Column: Premium Offers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Exclusive Offers & Boosters</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#10B981', fontWeight: '700' }}>
                                <Clock size={13} /> Updated Hourly
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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

                    {/* Right Column: Point Redemption List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Redeem Point Thresholds</h3>
                        
                        <div style={{ 
                            background: '#FFFFFF', 
                            borderRadius: '20px', 
                            border: '1px solid #E2E8F0', 
                            padding: '1.25rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {milestoneRedeemables.map((item, index) => {
                                const canRedeem = rewardPoints >= item.cost;
                                return (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            padding: '0.85rem', 
                                            borderRadius: '12px', 
                                            background: canRedeem ? '#F0FDF4' : '#F8FAFC', 
                                            border: canRedeem ? '1px solid #DCFCE7' : '1px solid #F1F5F9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '42px', 
                                            height: '42px', 
                                            borderRadius: '10px', 
                                            background: canRedeem ? '#10B981' : '#E2E8F0', 
                                            color: canRedeem ? '#FFFFFF' : '#64748B', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '900' }}>{item.cost}</span>
                                            <span style={{ fontSize: '0.5rem', fontWeight: '850', textTransform: 'uppercase', marginTop: '-2px' }}>Pts</span>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', fontWeight: '800', color: canRedeem ? '#065F46' : '#1E293B' }}>{item.item}</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: canRedeem ? '#15803D' : '#64748B', lineHeight: 1.2 }}>{item.desc}</p>
                                        </div>

                                        <button 
                                            disabled={!canRedeem}
                                            style={{
                                                border: 'none',
                                                padding: '0.45rem 0.75rem',
                                                borderRadius: '8px',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                cursor: canRedeem ? 'pointer' : 'default',
                                                background: canRedeem ? 'linear-gradient(135deg, #059669 0%, #064E3B 100%)' : '#E2E8F0',
                                                color: canRedeem ? '#FFFFFF' : '#94A3B8',
                                                boxShadow: canRedeem ? '0 4px 10px rgba(5, 150, 105, 0.2)' : 'none'
                                            }}
                                        >
                                            {canRedeem ? 'Redeem' : 'Locked'}
                                        </button>
                                    </div>
                                );
                            })}

                            <div style={{ 
                                marginTop: '0.5rem', 
                                padding: '1rem', 
                                borderRadius: '12px', 
                                background: '#F0F9FF', 
                                border: '1px solid #E0F2FE', 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: '0.75rem' 
                            }}>
                                <Star size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h5 style={{ margin: '0 0 2px 0', fontSize: '0.8rem', fontWeight: '800', color: '#0369A1' }}>Collect Points Faster!</h5>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#0284C7', lineHeight: 1.3 }}>
                                        Invite verified colleagues through the "Refer & Earn" link below and rack up 500 pts per successful integration!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BusinessRewards;
