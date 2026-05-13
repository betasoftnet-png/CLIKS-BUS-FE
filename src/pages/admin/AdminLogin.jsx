import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Terminal, 
    Lock, 
    User, 
    ShieldAlert, 
    Loader2, 
    ArrowRight, 
    Cpu,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context';
import logoPng from '../../assets/cliks.png';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!identifier || !password) {
            setError('Identify vector and key sequence required.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await login(identifier, password);
            
            // Enforce strict Admin check
            if (data.user && data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                logout(); // Clear standard user token
                setError('SECURITY VIOLATION: Account lacks Platform Control clearance.');
            }
        } catch (err) {
            console.error('Admin authorization failure:', err);
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
            background: '#09090B', // Rich OLED Dark
            fontFamily: "'Inter', sans-serif",
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Dynamic Grid Background Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(79, 70, 229, 0.15) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.4
            }} />
            
            {/* Animated Ambient Glow Shards */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '30%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '30%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
            }} />

            <div style={{
                position: 'relative',
                maxWidth: '450px',
                width: '90%',
                background: 'rgba(15, 15, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(24px)',
                borderRadius: '24px',
                padding: '3rem 2.5rem',
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <style>{`
                    .admin-input-group {
                        width: 100%;
                        margin-bottom: 1.25rem;
                    }
                    .admin-label {
                        display: block;
                        font-size: 0.7rem;
                        font-weight: 800;
                        color: #A1A1AA;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 0.5rem;
                    }
                    .admin-input-wrapper {
                        position: relative;
                        width: 100%;
                    }
                    .admin-input {
                        width: 100%;
                        background: rgba(24, 24, 27, 0.6);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        padding: 0.85rem 1rem 0.85rem 2.75rem;
                        color: white;
                        font-size: 0.9rem;
                        outline: none;
                        transition: all 0.2s ease;
                    }
                    .admin-input:focus {
                        border-color: #6366F1;
                        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
                        background: rgba(24, 24, 27, 0.9);
                    }
                    .admin-icon {
                        position: absolute;
                        left: 1rem;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #71717A;
                        transition: color 0.2s;
                    }
                    .admin-input:focus + .admin-icon {
                        color: #6366F1;
                    }
                    .cyber-btn {
                        width: 100%;
                        margin-top: 1rem;
                        padding: 1rem;
                        border-radius: 12px;
                        border: none;
                        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                        color: white;
                        font-size: 0.9rem;
                        font-weight: 800;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        transition: all 0.2s ease;
                        box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3);
                    }
                    .cyber-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 15px 35px rgba(79, 70, 229, 0.45);
                    }
                    .cyber-btn:active {
                        transform: translateY(0);
                    }
                    .cyber-btn:disabled {
                        background: #27272A;
                        color: #71717A;
                        box-shadow: none;
                        cursor: not-allowed;
                    }
                    .glow-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #10B981;
                        box-shadow: 0 0 8px #10B981;
                        display: inline-block;
                        margin-right: 6px;
                    }
                `}</style>

                {/* System Status Badge */}
                <div style={{
                    background: 'rgba(24, 24, 27, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '30px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: '#A1A1AA',
                    letterSpacing: '1px',
                    marginBottom: '2rem'
                }}>
                    <span className="glow-dot" /> GATEWAY ONLINE
                </div>

                {/* Title Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <ShieldAlert size={28} color="#6366F1" />
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>Platform Core</h1>
                    </div>
                    <p style={{ color: '#71717A', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                        Enter administrative identity coordinates to establish terminal link.
                    </p>
                </div>

                {/* Error Cluster */}
                {error && (
                    <div style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.07)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        color: '#F87171',
                        fontSize: '0.8rem',
                        fontWeight: '650',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        marginBottom: '1.5rem'
                    }}>
                        <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <div className="admin-input-group">
                        <label className="admin-label">Admin Handle / Email</label>
                        <div className="admin-input-wrapper">
                            <input 
                                type="text" 
                                className="admin-input"
                                placeholder="identifier_v1"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <User size={16} className="admin-icon" />
                        </div>
                    </div>

                    <div className="admin-input-group" style={{ marginBottom: '2rem' }}>
                        <label className="admin-label">Auth Access Token Key</label>
                        <div className="admin-input-wrapper">
                            <input 
                                type="password" 
                                className="admin-input"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                            <Lock size={16} className="admin-icon" />
                        </div>
                    </div>

                    <button type="submit" className="cyber-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Initializing Encryption...
                            </>
                        ) : (
                            <>
                                Establish Link
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Metadata */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#3F3F46',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                }}>
                    <Cpu size={12} /> SHA-256 SECURE CONTROL LINK
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
