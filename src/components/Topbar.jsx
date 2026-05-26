import React from 'react';
import { BookOpen, Calculator, Users, Coins } from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks5.png'; // Final branding

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';

const Topbar = ({ onToggleSidebar, isSidebarOpen }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Reward points state synced with localStorage
    const [rewardPoints, setRewardPoints] = React.useState(() => {
        const saved = localStorage.getItem('cliks_reward_points');
        return saved ? parseInt(saved, 10) : 1000; // default 1000 Pts
    });

    React.useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('cliks_reward_points');
            setRewardPoints(saved ? parseInt(saved, 10) : 1000);
        };
        window.addEventListener('storage', handleStorageChange);
        // Also poll every 1 second to keep it perfectly updated across standard react page changes
        const interval = setInterval(handleStorageChange, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Rigid Mode Derivation for Admin & Sales desks to omit redundant consumer modules
    const isAdminOrSales = 
        ['admin', 'sales'].includes(user?.role) || 
        location.pathname.includes('/admin/') || 
        location.pathname.includes('/sales-portal/');

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Synchronous Persistent Module Derivation
    let activeModule = sessionStorage.getItem('active_cliks_module') || 'books';
    if (location.pathname.startsWith('/social/')) {
        activeModule = 'social';
        sessionStorage.setItem('active_cliks_module', 'social');
    } else if (location.pathname.startsWith('/payments/')) {
        activeModule = 'payments';
        sessionStorage.setItem('active_cliks_module', 'payments');
    } else if (
        !location.pathname.includes('/admin/') &&
        !['/settings', '/faq', '/subscription', '/profile', '/referral'].some(p => location.pathname.startsWith(p)) &&
        location.pathname !== '/'
    ) {
        activeModule = 'books';
        sessionStorage.setItem('active_cliks_module', 'books');
    }

    const isSocialActive = activeModule === 'social';
    const isFinanceActive = activeModule === 'payments';

    const navItems = [
        { name: 'Books', url: '/dashboard', icon: BookOpen, active: activeModule === 'books' },
        { name: 'Payments', url: '/payments/people', icon: Calculator, active: isFinanceActive },
        { name: 'Social', url: '/social/meetup', icon: Users, active: isSocialActive },
    ];

    return (
        <header className="topbar">
            {/* Left: Branding / App Switcher */}
            <div className="topbar-left">
                {/* ... existing logo code ... */}
                <div
                    className="logo-area"
                    onClick={onToggleSidebar}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle Sidebar"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onToggleSidebar();
                        }
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    title="Toggle Sidebar"
                >
                    <div className="brand-logo-small" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <img src={logoPng} alt="CLIKS Logo" style={{ width: '28px', height: '28px' }} />
                    </div>
                    <span style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                        Cliks Business
                    </span>
                </div>
            </div>

            {/* Hamburger Button (Mobile) - Now toggles Sidebar! */}
            <button
                className={`hamburger ${isSidebarOpen ? 'active' : ''}`}
                onClick={onToggleSidebar}
                aria-label="Toggle Sidebar"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Center: Navigation (New Lamp Style) - Hidden for Platform Control / Sales Representative desks */}
            {!isAdminOrSales && (
                <div className="top-nav-links" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.active;

                        return (
                            <button
                                key={item.name}
                                onClick={() => item.action ? item.action() : handleNavigation(item.url)}
                                aria-label={item.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 20px',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }}
                            >
                                <span className="hidden md:inline">{item.name}</span>
                                <span className="md:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            )}

            {/* Right Group (Audit + Profile) */}
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
                {/* Points Wallet Widget with circular progress ring */}
                {(() => {
                    const maxPts = 10000;
                    const pct = Math.min(rewardPoints / maxPts, 1);
                    const r = 22;
                    const circ = 2 * Math.PI * r;
                    const dash = circ * pct;
                    return (
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/payments/wallet?tab=points')} title="Loyalty Points">
                            <svg width="52" height="52" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                                <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
                                <circle
                                    cx="26" cy="26" r={r}
                                    fill="none"
                                    stroke="#FBBF24"
                                    strokeWidth="3"
                                    strokeDasharray={`${dash} ${circ}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 0.5s ease', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' }}
                                />
                            </svg>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate('/payments/wallet?tab=points'); }}
                                title="Loyalty Points - Convert to wallet balance"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '0',
                                    borderRadius: '999px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#D97706',
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    outline: 'none',
                                    width: '44px',
                                    height: '44px',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    lineHeight: 1.1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.08)';
                                    e.currentTarget.style.color = '#F59E0B';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.color = '#D97706';
                                }}
                            >
                                <Coins size={15} style={{ flexShrink: 0, color: '#F59E0B' }} />
                                <span style={{ whiteSpace: 'nowrap', fontSize: '9.5px', fontWeight: '900' }}>{rewardPoints >= 1000 ? `${(rewardPoints/1000).toFixed(1)}K` : rewardPoints} pts</span>
                            </button>
                        </div>
                    );
                })()}

                <CalcPopover />
                <ProfileDropdown
                    onAccount={() => navigate('/profile')}
                    onSettings={() => navigate('/settings')}
                    onFAQ={() => navigate('/faq')}
                    onLogout={handleLogout}
                />
            </div>
        </header>
    );
};

export default Topbar;

