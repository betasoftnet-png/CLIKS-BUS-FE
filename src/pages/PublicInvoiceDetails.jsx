import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, ShieldCheck, Download } from 'lucide-react';

const PublicInvoiceDetails = () => {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${window.location.origin}/api/v1/public/invoice/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Invoice verification failed');
                return res.json();
            })
            .then(res => {
                setInvoice(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Invoice not found');
                setLoading(false);
            });
    }, [id]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif" }}>
                <p style={{ color: '#475569', fontSize: '1rem', fontWeight: '600' }}>Verifying & Loading Government e-Invoice...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', maxWidth: '450px', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>⚠️</span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991B1B', marginTop: '1rem' }}>Verification Failed</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.5rem' }}>{error || 'The requested e-Invoice could not be verified on the portal.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2.5rem 1.5rem', background: '#F1F5F9', minHeight: '100vh', fontFamily: "'Inter', sans-serif', sans-serif", boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', overflow: 'hidden', boxSizing: 'border-box' }}>
                {/* Govt Verification Banner */}
                <div style={{ background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)', padding: '1.25rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <ShieldCheck size={24} />
                        <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>E-Invoice Verification System</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>IRN Authenticated & Signed</span>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>Active</span>
                </div>

                <div style={{ padding: '2.5rem' }}>
                    {/* Header Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #F1F5F9', paddingBottom: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>TAX INVOICE</h1>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>Invoice No: <strong style={{ color: '#0F172A' }}>{invoice.invoice_number}</strong></p>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Date: {invoice.created_at ? invoice.created_at.split('T')[0] : 'N/A'}</p>
                            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Type: <span style={{ textTransform: 'uppercase', fontWeight: '750' }}>{invoice.invoice_type || 'B2B'}</span></p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(window.location.href)}`}
                                alt="Signed Invoice QR Code"
                                style={{ border: '1px solid #E2E8F0', padding: '0.3rem', borderRadius: '12px', background: 'white' }}
                            />
                        </div>
                    </div>

                    {/* Buyer/Seller Metadata */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>Seller (From)</h3>
                            <strong style={{ fontSize: '1rem', color: '#1E293B', display: 'block' }}>{invoice.sender_name || 'N/A'}</strong>
                            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.4rem 0 0 0' }}>GSTIN: {invoice.sender_gstin || 'N/A'}</p>
                            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>State: {invoice.sender_state || 'N/A'}</p>
                            {invoice.sender_product_name && (
                                <p style={{ color: '#047857', fontSize: '0.85rem', fontWeight: '700', margin: '0.4rem 0 0 0' }}>Product: {invoice.sender_product_name}</p>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.4rem' }}>Buyer (To)</h3>
                            <strong style={{ fontSize: '1rem', color: '#1E293B', display: 'block' }}>{invoice.customer_name || invoice.client_name || 'N/A'}</strong>
                            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.4rem 0 0 0' }}>GSTIN: {invoice.customer_gstin || 'N/A'}</p>
                            <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>Place of Supply: {invoice.place_of_supply || 'N/A'}</p>
                            {invoice.receiver_product_name && (
                                <p style={{ color: '#047857', fontSize: '0.85rem', fontWeight: '700', margin: '0.4rem 0 0 0' }}>Product: {invoice.receiver_product_name}</p>
                            )}
                        </div>
                    </div>

                    {/* IRN Reference Banner */}
                    <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Reference Number (IRN)</span>
                        <strong style={{ fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', wordBreak: 'break-all' }}>{invoice.irn_number || 'N/A'}</strong>
                    </div>

                    {/* Invoice Value Summary */}
                    <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '1.75rem', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginTop: 0, marginBottom: '1rem', textTransform: 'uppercase' }}>Financial Breakdown</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B', fontWeight: '600' }}>Taxable Value (Exclusive of GST):</span>
                                <span style={{ color: '#1E293B', fontWeight: '750' }}>{formatCurrency(invoice.taxable_value)}</span>
                            </div>
                            {invoice.cgst > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>Central Tax (CGST):</span>
                                        <span style={{ color: '#1E293B', fontWeight: '750' }}>{formatCurrency(invoice.cgst_amount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>State Tax (SGST):</span>
                                        <span style={{ color: '#1E293B', fontWeight: '750' }}>{formatCurrency(invoice.sgst_amount)}</span>
                                    </div>
                                </>
                            )}
                            {invoice.igst > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748B', fontWeight: '600' }}>Integrated Tax (IGST):</span>
                                    <span style={{ color: '#1E293B', fontWeight: '750' }}>{formatCurrency(invoice.igst_amount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748B', fontWeight: '600' }}>Total GST Collected ({invoice.gst_percentage}%):</span>
                                <span style={{ color: '#1E293B', fontWeight: '750' }}>{formatCurrency(invoice.total_tax || invoice.gst_amount || 0)}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '1rem', color: '#1E293B' }}>Total Invoice Amount:</strong>
                            <strong style={{ fontSize: '1.4rem', color: '#047857' }}>{formatCurrency(invoice.total_invoice || invoice.amount)}</strong>
                        </div>
                    </div>

                    {/* Print Actions */}
                    <div className="no-print" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                        <button 
                            onClick={() => window.print()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            <Printer size={15} /> Print
                        </button>
                        <button 
                            onClick={() => window.print()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', borderRadius: '12px', border: 'none', background: '#047857', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                            <Download size={15} /> Download PDF
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    div { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default PublicInvoiceDetails;
