import React, { useState } from 'react';
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
    ChevronRight
} from 'lucide-react';
import '../App.css';

const BusinessReferral = () => {
    const [copied, setCopied] = useState(false);
    const [referralCode] = useState('CLIK-BIZ-8391X');
    const referralLink = `https://cliksbusiness.com/join?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const rewardsRoadmap = [
        { points: 500, benefit: '⭐ 1-Month Pro Access', desc: 'Unlock AI Analytics for 30 days.', achieved: true },
        { points: 1000, benefit: '🥇 Gold Referral Badge', desc: 'Featured spotlight in community feeds.', achieved: true },
        { points: 2500, benefit: '🎟️ Exclusive Merch Kit', desc: 'Get branded apparel & accessories.', achieved: false },
        { points: 5000, benefit: '💰 ₹2,500 Direct Cash', desc: 'Straight withdrawal to verified bank account.', achieved: false }
    ];

    const activities = [
        { name: 'Apex Retailers', date: '2 hours ago', action: 'Signed Up Successfully', points: '+250 pts', status: 'completed' },
        { name: 'Siddharth Electronics', date: 'Yesterday', action: 'Business Profile Verified', points: '+150 pts', status: 'completed' },
        { name: 'Modern Bakeries', date: '3 days ago', action: 'Registered Account', points: '+50 pts', status: 'completed' },
        { name: 'Praveen Logistics', date: '1 week ago', action: 'Awaiting First Invoice', points: 'Pending', status: 'pending' }
    ];

    return (
        <div style={{ padding: '2.5rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Overhead Title Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            boxShadow: '0 8px 16px rgba(217, 119, 6, 0.2)'
                        }}>
                            <Gift size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em', margin: 0 }}>Refer & Earn</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '1rem', fontWeight: '500', margin: 0 }}>Invite fellow businesses to CLIKS. Earn premium points for every successful activation!</p>
                </div>
            </div>

            {/* Hero Banner (Splendor design) */}
            <div style={{ 
                background: 'linear-gradient(135deg, #064E3B 0%, #1B6B3A 100%)', 
                borderRadius: '30px', 
                padding: '3rem', 
                color: 'white', 
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2.5rem',
                boxShadow: '0 20px 40px rgba(6, 78, 59, 0.15)'
            }}>
                {/* Visual Glow effects */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ maxWidth: '60%', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.5rem 1rem', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <Sparkles size={16} color="#FCD34D" />
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exclusive Referral Program</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '950', margin: '0 0 1rem 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Build the Network,<br/>Secure Lifetime Benefits</h2>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem', lineHeight: 1.6, margin: 0, fontWeight: '450' }}>
                        Introduce clients, suppliers, or business associates to the all-in-one CLIKS dashboard. For each active subscription initialized, you instantly collect <b>500 points</b> redeemable for premium license extensions!
                    </p>
                </div>

                {/* Dynamic Points Pill in Hero */}
                <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(12px)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '24px', 
                    padding: '2rem',
                    textAlign: 'center',
                    minWidth: '240px',
                    zIndex: 1
                }}>
                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FCD34D', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                        <Coins size={28} />
                    </div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#D1FAE5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Current Points Balance</span>
                    <h3 style={{ fontSize: '2.75rem', fontWeight: '950', margin: 0, color: '#FFFFFF', lineHeight: 1 }}>1,450</h3>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', fontWeight: '700', color: '#A7F3D0' }}>Tier Level: Gold Elite 👑</p>
                </div>
            </div>

            {/* Analytics Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 1.75rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Referred</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: '#0F172A' }}>14 Associates</h4>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} />
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 1.75rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Converters</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: '#0F172A' }}>8 Premium Users</h4>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={22} />
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem 1.75rem', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Growth Impact</span>
                        <h4 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, color: '#0F172A' }}>+38% Month</h4>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={22} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Left Column: Referral Link Sharing & Roadmap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Referral Engine Container */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1F2937', margin: '0 0 1.25rem 0' }}>Your Digital Invite Card</h3>
                        <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                            Share your custom business invitation path. Clicking this tracks their full verification cycle automatically linked to your points bank.
                        </p>

                        <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input 
                                readOnly
                                value={referralLink}
                                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '0.95rem', fontWeight: '700', color: '#064E3B', outline: 'none' }}
                            />
                            <button 
                                onClick={copyToClipboard}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', 
                                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                                    background: copied ? '#059669' : '#1E293B', color: 'white',
                                    fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s ease'
                                }}
                            >
                                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy URL</>}
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Quick Dispatch:</span>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {[
                                    { icon: Share2, bg: '#F3F4F6', color: '#374151' },
                                    { icon: Twitter, bg: '#EFF6FF', color: '#3B82F6' },
                                    { icon: Facebook, bg: '#EEF2FF', color: '#4F46E5' },
                                    { icon: Linkedin, bg: '#F0F9FF', color: '#0284C7' }
                                ].map((sns, idx) => (
                                    <button 
                                        key={idx} 
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: sns.bg, color: sns.color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <sns.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Progression Path / Milestone Rewards */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1F2937', margin: '0 0 1.5rem 0' }}>Milestones & Threshold Rewards</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {rewardsRoadmap.map((reward, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem', 
                                    padding: '1.25rem', 
                                    borderRadius: '18px', 
                                    background: reward.achieved ? '#ECFDF5' : '#F8FAFC',
                                    border: reward.achieved ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                                    position: 'relative'
                                }}>
                                    <div style={{ 
                                        width: '52px', 
                                        height: '52px', 
                                        borderRadius: '12px', 
                                        background: reward.achieved ? '#059669' : '#E2E8F0', 
                                        color: reward.achieved ? 'white' : '#64748B', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '950' }}>{reward.points}</span>
                                        <span style={{ fontSize: '0.55rem', fontWeight: '800', textTransform: 'uppercase' }}>Pts</span>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '850', color: reward.achieved ? '#065F46' : '#1E293B' }}>{reward.benefit}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '500', color: reward.achieved ? '#047857' : '#64748B' }}>{reward.desc}</p>
                                    </div>

                                    <div>
                                        {reward.achieved ? (
                                            <span style={{ fontSize: '0.7rem', fontWeight: '850', background: '#D1FAE5', color: '#047857', padding: '0.4rem 0.75rem', borderRadius: '8px', textTransform: 'uppercase', border: '1px solid #A7F3D0' }}>Achieved ✓</span>
                                        ) : (
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#F1F5F9', color: '#64748B', padding: '0.4rem 0.75rem', borderRadius: '8px', textTransform: 'uppercase' }}>Locked 🔒</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Activity Feeds & How it Works */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Interactive workflow map */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1F2937', margin: '0 0 1.5rem 0' }}>Simple 3-Step Cycle</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {[
                                { num: '01', title: 'Broadcast Referral URL', text: 'Share your distinct gateway link via Email, WhatsApp, or LinkedIn feeds.' },
                                { num: '02', title: 'Verification Check', text: 'Referred associates initialize their ledger dashboard and complete basic profile setup.' },
                                { num: '03', title: 'Points Generation', text: 'Bonus increments instantly credited into your active balance bank.' }
                            ].map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '950', color: '#059669', opacity: 0.4 }}>{step.num}</div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: '850', color: '#1E293B' }}>{step.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4, fontWeight: '500', color: '#64748B' }}>{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Conversion Activity Stream */}
                    <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1F2937', margin: '0 0 1.5rem 0' }}>Conversion Activity</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                            {activities.map((act, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.status === 'completed' ? '#10B981' : '#F59E0B', marginTop: '6px', flexShrink: 0 }} />
                                        <div>
                                            <h5 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: '850', color: '#1F2937' }}>{act.name}</h5>
                                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>{act.action} • {act.date}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.82rem', fontWeight: '900', color: act.status === 'completed' ? '#059669' : '#F59E0B' }}>{act.points}</span>
                                </div>
                            ))}
                        </div>

                        <button style={{ 
                            marginTop: '2rem', 
                            padding: '0.9rem', 
                            borderRadius: '12px', 
                            border: '1px solid #E2E8F0', 
                            background: '#F8FAFC', 
                            color: '#475569', 
                            fontSize: '0.85rem', 
                            fontWeight: '800', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}>
                            View Full Archive Log <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BusinessReferral;
