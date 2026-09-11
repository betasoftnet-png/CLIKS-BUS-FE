import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const BNX_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@bnxmail\.com$/;

export const validateBnxEmail = (email) => {
    if (!email || !BNX_EMAIL_REGEX.test(email.trim())) {
        return "Only official @bnxmail.com email addresses are allowed";
    }
    return null;
};

export default function WarehouseRegistryModal({
    isOpen,
    onClose,
    onSubmit,
    newWarehouse,
    setNewWarehouse
}) {
    const [emailError, setEmailError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validateBnxEmail(newWarehouse.email);
        if (err) {
            setEmailError(err);
            return;
        }
        setEmailError('');
        onSubmit(e);
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setNewWarehouse({ ...newWarehouse, email: val });
        if (emailError && BNX_EMAIL_REGEX.test(val.trim())) {
            setEmailError('');
        }
    };

    const handleEmailBlur = (e) => {
        const err = validateBnxEmail(e.target.value);
        setEmailError(err || '');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>
                        Register New Warehouse Facility
                    </h3>
                    <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse Name</label>
                            <input 
                                required 
                                type="text" 
                                value={newWarehouse.warehouse_name} 
                                onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_name: e.target.value })} 
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                placeholder="Delhi Godown" 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse Code</label>
                            <input 
                                required 
                                type="text" 
                                value={newWarehouse.warehouse_code} 
                                onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_code: e.target.value })} 
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                placeholder="WH-DEL-04" 
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Facility Type</label>
                        <select 
                            value={newWarehouse.warehouse_type} 
                            onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_type: e.target.value })} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                        >
                            <option value="godown">Godown (Bulk Storage)</option>
                            <option value="store">Store Outlet (Retail)</option>
                            <option value="DC">Distribution Center (logistics)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Address</label>
                        <input 
                            required 
                            type="text" 
                            value={newWarehouse.address} 
                            onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                            placeholder="Plot No 40..." 
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Pincode</label>
                            <input
                                required
                                type="text"
                                value={newWarehouse.pincode}
                                onChange={(e) => {
                                    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    let autoCity = newWarehouse.city;
                                    let autoState = newWarehouse.state;
                                    if (pin === '602001' || pin === '602002') { autoCity = 'Tiruvallur'; autoState = 'Tamil Nadu'; }
                                    else if (pin.startsWith('600')) { autoCity = 'Chennai'; autoState = 'Tamil Nadu'; }
                                    else if (pin.startsWith('110')) { autoCity = 'Delhi'; autoState = 'Delhi'; }
                                    else if (pin.startsWith('560')) { autoCity = 'Bengaluru'; autoState = 'Karnataka'; }
                                    else if (pin.startsWith('400')) { autoCity = 'Mumbai'; autoState = 'Maharashtra'; }
                                    setNewWarehouse({ ...newWarehouse, pincode: pin, city: autoCity, state: autoState });
                                }}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                placeholder="e.g. 602001"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>City</label>
                            <input required type="text" value={newWarehouse.city} onChange={(e) => setNewWarehouse({ ...newWarehouse, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Tiruvallur" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>State</label>
                            <input required type="text" value={newWarehouse.state} onChange={(e) => setNewWarehouse({ ...newWarehouse, state: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Tamil Nadu" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Manager Name</label>
                            <input required type="text" value={newWarehouse.contact_person} onChange={(e) => setNewWarehouse({ ...newWarehouse, contact_person: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Ashwin" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Mobile (10 Digits)</label>
                            <input
                                required
                                type="tel"
                                value={newWarehouse.phone_number}
                                onChange={(e) => setNewWarehouse({ ...newWarehouse, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                placeholder="9876543210"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Email Address</label>
                            <input
                                required
                                type="email"
                                value={newWarehouse.email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.8rem', 
                                    borderRadius: '12px', 
                                    border: emailError ? '1.5px solid #EF4444' : '1px solid #E2E8F0', 
                                    outline: 'none',
                                    background: emailError ? '#FEF2F2' : 'white'
                                }}
                                placeholder="e.g. manager@bnxmail.com"
                            />
                        </div>
                    </div>

                    {emailError && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={15} />
                            <span>{emailError}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)', marginTop: '0.5rem' }}
                    >
                        Register Warehouse Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
