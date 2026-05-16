import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Shield, 
    Mail, 
    Lock, 
    Percent, 
    ToggleLeft, 
    ToggleRight, 
    Search,
    Activity,
    TrendingUp,
    RefreshCw,
    X
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { customConfirm } from '../../utils/customConfirm';

const AdminSalesTeam = () => {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [commissionRate, setCommissionRate] = useState('0.0');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const res = await adminService.getSalesAgents();
            if (res && res.data) {
                setAgents(res.data);
            }
        } catch (err) {
            console.error("Failed to query sales team:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setErrorMessage('');
        try {
            await adminService.createSalesAgent({
                name,
                email,
                password,
                commission_rate: parseFloat(commissionRate)
            });
            setShowCreateModal(false);
            setName('');
            setEmail('');
            setPassword('');
            setCommissionRate('0.0');
            fetchTeam();
        } catch (err) {
            setErrorMessage(err.response?.data?.error?.message || 'Representative creation sequence aborted.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleToggleStatus = async (agent) => {
        if (!await customConfirm(`Are you certain you want to pivot clearance for rep "${agent.name}"?`)) return;
        try {
            await adminService.toggleSalesAgent(agent.id);
            fetchTeam();
        } catch (err) {
            console.error("Failed to pivot rep clearance:", err);
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
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SALES FORCE</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Sales Representatives</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Provision access, set performance incentives, and monitor representative team rosters.</p>
                </div>
                <div className="dashboard-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', border: 'none', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}
                    >
                        <UserPlus size={16} /> Add Representative
                    </button>
                </div>
            </div>

            {/* Active Force Roll Grid Table */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', flex: 1, position: 'relative', margin: 0, maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search Active Force by Name or Email..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent', width: '100%', paddingLeft: '36px' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 750 }}>{filteredAgents.length} Representatives Enlisted</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Representative Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Contact Information</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Security Clearance</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>Lead Pipeline</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>Incentives</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: '#4F46E5' }} />
                                        Mapping Sales Team roster...
                                    </td>
                                </tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                                        No platform marketing representatives found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map((agent) => (
                                    <tr key={agent.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                                    {agent.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>{agent.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#4B5563', fontWeight: 600 }}>
                                            {agent.email}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                                background: agent.is_active ? '#ECFDF5' : '#FEF2F2', 
                                                color: agent.is_active ? '#10B981' : '#EF4444'
                                            }}>
                                                {agent.is_active ? 'ACTIVE CLEARANCE' : 'RESTRICTED'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 900, color: '#1E293B', fontSize: '0.9rem' }}>{agent.lead_count || 0}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 800 }}>{agent.conversion_count || 0} Conversions</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 750, color: '#4F46E5', fontSize: '0.85rem' }}>
                                            {agent.commission_rate}%
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleToggleStatus(agent)}
                                                style={{ border: 'none', background: 'transparent', color: agent.is_active ? '#10B981' : '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }}
                                            >
                                                {agent.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Representative Modal Panel */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', position: 'relative' }}>
                        <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0F172A', marginTop: 0, marginBottom: '0.5rem' }}>Enlist Representative</h3>
                        <p style={{ color: '#64748B', margin: '0 0 1.5rem 0', fontSize: '0.85rem', fontWeight: 500 }}>Generate specialized login credentials for sales & marketing teams.</p>

                        {errorMessage && (
                            <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', border: '1px solid #FEE2E2' }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Full Name</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 0.75rem' }}>
                                    <Users size={16} style={{ color: '#94A3B8' }} />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }} placeholder="e.g. Vikram Singh" required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Work Email Identity</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 0.75rem' }}>
                                    <Mail size={16} style={{ color: '#94A3B8' }} />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }} placeholder="vikram@cliks.in" required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Set Representative Password</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 0.75rem' }}>
                                    <Lock size={16} style={{ color: '#94A3B8' }} />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }} placeholder="••••••••" required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Commission Rate (%)</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 0.75rem' }}>
                                    <Percent size={16} style={{ color: '#94A3B8' }} />
                                    <input type="number" step="0.1" min="0" max="100" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.75rem', fontWeight: 600, fontSize: '0.85rem' }} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={formSubmitting}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
                            >
                                {formSubmitting ? <RefreshCw size={18} className="animate-spin" /> : 'Commit Enlistment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSalesTeam;
