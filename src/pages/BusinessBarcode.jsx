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
    Share2,
    Plus,
    Trash2,
    Layout,
    Check,
    Grid,
    List,
    Tag,
    Box,
    Sparkles
} from 'lucide-react';
import { useCurrency } from '../context';

const CANVAS_PRESETS = [
    {
        id: 'standard',
        name: 'Standard Retail Label',
        desc: 'Balanced product label with header, multi-field grid, barcode & price tag',
        icon: Layout,
        defaultType: 'CODE128'
    },
    {
        id: 'logistics',
        name: 'Logistics & Asset Badge',
        desc: 'Bold SKU header, prominent barcode, and 2-column specifications table',
        icon: Box,
        defaultType: 'CODE128'
    },
    {
        id: 'qr_tag',
        name: 'QR Code Spec Tag',
        desc: 'Side-by-side high density QR code with comprehensive custom attributes list',
        icon: Scan,
        defaultType: 'QR'
    },
    {
        id: 'compact',
        name: 'Compact Price Sticker',
        desc: 'Clean minimal sticker focused on product title, barcode and price tag',
        icon: Tag,
        defaultType: 'CODE128'
    },
    {
        id: 'jewelry',
        name: 'Jewelry & Small Item Tag',
        desc: 'Ultra-compact dual column format ideal for small items, rings and accessories',
        icon: Sparkles,
        defaultType: 'CODE128'
    }
];

const PRESET_ATTRIBUTE_PILLS = [
    { key: 'Exp Date', value: '12/2026' },
    { key: 'Weight', value: '500g' },
    { key: 'Batch No', value: 'B-2026-X' },
    { key: 'Material', value: '100% Cotton' },
    { key: 'Serial No', value: 'SN-90421' },
    { key: 'MRP', value: '₹ 1299.00' },
    { key: 'Mfg Date', value: '01/2026' },
    { key: 'Origin', value: 'India' }
];

