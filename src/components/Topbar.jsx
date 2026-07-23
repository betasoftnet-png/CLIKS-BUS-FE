import React from 'react';
import { BookOpen, Calculator, Users, Coins, X, Search, Sliders, Calendar, Contact, Keyboard, Languages, Scan, ShieldCheck, CloudSun, Newspaper, Edit, Plus, Minus, Check, ChevronRight, SlidersHorizontal, Palette, Bell, User, Lock, Info } from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks6.png'; // Final branding
import accessKitPng from '../assets/ACCESS_KIT.png';
import { motion, AnimatePresence } from 'framer-motion';

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';
import ProductLauncher from './ProductLauncher';





const Topbar = ({ onToggleSidebar, isSidebarOpen }) => {
    const { logout, user, selectedPlan } = useAuth();
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

    const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([
        { id: 1, text: "New sales invoice generated #INV-2026-004", time: "5 mins ago", read: false },
        { id: 2, text: "Monthly tax compliance report is ready for audit", time: "2 hours ago", read: false },
        { id: 3, text: "Welcome to Cliks Business standard dashboard!", time: "1 day ago", read: true }
    ]);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false);
    const [isEditingAccess, setIsEditingAccess] = React.useState(false);
    const [isAccessPopoverOpen, setIsAccessPopoverOpen] = React.useState(false);
    const [isCalcOpen, setIsCalcOpen] = React.useState(false);
    const [isLauncherOpen, setIsLauncherOpen] = React.useState(false);
    const [pinnedTools, setPinnedTools] = React.useState(() => {
        const saved = localStorage.getItem('cliks_pinned_tools');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(e);
            }
        }
        return ['Calendar', 'Calculator', 'Contact', 'Beta Trust'];
    });

    React.useEffect(() => {
        localStorage.setItem('cliks_pinned_tools', JSON.stringify(pinnedTools));
    }, [pinnedTools]);

    const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Push main content aside when right toolbar or drawer panels are opened
    React.useEffect(() => {
        const appBody = document.querySelector('.app-body');
        if (!appBody) return;

        const updatePadding = () => {
            appBody.style.transition = 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            let paddingRight = 0;
            const isDesktop = window.innerWidth > 768;

            if (isDesktop) {
                if (isCalcOpen || isLauncherOpen) {
                    paddingRight = 424; // 360px (Drawer) + 64px (Toolbar)
                } else if (isRightSidebarOpen) {
                    paddingRight = 64; // Toolbar always takes 64px
                } else {
                    paddingRight = 0; // Toolbar hidden by default
                }
            } else {
                paddingRight = 0; // Overlays on mobile
            }
            appBody.style.paddingRight = `${paddingRight}px`;
        };

        updatePadding();
        window.addEventListener('resize', updatePadding);
        return () => window.removeEventListener('resize', updatePadding);
    }, [isRightSidebarOpen, isCalcOpen, isLauncherOpen]);

    // Rigid Mode Derivation for Admin & Sales desks to omit redundant consumer modules
    const isAdminOrSales = 
        ['admin', 'sales'].includes(user?.role) || 
        location.pathname.includes('/admin/') || 
        location.pathname.includes('/sales-portal/');

    const handleNavigation = (path) => {
        const isSocialOrPayment = path.startsWith('/social/') || path.startsWith('/payments/');
        if (selectedPlan === 'Free Plan' && path !== '/dashboard' && !isSocialOrPayment) {
            alert('You are on the Free Plan! Please subscribe to unlock full access to this feature.');
            navigate('/subscription');
        } else {
            navigate(path);
        }
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
        { name: 'Social', url: '/social/betaclub', icon: Users, active: isSocialActive },
    ];

    return (
        <header className="topbar" style={{ paddingLeft: '1.5rem', paddingRight: '64px' }}>
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
                        Cliks<span className="logo-business-text"> Business</span>
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
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '0' }}>
                {/* Search circular button */}
                {(() => {
                    const searchInputRef = React.useRef(null);
                    React.useEffect(() => {
                        if (isSearchExpanded) {
                            searchInputRef.current?.focus();
                        }
                    }, [isSearchExpanded]);

                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {isSearchExpanded ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    borderRadius: '999px',
                                    padding: '5px 12px',
                                    width: '180px',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <Search size={14} color="#FFFFFF" style={{ opacity: 0.8 }} />
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        placeholder="Search..." 
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            outline: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            width: '100%',
                                            fontWeight: '600',
                                            padding: 0
                                        }}
                                        onBlur={() => setIsSearchExpanded(false)}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchExpanded(true)}
                                    title="Search"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        cursor: 'pointer',
                                        color: '#FFFFFF',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                                >
                                    <Search size={18} />
                                </button>
                            )}
                        </div>
                    );
                })()}

                {/* Notification Bell Button */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        title="Notifications"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            color: '#FFFFFF',
                            outline: 'none',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                    >
                        {/* Custom bell svg matching screenshot */}
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                        </svg>
                        
                        {/* Red Badge */}
                        {notifications.filter(n => !n.read).length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-3px',
                                right: '-3px',
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                fontWeight: '900',
                                border: '2px solid #135029'
                            }}>
                                {notifications.filter(n => !n.read).length}
                            </div>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {isNotificationOpen && (
                            <>
                                <div 
                                    onClick={() => setIsNotificationOpen(false)}
                                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2008 }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 10px)',
                                        right: '-40px',
                                        width: '280px',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '14px',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                        border: '1px solid #E2E8F0',
                                        zIndex: 2009,
                                        padding: '12px',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>Notifications</span>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setNotifications(notifications.map(n => ({ ...n, read: true })));
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#1B6B3A', fontSize: '11px', fontWeight: '750', cursor: 'pointer' }}
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {notifications.map(notification => (
                                            <div 
                                                key={notification.id}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    backgroundColor: notification.read ? 'transparent' : '#F0FDF4',
                                                    border: notification.read ? 'none' : '1px solid #DCF2E4',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                }}
                                            >
                                                <span style={{ fontSize: '11.5px', color: '#334155', fontWeight: notification.read ? '500' : '650' }}>{notification.text}</span>
                                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{notification.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <ProfileDropdown
                    onAccount={() => navigate('/profile')}
                    onSettings={() => navigate('/settings')}
                    onFAQ={() => navigate('/faq')}
                    onLogout={handleLogout}
                />

                {/* Vertical Divider */}
                <div style={{ 
                    width: '1px', 
                    height: '28px', 
                    minHeight: '28px',
                    maxHeight: '28px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)', 
                    marginLeft: '6px',
                    marginRight: '-4px',
                    alignSelf: 'center',
                    flexShrink: 0
                }} />
            </div>

            {/* Sliding Drawer Panels */}
            <AnimatePresence>

                {/* Beta Products Launcher Drawer */}
                {isLauncherOpen && (
                    <>
                        <div 
                            onClick={() => setIsLauncherOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: 'calc(100vw - 64px)',
                                height: '100vh',
                                zIndex: 1999,
                                backgroundColor: 'transparent'
                            }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: '64px',
                                width: '360px',
                                height: '100vh',
                                backgroundColor: '#FFFFFF',
                                borderLeft: '1px solid #99DBC3',
                                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)',
                                zIndex: 2000,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <ProductLauncher onClose={() => setIsLauncherOpen(false)} />
                        </motion.div>
                    </>
                )}

                {/* Calculator Drawer */}
                {isCalcOpen && (
                    <>
                        <div 
                            onClick={() => setIsCalcOpen(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: 'calc(100vw - 64px)',
                                height: '100vh',
                                zIndex: 1999,
                                backgroundColor: 'transparent'
                            }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: '64px',
                                width: '360px',
                                height: '100vh',
                                backgroundColor: '#FFFFFF',
                                borderLeft: '1px solid #99DBC3',
                                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)',
                                zIndex: 2000,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <CalcPopover 
                                isInline={true} 
                                onCloseInline={() => setIsCalcOpen(false)} 
                            />
                        </motion.div>
                    </>
                )}

                {/* Fixed Right Toolbar */}
                {isRightSidebarOpen && (
                    <motion.div
                        key="right-toolbar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            height: '100vh',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            zIndex: 2005,
                            width: '64px',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        {/* Top green header block */}
                        <div style={{
                            width: '100%',
                            height: '64px',
                            backgroundColor: '#135029',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            flexShrink: 0
                        }}>
                            <button
                                onClick={() => {
                                    setIsRightSidebarOpen(false);
                                    setIsLauncherOpen(false);
                                    setIsCalcOpen(false);
                                }}
                                title="Close Toolbar"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '11px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    cursor: 'pointer',
                                    color: '#FFFFFF',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Sliders size={18} />
                            </button>
                        </div>

                        {/* Toolbar Body Container (adds left border below header block) */}
                        <div style={{
                            width: '100%',
                            height: 'calc(100vh - 64px)',
                            borderLeft: '1px solid #99DBC3',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '20px',
                            paddingTop: '20px'
                        }}>
                            {/* Scrollable Tool List */}
                            <div className="access-tools-scroll" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                flex: 1,
                                overflowY: 'auto',
                                width: '100%',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none'
                            }}>
                                <style>{`
                                    .access-tools-scroll::-webkit-scrollbar { display: none; }
                                `}</style>

                                {/* Blue B Logo Button */}
                                <button
                                    onClick={() => {
                                        setIsLauncherOpen(!isLauncherOpen);
                                        setIsCalcOpen(false);
                                        setIsAccessPopoverOpen(false);
                                    }}
                                    title="Beta Products Launcher"
                                    style={{
                                        width: '38px',
                                        height: '38px',
                                        borderRadius: '12px',
                                        backgroundColor: isLauncherOpen ? '#DCF2E4' : '#FFFFFF',
                                        border: isLauncherOpen ? '1.5px solid #1B6B3A' : '1.5px solid #CBD5E1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.borderColor = isLauncherOpen ? '#1B6B3A' : '#94A3B8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = isLauncherOpen ? '#1B6B3A' : '#CBD5E1';
                                    }}
                                >
                                    <img src="/beta_logo.png" alt="Beta Logo" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                </button>

                                {/* Horizontal Separator */}
                                <div style={{ width: '24px', height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0', opacity: 0.8, flexShrink: 0 }} />

                                {/* Dynamic tools mapping */}
                                {(() => {
                                    const allAvailableTools = [
                                        { name: 'Calendar', icon: Calendar, color: '#F59E0B', bg: '#FEF3C7', action: () => alert('Calendar module coming soon!') },
                                        { name: 'Calculator', icon: Calculator, color: '#10B981', bg: '#ECFDF5', action: () => {
                                            setIsCalcOpen(!isCalcOpen);
                                            setIsLauncherOpen(false);
                                        } },
                                        { name: 'Contact', icon: Contact, color: '#3B82F6', bg: '#EFF6FF', action: () => alert('Contact module coming soon!') },
                                        { name: 'Beta Trust', icon: ShieldCheck, color: '#14B8A6', bg: '#F0FDFA', action: () => alert('Beta Trust module coming soon!') },
                                        { name: 'Keyboard', icon: Keyboard, color: '#8B5CF6', bg: '#F5F3FF', action: () => alert('Keyboard module coming soon!') },
                                        { name: 'Translator', icon: Languages, color: '#EC4899', bg: '#FDF2F8', action: () => alert('Translator module coming soon!') },
                                        { name: 'Lens', icon: Scan, color: '#06B6D4', bg: '#ECFEFF', action: () => alert('Lens module coming soon!') },
                                        { name: 'Weather', icon: CloudSun, color: '#F97316', bg: '#FFF7ED', action: () => alert('Weather module coming soon!') },
                                        { name: 'News', icon: Newspaper, color: '#6366F1', bg: '#EEF2FF', action: () => alert('News module coming soon!') }
                                    ];

                                    const toggleToolPin = (toolName) => {
                                        setPinnedTools(prev => {
                                            if (prev.includes(toolName)) {
                                                if (prev.length === 1) return prev; // Keep at least one tool
                                                return prev.filter(name => name !== toolName);
                                            } else {
                                                return [...prev, toolName];
                                            }
                                        });
                                    };

                                    if (isEditingAccess) {
                                        return (
                                            <>
                                                <div style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', textAlign: 'center' }}>Edit Pins</div>
                                                {allAvailableTools.map((tool, idx) => {
                                                    const Icon = tool.icon;
                                                    const isPinned = pinnedTools.includes(tool.name);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => toggleToolPin(tool.name)}
                                                            title={`${isPinned ? 'Unpin' : 'Pin'} ${tool.name}`}
                                                            style={{
                                                                width: '38px', height: '38px', borderRadius: '12px',
                                                                backgroundColor: isPinned ? tool.bg : '#F8FAFC',
                                                                border: isPinned ? `2px solid ${tool.color}` : '1.5px dashed #CBD5E1',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: isPinned ? tool.color : '#94A3B8',
                                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                                outline: 'none', flexShrink: 0,
                                                                position: 'relative',
                                                                opacity: isPinned ? 1 : 0.6
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }}
                                                        >
                                                            <Icon size={18} />
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setIsEditingAccess(false)}
                                                    title="Done Editing"
                                                    style={{
                                                        width: '38px', height: '38px', borderRadius: '12px',
                                                        backgroundColor: '#10B981', border: 'none',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s ease',
                                                        outline: 'none', flexShrink: 0,
                                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                                                        marginTop: '4px'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <Check size={18} />
                                                </button>
                                            </>
                                        );
                                    }

                                    // Normal Mode: Show only pinned tools
                                    const visibleTools = allAvailableTools.filter(t => pinnedTools.includes(t.name));

                                    return (
                                        <>
                                            {visibleTools.map((tool, idx) => {
                                                const Icon = tool.icon;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={tool.action}
                                                        title={tool.name}
                                                        style={{
                                                            width: '38px', height: '38px', borderRadius: '12px',
                                                            backgroundColor: tool.bg, border: 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: tool.color, cursor: 'pointer', transition: 'all 0.2s ease',
                                                            outline: 'none', flexShrink: 0
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <Icon size={18} />
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setIsEditingAccess(true)}
                                                title="Add/Edit Icons"
                                                style={{
                                                    width: '38px', height: '38px', borderRadius: '12px',
                                                    backgroundColor: 'transparent', border: '1.5px dashed #CBD5E1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease',
                                                    outline: 'none', flexShrink: 0
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Bottom Area: Edit & Settings */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                paddingTop: '16px',
                                width: '100%',
                                flexShrink: 0
                            }}>
                                {/* Horizontal Separator */}
                                <div style={{ width: '24px', height: '1px', backgroundColor: '#E2E8F0', margin: '0 0 4px 0', opacity: 0.8, flexShrink: 0 }} />

                                <button
                                    onClick={() => setIsEditingAccess(!isEditingAccess)}
                                    title="Edit Access Kit"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    title="Settings / Customization"
                                    style={{
                                        width: '38px', height: '38px', borderRadius: '12px',
                                        backgroundColor: '#F8FAFC',
                                        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Sliders size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Always Visible Top-Right Toolbar Toggle Button */}
            {!isRightSidebarOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#135029',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={() => setIsRightSidebarOpen(true)}
                        title="Open Toolbar"
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
                            color: '#FFFFFF',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Sliders size={18} />
                    </button>
                </div>
            )}
        </header>
    );
};

export default Topbar;
