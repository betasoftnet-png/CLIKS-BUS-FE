/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
        }}>
            <div 
                style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: '420px',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    border: '1px solid #E2E8F0',
                    animation: 'fadeInUp 0.2s ease-out'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <button 
                        onClick={onCancel}
                        style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    Please Confirm
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '2rem', lineHeight: 1.5, fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={onCancel}
                        style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: '750', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', border: 'none', background: '#EF4444', color: 'white', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export const customConfirm = (message) => {
    return new Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const root = createRoot(div);

        const cleanup = () => {
            root.unmount();
            if (document.body.contains(div)) {
                document.body.removeChild(div);
            }
        };

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        root.render(
            <ConfirmDialog 
                message={message} 
                onConfirm={handleConfirm} 
                onCancel={handleCancel} 
            />
        );
    });
};
