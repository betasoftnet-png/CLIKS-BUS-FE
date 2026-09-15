import React from 'react';
import SubscriptionBadge, { calculateDaysRemaining } from './SubscriptionBadge';

export { calculateDaysRemaining, SubscriptionBadge };

/**
 * SubscriptionSidebarCard Component
 * Represents a single subscription card or multi-card layout within the sidebar.
 */
export const SubscriptionSidebarCard = ({ plan, cardCount = 4 }) => {
    if (!plan) return null;

    return (
        <div
            key={plan.id}
            className="bg-white/5 rounded-xl p-2 flex flex-col items-center text-center"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: cardCount >= 4 ? '0.45rem 0.2rem' : (cardCount === 3 ? '0.5rem 0.3rem' : '0.65rem 0.5rem'),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                minWidth: 0,
                width: cardCount === 1 ? '100%' : undefined
            }}
        >
            {/* Top Circle Badge */}
            <SubscriptionBadge plan={plan} cardCount={cardCount} />

            {/* Middle Label (White Text) */}
            <div
                className="text-[11px] font-bold text-white uppercase mt-1 tracking-tight"
                style={{
                    fontSize: cardCount >= 4 ? '0.55rem' : (cardCount === 3 ? '0.65rem' : '0.75rem'),
                    fontWeight: '800',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginTop: '0.35rem',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                }}
            >
                {plan.middleLabel}
            </div>

            {/* Bottom Tier Text (Yellow / Gold Highlight) */}
            <div
                className="text-[9px] font-semibold text-amber-300 uppercase leading-tight"
                style={{
                    fontSize: cardCount >= 4 ? '0.48rem' : (cardCount === 3 ? '0.56rem' : '0.64rem'),
                    fontWeight: '700',
                    color: '#FCD34D',
                    textTransform: 'uppercase',
                    lineHeight: 1.15,
                    marginTop: '0.25rem',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                }}
            >
                <div>{plan.tierText}</div>
                {plan.subtext && (
                    <div
                        style={{
                            fontSize: cardCount >= 4 ? '0.42rem' : (cardCount === 3 ? '0.48rem' : '0.54rem'),
                            opacity: 0.9,
                            marginTop: '1px',
                            textTransform: plan.id === 'products' ? 'none' : 'uppercase',
                            lineHeight: 1.1
                        }}
                    >
                        {plan.subtext}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionSidebarCard;
