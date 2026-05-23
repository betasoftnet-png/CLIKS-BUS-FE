import React, { useState } from 'react';
import { User, QrCode, Wallet, Home, BookOpen, Calculator, Users, Coins, ShieldCheck } from 'lucide-react';

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
    const [isTrustOpen, setIsTrustOpen] = useState(false);

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

    const getBetaTrustScore = () => {
        if (!user) return { total: 85, base: 70, sub: 15, profile: 0, activity: 0 };
        const baseScore = 70;
        const subBonus = user.tier ? 15 : 0;
        const profileBonus = user.name && user.email ? 10 : 0;
        const todayStr = new Date().toDateString();
        const dailyActivity = Array.from(todayStr).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
        return {
            total: Math.min(100, baseScore + subBonus + profileBonus + dailyActivity),
            base: baseScore,
            sub: subBonus,
            profile: profileBonus,
            activity: dailyActivity
        };
    };
    const trustData = getBetaTrustScore();

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
                {!isAdminOrSales && (
                    <div style={{ position: 'relative' }}>
                        <div 
                            onClick={() => setIsTrustOpen(!isTrustOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                                border: '1px solid #86EFAC',
                                padding: '4px 12px',
                                borderRadius: '99px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(22, 163, 74, 0.25)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(22, 163, 74, 0.15)';
                            }}
                        >
                            <ShieldCheck size={16} color="#15803D" style={{ flexShrink: 0 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                                <span style={{ fontWeight: '900', fontSize: '13px', color: '#14532D', letterSpacing: '-0.01em', lineHeight: '1' }}>
                                    {trustData.total}%
                                </span>
                                <span style={{ fontSize: '9px', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1' }}>
                                    Beta Trust
                                </span>
                            </div>
                        </div>

                        {isTrustOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '120%',
                                right: '0',
                                width: '240px',
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                                padding: '1.25rem',
                                zIndex: 100,
                                color: '#1E293B',
                                cursor: 'default'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Beta Trust Breakdown</h4>
                                </div>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>
                                    Your score decreases if you lack subscription tiers, profile details, or regular daily activity.
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#475569', fontWeight: '500' }}>Base Score</span>
                                        <span style={{ fontWeight: '700', color: '#16A34A' }}>{trustData.base}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#475569', fontWeight: '500' }}>Subscription Bonus</span>
                                        <span style={{ fontWeight: '700', color: trustData.sub > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.sub}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#475569', fontWeight: '500' }}>Profile Completeness</span>
                                        <span style={{ fontWeight: '700', color: trustData.profile > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.profile}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#475569', fontWeight: '500' }}>Daily Activity Bonus</span>
                                        <span style={{ fontWeight: '700', color: trustData.activity > 0 ? '#16A34A' : '#94A3B8' }}>+{trustData.activity}%</span>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '800', color: '#0F172A' }}>Total Trust</span>
                                    <span style={{ fontWeight: '900', fontSize: '1.1rem', color: '#1B6B3A' }}>{trustData.total}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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

