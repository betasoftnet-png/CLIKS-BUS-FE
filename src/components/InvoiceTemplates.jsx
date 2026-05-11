import React from 'react';

// Shared Subcomponents to minimize duplication in templates
const getParsedItems = (items) => typeof items === 'string' ? JSON.parse(items) : items;

export const InvoiceTemplates = {
    // =====================================================
    // 1. STANDARD
    // =====================================================
    standard: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#BE185D', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>CLIKS BUSINESS</h1>
                        <p style={{ fontSize: '13px', color: '#444', fontWeight: '600' }}>Tax Invoice / Bill of Supply</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px', color: '#334155' }}>INVOICE</h2>
                        <p style={{ fontWeight: '800', fontSize: '14px' }}>#{data.invoice_number}</p>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Date: {data.due_date}</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                    <div>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Billed To:</h3>
                        <p style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{data.client_name}</p>
                        <p style={{ fontSize: '13px', color: '#475569' }}>{data.client_email}</p>
                        <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Billing Address:</p>
                            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{data.billing_address || 'N/A'}</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Shipping Info:</h3>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{data.shipping_address || 'N/A'}</p>
                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <p style={{ fontSize: '13px', fontWeight: '700' }}>Mode: {data.payment_mode}</p>
                        </div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px' }}>
                    <thead>
                        <tr style={{ background: '#FCE7F3', color: '#000' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Qty</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Rate</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600' }}>{item.description}</td>
                                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>₹{item.price.toLocaleString()}</td>
                                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '800' }}>₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '300px', background: '#F8FAFC', padding: '20px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}><span style={{ color: '#64748B' }}>Subtotal</span><span style={{ fontWeight: '800' }}>₹{data.amount.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}><span style={{ color: '#64748B' }}>Tax</span><span style={{ fontWeight: '800' }}>₹{data.tax_amount.toLocaleString()}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '12px', marginTop: '12px', fontSize: '18px' }}>
                            <span style={{ fontWeight: '900' }}>GRAND TOTAL</span><span style={{ fontWeight: '900', color: '#BE185D' }}>₹{data.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 2. ZOHO STYLE
    // =====================================================
    modern: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div>
                <div style={{ height: '8px', background: '#1E3A8A', width: '100%', marginBottom: '20px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#0F172A', letterSpacing: '2px', margin: 0 }}>CLIKS BUSINESS</h1>
                        <p style={{ fontSize: '12px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>Innovate . Deliver . Excel</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '200', margin: 0, color: '#E2E8F0', position: 'relative', top: '-10px' }}>INVOICE</h2>
                    </div>
                </div>
                <div style={{ display: 'flex', marginBottom: '50px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1E3A8A', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #E2E8F0', display: 'inline-block', paddingBottom: '2px' }}>Bill To:</h3>
                        <p style={{ fontSize: '16px', fontWeight: '900', color: '#000', margin: '0 0 4px 0' }}>{data.client_name}</p>
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{data.billing_address}</p>
                    </div>
                    <div style={{ flex: 1, paddingLeft: '50px', borderLeft: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>Invoice# :</span><span style={{ fontWeight: '700' }}>{data.invoice_number}</span>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>Date :</span><span style={{ fontWeight: '700' }}>{data.due_date}</span>
                            <span style={{ color: '#64748B', fontWeight: '600' }}>Payment :</span><span style={{ fontWeight: '700', color: '#1E3A8A' }}>{data.payment_mode}</span>
                        </div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #1E3A8A', borderTop: '1px solid #E2E8F0' }}>
                            <th style={{ padding: '15px 10px', textAlign: 'left', fontSize: '12px', fontWeight: '800', color: '#1E3A8A' }}>Item Description</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#1E3A8A' }}>Qty</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px', fontWeight: '800', color: '#1E3A8A' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '15px 10px', fontSize: '14px', color: '#000' }}>
                                    <div style={{ fontWeight: '700' }}>{item.description}</div>
                                    {item.hsn_code && <div style={{ fontSize: '11px', color: '#64748B' }}>HSN: {item.hsn_code}</div>}
                                </td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px' }}>{item.quantity}</td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '320px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', background: '#F8FAFC', marginTop: '10px', borderRadius: '4px' }}>
                            <span style={{ fontWeight: '800', color: '#1E3A8A', paddingLeft: '10px' }}>Total Due</span>
                            <span style={{ fontWeight: '900', fontSize: '18px', paddingRight: '10px' }}>₹{data.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 3. VYAPAR GRID
    // =====================================================
    minimal: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ border: '2px solid #000', padding: 0 }}>
                <div style={{ textAlign: 'center', padding: '10px', borderBottom: '2px solid #000', background: '#F1F5F9' }}>
                    <h1 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>TAX INVOICE</h1>
                </div>
                <div style={{ padding: '15px', borderBottom: '1px solid #000' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 5px 0' }}>CLIKS BUSINESS SYSTEMS</h2>
                    <p style={{ margin: '0', fontSize: '12px' }}>Enterprise HQ, District 9.</p>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '10px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', textDecoration: 'underline' }}>Receiver (Billed To):</p>
                        <p style={{ fontSize: '14px', fontWeight: '900' }}>{data.client_name}</p>
                        <p style={{ fontSize: '12px' }}>{data.billing_address}</p>
                    </div>
                    <div style={{ flex: 1, padding: '0' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #000', height: '50%' }}>
                            <div style={{ flex: 1, borderRight: '1px solid #000', padding: '5px 10px' }}>Invoice #: <b>{data.invoice_number}</b></div>
                            <div style={{ flex: 1, padding: '5px 10px' }}>Date: <b>{data.due_date}</b></div>
                        </div>
                        <div style={{ display: 'flex', height: '50%', padding: '5px 10px' }}>Pymt: <b>{data.payment_mode}</b></div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000', background: '#F8FAFC' }}>
                            <th style={{ borderRight: '1px solid #000', padding: '8px', width: '40px' }}>#</th>
                            <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'left' }}>Goods Details</th>
                            <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #EEE' }}>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px' }}>{item.description}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: '900' }}>{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                        <tr style={{ height: '80px' }}><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td></td></tr>
                    </tbody>
                </table>
                <div style={{ display: 'flex', borderTop: '2px solid #000', background: '#F1F5F9', padding: '10px', fontSize: '16px', fontWeight: '900' }}>
                    <span style={{ flex: 1 }}>GRAND TOTAL (INCL TAX)</span>
                    <span>₹{data.total_amount.toLocaleString()}</span>
                </div>
                <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #000' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', marginBottom: '30px' }}>For CLIKS BUSINESS SYSTEMS</p>
                    <span style={{ borderTop: '1px dashed #000', paddingTop: '3px', fontSize: '11px' }}>Authorized Signatory</span>
                </div>
            </div>
        );
    },

    // =====================================================
    // 4. ELEGANT DARK (Luxury)
    // =====================================================
    elegant_dark: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ color: '#1A1A1A', fontFamily: '"Cinzel", serif' }}>
                <div style={{ background: '#0F172A', padding: '40px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '300', margin: 0, letterSpacing: '6px', color: '#F59E0B' }}>C L I K S</h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8, letterSpacing: '2px' }}>EXECUTIVE BILLING</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>INVOICE NO.</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{data.invoice_number}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', padding: '0 20px', gap: '50px', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '10px', letterSpacing: '1px' }}>Client Identification</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{data.client_name}</div>
                        <div style={{ fontSize: '14px', color: '#475569', marginTop: '5px' }}>{data.billing_address}</div>
                    </div>
                    <div style={{ width: '200px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Issued On</div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{data.due_date}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Currency</div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>INR (₹)</div>
                        </div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', padding: '0 20px' }}>
                    <thead>
                        <tr style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Particulars</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Valuation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ background: '#F8FAFC' }}>
                                <td style={{ padding: '15px', borderLeft: '4px solid #F59E0B' }}>
                                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{item.description}</div>
                                    <div style={{ fontSize: '12px', color: '#64748B' }}>Quantity: {item.quantity}</div>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: '800', fontSize: '15px' }}>₹{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '40px 20px' }}>
                    <div style={{ width: '250px', borderTop: '2px solid #0F172A', paddingTop: '20px', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Sub-Valuation: ₹{data.amount.toLocaleString()}</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '10px', color: '#0F172A' }}>₹{data.total_amount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 5. COMPACT RETAIL (Thermal style)
    // =====================================================
    compact_retail: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ maxWidth: '500px', margin: '0 auto', fontFamily: 'monospace', padding: '20px', border: '1px dashed #CCC', background: '#FFFFFC' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #000', paddingBottom: '15px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>** CLIKS RETAIL **</h1>
                    <p style={{ margin: '5px 0', fontSize: '12px' }}>EXPRESS COUNTER RECEIPTS</p>
                    <p style={{ margin: 0, fontSize: '11px' }}>Date: {data.due_date} | Bill: #{data.invoice_number}</p>
                </div>
                <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                    <div>CUSTOMER: {data.client_name.toUpperCase()}</div>
                    <div>MODE: {data.payment_mode.toUpperCase()}</div>
                </div>
                <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '5px 0', display: 'flex', fontSize: '12px', fontWeight: 'bold' }}>
                    <span style={{ flex: 2 }}>ITEM</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>QTY</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>AMT</span>
                </div>
                {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', fontSize: '13px', margin: '5px 0' }}>
                        <span style={{ flex: 2 }}>{item.description.substring(0, 20)}</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>{item.total.toFixed(2)}</span>
                    </div>
                ))}
                <div style={{ borderTop: '2px dashed #000', marginTop: '20px', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Subtotal:</span><span>₹{data.amount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>GST Tax:</span><span>₹{data.tax_amount.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '5px' }}>
                        <span>TOTAL:</span><span>₹{data.total_amount.toFixed(2)}</span>
                    </div>
                </div>
                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px' }}>
                    <div>*******************************</div>
                    <div>THANKS FOR VISITING</div>
                    <div>NO REFUND WITHOUT RECEIPT</div>
                    <div>*******************************</div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 6. RETRO MONO (Old-School ASCII print)
    // =====================================================
    retro_mono: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ fontFamily: '"Courier New", monospace', color: '#000', border: '3px double #000', padding: '20px' }}>
                <pre style={{ margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
{`
+----------------------------------------------+
|  CLIKS BUSINESS SYSTEMS MAINFRAME COMPUTER   |
|            GENERATED TAX INVOICE             |
+----------------------------------------------+
`}
                </pre>
                <div style={{ margin: '20px 0' }}>
                    <div>REF NO : {data.invoice_number}</div>
                    <div>DATE   : {data.due_date}</div>
                    <div>TO     : {data.client_name.toUpperCase()}</div>
                    <div>LOC    : {data.billing_address || 'NOT PROVIDED'}</div>
                </div>
                <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 0', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex' }}>
                        <span style={{ width: '50%' }}>DESCRIPTION</span>
                        <span style={{ width: '15%', textAlign: 'center' }}>QTY</span>
                        <span style={{ width: '35%', textAlign: 'right' }}>AMOUNT (INR)</span>
                    </div>
                </div>
                <div style={{ margin: '10px 0', minHeight: '150px' }}>
                    {items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', margin: '4px 0' }}>
                            <span style={{ width: '50%' }}>* {item.description}</span>
                            <span style={{ width: '15%', textAlign: 'center' }}>{item.quantity}</span>
                            <span style={{ width: '35%', textAlign: 'right' }}>{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', textAlign: 'right' }}>
                    <div>NET AMOUNT: ₹{data.amount.toFixed(2)}</div>
                    <div>TAX TOTAL:  ₹{data.tax_amount.toFixed(2)}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>GRAND TOTAL: ₹{data.total_amount.toFixed(2)}</div>
                </div>
                <p style={{ marginTop: '30px', fontStyle: 'italic', fontSize: '10px' }}>EOF (End of File). System printed copy.</p>
            </div>
        );
    },

    // =====================================================
    // 7. CREATIVE GRADIENT (Dynamic design)
    // =====================================================
    creative_blue: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', padding: '50px 40px', color: 'white', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <h1 style={{ fontSize: '40px', fontWeight: '900', margin: 0 }}>Cliks Studio</h1>
                    <p style={{ opacity: 0.8, fontSize: '14px' }}>Creative Billing Suite</p>
                    <div style={{ marginTop: '30px', display: 'flex', gap: '40px' }}>
                        <div><div style={{ fontSize: '12px', opacity: 0.7 }}>CLIENT</div><div style={{ fontWeight: '800', fontSize: '18px' }}>{data.client_name}</div></div>
                        <div><div style={{ fontSize: '12px', opacity: 0.7 }}>INVOICE #</div><div style={{ fontWeight: '800', fontSize: '18px' }}>{data.invoice_number}</div></div>
                    </div>
                </div>
                <div style={{ padding: '40px' }}>
                    <h3 style={{ color: '#6366F1', fontWeight: '800', marginBottom: '20px' }}>Project Deliverables</h3>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} style={{ background: '#F8FAFC' }}>
                                    <td style={{ padding: '20px', borderRadius: '12px 0 0 12px' }}>
                                        <div style={{ fontWeight: '800', color: '#1E293B' }}>{item.description}</div>
                                        <div style={{ fontSize: '12px', color: '#64748B' }}>Qty: {item.quantity} unit(s)</div>
                                    </td>
                                    <td style={{ padding: '20px', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                                        <div style={{ fontWeight: '900', color: '#6366F1', fontSize: '18px' }}>₹{item.total.toLocaleString()}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                        <div style={{ padding: '20px', background: '#F5F3FF', borderRadius: '16px', textAlign: 'right', minWidth: '200px' }}>
                            <div style={{ color: '#7C3AED', fontSize: '12px', fontWeight: '700' }}>FINAL AMOUNT</div>
                            <div style={{ color: '#4C1D95', fontSize: '32px', fontWeight: '900' }}>₹{data.total_amount.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 8. EXECUTIVE (Classic / Serif style)
    // =====================================================
    executive: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ fontFamily: '"Times New Roman", Times, serif', padding: '40px', color: '#111' }}>
                <div style={{ textAlign: 'center', borderBottom: '4px double #111', paddingBottom: '20px', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', margin: 0, fontStyle: 'italic' }}>Cliks Financial Corporation</h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', letterSpacing: '2px' }}>STATUTORY TAX DOCUMENT</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ fontSize: '15px' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>DEBTOR DETAILS:</p>
                        <p style={{ margin: 0 }}>{data.client_name}</p>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{data.billing_address}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '15px' }}>
                        <p style={{ margin: 0 }}><b>Date:</b> {data.due_date}</p>
                        <p style={{ margin: 0 }}><b>Doc No:</b> {data.invoice_number}</p>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #111', borderTop: '2px solid #111' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>PARTICULARS</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>QUANTITY</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>TOTAL VALUATION (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #DDD' }}>
                                <td style={{ padding: '12px 10px' }}>{item.description}</td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ padding: '12px 10px', textAlign: 'right' }}>{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ float: 'right', width: '300px', borderTop: '2px solid #111', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>SUBTOTAL</span><span>{data.amount.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}><span>GRAND TOTAL</span><span>₹ {data.total_amount.toLocaleString()}</span></div>
                </div>
                <div style={{ clear: 'both', marginTop: '80px' }}>
                    <div style={{ borderBottom: '1px solid #111', width: '200px' }}></div>
                    <p style={{ fontSize: '12px' }}>Signature & Seal</p>
                </div>
            </div>
        );
    },

    // =====================================================
    // 9. CLEAN STRIPE (Side column layout)
    // =====================================================
    clean_stripe: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ display: 'flex', minHeight: '800px' }}>
                <div style={{ width: '240px', background: '#059669', color: 'white', padding: '40px 20px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '40px' }}>CLIKS</h1>
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Invoice For</p>
                        <p style={{ fontWeight: '700', fontSize: '16px', marginTop: '5px' }}>{data.client_name}</p>
                        <p style={{ opacity: 0.9, fontSize: '13px' }}>{data.client_email}</p>
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Invoice Details</p>
                        <p style={{ fontWeight: '700', fontSize: '14px', marginTop: '5px' }}>#{data.invoice_number}</p>
                        <p style={{ opacity: 0.9, fontSize: '13px' }}>Issued: {data.due_date}</p>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '100px' }}>
                        <p style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Amount Due</p>
                        <p style={{ fontSize: '32px', fontWeight: '900' }}>₹{data.total_amount.toLocaleString()}</p>
                    </div>
                </div>
                <div style={{ flex: 1, padding: '40px', background: 'white' }}>
                    <h2 style={{ color: '#059669', borderBottom: '2px solid #ECFDF5', paddingBottom: '15px' }}>Itemized Receipt</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', textAlign: 'left', fontSize: '12px' }}>
                                <th style={{ padding: '12px 0' }}>DESCRIPTION</th>
                                <th style={{ padding: '12px 0', textAlign: 'center' }}>QTY</th>
                                <th style={{ padding: '12px 0', textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '15px 0', fontWeight: '600', color: '#111827' }}>{item.description}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '15px 0', textAlign: 'right', fontWeight: '700' }}>₹{item.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    },

    // =====================================================
    // 10. SERVICE PRO (Service-based simplified)
    // =====================================================
    service_pro: ({ data }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '30px' }}>
                <div style={{ background: '#EFF6FF', padding: '25px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ background: '#2563EB', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>PROFESSIONAL SERVICES</span>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E3A8A', margin: '10px 0 0 0' }}>Cliks Business</h1>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#64748B', fontSize: '12px' }}>Invoice Identification</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A' }}>ID: {data.invoice_number}</div>
                    </div>
                </div>
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Rendered For:</h3>
                    <p style={{ fontSize: '20px', fontWeight: '700', margin: '5px 0 0 0' }}>{data.client_name}</p>
                </div>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#F8FAFC', padding: '12px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', fontWeight: 'bold', color: '#475569', fontSize: '13px' }}>
                        <div style={{ flex: 3 }}>Service Description</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>Total Amount</div>
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 3 }}>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: '16px' }}>{item.description}</div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Standard Service Line • Quantity: {item.quantity}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'right', fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>
                                ₹{item.total.toLocaleString()}
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ fontWeight: 'bold', color: '#475569' }}>Net Total Payable</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#111827' }}>₹{data.total_amount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        );
    },

    // The master switch renderer that takes template ID and dynamic payload
    Renderer: ({ type, data }) => {
        const TemplateComponent = InvoiceTemplates[type] || InvoiceTemplates.standard;
        return <TemplateComponent data={data} />;
    }
};
