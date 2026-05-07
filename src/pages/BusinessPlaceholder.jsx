import React from 'react';
import { useLocation } from 'react-router-dom';

const BusinessPlaceholder = ({ title }) => {
    const location = useLocation();
    const pageTitle = title || location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1);

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748B' }}>
            <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '24px', 
                background: '#F0FDF4', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#1B6B3A',
                marginBottom: '1.5rem'
            }}>
                <span style={{ fontSize: '2rem' }}>🏢</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#064E3B', marginBottom: '0.5rem' }}>{pageTitle}</h1>
            <p style={{ fontSize: '1.1rem', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6' }}>
                This is the dedicated business view for <strong>{pageTitle}</strong>. 
                Full feature integration is coming soon.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ padding: '0.75rem 1.5rem', background: '#F1F5F9', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
                    Path: {location.pathname}
                </div>
            </div>
        </div>
    );
};

export default BusinessPlaceholder;
