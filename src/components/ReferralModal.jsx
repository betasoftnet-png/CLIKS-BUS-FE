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
    CheckCircle2,
    MessageSquare,
    ExternalLink,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import referralService from '../services/referralService';
import '../App.css';

const ReferralModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const referralCode = referralService.getUserReferralCode();
    const referralLink = referralService.getReferralLink();
    const wallet = referralService.getWallet();

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
                            maxWidth: '520px',
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

                        {/* Top Header Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
                            padding: '2.5rem 2rem 2rem 2rem',
                            textAlign: 'center',
                            position: 'relative',
                            color: '#FFFFFF'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                                color: '#78350F',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                boxShadow: '0 12px 24px rgba(245, 158, 11, 0.3)',
                            }}>
                                <Gift size={30} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>Refer. Grow. Earn Premium.</h2>
                            <p style={{ opacity: 0.95, fontSize: '0.9rem', fontWeight: '500', lineHeight: '1.5', margin: 0 }}>
                                Refer a business owner → They join Cliks → They become active → You both earn rewards.
                            </p>
                            
                            {/* Live Wallet Chip */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.4rem 0.85rem', borderRadius: '99px', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.78rem', fontWeight: '800' }}>
                                <Coins size={14} color="#FCD34D" />
                                <span>Wallet: <strong style={{ color: '#FCD34D' }}>{wallet.available_points} Points</strong> Available</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.75rem 2rem' }}>
                            
                            {/* Key Incentives Box */}
                            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '0.85rem 1.1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#065F46' }}>
                                    <span>🎁 You earn <strong>500 Points</strong> when your referral becomes active.</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#047857' }}>
                                    <span>🚀 Earn <strong>1,000 Bonus Points</strong> if they upgrade to Premium.</span>
                                </div>
                            </div>

                            {/* Link Input Section */}
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                YOUR UNIQUE REFERRAL LINK
                            </label>

                            <div style={{ 
                                background: '#F8FAFC', 
                                borderRadius: '16px', 
                                border: '1.5px dashed #CBD5E1', 
                                padding: '0.85rem 1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                marginBottom: '1.5rem'
                            }}>
                                <input 
                                    readOnly
                                    value={referralLink}
                                    style={{ 
                                        flex: 1, 
                                        background: 'transparent', 
                                        border: 'none', 
                                        fontSize: '0.85rem', 
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
                                        padding: '0.6rem 0.9rem', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        background: copied ? '#059669' : '#1F2937', 
                                        color: 'white',
                                        fontWeight: '800', 
                                        fontSize: '0.8rem', 
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy URL</>}
                                </Motion.button>
                            </div>

                            {/* Share Buttons */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '850', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                                    SHARE INSTANTLY
                                </span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                                    {[
                                        { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, bg: '#25D366', color: 'white' },
                                        { key: 'facebook', label: 'Facebook', icon: Facebook, bg: '#1877F2', color: 'white' },
                                        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, bg: '#0A66C2', color: 'white' },
                                        { key: 'twitter', label: 'Twitter', icon: Twitter, bg: '#1DA1F2', color: 'white' }
                                    ].map((sns) => (
                                        <button 
                                            key={sns.key}
                                            onClick={() => shareUrl(sns.key)}
                                            style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                gap: '4px',
                                                padding: '0.6rem 0.4rem', 
                                                borderRadius: '12px', 
                                                border: 'none', 
                                                background: sns.bg, 
                                                color: sns.color, 
                                                cursor: 'pointer',
                                                fontWeight: '800',
                                                fontSize: '0.72rem'
                                            }}
                                        >
                                            <sns.icon size={16} />
                                            <span>{sns.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dashboard Navigation CTA */}
                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => {
                                        onClose();
                                        navigate('/referral');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.85rem',
                                        borderRadius: '14px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
                                        color: 'white',
                                        fontWeight: '850',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 8px 16px rgba(6, 78, 59, 0.15)'
                                    }}
                                >
                                    <Sparkles size={16} color="#FCD34D" />
                                    <span>View Referral Dashboard</span>
                                    <ExternalLink size={14} />
                                </button>
                            </div>

                        </div>
                    </Motion.div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default ReferralModal;
