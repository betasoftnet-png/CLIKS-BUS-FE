import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context';

const SupportLogin = () => {
    const { supportAgentLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await supportAgentLogin(email, password);
            if (res && res.success) {
                navigate('/support-portal/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Access Violation: Support credentials mismatch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'radial-gradient(circle at top right, #EEF2FF 0%, #E0E7FF 100%)',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '440px', 
                padding: '2.5rem', 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '28px', 
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.08), 0 0 1px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.6)',
                position: 'relative'
            }}>
                
                {/* Decorative Banner badge */}
                <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)' }}>
                    <MessageSquare size={12} /> SUPPORT CENTER CLEARANCE
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '0.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1E293B', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                        Cliks Support
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                        Sign in to claim tickets, respond to users, and manage platform escalation logs.
                    </p>
                </div>

                {error && (
                    <div style={{ 
                        background: '#FEF2F2', 
                        color: '#EF4444', 
                        padding: '0.85rem', 
                        borderRadius: '14px', 
                        fontSize: '0.8rem', 
                        fontWeight: '700', 
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid #FEE2E2'
                    }}>
                        <ShieldAlert size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Specialist Email</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '0 1rem', transition: 'border-color 0.2s' }}>
                            <Mail size={18} style={{ color: '#94A3B8' }} />
                            <input 
                                type="email" 
                                required
                                placeholder="support@cliksbusiness.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.9rem 0.75rem', border: 'none', background: 'transparent', outline: 'none', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Security Passcode</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '0 1rem', transition: 'border-color 0.2s' }}>
                            <Lock size={18} style={{ color: '#94A3B8' }} />
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.9rem 0.75rem', border: 'none', background: 'transparent', outline: 'none', fontWeight: '600', color: '#1E293B', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', 
                            color: '#FFFFFF', 
                            border: 'none', 
                            padding: '1rem', 
                            borderRadius: '14px', 
                            fontSize: '0.95rem', 
                            fontWeight: '800', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25)',
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {loading ? 'Verifying Coordinates...' : (
                            <>Authenticate Support Desk <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default SupportLogin;