const BusinessBarcode = () => {
    const { currency } = useCurrency();
    const [selectedPreset, setSelectedPreset] = useState('standard');
    const [codeValue, setCodeValue] = useState('CLKS-1001-PROD');
    const [codeType, setCodeType] = useState('CODE128'); // 'QR' as alternate
    const [encodeCustomData, setEncodeCustomData] = useState(false);
    
    const [format, setFormat] = useState({
        width: 2,
        height: 90,
        fontSize: 15,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
        displayValue: true
    });

    const [labelDetails, setLabelDetails] = useState({
        title: 'Premium Cotton Shirt',
        subtitle: 'Size: L | Color: Navy',
        price: `${currency?.symbol || '₹'} 999.00`
    });

    const [customFieldsLayout, setCustomFieldsLayout] = useState('grid'); // 'grid', 'list'

    const [customFields, setCustomFields] = useState([
        { id: 1, key: 'Exp Date', value: '12/2026' },
        { id: 2, key: 'Weight', value: '500g' },
        { id: 3, key: 'Batch No', value: 'B-2026-X' }
    ]);

    const barcodeRef = useRef(null);

    // Compute effective code payload (either raw SKU or combined attributes if checked)
    const getEffectivePayload = () => {
        if (!encodeCustomData) return codeValue || ' ';
        const validFields = customFields.filter(f => f.key.trim() || f.value.trim());
        if (validFields.length === 0) return codeValue || ' ';
        
        const payloadObj = {
            sku: codeValue,
            title: labelDetails.title,
            price: labelDetails.price,
            attributes: validFields.reduce((acc, f) => {
                if (f.key) acc[f.key] = f.value;
                return acc;
            }, {})
        };
        return JSON.stringify(payloadObj);
    };

    const handleSelectPreset = (preset) => {
        setSelectedPreset(preset.id);
        if (preset.defaultType) {
            setCodeType(preset.defaultType);
        }
        if (preset.id === 'compact') {
            setFormat(prev => ({ ...prev, height: 65, fontSize: 13 }));
        } else if (preset.id === 'qr_tag') {
            setFormat(prev => ({ ...prev, height: 110, fontSize: 14 }));
        } else {
            setFormat(prev => ({ ...prev, height: 90, fontSize: 15 }));
        }
    };

    const handleDownload = () => {
        if (!barcodeRef.current) return;

        // Try SVG to Canvas for react-barcode or direct canvas
        const canvas = barcodeRef.current.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `label-${codeValue}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            return;
        }

        const svg = barcodeRef.current.querySelector('svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            const canvasConvert = document.createElement('canvas');
            const ctx = canvasConvert.getContext('2d');
            const svgSize = svg.getBoundingClientRect();
            canvasConvert.width = (svgSize.width || 300) * 2;
            canvasConvert.height = (svgSize.height || 150) * 2;

            img.onload = () => {
                ctx.fillStyle = format.background;
                ctx.fillRect(0, 0, canvasConvert.width, canvasConvert.height);
                ctx.drawImage(img, 0, 0, canvasConvert.width, canvasConvert.height);
                const pngFile = canvasConvert.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `barcode-${codeValue}.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }
    };

    const handlePrint = () => {
        if (!barcodeRef.current) return;
        const printWindow = window.open('', '_blank');
        const elementHTML = barcodeRef.current.outerHTML;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label: ${codeValue}</title>
                    <style>
                        body { 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0;
                            background: #f8fafc;
                            font-family: 'Inter', system-ui, sans-serif; 
                        }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    </style>
                </head>
                <body>
                    ${elementHTML}
                    <script>
                        setTimeout(() => { 
                            window.print(); 
                            window.close(); 
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const updateFormat = (key, val) => {
        setFormat(prev => ({ ...prev, [key]: val }));
    };

    const updateLabelDetails = (key, val) => {
        setLabelDetails(prev => ({ ...prev, [key]: val }));
    };

    const addCustomField = (presetKey = '', presetValue = '') => {
        if (customFields.length >= 25) return;
        setCustomFields(prev => {
            if (prev.length >= 25) return prev;
            return [...prev, { 
                id: Date.now() + Math.random(), 
                key: presetKey, 
                value: presetValue 
            }];
        });
    };

    const removeCustomField = (id) => {
        setCustomFields(prev => prev.filter(f => f.id !== id));
    };

    const updateCustomField = (id, prop, val) => {
        setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [prop]: val } : f));
    };

    // Valid custom fields with non-empty key or value
    const activeCustomFields = customFields.filter(f => f.key.trim() !== '' || f.value.trim() !== '');

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Barcode Generator</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Generate high-resolution product labels, QR codes & multi-attribute tags instantly.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={handlePrint}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: '700', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <Printer size={18} />
                        Print View
                    </button>
                    <button 
                        onClick={handleDownload}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(27, 107, 58, 0.25)' }}>
                        <Download size={18} />
                        Download PNG
                    </button>
                </div>
            </div>

            {/* Presets List Selector Bar ("Canvas Layout Selector") */}
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Layout size={18} color="#10b981" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Select Canvas Label Preset Layout</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '20px', marginLeft: 'auto' }}>
                        {CANVAS_PRESETS.length} Canvas Templates Available
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    {CANVAS_PRESETS.map((preset) => {
                        const IconComp = preset.icon;
                        const isSelected = selectedPreset === preset.id;
                        return (
                            <div 
                                key={preset.id}
                                onClick={() => handleSelectPreset(preset)}
                                style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: '12px',
                                    border: isSelected ? '2px solid #1B6B3A' : '1px solid #e2e8f0',
                                    background: isSelected ? '#F0FDF4' : '#fafafa',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.35rem',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isSelected ? '#1B6B3A' : '#e2e8f0', color: isSelected ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <IconComp size={15} />
                                        </div>
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem', color: isSelected ? '#1B6B3A' : '#1e293b' }}>{preset.name}</span>
                                    </div>
                                    {isSelected && (
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#1B6B3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.73rem', color: '#64748b', lineHeight: '1.3' }}>{preset.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 440px', gap: '1.75rem', alignItems: 'start' }}>
                
                {/* Left Column: Settings & Data Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Data Input Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Scan size={18} />
                            </div>
                            <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', margin: 0 }}>Data Input & Format</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Generation Format</label>
                                <select 
                                    value={codeType} 
                                    onChange={(e) => setCodeType(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', fontSize: '0.88rem' }}
                                >
                                    <optgroup label="Barcodes">
                                        <option value="CODE128">Code 128 (Standard)</option>
                                        <option value="EAN13">EAN-13 (Retail)</option>
                                        <option value="UPC">UPC-A</option>
                                        <option value="CODE39">Code 39</option>
                                    </optgroup>
                                    <optgroup label="2D Codes">
                                        <option value="QR">QR Code (High Density)</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Code Value (SKU / ID)</label>
                                <input 
                                    type="text" 
                                    value={codeValue}
                                    onChange={(e) => setCodeValue(e.target.value)}
                                    placeholder="Enter Product SKU/ID..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600', fontSize: '0.88rem' }}
                                />
                            </div>
                        </div>

                        {/* Encode Full Custom Data Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <input 
                                type="checkbox"
                                id="encodeDataToggle"
                                checked={encodeCustomData}
                                onChange={(e) => setEncodeCustomData(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                            />
                            <label htmlFor="encodeDataToggle" style={{ fontSize: '0.83rem', fontWeight: '700', color: '#334155', cursor: 'pointer' }}>
                                Encode Title, Price & Custom Attributes directly inside QR/Barcode payload
                            </label>
                        </div>
                    </div>

                    {/* Label Content & Multiple Custom Keys Assignment Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Type size={18} />
                            </div>
                            <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', margin: 0 }}>Label Print Information</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Product Title / Name</label>
                                <input 
                                    type="text" 
                                    value={labelDetails.title}
                                    onChange={(e) => updateLabelDetails('title', e.target.value)}
                                    placeholder="Product Title"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Description / Variation</label>
                                    <input 
                                        type="text" 
                                        value={labelDetails.subtitle}
                                        onChange={(e) => updateLabelDetails('subtitle', e.target.value)}
                                        placeholder="e.g., Color / Batch"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Price Tag</label>
                                    <input 
                                        type="text" 
                                        value={labelDetails.price}
                                        onChange={(e) => updateLabelDetails('price', e.target.value)}
                                        placeholder="e.g., ₹ 999.00"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Multiple Custom Keys & Values Section */}
                        <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                        Custom Keys & Values ({activeCustomFields.length} Assigned)
                                    </label>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assign multiple custom attributes to render on the barcode canvas.</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {/* Layout Mode Switcher */}
                                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                                        <button 
                                            title="2-Column Grid Layout"
                                            onClick={() => setCustomFieldsLayout('grid')}
                                            style={{ border: 'none', background: customFieldsLayout === 'grid' ? 'white' : 'transparent', color: customFieldsLayout === 'grid' ? '#1B6B3A' : '#64748b', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <Grid size={14} />
                                        </button>
                                        <button 
                                            title="Stacked List Layout"
                                            onClick={() => setCustomFieldsLayout('list')}
                                            style={{ border: 'none', background: customFieldsLayout === 'list' ? 'white' : 'transparent', color: customFieldsLayout === 'list' ? '#1B6B3A' : '#64748b', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            <List size={14} />
                                        </button>
                                    </div>
                                    <button 
                                        disabled={customFields.length >= 25}
                                        onClick={() => addCustomField()}
                                        style={{ 
                                            background: customFields.length >= 25 ? '#94A3B8' : '#1B6B3A', 
                                            border: 'none', 
                                            color: 'white', 
                                            fontWeight: '700', 
                                            fontSize: '0.78rem', 
                                            cursor: customFields.length >= 25 ? 'not-allowed' : 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '4px', 
                                            padding: '6px 12px', 
                                            borderRadius: '8px', 
                                            boxShadow: customFields.length >= 25 ? 'none' : '0 2px 6px rgba(27, 107, 58, 0.2)',
                                            opacity: customFields.length >= 25 ? 0.65 : 1
                                        }}
                                        title={customFields.length >= 25 ? 'Maximum limit of 25 key-value pairs reached' : 'Add Key-Value'}
                                    >
                                        <Plus size={14} /> Add Key-Value
                                    </button>
                                </div>
                            </div>

                            {/* Preset Attribute Pills */}
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8' }}>Quick Add:</span>
                                {PRESET_ATTRIBUTE_PILLS.map((pill, idx) => (
                                    <button
                                        key={idx}
                                        disabled={customFields.length >= 25}
                                        onClick={() => addCustomField(pill.key, pill.value)}
                                        style={{
                                            background: customFields.length >= 25 ? '#f1f5f9' : '#f0fdf4',
                                            border: '1px solid #dcf2e4',
                                            color: customFields.length >= 25 ? '#94a3b8' : '#166534',
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            cursor: customFields.length >= 25 ? 'not-allowed' : 'pointer',
                                            opacity: customFields.length >= 25 ? 0.6 : 1,
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            if (customFields.length < 25) e.currentTarget.style.background = '#dcf2e4';
                                        }}
                                        onMouseOut={(e) => {
                                            if (customFields.length < 25) e.currentTarget.style.background = '#f0fdf4';
                                        }}
                                    >
                                        + {pill.key}
                                    </button>
                                ))}
                            </div>

                            {/* Dynamic Custom Key-Value Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {customFields.map((field) => (
                                    <div key={field.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Key (e.g., Weight)" 
                                            value={field.key} 
                                            onChange={(e) => updateCustomField(field.id, 'key', e.target.value)}
                                            style={{ flex: '1', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Value (e.g., 500g)" 
                                            value={field.value} 
                                            onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                            style={{ flex: '1.5', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                        />
                                        <button 
                                            onClick={() => removeCustomField(field.id)}
                                            style={{ background: '#fef2f2', border: 'none', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                                            title="Delete Field"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {customFields.length === 0 && (
                                    <div style={{ textAlign: 'center', fontSize: '0.83rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                                        No custom keys assigned yet. Click 'Add Key-Value' or quick-add presets above.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Styling Controls Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Settings2 size={18} />
                            </div>
                            <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', margin: 0 }}>Dimensions & Styling</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
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
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Height (px) <span>{format.height}px</span>
                                </label>
                                <input 
                                    type="range" min="30" max="200" step="5" 
                                    value={format.height} 
                                    onChange={(e) => updateFormat('height', Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#1B6B3A' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
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
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Text Label</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={format.displayValue} 
                                        onChange={(e) => updateFormat('displayValue', e.target.checked)} 
                                        id="displayVal"
                                        style={{ width: '18px', height: '18px', accentColor: '#1B6B3A' }}
                                    />
                                    <label htmlFor="displayVal" style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>Show code value text</label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Bar / QR Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="color" value={format.lineColor} onChange={(e) => updateFormat('lineColor', e.target.value)} style={{ padding: 0, border: 'none', width: '34px', height: '34px', borderRadius: '6px', cursor: 'pointer' }} />
                                    <input type="text" value={format.lineColor} onChange={(e) => updateFormat('lineColor', e.target.value)} style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Background Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="color" value={format.background} onChange={(e) => updateFormat('background', e.target.value)} style={{ padding: 0, border: 'none', width: '34px', height: '34px', borderRadius: '6px', cursor: 'pointer' }} />
                                    <input type="text" value={format.background} onChange={(e) => updateFormat('background', e.target.value)} style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.85rem', fontWeight: '600' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Preview Canvas */}
                <div style={{ position: 'sticky', top: '1.5rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)' }}>
                        
                        {/* Canvas Header */}
                        <div style={{ borderBottom: '1px solid #f1f5f9', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>LIVE CANVAS</h4>
                                <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#334155', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                                    {CANVAS_PRESETS.find(p => p.id === selectedPreset)?.name}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                            </div>
                        </div>

                        {/* Live Canvas Content Rendering Body */}
                        <div style={{ 
                            padding: '2.5rem 1.5rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            minHeight: '340px',
                            background: 'repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%) 50% / 20px 20px' 
                        }}>
                            {/* Dynamic Canvas Container matching selected preset */}
                            <div 
                                ref={barcodeRef} 
                                style={{ 
                                    padding: '1.75rem 1.5rem', 
                                    background: format.background, 
                                    borderRadius: '12px', 
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: format.lineColor,
                                    width: selectedPreset === 'jewelry' ? '280px' : '360px',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    border: '1px solid #e2e8f0'
                                }}
                            >
                                {/* Preset Layout Variations */}
                                {selectedPreset === 'logistics' && (
                                    <div style={{ width: '100%', borderBottom: `2px solid ${format.lineColor}`, paddingBottom: '0.4rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.05em' }}>SKU: {codeValue}</span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', background: format.lineColor, color: format.background, padding: '2px 6px', borderRadius: '4px' }}>LOGISTICS</span>
                                    </div>
                                )}

                                {/* Label Titles */}
                                {labelDetails.title && (
                                    <div style={{ fontSize: selectedPreset === 'compact' ? '1rem' : '1.15rem', fontWeight: '900', marginBottom: '0.15rem', letterSpacing: '0.01em', textAlign: 'center', textTransform: 'uppercase' }}>
                                        {labelDetails.title}
                                    </div>
                                )}

                                {labelDetails.subtitle && (
                                    <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
                                        {labelDetails.subtitle}
                                    </div>
                                )}

                                {/* Multi Custom Keys & Values Rendering */}
                                {activeCustomFields.length > 0 && (
                                    <div style={{ 
                                        width: '100%', 
                                        marginBottom: '0.85rem',
                                        padding: '0.5rem',
                                        background: 'rgba(0,0,0,0.02)',
                                        borderRadius: '6px'
                                    }}>
                                        {customFieldsLayout === 'grid' ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: activeCustomFields.length > 1 ? '1fr 1fr' : '1fr', gap: '0.35rem 0.75rem', fontSize: '0.74rem' }}>
                                                {activeCustomFields.map((field) => (
                                                    <div key={field.id} style={{ display: 'flex', gap: '4px', overflow: 'hidden' }}>
                                                        {field.key && <span style={{ fontWeight: '800' }}>{field.key}:</span>}
                                                        {field.value && <span style={{ opacity: 0.9, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{field.value}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.74rem', alignItems: 'center' }}>
                                                {activeCustomFields.map((field) => (
                                                    <div key={field.id} style={{ display: 'flex', gap: '4px' }}>
                                                        {field.key && <span style={{ fontWeight: '800' }}>{field.key}:</span>}
                                                        {field.value && <span>{field.value}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Barcode Graphic / QR Rendering */}
                                {selectedPreset === 'qr_tag' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.5rem 0' }}>
                                        <QRCodeCanvas 
                                            value={getEffectivePayload()} 
                                            size={format.height + 20} 
                                            bgColor={format.background}
                                            fgColor={format.lineColor}
                                            level={"H"}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', flex: 1 }}>
                                            <span style={{ fontWeight: '900', fontFamily: 'monospace', fontSize: '0.85rem' }}>{codeValue}</span>
                                            {encodeCustomData && (
                                                <span style={{ fontSize: '0.68rem', color: '#1B6B3A', fontWeight: '700' }}>✓ Encoded Payload</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        {codeType === 'QR' ? (
                                            <div style={{ padding: `${format.margin}px`, textAlign: 'center' }}>
                                                <QRCodeCanvas 
                                                    value={getEffectivePayload()} 
                                                    size={format.height + 30} 
                                                    bgColor={format.background}
                                                    fgColor={format.lineColor}
                                                    level={"H"}
                                                />
                                                {format.displayValue && (
                                                    <div style={{ textAlign: 'center', marginTop: '6px', color: format.lineColor, fontSize: `${format.fontSize}px`, fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                        {codeValue}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <Barcode 
                                                value={getEffectivePayload()}
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
                                )}

                                {/* Price Tag */}
                                {labelDetails.price && (
                                    <div style={{ 
                                        marginTop: '0.75rem', 
                                        fontSize: '1.2rem', 
                                        fontWeight: '900', 
                                        borderTop: `1px solid ${format.lineColor}`, 
                                        paddingTop: '0.4rem', 
                                        width: '100%', 
                                        textAlign: 'center',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {labelDetails.price}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '1.75rem', textAlign: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    Format: {codeType === 'QR' ? 'QR Code 2D' : codeType}
                                </span>
                                {encodeCustomData && (
                                    <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#166534', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                        Attributes Encoded
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div style={{ marginTop: '1.25rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                        <div style={{ color: '#3b82f6', marginTop: '2px' }}><Settings2 size={18} /></div>
                        <div>
                            <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1d4ed8' }}>Pro Labeling Tip</h5>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#1e40af', lineHeight: '1.4' }}>
                                Switch Canvas Label Presets at top to instantly test retail price tags, logistics badges, or QR spec sheets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessBarcode;
