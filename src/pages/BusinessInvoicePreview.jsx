import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Printer, 
    Download, 
    X, 
    Loader2, 
    LayoutTemplate,
    Palette,
    Eye,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import { profileService } from '../services';
import { InvoiceTemplates } from '../components/InvoiceTemplates';
import '../App.css';

const BusinessInvoicePreview = () => {
    const [invoiceData, setInvoiceData] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('premium_corporate');
    const [customConfig, setCustomConfig] = useState({
        accentColor: '#BE185D',
        layout: 'table',
        alignment: 'left',
        fontFamily: 'sans-serif',
        showBank: true,
        showTerms: true,
        showSignature: true,
        showHeaderStrip: true
    });
    
    const [isPrinted, setIsPrinted] = useState(false);

    // Fetch actual business profile for production-grade invoices
    const { data: businessProfile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['businessProfile'],
        queryFn: profileService.getProfile,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        // Load data from localStorage
        const storedData = localStorage.getItem('cliks_invoice_preview_data');
        const storedTemplate = localStorage.getItem('cliks_invoice_preview_template');
        const storedConfig = localStorage.getItem('cliks_invoice_preview_config');

        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                // Ensure items is parsed if stored as string
                if (parsed.items && typeof parsed.items === 'string') {
                    parsed.items = JSON.parse(parsed.items);
                }
                setInvoiceData(parsed);
            } catch (e) {
                console.error('Error parsing stored invoice data:', e);
            }
        }

        if (storedTemplate) {
            setActiveTemplate(storedTemplate);
        }

        if (storedConfig) {
            try {
                setCustomConfig(JSON.parse(storedConfig));
            } catch (e) {
                console.error('Error parsing stored config:', e);
            }
        }
    }, []);

    const handlePrint = () => {
        setIsPrinted(true);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    if (!invoiceData) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A', color: 'white', fontFamily: "'Inter', sans-serif" }}>
                <Loader2 className="animate-spin" size={48} color="#EC4899" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Loading Invoice Preview...</h2>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Preparing your PDF document for high-fidelity rendering.</p>
            </div>
        );
    }

    const business = businessProfile?.data || businessProfile || {
        business_name: 'Your Brand Corp',
        email: 'contact@yourbrand.com',
        phone: '+1 800 123 456',
        address: '123 Business Boulevard, Suite 100\nMetropolis, NY 10001'
    };

    const templatesList = [
        { id: 'premium_corporate', name: 'Premium Corporate', desc: 'Sleek Corporate Design', themeColor: '#1E3A8A' },
        { id: 'standard', name: 'Executive Standard', desc: 'Clean & Compliant', themeColor: '#BE185D' },
        { id: 'modern', name: 'Modern Pro', desc: 'Minimalist Layout', themeColor: '#10B981' },
        { id: 'minimal', name: 'Master Grid', desc: 'Rigid Ledger Sheet', themeColor: '#000000' },
        { id: 'elegant_dark', name: 'Pro Accent Top', desc: 'Luxury Accent Stripe', themeColor: '#F59E0B' },
        { id: 'retro_mono', name: 'Global Classic', desc: 'Traditional B2B', themeColor: '#059669' },
        { id: 'creative_blue', name: 'Service Detailed', desc: 'Description Cards', themeColor: '#6366F1' },
        { id: 'executive', name: 'Traditional Serif', desc: 'Formal Georgian style', themeColor: '#111827' },
        { id: 'clean_stripe', name: 'Modern Sidebar', desc: 'Integrated Branding', themeColor: '#059669' },
        { id: 'service_pro', name: 'Dynamic Hybrid', desc: 'Modern SaaS layout', themeColor: '#2563EB' },
        { id: 'custom', name: 'Custom Dynamic', desc: 'Fully Adjustable template', themeColor: customConfig.accentColor }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
            {/* Global style block specifically for printing inside this standalone page */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body, html {
                        background: white !important;
                        color: black !important;
                    }
                    .preview-header-bar {
                        display: none !important;
                    }
                    .preview-content-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    .invoice-page-a4-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: auto !important;
                        border-radius: 0 !important;
                    }
                }
            `}} />

            {/* Premium Header Bar (Hidden during printing) */}
            <header className="preview-header-bar" style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.85rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}>
                {/* Brand & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => window.close()} 
                        style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#94A3B8',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#F43F5E';
                            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#94A3B8';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        }}
                        title="Close Tab"
                    >
                        <X size={16} />
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }}></div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: '850', color: 'white', margin: 0, letterSpacing: '-0.01em' }}>
                                PDF Invoice Preview
                            </h2>
                            <span style={{
                                background: '#10B981',
                                color: 'white',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '100px',
                                fontSize: '0.65rem',
                                fontWeight: '900',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                {invoiceData.invoice_type || 'TAX INVOICE'}
                            </span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '500', margin: '2px 0 0 0' }}>
                            Ref: <span style={{ color: '#CBD5E1', fontWeight: '700' }}>{invoiceData.invoice_number}</span> • Client: <span style={{ color: '#CBD5E1', fontWeight: '700' }}>{invoiceData.client_name}</span>
                        </p>
                    </div>
                </div>

                {/* Templates & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Live Design Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.35rem 0.75rem' }}>
                        <LayoutTemplate size={14} color="#EC4899" />
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginRight: '4px' }}>Template:</span>
                        <select 
                            value={activeTemplate}
                            onChange={(e) => {
                                setActiveTemplate(e.target.value);
                                localStorage.setItem('cliks_invoice_preview_template', e.target.value);
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {templatesList.map(tmpl => (
                                <option key={tmpl.id} value={tmpl.id} style={{ background: '#0F172A', color: 'white' }}>
                                    {tmpl.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Color Accent Indicator */}
                    {activeTemplate === 'custom' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.35rem 0.75rem', borderRadius: '10px' }}>
                            <Palette size={14} style={{ color: customConfig.accentColor }} />
                            <input 
                                type="color" 
                                value={customConfig.accentColor} 
                                onChange={(e) => {
                                    const updated = { ...customConfig, accentColor: e.target.value };
                                    setCustomConfig(updated);
                                    localStorage.setItem('cliks_invoice_preview_config', JSON.stringify(updated));
                                }}
                                style={{ width: '22px', height: '18px', border: 'none', padding: 0, background: 'transparent', cursor: 'pointer' }}
                            />
                        </div>
                    )}

                    {/* Primary Print / PDF Button */}
                    <button 
                        onClick={handlePrint}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.55rem 1.25rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.25)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(236, 72, 153, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(236, 72, 153, 0.25)';
                        }}
                    >
                        <Printer size={15} />
                        Print or Save PDF
                    </button>
                </div>
            </header>

            {/* Standalone Workspace */}
            <main className="preview-content-area" style={{
                flex: 1,
                padding: '3rem 2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflowY: 'auto',
                background: '#0B0F19'
            }}>
                <div 
                    className="invoice-page-a4-sheet"
                    style={{
                        background: 'white',
                        width: '100%',
                        maxWidth: '820px', // Perfect size for A4 high-res printing
                        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        minHeight: '1100px',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{ padding: '0px' }}>
                        <InvoiceTemplates.Renderer 
                            type={activeTemplate} 
                            data={invoiceData} 
                            business={business} 
                            config={customConfig}
                        />

                        {/* Traditional Print Verified Footnote */}
                        {['standard', 'modern', 'premium_corporate'].includes(activeTemplate) && (
                            <div className="no-print" style={{ 
                                marginTop: '40px', 
                                borderTop: '1px dashed #E2E8F0', 
                                paddingTop: '20px', 
                                paddingBottom: '30px',
                                textAlign: 'center',
                                fontSize: '11px',
                                color: '#94A3B8'
                            }}>
                                <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#64748B' }}>Digitally Verified Document Preview</p>
                                <p style={{ margin: 0 }}>This invoice is secure and prints perfectly onto physical letterheads or A4 PDF.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessInvoicePreview;
