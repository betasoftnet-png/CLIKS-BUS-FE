import React from 'react';

export default function GoodsInwardTransitLog({ 
    inwards = [], 
    colFilters = {}, 
    applyTableFilters = (item) => true, 
    user = {} 
}) {
    const filteredInwards = inwards.filter(item => applyTableFilters(item, colFilters));

    return (
        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Goods Inwards Audit Trail</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Inward ID</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Purchase bill ref</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Received Qty</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Received By</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Date Received</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Destination Warehouse</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInwards.map((inw) => (
                            <tr key={inw.inward_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td style={{ padding: '1rem', fontWeight: '750' }}>{inw.inward_id}</td>
                                <td style={{ padding: '1rem', color: '#475569', fontWeight: '700' }}>{inw.purchase_id}</td>
                                <td style={{ padding: '1rem', fontWeight: '700' }}>{inw.product_name}</td>
                                <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>{inw.received_quantity} pcs</td>
                                <td style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>
                                    {inw.received_by || inw.staff_name || user?.name || user?.username || 'Authorized Staff'}
                                </td>
                                <td style={{ padding: '1rem', color: '#64748B' }}>{inw.inward_date}</td>
                                <td style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>
                                    {inw.warehouse_name || inw.destination_warehouse?.name || inw.destination_warehouse_name || 'Main Godown'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
