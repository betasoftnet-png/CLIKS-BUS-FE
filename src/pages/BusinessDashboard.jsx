import React from 'react';
import { 
    LayoutDashboard, 
    Briefcase, 
    BarChart3, 
    Users, 
    TrendingUp, 
    DollarSign, 
    Package, 
    ShoppingCart,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell
} from 'lucide-react';
import '../App.css';

const BusinessDashboard = () => {
    // Mock data for Business Dashboard
    const stats = [
        { label: 'Monthly Revenue', value: '₹4,52,000', change: '+12.5%', icon: DollarSign, color: '#1B6B3A' },
        { label: 'Active Projects', value: '24', change: '+2', icon: Briefcase, color: '#064E3B' },
        { label: 'Business Growth', value: '18%', change: '+3.1%', icon: TrendingUp, color: '#059669' },
        { label: 'New Clients', value: '12', change: '+4', icon: Users, color: '#10B981' }
    ];

    return (
        <div style={{ padding: '2rem', background: '#ffffff', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', marginBottom: '0.25rem' }}>Business Overview</h1>
                    <p style={{ color: '#64748B' }}>Monitor your enterprise performance and operations.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search analytics..." 
                            style={{ padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', width: '260px' }}
                        />
                    </div>
                    <button style={{ padding: '0.65rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B' }}>
                        <Bell size={20} />
                    </button>
                    <button style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '600' }}>
                        Create Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', background: '#F0FDF4', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{stat.change}</span>
                        </div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Revenue Chart */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B' }}>Revenue Performance</h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#1B6B3A' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B6B3A' }} /> Sales
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: '#DCF2E4' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DCF2E4' }} /> Services
                                </span>
                            </div>
                        </div>
                        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', padding: '0 1rem' }}>
                            {[45, 65, 40, 85, 55, 95, 75, 80, 60, 85, 55, 100].map((h, i) => (
                                <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                                    <div style={{ height: `${h}%`, width: '100%', background: 'linear-gradient(to top, #1B6B3A, #064E3B)', borderRadius: '8px 8px 4px 4px', position: 'relative' }}>
                                        {i === 11 && <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: '#064E3B', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800' }}>₹4.5L</div>}
                                    </div>
                                    <span style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: '700', color: '#94A3B8', textAlign: 'center' }}>
                                        {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Health */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#064E3B', marginBottom: '1.5rem' }}>Inventory Health</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            {[
                                { label: 'Fast Moving', count: 142, color: '#1B6B3A', pct: 65 },
                                { label: 'Slow Moving', count: 48, color: '#F59E0B', pct: 22 },
                                { label: 'Dead Stock', count: 24, color: '#EF4444', pct: 13 }
                            ].map((item, i) => (
                                <div key={i} style={{ padding: '1.25rem', borderRadius: '20px', background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{item.label}</p>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.75rem' }}>{item.count}</h4>
                                    <div style={{ height: '6px', width: '100%', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${item.pct}%`, background: item.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Side Widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', padding: '2rem', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(27, 107, 58, 0.2)' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <Target size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.5rem' }}>Enterprise Goal</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '2rem' }}>You've achieved 82% of your quarterly revenue target.</p>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '82%', background: 'white' }} />
                            </div>
                            <button style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'white', color: '#064E3B', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer' }}>View Strategy</button>
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>Recent Ops</h3>
                            <Clock size={18} color="#94A3B8" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { title: 'GST Filing', time: '2h ago', status: 'Completed', color: '#10B981' },
                                { title: 'Inventory Sync', time: '5h ago', status: 'Pending', color: '#F59E0B' },
                                { title: 'Payroll Run', time: 'Yesterday', status: 'Completed', color: '#10B981' }
                            ].map((op, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: op.color }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>{op.title}</p>
                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{op.time}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: op.color }}>{op.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;
