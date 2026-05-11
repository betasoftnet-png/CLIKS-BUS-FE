import React, { useState, useRef } from 'react';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { 
    Printer, 
    Download, 
    Copy, 
    RotateCcw, 
    Settings2, 
    Type, 
    Scan,
    Layers,
    Share2
} from 'lucide-react';

const BusinessBarcode = () => {
    const [codeValue, setCodeValue] = useState('CLKS-1001-PROD');
    const [codeType, setCodeType] = useState('CODE128'); // 'QR' as alternate
    const [format, setFormat] = useState({
        width: 2,
        height: 100,
        fontSize: 16,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
        displayValue: true
    });
    const [copied, setCopied] = useState(false);

    const barcodeRef = useRef(null);

    const handleDownload = () => {
        const canvas = barcodeRef.current.querySelector('canvas');
        if (!canvas) {
            // Try SVG to Canvas for react-barcode
            const svg = barcodeRef.current.querySelector('svg');
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const img = new Image();
                const canvasConvert = document.createElement('canvas');
                const ctx = canvasConvert.getContext('2d');
                const svgSize = svg.getBoundingClientRect();
                canvasConvert.width = svgSize.width * 2;
                canvasConvert.height = svgSize.height * 2;
                
                img.onload = () => {
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvasConvert.width, canvasConvert.height);
                    ctx.drawImage(img, 0, 0, canvasConvert.width, canvasConvert.height);
                    const pngFile = canvasConvert.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `barcode-${codeValue}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                };
                img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                return;
            }
            return;
        }
        const link = document.createElement('a');
        link.download = `barcode-${codeValue}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const element = barcodeRef.current.innerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label: ${codeValue}</title>
                    <style>
                        body { display: flex; justify-content: center; align-items: center; height: 90vh; font-family: sans-serif; }
                        .print-container { text-align: center; padding: 20px; border: 1px solid #eee; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <h2>Product Label</h2>
                        ${element}
                    </div>
                    <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const updateFormat = (key, val) => {
        setFormat(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Barcode Generator</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Generate high-resolution product labels and QR codes instantly.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={handlePrint}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '600', cursor: 'pointer' }}>
                        <Printer size={18} />
                        Print View
                    </button>
                    <button 
                        onClick={handleDownload}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)' }}>
                        <Download size={18} />
                        Download PNG
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
                {/* Left Column: Settings & Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Step 1: Basic Details */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Scan size={18} />
                            </div>
                            <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Data Input</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Generation Format</label>
                                <select 
                                    value={codeType} 
                                    onChange={(e) => setCodeType(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                >
                                    <optgroup label="Barcodes">
                                        <option value="CODE128">Code 128 (Standard)</option>
                                        <option value="EAN13">EAN-13 (Retail)</option>
                                        <option value="UPC">UPC-A</option>
                                        <option value="CODE39">Code 39</option>
                                    </optgroup>
                                    <optgroup label="2D Codes">
                                        <option value="QR">QR Code</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Code Value (SKU/ID)</label>
                                <input 
                                    type="text" 
                                    value={codeValue}
                                    onChange={(e) => setCodeValue(e.target.value)}
                                    placeholder="Enter ID..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Styling Controls */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Settings2 size={18} />
                            </div>
                            <h3 style={{ fontWeight: '700', color: '#1e293b' }}>Dimensions & Styling</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Width Scale <span>{format.width}x</span>
                                </label>
                                <input 
                                    type="range" min="1" max="4" step="1" 
                                    value={format.width} 
                                    onChange={(e) => updateFormat('width', Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#1B6B3A' }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Height (px) <span>{format.height}px</span>
                                </label>
                                <input 
                                    type="range" min="20" max="200" step="10" 
                                    value={format.height} 
                                    onChange={(e) => updateFormat('height', Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#1B6B3A' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Font Size <span>{format.fontSize}px</span>
                                </label>
                                <input 
                                    type="range" min="8" max="32" step="1" 
                                    value={format.fontSize} 
                                    onChange={(e) => updateFormat('fontSize', Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#1B6B3A' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Text Label</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={format.displayValue} 
                                        onChange={(e) => updateFormat('displayValue', e.target.checked)} 
                                        id="displayVal"
                                        style={{ width: '18px', height: '18px', accentColor: '#1B6B3A' }}
                                    />
                                    <label htmlFor="displayVal" style={{ fontSize: '0.9rem', color: '#334155', cursor: 'pointer' }}>Display human readable text</label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Bar Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="color" value={format.lineColor} onChange={(e) => updateFormat('lineColor', e.target.value)} style={{ padding: 0, border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer' }} />
                                    <input type="text" value={format.lineColor} onChange={(e) => updateFormat('lineColor', e.target.value)} style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Background</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="color" value={format.background} onChange={(e) => updateFormat('background', e.target.value)} style={{ padding: 0, border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer' }} />
                                    <input type="text" value={format.background} onChange={(e) => updateFormat('background', e.target.value)} style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview Rendering Canvas */}
                <div style={{ position: 'sticky', top: '2rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                        <div style={{ borderBottom: '1px solid #f1f5f9', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Canvas</h4>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                            </div>
                        </div>

                        <div style={{ 
                            padding: '3rem 2rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            minHeight: '300px',
                            background: 'repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%) 50% / 20px 20px' 
                        }}>
                            <div 
                                ref={barcodeRef} 
                                style={{ 
                                    padding: '2rem', 
                                    background: 'white', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {codeType === 'QR' ? (
                                    <div style={{ background: format.background, padding: `${format.margin}px` }}>
                                        <QRCodeCanvas 
                                            value={codeValue || ' '} 
                                            size={format.height + 50} 
                                            bgColor={format.background}
                                            fgColor={format.lineColor}
                                            level={"H"}
                                        />
                                        {format.displayValue && (
                                            <div style={{ textAlign: 'center', marginTop: '8px', color: format.lineColor, fontSize: `${format.fontSize}px`, fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {codeValue}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Barcode 
                                        value={codeValue || ' '}
                                        format={codeType}
                                        width={format.width}
                                        height={format.height}
                                        displayValue={format.displayValue}
                                        fontSize={format.fontSize}
                                        background={format.background}
                                        lineColor={format.lineColor}
                                        margin={format.margin}
                                    />
                                )}
                            </div>
                            
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    Format: {codeType === 'QR' ? 'QR Code V2' : codeType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tip Card */}
                    <div style={{ marginTop: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                        <div style={{ color: '#3b82f6', marginTop: '2px' }}><Settings2 size={18} /></div>
                        <div>
                            <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#1d4ed8' }}>Pro Tip</h5>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#1e40af', lineHeight: '1.4' }}>Ensure contrast ratio between Bar color and Background is high to guarantee successful optical scans.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessBarcode;
