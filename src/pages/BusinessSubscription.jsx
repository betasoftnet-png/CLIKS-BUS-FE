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
import { load } from '@cashfreepayments/cashfree-js';
import { apiClient } from '../api/client';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';

const BusinessSubscription = () => {
    const [activeCategory, setActiveCategory] = useState('business');
    const [betaSubCategory, setBetaSubCategory] = useState('investor'); 
    const [selectedTier, setSelectedTier] = useState('Growth Plan'); 
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = async (tier) => {
        if (tier.name === selectedTier) return;
        
        const amt = tier.priceAnnually;
        
        try {
            setIsProcessing(true);
            const generatedOrderId = `SUB_${Date.now()}_${Math.floor(Math.random() * 999)}`;
            let paymentSessionId = null;

            const backendData = await apiClient.post('/payments/create-order', {
                amount: amt,
                orderId: generatedOrderId
            });

            if (backendData && backendData.data && backendData.data.payment_session_id) {
                paymentSessionId = backendData.data.payment_session_id;
            } else {
                throw new Error("Malformed session received from server cluster.");
            }

            const cashfree = await load({ mode: "sandbox" });

            cashfree.checkout({
                paymentSessionId: paymentSessionId,
                redirectTarget: "_modal"
            }).then((result) => {
                if (result.error) {
                    alert("Gateway Interrupted: " + result.error.message);
                } else {
                    setSelectedTier(tier.name);
                    alert(`Successfully upgraded to ${tier.name}!`);
                }
            });

        } catch (err) {
            console.warn("[CASHFREE GATEWAY LOGGER]:", err.message);
            const shouldSimulate = await customConfirm(
                `🚨 [CASHFREE GATEWAY ERROR]\n\n` +
                `Transaction Handshake Failed: ${err.message}\n\n` +
                `Would you like to simulate a SUCCESSFUL Gateway callback anyway to test UI loading logic?`
            );

            if (shouldSimulate) {
                setSelectedTier(tier.name);
                alert(`Successfully simulated upgrade to ${tier.name}!`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const allTiers = {
        business: [
            {
                name: 'Starter Plan',
                priceAnnually: 2999,
                originalPrice: 4599,
                desc: 'Ideal for small retail & emerging SMBs.',
                icon: ShieldCheck,
                color: '#1B6B3A',
                badge: 'Basic',
                features: [
                    'Unlimited Accounting & Day Book Logs',
                    'Live GST Filings & ITC Auto-Matching',
                    'Basic Warehousing (1 site)',
                    'Automated Payroll & Attendance Systems',
                    'Email Support'
                ]
            },
            {
                name: 'Growth Plan',
                priceAnnually: 6999,
                originalPrice: 9999,
                desc: 'Built for scaling businesses and multi-site operations.',
                icon: Zap,
                color: '#064E3B',
                badge: 'Most Popular',
                features: [
                    'All features in Starter Plan',
                    'Multi-warehouse Routing (up to 3 sites)',
                    'Dedicated Bill of Materials (BOM)',
                    'API Webhook Access & ERP Syncing',
                    'Daily FIN-PRO Data Exporting (CSV/Excel)',
                    'Priority Email & Live Chat Support'
                ]
            },
            {
                name: 'Elite Suite',
                priceAnnually: 8999,
                originalPrice: 15999,
                desc: 'Absolute control for national distribution networks.',
                icon: Crown,
                color: '#0D9488',
                badge: 'Ultimate Value',
                features: [
                    'All features in Growth Plan',
                    'Uncapped active staff profiles',
                    'Custom White-Label Invoicing Layouts',
                    'Unlimited manufacturing batches & QC logs',
                    'Guaranteed 99.99% uptime SLA service',
                    'Dedicated FIN-PRO Account Manager assistance',
                    'Priority 24/7/365 Direct VIP Phone Support'
                ]
            }
        ],
        ca: [
            {
                name: 'FIN-PRO Standard',
                priceAnnually: 4999,
                originalPrice: 6999,
                desc: 'Perfect for independent practitioners and small firms.',
                icon: ShieldCheck,
                color: '#1E3A8A',
                badge: 'Essential',
                features: [
                    'Manage up to 25 Active Client Ledgers',
                    'Standard Multi-Client GST/ITR Reporting',
                    'Direct Auditing & Daybook Verification Logs',
                    'Automated Exporting to CSV/Excel formats',
                    'Priority Email Support'
                ]
            },
            {
                name: 'FIN-PRO Premium',
                priceAnnually: 9999,
                originalPrice: 14999,
                desc: 'Designed for high-growth firms and collaborative auditing teams.',
                icon: Zap,
                color: '#2563EB',
                badge: 'Most Recommended',
                features: [
                    'Manage up to 100 Active Client Ledgers',
                    'Custom White-Labeled Client Report Generation',
                    'Multi-User Staff Logins (up to 5 members)',
                    'Automated Client Payment & Reminder Rules',
                    'Live Chat Support & Direct API Sandbox Access'
                ]
            },
            {
                name: 'FIN-PRO Enterprise',
                priceAnnually: 19999,
                originalPrice: 29999,
                desc: 'Complete control and white-labeling for national firms.',
                icon: Crown,
                color: '#1D4ED8',
                badge: 'All Inclusive',
                features: [
                    'Manage Unlimited Active Client Ledgers',
                    'Fully Branded Dedicated Client Portal System',
                    'Uncapped Staff Logins with Advanced Permissions',
                    'Dedicated Account Executive & API/ERP Sync',
                    'Priority 24/7/365 Direct VIP Phone Support'
                ]
            }
        ],
        betaclub_investor: [
            {
                name: 'Beta Angel',
                priceAnnually: 4999,
                originalPrice: 7999,
                desc: 'Access curated startup directories and begin early-stage venture backing.',
                icon: ShieldCheck,
                color: '#7C3AED',
                badge: 'Early Stage',
                features: [
                    'Access to curated startup and deal directories',
                    'Filter pitches by industry, funding goal, and equity share',
                    'Direct contact channels with verified founders (up to 15/mo)',
                    'Access to standard investor mastermind forums',
                    'Real-time notifications for newly listed ventures'
                ]
            },
            {
                name: 'Beta Venture Partner',
                priceAnnually: 9999,
                originalPrice: 14999,
                desc: 'Designed for professional angels, syndicate participants, and active investors.',
                icon: Zap,
                color: '#6D28D9',
                badge: 'Professional Dealflow',
                features: [
                    'All features of Beta Angel tier',
                    'Direct contact details for unlimited startup listings',
                    'Interactive deal rooms & shared pitch folders',
                    'Monthly co-investment circulars & VC partner access',
                    '1-on-1 deal flow consultations with steering team'
                ]
            },
            {
                name: 'Beta Syndicate Lead',
                priceAnnually: 24999,
                originalPrice: 39999,
                desc: 'Ultimate sovereign tier for syndicates, institutional offices, and active VC networks.',
                icon: Crown,
                color: '#5B21B6',
                badge: 'VIP Sovereign',
                features: [
                    'All features of Beta Venture Partner tier',
                    'Direct syndicate matching & co-investment structures',
                    'VIP reserved seat at the Annual Founder\'s & Investor Gala',
                    'Priority invitations to physical Family Office roundtables',
                    'Dedicated investment analyst assistance & custom market research'
                ]
            }
        ],
        betaclub_product: [
            {
                name: 'Beta Innovator',
                priceAnnually: 1999,
                originalPrice: 2999,
                desc: 'Early access for founders seeking foundational product testing & community reach.',
                icon: ShieldCheck,
                color: '#EC4899',
                badge: 'Spark Launch',
                features: [
                    'Early access to new platform updates & beta tools',
                    'Standard community mastermind forum access',
                    'List 1 active roadmap/pitch in the Deal Marketplace',
                    '10% direct discount on partner integration modules',
                    'Standard investor-ready pitch templates & checklists'
                ]
            },
            {
                name: 'Beta Founder Premium',
                priceAnnually: 4999,
                originalPrice: 7999,
                desc: 'High-impact visibility, top placement, and verified badge for active venture teams.',
                icon: Zap,
                color: '#DB2777',
                badge: 'Venture Exposure',
                features: [
                    'All features of Beta Innovator tier',
                    'List up to 3 active roadmaps/pitches in the Marketplace',
                    'Top search placement inside the investor directory',
                    'Verified checkmark badge after deck review',
                    'Direct feedback channel to product steering team',
                    '20% lifetime discount on partner integrations'
                ]
            },
            {
                name: 'Beta Founding Partner',
                priceAnnually: 14999,
                originalPrice: 24999,
                desc: 'Sovereign founder tier with steering seat, lifetime fee freeze, and VIP gala entry.',
                icon: Crown,
                color: '#BE185D',
                badge: 'Founder Legacy',
                features: [
                    'All features of Beta Founder Premium tier',
                    'Unlimited active roadmaps/pitches in the Marketplace',
                    'Featured homepage and dashboard spotlight placement',
                    'VIP reserved seat at the Annual Founder\'s Gala',
                    'Direct voting seat on feature steering committee',
                    'Private Pitch-to-VC roundtable access pipelines',
                    'Lifetime subscription fee freeze guarantee'
                ]
            }
        ]
    };

    const invoices = [
        { id: 'INV-2026-041', date: '2026-05-01', tier: 'Growth Plan', amount: '₹6,999', status: 'Paid', method: 'UPI (Razorpay)' },
        { id: 'INV-2026-029', date: '2025-05-01', tier: 'Growth Plan', amount: '₹6,999', status: 'Paid', method: 'Bank Transfer' }
    ];

    const getRenewalDetails = () => {
        let foundTier = null;
        for (const cat of Object.keys(allTiers)) {
            const match = allTiers[cat].find(t => t.name === selectedTier);
            if (match) {
                foundTier = { ...match, category: cat };
                break;
            }
        }
        if (!foundTier) {
            return {
                price: '6,999',
                desc: 'Your workspace is configured with high-performance ERP pipelines. All accounting, manufacturing, and HR modules are fully active.',
                gradient: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                color: '#1B6B3A'
            };
        }
        
        let desc = '';
        let gradient = '';
        if (foundTier.category === 'business') {
            desc = `Your workspace is configured with high-performance ERP pipelines under the Business ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)';
        } else if (foundTier.category === 'ca') {
            desc = `Your workspace is configured with comprehensive auditor pipelines under the FIN-PRO ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)';
        } else if (foundTier.category === 'betaclub_investor') {
            desc = `Your workspace is configured with exclusive investor network pipelines under the Beta Club (Investor) ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)';
        } else {
            desc = `Your workspace is configured with high-exposure roadmap channels under the Beta Club (Products & Ideas) ${foundTier.name} tier.`;
            gradient = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
        }
        
        return {
            price: foundTier.priceAnnually.toLocaleString(),
            desc: desc,
            gradient: gradient,
            color: foundTier.color
        };
    };

    const renewal = getRenewalDetails();

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .sub-tab-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .sub-tab-btn:hover {
                    transform: translateY(-1px) scale(1.03);
                    opacity: 0.95;
                }
                .plan-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .plan-card:hover {
                    transform: translateY(-8px) !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08) !important;
                }
                .upgrade-btn {
                    transition: all 0.2s ease-in-out;
                }
                .upgrade-btn:hover {
                    opacity: 0.95;
                    transform: scale(1.02);
                }
            `}</style>

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
                
                {/* Billing Badge */}
                <div style={{ display: 'flex', background: '#DCF2E4', padding: '0.6rem 1.25rem', borderRadius: '14px', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#064E3B', fontWeight: '800', fontSize: '0.85rem' }}>Annual Billing Cycle</span>
                    <span style={{ background: '#1B6B3A', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: '800' }}>ACTIVE</span>
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Current Tier Widget */}
            <div style={{ 
                background: renewal.gradient, 
                borderRadius: '24px', 
                padding: '1.25rem 2rem', 
                color: 'white', 
                marginBottom: '2rem', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: `0 12px 20px -8px ${renewal.color}30`, 
                transition: 'all 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Active Plan:</span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, lineHeight: 1.2 }}>{selectedTier}</h2>
                        </div>
                        <p style={{ color: '#DCF2E4', fontWeight: '500', fontSize: '0.85rem', margin: 0, opacity: 0.95 }}>{renewal.desc}</p>
                    </div>
                </div>

                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.12)', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#DCF2E4', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Next Renewal</p>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>01 May, 2027</h3>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#DCF2E4', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Renewal Amount</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0 }}>₹{renewal.price} <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.8 }}>+ GST</span></p>
                    </div>
                </div>
            </div>

            {/* Custom Modern Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                    display: 'flex', 
                    background: 'rgba(220, 242, 228, 0.7)', 
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(27, 107, 58, 0.15)',
                    boxShadow: '0 8px 32px 0 rgba(27, 107, 58, 0.04)',
                    gap: '0.25rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {[
                        { id: 'business', label: 'Business', icon: ShieldCheck, color: '#1B6B3A' },
                        { id: 'ca', label: 'FIN-PRO (Auditor)', icon: Award, color: '#1E3A8A' },
                        { id: 'betaclub', label: 'Beta Club', icon: Crown, color: '#7C3AED' }
                    ].map((tab) => {
                        const isTabActive = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className="sub-tab-btn"
                                onClick={() => setActiveCategory(tab.id)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: isTabActive 
                                        ? `linear-gradient(135deg, ${tab.color} 0%, #0c0f1d 160%)` 
                                        : 'transparent',
                                    color: isTabActive ? 'white' : '#475569',
                                    fontSize: '0.9rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transform: isTabActive ? 'scale(1.04)' : 'scale(1)',
                                    boxShadow: isTabActive ? `0 10px 15px -3px ${tab.color}40` : 'none'
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nested Sub-selector when Beta Club is active */}
            {activeCategory === 'betaclub' && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '2rem', 
                    marginBottom: '3rem', 
                    flexWrap: 'wrap' 
                }}>
                    <div 
                        onClick={() => setBetaSubCategory('investor')}
                        style={{
                            background: betaSubCategory === 'investor' ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'white',
                            color: betaSubCategory === 'investor' ? 'white' : '#1E293B',
                            border: betaSubCategory === 'investor' ? 'none' : '1px solid #E2E8F0',
                            padding: '1.25rem 2rem',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            width: '280px',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: betaSubCategory === 'investor' ? '0 15px 30px rgba(124, 58, 237, 0.25)' : 'none',
                            transform: betaSubCategory === 'investor' ? 'scale(1.05) translateY(-4px)' : 'scale(1)'
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Crown size={20} /> Investor Club
                        </h4>
                    </div>

                    <div 
                        onClick={() => setBetaSubCategory('product')}
                        style={{
                            background: betaSubCategory === 'product' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'white',
                            color: betaSubCategory === 'product' ? 'white' : '#1E293B',
                            border: betaSubCategory === 'product' ? 'none' : '1px solid #E2E8F0',
                            padding: '1.25rem 2rem',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            width: '280px',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: betaSubCategory === 'product' ? '0 15px 30px rgba(236, 72, 153, 0.25)' : 'none',
                            transform: betaSubCategory === 'product' ? 'scale(1.05) translateY(-4px)' : 'scale(1)'
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Zap size={20} /> Products & Ideas
                        </h4>
                    </div>
                </div>
            )}

            {/* Pricing Tiers Selection Grid */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.25rem' }}>Upgrade Workspace Tier</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {allTiers[activeCategory === 'betaclub' ? (betaSubCategory === 'investor' ? 'betaclub_investor' : 'betaclub_product') : activeCategory].map((tier, idx) => {
                    const price = tier.priceAnnually;
                    const isActive = tier.name === selectedTier;
                    const TierIcon = tier.icon;
                    return (
                        <div 
                            key={idx} 
                            className="plan-card"
                            onClick={() => setSelectedTier(tier.name)}
                            style={{ 
                                background: 'white', 
                                borderRadius: '24px', 
                                border: isActive ? `3px solid ${tier.color}` : '1px solid #E2E8F0',
                                padding: '1.75rem 2rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transform: isActive ? 'translateY(-6px)' : 'none',
                                boxShadow: isActive ? `0 20px 25px -5px ${tier.color}15` : 'none'
                            }}
                        >
                            {isActive && (
                                <span style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: tier.color, color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '0.4rem 0.8rem', borderRadius: '10px', textTransform: 'uppercase' }}>
                                    {tier.badge}
                                </span>
                            )}
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${tier.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color, marginBottom: '1rem' }}>
                                <TierIcon size={24} />
                            </div>
                            <h4 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>{tier.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500', marginBottom: '1.25rem', minHeight: '34px' }}>{tier.desc}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#94A3B8', textDecoration: 'line-through' }}>₹{tier.originalPrice.toLocaleString()}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1B6B3A', background: '#DCF2E4', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Save ₹{(tier.originalPrice - price).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    <span style={{ fontSize: '2.25rem', fontWeight: '900', color: '#1E293B' }}>₹{price.toLocaleString()}</span>
                                    <span style={{ color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>/ year</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B' }}>
                                    (Equivalent to ₹{Math.round(price / 12).toLocaleString()} per month)
                                </span>
                            </div>

                            <button 
                                className="upgrade-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpgrade(tier);
                                }}
                                disabled={isProcessing}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.85rem', 
                                    borderRadius: '16px', 
                                    border: isActive ? 'none' : `1px solid ${tier.color}`,
                                    background: isActive ? `linear-gradient(135deg, ${tier.color} 0%, #0c0f1d 160%)` : (isProcessing ? '#94A3B8' : 'white'),
                                    color: isActive ? 'white' : tier.color,
                                    fontWeight: '800',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    marginBottom: '1.25rem'
                                }}
                            >
                                {isActive ? 'Currently Active Plan' : (isProcessing ? 'Connecting...' : 'Upgrade Plan')}
                            </button>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>What's Included</p>
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
