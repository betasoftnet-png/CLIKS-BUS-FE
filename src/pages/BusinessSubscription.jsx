import React, { useState } from 'react';
import { 
    CreditCard, 
    Check, 
    Zap, 
    ShieldCheck, 
    Award, 
    Crown, 
    History, 
    ArrowUpRight, 
    Download, 
    Calendar,
    Sparkles
} from 'lucide-react';
import '../App.css';

const BusinessSubscription = () => {
    const [selectedTier, setSelectedTier] = useState('Growth Plan'); // 'Growth Plan', 'Enterprise Pro', 'Unlimited'
    const [billingCycle, setBillingCycle] = useState('annually'); // 'monthly', 'annually'

    const tiers = [
        {
            name: 'Growth Plan',
            priceMonthly: 1499,
            priceAnnually: 1199,
            desc: 'Ideal for rapidly scaling retail & wholesale SMBs.',
            icon: Award,
            color: '#1B6B3A',
            badge: 'Most Popular',
            features: [
                'Unlimited Accounting & Day Book Logs',
                'Live GST Filings & ITC Auto-Matching',
                'Advanced Smart Warehousing (up to 3 sites)',
                'Automated Payroll & Attendance Systems',
                'Daily CA Data Exporting (CSV/Excel)',
                'Email & Live Chat Payout Support'
            ]
        },
        {
            name: 'Enterprise Pro',
            priceMonthly: 4499,
            priceAnnually: 3599,
            desc: 'Built for complex, multi-site manufacturers & enterprises.',
            icon: Zap,
            color: '#064E3B',
            badge: 'Best Value',
            features: [
                'All features in Growth Plan',
                'Infinite Multi-warehouse Routing',
                'Dedicated Bill of Materials (BOM) Planners',
                'Advanced Machine Downtime Analytics',
                'API Webhook Access & ERP Syncing',
                'Dedicated CA Account Manager assistance'
            ]
        },
        {
            name: 'Unlimited Suite',
            priceMonthly: 9999,
            priceAnnually: 7999,
            desc: 'Absolute control for national distribution networks.',
            icon: Crown,
            color: '#0D9488',
            badge: 'Ultimate Power',
            features: [
                'Uncapped active staff profiles',
                'Custom White-Label Invoicing Layouts',
                'Unlimited manufacturing batches & QC logs',
                'Guaranteed 99.99% uptime SLA service',
                'Quarterly ERP business audit assistance',
                'Priority 24/7/365 Direct VIP Phone Support'
            ]
        }
    ];

    const invoices = [
        { id: 'INV-2026-041', date: '2026-05-01', tier: 'Growth Plan (Annual)', amount: '₹14,388', status: 'Paid', method: 'UPI (Razorpay)' },
        { id: 'INV-2026-029', date: '2025-05-01', tier: 'Growth Plan (Annual)', amount: '₹14,388', status: 'Paid', method: 'Bank Transfer' }
    ];

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <CreditCard size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B' }}>Subscription & Billing</h1>
                    </div>
                    <p style={{ color: '#475569', fontWeight: '500' }}>Manage your active workspace tier, features access, and transaction statements.</p>
                </div>
                
                {/* Billing Cycle Toggle */}
                <div style={{ display: 'flex', background: '#DCF2E4', padding: '0.4rem', borderRadius: '14px', gap: '0.5rem' }}>
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: billingCycle === 'monthly' ? 'white' : 'transparent', color: '#064E3B', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem' }}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('annually')}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: billingCycle === 'annually' ? 'white' : 'transparent', color: '#064E3B', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        Annually <span style={{ background: '#1B6B3A', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Current Tier Widget */}
            <div style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', borderRadius: '32px', padding: '2.5rem', color: 'white', marginBottom: '3rem', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(27, 107, 58, 0.15)' }}>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 1 }}>
                    <div>
                        <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                            <Sparkles size={14} /> Active Subscription Plan
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem' }}>Growth Plan (Annual)</h2>
                        <p style={{ color: '#DCF2E4', fontWeight: '600', maxWidth: '500px' }}>Your workspace is configured with high-performance ERP pipelines. All accounting, manufacturing, and HR modules are fully active.</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.75rem 2.25rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', minWidth: '240px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#DCF2E4', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Next Automatic Renewal</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.25rem' }}>01 May, 2027</h3>
                        <p style={{ fontSize: '0.8rem', color: '#DCF2E4', fontWeight: '600' }}>Amount: ₹14,388 + GST</p>
                    </div>
                </div>
            </div>

            {/* Pricing Tiers Selection Grid */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Upgrade Workspace Tier</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                {tiers.map((tier, idx) => {
                    const price = billingCycle === 'annually' ? tier.priceAnnually : tier.priceMonthly;
                    const isActive = tier.name === selectedTier;
                    const TierIcon = tier.icon;
                    return (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedTier(tier.name)}
                            style={{ 
                                background: 'white', 
                                borderRadius: '32px', 
                                border: isActive ? `3px solid ${tier.color}` : '1px solid #E2E8F0',
                                padding: '2.5rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                transform: isActive ? 'translateY(-8px)' : 'none',
                                boxShadow: isActive ? `0 20px 25px -5px rgba(0,0,0,0.06)` : 'none'
                            }}
                        >
                            {isActive && (
                                <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: tier.color, color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '0.4rem 0.8rem', borderRadius: '10px', textTransform: 'uppercase' }}>
                                    {tier.badge}
                                </span>
                            )}
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${tier.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color, marginBottom: '1.5rem' }}>
                                <TierIcon size={24} />
                            </div>
                            <h4 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>{tier.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500', marginBottom: '2rem', minHeight: '40px' }}>{tier.desc}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '2.25rem', fontWeight: '900', color: '#1E293B' }}>₹{price.toLocaleString()}</span>
                                <span style={{ color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>/ month</span>
                            </div>

                            <button style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                borderRadius: '16px', 
                                border: isActive ? 'none' : `1px solid ${tier.color}`,
                                background: isActive ? `linear-gradient(135deg, ${tier.color} 0%, #064E3B 100%)` : 'white',
                                color: isActive ? 'white' : tier.color,
                                fontWeight: '800',
                                cursor: 'pointer',
                                marginBottom: '2rem'
                            }}>
                                {isActive ? 'Currently Active Plan' : 'Upgrade Plan'}
                            </button>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '2rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>What's Included</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {tier.features.map((feature, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
                                            <Check size={16} style={{ color: tier.color, flexShrink: 0, marginTop: '0.15rem' }} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Invoices History list */}
            <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <History size={20} style={{ color: '#1B6B3A' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', margin: 0 }}>Billing & Statement History</h3>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice ID</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Billing Date</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Tier Details</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Payment Mode</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '1.25rem', fontWeight: '800', color: '#064E3B' }}>{inv.id}</td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>{inv.date}</td>
                                    <td style={{ padding: '1.25rem', fontWeight: '700', color: '#1E293B' }}>{inv.tier}</td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}><span style={{ background: '#F1F5F9', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>{inv.method}</span></td>
                                    <td style={{ padding: '1.25rem' }}><span style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', background: '#F0FDF4', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '750' }}>{inv.status}</span></td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '850', color: '#1E293B' }}>{inv.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </div>
    );
};

export default BusinessSubscription;
