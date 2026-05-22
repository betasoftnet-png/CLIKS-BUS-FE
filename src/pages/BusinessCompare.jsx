import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '../context';
import { 
    Layers, 
    ArrowLeftRight, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Activity, 
    Calendar,
    ChevronRight,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Info,
    Loader2,
    Minus,
    Search,
    CheckCircle2,
    Target,
    ShieldCheck,
    Zap,
    Scale
} from 'lucide-react';
import { businessCompareService, businessPlanService } from '../services';
import '../App.css';

const BusinessCompare = () => {
    const { currency, formatCurrency } = useCurrency();
    const [selectedPlans, setSelectedPlans] = useState([]);

    // Fetch all plans for selection
    const { data: plans = [] } = useQuery({
        queryKey: ['business-plans-list'],
        queryFn: async () => {
            const res = await businessPlanService.getPlans();
            return res.data || [];
        }
    });

    // Fetch Periodic Comparison
    const { data: periodic = { current: { revenue: 0, expenses: 0 }, previous: { revenue: 0, expenses: 0 } } } = useQuery({
        queryKey: ['business-periodic-compare'],
        queryFn: async () => {
            const res = await businessCompareService.getPeriodicComparison();
            return res.data || { current: { revenue: 0, expenses: 0 }, previous: { revenue: 0, expenses: 0 } };
        }
    });

    // Fetch Scenario Comparison
    const { data: scenarioData = [], isLoading: isScenarioLoading } = useQuery({
        queryKey: ['business-scenario-compare', selectedPlans],
        queryFn: async () => {
            if (selectedPlans.length === 0) return [];
            const res = await businessCompareService.getScenarioComparison(selectedPlans);
            return res.data || [];
        },
        enabled: selectedPlans.length > 0
    });

    const togglePlanSelection = (id) => {
        setSelectedPlans(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : (prev.length < 3 ? [...prev, id] : prev)
        );
    };

    const getGrowth = (curr, prev) => {
        if (!prev) return 0;
        return ((curr - prev) / prev) * 100;
    };

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Scale size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Performance Compare</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Benchmarking and scenario analysis for your business operations.</p>
                </div>
            </div>

            {/* Scrollable Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Periodic Stats Snapshot - Matching Gold Standard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Current Revenue', value: formatCurrency(periodic?.current.revenue || 0), icon: TrendingUp, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Target Achievement', value: '92%', icon: Target, color: '#0D9488', bg: '#CCFBF1' },
                    { label: 'Expense Ratio', value: '42%', icon: Activity, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Growth Index', value: `+${getGrowth(periodic?.current.revenue, periodic?.previous.revenue).toFixed(1)}%`, icon: Zap, color: '#8B5CF6', bg: '#EDE9FE' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Comparison Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem' }}>
                {/* Selector Panel */}
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeftRight size={18} />
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#1E293B' }}>Select Scenarios</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500', marginBottom: '2rem' }}>Choose up to 3 plans for side-by-side analysis.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => togglePlanSelection(plan.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem', borderRadius: '18px', border: '1px solid', 
                                    borderColor: selectedPlans.includes(plan.id) ? '#1B6B3A' : '#E2E8F0',
                                    background: selectedPlans.includes(plan.id) ? '#F0FDF4' : 'white',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', borderColor: selectedPlans.includes(plan.id) ? '#1B6B3A' : '#CBD5E1', background: selectedPlans.includes(plan.id) ? '#1B6B3A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedPlans.includes(plan.id) && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '1px' }}></div>}
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: '750', color: selectedPlans.includes(plan.id) ? '#064E3B' : '#475569' }}>{plan.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comparison Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedPlans.length === 0 ? (
                        <div style={{ height: '100%', minHeight: '400px', background: 'white', borderRadius: '32px', border: '2px dashed #DCF2E4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', marginBottom: '1.5rem' }}>
                                <Scale size={40} />
                            </div>
                            <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem' }}>Benchmarking Tool</h4>
                            <p style={{ color: '#64748B', fontWeight: '500', textAlign: 'center', maxWidth: '350px' }}>Select multiple financial strategies to compare projected performance and capital allocation.</p>
                        </div>
                    ) : isScenarioLoading ? (
                        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" color="#1B6B3A" size={40} /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scenarioData.length}, 1fr)`, gap: '1.5rem', height: '100%' }}>
                            {scenarioData.map(plan => (
                                <div key={plan.id} style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>{plan.name}</h4>
                                            <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '10px', background: '#F0FDF4', color: '#15803D', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                                {plan.status}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ padding: '1.25rem', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Allocated Capital</p>
                                            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#064E3B' }}>{formatCurrency(plan.total_budget || 0)}</h3>
                                        </div>
                                        
                                        <div>
                                            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '1rem' }}>Key Projections</p>
                                            {plan.metrics?.map((m, idx) => (
                                                <div key={idx} style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569', textTransform: 'capitalize' }}>{m.type}</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: m.type === 'revenue' ? '#15803D' : '#EF4444' }}>{formatCurrency(m.total || 0)}</span>
                                                    </div>
                                                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: '70%', height: '100%', background: m.type === 'revenue' ? '#15803D' : '#EF4444' }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!plan.metrics || plan.metrics.length === 0) && (
                                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', fontStyle: 'italic' }}>No comparative items found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default BusinessCompare;
