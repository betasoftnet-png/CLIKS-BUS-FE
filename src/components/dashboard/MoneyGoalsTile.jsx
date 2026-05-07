import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { financialPlanService } from '../../services';
import { Plane, Footprints, Plus, Target, Globe } from 'lucide-react';

const ICON_MAP = {
    'Travel': Plane,
    'Sneakers': Footprints,
    'General': Target
};

const GoalItem = (props) => {
    const { title, current, total, percent, color, icon: Icon } = props;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={`${percent}, 100`}
                    />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: 700, color: color }}>
                    {percent}%
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {title} <Icon size={14} className="text-muted-foreground" />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>${current}</span> of ${total}
                </div>
            </div>
        </div>
    );
};

const MoneyGoalsTile = () => {
    // 1. Fetch plans to get a planId
    const { data: plansRes, isLoading: loadingPlans } = useQuery({
        queryKey: ['financial-plans'],
        queryFn: financialPlanService.getPlans
    });

    const activePlanId = plansRes?.data?.[0]?.id;

    // 2. Fetch goals for the active plan
    const { data: goalsRes, isLoading: loadingGoals } = useQuery({
        queryKey: ['plan-goals', activePlanId],
        queryFn: () => financialPlanService.getPlanGoals(activePlanId),
        enabled: !!activePlanId
    });

    if (loadingPlans || loadingGoals) return <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading goals...</div>;

    const goals = goalsRes?.data || [];

    if (goals.length === 0) {
        return (
            <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>No goals found.</div>
                <button style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '99px',
                    background: 'transparent',
                    color: '#1B6B3A',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}>
                    <Plus size={16} /> Add Goal
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {goals.slice(0, 3).map(goal => {
                    const percent = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
                    const Icon = ICON_MAP[goal.title] || ICON_MAP[goal.name] || Globe;
                    return (
                        <GoalItem
                            key={goal.id}
                            title={goal.title || goal.name}
                            current={goal.current_amount}
                            total={goal.target_amount}
                            percent={percent}
                            color="#1B6B3A"
                            icon={Icon}
                        />
                    );
                })}
            </div>

            <button style={{
                marginTop: 'auto',
                width: '100%',
                padding: '0.75rem',
                border: '2px dashed #CBD5E1',
                borderRadius: '99px',
                background: 'transparent',
                color: '#1B6B3A',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
            }}>
                <Plus size={16} /> Add New Goal
            </button>
        </div>
    );
};

export default MoneyGoalsTile;
