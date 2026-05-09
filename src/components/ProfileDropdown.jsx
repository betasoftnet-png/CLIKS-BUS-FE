import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User as UserIcon, Settings, LogOut, HelpCircle, User } from "lucide-react";
import { useAuth } from "../context";

export function ProfileDropdown({
    onAccount,
    onSettings,
    onFAQ,
    onLogout,
}) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const dropdownRef = useRef(null);
    
    const displayEmail = user?.email || "Guest";
    const displayName = user?.username || user?.name || "User";

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-block',
        },
        triggerButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '6px 14px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
        },
        dropdownMenu: {
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            zIndex: 1000,
            width: '260px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            padding: '8px',
        },
        header: {
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '8px',
        },
        signedInText: {
            fontSize: '11px',
            fontWeight: 700,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
        },
        emailText: {
            fontSize: '14px',
            fontWeight: 700,
            color: '#111827',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        menuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            textAlign: 'left',
            padding: '10px 12px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
        },
        logoutItem: {
            color: '#ef4444',
        }
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={styles.triggerButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#135029'
                }}>
                    <UserIcon size={14} />
                </div>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{displayName}</span>
                <ChevronDown
                    size={16}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        opacity: 0.8
                    }}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        style={styles.dropdownMenu}
                    >
                        <div style={styles.header}>
                            <p style={styles.signedInText}>Signed in as</p>
                            <p style={styles.emailText} title={displayEmail}>{displayEmail}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                                onClick={() => { onAccount?.(); setOpen(false); }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <User size={18} />
                                Account Profile
                            </button>
                            <button
                                onClick={() => { onSettings?.(); setOpen(false); }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <Settings size={18} />
                                System Settings
                            </button>
                            <button
                                onClick={() => { onFAQ?.(); setOpen(false); }}
                                style={styles.menuItem}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <HelpCircle size={18} />
                                Help & Support
                            </button>
                            
                            <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '8px 0' }} />
                            
                            <button
                                onClick={() => { onLogout?.(); setOpen(false); }}
                                style={{ ...styles.menuItem, ...styles.logoutItem }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={18} />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
