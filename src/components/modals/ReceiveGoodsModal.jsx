/* eslint-disable react/prop-types */
import React, { useState, useMemo, useCallback } from 'react';
import { PackageOpen, X, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const ReceiveGoodsModal = ({
    isOpen,
    onClose,
    doc,
    warehousesList = [],
    onConfirm
}) => {
    const { formatCurrency } = useCurrency();

    // 1. Initialize items state atomically using a function callback in useState(() => ...)
    const [itemsState, setItemsState] = useState(() => {
        const rawItems = doc?.items || doc?.order_items || [];
        if (!rawItems || rawItems.length === 0) {
            return [{
                product_id: doc?.product_id || 1,
                product_name: doc?.product_name || 'Product Item',
                quantity: Number(doc?.quantity) || 1,
                received_quantity: Number(doc?.quantity) || 1,
                purchase_price: doc?.grand_total || doc?.amount || 0,
                primary_unit: doc?.primary_unit || 'pcs'
            }];
        }
        return rawItems.map(it => ({
            ...it,
            received_quantity: it.received_quantity !== undefined && it.received_quantity !== null && it.received_quantity !== ''
                ? Number(it.received_quantity)
                : Number(it.quantity || 1)
        }));
    });

    // Warehouse state initialization
    const [selectedWarehouse, setSelectedWarehouse] = useState(() => {
        return doc?.warehouse_id || (warehousesList?.[0] ? (warehousesList[0].id || warehousesList[0].code || warehousesList[0].name || warehousesList[0].warehouse_name) : '1');
    });

    // 2. Prevent re-render cascades in loops when computing received quantities
    const totalReceivedQty = useMemo(() => {
        return itemsState.reduce((sum, item) => sum + (Number(item.received_quantity) || 0), 0);
    }, [itemsState]);

    const totalOrderedQty = useMemo(() => {
        return itemsState.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }, [itemsState]);

    // 3. Wrap line item changes in a dedicated mapped setter
    const handleReceivedQtyChange = useCallback((itemIndex, newQty) => {
        setItemsState(prevItems => prevItems.map((item, idx) => {
            if (idx === itemIndex) {
                const cleanVal = newQty === '' ? '' : Math.max(0, parseFloat(newQty) || 0);
                return {
                    ...item,
                    received_quantity: cleanVal
                };
            }
            return item;
        }));
    }, []);

    const handleFormSubmit = (e) => {
        e?.preventDefault?.();
        if (onConfirm) {
            const selectedWhObj = (warehousesList || []).find(w => 
                String(w.id || w.code || w.warehouse_id) === String(selectedWarehouse)
            );
            onConfirm({
                warehouse_id: selectedWarehouse,
                warehouse_name: selectedWhObj?.name || selectedWhObj?.warehouse_name || selectedWarehouse,
                warehouse_code: selectedWhObj?.code || selectedWhObj?.warehouse_code || selectedWarehouse,
                items: itemsState
            }, itemsState);
        }
    };

    if (!isOpen || !doc) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', maxWidth: '640px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <PackageOpen size={22} color="#064E3B" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#1E293B' }}>Receive Goods & Warehouse Assignment</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Confirm stock arrival and select destination godown/warehouse.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}>
                        <X size={18} color="#64748B" />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', pr: '0.25rem' }}>
                    {/* PO Header Info */}
                    <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Purchase Order #</span>
                            <p style={{ margin: 0, fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{doc.purchase_number || doc.purchase_id}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Supplier Name</span>
                            <p style={{ margin: 0, fontWeight: '850', color: '#1E293B', fontSize: '0.95rem' }}>{doc.supplier_name}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '750', color: '#334155' }}>Item Details to Receive</label>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#064E3B' }}>
                                Total Received: {totalReceivedQty} / {totalOrderedQty} Units
                            </span>
                        </div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead style={{ background: '#F1F5F9', color: '#475569', fontWeight: '700' }}>
                                    <tr>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Product</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Ordered Qty</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Receiving Qty</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsState.map((it, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.65rem 0.8rem', fontWeight: '700', color: '#1E293B' }}>
                                                {it.product_name}
                                            </td>
                                            <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', fontWeight: '800', color: '#1E293B' }}>
                                                {it.quantity} {it.primary_unit || 'pcs'}
                                            </td>
                                            <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    value={it.received_quantity !== undefined ? it.received_quantity : it.quantity}
                                                    onChange={(e) => handleReceivedQtyChange(idx, e.target.value)}
                                                    style={{
                                                        width: '75px',
                                                        padding: '0.35rem 0.5rem',
                                                        textAlign: 'center',
                                                        borderRadius: '8px',
                                                        border: '1px solid #10B981',
                                                        fontWeight: '800',
                                                        color: '#15803D',
                                                        background: '#F0FDF4'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>
                                                {formatCurrency(it.purchase_price || it.price || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Warehouse Dropdown */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#1E293B', marginBottom: '0.4rem' }}>Select Target Warehouse / Godown *</label>
                        <select 
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontWeight: '700', fontSize: '0.9rem', color: '#0F172A' }}
                        >
                            {warehousesList.map((wh, idx) => {
                                const wName = wh.name || wh.warehouse_name || `Warehouse ${idx + 1}`;
                                const wVal = wh.id || wh.code || wName;
                                return <option key={idx} value={wVal}>{wName} ({wh.code || `WH-${wh.id || idx + 1}`})</option>;
                            })}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
                    <button type="button" onClick={onClose} style={{ padding: '0.7rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                    <button type="button" onClick={handleFormSubmit} style={{ padding: '0.7rem 1.4rem', borderRadius: '12px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> Submit & Receive Goods
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiveGoodsModal;
