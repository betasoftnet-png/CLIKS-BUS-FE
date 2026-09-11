import React from 'react';

export const NotificationBell = ({ 
    unreadCount = 0, 
    isOpen = false, 
    onClick, 
    className = '',
    style = {} 
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            style={{
                position: 'relative',
                background: isOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                ...style
            }}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={isOpen}
        >
            <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            
            {/* Unread Red Badge */}
            {unreadCount > 0 && (
                <div 
                    style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: '900',
                        border: '2px solid #135029'
                    }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </button>
    );
};

export default NotificationBell;
