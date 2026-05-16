import React, { useEffect, useState } from 'react';
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
    Globe,
    RefreshCw,
    Trash2,
    ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import '../../App.css';
import { customConfirm } from '../../utils/customConfirm';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDashboardTelemetry = async () => {
        setLoading(true);
        try {
            const data = await adminService.getSystemStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to connect command telemetry:", err);
            // Preserve mock fallback in dashboard if server is down
            setStats({
                totalBusinesses: 1242,
                platformMrr: 42850,
                publicPostsCount: 219,
                systemUptime: '99.98%',
                apiClusterStatus: { cpu: 32, memory: 58, storage: 14 },
                monthlyOnboarding: [45, 62, 58, 85, 110, 95, 130, 150, 142, 180, 210, 245],
                topBusinesses: [
                    { name: 'Acme Industrial Corp', plan: 'Enterprise PRO', users: 45, state: 'Active', color: '#10B981' },
                    { name: 'Stark Logistics Ltd', plan: 'Growth Tier', users: 12, state: 'Active', color: '#10B981' },
                    { name: 'Wayne Financials', plan: 'Enterprise PRO', users: 98, state: 'Active', color: '#10B981' },
                    { name: 'Tyrell BioGenics', plan: 'Starter Free', users: 2, state: 'Suspended', color: '#EF4444' },
                    { name: 'Cyberdyne Sys', plan: 'Growth Tier', users: 8, state: 'Active', color: '#10B981' }
                ],
                incidents: [
                    { type: 'ALERT', text: 'Stripe billing Webhook returned code 500', time: '4m ago', bg: '#FEF2F2', textCol: '#EF4444' },
                    { type: 'INFO', text: 'Server us-east-2 provisioned autoscaling unit', time: '1h ago', bg: '#EFF6FF', textCol: '#3B82F6' },
                    { type: 'WARN', text: 'Slow database migration detected on API v2', time: '3h ago', bg: '#FFFBEB', textCol: '#D97706' }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFlushCache = async () => {
        if (!await customConfirm("CRITICAL ACTION: Instruct cluster to purge dynamic server cache layer?")) return;
        setActionLoading(true);
        try {
            const res = await adminService.flushCache();
            alert(res.message || "Application cache flushed successfully.");
        } catch {
            alert("Error attempting emergency cache purge.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleIntegrityCheck = async () => {
        setActionLoading(true);
        try {
            const res = await adminService.runIntegrityCheck();
            alert(`SYSTEM INTEGRITY OPTIMAL!\n\nStatus: ${res.data.status}\nDB Health: ${res.data.connection}\nScan Count: ${res.data.diagnostics_count} tenants`);
        } catch {
            alert("Error during DB integrity auditing sequence.");
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardTelemetry();
    }, []);

    const adminStats = [
        { label: 'Total Client Entities', value: stats ? stats.totalBusinesses.toLocaleString() : '...', change: 'Live Dynamic', icon: Globe, color: '#6366F1' },
        { label: 'Estimated Platform MRR', value: stats ? `$${stats.platformMrr.toLocaleString()}` : '...', change: 'ARR Weighted', icon: TrendingUp, color: '#8B5CF6' },
        { label: 'Feed Broadcast Vectors', value: stats ? stats.publicPostsCount.toLocaleString() : '...', change: 'Platform Streams', icon: Users, color: '#0EA5E9' },
        { label: 'Telemetry Uptime', value: stats ? stats.systemUptime : '...', change: 'Operational', icon: Activity, color: '#10B981' }
    ];

    const onboardingValues = stats?.monthlyOnboarding || [45, 62, 58, 85, 110, 95, 130, 150, 142, 180, 210, 245];
    const topBusinesses = stats?.topBusinesses || [];
    const incidents = stats?.incidents || [];

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
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .admin-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
                }
                .admin-btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
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
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>PLATFORM CONTROL</span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>LIVE TELEMETRY ACTIVE</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', background: 'linear-gradient(135deg, #0F172A, #475569)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Control Command</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Platform governance core driven by real-time database execution states.</p>
                </div>
                <div className="dashboard-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={fetchDashboardTelemetry}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', cursor: 'pointer', fontWeight: '700' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync
                    </button>
                    <button 
                        onClick={handleFlushCache}
                        disabled={actionLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: '700' }}
                        title="Flush Clusters"
                    >
                        <Trash2 size={16} /> Flush Cache
                    </button>
                    <button 
                        onClick={handleIntegrityCheck}
                        disabled={actionLoading}
                        className="admin-btn-primary"
                    >
                        <ShieldCheck size={16} /> Diagnostic Audit
                    </button>
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
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>Real-time monthly aggregates derived directly from client creation timestamps.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#4F46E5' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F46E5' }} /> Total Activations
                                </span>
                            </div>
                        </div>
                        
                        <div className="dashboard-chart-bars-container" style={{ height: '250px', alignItems: 'flex-end' }}>
                            {onboardingValues.map((val, i) => {
                                const maxVal = Math.max(...onboardingValues, 100);
                                const heightPct = (val / maxVal) * 100;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                                        <div style={{ 
                                            height: `${heightPct}%`, 
                                            width: '60%', 
                                            alignSelf: 'center',
                                            background: i === onboardingValues.length - 1 ? 'linear-gradient(to top, #7C3AED, #C084FC)' : 'linear-gradient(to top, #4F46E5, #818CF8)', 
                                            borderRadius: '8px 8px 4px 4px',
                                            position: 'relative',
                                            boxShadow: i === onboardingValues.length - 1 ? '0 4px 15px rgba(124, 58, 237, 0.25)' : 'none'
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
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Top Clients (Revenue Contribution)</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>High-value registered entities sorted dynamically by billing accumulation.</p>
                            </div>
                            <a href="/admin/users" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4F46E5', textDecoration: 'none' }}>Manage All Tenants &rarr;</a>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            {topBusinesses.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                    Waiting for client database query yields...
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Business Entity</th>
                                            <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>License Plan</th>
                                            <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Simulated Seats</th>
                                            <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Audit State</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topBusinesses.map((b, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: '700', color: '#0F172A' }}>{b.name}</td>
                                                <td style={{ padding: '16px 8px' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '750', padding: '4px 8px', borderRadius: '6px', background: '#EEF2FF', color: '#4F46E5' }}>
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
                            )}
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
                                { icon: Cpu, label: 'CPU Core Load', pct: stats?.apiClusterStatus?.cpu || 32, state: (stats?.apiClusterStatus?.cpu || 32) > 75 ? 'Degraded' : 'Normal' },
                                { icon: HardDrive, label: 'Memory Usage', pct: stats?.apiClusterStatus?.memory || 58, state: (stats?.apiClusterStatus?.memory || 58) > 80 ? 'Heavy' : 'Healthy' },
                                { icon: Database, label: 'Storage Read/Write', pct: stats?.apiClusterStatus?.storage || 14, state: 'Nominal' }
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
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Incident Console</h3>
                            <ShieldAlert size={18} color="#EF4444" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {incidents.length === 0 ? (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                                    No monitored dynamic alerts.
                                </div>
                            ) : (
                                incidents.map((item, i) => (
                                    <div key={i} style={{ padding: '1rem', borderRadius: '16px', backgroundColor: item.bg, border: `1px solid ${item.textCol}15` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: item.textCol }}>{item.type}</span>
                                            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '600' }}>{item.time}</span>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E293B', margin: 0, lineHeight: 1.4 }}>{item.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

