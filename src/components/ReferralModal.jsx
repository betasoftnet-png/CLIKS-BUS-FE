import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Gift, 
    X, 
    Copy, 
    Check, 
    Share2, 
    Twitter, 
    Facebook, 
    Linkedin,
    Coins,
    Users,
    CheckCircle2
} from 'lucide-react';
import '../App.css';

const ReferralModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [referralCode] = useState('CLIK-BIZ-8391X');
    const referralLink = `https://cliksbusiness.com/join?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = (platform) => {
        const text = `Join Cliks Business and supercharge your ledger today! Use my invite: ${referralLink}`;
        let url = '';
        if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        } else if (platform === 'facebook') {
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        } else if (platform === 'linkedin') {
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        }
        
        if (url) window.open(url, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '1.5rem',
                        fontFamily: "'Inter', sans-serif"
                    }}
                    onClick={onClose}
                >
                    <Motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{
                            background: '#FFFFFF',
                            width: '100%',
                            maxWidth: '500px',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.25rem',
                                right: '1.25rem',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <X size={18} />
                        </button>

                        {/* Top Banner with Gradient */}
                        <div style={{
                            background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
                            padding: '3rem 2.5rem 2.5rem 2.5rem',
                            textAlign: 'center',
                            position: 'relative',
                            color: '#FFFFFF'
                        }}>
                            {/* Background decorative blur */}
                            <div style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-20%',
                                width: '180px',
                                height: '180px',
                                background: 'rgba(20, 184, 166, 0.3)',
                                borderRadius: '50%',
                                filter: 'blur(30px)'
                            }} />

                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                color: '#78350F',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem auto',
                                boxShadow: '0 12px 24px rgba(245, 158, 11, 0.3)',
                            }}>
                                <Gift size={30} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Refer & Earn Premium</h2>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '450', lineHeight: '1.5', margin: 0 }}>
                                Introduce associates to CLIKS. For every active initialization, collect <span style={{ color: '#FCD34D', fontWeight: '800' }}>500 Points</span> instantly!
                            </p>
                        </div>

                        {/* Body Section */}
                        <div style={{ padding: '2.25rem 2.5rem' }}>
                            
                            {/* Link sharing interface */}
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                Your Unique Referral Link
                            </label>

                            <div style={{ 
                                background: '#F8FAFC', 
                                borderRadius: '16px', 
                                border: '1.5px dashed #CBD5E1', 
                                padding: '1rem 1.25rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                marginBottom: '1.75rem',
                                transition: 'border-color 0.2s'
                            }}>
                                <input 
                                    readOnly
                                    value={referralLink}
                                    style={{ 
                                        flex: 1, 
                                        background: 'transparent', 
                                        border: 'none', 
                                        fontSize: '0.9rem', 
                                        fontWeight: '700', 
                                        color: '#064E3B', 
                                        outline: 'none',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap'
                                    }}
                                />
                                <Motion.button 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.4rem', 
                                        padding: '0.65rem 1rem', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        background: copied ? '#059669' : '#1F2937', 
                                        color: 'white',
                                        fontWeight: '800', 
                                        fontSize: '0.8rem', 
                                        whiteSpace: 'nowrap',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy URL</>}
                                </Motion.button>
                            </div>

                            {/* Visual Quick Steps */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                                        <Users size={15} />
                                    </div>
                                    <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '550' }}>Friends join using your exclusive gateway link</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                                        <Coins size={15} />
                                    </div>
                                    <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '550' }}>Earn 500 points credited directly to wallet</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                        <CheckCircle2 size={15} />
                                    </div>
                                    <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '550' }}>Redeem points for premium subscription cycles</span>
                                </div>
                            </div>

                            {/* Share channels */}
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#64748B' }}>Share Instantly:</span>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {[
                                            { key: 'share', icon: Share2, bg: '#F1F5F9', color: '#334155' },
                                            { key: 'twitter', icon: Twitter, bg: '#E0F2FE', color: '#0EA5E9' },
                                            { key: 'facebook', icon: Facebook, bg: '#EEF2FF', color: '#4F46E5' },
                                            { key: 'linkedin', icon: Linkedin, bg: '#E0F2FE', color: '#0284C7' }
                                        ].map((sns) => (
                                            <Motion.button 
                                                key={sns.key}
                                                whileHover={{ scale: 1.1, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => sns.key === 'share' ? copyToClipboard() : shareUrl(sns.key)}
                                                style={{ 
                                                    width: '42px', 
                                                    height: '42px', 
                                                    borderRadius: '14px', 
                                                    border: 'none', 
                                                    background: sns.bg, 
                                                    color: sns.color, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <sns.icon size={18} />
                                            </Motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
