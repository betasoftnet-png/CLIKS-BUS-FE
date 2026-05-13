import React, { useState } from 'react';
import { 
    Users, 
    Mail, 
    MoreVertical, 
    Shield, 
    Lock, 
    Unlock, 
    CheckCircle, 
    XCircle, 
    Search, 
    Filter, 
    Plus, 
    ChevronDown,
    ExternalLink
} from 'lucide-react';
import '../../App.css';

const AdminUsers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const clients = [
        { id: 'CLI-9281', name: 'Alex Henderson', company: 'Henderson & Sons', email: 'alex@hendersons.com', date: 'Oct 12, 2025', plan: 'Enterprise PRO', status: 'Active', value: '$1,200' },
        { id: 'CLI-8839', name: 'Samantha Vance', company: 'Vance Logistics LLC', email: 's.vance@logistics.co', date: 'Nov 01, 2025', plan: 'Growth Tier', status: 'Active', value: '$450' },
        { id: 'CLI-7421', name: 'Donald Blake', company: 'Blake Dental Supplies', email: 'donald@blakecare.com', date: 'Dec 14, 2025', plan: 'Starter Free', status: 'Suspended', value: '$0' },
        { id: 'CLI-7092', name: 'Michael Jordan', company: 'Flight Ops & Sport', email: 'mj@flightops.com', date: 'Jan 02, 2026', plan: 'Enterprise PRO', status: 'Active', value: '$1,200' },
        { id: 'CLI-6511', name: 'Evelyn Carter', company: 'Carter Microprocessors', email: 'ec@microprocessors.io', date: 'Jan 25, 2026', plan: 'Growth Tier', status: 'Pending', value: '$450' },
        { id: 'CLI-5982', name: 'Bruce Wayne', company: 'Wayne Enterprises', email: 'b.wayne@waynecorp.com', date: 'Feb 11, 2026', plan: 'Enterprise PRO', status: 'Active', value: '$2,400' },
        { id: 'CLI-5320', name: 'Diana Prince', company: 'Themyscira Antiques', email: 'diana@antiques.org', date: 'Mar 01, 2026', plan: 'Growth Tier', status: 'Active', value: '$450' }
    ];

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <style>{`
                .users-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                }
                .users-table tr {
                    background: white;
                    transition: all 0.2s ease;
                }
                .users-table tbody tr:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
                }
                .users-table th {
                    padding: 16px 20px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: none;
                }
                .users-table td {
                    padding: 16px 20px;
                    font-size: 0.88rem;
                    color: #334155;
                    border-top: 1px solid #F1F5F9;
                    border-bottom: 1px solid #F1F5F9;
                }
                .users-table td:first-child {
                    border-left: 1px solid #F1F5F9;
                    border-top-left-radius: 16px;
                    border-bottom-left-radius: 16px;
                    font-weight: 750;
                    color: #4F46E5;
                }
                .users-table td:last-child {
                    border-right: 1px solid #F1F5F9;
                    border-top-right-radius: 16px;
                    border-bottom-right-radius: 16px;
                }
                .status-pill {
                    font-size: 0.75rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .status-Active { background: #ECFDF5; color: #059669; }
                .status-Suspended { background: #FEF2F2; color: #DC2626; }
                .status-Pending { background: #FFFBEB; color: #D97706; }
                
                .action-circle-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    color: #64748B;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-circle-btn:hover {
                    background: #EEF2FF;
                    color: #4F46E5;
                    border-color: #C7D2FE;
                }
            `}</style>

            {/* Header */}
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>USER MANAGEMENT</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Multi-Tenant Matrix</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>View, verify, and moderate registered client businesses and users.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}>
                        Export Matrix CSV
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
                        <Plus size={18} /> Provision Tenant
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '1.25rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', maxWidth: '400px', width: '100%', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Quick Search Name, Entity, ID..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                        <Filter size={16} /> Filter Plan <ChevronDown size={14} />
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                        Status <ChevronDown size={14} />
                    </button>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>
                    Showing <span style={{ color: '#0F172A' }}>{filteredClients.length}</span> of {clients.length} records
                </div>
            </div>

            {/* Clients Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>Tenant ID</th>
                            <th style={{ textAlign: 'left' }}>Primary Owner</th>
                            <th style={{ textAlign: 'left' }}>Business Entity</th>
                            <th style={{ textAlign: 'left' }}>Registered</th>
                            <th style={{ textAlign: 'left' }}>License Tier</th>
                            <th style={{ textAlign: 'left' }}>ARR Value</th>
                            <th style={{ textAlign: 'left' }}>Control State</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '800', color: '#0F172A' }}>{c.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Mail size={12} /> {c.email}</span>
                                    </div>
                                </td>
                                <td style={{ fontWeight: '700', color: '#1E293B' }}>{c.company}</td>
                                <td style={{ color: '#64748B', fontWeight: '500' }}>{c.date}</td>
                                <td>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: '800', 
                                        background: c.plan.includes('Enterprise') ? '#EEF2FF' : (c.plan.includes('Growth') ? '#F0FDF4' : '#F1F5F9'), 
                                        color: c.plan.includes('Enterprise') ? '#4F46E5' : (c.plan.includes('Growth') ? '#16A34A' : '#475569'), 
                                        padding: '4px 8px', 
                                        borderRadius: '6px' 
                                    }}>
                                        {c.plan}
                                    </span>
                                </td>
                                <td style={{ fontWeight: '800', color: '#0F172A' }}>{c.value}</td>
                                <td>
                                    <span className={`status-pill status-${c.status}`}>
                                        {c.status === 'Active' ? <CheckCircle size={12} /> : (c.status === 'Suspended' ? <XCircle size={12} /> : <Shield size={12} />)}
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="action-circle-btn" title="Impersonate Login"><ExternalLink size={14} /></button>
                                        <button className="action-circle-btn" title={c.status === 'Suspended' ? "Activate" : "Suspend"}>
                                            {c.status === 'Suspended' ? <Unlock size={14} /> : <Lock size={14} />}
                                        </button>
                                        <button className="action-circle-btn"><MoreVertical size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
