import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    Users, 
    Award, 
    ArrowRight,
    Activity,
    RefreshCw,
    Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { salesAgentService } from '../../services/salesAgentService';

const SalesDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_leads: 0,
        new_leads: 0,
        conversions: 0,
        gross_pipeline: 0
    });
    const [agentName, setAgentName] = useState('Representative');
    const navigate = useNavigate();

    const fetchSnapshot = async () => {
        setLoading(true);
        try {
            const res = await salesAgentService.getStats();
            if (res && res.data) {
                setStats(res.data);
            }
            
            // Fetch agent details from cache
            const cachedProfile = localStorage.getItem('cliks_user_profile');
            if (cachedProfile) {
                const parsed = JSON.parse(cachedProfile);
                setAgentName(parsed.name || 'Representative');
            }
        } catch (err) {
            console.error("Failed to query representative telemetry:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSnapshot();
    }, []);

    // Derive stats
    const conversionRate = stats.total_leads > 0 
        ? Math.round((stats.conversions / stats.total_leads) * 100) 
        : 0;

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            
            {/* Greeting & Refresh Widget */}
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SALES TERMINAL</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Welcome, {agentName}!</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Track personal lead distributions, estimated pipelines, and aggregate metrics.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={fetchSnapshot}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Stats
                    </button>
                </div>
            </div>

            {/* Performance KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* Card 1: Total Enlisted Leads */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Prospect Volume</span>
                        <div style={{ background: '#FFF7ED', color: '#EA580C', padding: '8px', borderRadius: '12px' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>{stats.total_leads}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#EA580C', fontWeight: 750 }}>
                        <Flame size={12} /> {stats.new_leads} Brand New Leads Pending Outreach
                    </div>
                </div>

                {/* Card 2: Conversions Matrix */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '1.75rem', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ color: '#64748B', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Conversions</span>
                        <div style={{ background: '#ECFDF5', color: '#10B981', padding: '8px', borderRadius: '12px' }}>
                            <Award size={20} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 0.25rem 0' }}>{stats.conversions}</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>{conversionRate}% Close Effectiveness</p>
                </div>

                {/* Card 3: Gross Pipeline Value */}
                <div style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', borderRadius: '24px', padding: '1.75rem', color: 'white', boxShadow: '0 10px 30px rgba(234, 88, 12, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Potential pipeline</span>
                        <div style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px', borderRadius: '12px' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>
                        ₹{Number(stats.gross_pipeline).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Estimated combined prospect values</p>
                </div>
            </div>

            {/* Engagement Action Matrix Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Quick Actions panel */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Manage Pipeline</h3>
                        <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 1.5rem 0' }}>Add prospective B2B business clients, schedule presentations, or modify prospect engagement levels.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/sales-portal/leads')}
                        style={{ width: 'fit-content', padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#0F172A', color: 'white', fontWeight: 750, fontSize: '0.85rem', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.1)' }}
                    >
                        Launch Prospecting Matrix <ArrowRight size={16} />
                    </button>
                </div>

                {/* Commission Gauge Module */}
                <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '2rem', borderRadius: '24px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Platform Performance</h3>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontSize: '0.65rem', fontWeight: 900 }}>SECURE RANK</span>
                        </div>
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>Your conversion statistics contribute directly to incentives pools maintained by SuperAdmins.</p>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 750, color: '#94A3B8', marginBottom: '0.4rem' }}>
                            <span>CONVERSION PROGRESSION</span>
                            <span>{conversionRate}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${conversionRate}%`, height: '100%', background: 'linear-gradient(90deg, #F97316, #EF4444)', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SalesDashboard;
