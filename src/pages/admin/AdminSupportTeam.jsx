import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Mail, 
    Lock, 
    ToggleLeft, 
    ToggleRight, 
    Search,
    Activity,
    RefreshCw,
    X,
    LifeBuoy,
    AlertTriangle,
    CheckCircle,
    Send
} from 'lucide-react';
import { supportService } from '../../services/supportService';
import { customConfirm } from '../../utils/customConfirm';

const AdminSupportTeam = () => {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [escalatedTickets, setEscalatedTickets] = useState([]);
    
    // Roster Registration Modal Form
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Resolution Modal
    const [resolvingTicket, setResolvingTicket] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolvingSubmit, setResolvingSubmit] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const agentRes = await supportService.getSupportAgents();
            if (agentRes && agentRes.data) {
                setAgents(agentRes.data);
            }
            const ticketRes = await supportService.getEscalatedTickets();
            if (ticketRes && ticketRes.data) {
                setEscalatedTickets(ticketRes.data);
            }
        } catch (err) {
            console.error("Failed to query support workspace data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setErrorMessage('');
        try {
            await supportService.createSupportAgent({
                name,
                email,
                password
            });
            setShowCreateModal(false);
            setName('');
            setEmail('');
            setPassword('');
            fetchAllData();
        } catch (err) {
            setErrorMessage(err.response?.data?.error?.message || 'Support agent registration failed.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleToggleStatus = async (agent) => {
        if (!await customConfirm(`Are you certain you want to pivot status for support agent "${agent.name}"?`)) return;
        try {
            await supportService.toggleSupportAgent(agent.id);
            fetchAllData();
        } catch (err) {
            console.error("Failed to toggle support agent status:", err);
        }
    };

    const handleResolveEscalated = async (e) => {
        e.preventDefault();
        if (!resolutionNotes.trim()) return;

        setResolvingSubmit(true);
        try {
            await supportService.resolveEscalatedTicket(resolvingTicket.id, resolutionNotes);
            setResolvingTicket(null);
            setResolutionNotes('');
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.error?.message || 'Failed to resolve escalated ticket.');
        } finally {
            setResolvingSubmit(false);
        }
    };

    const filteredAgents = agents.filter(ag => 
        ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            
            {/* Header Widget */}
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>HELP DESK BOARD</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Customer Support & Tickets</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>
                        Provision customer support specialists, audit active staff logs, and resolve escalated tickets.
                    </p>
                </div>

                <div className="dashboard-header-actions" style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}
                    >
                        <UserPlus size={16} /> Register Specialist
                    </button>
                    <button 
                        onClick={fetchAllData}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Systems
                    </button>
                </div>
            </div>

            {/* Layout Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left: Escalated Tickets Workspace */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '8px', background: '#FEF2F2', color: '#EF4444', borderRadius: '10px' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Escalated Tickets Workspace
                        </h2>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', background: '#FEF2F2', padding: '4px 10px', borderRadius: '20px', marginLeft: 'auto' }}>
                            {escalatedTickets.length} Escalated
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ color: '#64748B', fontSize: '0.88rem', fontWeight: 600, padding: '3rem 0', textAlign: 'center' }}>
                            Retrieving escalated registry logs...
                        </div>
                    ) : escalatedTickets.length === 0 ? (
                        <div style={{ color: '#94A3B8', fontSize: '0.88rem', fontWeight: 600, padding: '3rem 0', textAlign: 'center' }}>
                            Excellent! No active escalated support coordinates detected.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {escalatedTickets.map(t => (
                                <div key={t.id} style={{ border: '1px solid #FEE2E2', background: '#FFFDFD', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#FEF2F2', color: '#EF4444', padding: '2px 8px', borderRadius: '6px' }}>
                                                Escalated Ticket #{t.id}
                                            </span>
                                            <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0F172A', margin: '4px 0 0 0' }}>
                                                {t.subject}
                                            </h3>
                                        </div>

                                        <button 
                                            onClick={() => setResolvingTicket(t)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}
                                        >
                                            <CheckCircle size={12} /> Resolve Escalation
                                        </button>
                                    </div>

                                    <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                                        {t.description}
                                    </p>

                                    <div style={{ background: '#FEF2F2', borderLeft: '3px solid #EF4444', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#9D174D', fontWeight: 650 }}>
                                        <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#C91D5C', marginBottom: '2px' }}>Escalation Justification (From {t.agent_name || 'Agent'})</span>
                                        {t.admin_note}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.72rem', color: '#64748B', borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem' }}>
                                        <span>User: <strong style={{ color: '#0F172A' }}>{t.user_name}</strong> ({t.user_email})</span>
                                        <span>Specialist Claimed: <strong style={{ color: '#0F172A' }}>{t.agent_name || 'N/A'}</strong></span>
                                        <span>Logged: {new Date(t.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Support Specialists Roster */}
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '8px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '10px' }}>
                            <Users size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            Support Specialists
                        </h2>
                    </div>

                    <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', margin: '0 0 1.5rem 0', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search Specialists Roster..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent', width: '100%', paddingLeft: '36px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>Loading roster...</div>
                        ) : filteredAgents.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>No specialists matched search query.</div>
                        ) : (
                            filteredAgents.map(ag => (
                                <div key={ag.id} style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 850, color: '#0F172A' }}>{ag.name}</h4>
                                            <span style={{ fontSize: '0.62rem', fontWeight: 900, background: ag.is_active === 1 ? '#ECFDF5' : '#FEF2F2', color: ag.is_active === 1 ? '#10B981' : '#EF4444', padding: '2px 6px', borderRadius: '4px' }}>
                                                {ag.is_active === 1 ? 'ACTIVE' : 'DEACTIVATED'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>{ag.email}</span>
                                    </div>

                                    <button 
                                        onClick={() => handleToggleStatus(ag)}
                                        style={{ background: 'transparent', border: 'none', color: ag.is_active === 1 ? '#10B981' : '#94A3B8', cursor: 'pointer' }}
                                    >
                                        {ag.is_active === 1 ? <ToggleRight size={32} /> : <ToggleLeft size={32} style={{ color: '#94A3B8' }} />}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Roster Creation Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Register Support Specialist</h2>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 650, marginBottom: '1.25rem' }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. John Doe"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Email Coordinate</label>
                                <input 
                                    type="email" 
                                    required
                                    placeholder="support@cliksbusiness.com"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Temporary Password</label>
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={formSubmitting}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.2)', fontSize: '0.9rem', marginTop: '0.5rem' }}
                            >
                                {formSubmitting ? 'Registering...' : 'Provision Specialist Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Resolution Modal */}
            {resolvingTicket && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Resolve Escalated Ticket</h2>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
                            Provide administrative resolution notes to close out escalated ticket coordination for user <strong>{resolvingTicket.user_name}</strong>.
                        </p>

                        <form onSubmit={handleResolveEscalated} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Resolution Response</label>
                                <textarea 
                                    rows="4"
                                    required
                                    placeholder="Provide administrative resolution coordinates..."
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
                                    disabled={resolvingSubmit}
                                    style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}
                                >
                                    {resolvingSubmit ? 'Logging...' : 'Resolve & Close Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminSupportTeam;
