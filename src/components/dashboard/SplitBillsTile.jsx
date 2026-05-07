import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { splitExpenseService } from '../../services';
import { Share2, Film, Utensils } from 'lucide-react';

const ICON_MAP = {
    'Pizza Night': Utensils,
    'Cinema IMAX': Film,
    'General': Share2
};

const SplitBillsTile = () => {
    const { data: splits = [], isLoading } = useQuery({
        queryKey: ['splits'],
        queryFn: splitExpenseService.getSplits,
        select: (res) => res.data
    });

    if (isLoading) return <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading split bills...</div>;

    if (splits.length === 0) {
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>No split bills found</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {splits.slice(0, 3).map(split => {
                const Icon = ICON_MAP[split.title] || Share2;
                return (
                    <div key={split.id} style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #F0FDF4' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A', marginRight: '1rem' }}>
                            <Icon size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>{split.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                Total: <span style={{ fontWeight: 600 }}>${split.total_amount}</span>
                            </div>
                        </div>
                        <div style={{ fontWeight: 700, color: (split.user_share || 0) > 0 ? '#EF4444' : '#10B981' }}>
                            {(split.user_share || 0) > 0 ? `-$${split.user_share}` : `+$${Math.abs(split.user_share || 0)}`}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SplitBillsTile;
