/* eslint-disable react-refresh/only-export-components */
import React from 'react';

const getParsedItems = (items) => {
    try {
        return typeof items === 'string' ? JSON.parse(items) : (items || []);
    } catch { return []; }
};

const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num || 0);
};

const numberToWords = (num) => {
    return `Rupees ${Math.floor(num || 0).toLocaleString('en-IN')} only.`;
};

export const InvoicePrintTemplate = ({ data = {}, invoice, business = {}, config = {} }) => {
    const invData = data && Object.keys(data).length > 0 ? data : (invoice || {});
    const items = getParsedItems(invData.items);
    const corporateBlue = '#1E3A8A';
    const lightBg = '#F8FAFC';

    const rawSubtotal = invData.amount !== undefined ? invData.amount : (invData.subtotal || 0);
    const rawTax = invData.tax_amount !== undefined ? invData.tax_amount : (invData.tax || 0);
    const rawTotal = invData.total_amount !== undefined ? invData.total_amount : (invData.total || 0);

    return (
        <div className="inv-print-template-container" style={{ padding: '40px', background: '#fff', color: '#1E293B', fontFamily: "'Inter', sans-serif", position: 'relative', width: '100%', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box' }}>
            {/* Visual Accent */}
            <div style={{ height: '6px', background: `linear-gradient(90deg, ${corporateBlue} 0%, #3B82F6 100%)`, borderRadius: '4px', marginBottom: '30px' }} />

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: corporateBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '900' }}>
                            {(business?.business_name || business?.name || 'C').charAt(0)}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: 0, textTransform: 'uppercase' }}>
                                {business?.business_name || business?.name || 'CLIKS ENTERPRISE'}
                            </h1>
                            <p style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', margin: '2px 0 0 0' }}>Global Solutions Enterprise</p>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', maxWidth: '360px' }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{business?.address || 'Corporate Headquarters'}</p>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {business?.gstin && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <b style={{ color: '#0F172A', fontSize: '10px', textTransform: 'uppercase' }}>GSTIN:</b>
                                    <span style={{ fontWeight: '800', color: corporateBlue }}>{business.gstin}</span>
                                </span>
                            )}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <b style={{ color: '#0F172A', fontSize: '10px', textTransform: 'uppercase' }}>Email:</b>
                                <span>{business?.email || 'office@cliks.io'}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#E2E8F0', letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 8px 0', lineHeight: 1 }}>INVOICE</h2>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ background: '#F1F5F9', padding: '6px 18px', borderRadius: '100px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginRight: '8px' }}>Invoice No.</span>
                            <b style={{ fontSize: '13px', color: '#0F172A' }}>{invData.invoice_number || invData.id}</b>
                        </div>
                        <div style={{ paddingRight: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginRight: '8px' }}>Date Issued</span>
                            <b style={{ fontSize: '13px', color: '#0F172A' }}>{invData.due_date || invData.date || new Date().toISOString().split('T')[0]}</b>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipient & Payment Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>Bill Recipient</h3>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' }}>{invData.client_name || invData.customer_name || 'Walk-in Client'}</div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{invData.billing_address || invData.client_email || 'Address on file'}</div>
                    {invData.client_gstin && (
                        <div style={{ marginTop: '8px', fontSize: '11px' }}>
                            <b style={{ color: '#64748B' }}>GSTIN: </b>
                            <span style={{ fontWeight: '800', color: '#1E293B' }}>{invData.client_gstin}</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ background: lightBg, padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Payment Mode</h4>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: corporateBlue }}>{invData.payment_mode || 'Bank Transfer'}</div>
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>Terms: Net 30</div>
                    </div>
                    <div style={{ background: lightBg, padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '10px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px' }}>Currency</h4>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: corporateBlue }}>INR (₹)</div>
                        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>Indian Rupee</div>
                    </div>
                </div>
            </div>

            {/* 3-Column Items Table: DESCRIPTION (55%), QTY (15% center), UNIT PRICE (30% right) */}
            <div style={{ marginBottom: '35px' }}>
                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '55%', padding: '12px 18px', textAlign: 'left', background: '#0F172A', color: 'white', borderRadius: '10px 0 0 10px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.08em' }}>
                                DESCRIPTION (55%)
                            </th>
                            <th style={{ width: '15%', padding: '12px 18px', textAlign: 'center', background: '#0F172A', color: 'white', fontSize: '11px', fontWeight: '900', letterSpacing: '0.08em' }}>
                                QTY (15%)
                            </th>
                            <th style={{ width: '30%', padding: '12px 18px', textAlign: 'right', background: '#0F172A', color: 'white', borderRadius: '0 10px 10px 0', fontSize: '11px', fontWeight: '900', letterSpacing: '0.08em' }}>
                                UNIT PRICE (30%)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.length > 0 ? (
                            items.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ width: '55%', padding: '16px 18px', borderBottom: '1px solid #F1F5F9', textAlign: 'left' }}>
                                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>{item.description || item.name}</div>
                                        <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600', marginTop: '2px' }}>HSN CODE: {item.hsn_code || '8471.30.10'}</div>
                                    </td>
                                    <td style={{ width: '15%', padding: '16px 18px', textAlign: 'center', borderBottom: '1px solid #F1F5F9', fontWeight: '800', color: '#475569', fontSize: '13px' }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{ width: '30%', padding: '16px 18px', textAlign: 'right', borderBottom: '1px solid #F1F5F9', fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>
                                        {formatCurrency(item.price)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td style={{ width: '55%', padding: '16px 18px', borderBottom: '1px solid #F1F5F9', textAlign: 'left' }}>
                                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>Standard Professional Services</div>
                                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600', marginTop: '2px' }}>HSN CODE: 9983.11</div>
                                </td>
                                <td style={{ width: '15%', padding: '16px 18px', textAlign: 'center', borderBottom: '1px solid #F1F5F9', fontWeight: '800', color: '#475569', fontSize: '13px' }}>
                                    1
                                </td>
                                <td style={{ width: '30%', padding: '16px 18px', textAlign: 'right', borderBottom: '1px solid #F1F5F9', fontWeight: '800', color: '#0F172A', fontSize: '13px' }}>
                                    {formatCurrency(rawSubtotal || rawTotal)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary: Bank Settlement Details Alongside Right-Aligned Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
                {/* Bank Settlement Details Box */}
                <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: corporateBlue, textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: corporateBlue }} />
                        Bank Settlement Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Bank Name</p>
                            <p style={{ margin: 0, fontWeight: '800', color: '#1E293B' }}>{business?.bank_name || 'Standard Chartered'}</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>IFSC Code</p>
                            <p style={{ margin: 0, fontWeight: '800', color: '#1E293B' }}>{business?.bank_ifsc || 'SCBL0001234'}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Account Number</p>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: corporateBlue, letterSpacing: '0.5px' }}>{business?.bank_account_no || '5544 9900 1122 3344'}</p>
                        </div>
                    </div>
                </div>

                {/* Right-Aligned Summary Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', whiteSpace: 'nowrap' }}>Amount (Tax Excl.)</span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', whiteSpace: 'nowrap' }}>{formatCurrency(rawSubtotal)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', whiteSpace: 'nowrap' }}>Calculated GST</span>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', whiteSpace: 'nowrap' }}>{formatCurrency(rawTax)}</span>
                    </div>

                    <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />

                    {/* Total Balance / Grand Total with whitespace-nowrap inline-block shrink-0 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', whiteSpace: 'nowrap' }}>Total Balance</span>
                        <span 
                            className="whitespace-nowrap inline-block shrink-0" 
                            style={{ 
                                whiteSpace: 'nowrap', 
                                display: 'inline-block', 
                                flexShrink: 0, 
                                fontSize: '22px', 
                                fontWeight: '950', 
                                color: corporateBlue, 
                                textAlign: 'right' 
                            }}
                        >
                            {formatCurrency(rawTotal)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Amount in words & Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B' }}>
                <div>
                    <span style={{ fontWeight: '800', textTransform: 'uppercase', color: '#94A3B8', fontSize: '9px', display: 'block', marginBottom: '2px' }}>Amount in Words</span>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>{numberToWords(rawTotal).toUpperCase()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A' }}>Authorized Signatory</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>FOR {business?.business_name?.toUpperCase() || 'CLIKS ENTERPRISE'}</div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePrintTemplate;
