import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNotificationTimestamp } from '../hooks/useNotifications';

export const NotificationDropdown = ({
    isOpen = false,
    onClose,
    notifications = [],
    unreadCount = 0,
    onMarkAllRead,
    onNotificationClick
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to dismiss when clicking outside */}
                    <div 
                        onClick={onClose}
                        style={{ 
                            position: 'fixed', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            zIndex: 2008 
                        }}
                    />

                    {/* Notification Popup Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: '-10px',
                            width: '290px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0',
                            zIndex: 2009,
                            padding: '10px 12px',
                            fontFamily: "'Inter', sans-serif"
                        }}
                    >
                        {/* Header: Title + Green Badge + Mark all read button */}
                        <div 
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '8px', 
                                borderBottom: '1px solid #F1F5F9', 
                                paddingBottom: '6px' 
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span 
                                        style={{ 
                                            fontSize: '10px', 
                                            fontWeight: '800', 
                                            background: '#1B6B3A', 
                                            color: '#FFFFFF', 
                                            padding: '1px 6px', 
                                            borderRadius: '10px' 
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    type="button"
                                    onClick={onMarkAllRead}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#1B6B3A', 
                                        fontSize: '11px', 
                                        fontWeight: '750', 
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '6px', 
                                maxHeight: '260px', 
                                overflowY: 'auto', 
                                paddingRight: '2px' 
                            }}
                        >
                            {notifications.length === 0 ? (
                                <div 
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '16px 0', 
                                        color: '#94A3B8', 
                                        fontSize: '11.5px', 
                                        fontStyle: 'italic' 
                                    }}
                                >
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notification, index) => {
                                    const isRead = notification.read || notification.isRead;
                                    const itemKey = notification.id || `${notification.invoice_no || 'item'}_${notification.created_at || index}`;
                                    // Dynamically read actual created_at / timestamp property rather than static server string
                                    const rawTimestamp = notification.created_at || notification.createdAt || notification.timestamp;
                                    const formattedTime = formatNotificationTimestamp(rawTimestamp);

                                    return (
                                        <div 
                                            key={itemKey}
                                            onClick={() => onNotificationClick && onNotificationClick(notification)}
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                backgroundColor: isRead ? 'transparent' : '#F0FDF4',
                                                border: isRead ? '1px solid #F1F5F9' : '1px solid #DCF2E4',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '2px',
                                                transition: 'background-color 0.15s',
                                                cursor: onNotificationClick ? 'pointer' : 'default'
                                            }}
                                        >
                                            <span 
                                                style={{ 
                                                    fontSize: '11.5px', 
                                                    color: '#334155', 
                                                    fontWeight: isRead ? '500' : '650', 
                                                    lineHeight: '1.35' 
                                                }}
                                            >
                                                {notification.text || notification.message || notification.title}
                                            </span>
                                            <span 
                                                style={{ 
                                                    fontSize: '10px', 
                                                    color: '#94A3B8', 
                                                    fontWeight: '500' 
                                                }}
                                            >
                                                {formattedTime}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
