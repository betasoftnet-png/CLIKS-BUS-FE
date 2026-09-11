import { useState, useEffect, useCallback } from 'react';
import { caService } from '../services/caService';

/**
 * Robust notification deduplication helper by ID or composite key (invoice_id + action_type / content + time window)
 */
export const deduplicateNotifications = (newItems = [], existingItems = []) => {
    const combined = [...newItems, ...existingItems];
    const seen = new Set();
    const seenContent = new Set();

    return combined.filter((item) => {
        if (!item) return false;

        // 1. Primary check by unique ID
        const id = item.id != null ? String(item.id) : null;
        if (id && seen.has(id)) return false;
        if (id) seen.add(id);

        // 2. Secondary check by composite key (invoice_id + action_type / message content)
        const invRef = item.invoice_no || item.invoice_number || item.purchase_number || item.relatedTaskId || '';
        const action = item.action_type || item.type || '';
        const rawMsg = (item.text || item.message || item.title || '').trim().toLowerCase();

        // Extract transaction / invoice reference (e.g. #INV-PO-3485)
        const invoiceMatch = rawMsg.match(/#([a-z0-9\-_]+)/i);
        const invoiceId = invRef || (invoiceMatch ? invoiceMatch[1].toLowerCase() : '');

        let timeSlot = '';
        const dateVal = item.created_at || item.createdAt || item.timestamp;
        if (dateVal) {
            const d = new Date(dateVal);
            if (!isNaN(d.getTime())) {
                // Group duplicates within a 15-minute window for identical repeated events
                const slot = Math.floor(d.getTime() / (15 * 60 * 1000));
                timeSlot = `_${slot}`;
            }
        }

        const contentKey = invoiceId 
            ? `inv_${invoiceId}_${action}_${timeSlot}`
            : `msg_${rawMsg}_${timeSlot}`;

        if (seenContent.has(contentKey)) {
            return false;
        }
        seenContent.add(contentKey);
        return true;
    });
};

/**
 * Converts incoming UTC timestamp (created_at / timestamp) to localized system time / relative format
 */
export const formatNotificationTimestamp = (dateInput) => {
    if (!dateInput) return 'Recently';
    try {
        let date;
        if (typeof dateInput === 'string') {
            let str = dateInput.trim();
            // If SQLite format 'YYYY-MM-DD HH:MM:SS' without timezone, append 'Z' to treat as UTC
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
                str = str.replace(' ', 'T') + 'Z';
            }
            date = new Date(str);
        } else {
            date = new Date(dateInput);
        }

        if (isNaN(date.getTime())) return 'Recently';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Localized 12-hour time string (e.g., "02:23 PM")
        const localTimeStr = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        if (diffSec < 45) return 'Just now';
        if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`;
        if (diffHours < 24) return `${diffHours}h ago · ${localTimeStr}`;
        if (diffDays === 1) return `Yesterday · ${localTimeStr}`;
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${localTimeStr}`;
    } catch (err) {
        return 'Recently';
    }
};

export const useNotifications = (pollIntervalMs = 30000) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await caService.getNotifications();
            if (Array.isArray(data)) {
                setNotifications(prev => {
                    // Deduplicate new fetched list with any un-synced previous state
                    return deduplicateNotifications(data, []);
                });
            }
        } catch (err) {
            console.warn('[useNotifications fetch error]', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        fetchNotifications();

        const interval = setInterval(() => {
            if (isMounted) fetchNotifications();
        }, pollIntervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [fetchNotifications, pollIntervalMs]);

    const markAllRead = useCallback(async () => {
        try {
            await caService.markAllNotificationsRead().catch(() => {});
        } catch (e) {}
        setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await caService.markNotificationRead(id).catch(() => {});
        } catch (e) {}
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n));
    }, []);

    const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

    return {
        notifications,
        unreadCount,
        isLoading,
        markAllRead,
        markAsRead,
        refresh: fetchNotifications,
        setNotifications
    };
};

export default useNotifications;
