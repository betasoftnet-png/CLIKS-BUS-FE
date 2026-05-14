import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Search, 
    Mail, 
    Phone, 
    User, 
    DollarSign, 
    Plus, 
    X, 
    Activity, 
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Zap,
    BarChart3
} from 'lucide-react';
import { salesAgentService } from '../../services/salesAgentService';

const SalesLeads = () => {
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Form states for adding prospect
    const [businessName, setBusinessName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [estValue, setEstValue] = useState('0.0');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await salesAgentService.getLeads();
            if (res && res.data) {
                setLeads(res.data);
            }
        } catch (err) {
            console.error("Failed to query assigned leads:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            await salesAgentService.createLead({
                business_name: businessName,
                contact_name: contactName,
                email,
                phone,
                estimated_value: parseFloat(estValue),
                notes
            });
            setShowModal(false);
            setBusinessName('');
            setContactName('');
            setEmail('');
            setPhone('');
            setEstValue('0.0');
            setNotes('');
            fetchLeads();
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'Failed to stream new prospect vector.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await salesAgentService.updateLead(id, { status: newStatus });
            fetchLeads();
        } catch (err) {
            console.error("Failed to mutate status:", err);
        }
    };

    const getStatusConfig = (status) => {
        const clean = (status || 'NEW').toUpperCase();
        switch(clean) {
            case 'CONVERTED':
                return { bg: '#ECFDF5', color: '#10B981', label: 'CONVERTED', icon: <CheckCircle size={12} /> };
            case 'CONTACTED':
                return { bg: '#EFF6FF', color: '#3B82F6', label: 'CONTACTED', icon: <Zap size={12} /> };
            case 'PRESENTATION':
                return { bg: '#FDF4FF', color: '#C026D3', label: 'PRESENTATION', icon: <BarChart3 size={12} /> };
            case 'LOST':
                return { bg: '#FEF2F2', color: '#EF4444', label: 'LOST', icon: <AlertTriangle size={12} /> };
            case 'NEW':
            default:
                return { bg: '#FFF7ED', color: '#EA580C', label: 'NEW PROSPECT', icon: <Activity size={12} /> };
        }
    };

    const filteredLeads = leads
        .filter(l => statusFilter === 'ALL' ? true : (l.status || '').toUpperCase() === statusFilter.toUpperCase())
        .filter(l => {
            const q = searchQuery.toLowerCase();
            return (
                (l.business_name || '').toLowerCase().includes(q) ||
                (l.contact_name || '').toLowerCase().includes(q) ||
                (l.notes || '').toLowerCase().includes(q)
            );
        });

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            
            {/* View Header Widget */}
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>PIPELINE DRIVER</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Prospecting Matrix</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Maintain prospect coordinates, log initial outreach attempts, and finalize conversions.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(234,88,12,0.2)' }}
                    >
                        <Plus size={16} /> Log New Prospect
                    </button>
                </div>
            </div>

            {/* Filter and search block */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                        <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', flex: 1, position: 'relative', margin: 0, maxWidth: '400px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Filter Assigned Prospects..." 
                                className="dashboard-search-input"
                                style={{ background: 'transparent', width: '100%', paddingLeft: '36px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 750, fontSize: '0.85rem', color: '#1E293B', background: '#F8FAFC', outline: 'none' }}
                        >
                            <option value="ALL">All Stages</option>
                            <option value="NEW">New Prospect</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="PRESENTATION">Presentation</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 750 }}>{filteredLeads.length} Prospects Found</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Target Client</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Value Matrix</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Observations / Notes</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Pipeline Shift</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: '#EA580C' }} />
                                        Retrieving prospect pipelines...
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                                        No active prospects registered. Start logging outreach now!
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const cfg = getStatusConfig(lead.status);
                                    return (
                                        <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 850, color: '#0F172A', fontSize: '0.9rem' }}>{lead.business_name}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
                                                    {lead.contact_name && <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {lead.contact_name}</span>}
                                                    {lead.email && <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {lead.email}</span>}
                                                    {lead.phone && <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {lead.phone}</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                                    background: cfg.bg, color: cfg.color 
                                                }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 900, color: '#0F172A', fontSize: '0.85rem' }}>
                                                ₹{Number(lead.estimated_value || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 500, maxWidth: '250px' }}>
                                                {lead.notes || <i style={{ color: '#94A3B8' }}>No logged communications.</i>}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <select 
                                                    value={lead.status || 'NEW'}
                                                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                    style={{ 
                                                        padding: '0.4rem 0.75rem', borderRadius: '10px', 
                                                        border: '1px solid #E2E8F0', fontWeight: 800, 
                                                        fontSize: '0.75rem', color: '#1E293B', outline: 'none', cursor: 'pointer' 
                                                    }}
                                                >
                                                    <option value="NEW">NEW</option>
                                                    <option value="CONTACTED">CONTACTED</option>
                                                    <option value="PRESENTATION">PRESENTATION</option>
                                                    <option value="CONVERTED">CONVERTED</option>
                                                    <option value="LOST">LOST</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Lead Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '28px', padding: '2rem', width: '90%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(234, 88, 12, 0.15)', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#1E293B', margin: '0 0 0.5rem 0' }}>Log New Prospect</h3>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 1.5rem 0' }}>Ensure contact coordinates are entered correctly for accurate tracking.</p>

                        {formError && (
                            <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.75rem', borderRadius: '12px', fontWeight: 750, fontSize: '0.8rem', marginBottom: '1rem' }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Target Business Name</label>
                                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }} placeholder="e.g. Apex Retailers" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Name</label>
                                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }} placeholder="Sanjay Mehta" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Est. Value (₹)</label>
                                    <input type="number" min="0" step="100" value={estValue} onChange={(e) => setEstValue(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.85rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Work Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }} placeholder="sanjay@apex.com" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Phone</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: '0.85rem', outline: 'none' }} placeholder="9876543210" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Outreach Notes</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 500, fontSize: '0.85rem', minHeight: '80px', resize: 'vertical', outline: 'none' }} placeholder="Met owner today. Interested in accounting modules..."></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 850, fontSize: '0.95rem', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 15px rgba(234,88,12,0.3)' }}
                            >
                                {saving ? <RefreshCw size={18} className="animate-spin" /> : 'Commit Prospect Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SalesLeads;
