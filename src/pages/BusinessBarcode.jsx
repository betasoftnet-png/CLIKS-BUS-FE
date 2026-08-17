import React, { useState, useRef, useEffect } from 'react';
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
    Sparkles,
    Upload,
    FileSpreadsheet,
    Palette,
    Award,
    Image as ImageIcon,
    PackageCheck,
    X,
    Percent,
    ChevronDown
} from 'lucide-react';
import { useCurrency } from '../context';
import { stockService } from '../services';

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
    },
    {
        id: 'custom',
        name: 'Custom Template',
        desc: 'Fully personalized layout with store logo, custom badge, border & discount styling',
        icon: Palette,
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

const BADGE_OPTIONS = [
    { id: 'none', label: 'None' },
    { id: 'made_in_india', label: 'Made in India 🇮🇳' },
    { id: 'eco_friendly', label: 'Eco-Friendly 🌿' },
    { id: 'quality_checked', label: 'Quality Checked 🔒' },
    { id: 'organic', label: 'Organic 🍃' },
    { id: 'genuine', label: '100% Genuine ⭐' }
];

const BusinessBarcode = () => {
    const { currency } = useCurrency();
    const [selectedPreset, setSelectedPreset] = useState('standard');
    const [codeValue, setCodeValue] = useState('CLKS-1001-PROD');
    const [codeType, setCodeType] = useState('CODE128'); // 'QR' as alternate
    const [encodeCustomData, setEncodeCustomData] = useState(false);
    
    // Inventory Stock Products integration
    const [stockProducts, setStockProducts] = useState([]);
    const [selectedStockId, setSelectedStockId] = useState('');

    const [format, setFormat] = useState({
        width: 2,
        height: 90,
        fontSize: 15,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
        borderColor: '#e2e8f0',
        displayValue: true
    });

    const [labelDetails, setLabelDetails] = useState({
        title: 'Premium Cotton Shirt',
        subtitle: 'Size: L | Color: Navy',
        price: '999.00',
        mrp: '1299.00',
        currencySymbol: currency?.symbol || '₹'
    });

    // Branding & Icon options
    const [logoUrl, setLogoUrl] = useState('');
    const [selectedBadge, setSelectedBadge] = useState('made_in_india');

    const [customFieldsLayout, setCustomFieldsLayout] = useState('grid'); // 'grid', 'list'

    // Interactive Product Dropdown state & ref
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const productDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
                setIsProductDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [customFields, setCustomFields] = useState([
        { id: 1, key: 'Exp Date', value: '12/2026' },
        { id: 2, key: 'Weight', value: '500g' },
        { id: 3, key: 'Batch No', value: 'B-2026-X' }
    ]);

    // Bulk CSV State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkItems, setBulkItems] = useState([]);
    const bulkFileRef = useRef(null);

    const barcodeRef = useRef(null);
    const bulkPrintRef = useRef(null);

    // Fetch Stock Products for barcode generation
    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const res = await stockService.getStocks();
                const items = Array.isArray(res) ? res : (res?.data || []);
                setStockProducts(items);
            } catch (err) {
                console.error('[Barcode Gen] Error loading stock products:', err);
            }
        };
        fetchStocks();
    }, []);

    // Auto-fill when stock product selected
    const handleSelectStockProduct = (id) => {
        setSelectedStockId(id);
        if (!id) return;
        const prod = stockProducts.find(p => String(p.id) === String(id));
        if (prod) {
            const skuVal = prod.sku || prod.code || prod.barcode || `SKU-${prod.id}`;
            const titleVal = prod.name || prod.title || 'Stock Item';
            const subVal = prod.category || prod.variation || prod.unit ? `Category: ${prod.category || 'General'} | ${prod.unit || 'Pcs'}` : '';
            const priceVal = String(prod.selling_price || prod.price || prod.rate || '0.00');
            const mrpVal = String(prod.mrp || prod.original_price || (parseFloat(priceVal) * 1.25).toFixed(2));

            setCodeValue(skuVal);
            setLabelDetails(prev => ({
                ...prev,
                title: titleVal,
                subtitle: subVal,
                price: priceVal,
                mrp: mrpVal
            }));

            // Auto populate key fields if present
            const newFields = [];
            if (prod.batch_no) newFields.push({ id: 1, key: 'Batch No', value: String(prod.batch_no) });
            if (prod.exp_date) newFields.push({ id: 2, key: 'Exp Date', value: String(prod.exp_date) });
            if (prod.mfg_date) newFields.push({ id: 3, key: 'Mfg Date', value: String(prod.mfg_date) });
            if (prod.origin) newFields.push({ id: 4, key: 'Origin', value: String(prod.origin) });
            if (newFields.length > 0) setCustomFields(newFields);
        }
    };

    // Input sanitization to prevent letter/number mismatch glitch
    const sanitizePrice = (val) => {
        // Strip out non-numeric characters except decimals and numbers
        const clean = val.replace(/[^0-9.]/g, '');
        const parts = clean.split('.');
        if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
        return clean;
    };

    // Compute effective code payload
    const getEffectivePayload = () => {
        if (!encodeCustomData) return codeValue || ' ';
        const validFields = customFields.filter(f => f.key.trim() || f.value.trim());
        if (validFields.length === 0) return codeValue || ' ';
        
        const payloadObj = {
            sku: codeValue,
            title: labelDetails.title,
            price: labelDetails.price,
            mrp: labelDetails.mrp,
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
        } else if (preset.id === 'custom') {
            setFormat(prev => ({ ...prev, height: 95, fontSize: 16, borderColor: '#1B6B3A' }));
        } else {
            setFormat(prev => ({ ...prev, height: 90, fontSize: 15 }));
        }
    };

    const handleDownload = () => {
        if (!barcodeRef.current) return;

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

    // Single stretch delete all custom key-value pairs
    const clearAllCustomFields = () => {
        setCustomFields([]);
    };

    const updateCustomField = (id, prop, val) => {
        setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [prop]: val } : f));
    };

    // Logo upload handler
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setLogoUrl(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Bulk CSV parsing & upload
    const handleBulkCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) {
                alert('Invalid CSV file format.');
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const items = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
                if (cols.length >= 2) {
                    items.push({
                        title: cols[0] || 'Product',
                        sku: cols[1] || `SKU-${i}`,
                        price: cols[2] || '999.00',
                        mrp: cols[3] || '1299.00',
                        subtitle: cols[4] || ''
                    });
                }
            }
            setBulkItems(items);
            alert(`Successfully loaded ${items.length} product records from CSV!`);
        };
        reader.readAsText(file);
    };

    const downloadSampleCsv = () => {
        const csvContent = "Title,SKU,Price,MRP,Subtitle\nPremium Cotton Shirt,CLKS-1001-PROD,999.00,1299.00,Size: L | Color: Navy\nOrganic Green Tea,CLKS-1002-TEA,299.00,399.00,Pack of 500g\nWireless Earbuds,CLKS-1003-AUDIO,1499.00,1999.00,Bluetooth 5.3";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'sample_barcode_products.csv');
        link.click();
    };

    const handleBatchPrint = () => {
        if (bulkItems.length === 0) return;
        const printWindow = window.open('', '_blank');
        const itemsHtml = bulkItems.map(item => `
            <div style="border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; text-align: center; background: white; page-break-inside: avoid;">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${item.title}</div>
                <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${item.subtitle}</div>
                <div style="margin: 8px 0; font-family: monospace; font-weight: bold;">*${item.sku}*</div>
                <div style="font-size: 13px; font-weight: bold;">
                    <span style="text-decoration: line-through; color: #94a3b8; margin-right: 6px;">₹${item.mrp}</span>
                    <span style="color: #166534;">₹${item.price}</span>
                </div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Batch Print Barcodes (${bulkItems.length} Products)</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; background: #f8fafc; }
                        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                        @media print { body { padding: 0; background: white; } }
                    </style>
                </head>
                <body>
                    <h3 style="text-align: center; margin-bottom: 20px;">CLIKS Product Barcode Batch (${bulkItems.length} Labels)</h3>
                    <div class="grid">${itemsHtml}</div>
                    <script>
                        setTimeout(() => { window.print(); window.close(); }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const activeCustomFields = customFields.filter(f => f.key.trim() !== '' || f.value.trim() !== '');

    // Calculate discount percent
    const numPrice = parseFloat(labelDetails.price) || 0;
    const numMrp = parseFloat(labelDetails.mrp) || 0;
    const discountPct = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation & Actions Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Barcode Generator</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Generate high-resolution product labels, QR codes & multi-attribute tags instantly.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => setIsBulkModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid #1B6B3A', background: '#E8F5EE', color: '#1B6B3A', fontWeight: '750', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <FileSpreadsheet size={18} />
                        Bulk CSV Upload ({bulkItems.length})
                    </button>
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
                            <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', margin: 0 }}>Label Print Information & Pricing</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div ref={productDropdownRef} style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Product Title / Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        value={labelDetails.title}
                                        onClick={() => setIsProductDropdownOpen(true)}
                                        onFocus={() => setIsProductDropdownOpen(true)}
                                        onChange={(e) => {
                                            updateLabelDetails('title', e.target.value);
                                            setIsProductDropdownOpen(true);
                                            const matched = stockProducts.find(p => (p.name || p.title || '').toLowerCase().trim() === e.target.value.toLowerCase().trim());
                                            if (matched) {
                                                handleSelectStockProduct(matched.id);
                                            }
                                        }}
                                        placeholder="Enter or select product title..."
                                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                    <div 
                                        onClick={() => setIsProductDropdownOpen(prev => !prev)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                                    >
                                        <ChevronDown size={18} />
                                    </div>
                                </div>

                                {/* DROPDOWN POPUP LIST FOR EXISTING INVENTORY PRODUCTS */}
                                {isProductDropdownOpen && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '100%', 
                                        left: 0, 
                                        right: 0, 
                                        marginTop: '4px', 
                                        background: 'white', 
                                        borderRadius: '10px', 
                                        border: '1px solid #CBD5E1', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.12)', 
                                        zIndex: 100, 
                                        maxHeight: '220px', 
                                        overflowY: 'auto' 
                                    }}>
                                        {stockProducts
                                            .filter(prod => {
                                                const q = (labelDetails.title || '').toLowerCase().trim();
                                                if (!q) return true;
                                                return (prod.name || prod.title || '').toLowerCase().includes(q) || (prod.sku || prod.code || '').toLowerCase().includes(q);
                                            })
                                            .map(prod => (
                                                <div 
                                                    key={prod.id}
                                                    onClick={() => {
                                                        handleSelectStockProduct(prod.id);
                                                        setIsProductDropdownOpen(false);
                                                    }}
                                                    style={{ 
                                                        padding: '0.65rem 0.9rem', 
                                                        cursor: 'pointer', 
                                                        borderBottom: '1px solid #F1F5F9',
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center',
                                                        transition: 'background 0.15s'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#F0FDF4'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'white'}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: '750', fontSize: '0.88rem', color: '#0F172A' }}>{prod.name || prod.title}</div>
                                                        <div style={{ fontSize: '0.73rem', color: '#64748B' }}>SKU: {prod.sku || prod.code || prod.id}</div>
                                                    </div>
                                                    <div style={{ fontWeight: '850', fontSize: '0.88rem', color: '#1B6B3A' }}>
                                                        ₹{prod.selling_price || prod.price || 0}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                        {stockProducts.length === 0 && (
                                            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                                                No inventory products found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Description / Variation</label>
                                <input 
                                    type="text" 
                                    value={labelDetails.subtitle}
                                    onChange={(e) => updateLabelDetails('subtitle', e.target.value)}
                                    placeholder="e.g., Size: L | Color: Navy"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                />
                            </div>

                            {/* PRICE TAG & ORIGINAL MRP WITH SANITIZATION TO PREVENT ALPHANUMERIC MISMATCH */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Offer Price ({labelDetails.currencySymbol})</label>
                                    <input 
                                        type="text" 
                                        value={labelDetails.price}
                                        onChange={(e) => updateLabelDetails('price', sanitizePrice(e.target.value))}
                                        placeholder="e.g., 999.00"
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', fontWeight: '800', fontSize: '0.95rem', color: '#1B6B3A' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Original MRP ({labelDetails.currencySymbol})</label>
                                    <input 
                                        type="text" 
                                        value={labelDetails.mrp}
                                        onChange={(e) => updateLabelDetails('mrp', sanitizePrice(e.target.value))}
                                        placeholder="e.g., 1299.00"
                                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', fontWeight: '700', fontSize: '0.95rem', color: '#475569' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BRAND LOGO & BADGE SELECTOR SECTION */}
                        <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.03em' }}>
                                🏷️ Brand Store Logo & Quality Badge
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem' }}>Upload Store Logo</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        style={{ fontSize: '0.78rem', width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem' }}>Tag Badge Icon</label>
                                    <select 
                                        value={selectedBadge}
                                        onChange={(e) => setSelectedBadge(e.target.value)}
                                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '700', fontSize: '0.82rem' }}
                                    >
                                        {BADGE_OPTIONS.map(b => (
                                            <option key={b.id} value={b.id}>{b.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Multiple Custom Keys & Values Section */}
                        <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                        Custom Keys & Values ({activeCustomFields.length} / 25 Assigned)
                                    </label>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assign multiple custom attributes to render on the barcode canvas.</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {/* SINGLE STRETCH CLEAR ALL BUTTON */}
                                    {customFields.length > 0 && (
                                        <button 
                                            onClick={clearAllCustomFields}
                                            style={{ 
                                                background: '#FEF2F2', 
                                                border: '1px solid #FEE2E2', 
                                                color: '#EF4444', 
                                                fontWeight: '800', 
                                                fontSize: '0.75rem', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '4px', 
                                                padding: '6px 10px', 
                                                borderRadius: '8px' 
                                            }}
                                            title="Delete all key-value entries at a single stretch"
                                        >
                                            <Trash2 size={13} /> Clear All ({customFields.length})
                                        </button>
                                    )}

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
                            <h3 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', margin: 0 }}>Dimensions & Custom Canvas Styling</h3>
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
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>Background Tint</label>
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
                                    borderRadius: '16px', 
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: format.lineColor,
                                    width: selectedPreset === 'jewelry' ? '280px' : '360px',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    border: `2px solid ${format.borderColor || '#e2e8f0'}`,
                                    position: 'relative'
                                }}
                            >
                                {/* LOGO DISPLAY */}
                                {logoUrl && (
                                    <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                                        <img src={logoUrl} alt="Store Logo" style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }} />
                                    </div>
                                )}

                                {/* QUALITY BADGE DISPLAY */}
                                {selectedBadge && selectedBadge !== 'none' && (
                                    <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '0.65rem', fontWeight: '800', background: '#F0FDF4', color: '#166534', border: '1px solid #DCF2E4', padding: '2px 6px', borderRadius: '6px' }}>
                                        {BADGE_OPTIONS.find(b => b.id === selectedBadge)?.label}
                                    </div>
                                )}

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

                                {/* DISCOUNT & STRIKETHROUGH MRP PRICE TAG RENDERING */}
                                {labelDetails.price && (
                                    <div style={{ 
                                        marginTop: '0.75rem', 
                                        borderTop: `1px solid ${format.lineColor}`, 
                                        paddingTop: '0.4rem', 
                                        width: '100%', 
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                            {/* Original MRP Strikethrough Display */}
                                            {numMrp > numPrice && (
                                                <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.95rem', fontWeight: '700' }}>
                                                    {labelDetails.currencySymbol} {labelDetails.mrp}
                                                </span>
                                            )}

                                            {/* Offer Price Display */}
                                            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: format.lineColor }}>
                                                {labelDetails.currencySymbol} {labelDetails.price}
                                            </span>

                                            {/* Discount Percent Badge */}
                                            {discountPct > 0 && (
                                                <span style={{ fontSize: '0.68rem', fontWeight: '850', background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px' }}>
                                                    {discountPct}% OFF
                                                </span>
                                            )}
                                        </div>
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
                                Select stock products above or upload CSV spreadsheets to generate labels in bulk with strikethrough MRP & store badges.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BULK CSV / SPREADSHEET UPLOAD MODAL */}
            {isBulkModalOpen && (
                <div 
                    onClick={() => setIsBulkModalOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)', padding: '1.5rem' }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', width: '100%', maxWidth: '780px', maxHeight: '85vh', overflowY: 'auto', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #E2E8F0' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#E8F5EE', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>Bulk CSV / Excel Barcode Generation</h3>
                                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Upload spreadsheet with hundreds of products to generate all labels in one click</span>
                                </div>
                            </div>
                            <button onClick={() => setIsBulkModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button 
                                onClick={downloadSampleCsv}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', fontWeight: '750', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                <Download size={16} /> Download Sample CSV Template
                            </button>

                            <input 
                                type="file" 
                                ref={bulkFileRef}
                                accept=".csv"
                                onChange={handleBulkCsvUpload}
                                style={{ display: 'none' }}
                            />

                            <button 
                                onClick={() => bulkFileRef.current && bulkFileRef.current.click()}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1B6B3A', border: 'none', color: 'white', fontWeight: '750', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.82rem', cursor: 'pointer' }}
                            >
                                <Upload size={16} /> Choose & Upload CSV Spreadsheet
                            </button>
                        </div>

                        {/* Bulk Preview Table */}
                        {bulkItems.length > 0 ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '850', color: '#1E293B', textTransform: 'uppercase' }}>Loaded Products ({bulkItems.length})</h4>
                                    <button 
                                        onClick={handleBatchPrint}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#064E3B', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
                                    >
                                        <Printer size={16} /> Print All Barcode Labels Grid
                                    </button>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                                                <th style={{ padding: '0.6rem 0.8rem' }}>Product Title</th>
                                                <th style={{ padding: '0.6rem 0.8rem' }}>SKU / Barcode</th>
                                                <th style={{ padding: '0.6rem 0.8rem' }}>Offer Price</th>
                                                <th style={{ padding: '0.6rem 0.8rem' }}>MRP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bulkItems.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontWeight: '750' }}>{item.title}</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace' }}>{item.sku}</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: '#1B6B3A', fontWeight: '800' }}>₹{item.price}</td>
                                                    <td style={{ padding: '0.6rem 0.8rem', color: '#64748B', textDecoration: 'line-through' }}>₹{item.mrp}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#F8FAFC', borderRadius: '16px', border: '2px dashed #CBD5E1' }}>
                                <FileSpreadsheet size={40} color="#94A3B8" style={{ marginBottom: '0.75rem' }} />
                                <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', fontWeight: '800', color: '#334155' }}>No CSV File Uploaded Yet</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Upload a spreadsheet containing Title, SKU, Price, MRP to generate batch barcodes.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBarcode;
