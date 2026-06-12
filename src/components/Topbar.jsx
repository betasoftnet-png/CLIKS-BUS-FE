import React from 'react';
import { BookOpen, Calculator, Users, Coins, X, Search } from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks5.png'; // Final branding
import accessKitPng from '../assets/ACCESS KIT.png';
import { motion, AnimatePresence } from 'framer-motion';

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

    const [isAccessDrawerOpen, setIsAccessDrawerOpen] = React.useState(false);
    const [activeTool, setActiveTool] = React.useState(null);

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
                <div className="topbar-search">
                    <Search size={15} color="rgba(255, 255, 255, 0.6)" />
                    <input type="text" placeholder="Search..." />
                </div>
                {/* Clean Coin Icon & Points Pill Widget */}
                {(() => {
                    return (
                        <button
                            onClick={() => navigate('/payments/rewards')}
                            title="Loyalty Points - View Rewards & Offers"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
                                color: '#FFFFFF',
                                fontSize: '13px',
                                fontWeight: '750',
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 158, 11, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <Coins size={15} color="#F59E0B" style={{ filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))' }} />
                            <span style={{ whiteSpace: 'nowrap' }}>
                                {rewardPoints.toLocaleString()} Pts
                            </span>
                        </button>
                    );
                })()}

                <ProfileDropdown
                    onAccount={() => navigate('/profile')}
                    onSettings={() => navigate('/settings')}
                    onFAQ={() => navigate('/faq')}
                    onLogout={handleLogout}
                />
                <button
                    onClick={() => {
                        setIsAccessDrawerOpen(true);
                        setActiveTool(null);
                    }}
                    title="Access Kit"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'none';
                    }}
                >
                    <img 
                        src={accessKitPng} 
                        alt="Access Kit" 
                        style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
                    />
                </button>
            </div>

            <AnimatePresence>
                {isAccessDrawerOpen && (
                    <>
                        {/* Backdrop Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAccessDrawerOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: 'rgba(15, 23, 42, 0.3)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 2999,
                            }}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: 0,
                                height: '100vh',
                                width: '100%',
                                maxWidth: '380px',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.15)',
                                zIndex: 3000,
                                display: 'flex',
                                flexDirection: 'column',
                                fontFamily: "'Inter', sans-serif",
                                color: '#1E293B',
                            }}
                        >
                            {activeTool === 'calculator' ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <CalcPopover 
                                        isInline={true} 
                                        onCloseInline={() => setActiveTool(null)} 
                                    />
                                </div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    {/* Drawer Header */}
                                    <div style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid #F1F5F9',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#FAFBFC'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={accessKitPng} alt="Access Kit" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                            <span style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', letterSpacing: '0.3px' }}>
                                                Access Kit
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => setIsAccessDrawerOpen(false)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#94A3B8',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Drawer Content - List of Tools */}
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                                        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                                            Available Tools
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {/* Calculator Tool Card */}
                                            <button
                                                onClick={() => setActiveTool('calculator')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    width: '100%',
                                                    padding: '16px',
                                                    borderRadius: '16px',
                                                    border: '1px solid #E2E8F0',
                                                    background: '#FFFFFF',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    outline: 'none',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#10B981';
                                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.05), 0 4px 6px -2px rgba(16, 185, 129, 0.02)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ECFDF5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#10B981',
                                                    flexShrink: 0
                                                }}>
                                                    <Calculator size={22} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', margin: '0 0 2px 0' }}>
                                                        BETA Calculator
                                                    </h4>
                                                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: '500' }}>
                                                        Interactive tape calculator with tax & compare utilities.
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Drawer Footer */}
                                    <div style={{
                                        padding: '16px 20px',
                                        borderTop: '1px solid #F1F5F9',
                                        textAlign: 'center',
                                        background: '#FAFBFC'
                                    }}>
                                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, fontWeight: '600' }}>
                                            Cliks Business Access Kit • Version 1.0
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Topbar;

