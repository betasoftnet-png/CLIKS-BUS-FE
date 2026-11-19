import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { X, Printer, Copy, Check, Barcode as BarcodeIcon, Tag, Sparkles } from 'lucide-react';

/**
 * ScannableBarcodeModal
 * Displays the actual black & white scannable zebra barcode stripes
 * that physical barcode scanner guns and mobile camera scanners can scan directly.
 */
export const ScannableBarcodeModal = ({
    isOpen = false,
    onClose,
    product = null,
    barcodeValue: explicitBarcode = null
}) => {
    const [copied, setCopied] = useState(false);
    const svgRef = useRef(null);

    const rawBarcode = explicitBarcode || 
        product?.barcode || 
        product?.rawProduct?.barcode || 
        product?.sku || 
        (product?.id ? `PROD-${product.id}` : '123456789012');
        
    const cleanBarcode = String(rawBarcode || '').trim();
    const productName = product?.name || product?.title || product?.item_name || 'Product Barcode';
    const productSku = product?.sku || product?.rawProduct?.sku || '';
    const productCategory = product?.category || 'General';
    const rawPrice = product?.price ?? product?.selling_price ?? product?.unit_price ?? null;
    const productPrice = (rawPrice !== null && rawPrice !== undefined && !isNaN(Number(rawPrice)))
        ? Number(rawPrice)
        : null;

    useEffect(() => {
        if (!isOpen || !svgRef.current || !cleanBarcode) return;
        try {
            JsBarcode(svgRef.current, cleanBarcode, {
                format: "CODE128",
                width: 2.1,
                height: 90,
                fontSize: 15,
                margin: 8,
                background: "#FFFFFF",
                lineColor: "#000000",
                displayValue: true
            });
        } catch {
            // Fallback: try default generic auto-format
            try {
                JsBarcode(svgRef.current, cleanBarcode, {
                    width: 2.1,
                    height: 90,
                    fontSize: 15,
                    margin: 8,
                    background: "#FFFFFF",
                    lineColor: "#000000",
                    displayValue: true
                });
            } catch {
                // Ignore rendering errors on invalid characters
            }
        }
    }, [isOpen, cleanBarcode]);

    if (!isOpen) return null;

    const handleCopy = () => {
        if (!cleanBarcode) return;
        navigator.clipboard.writeText(cleanBarcode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        const svgHtml = svgRef.current ? svgRef.current.outerHTML : '';
        if (!svgHtml) {
            alert('Barcode image is still preparing. Please try again.');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Barcode Label - ${productName}</title>
                    <style>
                        @page {
                            size: auto;
                            margin: 0;
                        }
                        * {
                            box-sizing: border-box;
                        }
                        body {
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            background: #FFFFFF;
                        }
                        .sticker {
                            width: 320px;
                            padding: 16px;
                            background: white;
                            border: 2px dashed #94A3B8;
                            border-radius: 12px;
                            text-align: center;
                            box-sizing: border-box;
                            margin: 0 auto;
                        }
                        .title {
                            font-size: 15px;
                            font-weight: 800;
                            color: #0F172A;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        .meta {
                            font-size: 11px;
                            font-weight: 600;
                            color: #64748B;
                            margin-bottom: 8px;
                        }
                        .price {
                            font-size: 16px;
                            font-weight: 900;
                            color: #166534;
                            margin-top: 6px;
                        }
                        .barcode-box {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .barcode-box svg {
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 0 auto;
                        }
                        @media print {
                            body {
                                background: white !important;
                                padding: 0 !important;
                            }
                            .sticker {
                                border: none !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                padding: 8px !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="sticker">
                        <div class="title">${productName}</div>
                        <div class="meta">${productCategory}${productSku ? ' • SKU: ' + productSku : ''}</div>
                        <div class="barcode-box">
                            ${svgHtml}
                        </div>
                        ${productPrice !== null ? `<div class="price">₹${productPrice.toFixed(2)}</div>` : ''}
                    </div>
                </body>
            </html>
        `;

        try {
            // Invisible print iframe guarantees that the browser print dialog opens directly
            // right in the active window without opening blank tabs or getting caught by popup blockers
            let printIframe = document.getElementById('barcode-print-frame');
            if (printIframe && printIframe.parentNode) {
                printIframe.parentNode.removeChild(printIframe);
            }
            printIframe = document.createElement('iframe');
            printIframe.id = 'barcode-print-frame';
            printIframe.style.position = 'fixed';
            printIframe.style.right = '0';
            printIframe.style.bottom = '0';
            printIframe.style.width = '0';
            printIframe.style.height = '0';
            printIframe.style.border = '0';
            document.body.appendChild(printIframe);

            const frameWindow = printIframe.contentWindow;
            const doc = frameWindow.document;
            doc.open();
            doc.write(printContent);
            doc.close();

            setTimeout(() => {
                try {
                    frameWindow.focus();
                    frameWindow.print();
                } catch (e) {
                    console.error('Iframe print error:', e);
                }
                setTimeout(() => {
                    try {
                        if (printIframe && printIframe.parentNode) {
                            printIframe.parentNode.removeChild(printIframe);
                        }
                    } catch (_) {}
                }, 3000);
            }, 300);
        } catch (iframeErr) {
            console.error('Iframe creation error, falling back to window.open:', iframeErr);
            const printWindow = window.open('', '_blank', 'width=650,height=550');
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => { printWindow.close(); }, 500);
                }, 300);
            }
        }
    };

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                backdropFilter: 'blur(6px)',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    background: '#FFFFFF',
                    width: '100%',
                    maxWidth: '460px',
                    borderRadius: '24px',
                    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#F0FDF4',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #BBF7D0'
                        }}>
                            <BarcodeIcon size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>Product Barcode</span>
                                <span style={{ fontSize: '0.62rem', fontWeight: '800', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                                    SCANNABLE
                                </span>
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
                                Scan directly on screen with barcode gun
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: '#F1F5F9',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    
                    {/* Product Summary Header */}
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
                            {productName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748B' }}>
                            <span>{productCategory}</span>
                            {productSku && (
                                <>
                                    <span>•</span>
                                    <span>SKU: <strong style={{ color: '#334155' }}>{productSku}</strong></span>
                                </>
                            )}
                            {productPrice !== null && (
                                <>
                                    <span>•</span>
                                    <span style={{ color: '#166534', fontWeight: '800' }}>₹{productPrice.toFixed(2)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* THE REAL SCANNABLE ZEBRA BARCODE CARD */}
                    <div 
                        style={{
                            width: '100%',
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            border: '2px solid #E2E8F0',
                            padding: '1.25rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            minHeight: '140px'
                        }}
                    >
                        <svg ref={svgRef} style={{ maxWidth: '100%' }} />

                        <div style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.72rem',
                            color: '#059669',
                            fontWeight: '750'
                        }}>
                            <Sparkles size={13} /> High-contrast CODE 128 format ready for hardware scanner guns
                        </div>
                    </div>

                    {/* Barcode Value Pill + Copy Button */}
                    <div style={{
                        width: '100%',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #E2E8F0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag size={16} color="#64748B" />
                            <div>
                                <div style={{ fontSize: '0.68rem', fontWeight: '750', color: '#94A3B8', textTransform: 'uppercase' }}>
                                    Barcode Value
                                </div>
                                <div style={{ fontSize: '0.92rem', fontWeight: '850', color: '#0F172A', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                    {cleanBarcode}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                border: '1px solid #CBD5E1',
                                background: copied ? '#DCFCE7' : '#FFFFFF',
                                color: copied ? '#166534' : '#334155',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #F1F5F9',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            background: '#FFFFFF',
                            color: '#475569',
                            fontWeight: '750',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        style={{
                            flex: 1.5,
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#166534',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(22, 101, 52, 0.25)'
                        }}
                    >
                        <Printer size={16} />
                        Print Label Sticker
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScannableBarcodeModal;

