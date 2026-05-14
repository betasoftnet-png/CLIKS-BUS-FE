import React, { useState, useEffect } from 'react';
import { Megaphone, X, AlertOctagon, Info, AlertTriangle } from 'lucide-react';
import { adminService } from '../services/adminService';

const BroadcastBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [visible, setVisible] = useState(true);
    const [sessionDismissed, setSessionDismissed] = useState(false);

    useEffect(() => {
        const fetchActiveAlert = async () => {
            try {
                const res = await adminService.getActiveAnnouncement();
                if (res && res.data) {
                    setAnnouncement(res.data);
                    
                    // Check session storage if user dismissed THIS particular announcement today
                    const dismissedId = sessionStorage.getItem(`cliks_dismissed_alert_${res.data.created_at}`);
                    if (dismissedId) {
                        setSessionDismissed(true);
                    }
                }
            } catch (err) {
                // Silent fail for seamless UX
                console.debug("Broadcast polling skipped.", err);
            }
        };

        fetchActiveAlert();
        
        // Poll every 5 minutes for real-time urgent broadcasts!
        const interval = setInterval(fetchActiveAlert, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!announcement || !visible || sessionDismissed) return null;

    const handleDismiss = () => {
        setVisible(false);
        // Save dismiss to session storage so user doesn't get re-prompted during this session
        sessionStorage.setItem(`cliks_dismissed_alert_${announcement.created_at}`, 'true');
    };

    // Style configs based on Alert tier
    const styles = {
        INFO: {
            bg: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
            icon: <Info size={20} />,
            border: '#0369A1'
        },
        WARNING: {
            bg: 'linear-gradient(90deg, #EA580C 0%, #C2410C 100%)',
            icon: <AlertTriangle size={20} />,
            border: '#C2410C'
        },
        CRITICAL: {
            bg: 'linear-gradient(90deg, #DC2626 0%, #991B1B 100%)',
            icon: <AlertOctagon size={20} className="animate-pulse" />,
            border: '#991B1B'
        }
    };

    const tier = announcement.banner_type || 'INFO';
    const config = styles[tier] || styles.INFO;

    return (
        <div style={{ 
            background: config.bg, 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            position: 'relative', 
            zIndex: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            animation: 'slideDown 0.4s ease-out'
        }}>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .alert-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {config.icon}
                <strong style={{ fontWeight: 900, letterSpacing: '0.3px', fontSize: '0.85rem', textTransform: 'uppercase' }}>{announcement.title}:</strong>
            </div>
            
            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.95 }}>
                {announcement.message}
            </span>

            {/* Persistent Banner cannot be fully blocked easily but user can dismiss info/warning */}
            <button 
                onClick={handleDismiss}
                className="alert-close-btn"
                style={{ 
                    position: 'absolute', 
                    right: '1.5rem', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'white', 
                    cursor: 'pointer', 
                    padding: '6px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default BroadcastBanner;
