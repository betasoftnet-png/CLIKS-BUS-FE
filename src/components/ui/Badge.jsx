import React from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

const Badge = ({ variant = 'default', children, className = '', style = {} }) => {
    const variants = {
        default: {
            bg: '#F0FDF4',
            color: '#475569',
            icon: null
        },
        primary: {
            bg: '#DBEAFE',
            color: '#1E40AF',
            icon: null
        },
        success: {
            bg: '#DCFCE7',
            color: '#166534',
            icon: Check
        },
        error: {
            bg: '#FEE2E2',
            color: '#991B1B',
            icon: X
        },
        warning: {
            bg: '#FEF3C7',
            color: '#92400E',
            icon: AlertTriangle
        },
        info: {
            bg: '#CFFAFE', // Light cyan/sky
            color: '#155E75',
            icon: Info
        }
    };

    const config = variants[variant] || variants.default;
    const Icon = config.icon;

    const badgeStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.color,
        lineHeight: '1',
        whiteSpace: 'nowrap',
        ...style
    };

    return (
        <span className={`badge ${className}`} style={badgeStyle}>
            {Icon && <Icon size={14} strokeWidth={2.5} />}
            {children}
        </span>
    );
};

export default Badge;
