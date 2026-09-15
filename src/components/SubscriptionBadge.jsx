import React from 'react';
import { calculateDaysRemaining } from '../utils/subscriptionUtils';

export { calculateDaysRemaining };

/**
 * SubscriptionBadge Component
 * Renders the circular badge with remaining days dynamically calculated.
 */
export const SubscriptionBadge = ({ plan, cardCount = 4 }) => {
    const daysRemaining = calculateDaysRemaining(plan?.expiryDate || plan?.valid_until);

    return (
        <div
            className="w-12 h-12 rounded-full bg-white border-2 border-amber-400 flex flex-col items-center justify-center shadow-sm"
            style={{
                width: cardCount >= 4 ? '36px' : (cardCount === 3 ? '42px' : '48px'),
                height: cardCount >= 4 ? '36px' : (cardCount === 3 ? '42px' : '48px'),
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                border: '2.5px solid #F59E0B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                flexShrink: 0,
                margin: '0 auto'
            }}
        >
            <span
                className="text-xs font-black text-[#172b59] leading-tight"
                style={{
                    fontSize: cardCount >= 4 ? '0.7rem' : (cardCount === 3 ? '0.78rem' : '0.85rem'),
                    fontWeight: '900',
                    color: '#172b59',
                    lineHeight: 1
                }}
            >
                {calculateDaysRemaining(plan?.expiryDate || plan?.valid_until)}
            </span>
            <span
                className="text-[9px] font-bold text-[#172b59] tracking-wider leading-none"
                style={{
                    fontSize: cardCount >= 4 ? '0.45rem' : (cardCount === 3 ? '0.5rem' : '0.58rem'),
                    fontWeight: '800',
                    color: '#172b59',
                    letterSpacing: '0.06em',
                    lineHeight: 1,
                    marginTop: '1px'
                }}
            >
                DAYS
            </span>
        </div>
    );
};

export default SubscriptionBadge;
