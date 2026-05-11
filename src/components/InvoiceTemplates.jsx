import React from 'react';

// UTILS FOR PROFESSIONAL INVOICES
const getParsedItems = (items) => {
    try {
        return typeof items === 'string' ? JSON.parse(items) : (items || []);
    } catch (e) { return []; }
};

const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num || 0);
};

const numberToWords = (num) => {
    // Simplified dynamic converter placeholder for standard production use
    return `Rupees ${Math.floor(num).toLocaleString('en-IN')} only.`; 
};

// Standardized Common Header for dynamic mapping of real profile vs fallback placeholder
const SellerHeader = ({ business }) => (
    <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#111', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
            {business?.business_name || business?.name || 'CLIKS ENTERPRISE'}
        </h1>
        <div style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>
            <p style={{ margin: '0', maxWidth: '400px', whiteSpace: 'pre-line' }}>{business?.address || 'Business Location'}</p>
            <p style={{ margin: '2px 0' }}>Email: {business?.email || 'N/A'} | Ph: {business?.phone || 'N/A'}</p>
            {business?.gstin && <p style={{ margin: '2px 0', fontWeight: '800' }}>GSTIN: <span style={{textTransform: 'uppercase'}}>{business.gstin}</span></p>}
        </div>
    </div>
);

const BankDetails = ({ data, style }) => (
    <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', minWidth: '250px', ...style }}>
        <div style={{ fontSize: '11px', fontWeight: '800', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '6px', textTransform: 'uppercase' }}>Bank Account Details</div>
        <div style={{ fontSize: '11px', color: '#333', display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: '4px' }}>
            <span>Bank Name:</span><b>{data?.bank_name || 'HDFC BANK'}</b>
            <span>A/c No:</span><b>{data?.bank_account_no || 'XXXX XXXX XXXX 1234'}</b>
            <span>IFSC:</span><b>{data?.bank_ifsc || 'HDFC000XXXX'}</b>
            <span>Branch:</span><b>{data?.bank_branch || 'Main Branch'}</b>
        </div>
    </div>
);

const TermsFooter = ({ company }) => (
    <div style={{ flex: 1, paddingRight: '20px' }}>
        <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Terms & Conditions:</p>
        <ol style={{ fontSize: '10px', color: '#555', paddingLeft: '15px', margin: 0, lineHeight: '1.5' }}>
            <li>Subject to local jurisdiction.</li>
            <li>Goods once sold will not be taken back.</li>
            <li>Interest @18% p.a. will be charged on delayed payments.</li>
        </ol>
    </div>
);

const SignatoryBox = ({ company, style }) => (
    <div style={{ width: '220px', textAlign: 'center', ...style }}>
        <p style={{ fontSize: '10px', fontWeight: '700', margin: '0 0 40px 0' }}>For {company?.toUpperCase() || 'OUR COMPANY'}</p>
        <div style={{ borderTop: '1px dashed #000', paddingTop: '5px', fontSize: '11px', fontWeight: '800' }}>Authorized Signatory</div>
    </div>
);

