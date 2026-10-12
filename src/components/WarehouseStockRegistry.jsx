import React from 'react';
import { Truck } from 'lucide-react';

export default function WarehouseStockRegistry({
    whStocks = [],
    colFilters = {},
    applyTableFilters = (item) => true,
    formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`,
    onSelectStock
}) {
    const filteredStocks = whStocks.filter(item => applyTableFilters(item, colFilters));

    return (
        <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Warehouse Stock Registry</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Stock ID</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Facility / Godown</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Location / Rack & Shelf</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Current Stock</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Damaged</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Expired</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>In Transit</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Stock Valuation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map((st) => (
                            <tr
                                key={st.wh_stock_id}
                                onClick={() => onSelectStock && onSelectStock(st)}
                                style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s ease' }}
                                className="hover:bg-slate-50/80"
                            >
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#0F172A' }}>{st.wh_stock_id}</td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '800', color: '#0F172A' }}>{st.product_name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{st.product_id}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    <span style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '10px', background: '#F1F5F9', color: '#334155', fontSize: '0.8rem', fontWeight: '800' }}>
                                        {st.warehouse_name}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    {(() => {
                                        const coords = [];
                                        if (st.rack_number && st.rack_number !== 'N/A' && st.rack_number !== 'In Transit') {
                                            coords.push(`Rack ${st.rack_number.replace(/^Rack\s*/i, '')}`);
                                        } else if (st.rack_number === 'In Transit') {
                                            coords.push('In Transit');
                                        }
                                        if (st.shelf_number && st.shelf_number !== 'N/A') {
                                            coords.push(`Shelf ${st.shelf_number.replace(/^Shelf\s*/i, '')}`);
                                        }
                                        if (st.bin_number && st.bin_number !== 'N/A') {
                                            coords.push(`Bin ${st.bin_number.replace(/^Bin\s*/i, '')}`);
                                        }
                                        const displayZone = st.zone && st.zone !== 'N/A' ? st.zone : (coords.length > 0 ? 'Zone A' : 'Storage Zone');

                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '700', color: '#475569' }}>{displayZone}</span>
                                                <span style={{ fontSize: '0.8rem', color: coords.length > 0 ? '#64748B' : '#94A3B8' }}>
                                                    {coords.length > 0 ? coords.join(' | ') : 'Open Floor / Unassigned'}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </td>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: '#1B6B3A' }}>{st.current_stock} pcs</td>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#EF4444' }}>{st.damaged_stock} pcs</td>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#F59E0B' }}>{st.expired_stock} pcs</td>
                                <td style={{ padding: '1.5rem 2rem' }}>
                                    {(st.in_transit_stock || st.in_transit) > 0 ? (
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                background: '#FEF3C7',
                                                color: '#B45309',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.85rem',
                                                fontWeight: '800'
                                            }}
                                        >
                                            <Truck size={14} style={{ color: '#D97706' }} />
                                            {st.in_transit_stock || st.in_transit} pcs
                                            {st.in_transit_out > 0 && !st.in_transit_in && (
                                                <span style={{ fontSize: '0.7rem', color: '#92400E', opacity: 0.85 }}>(Out)</span>
                                            )}
                                            {st.in_transit_in > 0 && !st.in_transit_out && (
                                                <span style={{ fontSize: '0.7rem', color: '#92400E', opacity: 0.85 }}>(In)</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94A3B8' }}>
                                            0 pcs
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem 2rem', fontWeight: '950', color: '#10B981' }}>{formatCurrency(st.warehouse_stock_value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
