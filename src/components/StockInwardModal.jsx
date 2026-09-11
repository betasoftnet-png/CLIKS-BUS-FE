import React from 'react';
import { X } from 'lucide-react';

export default function StockInwardModal({
    isOpen,
    onClose,
    onSubmit,
    newInward,
    setNewInward,
    inwardProductsList = [],
    warehouses = [],
    user = {}
}) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Goods Inward Receipt</h3>
                    <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Purchase Bill / Ref ID</label>
                        <input 
                            required 
                            type="text" 
                            value={newInward.purchase_id} 
                            onChange={(e) => setNewInward({ ...newInward, purchase_id: e.target.value })} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} 
                            placeholder="e.g. BILL-90112" 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Product Name</label>
                        <select 
                            value={newInward.stock_id} 
                            onChange={(e) => setNewInward({ ...newInward, stock_id: e.target.value })} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                        >
                            {inwardProductsList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.sku}) — Current: {s.quantity} pcs</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Received Quantity</label>
                        <input 
                            required 
                            type="number" 
                            min="1"
                            value={newInward.received_quantity} 
                            onChange={(e) => setNewInward({ ...newInward, received_quantity: e.target.value })} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Received By / Staff</label>
                        <input
                            type="text"
                            value={newInward.received_by || newInward.staff_name || ''}
                            onChange={(e) => setNewInward({ 
                                ...newInward, 
                                received_by: e.target.value, 
                                staff_name: e.target.value 
                            })}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }}
                            placeholder={user?.name || user?.username || "Staff Member Name"}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Receiving Destination Warehouse</label>
                        <select 
                            value={newInward.destination_warehouse_id || newInward.warehouse_id} 
                            onChange={(e) => {
                                const selWh = warehouses.find(w => String(w.id) === String(e.target.value));
                                setNewInward({ 
                                    ...newInward, 
                                    warehouse_id: e.target.value,
                                    destination_warehouse_id: e.target.value,
                                    warehouse_name: selWh?.warehouse_name || 'Main Godown'
                                });
                            }} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                        >
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)', marginTop: '0.5rem' }}
                    >
                        Log Good Inward Receipt
                    </button>
                </form>
            </div>
        </div>
    );
}
