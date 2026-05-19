import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { supportService } from '../../services/supportService';
import { 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    UserPlus, 
    LogOut, 
    User, 
    MessageSquare, 
    Activity, 
    LifeBuoy, 
    Check, 
    ArrowUpRight,
    Search,
    RefreshCw,
    Inbox,
    ShieldAlert,
    UserCheck,
    Layers
} from 'lucide-react';

const SupportDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'MINE'
    const [searchQuery, setSearchQuery] = useState('');
    
    // Resolution Modal
    const [resolvingTicket, setResolvingTicket] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [submittingResolution, setSubmittingResolution] = useState(false);

    // Escalation Modal
    const [escalatingTicket, setEscalatingTicket] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [submittingEscalation, setSubmittingEscalation] = useState(false);

    const [error, setError] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await supportService.getAgentTickets();
            if (res) {
                setTickets(res);
            }
        } catch (err) {
            setError('Failed to sync support records catalog. Connection handshake anomaly.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleClaim = async (ticketId) => {
        try {
            await supportService.claimTicket(ticketId);
            fetchTickets();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to claim ticket coordination.');
        }
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!resolutionNotes.trim()) return;

        setSubmittingResolution(true);
        try {
            await supportService.respondTicket(resolvingTicket.id, 'RESOLVED', resolutionNotes);
            setResolvingTicket(null);
            setResolutionNotes('');
            fetchTickets();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Resolution pipeline dispatch failure.');
        } finally {
            setSubmittingResolution(false);
        }
    };

    const handleEscalateSubmit = async (e) => {
        e.preventDefault();
        if (!adminNote.trim()) return;

        setSubmittingEscalation(true);
        try {
            await supportService.escalateTicket(escalatingTicket.id, adminNote);
            setEscalatingTicket(null);
            setAdminNote('');
            fetchTickets();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Escalation dispatch sequence failure.');
        } finally {
            setSubmittingEscalation(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/support/login');
    };

    // Computations for telemetry stats
    const stats = tickets.reduce((acc, t) => {
        acc.total += 1;
        if (t.status === 'RESOLVED') acc.resolved += 1;
        if (t.status === 'ESCALATED') acc.escalated += 1;
        if (t.status === 'OPEN' && !t.agent_id) acc.unassigned += 1;
        if (t.agent_id === user?.id && t.status !== 'RESOLVED' && t.status !== 'ESCALATED') acc.mineActive += 1;
        return acc;
    }, { total: 0, resolved: 0, escalated: 0, unassigned: 0, mineActive: 0 });

    const filteredTickets = tickets.filter(t => {
        const matchesTab = activeTab === 'MINE' ? t.agent_id === user?.id : true;
        const matchesSearch = 
            t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(t.id).includes(searchQuery);
        return matchesTab && matchesSearch;
    });

    const getPriorityStyle = (priority) => {
        const clean = (priority || 'MEDIUM').toUpperCase();
        switch (clean) {
            case 'HIGH':
                return {
                    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                    color: '#DC2626',
                    glow: '0 4px 12px rgba(220, 38, 38, 0.15)',
                    label: 'HIGH SEVERITY'
                };
            case 'LOW':
                return {
                    bg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                    color: '#16A34A',
                    glow: 'none',
                    label: 'LOW SEVERITY'
                };
            case 'MEDIUM':
            default:
                return {
                    bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                    color: '#D97706',
                    glow: 'none',
                    label: 'MEDIUM SEVERITY'
                };
        }
    };

    const getStatusStyle = (status) => {
        const clean = (status || 'OPEN').toUpperCase();
        switch (clean) {
            case 'RESOLVED':
                return {
                    bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                    color: '#065F46',
                    icon: <CheckCircle size={14} />
                };
            case 'ESCALATED':
                return {
                    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FFCDD2 100%)',
                    color: '#B71C1C',
                    icon: <AlertTriangle size={14} />
                };
            case 'OPEN':
            default:
                return {
                    bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    color: '#1E40AF',
                    icon: <Clock size={14} />
                };
        }
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 20%, #F8FAFC 0%, #EFF6FF 100%)',
            minHeight: '100vh',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            paddingBottom: '5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glow elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '70%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.04)', filter: 'blur(100px)', pointerEvents: 'none' }} />

            {/* TOP BAR / NAVIGATION */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                padding: '1.25rem 2.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                sticky: 'top',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LifeBuoy size={24} className="animate-spin-slow" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                            Cliks Command
                        </h1>
                        <span style={{ fontSize: '0.68rem', color: '#4F46E5', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                            Customer Operations Desk
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(255,255,255,0.9)',
                        padding: '6px 16px 6px 6px',
                        borderRadius: '30px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                            color: 'white',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '1rem',
                            boxShadow: '0 4px 10px rgba(79,70,229,0.2)'
                        }}>
                            {user?.name ? user.name[0].toUpperCase() : 'S'}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>{user?.name || 'Support Agent'}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600' }}>{user?.email}</div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
                            border: '1px solid #FECDD3',
                            color: '#E11D48',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '14px',
                            fontWeight: '800',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 29, 72, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.05)';
                        }}
                    >
                        <LogOut size={15} /> Exit
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '2.5rem auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* SYSTEM telemetry stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {/* STAT CARD 1 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        padding: '1.75rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.03), 0 1px 3px rgba(0,0,0,0.01)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: '#64748B', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Active Pipeline</span>
                            <div style={{ padding: '8px', background: '#EEF2FF', color: '#4F46E5', borderRadius: '12px' }}>
                                <Layers size={18} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-1px' }}>{stats.total}</h2>
                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #4F46E5, #3B82F6)', borderRadius: '2px' }} />
                        </div>
                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Cumulative help tickets filed</p>
                    </div>

                    {/* STAT CARD 2 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        padding: '1.75rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 10px 30px rgba(249, 115, 22, 0.03), 0 1px 3px rgba(0,0,0,0.01)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: '#64748B', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Awaiting Claim</span>
                            <div style={{ padding: '8px', background: '#FFF7ED', color: '#EA580C', borderRadius: '12px' }}>
                                <Inbox size={18} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#EA580C', margin: 0, letterSpacing: '-1px' }}>{stats.unassigned}</h2>
                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.total > 0 ? (stats.unassigned / stats.total) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #EA580C, #F97316)', borderRadius: '2px' }} />
                        </div>
                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Tickets open for specialist grab</p>
                    </div>

                    {/* STAT CARD 3 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        padding: '1.75rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.03), 0 1px 3px rgba(0,0,0,0.01)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: '#64748B', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>My Active Desk</span>
                            <div style={{ padding: '8px', background: '#ECFDF5', color: '#10B981', borderRadius: '12px' }}>
                                <UserCheck size={18} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#10B981', margin: 0, letterSpacing: '-1px' }}>{stats.mineActive}</h2>
                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.total > 0 ? (stats.mineActive / stats.total) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '2px' }} />
                        </div>
                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Active tickets claimed by you</p>
                    </div>

                    {/* STAT CARD 4 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        padding: '1.75rem',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.03), 0 1px 3px rgba(0,0,0,0.01)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: '#64748B', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Admin Escalations</span>
                            <div style={{ padding: '8px', background: '#FEF2F2', color: '#EF4444', borderRadius: '12px' }}>
                                <ShieldAlert size={18} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#EF4444', margin: 0, letterSpacing: '-1px' }}>{stats.escalated}</h2>
                        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.total > 0 ? (stats.escalated / stats.total) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #EF4444, #F87171)', borderRadius: '2px' }} />
                        </div>
                        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Tickets escalated to admin logs</p>
                    </div>
                </div>

                {/* WORKSPACE & PIPELINE BOARD */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '32px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.04)'
                }}>
                    {/* Control Panel Header */}
                    <div style={{
                        padding: '1.75rem 2.5rem',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                        background: 'rgba(255, 255, 255, 0.4)'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '5px', borderRadius: '16px' }}>
                            <button 
                                onClick={() => setActiveTab('ALL')}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'ALL' ? 'white' : 'transparent',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    color: activeTab === 'ALL' ? '#0F172A' : '#64748B',
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'ALL' ? '0 4px 12px rgba(15, 23, 42, 0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                All Active Pipeline
                            </button>
                            <button 
                                onClick={() => setActiveTab('MINE')}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: activeTab === 'MINE' ? 'white' : 'transparent',
                                    fontWeight: '800',
                                    fontSize: '0.82rem',
                                    color: activeTab === 'MINE' ? '#0F172A' : '#64748B',
                                    cursor: 'pointer',
                                    boxShadow: activeTab === 'MINE' ? '0 4px 12px rgba(15, 23, 42, 0.05)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                My Claimed Desk ({stats.mineActive})
                            </button>
                        </div>

                        {/* Search & Actions Group */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1', justifyContent: 'flex-end', maxWidth: '600px' }}>
                            <div className="dashboard-search-wrapper" style={{
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                flex: '1',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                            }}>
                                <Search size={16} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search subject, description, customer..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                                        border: 'none',
                                        outline: 'none',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: '#1E293B'
                                    }}
                                />
                            </div>

                            <button 
                                onClick={fetchTickets}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '14px',
                                    background: 'white',
                                    border: '1px solid #E2E8F0',
                                    color: '#0F172A',
                                    fontWeight: '800',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#4F46E5'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
                            </button>
                        </div>
                    </div>

                    {/* Tickets Stream container */}
                    <div style={{ padding: '2rem 2.5rem' }}>
                        {error && (
                            <div style={{
                                background: '#FEF2F2',
                                border: '1px solid #FEE2E2',
                                color: '#EF4444',
                                padding: '1rem 1.25rem',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ShieldAlert size={18} />
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
                                <RefreshCw size={36} className="animate-spin" style={{ color: '#4F46E5' }} />
                                <div style={{ color: '#64748B', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                    SYNCHRONIZING TICKET REGISTRIES...
                                </div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '50%', color: '#94A3B8' }}>
                                    <Inbox size={40} />
                                </div>
                                <div style={{ color: '#64748B', fontWeight: '800', fontSize: '0.9rem' }}>
                                    No active support items detected in this view.
                                </div>
                                <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: 0, fontWeight: '500' }}>
                                    Perfect clean desk slate! Refresh or adjust filters.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {filteredTickets.map(t => {
                                    const priority = getPriorityStyle(t.priority);
                                    const status = getStatusStyle(t.status);
                                    const isOwnedByMe = t.agent_id === user?.id;
                                    const hasAgent = !!t.agent_id;

                                    return (
                                        <div 
                                            key={t.id} 
                                            style={{
                                                background: 'white',
                                                border: isOwnedByMe ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid rgba(226, 232, 240, 0.8)',
                                                borderRadius: '24px',
                                                padding: '2rem',
                                                position: 'relative',
                                                boxShadow: isOwnedByMe 
                                                    ? '0 10px 30px rgba(79, 70, 229, 0.04), 0 1px 3px rgba(0,0,0,0.01)'
                                                    : '0 10px 30px rgba(0,0,0,0.01), 0 1px 3px rgba(0,0,0,0.01)',
                                                transition: 'all 0.25s ease',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1.25rem'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = isOwnedByMe
                                                    ? '0 16px 36px rgba(79, 70, 229, 0.08)'
                                                    : '0 16px 36px rgba(15, 23, 42, 0.04)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = isOwnedByMe 
                                                    ? '0 10px 30px rgba(79, 70, 229, 0.04)'
                                                    : '0 10px 30px rgba(0,0,0,0.01)';
                                            }}
                                        >
                                            {/* Tag Line row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{
                                                        background: priority.bg,
                                                        color: priority.color,
                                                        boxShadow: priority.glow,
                                                        fontSize: '0.65rem',
                                                        fontWeight: '900',
                                                        padding: '3px 10px',
                                                        borderRadius: '8px',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {priority.label}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>
                                                        Ticket ID: <strong style={{ color: '#475569' }}>#{t.id}</strong>
                                                    </span>
                                                </div>

                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 12px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '900',
                                                    background: status.bg,
                                                    color: status.color,
                                                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                                                }}>
                                                    {status.icon} {t.status}
                                                </span>
                                            </div>

                                            {/* Subject & Description */}
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                                                    {t.subject}
                                                </h3>
                                                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                                                    {t.description}
                                                </p>
                                            </div>

                                            {/* Escalation context display */}
                                            {t.admin_note && (
                                                <div style={{
                                                    background: '#FFF5F5',
                                                    borderLeft: '4px solid #EF4444',
                                                    padding: '1rem 1.25rem',
                                                    borderRadius: '0 16px 16px 0',
                                                    fontSize: '0.85rem',
                                                    color: '#991B1B',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 6px rgba(239,68,68,0.02)'
                                                }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#DC2626', letterSpacing: '1px', marginBottom: '4px' }}>Escalation Context (From Support Agent)</span>
                                                    {t.admin_note}
                                                </div>
                                            )}

                                            {/* Resolution display */}
                                            {t.resolution_notes && (
                                                <div style={{
                                                    background: '#ECFDF5',
                                                    borderLeft: '4px solid #10B981',
                                                    padding: '1rem 1.25rem',
                                                    borderRadius: '0 16px 16px 0',
                                                    fontSize: '0.85rem',
                                                    color: '#064E3B',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 6px rgba(16,185,129,0.02)'
                                                }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: '#059669', letterSpacing: '1px', marginBottom: '4px' }}>Resolution Parameters Logged</span>
                                                    {t.resolution_notes}
                                                </div>
                                            )}

                                            {/* Footer Info & Actions */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderTop: '1px solid rgba(226, 232, 240, 0.6)',
                                                paddingTop: '1.25rem',
                                                flexWrap: 'wrap',
                                                gap: '1.25rem',
                                                marginTop: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{
                                                        background: '#EFF6FF',
                                                        color: '#3B82F6',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: '900',
                                                        fontSize: '0.78rem'
                                                    }}>
                                                        {t.user_name ? t.user_name[0].toUpperCase() : 'U'}
                                                    </span>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600' }}>
                                                        Filed by: <strong style={{ color: '#0F172A', fontWeight: '800' }}>{t.user_name}</strong> ({t.user_email}) on {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    {!hasAgent && (
                                                        <button 
                                                            onClick={() => handleClaim(t.id)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.65rem 1.25rem',
                                                                borderRadius: '12px',
                                                                fontWeight: '800',
                                                                fontSize: '0.78rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.25)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
                                                            }}
                                                        >
                                                            <UserPlus size={14} /> Claim Ticket
                                                        </button>
                                                    )}

                                                    {isOwnedByMe && t.status === 'OPEN' && (
                                                        <>
                                                            <button 
                                                                onClick={() => setResolvingTicket(t)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.65rem 1.25rem',
                                                                    borderRadius: '12px',
                                                                    fontWeight: '800',
                                                                    fontSize: '0.78rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                                                }}
                                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                            >
                                                                <Check size={14} /> Resolve Ticket
                                                            </button>

                                                            <button 
                                                                onClick={() => setEscalatingTicket(t)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    background: 'white',
                                                                    border: '1px solid #EF4444',
                                                                    color: '#EF4444',
                                                                    padding: '0.65rem 1.25rem',
                                                                    borderRadius: '12px',
                                                                    fontWeight: '800',
                                                                    fontSize: '0.78rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    e.currentTarget.style.background = '#FEF2F2';
                                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    e.currentTarget.style.background = 'white';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <ArrowUpRight size={14} /> Escalate
                                                            </button>
                                                        </>
                                                    )}

                                                    {hasAgent && !isOwnedByMe && (
                                                        <span style={{
                                                            fontSize: '0.78rem',
                                                            fontWeight: '800',
                                                            color: '#94A3B8',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            background: '#F8FAFC',
                                                            padding: '6px 12px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #EFF2F5'
                                                        }}>
                                                            <User size={12} /> Claimed by {t.agent_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* RESOLUTION MODAL POPUP */}
            {resolvingTicket && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: 'white',
                        width: '90%',
                        maxWidth: '520px',
                        borderRadius: '28px',
                        padding: '2.5rem',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.15)'
                    }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                            Log Ticket Resolution
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 2rem 0', fontWeight: '500', lineHeight: '1.5' }}>
                            Provide the technical resolution parameters sent to <strong>{resolvingTicket.user_name}</strong>.
                        </p>

                        <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Resolution Response</label>
                                <textarea 
                                    rows="5"
                                    required
                                    placeholder="Explain exactly how this coordinate has been resolved..."
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #E2E8F0',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        resize: 'none',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => setResolvingTicket(null)}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #E2E8F0',
                                        color: '#64748B',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '14px',
                                        fontWeight: '800',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingResolution}
                                    style={{
                                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '14px',
                                        fontWeight: '800',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {submittingResolution ? 'Logging Parameters...' : 'Confirm Resolution'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ESCALATION MODAL POPUP */}
            {escalatingTicket && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: 'white',
                        width: '90%',
                        maxWidth: '520px',
                        borderRadius: '28px',
                        padding: '2.5rem',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.15)'
                    }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                            Escalate to Admin Board
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 2rem 0', fontWeight: '500', lineHeight: '1.5' }}>
                            Provide technical justification notes for why this coordinate requires higher administrative clearance.
                        </p>

                        <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Escalation Justification</label>
                                <textarea 
                                    rows="5"
                                    required
                                    placeholder="Explain why you require Administrator intervention..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        border: '1.5px solid #E2E8F0',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#1E293B',
                                        resize: 'none',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => setEscalatingTicket(null)}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #E2E8F0',
                                        color: '#64748B',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '14px',
                                        fontWeight: '800',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingEscalation}
                                    style={{
                                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '14px',
                                        fontWeight: '800',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {submittingEscalation ? 'Escalating...' : 'Confirm Escalation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SupportDashboard;
