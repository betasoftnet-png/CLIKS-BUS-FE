import React from 'react';
import { CalcPopover } from '../components/common/CalcPopover';

const BusinessCalculator = () => {
    return (
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', backgroundColor: '#F8FAFC' }}>
            <div style={{ width: '100%', maxWidth: '360px', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <CalcPopover isInline={true} />
            </div>
        </div>
    );
};

export default BusinessCalculator;
