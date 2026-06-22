import React from 'react';
import { BookOpen, Calculator, Users, Coins, X, Search, Sliders, Calendar, Contact, Keyboard, Languages, Scan, ShieldCheck, CloudSun, Newspaper, Edit, Plus, Minus, Check } from 'lucide-react';

import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import logoPng from '../assets/cliks5.png'; // Final branding
import accessKitPng from '../assets/ACCESS_KIT.png';
import { motion, AnimatePresence } from 'framer-motion';

import { ProfileDropdown } from './ProfileDropdown';
import { CalcPopover } from './common/CalcPopover';

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

    const [isAccessPopoverOpen, setIsAccessPopoverOpen] = React.useState(false);
    const [isEditingAccess, setIsEditingAccess] = React.useState(false);
    const [isCalcOpen, setIsCalcOpen] = React.useState(false);
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

    // Push main content aside when AccessKit or Calculator is opened
    React.useEffect(() => {
        const appBody = document.querySelector('.app-body');
        if (!appBody) return;

        const updatePadding = () => {
            appBody.style.transition = 'padding-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            let paddingRight = 0;
            const isDesktop = window.innerWidth > 768;

            if (isDesktop) {
                if (isCalcOpen && isAccessPopoverOpen) {
                    paddingRight = 424; // 360px (Calculator) + 64px (Access Popover)
                } else if (isCalcOpen) {
                    paddingRight = 360;
                } else if (isAccessPopoverOpen) {
                    paddingRight = 64;
                }
            } else {
                paddingRight = 0; // Overlays on mobile
            }
            appBody.style.paddingRight = `${paddingRight}px`;
        };

        updatePadding();
        window.addEventListener('resize', updatePadding);
        return () => window.removeEventListener('resize', updatePadding);
    }, [isAccessPopoverOpen, isCalcOpen]);

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
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem' }}>
                {(() => {
                    const searchInputRef = React.useRef(null);
                    return (
                        <div 
                            className="topbar-search"
                            onClick={() => searchInputRef.current?.focus()}
                        >
                            <Search size={15} color="rgba(255, 255, 255, 0.6)" />
                            <input ref={searchInputRef} type="text" placeholder="Search..." />
                        </div>
                    );
                })()}
                {/* Clean Coin Icon & Points Pill Widget */}
                {(() => {
                    return (
                        <button
                            onClick={() => navigate('/payments/rewards')}
                            title="Loyalty Points - View Rewards & Offers"
                            className="p-1.5 sm:px-3 sm:py-1.5 gap-1.5"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
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
                            <span className="hidden sm:inline" style={{ whiteSpace: 'nowrap' }}>
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

                {/* Vertical Divider */}
                <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.2)', marginLeft: '4px', marginRight: '4px' }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: '-10px' }}>
                    <button
                        onClick={() => {
                            setIsAccessPopoverOpen(!isAccessPopoverOpen);
                            if (isAccessPopoverOpen) {
                                setIsEditingAccess(false);
                            }
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

                    <AnimatePresence>
                        {isAccessPopoverOpen && (
                            <>
                                {/* Drawer from the right edge */}
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                                    style={{
                                        position: 'fixed',
                                        top: '64px',
                                        right: 0,
                                        height: 'calc(100vh - 64px)',
                                        backgroundColor: '#FFFFFF',
                                        borderLeft: '1px solid #E2E8F0',
                                        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.08)',
                                        padding: '24px 8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        zIndex: isCalcOpen && !isMobile ? 2005 : 2000,
                                        width: '64px',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                >
                                    {/* Top Area: Scrollable Tool List */}
                                    <div className="access-tools-scroll" style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        flex: 1,
                                        overflowY: 'auto',
                                        paddingBottom: '16px',
                                        width: '100%',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none'
                                    }}>
                                        <style>{`
                                            .access-tools-scroll::-webkit-scrollbar { display: none; }
                                        `}</style>
                                        
                                        {/* Dynamic tools mapping */}
                                        {(() => {
                                            const allAvailableTools = [
                                                { name: 'Calendar', icon: Calendar, color: '#F59E0B', bg: '#FEF3C7', action: () => alert('Calendar module coming soon!') },
                                                { name: 'Calculator', icon: Calculator, color: '#10B981', bg: '#ECFDF5', action: () => setIsCalcOpen(prev => !prev) },
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
                                                        <div style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Edit Pins</div>
                                                        {allAvailableTools.map((tool, idx) => {
                                                            const Icon = tool.icon;
                                                            const isPinned = pinnedTools.includes(tool.name);
                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => toggleToolPin(tool.name)}
                                                                    title={`${isPinned ? 'Unpin' : 'Pin'} ${tool.name}`}
                                                                    style={{
                                                                        width: '34px', height: '34px', borderRadius: '10px',
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
                                                                    <Icon size={16} />
                                                                </button>
                                                            );
                                                        })}
                                                        <button
                                                            onClick={() => setIsEditingAccess(false)}
                                                            title="Done Editing"
                                                            style={{
                                                                width: '34px', height: '34px', borderRadius: '10px',
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
                                                            <Check size={16} />
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
                                                                    width: '34px', height: '34px', borderRadius: '10px',
                                                                    backgroundColor: tool.bg, border: `1px solid ${tool.bg}`,
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
                                                                <Icon size={16} />
                                                            </button>
                                                        );
                                                    })}
                                                    <button
                                                        onClick={() => setIsEditingAccess(true)}
                                                        title="Add/Edit Icons"
                                                        style={{
                                                            width: '34px', height: '34px', borderRadius: '10px',
                                                            backgroundColor: '#F8FAFC', border: '1.5px dashed #E2E8F0',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease',
                                                            outline: 'none', flexShrink: 0
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                            e.currentTarget.style.backgroundColor = '#F1F5F9';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Bottom Area: Edit & Settings */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', width: '100%' }}>
                                        <button
                                            onClick={() => setIsEditingAccess(!isEditingAccess)}
                                            title="Edit Access Kit"
                                            style={{
                                                width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F8FAFC',
                                                border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate(isAdminOrSales ? '/admin/settings' : '/customization');
                                                setIsAccessPopoverOpen(false);
                                            }}
                                            title="Settings / Customization"
                                            style={{
                                                width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#F8FAFC',
                                                border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#64748B', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Sliders size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {isCalcOpen && (
                    <>
                        {/* Backdrop with premium blur - ONLY on mobile screens */}
                        {isMobile && (
                            <div 
                                onClick={() => setIsCalcOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    zIndex: 2001,
                                    backgroundColor: 'rgba(15, 23, 42, 0.2)',
                                    backdropFilter: 'blur(4.5px)',
                                    WebkitBackdropFilter: 'blur(4.5px)'
                                }}
                            />
                        )}

                        {/* Sliding Tape Calculator (Right to Left Drawer) */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                right: isAccessPopoverOpen && !isMobile ? '64px' : 0,
                                width: '100%',
                                maxWidth: '360px',
                                height: '100vh',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
                                zIndex: 2002,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <CalcPopover 
                                isInline={true} 
                                onCloseInline={() => setIsCalcOpen(false)} 
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        
        </header>
    );
};

export default Topbar;
