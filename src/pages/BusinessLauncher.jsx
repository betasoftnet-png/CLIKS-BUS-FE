import React from 'react';
import ProductLauncher from '../components/ProductLauncher';

const BusinessLauncher = () => {
    return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', backgroundColor: '#F8FAFC' }}>
            <div style={{ width: '100%', maxWidth: '360px', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <ProductLauncher onClose={() => {}} />
            </div>
        </div>
    );
};

export default BusinessLauncher;
