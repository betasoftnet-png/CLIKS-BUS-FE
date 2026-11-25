import React, { useMemo } from 'react';
import { X, Clock, ArrowDownLeft, ArrowUpRight, Repeat, AlertOctagon, Archive } from 'lucide-react';

export default function StockMovementHistory({
    selectedStock,
    onClose,
    rawStockHistory = [],
    reportsData = {},
    formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`
}) {
    const currentStockQty = parseFloat(selectedStock?.current_stock) || 0;
    const damagedStockQty = parseFloat(selectedStock?.damaged_stock) || 0;
    const inTransitQty = parseFloat(selectedStock?.in_transit_stock) || 0;
    const nowStr = new Date().toISOString().split('T')[0];

    // Compute dynamic running balances and events
    const timelineEvents = useMemo(() => {
        if (!selectedStock) return [];
        const txList = Array.isArray(rawStockHistory) ? rawStockHistory : [];

        // Match any recent inwards for this stock/product
        const matchedInwards = (reportsData?.inwards || []).filter(inw => 
            String(inw.stock_id) === String(selectedStock.id) ||
            (inw.product_name && inw.product_name.toLowerCase() === (selectedStock.product_name || '').toLowerCase())
        );

        // Match any recent transfers for this stock
        const matchedTransfers = (reportsData?.transfers || []).filter(trf =>
            String(trf.stock_id) === String(selectedStock.id) ||
            (trf.product_name && trf.product_name.toLowerCase() === (selectedStock.product_name || '').toLowerCase())
        );

        if (txList.length > 0 || matchedInwards.length > 0 || matchedTransfers.length > 0) {
            const rawEvents = [];

            txList.forEach(t => {
                const isPositive = t.type === 'in' || t.type === 'IN';
                const qtyVal = parseFloat(t.quantity) || 0;
                rawEvents.push({
                    date: t.date ? t.date.split('T')[0] : (t.created_at ? t.created_at.split('T')[0] : nowStr),
                    rawTime: new Date(t.created_at || t.date || Date.now()).getTime(),
                    event: isPositive 
                        ? (t.purchase_bill_ref ? `Goods Inward Receipt (${t.purchase_bill_ref})` : (t.notes || 'Goods Inward Receipt')) 
                        : (t.notes || 'Sales Dispatch'),
                    type: isPositive ? 'inward' : 'dispatch',
                    delta: isPositive ? qtyVal : -qtyVal,
                    qtyFormatted: isPositive ? `+${qtyVal} pcs` : `-${qtyVal} pcs`,
                    color: isPositive ? '#15803d' : '#DC2626',
                    ref: t.purchase_bill_ref || (t.received_by ? `Handled by: ${t.received_by}` : (t.notes || null))
                });
            });

            // Match inwards from reportsData not already present in txList
            matchedInwards.forEach(inw => {
                const inwRef = inw.purchase_bill_ref || inw.purchase_id || inw.inward_id;
                const alreadyInTx = txList.some(t => 
                    (t.id && inw.id && String(t.id) === String(inw.id)) ||
                    (inwRef && t.purchase_bill_ref && t.purchase_bill_ref === inwRef)
                );
                if (alreadyInTx) return;

                const inwQty = parseFloat(inw.quantity || inw.received_quantity) || 0;
                rawEvents.push({
                    date: inw.date ? inw.date.split('T')[0] : (inw.created_at ? inw.created_at.split('T')[0] : nowStr),
                    rawTime: new Date(inw.created_at || inw.date || Date.now()).getTime(),
                    event: inwRef ? `Goods Inward Receipt (${inwRef})` : 'Goods Inward Receipt',
                    type: 'inward',
                    delta: inwQty,
                    qtyFormatted: `+${inwQty} pcs`,
                    color: '#15803d',
                    ref: inw.received_by ? `Received by: ${inw.received_by}` : (inwRef ? `Ref: ${inwRef}` : null)
                });
            });

            matchedTransfers.forEach(trf => {
                const trfQty = parseFloat(trf.quantity || trf.transfer_quantity) || 0;
                rawEvents.push({
                    date: trf.created_at ? trf.created_at.split('T')[0] : nowStr,
                    rawTime: new Date(trf.created_at || Date.now()).getTime(),
                    event: `Inter-Warehouse Transfer (${trf.reference || trf.transfer_id || 'TRF'})`,
                    type: 'transfer',
                    delta: trfQty,
                    qtyFormatted: `+${trfQty} pcs`,
                    color: '#2563EB',
                    ref: trf.carrier_name ? `Carrier: ${trf.carrier_name}` : null
                });
            });

            if (damagedStockQty > 0) {
                rawEvents.push({
                    date: nowStr,
                    rawTime: Date.now() - 3600000 * 24,
                    event: 'Damage Write-off',
                    type: 'damage',
                    delta: -damagedStockQty,
                    qtyFormatted: `-${damagedStockQty} pcs`,
                    color: '#D97706',
                    ref: 'Audit Write-off / Damaged'
                });
            }

            // Sort newest first
            rawEvents.sort((a, b) => b.rawTime - a.rawTime);

            // Compute running balances
            let running = currentStockQty;
            const computed = rawEvents.map(e => {
                const bal = running;
                running = Math.max(0, running - e.delta);
                return {
                    ...e,
                    balance: bal
                };
            });

            // Append Initial Opening Balance entry if initial stock existed prior to logged events
            if (running > 0) {
                const initialDate = selectedStock.created_at 
                    ? selectedStock.created_at.split('T')[0] 
                    : (rawEvents.length > 0 ? rawEvents[rawEvents.length - 1].date : nowStr);

                computed.push({
                    date: initialDate,
                    event: 'Opening Stock Balance',
                    type: 'opening',
                    delta: running,
                    qtyFormatted: `${running} pcs`,
                    balance: running,
                    color: '#059669',
                    ref: 'Physical Baseline Inventory'
                });
            }

            return computed;
        }

        // If no transaction events exist, return real baseline opening stock or empty list
        if (currentStockQty > 0) {
            return [
                {
                    date: nowStr,
                    event: 'Opening Stock Balance',
                    type: 'opening',
                    qtyFormatted: `${currentStockQty} pcs`,
                    balance: currentStockQty,
                    color: '#059669',
                    ref: 'Physical Current Inventory'
                }
            ];
        }

        return [];
    }, [selectedStock, currentStockQty, damagedStockQty, rawStockHistory, reportsData]);

    if (!selectedStock) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '560px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                            fontSize: '1.15rem', 
                            fontWeight: '900', 
                            color: '#064E3B', 
                            margin: 0,
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            lineHeight: '1.4'
                        }}>
                            📦 {selectedStock.product_name}
                        </h3>
                        <p style={{ 
                            fontSize: '0.8rem', 
                            color: '#64748B', 
                            margin: '4px 0 0 0',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }}>
                            {selectedStock.product_id} · {(!selectedStock.warehouse_name || selectedStock.warehouse_name.toLowerCase() === 'unassigned') ? 'General' : selectedStock.warehouse_name}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer', flexShrink: 0 }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Stock Summary KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: '#D1FAE5', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#15803d', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Current Stock</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: '900', color: '#065F46', margin: 0 }}>{currentStockQty} pcs</p>
                    </div>
                    <div style={{ background: '#FEE2E2', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#DC2626', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Damaged</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: '900', color: '#991B1B', margin: 0 }}>{damagedStockQty} pcs</p>
                    </div>
                    <div style={{ background: '#FEF3C7', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#D97706', margin: '0 0 4px 0', textTransform: 'uppercase' }}>In Transit</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: '900', color: '#92400E', margin: 0 }}>{inTransitQty} pcs</p>
                    </div>
                </div>

                {/* Storage Location Details */}
                <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem', margin: '0 0 10px 0' }}>📍 Storage Location</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>Zone</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{(selectedStock.zone && selectedStock.zone !== 'N/A') ? selectedStock.zone : 'Standard Zone'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>Rack</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{(selectedStock.rack_number && selectedStock.rack_number !== 'N/A') ? selectedStock.rack_number : '—'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>Shelf</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{(selectedStock.shelf_number && selectedStock.shelf_number !== 'N/A') ? selectedStock.shelf_number : '—'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>Bin</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{(selectedStock.bin_number && selectedStock.bin_number !== 'N/A') ? selectedStock.bin_number : '—'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>Valuation</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{formatCurrency(selectedStock.warehouse_stock_value || 0)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>SKU</p>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{selectedStock.product_id}</p>
                        </div>
                    </div>
                </div>

                {/* Stock Movement History (Recent) Live Timeline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>
                        🕐 Stock Movement History (Recent)
                    </p>
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '700', background: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                        Live Ledger Sync
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {timelineEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.75rem 1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#475569' }}>No Stock Movements Recorded</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>Transactions such as inward receipts, transfers, or delivery dispatches will be recorded here live.</p>
                        </div>
                    ) : (
                        timelineEvents.map((entry, idx, arr) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0, marginTop: '4px' }} />
                                    {idx < arr.length - 1 && (
                                        <div style={{ width: '2px', flex: 1, background: '#E2E8F0', minHeight: '20px' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #F1F5F9', minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                        <p style={{ margin: 0, fontWeight: '800', fontSize: '0.82rem', color: '#0F172A', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                            {entry.event} — <span style={{ color: entry.color, fontWeight: '850' }}>{entry.qtyFormatted}</span>
                                        </p>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                                            Bal: {entry.balance} pcs
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{entry.date}</span>
                                        {entry.ref && <span style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{entry.ref}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
