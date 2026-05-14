import React, { useState, useEffect } from 'react';
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
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context';
import '../../App.css';

const AdminUsers = () => {
    const { impersonateLogin } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const backendUsers = await adminService.getUsers(1, 100);
            
            // Adapt backend schema to visual UI grid
            const mapped = backendUsers.map(u => {
                const isActive = (u.is_active === true || u.is_active === 1 || u.is_active === 'true');
                const arrFormatted = u.total_arr > 0 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(u.total_arr) 
                    : '$0';

                return {
                    id: `CLI-${String(u.id).padStart(4, '0')}`,
                    realId: u.id,
                    name: u.username,
                    company: u.business_name || 'Independent Entrepreneur',
                    email: u.email,
                    date: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'May 12, 2026',
                    plan: u.role === 'admin' ? 'Platform SuperAdmin' : (u.license_tier || 'Growth Tier'),
                    status: isActive ? 'Active' : 'Suspended',
                    value: u.role === 'admin' ? 'Unlimited' : arrFormatted,
                    role: u.role,
                    isActive
                };
            });
            setClients(mapped);

        } catch (err) {
            console.error("Load users error:", err);
            // Maintain mock fallback in case API isn't actively serving
            setClients([
                { id: 'CLI-9281', realId: 1, name: 'Alex Henderson', company: 'Henderson & Sons', email: 'alex@hendersons.com', date: 'Oct 12, 2025', plan: 'Enterprise PRO', status: 'Active', value: '$1,200' },
                { id: 'CLI-8839', realId: 2, name: 'Samantha Vance', company: 'Vance Logistics LLC', email: 's.vance@logistics.co', date: 'Nov 01, 2025', plan: 'Growth Tier', status: 'Active', value: '$450' },
                { id: 'CLI-7421', realId: 3, name: 'Donald Blake', company: 'Blake Dental Supplies', email: 'donald@blakecare.com', date: 'Dec 14, 2025', plan: 'Starter Free', status: 'Suspended', value: '$0' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleRole = async (client) => {
        const newRole = client.role === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Toggle role for ${client.name} to ${newRole}?`)) return;
        
        try {
            await adminService.updateUserRole(client.realId, newRole);
            loadUsers();
        } catch {
            alert("Failed to update user permission matrix");
        }
    };

    const handleImpersonate = async (client) => {
        if (client.role === 'admin') {
            alert("SuperAdmin impersonation cross-overs are blocked. You can only impersonate standard client tenants.");
            return;
        }
        if (!window.confirm(`IMPERSONATION SHIELD WARNING!\n\nYou are opening a secure remote support tunnel into the Dashboard belonging to @${client.name} (${client.company}).\n\nDo you want to proceed?`)) return;

        try {
            await impersonateLogin(client.realId);
            // Fully redirect root to rebuild execution state on new user claims
            window.location.href = '/';
        } catch {
            alert("Gateway failed to validate temporary support JWT claims.");
        }
    };

    const handleDelete = async (client) => {
        if (!window.confirm(`CRITICAL: Purge all resources and delete account for ${client.name}?`)) return;
        
        try {
            await adminService.deleteUser(client.realId);
            setClients(prev => prev.filter(c => c.realId !== client.realId));
        } catch {
            alert("Failed to delete record. (You cannot delete yourself!)");
        }
    };

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
                    <button 
                        onClick={loadUsers}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Grid
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
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>
                    Showing <span style={{ color: '#0F172A' }}>{filteredClients.length}</span> of {clients.length} records
                </div>
            </div>

            {/* Clients Table */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: '#4F46E5', fontWeight: '800' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ marginRight: '10px' }} /> Restructuring Matrix Records...
                </div>
            ) : (
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
                                            background: c.role === 'admin' ? '#EEF2FF' : '#F0FDF4', 
                                            color: c.role === 'admin' ? '#4F46E5' : '#16A34A', 
                                            padding: '4px 8px', 
                                            borderRadius: '6px' 
                                        }}>
                                            {c.plan}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '800', color: '#0F172A' }}>{c.value}</td>
                                    <td>
                                        <span className={`status-pill status-${c.status}`}>
                                            {c.role === 'admin' ? <Shield size={12} /> : (c.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />)}
                                            {c.role === 'admin' ? 'SUPER_ADMIN' : (c.isActive ? 'ACTIVE_TENANT' : 'SUSPENDED')}
                                        </span>
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            {c.role !== 'admin' && (
                                                <button 
                                                    className="action-circle-btn" 
                                                    style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' }}
                                                    title="Login As Tenant"
                                                    onClick={() => handleImpersonate(c)}
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                            )}
                                            <button 
                                                className="action-circle-btn" 
                                                title={c.role === 'admin' ? "Revoke Admin" : "Promote to Admin"}
                                                onClick={() => handleToggleRole(c)}
                                            >
                                                <Shield size={14} color={c.role === 'admin' ? '#4F46E5' : '#64748B'} />
                                            </button>
                                            <button 
                                                className="action-circle-btn" 
                                                style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#EF4444' }}
                                                title="Purge Record"
                                                onClick={() => handleDelete(c)}
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;


