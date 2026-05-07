import React from 'react';
import { Utensils, Film, Car, Lightbulb, Wallet, ShoppingBag, Globe, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { budgetsService } from '../../services';

const ICON_MAP = {
    'Food & Drinks': Utensils,
    'Entertainment': Film,
    'Transport': Car,
    'Utilities': Lightbulb,
    'Housing': Wallet,
    'Shopping': ShoppingBag,
    'Other': MoreHorizontal
};

const COLOR_MAP = [
    '#1B6B3A', '#22C55E', '#60A5FA', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
];

const BudgetItem = (props) => {
    const { icon: Icon, label, current, total, color } = props;
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color
                    }}>
                        <Icon size={20} />
                    </div>
                    <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>{label}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    <span style={{ color: '#1E293B' }}>${current}</span>
                    <span style={{ color: '#94A3B8' }}> / ${total}</span>
                </div>
            </div>

            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#F0FDF4',
                borderRadius: '99px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '99px',
                    transition: 'width 0.5s ease-out'
                }} />
            </div>
        </div>
    );
};

const BudgetMixTile = () => {
    const { data: budgets = [], isLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: budgetsService.getBudgets
    });

    if (isLoading) return <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading budgets...</div>;
    if (budgets.length === 0) return <div style={{ color: '#64748B', fontSize: '0.9rem' }}>No budgets set. Create one to see overview.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
            }}>
                {budgets.slice(0, 4).map((b, i) => (
                    <BudgetItem
                        key={b.id}
                        icon={ICON_MAP[b.category] || Globe}
                        label={b.category}
                        current={Number(b.amount_spent || 0)}
                        total={Number(b.amount_limit || 0)}
                        color={COLOR_MAP[i % COLOR_MAP.length]}
                    />
                ))}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
                <a href="#view-all" style={{ fontSize: '0.85rem', color: '#1B6B3A', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View All Categories
                </a>
            </div>
        </div>
    );
};

export default BudgetMixTile;
