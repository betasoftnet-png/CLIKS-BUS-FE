import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User as UserIcon, LogOut, User, Globe, Coins, Flag, ArrowLeft, Search } from "lucide-react";
import { useAuth } from "../context";

export function ProfileDropdown({
    onAccount,
    onLogout,
}) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const dropdownRef = useRef(null);
    
    // Country Selector State
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("India");

    const countries = [
        { name: "India", flag: "🇮🇳" },
        { name: "United States", flag: "🇺🇸" },
        { name: "United Kingdom", flag: "🇬🇧" },
        { name: "United Arab Emirates", flag: "🇦🇪" },
        { name: "Singapore", flag: "🇸🇬" },
        { name: "Germany", flag: "🇩🇪" },
        { name: "Australia", flag: "🇦🇺" },
        { name: "Canada", flag: "🇨🇦" },
        { name: "Saudi Arabia", flag: "🇸🇦" },
        { name: "Japan", flag: "🇯🇵" },
        { name: "France", flag: "🇫🇷" },
        { name: "Sri Lanka", flag: "🇱🇰" },
        { name: "Bangladesh", flag: "🇧🇩" },
        { name: "Nepal", flag: "🇳🇵" },
    ];

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );

    const displayEmail = user?.email || "Guest";
    const displayName = user?.username || user?.name || "User";

    // Close on click outside & reset states
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
                setIsCountrySelectorOpen(false);
                setCountrySearchQuery("");
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
        },
        submenuHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 10px',
            borderBottom: '1px solid #f3f4f6',
            marginBottom: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 800,
            color: '#111827',
            background: 'transparent',
            border: 'none',
            width: '100%',
            textAlign: 'left',
        },
        searchInputWrapper: {
            position: 'relative',
            margin: '0 8px 8px 8px',
        },
        searchInput: {
            width: '100%',
            padding: '8px 12px 8px 32px',
            fontSize: '13px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            color: '#1f2937',
            fontWeight: '600',
        },
        searchIcon: {
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
        },
        countryList: {
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '0 4px',
        },
        countryItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 650,
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
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
                <span style={{ 
                    textTransform: 'none', 
                    letterSpacing: '0px',
                    fontSize: '12px',
                    fontWeight: '500',
                    maxWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>{displayName}</span>
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
                        {isCountrySelectorOpen ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button 
                                    onClick={() => { setIsCountrySelectorOpen(false); setCountrySearchQuery(""); }}
                                    style={styles.submenuHeader}
                                >
                                    <ArrowLeft size={16} />
                                    <span>Select Country</span>
                                </button>
                                
                                <div style={styles.searchInputWrapper}>
                                    <Search size={14} style={styles.searchIcon} />
                                    <input 
                                        type="text"
                                        placeholder="Search countries..."
                                        value={countrySearchQuery}
                                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                                        style={styles.searchInput}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>

                                <div style={styles.countryList}>
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((c) => (
                                            <button
                                                key={c.name}
                                                onClick={() => {
                                                    setSelectedCountry(c.name);
                                                    setIsCountrySelectorOpen(false);
                                                    setCountrySearchQuery("");
                                                }}
                                                style={styles.countryItem}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '16px' }}>{c.flag}</span>
                                                    <span>{c.name}</span>
                                                </div>
                                                {selectedCountry === c.name && (
                                                    <span style={{ color: '#10B981', fontSize: '11px', fontWeight: '800' }}>✓</span>
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                                            No countries found
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
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
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Globe size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Language</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>English</span>
                                        </div>
                                    </button>

                                    <button
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Coins size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Currency</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500' }}>INR (₹)</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsCountrySelectorOpen(true)}
                                        style={styles.menuItem}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Flag size={18} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <span>Country</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '550' }}>{selectedCountry}</span>
                                        </div>
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
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