export const InvoiceTemplates = {
    // =====================================================
    // 1. STANDARD TAX INVOICE (PRODUCTION LEVEL A)
    // =====================================================
    standard: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ddd' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, letterSpacing: '2px', fontWeight: '900' }}>TAX INVOICE</h2>
                    <span style={{ fontSize: '11px', color: '#666' }}>(Original for Recipient)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <SellerHeader business={business} />
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <div style={{ background: '#F3F4F6', padding: '8px 15px', border: '1px solid #E5E7EB' }}>
                            <div style={{ marginBottom: '4px' }}>Invoice No: <b>#{data.invoice_number}</b></div>
                            <div>Date: <b>{data.due_date}</b></div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', border: '1px solid #ddd', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', borderRight: '1px solid #ddd' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#555', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Billed To:</p>
                        <p style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 3px 0' }}>{data.client_name}</p>
                        <p style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-line' }}>{data.billing_address || 'N/A'}</p>
                        {data.client_gstin && <p style={{ fontSize: '12px', fontWeight: '800', marginTop: '5px' }}>GSTIN: {data.client_gstin}</p>}
                    </div>
                    <div style={{ padding: '10px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#555', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Shipped To:</p>
                        <p style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-line' }}>{data.shipping_address || 'Same as billing'}</p>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                    <thead style={{ background: '#f1f1f1' }}>
                        <tr style={{ fontSize: '11px', fontWeight: '900' }}>
                            <th style={{ border: '1px solid #000', padding: '8px', width: '30px' }}>#</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Description of Goods/Services</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>HSN</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Qty</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Rate</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Tax%</th>
                            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '12px' }}>
                        {items.map((item, i) => (
                            <tr key={i}>
                                <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', fontWeight: '600' }}>{item.description}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.hsn_code || '-'}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>{item.quantity} {item.unit || 'Pcs'}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>{parseFloat(item.price).toFixed(2)}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.tax_rate || 18}%</td>
                                <td style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: '700' }}>{parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ height: '50px' }}><td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td></tr>
                    </tbody>
                    <tfoot style={{ fontSize: '12px', fontWeight: '800', borderTop: '2px solid #000' }}>
                        <tr>
                            <td colSpan="5" style={{ padding: '10px', border: '1px solid #000', textTransform: 'capitalize' }}>Total In Words: <i>{numberToWords(data.total_amount)}</i></td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>Total</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', background: '#f9f9f9', fontSize: '14px' }}>{formatCurrency(data.total_amount)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #ddd', padding: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <BankDetails data={business} />
                        <div style={{ marginTop: '15px' }}><TermsFooter /></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <SignatoryBox company={business?.business_name || business?.name} />
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 2. PREMIUM MODERN (CLEAN LINES, NO HEAVY BORDERS)
    // =====================================================
    modern: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '40px', background: '#fff', color: '#333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px', borderBottom: '4px solid #1E3A8A', paddingBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#1E3A8A', fontSize: '28px', fontWeight: '900' }}>{business?.business_name || business?.name || 'CLIKS'}</h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>{business?.address}</p>
                        <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: '600' }}>GSTIN: {business?.gstin || 'N/A'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, fontSize: '36px', color: '#E5E7EB', textTransform: 'uppercase' }}>Invoice</h2>
                        <div style={{ fontSize: '14px', marginTop: '10px' }}>
                            <span>Inv: <b>{data.invoice_number}</b></span> | <span>Date: <b>{data.due_date}</b></span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '60px', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '12px', color: '#1E3A8A', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase' }}>Client Details</h3>
                        <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '5px' }}>{data.client_name}</div>
                        <div style={{ fontSize: '13px', color: '#555', whiteSpace: 'pre-line' }}>{data.billing_address}</div>
                        {data.client_gstin && <div style={{ fontSize: '13px', marginTop: '5px' }}><b>GSTIN:</b> {data.client_gstin}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '12px', color: '#1E3A8A', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px', textTransform: 'uppercase' }}>Shipping Details</h3>
                        <div style={{ fontSize: '13px', color: '#555', whiteSpace: 'pre-line' }}>{data.shipping_address || 'As above'}</div>
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ borderTop: '1px solid #ccc', borderBottom: '2px solid #1E3A8A', background: '#F8FAFC' }}>
                            <th style={{ padding: '15px 10px', textAlign: 'left', fontSize: '12px' }}>ITEMS & DESCRIPTION</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px' }}>QTY</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px' }}>RATE</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px' }}>TAX%</th>
                            <th style={{ padding: '15px 10px', textAlign: 'right', fontSize: '12px' }}>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <td style={{ padding: '15px 10px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.description}</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>HSN: {item.hsn_code || 'N/A'}</div>
                                </td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px' }}>{item.quantity}</td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px' }}>{parseFloat(item.price).toFixed(2)}</td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px' }}>{item.tax_rate}%</td>
                                <td style={{ padding: '15px 10px', textAlign: 'right', fontSize: '14px', fontWeight: '700' }}>{parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '350px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px' }}><span>Sub Total:</span><span>{formatCurrency(data.amount)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '14px', borderBottom: '1px solid #eee' }}><span>Tax Amount:</span><span>{formatCurrency(data.tax_amount)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '20px', fontWeight: '900', color: '#1E3A8A' }}><span>Total:</span><span>{formatCurrency(data.total_amount)}</span></div>
                    </div>
                </div>
                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <BankDetails data={business} style={{border: 'none', padding: 0}} />
                    <SignatoryBox company={business?.business_name || business?.name} style={{textAlign: 'right'}} />
                </div>
            </div>
        );
    },

    // =====================================================
    // 3. MASTER GRID (INDUSTRIAL RIGID - TALLY STYLE)
    // =====================================================
    minimal: ({ data, business }) => {
        const items = getParsedItems(data.items);
        const taxBreakdown = data.tax_amount / 2;
        return (
            <div style={{ border: '2px solid #000', padding: 0, color: '#000' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #000', padding: '5px', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>TAX INVOICE</div>
                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '10px' }}>
                        <h2 style={{ fontSize: '16px', margin: '0 0 5px 0' }}>{business?.business_name || 'OUR BUSINESS'}</h2>
                        <p style={{ fontSize: '11px', margin: 0 }}>{business?.address}</p>
                        <p style={{ fontSize: '11px', margin: '5px 0 0 0', fontWeight: 'bold' }}>GSTIN/UIN: {business?.gstin || 'N/A'}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                            <div style={{ flex: 1, borderRight: '1px solid #000', padding: '5px 10px', fontSize: '11px' }}>Invoice No:<br/><b>{data.invoice_number}</b></div>
                            <div style={{ flex: 1, padding: '5px 10px', fontSize: '11px' }}>Dated:<br/><b>{data.due_date}</b></div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: 1, borderRight: '1px solid #000', padding: '5px 10px', fontSize: '11px' }}>Delivery Note:<br/><b>—</b></div>
                            <div style={{ flex: 1, padding: '5px 10px', fontSize: '11px' }}>Mode of Pymt:<br/><b>{data.payment_mode}</b></div>
                        </div>
                    </div>
                </div>
                <div style={{ padding: '10px', borderBottom: '1px solid #000' }}>
                    <div style={{ fontSize: '11px', textDecoration: 'underline', fontWeight: 'bold' }}>Consignee (Billed To)</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{data.client_name}</div>
                    <div style={{ fontSize: '11px' }}>{data.billing_address}</div>
                    {data.client_gstin && <div style={{ fontSize: '11px', fontWeight: 'bold' }}>GSTIN/UIN: {data.client_gstin}</div>}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
                            <th style={{ borderRight: '1px solid #000', padding: '5px', width: '40px' }}>Sl No.</th>
                            <th style={{ borderRight: '1px solid #000', padding: '5px', textAlign: 'left' }}>Description of Goods</th>
                            <th style={{ borderRight: '1px solid #000', padding: '5px' }}>HSN/SAC</th>
                            <th style={{ borderRight: '1px solid #000', padding: '5px' }}>Quantity</th>
                            <th style={{ borderRight: '1px solid #000', padding: '5px' }}>Rate</th>
                            <th style={{ borderRight: '1px solid #000', padding: '5px' }}>per</th>
                            <th style={{ padding: '5px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ fontSize: '12px', verticalAlign: 'top' }}>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'center' }}>{i + 1}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', fontWeight: 'bold' }}>{item.description}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'center' }}>{item.hsn_code}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>{item.quantity}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right' }}>{parseFloat(item.price).toFixed(2)}</td>
                                <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'center' }}>{item.unit || 'nos'}</td>
                                <td style={{ padding: '5px 10px', textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr style={{ height: '100px' }}>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000' }}>
                                <div style={{ textAlign: 'right', fontSize: '11px', paddingRight: '10px', fontStyle: 'italic' }}>CGST @9%<br/>SGST @9%</div>
                            </td>
                            <td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td><td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ textAlign: 'right', padding: '0 10px', fontSize: '12px' }}>
                                {taxBreakdown.toFixed(2)}<br/>{taxBreakdown.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot style={{ borderTop: '1px solid #000' }}>
                        <tr style={{ fontWeight: 'bold', fontSize: '13px' }}>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right' }}>Total</td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000', padding: '5px 10px', textAlign: 'right' }}>{items.reduce((acc, i) => acc + parseFloat(i.quantity || 0), 0)}</td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ padding: '5px 10px', textAlign: 'right', background: '#f1f1f1' }}>₹{parseFloat(data.total_amount).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style={{ borderTop: '1px solid #000', padding: '5px 10px', fontSize: '11px' }}>
                    Amount Chargeable (in words)<br/><b style={{textTransform: 'capitalize'}}>{numberToWords(data.total_amount)}</b>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid #000' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #000', padding: '10px' }}>
                        <BankDetails data={business} style={{border: 'none', padding: 0}} />
                    </div>
                    <div style={{ flex: 1, padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontStyle: 'italic' }}>For {business?.business_name || business?.name}</div>
                        <div style={{ marginTop: '40px', borderTop: '1px dotted #000', display: 'inline-block', paddingTop: '3px', fontSize: '11px', fontWeight: 'bold' }}>Authorised Signatory</div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 4. LUXURY ELEGANT DARK (HEAVY TOP BAR PREMIUM)
    // =====================================================
    elegant_dark: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ border: '1px solid #E5E7EB', background: 'white' }}>
                <div style={{ background: '#111827', color: 'white', padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>{business?.business_name || 'ENTERPRISE'}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{business?.gstin ? `GSTIN: ${business.gstin}` : 'Registered Invoice'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: 0, fontSize: '22px', color: '#FBBF24', fontWeight: '800' }}>TAX INVOICE</h1>
                        <div style={{ fontSize: '13px', marginTop: '5px' }}>#{data.invoice_number}</div>
                    </div>
                </div>
                <div style={{ padding: '30px 40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Sold To</label>
                            <div style={{ fontWeight: '800', fontSize: '16px', margin: '5px 0' }}>{data.client_name}</div>
                            <div style={{ fontSize: '13px', color: '#374151' }}>{data.billing_address}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Invoice Date</label>
                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '5px' }}>{data.due_date}</div>
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Method</label>
                                <div style={{ fontSize: '13px' }}>{data.payment_mode}</div>
                            </div>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                        <thead>
                            <tr style={{ color: '#6B7280', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                <th style={{ textAlign: 'left', padding: '0 10px' }}>Item & HSN</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Rate</th>
                                <th style={{ textAlign: 'right', padding: '0 10px' }}>Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={i} style={{ background: '#F9FAFB' }}>
                                    <td style={{ padding: '15px 10px', borderLeft: '4px solid #FBBF24', borderRadius: '4px 0 0 4px' }}>
                                        <div style={{ fontWeight: '700' }}>{item.description}</div>
                                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.hsn_code}</div>
                                    </td>
                                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>{parseFloat(item.price).toFixed(2)}</td>
                                    <td style={{ padding: '15px 10px', textAlign: 'right', fontWeight: '800', borderRadius: '0 4px 4px 0' }}>{parseFloat(item.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                        <BankDetails data={business} />
                        <div style={{ textAlign: 'right', width: '250px' }}>
                            <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '5px' }}>Sub Total: {formatCurrency(data.amount)}</div>
                            <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '10px' }}>Tax Total: {formatCurrency(data.tax_amount)}</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', borderTop: '2px solid #111827', paddingTop: '10px' }}>{formatCurrency(data.total_amount)}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 5. COMPACT RETAIL (HIGH DENSITY MINIMAL SPACE)
    // =====================================================
    compact_retail: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ 
                width: '80mm', // Standard 3-inch Thermal Receipt Width
                margin: '0 auto', 
                padding: '5px', 
                background: 'white',
                fontFamily: 'monospace, "Courier New", Courier', 
                fontSize: '11px', 
                color: '#000',
                lineHeight: '1.2'
            }}>
                {/* Thermal Header */}
                <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
                    <b style={{ fontSize: '16px', display: 'block', textTransform: 'uppercase' }}>{business?.business_name || 'BUSINESS'}</b>
                    <p style={{ margin: '2px 0', fontSize: '10px' }}>{business?.address}</p>
                    <p style={{ margin: '2px 0' }}>Ph: {business?.phone || 'N/A'}</p>
                    {business?.gstin && <b style={{ fontSize: '11px' }}>GSTIN: {business.gstin}</b>}
                </div>

                <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Inv: <b>#{data.invoice_number}</b></span><span>Dt: {data.due_date}</span></div>
                    <div style={{ marginTop: '3px' }}>Cashier: System | Mode: {data.payment_mode}</div>
                </div>

                {/* Customer Box (If provided) */}
                {data.client_name && (
                    <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px', fontSize: '10px' }}>
                        Billed To: <b>{data.client_name}</b>
                        {data.client_gstin && <div>Cust GST: {data.client_gstin}</div>}
                    </div>
                )}

                {/* Item Table - Thermal Style */}
                <div style={{ borderBottom: '1px dashed #000', marginBottom: '5px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 60px 60px', fontWeight: 'bold', marginBottom: '3px', fontSize: '10px' }}>
                        <span>Item</span>
                        <span style={{ textAlign: 'right' }}>Qty</span>
                        <span style={{ textAlign: 'right' }}>Rate</span>
                        <span style={{ textAlign: 'right' }}>Total</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #000', marginBottom: '3px' }}></div>
                    {items.map((it, i) => (
                        <div key={i} style={{ marginBottom: '5px' }}>
                            <div style={{ fontWeight: 'bold' }}>{it.description}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 60px 60px', fontSize: '10px' }}>
                                <span>{it.hsn_code ? `HSN:${it.hsn_code}` : ''}</span>
                                <span style={{ textAlign: 'right' }}>{it.quantity}</span>
                                <span style={{ textAlign: 'right' }}>{parseFloat(it.price).toFixed(2)}</span>
                                <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(it.total).toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Box */}
                <div style={{ textAlign: 'right', paddingRight: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sub Total:</span><span>{parseFloat(data.amount).toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total GST:</span><span>{parseFloat(data.tax_amount).toFixed(2)}</span></div>
                    {parseFloat(data.discount_amount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount:</span><span>-{parseFloat(data.discount_amount).toFixed(2)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', marginTop: '3px', paddingTop: '3px', fontSize: '14px', fontWeight: 'bold' }}>
                        <span>GRAND TOTAL</span>
                        <span>₹{parseFloat(data.total_amount).toFixed(2)}</span>
                    </div>
                </div>

                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '9px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
                    <span>Total Items: {items.length} | Items Qty: {items.reduce((sum, it) => sum + parseFloat(it.quantity || 0), 0)}</span>
                    <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '11px' }}>*** THANK YOU ***</div>
                    <div>E.& O.E.</div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 6. GLOBAL CLASSIC (CLEAN STANDARD B2B)
    // =====================================================
    retro_mono: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '30px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <SellerHeader business={business} />
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ fontSize: '30px', color: '#999', fontWeight: '300', margin: 0 }}>INVOICE</h1>
                        <div>Invoice # {data.invoice_number}</div>
                        <div>Date: {data.due_date}</div>
                    </div>
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Bill To</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.client_name}</div>
                    <div>{data.billing_address}</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', fontWeight: 'bold', fontSize: '13px' }}>
                            <td style={{ padding: '10px 0' }}>Item Description</td>
                            <td style={{ textAlign: 'right' }}>Quantity</td>
                            <td style={{ textAlign: 'right' }}>Price</td>
                            <td style={{ textAlign: 'right' }}>Total</td>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee', fontSize: '13px' }}>
                                <td style={{ padding: '12px 0' }}><b>{item.description}</b><br/><span style={{fontSize: '11px', color: '#666'}}>HSN/SAC: {item.hsn_code}</span></td>
                                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <table style={{ width: '250px', fontSize: '13px' }}>
                        <tr><td style={{ padding: '5px' }}>Subtotal:</td><td style={{ textAlign: 'right' }}>{formatCurrency(data.amount)}</td></tr>
                        <tr><td style={{ padding: '5px' }}>Tax Total:</td><td style={{ textAlign: 'right' }}>{formatCurrency(data.tax_amount)}</td></tr>
                        <tr style={{ fontWeight: 'bold', fontSize: '16px', borderTop: '2px solid #333' }}><td style={{ padding: '10px 5px' }}>Balance Due:</td><td style={{ textAlign: 'right', padding: '10px 5px' }}>{formatCurrency(data.total_amount)}</td></tr>
                    </table>
                </div>
            </div>
        );
    },

    // =====================================================
    // 7. CORPORATE SERVICE (FULL COLUMN DESCRIPTIONS)
    // =====================================================
    creative_blue: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '40px' }}>
                <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#2d3748' }}>{business?.business_name || 'Our Company'}</h2>
                        <div style={{ fontSize: '12px' }}>GST: {business?.gstin}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800' }}>COMMERCIAL INVOICE</div>
                        <div style={{ fontSize: '13px' }}>Ref: {data.invoice_number}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}><b>Client:</b><br/>{data.client_name}<br/>{data.billing_address}</div>
                    <div style={{ flex: 1 }}><b>Order Details:</b><br/>Date: {data.due_date}<br/>Method: {data.payment_mode}</div>
                </div>
                {items.map((item, index) => (
                    <div key={index} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.description}</div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>Qty: {item.quantity} • Rate: ₹{item.price}</div>
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '18px' }}>₹{parseFloat(item.total).toLocaleString()}</div>
                    </div>
                ))}
                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: '#2d3748', color: 'white', padding: '15px 25px', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                        Payable: {formatCurrency(data.total_amount)}
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 8. EXECUTIVE SERIF (TRADITIONAL FORMAL)
    // =====================================================
    executive: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ fontFamily: 'Georgia, serif', padding: '40px' }}>
                <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>{business?.business_name?.toUpperCase() || 'BUSINESS NAME'}</h1>
                    <div style={{ fontSize: '12px', fontStyle: 'italic' }}>{business?.address} | GSTIN: {business?.gstin}</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '30px', letterSpacing: '2px' }}>STATEMENT OF ACCOUNTS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
                    <div><b>DEBTOR:</b><br/>{data.client_name}<br/>{data.billing_address}</div>
                    <div style={{ textAlign: 'right' }}><b>DOC NO:</b> {data.invoice_number}<br/><b>DATE:</b> {data.due_date}</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                    <thead>
                        <tr style={{ background: '#f1f1f1', borderBottom: '1px solid #000' }}>
                            <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'left' }}>PARTICULARS</th>
                            <th style={{ borderRight: '1px solid #000', padding: '8px', textAlign: 'right' }}>VALUATION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ borderRight: '1px solid #000', padding: '10px' }}>{it.description} (Qty: {it.quantity})</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>{parseFloat(it.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
                            <td style={{ borderRight: '1px solid #000', padding: '10px', textAlign: 'right' }}>NET PAYABLE</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>₹ {parseFloat(data.total_amount).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style={{ marginTop: '50px' }}>
                    <BankDetails data={business} />
                </div>
            </div>
        );
    },

    // =====================================================
    // 9. CLEAN SIDE STRIPE (ACCENT STRIP PRO)
    // =====================================================
    clean_stripe: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ display: 'flex', border: '1px solid #ddd', minHeight: '700px' }}>
                <div style={{ width: '25%', background: '#F3F4F6', borderRight: '1px solid #ddd', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px' }}>From</h3>
                        <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '5px' }}>{business?.business_name || 'Company'}</div>
                        <div style={{ fontSize: '12px', color: '#4B5563' }}>{business?.address}</div>
                        
                        <h3 style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', marginTop: '30px', marginBottom: '10px' }}>To</h3>
                        <div style={{ fontWeight: '800', fontSize: '14px' }}>{data.client_name}</div>
                        <div style={{ fontSize: '12px', color: '#4B5563' }}>{data.billing_address}</div>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>TOTAL AMOUNT</div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#000' }}>{formatCurrency(data.total_amount)}</div>
                    </div>
                </div>
                <div style={{ flex: 1, padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>INVOICE</h1>
                        <div style={{ textAlign: 'right', fontSize: '12px' }}>#{data.invoice_number}<br/>{data.due_date}</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', borderBottom: '1px solid #ddd' }}>
                                <th style={{ textAlign: 'left', padding: '10px 0' }}>DESCRIPTION</th>
                                <th style={{ textAlign: 'right' }}>QTY</th>
                                <th style={{ textAlign: 'right' }}>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f3f3f3', fontSize: '13px' }}>
                                    <td style={{ padding: '15px 0' }}>{it.description}</td>
                                    <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(it.total).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    },

    // =====================================================
    // 10. HYBRID LITE (ULTRA MODERN MINIMALIST)
    // =====================================================
    service_pro: ({ data, business }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '40px', background: '#FFF', color: '#111827' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>{business?.business_name || 'Business'}</h1>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>{business?.address}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice #</div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{data.invoice_number}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>Issued: {data.due_date}</div>
                    </div>
                </div>
                <div style={{ border: '1px solid #F3F4F6', borderRadius: '12px', overflow: 'hidden', marginBottom: '40px' }}>
                    <div style={{ background: '#F9FAFB', padding: '15px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                        <div style={{ flex: 3 }}>Product / Service</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>Qty</div>
                        <div style={{ flex: 1, textAlign: 'right' }}>Price</div>
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 3 }}>
                                <div style={{ fontWeight: '700' }}>{item.description}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>HSN: {item.hsn_code || '—'}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', color: '#6B7280' }}>{item.quantity}</div>
                            <div style={{ flex: 1, textAlign: 'right', fontWeight: '700' }}>{formatCurrency(item.total)}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '300px', background: '#F9FAFB', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#6B7280' }}>Total Payable</span>
                            <span style={{ fontSize: '20px', fontWeight: '900' }}>{formatCurrency(data.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // =====================================================
    // 11. CUSTOM BRANDING (DYNAMIC THEME COLORS)
    // =====================================================
    custom: ({ data, business, accentColor = '#BE185D' }) => {
        const items = getParsedItems(data.items);
        return (
            <div style={{ padding: '30px', background: '#FFF' }}>
                <div style={{ display: 'flex', borderBottom: `4px solid ${accentColor}`, paddingBottom: '20px', marginBottom: '30px', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, color: accentColor }}>{business?.business_name || 'BUSINESS'}</h1>
                        <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>{business?.address}</p>
                        {business?.gstin && <div style={{ fontSize: '12px', fontWeight: '700', color: accentColor }}>GST: {business.gstin}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '300', margin: 0, letterSpacing: '3px', color: '#CCC' }}>INVOICE</h2>
                        <div style={{ fontWeight: 'bold' }}>#{data.invoice_number}</div>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    <div style={{ background: `${accentColor}08`, padding: '15px', borderLeft: `4px solid ${accentColor}`, borderRadius: '4px' }}>
                        <span style={{ fontSize: '11px', color: accentColor, fontWeight: 'bold', textTransform: 'uppercase' }}>Billed Recipient</span>
                        <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '5px' }}>{data.client_name}</div>
                        <div style={{ fontSize: '12px', color: '#444', marginTop: '3px' }}>{data.billing_address}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', marginBottom: '5px' }}><b>Date:</b> {data.due_date}</div>
                        <div style={{ fontSize: '13px' }}><b>Mode:</b> {data.payment_mode}</div>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: accentColor, color: 'white' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px' }}>Product Details</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '12px' }}>Qty</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px' }}>Rate</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${accentColor}20` }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: '700' }}>{it.description}</div>
                                    <span style={{ fontSize: '11px', color: '#666' }}>HSN: {it.hsn_code || '—'}</span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{it.quantity}</td>
                                <td style={{ padding: '15px', textAlign: 'right' }}>{parseFloat(it.price).toFixed(2)}</td>
                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>{parseFloat(it.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                    <div style={{ width: '280px', background: '#F8FAFC', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                            <span>Sub Total</span><span>{formatCurrency(data.amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                            <span>Total Tax</span><span>{formatCurrency(data.tax_amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', color: accentColor }}>
                            <span>TOTAL</span><span>{formatCurrency(data.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    // The master switch renderer that takes template ID, data, and business context
    Renderer: ({ type, data, business, accentColor }) => {
        const TemplateComponent = InvoiceTemplates[type] || InvoiceTemplates.standard;
        return <TemplateComponent data={data} business={business} accentColor={accentColor} />;
    }
};
