import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    Factory, 
    Layers, 
    ClipboardList, 
    Activity, 
    CheckCircle2, 
    AlertTriangle, 
    TrendingUp, 
    Plus, 
    ArrowRight, 
    Clock, 
    DollarSign,
    Package,
    ShieldAlert,
    RefreshCw
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const ManufacturingDashboard = () => {
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();

    const { data: kpis, isLoading, refetch } = useQuery({
        queryKey: ['manufacturingDashboardKPIs'],
        queryFn: () => manufacturingService.getDashboard(),
        staleTime: 1000 * 30
    });

    const counts = kpis?.counts || {};
    const costs = kpis?.costs || {};
    const recentOrders = kpis?.recent_orders || [];

    const getStatusBadge = (status) => {
        const styles = {
            'Draft': { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
            'Confirmed': { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
            'In Progress': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
            'Completed': { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
            'Cancelled': { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
        };
        const s = styles[status] || styles['Draft'];
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '10px', color: '#1B6B3A' }}>
                            <Factory size={26} />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Manufacturing & Production Management
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
                        Track recipes (BOM), production orders, material consumption, wastage & inventory conversions.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => refetch()}
                        style={{
                            padding: '0.65rem 1rem',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            background: '#FFFFFF',
                            color: '#475569',
                            fontWeight: '600',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/manufacturing/bom')}
                        style={{
                            padding: '0.65rem 1.15rem',
                            border: '1px solid #10B981',
                            borderRadius: '10px',
                            background: '#ECFDF5',
                            color: '#065F46',
                            fontWeight: '700',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Layers size={18} /> Manage BOMs
                    </button>
                    <button 
                        onClick={() => navigate('/manufacturing/orders')}
                        style={{
                            padding: '0.65rem 1.25rem',
                            border: 'none',
                            borderRadius: '10px',
                            background: '#1B6B3A',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)'
                        }}
                    >
                        <Plus size={18} /> New Production Order
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {/* Total Orders */}
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Production Orders</span>
                        <div style={{ padding: '6px', background: '#F0FDF4', borderRadius: '8px', color: '#16A34A' }}><ClipboardList size={18} /></div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>
                        {counts.total || 0}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748B' }}>
                        <span><b style={{ color: '#D97706' }}>{counts['In Progress'] || 0}</b> In Progress</span>
                        <span>•</span>
                        <span><b style={{ color: '#16A34A' }}>{counts['Completed'] || 0}</b> Completed</span>
                    </div>
                </div>

                {/* Output Produced */}
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Good Output Units</span>
                        <div style={{ padding: '6px', background: '#ECFDF5', borderRadius: '8px', color: '#059669' }}><CheckCircle2 size={18} /></div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>
                        {counts.total_completed_qty || 0}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Target Planned: <b>{counts.total_planned_qty || 0}</b> units
                    </div>
                </div>

                {/* Material Shortages */}
                <div 
                    onClick={() => navigate('/manufacturing/orders')}
                    style={{ 
                        background: (kpis?.shortage_count || 0) > 0 ? '#FFFBEB' : '#FFFFFF', 
                        padding: '1.25rem', 
                        borderRadius: '14px', 
                        border: (kpis?.shortage_count || 0) > 0 ? '1px solid #FCD34D' : '1px solid #E2E8F0', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: (kpis?.shortage_count || 0) > 0 ? '#B45309' : '#64748B', textTransform: 'uppercase' }}>
                            Material Shortages
                        </span>
                        <div style={{ padding: '6px', background: (kpis?.shortage_count || 0) > 0 ? '#FEF3C7' : '#F1F5F9', borderRadius: '8px', color: (kpis?.shortage_count || 0) > 0 ? '#D97706' : '#64748B' }}>
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '850', color: (kpis?.shortage_count || 0) > 0 ? '#B45309' : '#1E293B', marginBottom: '0.5rem' }}>
                        {kpis?.shortage_count || 0}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: (kpis?.shortage_count || 0) > 0 ? '#B45309' : '#10B981', fontWeight: '600' }}>
                        {(kpis?.shortage_count || 0) > 0 ? 'Action needed before release' : 'All materials sufficient in godown'}
                    </div>
                </div>

                {/* Total Manufacturing Spend */}
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Production Cost</span>
                        <div style={{ padding: '6px', background: '#F0F9FF', borderRadius: '8px', color: '#0284C7' }}><DollarSign size={18} /></div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>
                        {formatCurrency(costs.total_production_cost || 0)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Raw Material: <b>{formatCurrency(costs.total_material_consumed_cost || 0)}</b>
                    </div>
                </div>

                {/* Wastage & Scrap Cost */}
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Wastage & Rejections</span>
                        <div style={{ padding: '6px', background: '#FEF2F2', borderRadius: '8px', color: '#EF4444' }}><ShieldAlert size={18} /></div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '850', color: '#DC2626', marginBottom: '0.5rem' }}>
                        {formatCurrency(costs.total_wastage_cost || 0)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Rejected output: <b>{costs.total_rejected_units || 0}</b> units
                    </div>
                </div>
            </div>

            {/* Workflow Pipeline Bar */}
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '1rem' }}>
                    Production Lifecycle Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div 
                        onClick={() => navigate('/manufacturing/orders?status=Draft')}
                        style={{ padding: '1rem', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginBottom: '0.25rem' }}>1. DRAFT</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E293B' }}>{counts.Draft || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Planning & Recipe Check</div>
                    </div>

                    <div 
                        onClick={() => navigate('/manufacturing/orders?status=Confirmed')}
                        style={{ padding: '1rem', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1D4ED8', marginBottom: '0.25rem' }}>2. CONFIRMED</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E293B' }}>{counts.Confirmed || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>Stock Verified & Scheduled</div>
                    </div>

                    <div 
                        onClick={() => navigate('/manufacturing/orders?status=In Progress')}
                        style={{ padding: '1rem', borderRadius: '10px', background: '#FEF3C7', border: '1px solid #FDE68A', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#B45309', marginBottom: '0.25rem' }}>3. IN PROGRESS</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E293B' }}>{counts['In Progress'] || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#D97706' }}>Raw Material Consuming</div>
                    </div>

                    <div 
                        onClick={() => navigate('/manufacturing/orders?status=Completed')}
                        style={{ padding: '1rem', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#047857', marginBottom: '0.25rem' }}>4. COMPLETED</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1E293B' }}>{counts.Completed || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Finished Goods in Inventory</div>
                    </div>
                </div>
            </div>

            {/* Recent Orders & Quick Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Recent Orders Table */}
                <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                            Recent Production Orders
                        </h3>
                        <button 
                            onClick={() => navigate('/manufacturing/orders')}
                            style={{ background: 'none', border: 'none', color: '#1B6B3A', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                            <Factory size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontWeight: '600' }}>No production orders created yet.</p>
                            <button
                                onClick={() => navigate('/manufacturing/orders')}
                                style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#1B6B3A', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Create First Order
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                                        <th style={{ padding: '10px 8px' }}>Order #</th>
                                        <th style={{ padding: '10px 8px' }}>Finished Product</th>
                                        <th style={{ padding: '10px 8px' }}>Planned</th>
                                        <th style={{ padding: '10px 8px' }}>Output</th>
                                        <th style={{ padding: '10px 8px' }}>Status</th>
                                        <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: '700', color: '#1E293B' }}>
                                                {order.order_number}
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#334155' }}>
                                                {order.product_name || 'N/A'}
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#64748B' }}>
                                                {order.planned_quantity}
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#16A34A', fontWeight: '700' }}>
                                                {order.completed_quantity || 0}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => navigate(`/manufacturing/orders?orderId=${order.id}`)}
                                                    style={{ padding: '4px 10px', background: '#F1F5F9', border: 'none', borderRadius: '6px', color: '#1E293B', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Modules Nav */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.75rem' }}>
                            Manufacturing Modules
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div 
                                onClick={() => navigate('/manufacturing/bom')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: '#1B6B3A' }}><Layers size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>Bill of Materials</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Define component recipes & units</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </div>

                            <div 
                                onClick={() => navigate('/manufacturing/orders')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: '#0284C7' }}><ClipboardList size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>Production Orders</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Stock checks, release & execution</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </div>

                            <div 
                                onClick={() => navigate('/manufacturing/consumption')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: '#D97706' }}><Activity size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>Material Consumption</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Issue, wastage & returns tracking</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </div>

                            <div 
                                onClick={() => navigate('/manufacturing/completion')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: '#059669' }}><CheckCircle2 size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>Production Completion</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Post finished goods & actual costing</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </div>

                            <div 
                                onClick={() => navigate('/manufacturing/reports')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: '#7C3AED' }}><TrendingUp size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>Manufacturing Reports</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>8 comprehensive audit & cost reports</div>
                                    </div>
                                </div>
                                <ArrowRight size={16} color="#94A3B8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManufacturingDashboard;
