import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    TrendingUp, 
    ShieldAlert,
    Activity,
    Database,
    HardDrive,
    Cpu,
    Server,
    Search,
    Bell,
    Filter,
    Globe
} from 'lucide-react';
import '../../App.css';

const AdminDashboard = () => {
    const adminStats = [
        { label: 'Total Client Businesses', value: '1,242', change: '+18% this month', icon: Globe, color: '#6366F1' },
        { label: 'Platform MRR', value: '$42,850', change: '+12.4%', icon: TrendingUp, color: '#8B5CF6' },
        { label: 'Active Sessions', value: '3,891', change: 'Live Now', icon: Users, color: '#0EA5E9' },
        { label: 'System Uptime', value: '99.98%', change: 'Operational', icon: Activity, color: '#10B981' }
    ];

    const topBusinesses = [
        { name: 'Acme Industrial Corp', plan: 'Enterprise PRO', users: 45, state: 'Active', color: '#10B981' },
        { name: 'Stark Logistics Ltd', plan: 'Growth Tier', users: 12, state: 'Active', color: '#10B981' },
        { name: 'Wayne Financials', plan: 'Enterprise PRO', users: 98, state: 'Active', color: '#10B981' },
        { name: 'Tyrell BioGenics', plan: 'Starter Free', users: 2, state: 'Flagged', color: '#EF4444' },
        { name: 'Cyberdyne Sys', plan: 'Growth Tier', users: 8, state: 'Active', color: '#10B981' }
    ];

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <style>{`
                .admin-theme-header {
                    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
                    border-bottom: 1px solid #334155;
                }
                .admin-stat-card {
                    background: white;
                    border-radius: 24px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
                    border: 1px solid #E2E8F0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .admin-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                }
                .admin-chart-card {
                    background: white;
                    border-radius: 24px;
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
                    border: 1px solid #E2E8F0;
                    flex: 1;
                }
                .admin-btn-primary {
                    background: linear-gradient(135deg, #4F46E5, #7C3AED);
                    color: white;
                    border: none;
                    padding: 0.65rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
                }
                .admin-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
                }
                .progress-ring-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    border-radius: 20px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                }
            `}</style>

            {/* Header Section */}
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>PLATFORM ADMIN</span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>SYSTEM OPERATIONAL</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', background: 'linear-gradient(135deg, #0F172A, #475569)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Control Command</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Complete overview of multi-tenant performance and infrastructure health.</p>
                </div>
                <div className="dashboard-header-actions">
                    <div className="dashboard-search-wrapper" style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search accounts, IDs, IPs..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent' }}
                        />
                    </div>
                    <button style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', cursor: 'pointer' }}>
                        <Filter size={18} />
                    </button>
                    <button className="admin-btn-primary">System Config</button>
                </div>
            </div>

            {/* Stats Summary Grid */}
            <div className="dashboard-stats-grid" style={{ marginBottom: '2.5rem' }}>
                {adminStats.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: '800', 
                                color: stat.color, 
                                background: `${stat.color}10`, 
                                padding: '0.3rem 0.6rem', 
                                borderRadius: '8px' 
                            }}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</h3>
                        <p style={{ fontSize: '1.85rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts and Resource Center */}
            <div className="content-grid" style={{ gap: '2.5rem' }}>
                <div className="dashboard-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Monthly Onboarding Trends */}
                    <div className="admin-chart-card">
                        <div className="dashboard-chart-header" style={{ marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Tenant Onboarding Flow</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Client subscriptions and account activation curves.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#4F46E5' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F46E5' }} /> New Clients
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#E2E8F0' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }} /> Terminations
                                </span>
                            </div>
                        </div>
                        
                        <div className="dashboard-chart-bars-container" style={{ height: '250px', alignItems: 'flex-end' }}>
                            {[45, 62, 58, 85, 110, 95, 130, 150, 142, 180, 210, 245].map((val, i) => {
                                const heightPct = (val / 250) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                                        <div style={{ 
                                            height: `${heightPct}%`, 
                                            width: '60%', 
                                            alignSelf: 'center',
                                            background: i === 11 ? 'linear-gradient(to top, #7C3AED, #C084FC)' : 'linear-gradient(to top, #4F46E5, #818CF8)', 
                                            borderRadius: '8px 8px 4px 4px',
                                            position: 'relative',
                                            boxShadow: i === 11 ? '0 4px 15px rgba(124, 58, 237, 0.25)' : 'none'
                                        }}>
                                            <div style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>
                                                {val}
                                            </div>
                                        </div>
                                        <span style={{ marginTop: '1rem', fontSize: '0.72rem', fontWeight: '750', color: '#64748B', textAlign: 'center' }}>
                                            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enterprise Accounts Overview */}
                    <div className="admin-chart-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Recent High-Value Accounts</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Latest enterprise and growth business registrations.</p>
                            </div>
                            <a href="/admin/users" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4F46E5', textDecoration: 'none' }}>Manage All Tenants &rarr;</a>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Business Entity</th>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Plan Tier</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Users</th>
                                        <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topBusinesses.map((b, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>{b.name}</td>
                                            <td style={{ padding: '16px 8px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '750', padding: '4px 8px', borderRadius: '6px', background: b.plan.includes('Enterprise') ? '#EEF2FF' : '#F8FAFC', color: b.plan.includes('Enterprise') ? '#4F46E5' : '#475569' }}>
                                                    {b.plan}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{b.users}</td>
                                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: b.color, background: `${b.color}10`, padding: '4px 8px', borderRadius: '6px' }}>
                                                    {b.state}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Health Monitoring Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '320px', flexShrink: 0 }}>
                    
                    {/* Infrastructure Cluster Health */}
                    <div className="admin-chart-card" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Server size={20} className="text-indigo-400" style={{ color: '#818CF8' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>API Cluster Status</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { icon: Cpu, label: 'CPU Core Load', pct: 32, state: 'Normal' },
                                { icon: HardDrive, label: 'Memory Usage', pct: 58, state: 'Healthy' },
                                { icon: Database, label: 'Storage Read/Write', pct: 14, state: 'Nominal' }
                            ].map((res, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '750', marginBottom: '0.5rem', opacity: 0.9 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><res.icon size={14} /> {res.label}</span>
                                        <span>{res.pct}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '2px' }}>
                                        <div style={{ height: '100%', width: `${res.pct}%`, background: 'linear-gradient(to right, #4F46E5, #818CF8)', borderRadius: '3px' }} />
                                    </div>
                                    <span style={{ fontSize: '0.6rem', color: '#818CF8', fontWeight: '800', textTransform: 'uppercase' }}>{res.state}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active System Alerts */}
                    <div className="admin-chart-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Platform Incidents</h3>
                            <ShieldAlert size={18} color="#EF4444" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { type: 'ALERT', text: 'Stripe billing Webhook returned code 500', time: '4m ago', bg: '#FEF2F2', textCol: '#EF4444' },
                                { type: 'INFO', text: 'Server us-east-2 provisioned autoscaling unit', time: '1h ago', bg: '#EFF6FF', textCol: '#3B82F6' },
                                { type: 'WARN', text: 'Slow database migration detected on API v2', time: '3h ago', bg: '#FFFBEB', textCol: '#D97706' }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '1rem', borderRadius: '16px', backgroundColor: item.bg, border: `1px solid ${item.textCol}15` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: item.textCol }}>{item.type}</span>
                                        <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>{item.time}</span>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B', margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
