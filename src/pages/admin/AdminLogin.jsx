import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Lock, 
    Mail, 
    ShieldCheck, 
    Loader2, 
    ArrowRight, 
    Cpu,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { adminLogin } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Administrative email and password required.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Calls decoupled native authentication table flow
            const data = await adminLogin(email, password);
            
            // Strict role asserting on successful session hydration
            if (data.user && data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                setError('Access Violation: Lacks Platform Control authorization.');
            }
        } catch (err) {
            console.error('Platform Handshake Failed:', err);
            const errMsg = err.response?.data?.error?.message || err.message || 'Handshake rejected. Validate access parameters.';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#030712', // Extreme OLED Black
            fontFamily: "'Inter', sans-serif",
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* High-Fidelity Subtle Matrix Grid Layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                opacity: 0.5
            }} />
            
            {/* Ambient Core Core-Shards */}
            <div style={{
                position: 'absolute',
                top: '15%',
                left: '25%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '25%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                filter: 'blur(60px)'
            }} />

            <div style={{
                position: 'relative',
                maxWidth: '460px',
                width: '92%',
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(32px)',
                borderRadius: '28px',
                padding: '3.5rem 3rem',
                boxShadow: '0 35px 90px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <style>{`
                    .admin-input-group {
                        width: 100%;
                        margin-bottom: 1.5rem;
                    }
                    .admin-label {
                        display: block;
                        font-size: 0.75rem;
                        font-weight: 700;
                        color: #9CA3AF;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        margin-bottom: 0.6rem;
                    }
                    .admin-input-wrapper {
                        position: relative;
                        width: 100%;
                    }
                    .admin-input {
                        width: 100%;
                        background: rgba(15, 23, 42, 0.8);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 14px;
                        padding: 1rem 1rem 1rem 3rem;
                        color: #F9FAFB;
                        font-size: 0.95rem;
                        outline: none;
                        transition: all 0.25s ease;
                    }
                    .admin-input:focus {
                        border-color: #818CF8;
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
                        background: rgba(15, 23, 42, 1);
                    }
                    .admin-icon {
                        position: absolute;
                        left: 1.1rem;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #6B7280;
                        transition: color 0.25s;
                    }
                    .admin-input:focus + .admin-icon {
                        color: #818CF8;
                    }
                    .cyber-btn {
                        width: 100%;
                        margin-top: 1rem;
                        padding: 1.1rem;
                        border-radius: 14px;
                        border: none;
                        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
                        color: white;
                        font-size: 1rem;
                        font-weight: 800;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.6rem;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
                    }
                    .cyber-btn:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 20px 45px rgba(99, 102, 241, 0.5);
                        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                    }
                    .cyber-btn:active {
                        transform: translateY(0);
                    }
                    .cyber-btn:disabled {
                        background: #1F2937;
                        color: #4B5563;
                        box-shadow: none;
                        cursor: not-allowed;
                    }
                    .glow-indicator {
                        width: 7px;
                        height: 7px;
                        border-radius: 50%;
                        background: #34D399;
                        box-shadow: 0 0 12px #34D399;
                        display: inline-block;
                        margin-right: 8px;
                    }
                `}</style>

                {/* Cluster Online Status Indicator */}
                <div style={{
                    background: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '40px',
                    padding: '5px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: '#D1D5DB',
                    letterSpacing: '1.5px',
                    marginBottom: '2.5rem'
                }}>
                    <span className="glow-indicator" /> PLATFORM CORE ONLINE
                </div>

                {/* Main Header Group */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} color="#818CF8" />
                        <h1 style={{ 
                            color: 'white', 
                            fontSize: '1.9rem', 
                            fontWeight: 900, 
                            letterSpacing: '-0.75px', 
                            margin: 0,
                            background: 'linear-gradient(to bottom right, #FFFFFF, #9CA3AF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Admin Control
                        </h1>
                    </div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                        Establish isolated Platform Core handshake using designated administrative coordinates.
                    </p>
                </div>

                {/* Core Error Interceptor Cluster */}
                {error && (
                    <div style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.09)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '14px',
                        padding: '1rem',
                        color: '#FCA5A5',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        marginBottom: '2rem'
                    }}>
                        <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Handshake Credentials Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="admin-input-group">
                        <label className="admin-label">Administrative Email</label>
                        <div className="admin-input-wrapper">
                            <input 
                                type="email" 
                                className="admin-input"
                                placeholder="admin@cliksbusiness.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <Mail size={18} className="admin-icon" />
                        </div>
                    </div>

                    <div className="admin-input-group" style={{ marginBottom: '2.5rem' }}>
                        <label className="admin-label">Encryption Vector Key</label>
                        <div className="admin-input-wrapper">
                            <input 
                                type="password" 
                                className="admin-input"
                                placeholder="••••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <Lock size={18} className="admin-icon" />
                        </div>
                    </div>

                    <button type="submit" className="cyber-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Authorizing Vectors...
                            </>
                        ) : (
                            <>
                                Establish Link
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Bottom Encryption Badge */}
                <div style={{
                    marginTop: '3.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#4B5563',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '1px'
                }}>
                    <Cpu size={14} /> SHA-512 SECURE TUNNEL ACTIVE
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
