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
    ChevronDown,
    Lock,
    ShieldCheck,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Columns,
    Key
} from 'lucide-react';
import { useCurrency } from '../context';
import { productsService } from '../services';

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
    { key: 'Exp Date', value: '' },
    { key: 'Weight', value: '' },
    { key: 'Batch No', value: '' },
    { key: 'Material', value: '' },
    { key: 'Serial No', value: '' },
    { key: 'MRP', value: '' },
    { key: 'Mfg Date', value: '' },
    { key: 'Origin', value: '' }
];

const BADGE_OPTIONS = [
    { id: 'none', label: 'None' },
    { id: 'custom', label: '✨ Custom Company Badge...' },
    { id: 'made_in_india', label: 'Made in India 🇮🇳' },
    { id: 'eco_friendly', label: 'Eco-Friendly 🌿' },
    { id: 'quality_checked', label: 'Quality Checked 🔒' },
    { id: 'organic', label: 'Organic 🍃' },
    { id: 'genuine', label: '100% Genuine ⭐' }
];

const BADGE_THEMES = [
    { id: 'green', label: 'Eco Green', color: '#166534', bg: '#F0FDF4', border: '#DCF2E4' },
    { id: 'blue', label: 'Corporate Blue', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE' },
    { id: 'amber', label: 'Gold Amber', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
    { id: 'purple', label: 'Royal Purple', color: '#6D28D9', bg: '#F5F3FF', border: '#EDE9FE' },
    { id: 'red', label: 'Crimson Red', color: '#B91C1C', bg: '#FEF2F2', border: '#FEE2E2' },
    { id: 'slate', label: 'Modern Slate', color: '#334155', bg: '#F1F5F9', border: '#E2E8F0' }
];

const BADGE_ICON_PRESETS = ['⭐', '🏆', '🔒', '✅', '🌿', '🇮🇳', '💎', '🔥', '🏷️', '🛡️', '👑', '💯', '✨', '⚡', '📦', '🎯'];

// Luminance & WCAG Contrast Helpers to prevent invisible white-on-white "blank bills"
const hexToRgb = (hex) => {
    if (!hex) return null;
    let clean = String(hex).replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
};

const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0.5;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (color1, color2) => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
};

const SCANNABLE_COLOR_PRESETS = [
    { label: 'Standard B&W', line: '#000000', bg: '#ffffff', tag: '100% Thermal Scannable' },
    { label: 'Thermal Slate', line: '#0f172a', bg: '#f8fafc', tag: 'High Contrast' },
    { label: 'Forest Eco', line: '#166534', bg: '#f0fdf4', tag: 'Green Brand' },
    { label: 'Corporate Navy', line: '#1e3a8a', bg: '#eff6ff', tag: 'Retail Blue' }
];

const BusinessBarcode = () => {
    const { currency } = useCurrency();
    const [selectedPreset, setSelectedPreset] = useState('standard');
    const [showCustomPreset, setShowCustomPreset] = useState(true);
    const [customTemplateConfig, setCustomTemplateConfig] = useState({
        borderStyle: 'solid', // 'solid', 'dashed', 'double', 'none'
        borderWidth: 2,
        borderRadius: 16,
        borderColor: '#1B6B3A',
        headerText: '',
        headerAlign: 'center', // 'left', 'center', 'right'
        footerNote: 'Thank you for shopping with us! Non-returnable once opened.',
        showFooterNote: true,
        showLogo: true,
        showBadge: true,
        showPrice: true,
        showMrp: true,
        showDiscountBadge: true,
        showBarcodeText: true,
        showAttributes: true,
        highlightColor: '#166534',
        accentBg: '#F0FDF4'
    });

    const updateCustomTemplateConfig = (key, val) => {
        setCustomTemplateConfig(prev => ({ ...prev, [key]: val }));
    };

    const [codeValue, setCodeValue] = useState('');
    const [codeType, setCodeType] = useState('CODE128'); // 'QR' as alternate
    const [encodeCustomData, setEncodeCustomData] = useState(false);
    
    // Encryption & Payload Encoding States
    const [encryptionMode, setEncryptionMode] = useState('encrypted'); // 'encrypted', 'structured', 'compact'
    const [barcodeTextDisplay, setBarcodeTextDisplay] = useState('sku'); // 'sku', 'encoded', 'none'
    const [isCopiedPayload, setIsCopiedPayload] = useState(false);

    // Barcode Placement & Print Alignment States
    const [barcodePlacement, setBarcodePlacement] = useState('center'); // 'top', 'center', 'bottom', 'side_by_side'
    const [barcodeAlign, setBarcodeAlign] = useState('center'); // 'left', 'center', 'right'
    const [printPlacement, setPrintPlacement] = useState('top_left'); // 'top_left', 'center', 'sheet_grid'
    const [printCopies, setPrintCopies] = useState(8);
    
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

    // Contrast Guard to prevent invisible white-on-white text / blank bills
    const contrastRatio = getContrastRatio(format.lineColor, format.background);
    const isLowContrast = contrastRatio < 2.5;
    const isLightBackground = getLuminance(format.background) > 0.5;

    // Guaranteed high-contrast fallback for canvas rendering so white-on-white never creates blank bills
    const effectiveLineColor = isLowContrast ? (isLightBackground ? '#0F172A' : '#FFFFFF') : format.lineColor;
    const effectiveBarcodeColor = isLowContrast ? (isLightBackground ? '#000000' : '#FFFFFF') : format.lineColor;

    const applyColorPreset = (line, bg) => {
        setFormat(prev => ({ ...prev, lineColor: line, background: bg }));
    };

    const [labelDetails, setLabelDetails] = useState({
        title: '',
        subtitle: '',
        price: '',
        mrp: '',
        currencySymbol: currency?.symbol || '₹'
    });

    // Branding & Icon options
    const [logoUrl, setLogoUrl] = useState('');
    const logoInputRef = useRef(null);
    const [selectedBadge, setSelectedBadge] = useState('none');
    
    // Custom Company-Specific Badge States
    const [customBadgeText, setCustomBadgeText] = useState('Certified Quality');
    const [customBadgeIcon, setCustomBadgeIcon] = useState('⭐');
    const [customBadgeTheme, setCustomBadgeTheme] = useState('green');

    const handleRemoveLogo = () => {
        setLogoUrl('');
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

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

    const [customFields, setCustomFields] = useState([]);

    // Bulk CSV State
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkItems, setBulkItems] = useState([]);
    const bulkFileRef = useRef(null);

    // Scan Preview Popup State
    const [isScanPreviewOpen, setIsScanPreviewOpen] = useState(false);

    const barcodeRef = useRef(null);
    const bulkPrintRef = useRef(null);

    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // Fetch Inventory Products for barcode generation
    const loadInventoryProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const items = await productsService.getProducts();
            const normalized = Array.isArray(items) ? items : (items?.data || items?.products || items?.rows || items?.items || []);
            setStockProducts(normalized);
        } catch (err) {
            console.error('[Barcode Gen] Error loading inventory products:', err);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        loadInventoryProducts();
    }, []);


    // Auto-fill when inventory product selected
    const handleSelectStockProduct = (id) => {
        setSelectedStockId(id);
        if (!id) return;
        const prod = stockProducts.find(p => String(p.id) === String(id));
        if (prod) {
            const skuVal = prod.barcode || prod.sku || prod.code || (prod.id ? `SKU-${prod.id}` : '');
            const titleVal = (prod.name || prod.title || prod.product_name || prod.item_name || '').slice(0, 50);
            const subVal = (prod.subtitle || prod.description || (prod.category || prod.unit ? `Category: ${prod.category || 'General'}${prod.unit ? ' | Unit: ' + prod.unit : ''}` : '')).slice(0, 60);
            const priceVal = (prod.selling_price ?? prod.price ?? prod.rate ?? prod.unit_price) != null && (prod.selling_price ?? prod.price ?? prod.rate ?? prod.unit_price) !== ''
                ? String(prod.selling_price ?? prod.price ?? prod.rate ?? prod.unit_price)
                : '';
            const mrpVal = (prod.mrp ?? prod.original_price) != null && (prod.mrp ?? prod.original_price) !== ''
                ? String(prod.mrp ?? prod.original_price)
                : '';

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
            const batchVal = prod.batch_number || prod.batch_no;
            const expVal = prod.expiry_date || prod.exp_date;
            if (batchVal) newFields.push({ id: 1, key: 'Batch No', value: String(batchVal) });
            if (expVal) newFields.push({ id: 2, key: 'Exp Date', value: String(expVal) });
            if (prod.mfg_date) newFields.push({ id: 3, key: 'Mfg Date', value: String(prod.mfg_date) });
            if (prod.origin) newFields.push({ id: 4, key: 'Origin', value: String(prod.origin) });
            setCustomFields(newFields);
        }
    };

    // Input sanitization for Offer Price and Original MRP:
    // Max 10 digits before decimal, positive numeric only, no leading zeros ('0'), no negative signs ('-')
    const sanitizePrice = (val) => {
        if (!val) return '';
        // Strip out minus signs and any non-numeric / non-decimal characters
        let clean = String(val).replace(/[^0-9.]/g, '');
        // Must not start with '0'
        clean = clean.replace(/^0+/, '');
        if (clean.startsWith('.')) {
            clean = clean.replace(/^\.+/, '');
        }
        const parts = clean.split('.');
        let intPart = parts[0] || '';
        // Maximum 10 digits allowed
        if (intPart.length > 10) {
            intPart = intPart.slice(0, 10);
        }
        if (parts.length > 1) {
            const decPart = parts.slice(1).join('').slice(0, 2);
            return intPart ? `${intPart}.${decPart}` : '';
        }
        return intPart;
    };

    // Checksum calculations for standardized retail barcodes
    const calcEan13Checksum = (str12) => {
        const res = str12.substr(0, 12).split('').map(n => +n).reduce((sum, a, idx) => (idx % 2 ? sum + a * 3 : sum + a), 0);
        return String((10 - (res % 10)) % 10);
    };

    const calcUpcChecksum = (str11) => {
        let sum = 0;
        for (let i = 1; i < 11; i += 2) sum += parseInt(str11[i]);
        for (let i = 0; i < 11; i += 2) sum += parseInt(str11[i]) * 3;
        return String((10 - (sum % 10)) % 10);
    };

    // Sanitize barcode values to ensure format validity and avoid invalid-input crashes
    const getSanitizedBarcodeValue = (val, type) => {
        const raw = String(val || '').trim();
        if (!raw) return '';
        if (type === 'EAN13') {
            let digits = raw.replace(/\D/g, '');
            if (digits.length === 0) return '';
            if (digits.length < 12) {
                digits = (digits + '000000000000').slice(0, 12);
            } else {
                digits = digits.slice(0, 12);
            }
            return digits + calcEan13Checksum(digits);
        }
        if (type === 'UPC') {
            let digits = raw.replace(/\D/g, '');
            if (digits.length === 0) return '';
            if (digits.length < 11) {
                digits = (digits + '00000000000').slice(0, 11);
            } else {
                digits = digits.slice(0, 11);
            }
            return digits + calcUpcChecksum(digits);
        }
        if (type === 'EAN8') {
            let digits = raw.replace(/\D/g, '');
            if (digits.length === 0) return '';
            return digits.slice(0, 7) + '7';
        }
        if (type === 'ITF14') {
            let digits = raw.replace(/\D/g, '');
            if (digits.length === 0) return '';
            return (digits + '0000000000000').slice(0, 13) + '2';
        }
        if (type === 'CODE39') {
            let clean = raw.toUpperCase().replace(/[^0-9A-Z-. $/+%]/g, '');
            return clean || '';
        }
        return raw;
    };

    // Compute effective code payload
    const getEffectivePayload = () => {
        const raw = String(codeValue || '').trim();
        if (!raw) return '';

        // If EAN-13 or UPC-A, always return standard check-digit sanitized GTIN
        if (codeType === 'EAN13' || codeType === 'UPC') {
            return getSanitizedBarcodeValue(codeValue, codeType);
        }

        // When data encoding is NOT enabled, return standard sanitized SKU
        if (!encodeCustomData) {
            return getSanitizedBarcodeValue(codeValue, codeType);
        }

        const validFields = customFields.filter(f => (f.key || '').trim() || (f.value || '').trim());
        const attributesMap = validFields.reduce((acc, f) => {
            if (f.key) acc[f.key] = f.value;
            return acc;
        }, {});

        const payloadObj = {
            sku: codeValue
        };
        if (labelDetails.title) payloadObj.title = labelDetails.title;
        if (labelDetails.price) payloadObj.price = labelDetails.price;
        if (labelDetails.mrp) payloadObj.mrp = labelDetails.mrp;
        if (Object.keys(attributesMap).length > 0) payloadObj.attributes = attributesMap;

        // 2D QR Code handling
        if (codeType === 'QR') {
            if (encryptionMode === 'encrypted') {
                try {
                    const jsonStr = JSON.stringify(payloadObj);
                    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
                    return `ENC:${b64}`;
                } catch (e) {
                    return JSON.stringify(payloadObj);
                }
            } else if (encryptionMode === 'compact') {
                const attrParts = validFields.map(f => `${f.key}:${f.value}`).join(';');
                return `${codeValue}|${labelDetails.price || ''}|${labelDetails.mrp || ''}|${attrParts}`;
            } else {
                return JSON.stringify(payloadObj);
            }
        }

        // 1D Barcode (Code 128 / Code 39) handling:
        // Must stay scannable by physical 1D laser scanners without overflowing
        if (encryptionMode === 'encrypted') {
            try {
                // Generate a compact scannable encrypted token (8-char signature)
                const tokenSeed = `${codeValue}:${labelDetails.price || '0'}:${labelDetails.mrp || '0'}`;
                const b64 = btoa(unescape(encodeURIComponent(tokenSeed))).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
                return `ENC-${b64}`;
            } catch (e) {
                return `ENC-${codeValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
            }
        } else if (encryptionMode === 'compact') {
            const attrSnippet = validFields.map(f => f.value).filter(Boolean).slice(0, 1).join('*');
            const compact = `${codeValue}*${labelDetails.price || '0'}${attrSnippet ? '*' + attrSnippet : ''}`;
            return compact.slice(0, 24);
        } else {
            // Structured key-value scannable format
            const shortStr = `SKU:${codeValue}|P:${labelDetails.price || '0'}`;
            return shortStr.slice(0, 24);
        }
    };

    const getEffectiveBadge = () => {
        if (!selectedBadge || selectedBadge === 'none') return null;
        if (selectedBadge === 'custom') {
            const theme = BADGE_THEMES.find(t => t.id === customBadgeTheme) || BADGE_THEMES[0];
            return {
                text: customBadgeText || 'Company Badge',
                icon: customBadgeIcon,
                color: theme.color,
                bg: theme.bg,
                border: theme.border
            };
        }
        const preset = BADGE_OPTIONS.find(b => b.id === selectedBadge);
        return {
            text: preset ? preset.label : selectedBadge,
            icon: '',
            color: '#166534',
            bg: '#F0FDF4',
            border: '#DCF2E4'
        };
    };

    const handleCopyPayload = () => {
        const payload = getEffectivePayload();
        if (!payload) return;
        navigator.clipboard.writeText(payload);
        setIsCopiedPayload(true);
        setTimeout(() => setIsCopiedPayload(false), 2000);
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

    const preparePrintElement = async (targetNode) => {
        if (!targetNode) return null;
        const clone = targetNode.cloneNode(true);

        // 1. Convert any <canvas> (e.g. QRCodeCanvas) to high-res PNG <img>
        const origCanvases = targetNode.querySelectorAll('canvas');
        const cloneCanvases = clone.querySelectorAll('canvas');
        origCanvases.forEach((origCanvas, i) => {
            const target = cloneCanvases[i];
            if (target) {
                const img = document.createElement('img');
                img.src = origCanvas.toDataURL('image/png');
                img.style.cssText = target.style.cssText;
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.style.imageRendering = 'pixelated';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                target.parentNode.replaceChild(img, target);
            }
        });

        // 2. Convert any SVG barcode to a crisp 300-DPI PNG <img> so print drivers never bleed sub-pixel bars into a black block
        const origSvgs = targetNode.querySelectorAll('.cliks-barcode-graphic-box svg');
        const cloneSvgs = clone.querySelectorAll('.cliks-barcode-graphic-box svg');
        
        for (let i = 0; i < origSvgs.length; i++) {
            const origSvg = origSvgs[i];
            const targetSvg = cloneSvgs[i];
            if (origSvg && targetSvg) {
                try {
                    const svgData = new XMLSerializer().serializeToString(origSvg);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const svgUrl = URL.createObjectURL(svgBlob);
                    
                    const img = new Image();
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        img.src = svgUrl;
                    });

                    const bbox = origSvg.getBoundingClientRect();
                    const scale = 3; // 3x high-resolution for razor-sharp thermal & laser printing
                    const canvas = document.createElement('canvas');
                    const w = Math.max(180, Math.round(bbox.width || 300));
                    const h = Math.max(50, Math.round(bbox.height || 90));
                    canvas.width = w * scale;
                    canvas.height = h * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.fillStyle = format.background || '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(svgUrl);

                    const pngDataUrl = canvas.toDataURL('image/png');
                    const printImg = document.createElement('img');
                    printImg.src = pngDataUrl;
                    printImg.style.width = `${w}px`;
                    printImg.style.height = `${h}px`;
                    printImg.style.display = 'block';
                    printImg.style.margin = '0 auto';
                    printImg.style.imageRendering = 'pixelated';
                    printImg.style.objectFit = 'contain';

                    targetSvg.parentNode.replaceChild(printImg, targetSvg);
                } catch (err) {
                    console.warn('[Barcode Print] SVG rasterize fallback:', err);
                }
            }
        }

        return clone;
    };

    const handlePrint = async () => {
        if (!barcodeRef.current) return;
        const processedClone = await preparePrintElement(barcodeRef.current);
        const elementHTML = (processedClone || barcodeRef.current).outerHTML;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print barcode labels.');
            return;
        }

        let printStyles = '';
        let bodyContent = '';

        if (printPlacement === 'top_left') {
            // Thermal roll / sticker printer edge-to-edge (no 100vh centering, 0 margins)
            printStyles = `
                @page { margin: 0; size: auto; }
                html, body { 
                    margin: 0;
                    padding: 0;
                    display: inline-block;
                    background: transparent;
                    font-family: 'Inter', system-ui, sans-serif; 
                }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                img { image-rendering: -webkit-optimize-contrast !important; image-rendering: crisp-edges !important; image-rendering: pixelated !important; }
                svg { shape-rendering: crispEdges !important; image-rendering: pixelated !important; }
                svg rect { shape-rendering: crispEdges !important; }
            `;
            bodyContent = elementHTML;
        } else if (printPlacement === 'sheet_grid') {
            // A4 Multi-label sheet grid
            const copies = Math.max(1, Number(printCopies) || 8);
            printStyles = `
                @page { margin: 10mm; size: auto; }
                body { 
                    margin: 0;
                    padding: 10px;
                    background: #ffffff;
                    font-family: 'Inter', system-ui, sans-serif; 
                }
                .label-sheet-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    justify-items: center;
                    align-items: start;
                }
                .label-item-cell {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                img { image-rendering: -webkit-optimize-contrast !important; image-rendering: crisp-edges !important; image-rendering: pixelated !important; }
                svg { shape-rendering: crispEdges !important; image-rendering: pixelated !important; }
                svg rect { shape-rendering: crispEdges !important; }
            `;
            bodyContent = `
                <div class="label-sheet-grid">
                    ${Array.from({ length: copies }).map(() => `<div class="label-item-cell">${elementHTML}</div>`).join('')}
                </div>
            `;
        } else {
            // Centered single page with top alignment to prevent tall multi-field labels from clipping
            printStyles = `
                @page { size: auto; margin: 10mm; }
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: flex-start; 
                    padding: 20px 0;
                    min-height: 100vh; 
                    margin: 0;
                    background: #f8fafc;
                    font-family: 'Inter', system-ui, sans-serif; 
                }
                @media print {
                    body {
                        background: transparent !important;
                        padding: 0 !important;
                    }
                }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                img { image-rendering: -webkit-optimize-contrast !important; image-rendering: crisp-edges !important; image-rendering: pixelated !important; }
                svg { shape-rendering: crispEdges !important; image-rendering: pixelated !important; }
                svg rect { shape-rendering: crispEdges !important; }
            `;
            bodyContent = elementHTML;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Label: ${codeValue || 'Barcode'}</title>
                    <style>${printStyles}</style>
                </head>
                <body>
                    ${bodyContent}
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
        let sanitized = val;
        if (key === 'title') sanitized = String(val || '').slice(0, 50);
        if (key === 'subtitle') sanitized = String(val || '').slice(0, 60);
        setLabelDetails(prev => ({ ...prev, [key]: sanitized }));
    };

    const addCustomField = (presetKey = '', presetValue = '') => {
        if (customFields.length >= 25) return;

        const cleanPresetKey = presetKey ? presetKey.trim() : '';
        if (cleanPresetKey) {
            const exists = customFields.some(f => f.key && f.key.trim().toLowerCase() === cleanPresetKey.toLowerCase());
            if (exists) {
                alert('This custom key has already been added.');
                return;
            }
        }

        setCustomFields(prev => {
            if (prev.length >= 25) return prev;
            if (cleanPresetKey && prev.some(f => f.key && f.key.trim().toLowerCase() === cleanPresetKey.toLowerCase())) {
                return prev;
            }
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
                        price: cols[2] || '',
                        mrp: cols[3] || '',
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
        const csvContent = "Title,SKU,Price,MRP,Subtitle\nProduct 1,SKU-1001,499.00,599.00,Standard\nProduct 2,SKU-1002,799.00,999.00,Premium";
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

    // Modular Canvas Components for Dynamic Placement
    const renderCanvasBarcode = (isEnlarged = false) => {
        const payload = getEffectivePayload();
        const displayLabelText = barcodeTextDisplay === 'encoded' ? payload : barcodeTextDisplay === 'sku' ? codeValue : null;

        if (!payload) {
            return (
                <div style={{
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: isEnlarged ? '2rem' : '1.25rem',
                    textAlign: 'center',
                    color: '#64748b',
                    background: 'rgba(0,0,0,0.02)',
                    margin: '0.5rem 0',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <Scan size={isEnlarged ? 28 : 22} style={{ margin: '0 auto 0.35rem', opacity: 0.5, display: 'block' }} />
                    <div style={{ fontSize: isEnlarged ? '0.88rem' : '0.78rem', fontWeight: '700' }}>No Barcode Value Entered</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Enter a SKU / code or select an inventory product above</div>
                </div>
            );
        }

        if (codeType === 'QR') {
            const qrSize = isEnlarged 
                ? Math.round((format.height + 50) * ((format.width || 2) / 2))
                : selectedPreset === 'qr_tag' 
                    ? Math.round((format.height + 20) * ((format.width || 2) / 2))
                    : Math.round((format.height + 30) * ((format.width || 2) / 2));

            return (
                <div 
                    onClick={() => !isEnlarged && setIsScanPreviewOpen(true)}
                    title={!isEnlarged ? "Click QR code to open scan preview" : ""}
                    style={{ 
                        padding: `${format.margin}px 0`, 
                        textAlign: barcodeAlign, 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: barcodeAlign === 'left' ? 'flex-start' : barcodeAlign === 'right' ? 'flex-end' : 'center',
                        cursor: isEnlarged ? 'default' : 'pointer'
                    }}
                >
                    <QRCodeCanvas 
                        value={payload} 
                        size={qrSize} 
                        bgColor={format.background}
                        fgColor={effectiveBarcodeColor}
                        level={"H"}
                    />
                    {format.displayValue && displayLabelText && (
                        <div style={{ 
                            textAlign: barcodeAlign, 
                            marginTop: '6px', 
                            color: effectiveLineColor, 
                            fontSize: `${isEnlarged ? format.fontSize + 2 : format.fontSize}px`, 
                            fontFamily: 'monospace', 
                            fontWeight: 'bold', 
                            wordBreak: 'break-all', 
                            maxWidth: '100%' 
                        }}>
                            {displayLabelText}
                        </div>
                    )}
                    {encodeCustomData && (
                        <div style={{ fontSize: '0.68rem', color: '#1B6B3A', fontWeight: '700', marginTop: '3px' }}>
                            {encryptionMode === 'encrypted' ? '🔒 Encrypted Payload' : '✓ Encoded Payload'}
                        </div>
                    )}
                </div>
            );
        }

        // Standard Barcodes (CODE128, EAN13, UPC, CODE39)
        const bcHeight = isEnlarged ? Math.max(120, format.height + 40) : format.height;

        // Auto-Fit Bar Width: Calculate optimal module width so total SVG width fits container without forcing browser to collapse height
        const cleanPayloadStr = String(payload);
        const approxModules = (cleanPayloadStr.length + 3) * 11 + 35;
        const availableWidth = isEnlarged ? 440 : (selectedPreset === 'jewelry' ? 240 : 340);
        const fitWidth = Math.max(1, Math.min(format.width, Number((availableWidth / approxModules).toFixed(2))));

        return (
            <div 
                onClick={() => !isEnlarged && setIsScanPreviewOpen(true)}
                title={!isEnlarged ? "Click barcode to expand scan preview popup" : ""}
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: barcodeAlign === 'left' ? 'flex-start' : barcodeAlign === 'right' ? 'flex-end' : 'center', 
                    width: '100%',
                    cursor: isEnlarged ? 'default' : 'pointer',
                    margin: '0.35rem 0'
                }}
            >
                <div 
                    className="cliks-barcode-graphic-box"
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: barcodeAlign === 'left' ? 'flex-start' : barcodeAlign === 'right' ? 'flex-end' : 'center', 
                        alignItems: 'center', 
                        overflowX: 'auto', 
                        padding: '4px 0',
                        minHeight: `${bcHeight}px`
                    }}
                >
                    <style>{`
                        .cliks-barcode-graphic-box svg {
                            height: ${bcHeight}px !important;
                            min-height: ${Math.min(60, bcHeight)}px !important;
                            max-height: ${bcHeight}px !important;
                            shape-rendering: crispEdges !important;
                            image-rendering: -webkit-optimize-contrast !important;
                            image-rendering: crisp-edges !important;
                            image-rendering: pixelated !important;
                        }
                        .cliks-barcode-graphic-box svg rect {
                            shape-rendering: crispEdges !important;
                        }
                    `}</style>
                    <Barcode 
                        key={`barcode-${isEnlarged ? 'modal' : 'canvas'}-${codeType}-${payload}-${fitWidth}-${bcHeight}-${effectiveBarcodeColor}-${format.background}`}
                        value={payload}
                        format={codeType}
                        width={fitWidth}
                        height={bcHeight}
                        displayValue={false}
                        fontSize={format.fontSize}
                        background={format.background}
                        lineColor={effectiveBarcodeColor}
                        margin={codeType === 'EAN13' || codeType === 'UPC' ? format.margin : 2}
                    />
                </div>
                {format.displayValue && displayLabelText && (
                    <div style={{ 
                        textAlign: barcodeAlign, 
                        marginTop: '4px', 
                        color: effectiveLineColor, 
                        fontSize: `${isEnlarged ? format.fontSize + 2 : format.fontSize}px`, 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold', 
                        wordBreak: 'break-all', 
                        maxWidth: '100%' 
                    }}>
                        {displayLabelText}
                    </div>
                )}
                {encodeCustomData && codeType !== 'EAN13' && codeType !== 'UPC' && (
                    <div style={{ fontSize: '0.67rem', color: '#1B6B3A', fontWeight: '750', marginTop: '2px' }}>
                        {encryptionMode === 'encrypted' ? '🔒 Token Encrypted' : '⚡ Compact POS Delimited'}
                    </div>
                )}
            </div>
        );
    };

    const renderCanvasInfo = () => (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: barcodePlacement === 'side_by_side' ? 'flex-start' : 'center' }}>
            {/* Logistics SKU Banner */}
            {selectedPreset === 'logistics' && (
                <div style={{ width: '100%', borderBottom: `2px solid ${effectiveLineColor}`, paddingBottom: '0.4rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.05em', color: effectiveLineColor }}>SKU: {codeValue || 'e.g., CLKS-1001-PROD'}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', background: effectiveLineColor, color: format.background, padding: '2px 6px', borderRadius: '4px' }}>LOGISTICS</span>
                </div>
            )}

            {/* Product Title */}
            {labelDetails.title ? (
                <div style={{ 
                    fontSize: selectedPreset === 'compact' ? '0.95rem' : '1.1rem', 
                    fontWeight: '900', 
                    marginBottom: '0.2rem', 
                    letterSpacing: '0.01em', 
                    textAlign: barcodePlacement === 'side_by_side' ? 'left' : 'center', 
                    textTransform: 'uppercase',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.25,
                    boxSizing: 'border-box',
                    padding: '0 4px',
                    color: effectiveLineColor
                }}>
                    {labelDetails.title}
                </div>
            ) : (
                <div style={{ 
                    fontSize: selectedPreset === 'compact' ? '0.88rem' : '1.05rem', 
                    fontWeight: '800', 
                    marginBottom: '0.2rem', 
                    textAlign: barcodePlacement === 'side_by_side' ? 'left' : 'center', 
                    color: effectiveLineColor,
                    opacity: 0.45,
                    fontStyle: 'italic',
                    boxSizing: 'border-box',
                    padding: '0 4px'
                }}>
                    e.g., Premium Cotton Shirt
                </div>
            )}

            {/* Subtitle / Variation */}
            {labelDetails.subtitle ? (
                <div style={{ 
                    fontSize: '0.75rem', 
                    opacity: 0.85, 
                    marginBottom: '0.75rem', 
                    fontWeight: '600', 
                    textAlign: barcodePlacement === 'side_by_side' ? 'left' : 'center',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.25,
                    boxSizing: 'border-box',
                    padding: '0 4px',
                    color: effectiveLineColor
                }}>
                    {labelDetails.subtitle}
                </div>
            ) : (
                <div style={{ 
                    fontSize: '0.72rem', 
                    opacity: 0.45, 
                    marginBottom: '0.65rem', 
                    fontWeight: '600', 
                    textAlign: barcodePlacement === 'side_by_side' ? 'left' : 'center',
                    fontStyle: 'italic',
                    color: effectiveLineColor
                }}>
                    e.g., Size: L | Color: Navy
                </div>
            )}

            {/* Custom Attributes Grid / List */}
            {(selectedPreset !== 'custom' || customTemplateConfig.showAttributes) && activeCustomFields.length > 0 && (
                <div style={{ 
                    width: '100%', 
                    marginBottom: '0.75rem',
                    padding: activeCustomFields.length > 8 ? '0.4rem 0.6rem' : '0.5rem 0.75rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '8px'
                }}>
                    {customFieldsLayout === 'grid' ? (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: activeCustomFields.length > 1 ? '1fr 1fr' : '1fr', 
                            gap: activeCustomFields.length > 8 ? '0.25rem 0.75rem' : '0.35rem 0.75rem', 
                            fontSize: activeCustomFields.length > 10 ? '0.70rem' : '0.74rem' 
                        }}>
                            {activeCustomFields.map((field) => {
                                const keyLen = (field.key || '').length;
                                const valLen = (field.value || '').length;
                                const isLongField = (keyLen + valLen) > 20 || keyLen > 14 || valLen > 16;
                                return (
                                    <div 
                                        key={field.id} 
                                        style={{ 
                                            display: 'flex', 
                                            gap: '4px', 
                                            gridColumn: isLongField ? '1 / -1' : 'auto',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere',
                                            lineHeight: 1.25,
                                            padding: isLongField ? '1px 0' : 0
                                        }}
                                    >
                                        {field.key && <span style={{ fontWeight: '800', flexShrink: 0 }}>{field.key}:</span>}
                                        {field.value && <span style={{ opacity: 0.9, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{field.value}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: activeCustomFields.length > 8 ? '3px' : '4px', 
                            fontSize: activeCustomFields.length > 10 ? '0.70rem' : '0.74rem' 
                        }}>
                            {activeCustomFields.map((field) => (
                                <div 
                                    key={field.id} 
                                    style={{ 
                                        display: 'flex', 
                                        justifyContent: barcodePlacement === 'side_by_side' ? 'flex-start' : 'space-between', 
                                        alignItems: 'flex-start',
                                        gap: '6px', 
                                        wordBreak: 'break-word', 
                                        overflowWrap: 'anywhere', 
                                        width: '100%', 
                                        lineHeight: 1.25 
                                    }}
                                >
                                    {field.key && <span style={{ fontWeight: '800', flexShrink: 0 }}>{field.key}:</span>}
                                    {field.value && <span style={{ opacity: 0.9, textAlign: barcodePlacement === 'side_by_side' ? 'left' : 'right', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{field.value}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderCanvasPricing = () => {
        if (selectedPreset === 'custom' && !customTemplateConfig.showPrice) return null;

        if (labelDetails.price) {
            return (
                <div style={{ 
                    marginTop: '0.65rem', 
                    borderTop: `1px solid ${effectiveLineColor}`, 
                    paddingTop: '0.4rem', 
                    width: '100%', 
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: barcodePlacement === 'side_by_side' ? 'flex-start' : 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {/* Original MRP Strikethrough Display */}
                        {(selectedPreset !== 'custom' || customTemplateConfig.showMrp) && numMrp > numPrice && (
                            <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.95rem', fontWeight: '700' }}>
                                {labelDetails.currencySymbol} {labelDetails.mrp}
                            </span>
                        )}

                        {/* Offer Price Display */}
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: effectiveLineColor }}>
                            {labelDetails.currencySymbol} {labelDetails.price}
                        </span>

                        {/* Discount Percent Badge */}
                        {(selectedPreset !== 'custom' || customTemplateConfig.showDiscountBadge) && discountPct > 0 && (
                            <span style={{ fontSize: '0.68rem', fontWeight: '850', background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px' }}>
                                {discountPct}% OFF
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        // On initial load when prices are not yet entered ("on the first itself"), display clearly marked example prices (e.g.)
        return (
            <div style={{ 
                marginTop: '0.65rem', 
                borderTop: `1px dashed ${effectiveLineColor}35`, 
                paddingTop: '0.4rem', 
                width: '100%', 
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: barcodePlacement === 'side_by_side' ? 'flex-start' : 'center', gap: '0.6rem', flexWrap: 'wrap', opacity: 0.7 }}>
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '0.88rem', fontWeight: '600' }}>
                        e.g., {labelDetails.currencySymbol} 1299.00
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', color: effectiveLineColor }}>
                        e.g., {labelDetails.currencySymbol} 999.00
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '850', background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px' }}>
                        23% OFF
                    </span>
                </div>
            </div>
        );
    };

    const renderCanvasFooter = () => {
        if (selectedPreset !== 'custom' || !customTemplateConfig.showFooterNote || !customTemplateConfig.footerNote) return null;

        return (
            <div style={{ 
                marginTop: '0.65rem', 
                borderTop: `1px dashed ${effectiveLineColor}35`, 
                paddingTop: '0.35rem', 
                width: '100%', 
                textAlign: 'center', 
                fontSize: '0.7rem', 
                fontWeight: '600', 
                opacity: 0.85, 
                wordBreak: 'break-word', 
                overflowWrap: 'break-word',
                color: effectiveLineColor
            }}>
                {customTemplateConfig.footerNote}
            </div>
        );
    };

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
                        type="button"
                        onClick={async () => {
                            setIsLoadingProducts(true);
                            try {
                                const res = await productsService.backfillBarcodes();
                                alert(`Generated barcodes for ${res.updatedCount || 0} existing products.`);
                                await loadInventoryProducts();
                            } catch (_) {
                                alert('Completed barcode verification.');
                                await loadInventoryProducts();
                            } finally {
                                setIsLoadingProducts(false);
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1.5px solid #10B981', background: '#ECFDF5', color: '#047857', fontWeight: '750', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                        title="Ensure every single product in your catalog has an automatic barcode"
                    >
                        <Sparkles size={18} />
                        Auto-Assign All Barcodes
                    </button>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <Layout size={18} color="#10b981" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Select Canvas Label Preset Layout</h3>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {!showCustomPreset ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomPreset(true);
                                    setSelectedPreset('custom');
                                }}
                                style={{
                                    fontSize: '0.74rem',
                                    fontWeight: '750',
                                    color: '#166534',
                                    background: '#DCFCE7',
                                    border: '1px solid #86EFAC',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                title="Restore Custom Template layout"
                            >
                                <Plus size={13} /> Add Custom Template
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCustomPreset(false);
                                    if (selectedPreset === 'custom') setSelectedPreset('standard');
                                }}
                                style={{
                                    fontSize: '0.74rem',
                                    fontWeight: '700',
                                    color: '#DC2626',
                                    background: '#FEE2E2',
                                    border: '1px solid #FECACA',
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                                title="Remove Custom Template from presets"
                            >
                                <X size={13} /> Remove Custom Template
                            </button>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                            {CANVAS_PRESETS.filter(p => p.id !== 'custom' || showCustomPreset).length} Canvas Templates Available
                        </span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    {CANVAS_PRESETS.filter(p => p.id !== 'custom' || showCustomPreset).map((preset) => {
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
                                {preset.id === 'custom' && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCustomPreset(false);
                                            if (selectedPreset === 'custom') setSelectedPreset('standard');
                                        }}
                                        title="Remove Custom Template preset"
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: '#FEE2E2',
                                            border: '1px solid #FCA5A5',
                                            color: '#DC2626',
                                            borderRadius: '6px',
                                            padding: '2px 5px',
                                            fontSize: '0.65rem',
                                            fontWeight: '750',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            zIndex: 2
                                        }}
                                    >
                                        <X size={10} /> Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 440px', gap: '1.75rem', alignItems: 'start' }}>
                
                {/* Left Column: Settings & Data Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* COMPLETELY CUSTOMIZABLE CUSTOM TEMPLATE STUDIO */}
                    {selectedPreset === 'custom' && (
                        <div style={{
                            background: '#FAFDFB',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1.5px solid #86EFAC',
                            boxShadow: '0 4px 14px rgba(22, 101, 52, 0.08)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#DCFCE7', color: '#166534', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Palette size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: '850', fontSize: '1rem', color: '#064E3B', margin: 0 }}>
                                            🎨 Custom Template Studio (Full Customization)
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748B' }}>
                                            Configure store banner, frame styling, element visibility, and return policy
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomPreset(false);
                                        setSelectedPreset('standard');
                                    }}
                                    style={{
                                        background: '#FEE2E2',
                                        border: '1px solid #FECACA',
                                        color: '#DC2626',
                                        fontSize: '0.74rem',
                                        fontWeight: '750',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                    title="Remove Custom Template preset layout"
                                >
                                    <Trash2 size={13} /> Remove Custom Template
                                </button>
                            </div>

                            {/* 1. STORE HEADER BRANDING & BANNER */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', margin: 0 }}>
                                            Store Header Banner Text <span style={{ color: '#94A3B8', fontWeight: 'normal' }}>(Optional)</span>
                                        </label>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (customTemplateConfig.headerText || '').length >= 40 ? '#EA580C' : '#94A3B8' }}>
                                            {(customTemplateConfig.headerText || '').length}/40
                                        </span>
                                    </div>
                                    <input 
                                        type="text"
                                        maxLength={40}
                                        placeholder="e.g. CLIKS ENTERPRISE SUPERMART"
                                        value={customTemplateConfig.headerText}
                                        onChange={e => updateCustomTemplateConfig('headerText', e.target.value.slice(0, 40))}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                                        Header Alignment
                                    </label>
                                    <select
                                        value={customTemplateConfig.headerAlign}
                                        onChange={e => updateCustomTemplateConfig('headerAlign', e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '600', outline: 'none', background: 'white' }}
                                    >
                                        <option value="center">Center</option>
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>

                            {/* 2. FRAME & BORDER STYLING */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem', marginBottom: '1rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>Border Style</label>
                                    <select
                                        value={customTemplateConfig.borderStyle}
                                        onChange={e => updateCustomTemplateConfig('borderStyle', e.target.value)}
                                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '600' }}
                                    >
                                        <option value="solid">Solid Line</option>
                                        <option value="dashed">Dashed Border</option>
                                        <option value="double">Double Frame</option>
                                        <option value="none">Borderless</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                                        Width <span>{customTemplateConfig.borderWidth}px</span>
                                    </label>
                                    <input 
                                        type="range" min="1" max="6" step="1"
                                        value={customTemplateConfig.borderWidth}
                                        onChange={e => updateCustomTemplateConfig('borderWidth', Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#166534' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                                        Radius <span>{customTemplateConfig.borderRadius}px</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max="28" step="2"
                                        value={customTemplateConfig.borderRadius}
                                        onChange={e => updateCustomTemplateConfig('borderRadius', Number(e.target.value))}
                                        style={{ width: '100%', accentColor: '#166534' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>Border Color</label>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <input 
                                            type="color" 
                                            value={customTemplateConfig.borderColor} 
                                            onChange={e => updateCustomTemplateConfig('borderColor', e.target.value)} 
                                            style={{ width: '32px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0 }} 
                                        />
                                        <input 
                                            type="text" 
                                            value={customTemplateConfig.borderColor} 
                                            onChange={e => updateCustomTemplateConfig('borderColor', e.target.value)} 
                                            style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. ELEMENT TOGGLES */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    Toggle Label Elements
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                                    {[
                                        { key: 'showLogo', label: 'Store Logo' },
                                        { key: 'showBadge', label: 'Quality Badge' },
                                        { key: 'showAttributes', label: 'Attributes' },
                                        { key: 'showPrice', label: 'Offer Price' },
                                        { key: 'showMrp', label: 'Original MRP' },
                                        { key: 'showDiscountBadge', label: 'Discount %' },
                                        { key: 'showBarcodeText', label: 'SKU Text' },
                                        { key: 'showFooterNote', label: 'Footer Notice' }
                                    ].map(item => (
                                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', fontWeight: '650', color: '#334155', cursor: 'pointer', background: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                            <input 
                                                type="checkbox"
                                                checked={Boolean(customTemplateConfig[item.key])}
                                                onChange={e => updateCustomTemplateConfig(item.key, e.target.checked)}
                                                style={{ accentColor: '#166534', cursor: 'pointer' }}
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 4. CUSTOM FOOTER POLICY NOTE */}
                            {customTemplateConfig.showFooterNote && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', margin: 0 }}>
                                            Custom Footer Notice / Return Policy
                                        </label>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (customTemplateConfig.footerNote || '').length >= 60 ? '#EA580C' : '#94A3B8' }}>
                                            {(customTemplateConfig.footerNote || '').length}/60 chars
                                        </span>
                                    </div>
                                    <input 
                                        type="text"
                                        maxLength={60}
                                        placeholder="e.g. Thank you for shopping with us! Non-returnable once opened."
                                        value={customTemplateConfig.footerNote}
                                        onChange={e => updateCustomTemplateConfig('footerNote', e.target.value.slice(0, 60))}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.84rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', margin: 0 }}>
                                        {codeType === 'EAN13' ? 'EAN-13 Product Barcode (13 Digits)' : codeType === 'UPC' ? 'UPC-A Barcode (12 Digits)' : 'Code Value (SKU / ID)'}
                                    </label>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: (codeValue || '').length >= 40 ? '#EA580C' : '#94A3B8' }}>
                                        {(codeValue || '').length}/40
                                    </span>
                                </div>
                                <input 
                                    type="text" 
                                    maxLength={40}
                                    value={codeValue}
                                    onChange={(e) => setCodeValue(e.target.value.slice(0, 40))}
                                    placeholder={codeType === 'EAN13' ? "e.g. 8901234567890" : codeType === 'UPC' ? "e.g. 012345678905" : "Enter Product SKU/ID..."}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600', fontSize: '0.88rem' }}
                                />
                                {(codeType === 'EAN13' || codeType === 'UPC') && (
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.35rem' }}>
                                        Encoded: <strong style={{ color: '#1B6B3A' }}>{getSanitizedBarcodeValue(codeValue, codeType)}</strong>
                                    </div>
                                )}

                                {/* Code Value Text Visibility Toggle (Placed Directly With Code Value) */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    marginTop: '0.6rem', 
                                    padding: '0.5rem 0.75rem', 
                                    background: format.displayValue ? '#F0FDF4' : '#F8FAFC', 
                                    borderRadius: '8px', 
                                    border: `1px solid ${format.displayValue ? '#BBF7D0' : '#E2E8F0'}`,
                                    transition: 'all 0.2s ease'
                                }}>
                                    <label htmlFor="displayValTop" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                        <input 
                                            type="checkbox" 
                                            checked={format.displayValue} 
                                            onChange={(e) => updateFormat('displayValue', e.target.checked)} 
                                            id="displayValTop"
                                            style={{ width: '16px', height: '16px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                                        />
                                        <span>Show code value text on label</span>
                                    </label>
                                    <span style={{ 
                                        fontSize: '0.72rem', 
                                        fontWeight: '800', 
                                        color: format.displayValue ? '#166534' : '#64748B', 
                                        background: format.displayValue ? '#DCFCE7' : '#E2E8F0', 
                                        padding: '2px 8px', 
                                        borderRadius: '12px' 
                                    }}>
                                        {format.displayValue ? 'Visible' : 'Hidden'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Encode Full Custom Data & Encryption Toggle */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <input 
                                        type="checkbox"
                                        id="encodeDataToggle"
                                        checked={encodeCustomData}
                                        onChange={(e) => setEncodeCustomData(e.target.checked)}
                                        style={{ width: '18px', height: '18px', accentColor: '#1B6B3A', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="encodeDataToggle" style={{ fontSize: '0.86rem', fontWeight: '800', color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Lock size={15} color="#1B6B3A" />
                                        Encode Title, Price & Custom Attributes directly inside QR/Barcode payload
                                    </label>
                                </div>
                                {encodeCustomData && (
                                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '6px' }}>
                                        ✓ Encoded Payload Active
                                    </span>
                                )}
                            </div>

                            {encodeCustomData && (codeType === 'EAN13' || codeType === 'UPC') && (
                                <div style={{ fontSize: '0.74rem', color: '#047857', background: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <span>
                                        🏷️ <strong>{codeType} Retail Standard:</strong> Encodes {codeType === 'EAN13' ? '13' : '12'}-digit GTIN ({getSanitizedBarcodeValue(codeValue, codeType)}). Title, price & attributes are displayed on the label layout.
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCodeType('QR')}
                                        style={{ fontSize: '0.72rem', fontWeight: '750', color: '#1B6B3A', background: '#fff', border: '1px solid #1B6B3A', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        Switch to QR Code for 2D Payload →
                                    </button>
                                </div>
                            )}

                            {/* Encryption / Encoding Mode Controls */}
                            {encodeCustomData && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>
                                            Encryption & Encoding Algorithm
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEncryptionMode('encrypted')}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    padding: '0.6rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: encryptionMode === 'encrypted' ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                    background: encryptionMode === 'encrypted' ? '#F0FDF4' : '#ffffff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '800', color: encryptionMode === 'encrypted' ? '#166534' : '#334155' }}>
                                                    <ShieldCheck size={14} color={encryptionMode === 'encrypted' ? '#166534' : '#64748b'} />
                                                    Encrypted Token
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                                    Tamper-proof Base64 token (ENC-...)
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setEncryptionMode('compact')}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    padding: '0.6rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: encryptionMode === 'compact' ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                    background: encryptionMode === 'compact' ? '#F0FDF4' : '#ffffff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '800', color: encryptionMode === 'compact' ? '#166534' : '#334155' }}>
                                                    <Scan size={14} color={encryptionMode === 'compact' ? '#166534' : '#64748b'} />
                                                    Compact Delimited
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                                    Delimited string (SKU*PRICE*SPECS)
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setEncryptionMode('structured')}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    padding: '0.6rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: encryptionMode === 'structured' ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                    background: encryptionMode === 'structured' ? '#F0FDF4' : '#ffffff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '800', color: encryptionMode === 'structured' ? '#166534' : '#334155' }}>
                                                    <Layers size={14} color={encryptionMode === 'structured' ? '#166534' : '#64748b'} />
                                                    Structured JSON
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                                    Full key-value JSON (Ideal for 2D QR)
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Text display under barcode bars */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.4rem' }}>
                                            Text Display Under Barcode / QR
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {[
                                                { id: 'sku', label: 'Display SKU (CLKS-1001)' },
                                                { id: 'encoded', label: 'Display Encrypted / Encoded Token' },
                                                { id: 'none', label: 'No Text (Code Only)' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setBarcodeTextDisplay(opt.id)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '750',
                                                        cursor: 'pointer',
                                                        border: barcodeTextDisplay === opt.id ? '1.5px solid #1B6B3A' : '1px solid #cbd5e1',
                                                        background: barcodeTextDisplay === opt.id ? '#1B6B3A' : '#ffffff',
                                                        color: barcodeTextDisplay === opt.id ? '#ffffff' : '#475569'
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Live Scannable Payload & Decryption Inspector */}
                                    <div style={{ background: '#0F172A', color: '#F8FAFC', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.4rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#4ADE80', fontWeight: '800' }}>
                                                <Scan size={14} />
                                                LIVE SCANNABLE PAYLOAD INSPECTOR
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCopyPayload}
                                                style={{
                                                    background: '#1E293B',
                                                    color: isCopiedPayload ? '#4ADE80' : '#94A3B8',
                                                    border: '1px solid #334155',
                                                    borderRadius: '4px',
                                                    padding: '2px 8px',
                                                    fontSize: '0.68rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                {isCopiedPayload ? <Check size={12} /> : <Copy size={12} />}
                                                {isCopiedPayload ? 'Copied' : 'Copy Scanned String'}
                                            </button>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '4px' }}>
                                            What Barcode Scanner Reads:
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#E2E8F0', wordBreak: 'break-all', background: '#1E293B', padding: '6px 8px', borderRadius: '6px', maxHeight: '60px', overflowY: 'auto' }}>
                                            {getEffectivePayload() || '<No Code Entered>'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.68rem', color: '#64748B' }}>
                                            <span>Type: <strong style={{ color: '#F1F5F9' }}>{codeType}</strong> ({encryptionMode.toUpperCase()})</span>
                                            <span style={{ color: '#4ADE80' }}>✓ 100% Scannable by Hardware Guns & Cameras</span>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', margin: 0 }}>
                                        Product Title / Name
                                    </label>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: (labelDetails.title || '').length >= 50 ? '#EA580C' : '#94A3B8' }}>
                                        {(labelDetails.title || '').length}/50 chars
                                    </span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        maxLength={50}
                                        value={labelDetails.title}
                                        onClick={() => {
                                            setIsProductDropdownOpen(true);
                                            if (stockProducts.length === 0) loadInventoryProducts();
                                        }}
                                        onFocus={() => {
                                            setIsProductDropdownOpen(true);
                                            if (stockProducts.length === 0) loadInventoryProducts();
                                        }}
                                        onChange={(e) => {
                                            updateLabelDetails('title', e.target.value.slice(0, 50));
                                            setIsProductDropdownOpen(true);
                                            const val = e.target.value.toLowerCase().trim();
                                            const matched = stockProducts.find(p => (p.name || p.product_name || p.title || p.item_name || '').toLowerCase().trim() === val);
                                            if (matched) {
                                                handleSelectStockProduct(matched.id);
                                            }
                                        }}
                                        placeholder="Enter or select product title (max 50 chars)..."
                                        style={{ width: '100%', padding: '0.75rem', paddingRight: '4.5rem', borderRadius: '8px', border: (labelDetails.title || '').length >= 50 ? '1.5px solid #F59E0B' : '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                    {labelDetails.title && (
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateLabelDetails('title', '');
                                            }}
                                            style={{ position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                            title="Clear title"
                                        >
                                            <X size={15} />
                                        </div>
                                    )}
                                    <div 
                                        onClick={() => {
                                            setIsProductDropdownOpen(prev => !prev);
                                            if (stockProducts.length === 0) loadInventoryProducts();
                                        }}
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
                                        {isLoadingProducts && stockProducts.length === 0 ? (
                                            <div style={{ padding: '0.8rem', textAlign: 'center', color: '#1B6B3A', fontSize: '0.82rem', fontWeight: '700' }}>
                                                Loading inventory products...
                                            </div>
                                        ) : (
                                            <>
                                                {stockProducts
                                                    .filter(prod => {
                                                        const q = (labelDetails.title || '').toLowerCase().trim();
                                                        if (!q) return true;
                                                        const nameStr = (prod.name || prod.product_name || prod.title || prod.item_name || '').toLowerCase();
                                                        const skuStr = (prod.sku || prod.barcode || prod.code || '').toLowerCase();
                                                        return nameStr.includes(q) || skuStr.includes(q);
                                                    })
                                                    .map(prod => {
                                                        const pName = prod.name || prod.product_name || prod.title || prod.item_name || 'Product';
                                                        const pSku = prod.sku || prod.barcode || prod.code || `ID-${prod.id}`;
                                                        const pPrice = prod.selling_price ?? prod.price ?? prod.rate ?? prod.unit_price ?? 0;
                                                        return (
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
                                                                    <div style={{ fontWeight: '750', fontSize: '0.88rem', color: '#0F172A' }}>{pName}</div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.73rem', marginTop: '2px', flexWrap: 'wrap' }}>
                                                                        {prod.barcode && (
                                                                            <span style={{ fontWeight: '800', color: '#166534', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.4px', border: '1px solid #BBF7D0' }}>
                                                                                🏷️ {prod.barcode}
                                                                            </span>
                                                                        )}
                                                                        {prod.sku && <span style={{ color: '#64748B' }}>SKU: {prod.sku}</span>}
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontWeight: '850', fontSize: '0.88rem', color: '#1B6B3A' }}>
                                                                    ₹{pPrice}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                                {stockProducts.length === 0 && !isLoadingProducts && (
                                                    <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                                                        No inventory products found.
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', margin: 0 }}>Description / Variation</label>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: (labelDetails.subtitle || '').length >= 60 ? '#EA580C' : '#94A3B8' }}>
                                        {(labelDetails.subtitle || '').length}/60 chars
                                    </span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text" 
                                        maxLength={60}
                                        value={labelDetails.subtitle}
                                        onChange={(e) => updateLabelDetails('subtitle', e.target.value.slice(0, 60))}
                                        placeholder="e.g., Size: L | Color: Navy (max 60 chars)"
                                        style={{ width: '100%', padding: '0.75rem', paddingRight: labelDetails.subtitle ? '2rem' : '0.75rem', borderRadius: '8px', border: (labelDetails.subtitle || '').length >= 60 ? '1.5px solid #F59E0B' : '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }}
                                    />
                                    {labelDetails.subtitle && (
                                        <div 
                                            onClick={() => updateLabelDetails('subtitle', '')}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                            title="Clear description"
                                        >
                                            <X size={15} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PRICE TAG & ORIGINAL MRP WITH SANITIZATION TO PREVENT ALPHANUMERIC MISMATCH */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1B6B3A', margin: 0, textTransform: 'uppercase' }}>
                                            Offer Price ({labelDetails.currencySymbol})
                                        </label>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic' }}>e.g., 999.00</span>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            maxLength={13}
                                            value={labelDetails.price}
                                            onChange={(e) => updateLabelDetails('price', sanitizePrice(e.target.value))}
                                            placeholder="e.g., 999.00"
                                            style={{ width: '100%', padding: '0.65rem', paddingRight: labelDetails.price ? '2rem' : '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', fontWeight: '800', fontSize: '0.95rem', color: '#1B6B3A' }}
                                        />
                                        {labelDetails.price && (
                                            <div 
                                                onClick={() => updateLabelDetails('price', '')}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                                title="Clear offer price"
                                            >
                                                <X size={15} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>
                                            Original MRP ({labelDetails.currencySymbol})
                                        </label>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic' }}>e.g., 1299.00</span>
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            maxLength={13}
                                            value={labelDetails.mrp}
                                            onChange={(e) => updateLabelDetails('mrp', sanitizePrice(e.target.value))}
                                            placeholder="e.g., 1299.00"
                                            style={{ width: '100%', padding: '0.65rem', paddingRight: labelDetails.mrp ? '2rem' : '0.65rem', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', boxSizing: 'border-box', fontWeight: '700', fontSize: '0.95rem', color: '#475569' }}
                                        />
                                        {labelDetails.mrp && (
                                            <div 
                                                onClick={() => updateLabelDetails('mrp', '')}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                                title="Clear MRP"
                                            >
                                                <X size={15} />
                                            </div>
                                        )}
                                    </div>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Store Logo</label>
                                        {logoUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: '4px', 
                                                    background: '#fee2e2', 
                                                    color: '#dc2626', 
                                                    border: 'none', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '700', 
                                                    cursor: 'pointer' 
                                                }}
                                                title="Remove current logo"
                                            >
                                                <Trash2 size={12} />
                                                Remove Logo
                                            </button>
                                        )}
                                    </div>
                                    {logoUrl ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            <img src={logoUrl} alt="Store logo preview" style={{ height: '34px', maxWidth: '80px', objectFit: 'contain', background: '#fff', padding: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#166534' }}>✓ Logo Uploaded</div>
                                                <button
                                                    type="button"
                                                    onClick={() => logoInputRef.current?.click()}
                                                    style={{ fontSize: '0.7rem', color: '#1B6B3A', background: 'transparent', border: 'none', padding: 0, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    Change Logo
                                                </button>
                                            </div>
                                            <input 
                                                ref={logoInputRef}
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                ref={logoInputRef}
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                style={{ fontSize: '0.78rem', width: '100%' }}
                                            />
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginTop: '0.35rem' }}>
                                                Recommended image size: 200 × 200 px
                                            </span>
                                        </>
                                    )}
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

                            {/* CUSTOM COMPANY-SPECIFIC BADGE STUDIO */}
                            {selectedBadge === 'custom' && (
                                <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Award size={14} color="#1B6B3A" />
                                            Company Specific Badge Customizer
                                        </span>
                                        {/* Live Preview pill */}
                                        {(() => {
                                            const previewBadge = getEffectiveBadge();
                                            if (!previewBadge) return null;
                                            return (
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: previewBadge.bg, color: previewBadge.color, border: `1px solid ${previewBadge.border}`, padding: '2px 8px', borderRadius: '6px' }}>
                                                    {previewBadge.icon} {previewBadge.text}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* Badge Label input */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: '750', color: '#475569', margin: 0 }}>
                                                Badge Name / Company Slogan
                                            </label>
                                            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: (customBadgeText || '').length >= 30 ? '#EA580C' : '#94A3B8' }}>
                                                {(customBadgeText || '').length}/30 chars
                                            </span>
                                        </div>
                                        <input 
                                            type="text"
                                            maxLength={30}
                                            value={customBadgeText}
                                            onChange={(e) => setCustomBadgeText(e.target.value.slice(0, 30))}
                                            placeholder="e.g. ISO 9001:2015, Tested & Approved, Pure Silk"
                                            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    {/* Icon / Emoji quick-picks */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '750', color: '#475569', marginBottom: '0.3rem' }}>
                                            Badge Icon / Emoji
                                        </label>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {BADGE_ICON_PRESETS.map((ic, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCustomBadgeIcon(ic)}
                                                    style={{
                                                        padding: '3px 6px',
                                                        borderRadius: '6px',
                                                        border: customBadgeIcon === ic ? '1.5px solid #1B6B3A' : '1px solid #E2E8F0',
                                                        background: customBadgeIcon === ic ? '#DCFCE7' : '#FFFFFF',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {ic}
                                                </button>
                                            ))}
                                            <input 
                                                type="text"
                                                maxLength={4}
                                                value={customBadgeIcon}
                                                onChange={(e) => setCustomBadgeIcon(e.target.value.slice(0, 4))}
                                                placeholder="Custom"
                                                style={{ width: '56px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', textAlign: 'center', fontWeight: '700' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Badge Color Theme presets */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '750', color: '#475569', marginBottom: '0.3rem' }}>
                                            Badge Color Theme
                                        </label>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {BADGE_THEMES.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => setCustomBadgeTheme(t.id)}
                                                    style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        border: customBadgeTheme === t.id ? `2px solid ${t.color}` : '1px solid #E2E8F0',
                                                        background: t.bg,
                                                        color: t.color,
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                            maxLength={60}
                                            value={field.key} 
                                            onChange={(e) => updateCustomField(field.id, 'key', e.target.value.slice(0, 60))}
                                            style={{ flex: '1', minWidth: '100px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            title={field.key}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Value (e.g., 500g, Certified Organic, Batch-2026-X)" 
                                            maxLength={150}
                                            value={field.value} 
                                            onChange={(e) => updateCustomField(field.id, 'value', e.target.value.slice(0, 150))}
                                            style={{ flex: '1.8', minWidth: '140px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            title={field.value}
                                        />
                                        <button 
                                            onClick={() => removeCustomField(field.id)}
                                            style={{ background: '#fef2f2', border: 'none', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', margin: 0 }}>
                                        Barcode Height <span>({format.height}px)</span>
                                    </label>
                                    <span style={{ fontSize: '0.68rem', color: '#166534', fontWeight: '750', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
                                        Height Locked
                                    </span>
                                </div>
                                <input 
                                    type="range" min="40" max="260" step="5" 
                                    value={format.height} 
                                    onChange={(e) => updateFormat('height', Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#1B6B3A' }}
                                />
                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                    {[
                                        { l: 'Compact', h: 70 },
                                        { l: 'Standard', h: 100 },
                                        { l: 'Tall', h: 150 },
                                        { l: 'Jumbo', h: 200 }
                                    ].map(sz => (
                                        <button
                                            key={sz.l}
                                            type="button"
                                            onClick={() => updateFormat('height', sz.h)}
                                            style={{
                                                flex: 1,
                                                padding: '2px 0',
                                                borderRadius: '4px',
                                                border: format.height === sz.h ? '1.5px solid #1B6B3A' : '1px solid #E2E8F0',
                                                background: format.height === sz.h ? '#DCFCE7' : '#F8FAFC',
                                                color: format.height === sz.h ? '#166534' : '#64748B',
                                                fontSize: '0.67rem',
                                                fontWeight: '750',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {sz.l}
                                        </button>
                                    ))}
                                </div>
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

                            {/* Scannable Quick Color Palettes */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b' }}>Quick Scannable Themes:</span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isLowContrast ? '#dc2626' : '#166534' }}>
                                        Contrast: {contrastRatio}:1 ({isLowContrast ? '⚠️ Dangerously Low (Blank Bill)' : '✓ Scannable'})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {SCANNABLE_COLOR_PRESETS.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => applyColorPreset(p.line, p.bg)}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid #cbd5e1',
                                                background: '#f8fafc',
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                color: '#334155'
                                            }}
                                        >
                                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: p.line, border: '1px solid #cbd5e1' }} />
                                            <span>{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Low Contrast / Blank Bill Warning Banner */}
                            {isLowContrast && (
                                <div style={{ gridColumn: '1 / -1', background: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '850', color: '#991B1B' }}>
                                                Blank Bill Warning: Text & Barcode are white on white ({contrastRatio}:1)
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#B91C1C' }}>
                                                Thermal printers cannot print white ink, and scanners will fail to read this label.
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => applyColorPreset('#000000', '#ffffff')}
                                        style={{
                                            background: '#DC2626',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.76rem',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
                                        }}
                                    >
                                        ⚡ Fix to Black on White
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Barcode In-Label Placement & Alignment Styles */}
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                                    📍 Barcode Placement Inside Label
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { id: 'top', label: 'Top', icon: '⬆️' },
                                        { id: 'center', label: 'Center', icon: '⏺️' },
                                        { id: 'bottom', label: 'Bottom', icon: '⬇️' },
                                        { id: 'side_by_side', label: 'Split (Side)', icon: '↔️' }
                                    ].map(pos => (
                                        <button
                                            key={pos.id}
                                            type="button"
                                            onClick={() => setBarcodePlacement(pos.id)}
                                            style={{
                                                padding: '0.55rem 0.5rem',
                                                borderRadius: '8px',
                                                border: barcodePlacement === pos.id ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                background: barcodePlacement === pos.id ? '#F0FDF4' : '#ffffff',
                                                color: barcodePlacement === pos.id ? '#166534' : '#475569',
                                                fontWeight: '800',
                                                fontSize: '0.78rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '2px'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem' }}>{pos.icon}</span>
                                            <span>{pos.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alignment (Left, Center, Right) */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                                    ↔️ Barcode Graphic Alignment
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { id: 'left', label: 'Left', icon: AlignLeft },
                                        { id: 'center', label: 'Center', icon: AlignCenter },
                                        { id: 'right', label: 'Right', icon: AlignRight }
                                    ].map(al => {
                                        const IconComp = al.icon;
                                        return (
                                            <button
                                                key={al.id}
                                                type="button"
                                                onClick={() => setBarcodeAlign(al.id)}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '8px',
                                                    border: barcodeAlign === al.id ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                    background: barcodeAlign === al.id ? '#F0FDF4' : '#ffffff',
                                                    color: barcodeAlign === al.id ? '#166534' : '#475569',
                                                    fontWeight: '800',
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <IconComp size={15} />
                                                <span>{al.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Print Sheet Placement & Thermal Printer Optimization */}
                            <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.4rem' }}>
                                    🖨️ Print View Page Placement
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                                    {[
                                        { id: 'top_left', label: 'Thermal Roll (0-Margin)', desc: 'TSC/Zebra/Rollo edge-to-edge' },
                                        { id: 'center', label: 'Single Centered', desc: 'Standard single label' },
                                        { id: 'sheet_grid', label: 'A4 Sheet Grid', desc: 'Multi-label sticker sheet' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPrintPlacement(opt.id)}
                                            style={{
                                                padding: '0.5rem 0.6rem',
                                                borderRadius: '8px',
                                                border: printPlacement === opt.id ? '2px solid #1B6B3A' : '1px solid #cbd5e1',
                                                background: printPlacement === opt.id ? '#F0FDF4' : '#ffffff',
                                                color: printPlacement === opt.id ? '#166534' : '#475569',
                                                cursor: 'pointer',
                                                textAlign: 'left'
                                            }}
                                        >
                                            <div style={{ fontSize: '0.76rem', fontWeight: '800' }}>{opt.label}</div>
                                            <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '2px' }}>{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>

                                {printPlacement === 'sheet_grid' && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px dashed #cbd5e1' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#475569' }}>
                                            Labels per Sheet:
                                        </span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[4, 8, 12, 16, 24].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setPrintCopies(num)}
                                                    style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        border: printCopies === num ? '1.5px solid #1B6B3A' : '1px solid #cbd5e1',
                                                        background: printCopies === num ? '#1B6B3A' : '#ffffff',
                                                        color: printCopies === num ? '#ffffff' : '#334155',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                            {/* Low Contrast Guard Badge */}
                            {isLowContrast && (
                                <div style={{ 
                                    marginBottom: '1rem', 
                                    background: '#FEF2F2', 
                                    border: '1px solid #FCA5A5', 
                                    padding: '6px 14px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.74rem', 
                                    color: '#B91C1C', 
                                    fontWeight: '750', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px' 
                                }}>
                                    <span>⚠️ Low Contrast Protected: Showing high-contrast preview to prevent blank bills.</span>
                                </div>
                            )}

                            {/* Dynamic Canvas Container matching selected preset */}
                            <div 
                                ref={barcodeRef} 
                                style={{ 
                                    padding: '1.75rem 1.5rem', 
                                    background: format.background, 
                                    borderRadius: selectedPreset === 'custom' ? `${customTemplateConfig.borderRadius}px` : '16px', 
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: effectiveLineColor, 
                                    width: selectedPreset === 'jewelry' ? '280px' : `${Math.max(340, Math.min(640, 240 + ((format.width || 2) * 60)))}px`, 
                                    maxWidth: '100%', 
                                    overflowX: 'auto', 
                                    boxSizing: 'border-box', 
                                    border: selectedPreset === 'custom' && customTemplateConfig.borderStyle !== 'none'
                                        ? `${customTemplateConfig.borderWidth}px ${customTemplateConfig.borderStyle} ${customTemplateConfig.borderColor}`
                                        : (selectedPreset === 'custom' && customTemplateConfig.borderStyle === 'none' ? 'none' : `2px solid ${format.borderColor || '#e2e8f0'}`), 
                                    position: 'relative' 
                                }}
                            >
                                {/* CUSTOM STORE HEADER BANNER */}
                                {selectedPreset === 'custom' && customTemplateConfig.headerText && (
                                    <div style={{ 
                                        width: '100%', 
                                        textAlign: customTemplateConfig.headerAlign || 'center', 
                                        fontSize: '0.82rem', 
                                        fontWeight: '900', 
                                        letterSpacing: '0.08em', 
                                        textTransform: 'uppercase', 
                                        borderBottom: `1.5px solid ${customTemplateConfig.borderColor || format.lineColor}30`, 
                                        paddingBottom: '0.4rem', 
                                        marginBottom: '0.65rem', 
                                        color: customTemplateConfig.borderColor || '#166534',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}>
                                        {customTemplateConfig.headerText}
                                    </div>
                                )}

                                {/* TOP BRANDING & BADGE HEADER ROW (NATURAL FLOW, NO OVERLAY) */}
                                {((selectedPreset !== 'custom' || customTemplateConfig.showLogo) && logoUrl || (selectedPreset !== 'custom' || customTemplateConfig.showBadge) && getEffectiveBadge()) && (
                                    <div style={{ 
                                        width: '100%', 
                                        display: 'flex', 
                                        justifyContent: (selectedPreset !== 'custom' || customTemplateConfig.showLogo) && logoUrl ? 'space-between' : 'flex-end', 
                                        alignItems: 'center', 
                                        marginBottom: '0.65rem',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {(selectedPreset !== 'custom' || customTemplateConfig.showLogo) && logoUrl ? (
                                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                                <img src={logoUrl} alt="Store Logo" style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                                                    title="Remove logo"
                                                    style={{ 
                                                        position: 'absolute', 
                                                        top: '-6px', 
                                                        right: '-14px', 
                                                        width: '18px', 
                                                        height: '18px', 
                                                        borderRadius: '50%', 
                                                        background: '#ef4444', 
                                                        color: '#ffffff', 
                                                        border: 'none', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                                    }}
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        ) : <div />}

                                        {(selectedPreset !== 'custom' || customTemplateConfig.showBadge) && (() => {
                                            const badge = getEffectiveBadge();
                                            if (!badge) return null;
                                            return (
                                                <div style={{ 
                                                    fontSize: '0.66rem', 
                                                    fontWeight: '800', 
                                                    background: badge.bg, 
                                                    color: badge.color, 
                                                    border: `1px solid ${badge.border}`, 
                                                    padding: '2px 7px', 
                                                    borderRadius: '6px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {badge.icon && <span>{badge.icon}</span>}
                                                    <span>{badge.text}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Dynamic In-Label Placement Layout */}
                                {barcodePlacement === 'top' && (
                                    <>
                                        {renderCanvasBarcode(false)}
                                        {renderCanvasInfo()}
                                        {renderCanvasPricing()}
                                    </>
                                )}

                                {barcodePlacement === 'bottom' && (
                                    <>
                                        {renderCanvasInfo()}
                                        {renderCanvasPricing()}
                                        {renderCanvasBarcode(false)}
                                    </>
                                )}

                                {barcodePlacement === 'side_by_side' && (
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                            {renderCanvasInfo()}
                                            {renderCanvasPricing()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: barcodeAlign === 'left' ? 'flex-start' : barcodeAlign === 'right' ? 'flex-end' : 'center' }}>
                                            {renderCanvasBarcode(false)}
                                        </div>
                                    </div>
                                )}

                                {barcodePlacement === 'center' && (
                                    <>
                                        {renderCanvasInfo()}
                                        {renderCanvasBarcode(false)}
                                        {renderCanvasPricing()}
                                    </>
                                )}

                                {renderCanvasFooter()}
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

            {/* CODE 128 SCAN PREVIEW MODAL */}
            {isScanPreviewOpen && (
                <div 
                    onClick={() => setIsScanPreviewOpen(false)}
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        background: 'rgba(15, 23, 42, 0.75)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        zIndex: 1200, 
                        backdropFilter: 'blur(8px)', 
                        padding: '1.5rem' 
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            background: 'white', 
                            width: '100%', 
                            maxWidth: '580px', 
                            borderRadius: '24px', 
                            padding: '2rem', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', 
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#E8F5EE', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Scan size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: '#0F172A' }}>Code 128 Scan Preview</h3>
                                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>High-resolution enlarged barcode preview for easy barcode scanner testing</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsScanPreviewOpen(false)} 
                                style={{ border: 'none', background: '#F1F5F9', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Instruction Banner */}
                        <div style={{ width: '100%', background: '#F0FDF4', border: '1px solid #DCF2E4', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#166534', fontSize: '0.82rem', fontWeight: '750' }}>
                            <Scan size={18} color="#166534" />
                            <span>Scan barcode to test. Ensure clear print quality for best scanning.</span>
                        </div>

                        {/* ENLARGED BARCODE CANVAS CONTAINER */}
                        <div style={{ 
                            padding: '2.25rem 2rem', 
                            background: format.background, 
                            borderRadius: '16px', 
                            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: effectiveLineColor,
                            width: '100%',
                            maxWidth: '440px',
                            boxSizing: 'border-box',
                            border: `2px solid ${format.borderColor || '#e2e8f0'}`,
                            position: 'relative',
                            marginBottom: '1.75rem'
                        }}>
                            {/* TOP BRANDING & BADGE HEADER ROW (NATURAL FLOW, NO OVERLAY) */}
                            {((selectedPreset !== 'custom' || customTemplateConfig.showLogo) && logoUrl || (selectedPreset !== 'custom' || customTemplateConfig.showBadge) && getEffectiveBadge()) && (
                                <div style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: logoUrl ? 'space-between' : 'flex-end', 
                                    alignItems: 'center', 
                                    marginBottom: '0.75rem',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    {logoUrl ? (
                                        <div style={{ textAlign: 'left' }}>
                                            <img src={logoUrl} alt="Store Logo" style={{ maxHeight: '42px', maxWidth: '140px', objectFit: 'contain' }} />
                                        </div>
                                    ) : <div />}

                                    {(() => {
                                        const badge = getEffectiveBadge();
                                        if (!badge) return null;
                                        return (
                                            <div style={{ 
                                                fontSize: '0.72rem', 
                                                fontWeight: '800', 
                                                background: badge.bg, 
                                                color: badge.color, 
                                                border: `1px solid ${badge.border}`, 
                                                padding: '3px 9px', 
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {badge.icon && <span>{badge.icon}</span>}
                                                <span>{badge.text}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Dynamic Layout in Scan Preview Modal */}
                            {barcodePlacement === 'top' && (
                                <>
                                    {renderCanvasBarcode(true)}
                                    {renderCanvasInfo()}
                                    {renderCanvasPricing()}
                                </>
                            )}

                            {barcodePlacement === 'bottom' && (
                                <>
                                    {renderCanvasInfo()}
                                    {renderCanvasPricing()}
                                    {renderCanvasBarcode(true)}
                                </>
                            )}

                            {barcodePlacement === 'side_by_side' && (
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                        {renderCanvasInfo()}
                                        {renderCanvasPricing()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: barcodeAlign === 'left' ? 'flex-start' : barcodeAlign === 'right' ? 'flex-end' : 'center' }}>
                                        {renderCanvasBarcode(true)}
                                    </div>
                                </div>
                            )}

                            {barcodePlacement === 'center' && (
                                <>
                                    {renderCanvasInfo()}
                                    {renderCanvasBarcode(true)}
                                    {renderCanvasPricing()}
                                </>
                            )}

                            {renderCanvasFooter()}
                        </div>

                        {/* Modal Actions Footer */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button 
                                onClick={() => setIsScanPreviewOpen(false)}
                                style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: '750', cursor: 'pointer', fontSize: '0.88rem' }}
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    handlePrint();
                                    setIsScanPreviewOpen(false);
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', borderRadius: '10px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(27, 107, 58, 0.25)' }}
                            >
                                <Printer size={18} /> Print Barcode Label
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default BusinessBarcode;
