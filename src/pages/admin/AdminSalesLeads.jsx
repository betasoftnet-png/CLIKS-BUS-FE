import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Search, 
    Shield, 
    TrendingUp, 
    User, 
    Phone, 
    Mail, 
    Calendar,
    AlertTriangle,
    CheckCircle,
    Zap,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminSalesLeads = () => {
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchGlobalLeads = async () => {
        setLoading(true);
        try {
            const res = await adminService.getGlobalLeads();
            if (res) {
                setLeads(res);
            }
        } catch (err) {
            console.error("Failed to query global leads metrics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalLeads();
    }, []);

    const getStatusPill = (status) => {
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

    // Derive aggregate overview vectors
    const totals = leads.reduce((acc, lead) => {
        acc.grossValue += Number(lead.estimated_value || 0);
        if (lead.status === 'CONVERTED') acc.converted += 1;
        return acc;
    }, { grossValue: 0, converted: 0 });

    const filteredLeads = leads
        .filter(l => statusFilter === 'ALL' ? true : (l.status || '').toUpperCase() === statusFilter.toUpperCase())
        .filter(l => {
            const q = searchQuery.toLowerCase();
            return (
                (l.business_name || '').toLowerCase().includes(q) ||
                (l.contact_name || '').toLowerCase().includes(q) ||
                (l.agent_name || '').toLowerCase().includes(q)
            );
        });

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            
            {/* Header widget */}
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>ACQUISITIONS</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Global Leads Matrix</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Bird's-eye view of representative outreach, prospecting velocity, and acquisition conversion flows.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={fetchGlobalLeads}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Stream
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Platform Leads</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0.5rem 0' }}>{leads.length}</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Collective acquisitions tracking grid</p>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Gross Pipeline Value</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', margin: '0.5rem 0' }}>
                        ₹{Number(totals.grossValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Estimated collective prospecting revenue</p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white' }}>
                    <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Platform Conversion Rate</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0' }}>
                        {leads.length > 0 ? Math.round((totals.converted / leads.length) * 100) : 0}%
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>{totals.converted} active converts out of {leads.length} total leads</p>
                </div>
            </div>

            {/* Leads Log */}
            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 12px 40px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                        <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', flex: 1, position: 'relative', margin: 0, maxWidth: '400px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search Prospects or Assigned Reps..." 
                                className="dashboard-search-input"
                                style={{ background: 'transparent', width: '100%', paddingLeft: '36px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', background: '#F8FAFC', outline: 'none' }}
                        >
                            <option value="ALL">All Pipeline Stages</option>
                            <option value="NEW">New Prospects</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="PRESENTATION">Presentation Scheduled</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Business Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Assigned Agent</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Pipeline Stage</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', textAlign: 'right' }}>Est. Value</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', display: 'block', color: '#4F46E5' }} />
                                        Hydrating platform prospecting matrices...
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                                        No matching prospects detected in platform flow.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const statConf = getStatusPill(lead.status);
                                    return (
                                        <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 850, color: '#0F172A', fontSize: '0.85rem' }}>{lead.business_name}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><User size={10} /> {lead.contact_name || 'N/A'}</span>
                                                    {lead.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={10} /> {lead.phone}</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ fontWeight: 750, color: '#1E293B', fontSize: '0.85rem' }}>
                                                    {lead.agent_name || <span style={{ color: '#EF4444' }}>UNASSIGNED</span>}
                                                </div>
                                                {lead.agent_email && <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>{lead.agent_email}</div>}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                                    background: statConf.bg, color: statConf.color 
                                                }}>
                                                    {statConf.icon} {statConf.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 850, color: '#0F172A', fontSize: '0.85rem' }}>
                                                ₹{Number(lead.estimated_value || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSalesLeads;
