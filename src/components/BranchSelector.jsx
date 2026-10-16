import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, Check, Lock, Building2, Plus, Sparkles, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranch } from '../context';

export const BranchSelector = () => {
    const navigate = useNavigate();
    const {
        branches,
        selectedBranchId,
        selectedBranch,
        switchBranch,
        isLocked,
        isSubId,
        activeBranchName
    } = useBranch();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // If Sub-ID showroom manager (strictly locked to assigned branch)
    if (isLocked) {
        return (
            <div 
                title={`Showroom Manager: Scoped exclusively to ${activeBranchName}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '999px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
            >
                <Store size={14} color="#34D399" />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeBranchName}
                </span>
                <span 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2px', 
                        fontSize: '10px', 
                        backgroundColor: 'rgba(52, 211, 153, 0.2)', 
                        color: '#6EE7B7', 
                        padding: '2px 6px', 
                        borderRadius: '6px',
                        fontWeight: '800'
                    }}
                >
                    <Lock size={10} /> Branch
                </span>
            </div>
        );
    }

    // Business Owner view (Global Branch Switcher)
    const isAll = selectedBranchId === 'all' || !selectedBranchId;

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    backgroundColor: isAll ? 'rgba(255, 255, 255, 0.12)' : 'rgba(16, 185, 129, 0.22)',
                    backdropFilter: 'blur(10px)',
                    border: isAll ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(52, 211, 153, 0.45)',
                    borderRadius: '999px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isAll ? 'rgba(255, 255, 255, 0.2)' : 'rgba(16, 185, 129, 0.32)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isAll ? 'rgba(255, 255, 255, 0.12)' : 'rgba(16, 185, 129, 0.22)';
                }}
            >
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isAll ? '#38BDF8' : '#34D399',
                    boxShadow: isAll ? '0 0 6px #38BDF8' : '0 0 6px #34D399'
                }} />
                
                <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isAll ? 'All Showrooms (Consolidated)' : activeBranchName}
                </span>

                <ChevronDown 
                    size={14} 
                    style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s ease',
                        opacity: 0.8
                    }} 
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            width: '280px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0',
                            padding: '8px',
                            zIndex: 99999,
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{
                            padding: '6px 12px 8px 12px',
                            fontSize: '10px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px',
                            color: '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #F1F5F9'
                        }}>
                            <span>Branch / Showroom Scope</span>
                            <span style={{ color: '#059669', fontSize: '10px' }}>
                                {branches.length} Registered
                            </span>
                        </div>

                        {/* Option 1: Consolidated View (All Showrooms) */}
                        <div
                            onClick={() => {
                                switchBranch('all');
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                marginTop: '4px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                backgroundColor: isAll ? '#F0FDF4' : 'transparent',
                                border: isAll ? '1px solid #BBF7D0' : '1px solid transparent',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (!isAll) e.currentTarget.style.backgroundColor = '#F8FAFC';
                            }}
                            onMouseLeave={(e) => {
                                if (!isAll) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: isAll ? '#DCFCE7' : '#F1F5F9',
                                    color: isAll ? '#16A34A' : '#64748B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Building2 size={16} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: isAll ? '#166534' : '#1E293B' }}>
                                        All Showrooms
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                                        Company-wide consolidated data
                                    </div>
                                </div>
                            </div>
                            {isAll && <Check size={16} color="#16A34A" strokeWidth={3} />}
                        </div>

                        {/* Individual Branches Section */}
                        {branches.length > 0 && (
                            <div style={{
                                margin: '8px 0 4px 0',
                                padding: '6px 12px 2px 12px',
                                fontSize: '10px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: '#94A3B8'
                            }}>
                                Individual Showrooms
                            </div>
                        )}

                        {branches.map((b) => {
                            const isCurrent = String(selectedBranchId) === String(b.id);
                            return (
                                <div
                                    key={b.id}
                                    onClick={() => {
                                        switchBranch(b.id);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '9px 12px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        backgroundColor: isCurrent ? '#F0FDF4' : 'transparent',
                                        border: isCurrent ? '1px solid #BBF7D0' : '1px solid transparent',
                                        transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isCurrent) e.currentTarget.style.backgroundColor = '#F8FAFC';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            backgroundColor: isCurrent ? '#DCFCE7' : '#F8FAFC',
                                            border: '1px solid #E2E8F0',
                                            color: isCurrent ? '#16A34A' : '#475569',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Store size={16} />
                                        </div>
                                        <div style={{ textAlign: 'left', minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: isCurrent ? '#166534' : '#1E293B',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {b.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                {b.code} {b.city ? `• ${b.city}` : ''} {b.is_main_branch ? '• Main HQ' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    {isCurrent && <Check size={16} color="#16A34A" strokeWidth={3} />}
                                </div>
                            );
                        })}

                        {/* Footer Link to Showrooms Configuration */}
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/inventory/branches');
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '8px',
                                    backgroundColor: '#F8FAFC',
                                    border: '1px dashed #CBD5E1',
                                    borderRadius: '10px',
                                    color: '#475569',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                                    e.currentTarget.style.color = '#2563EB';
                                    e.currentTarget.style.borderColor = '#93C5FD';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                                    e.currentTarget.style.color = '#475569';
                                    e.currentTarget.style.borderColor = '#CBD5E1';
                                }}
                            >
                                <Plus size={14} />
                                <span>Manage Showrooms & Stock</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BranchSelector;
