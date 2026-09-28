import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Printer } from 'lucide-react';

const POSReceiptModal = ({
    isOpen,
    onClose,
    lastOrderData,
    paymentMode = 'CASH',
    formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    onPrint = () => window.print()
}) => {
    if (!isOpen || !lastOrderData) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'white',
                    width: '380px',
                    borderRadius: '20px',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Close (X) Icon Button */}
                <button
                    onClick={onClose}
                    aria-label="Close receipt modal"
                    title="Close"
                    className="no-print"
                    style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '-12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 10,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.color = '#0F172A';
                        e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.color = '#334155';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <X size={18} strokeWidth={2.5} />
                </button>

                {/* Modal Header */}
                <div className="no-print" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '1.5rem', color: 'white', textAlign: 'center', position: 'relative', borderRadius: '20px 20px 0 0' }}>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Check size={24} strokeWidth={3} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>Payment Successful!</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Order {lastOrderData?.invoice_number || ''} generated</p>
                </div>

                {/* Thermal Receipt Workspace (to print) */}
                <div id="printable-pos-receipt" className="printable-pos-receipt" style={{ padding: '1.5rem', background: '#FFFFFF', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', textTransform: 'uppercase' }}>CLIKS BUSINESS POS</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem' }}>Phone: +91 98765 43210</p>
                        <p style={{ margin: '2px 0 8px', fontSize: '0.75rem' }}>Receipt No: {lastOrderData?.invoice_number || 'N/A'}</p>
                        
                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />
                        
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>Date: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                            <span>Time: {lastOrderData?.created_at ? new Date(lastOrderData.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', marginBottom: '8px' }}>
                            <span>Customer: {lastOrderData?.client_name || 'Walk-in Customer'}</span>
                        </div>

                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '4px 0 8px' }} />

                        {/* Items Table */}
                        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    <th style={{ textAlign: 'left', padding: '4px 0' }}>ITEM</th>
                                    <th style={{ textAlign: 'center', padding: '4px 0' }}>QTY</th>
                                    <th style={{ textAlign: 'right', padding: '4px 0' }}>RATE</th>
                                    <th style={{ textAlign: 'right', padding: '4px 0' }}>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {((lastOrderData?.items && (typeof lastOrderData.items === 'string' ? JSON.parse(lastOrderData.items) : lastOrderData.items)) || []).map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '4px 0', maxWidth: '120px', overflow: 'hidden' }}>{item?.description || item?.name || 'Item'}</td>
                                        <td style={{ padding: '4px 0', textAlign: 'center' }}>{item?.quantity || 0} {item?.unit || 'PCS'}</td>
                                        <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{item?.price || item?.unit_price || 0}/{item?.unit || 'PCS'}</td>
                                        <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(item?.total || item?.amount || (item?.price && item?.quantity ? item.price * item.quantity : 0))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />

                        {/* Tally */}
                        <div style={{ width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>SUBTOTAL:</span>
                                <span>{formatCurrency(lastOrderData?.amount || 0)}</span>
                            </div>
                            {lastOrderData?.discount_amount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DISCOUNT:</span>
                                    <span>- {formatCurrency(lastOrderData.discount_amount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>TAX (GST):</span>
                                <span>{formatCurrency(lastOrderData?.tax_amount || 0)}</span>
                            </div>
                            {(lastOrderData?.loyalty_discount_amount > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>LOYALTY DISCOUNT:</span>
                                    <span>- {formatCurrency(lastOrderData?.loyalty_discount_amount || lastOrderData?.loyalty_points_redeemed || 0)}</span>
                                </div>
                            )}
                            {Math.abs(lastOrderData?.round_off || 0) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>ROUND OFF:</span>
                                    <span>{lastOrderData.round_off > 0 ? '+' : ''}{formatCurrency(lastOrderData.round_off)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '4px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                <span>GRAND TOTAL:</span>
                                <span>{formatCurrency(lastOrderData?.total_amount || 0)}</span>
                            </div>
                        </div>

                        <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '12px 0' }} />
                        
                        {/* Loyalty Points Summary on Receipt */}
                        {(lastOrderData?.existing_loyalty_points !== undefined || lastOrderData?.loyalty_points_earned > 0 || lastOrderData?.loyalty_points_redeemed > 0) && (
                            <div style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left', marginBottom: '6px' }}>
                                <p style={{ margin: '0 0 4px', fontWeight: 'bold', textTransform: 'uppercase' }}>LOYALTY POINTS:</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Existing Points:</span>
                                    <span>{lastOrderData?.existing_loyalty_points ?? 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Points Redeemed:</span>
                                    <span>{lastOrderData?.loyalty_points_redeemed ?? 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Points Earned:</span>
                                    <span>{lastOrderData?.loyalty_points_earned ?? 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '2px', borderTop: '1px dotted #000', paddingTop: '2px' }}>
                                    <span>Remaining Points:</span>
                                    <span>{lastOrderData?.remaining_loyalty_points ?? lastOrderData?.final_loyalty_points ?? Math.max(0, (lastOrderData?.existing_loyalty_points || 0) - (lastOrderData?.loyalty_points_redeemed || 0) + (lastOrderData?.loyalty_points_earned || 0))}</span>
                                </div>
                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0 4px' }} />
                            </div>
                        )}

                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>MODE: {(lastOrderData?.payment_mode || paymentMode || 'CASH').toUpperCase()}</p>
                        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>Thank you for your business!</p>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="no-print" style={{ padding: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem', borderRadius: '0 0 20px 20px' }}>
                    <button 
                        onClick={onPrint}
                        className="no-print"
                        style={{ 
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                            padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', 
                            background: 'white', color: '#1E293B', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                        }}
                    >
                        <Printer size={16} /> Print
                    </button>
                    <button 
                        onClick={onClose}
                        className="no-print"
                        style={{ 
                            flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', 
                            background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                        }}
                    >
                        New Order
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default POSReceiptModal;
