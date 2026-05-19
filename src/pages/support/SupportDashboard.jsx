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
    Send,
    Activity,
    LifeBuoy,
    Check,
    ArrowUpRight
} from 'lucide-react';

const SupportDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'MINE'
    
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
            setError('Failed to fetch platform tickets.');
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
            alert(err.response?.data?.error?.message || 'Failed to claim ticket.');
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
            alert(err.response?.data?.error?.message || 'Failed to resolve ticket.');
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
            alert(err.response?.data?.error?.message || 'Failed to escalate ticket.');
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

    const displayedTickets = tickets.filter(t => {
        if (activeTab === 'MINE') {
            return t.agent_id === user?.id;
        }
        return true;
    });

    const getStatusPill = (status) => {
        const clean = (status || 'OPEN').toUpperCase();
        switch(clean) {
            case 'RESOLVED':
                return { bg: '#ECFDF5', color: '#10B981', label: 'RESOLVED', icon: <CheckCircle size={12} /> };
            case 'ESCALATED':
                return { bg: '#FEF2F2', color: '#EF4444', label: 'ESCALATED TO ADMIN', icon: <AlertTriangle size={12} /> };
            case 'OPEN':
            default:
                return { bg: '#FFF7ED', color: '#EA580C', label: 'OPEN TICKET', icon: <Clock size={12} /> };
        }
    };

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: '4rem' }}>
            
            {/* Top Navigation */}
            <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', padding: '8px', borderRadius: '12px' }}>
                        <LifeBuoy size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>Cliks Support Portal</h1>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>SPECIALIST COMMAND CENTER</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ background: '#EFF6FF', color: '#3B82F6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: '800' }}>
                            {user?.name ? user.name[0] : 'S'}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{user?.name || 'Support Agent'}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>{user?.email}</div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        <LogOut size={14} /> Exit Portal
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Stats Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>Total Logged Tickets</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0.5rem 0' }}>{stats.total}</h2>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Cumulative platform help logs</p>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>Awaiting Ticket Claim</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#EA580C', margin: '0.5rem 0' }}>{stats.unassigned}</h2>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Open tickets with no assigned agent</p>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>My Active Support Desk</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#3B82F6', margin: '0.5rem 0' }}>{stats.mineActive}</h2>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Assigned to you (Active resolution)</p>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>Escalated to Admin</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#EF4444', margin: '0.5rem 0' }}>{stats.escalated}</h2>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>Tickets escalated to admin board</p>
                    </div>
                </div>

                {/* Workspace grid */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                    
                    {/* Toolbar / Tab Switcher */}
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                            <button 
                                onClick={() => setActiveTab('ALL')}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'ALL' ? 'white' : 'transparent', fontWeight: 800, fontSize: '0.8rem', color: activeTab === 'ALL' ? '#0F172A' : '#64748B', cursor: 'pointer', boxShadow: activeTab === 'ALL' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
                            >
                                All Active Pipeline
                            </button>
                            <button 
                                onClick={() => setActiveTab('MINE')}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'MINE' ? 'white' : 'transparent', fontWeight: 800, fontSize: '0.8rem', color: activeTab === 'MINE' ? '#0F172A' : '#64748B', cursor: 'pointer', boxShadow: activeTab === 'MINE' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}
                            >
                                My Claimed Desk ({stats.mineActive})
                            </button>
                        </div>

                        <button 
                            onClick={fetchTickets}
                            style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Activity size={14} /> Refresh Roster
                        </button>
                    </div>

                    {/* Roster list */}
                    <div style={{ padding: '2rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 600, padding: '4rem 0' }}>
                                Synching dynamic tickets registries...
                            </div>
                        ) : displayedTickets.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', fontWeight: 600, padding: '4rem 0' }}>
                                No tickets found under the selected view.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                {displayedTickets.map(t => {
                                    const pill = getStatusPill(t.status);
                                    const isOwnedByMe = t.agent_id === user?.id;
                                    const hasAgent = !!t.agent_id;

                                    return (
                                        <div key={t.id} style={{ border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.5rem', background: isOwnedByMe ? '#F8FAFC' : 'white', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, background: t.priority === 'HIGH' ? '#FEF2F2' : '#F1F5F9', color: t.priority === 'HIGH' ? '#EF4444' : '#64748B', padding: '2px 8px', borderRadius: '6px' }}>
                                                            {t.priority} PRIORITY
                                                        </span>
                                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 650 }}>
                                                            Ticket #{t.id}
                                                        </span>
                                                    </div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>
                                                        {t.subject}
                                                    </h3>
                                                </div>

                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, background: pill.bg, color: pill.color }}>
                                                    {pill.icon} {pill.label}
                                                </span>
                                            </div>

                                            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1.25rem 0' }}>
                                                {t.description}
                                            </p>

                                            {/* Resolution or Escalation details displayed directly if existing */}
                                            {t.admin_note && (
                                                <div style={{ background: '#FEF2F2', borderLeft: '3px solid #EF4444', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#9D174D', marginBottom: '1rem', fontWeight: 600 }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#C91D5C', marginBottom: '2px' }}>Escalation Context (From Support Agent)</span>
                                                    {t.admin_note}
                                                </div>
                                            )}

                                            {t.resolution_notes && (
                                                <div style={{ background: '#ECFDF5', borderLeft: '3px solid #10B981', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#065F46', marginBottom: '1rem', fontWeight: 600 }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#047857', marginBottom: '2px' }}>Resolution Response</span>
                                                    {t.resolution_notes}
                                                </div>
                                            )}

                                            {/* Action Bar */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                                                    Filed by: <span style={{ color: '#0F172A', fontWeight: 850 }}>{t.user_name}</span> ({t.user_email}) on {new Date(t.created_at).toLocaleDateString()}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    {!hasAgent && (
                                                        <button 
                                                            onClick={() => handleClaim(t.id)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#3B82F6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(59,130,246,0.15)' }}
                                                        >
                                                            <UserPlus size={12} /> Claim Ticket
                                                        </button>
                                                    )}

                                                    {isOwnedByMe && t.status === 'OPEN' && (
                                                        <>
                                                            <button 
                                                                onClick={() => setResolvingTicket(t)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}
                                                            >
                                                                <Check size={12} /> Log Resolution
                                                            </button>

                                                            <button 
                                                                onClick={() => setEscalatingTicket(t)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #EF4444', color: '#EF4444', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer' }}
                                                            >
                                                                <ArrowUpRight size={12} /> Escalate to Admin
                                                            </button>
                                                        </>
                                                    )}

                                                    {hasAgent && !isOwnedByMe && (
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
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

            {/* Resolution Modal */}
            {resolvingTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Log Ticket Resolution</h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
                            Provide the technical details and resolution parameters sent to <strong>{resolvingTicket.user_name}</strong>.
                        </p>

                        <form onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Resolution Response</label>
                                <textarea 
                                    rows="4"
                                    required
                                    placeholder="Explain how this issue has been diagnosed and resolved..."
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600, resize: 'none' }}
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => setResolvingTicket(null)}
                                    style={{ background: 'white', border: '1px solid #E2E8F0', color: '#475569', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingResolution}
                                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}
                                >
                                    {submittingResolution ? 'Logging...' : 'Mark Resolved'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Escalation Modal */}
            {escalatingTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Escalate to Admin Board</h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
                            Provide the technical justification/context details for why this ticket requires higher-level administration access.
                        </p>

                        <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Escalation Justification</label>
                                <textarea 
                                    rows="4"
                                    required
                                    placeholder="Explain why you require Administrator assistance for this coordinate..."
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600, resize: 'none' }}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button 
                                    type="button"
                                    onClick={() => setEscalatingTicket(null)}
                                    style={{ background: 'white', border: '1px solid #E2E8F0', color: '#475569', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submittingEscalation}
                                    style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239,68,68,0.15)' }}
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
