import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Plus, 
    Minus,
    Trash2, 
    User, 
    CheckCircle2, 
    Receipt, 
    ArrowRight,
    ShoppingBag,
    Search,
    Printer,
    Share2,
    Check,
    Sparkles,
    CreditCard,
    Banknote,
    QrCode,
    RefreshCw,
    Clock,
    X,
    ChevronDown,
    Tag,
    FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BillingRecords from './BillingRecords';
import { productsService } from '../../services/productsService';
import { customerService } from '../../services/customerService';

export const LOCAL_STORAGE_KEY = 'cliks_billing_records_v1';

export const getSavedBillingRecords = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load billing records', e);
        return [];
    }
};

export const saveBillingRecord = (newRecord) => {
    try {
        const existing = getSavedBillingRecords();
        const updated = [newRecord, ...existing];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Failed to save billing record', e);
        return [];
    }
};

const createEmptyProduct = () => ({
    id: Date.now() + Math.random().toString(36).substring(2, 9),
    name: '',
    rate: '',
    quantity: 1,
    isCustom: true
});

const generateBillNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `BILL-${timestamp}`;
};

const PAYMENT_MODES = [
    { id: 'Cash', label: 'Cash', icon: Banknote, color: '#16A34A', bg: '#DCFCE7' },
    { id: 'UPI', label: 'UPI / QR', icon: QrCode, color: '#0284C7', bg: '#E0F2FE' },
    { id: 'Card', label: 'Card', icon: CreditCard, color: '#7C3AED', bg: '#EDE9FE' },
    { id: 'Credit', label: 'Pay Later', icon: Clock, color: '#D97706', bg: '#FEF3C7' }
];

const SimpleBilling = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create'); // 'create' | 'records'
    const [billingOrder, setBillingOrder] = useState(generateBillNumber);
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [products, setProducts] = useState([createEmptyProduct()]);
    
    // Existing catalog items & customers
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [catalogCustomers, setCatalogCustomers] = useState([]);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
    
    // Quick search state
    const [productSearch, setProductSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const searchDropdownRef = useRef(null);
    const customerDropdownRef = useRef(null);

    // Bill completion & Receipt preview modal
    const [submittedRecord, setSubmittedRecord] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [highlightedRowId, setHighlightedRowId] = useState(null);

    // Load existing catalog products & customers on mount
    useEffect(() => {
        let isMounted = true;
        const loadCatalog = async () => {
            setIsLoadingCatalog(true);
            try {
                const [prods, custs] = await Promise.all([
                    productsService.getProducts().catch(() => []),
                    customerService.getCustomers().catch(() => [])
                ]);

                if (isMounted) {
                    const cleanProds = Array.isArray(prods) ? prods : [];
                    const cleanCusts = Array.isArray(custs) ? custs : [];
                    setCatalogProducts(cleanProds);
                    setCatalogCustomers(cleanCusts);
                }
            } catch (err) {
                console.warn('Could not load products/customers catalog:', err);
            } finally {
                if (isMounted) setIsLoadingCatalog(false);
            }
        };

        loadCatalog();
        return () => { isMounted = false; };
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
                setIsSearchFocused(false);
            }
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
                setShowCustomerDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered catalog products for instant search
    const filteredCatalog = useMemo(() => {
        if (!productSearch.trim()) return catalogProducts.slice(0, 8);
        const term = productSearch.toLowerCase();
        return catalogProducts.filter(p => 
            p.name?.toLowerCase().includes(term) ||
            p.sku?.toLowerCase().includes(term) ||
            p.category?.toLowerCase().includes(term)
        ).slice(0, 8);
    }, [catalogProducts, productSearch]);

    // Quick pick popular / top products (first 6 items)
    const quickPickProducts = useMemo(() => {
        return catalogProducts.slice(0, 6);
    }, [catalogProducts]);

    // Calculate totals
    const calculateProductTotal = (rate, quantity) => {
        const r = parseFloat(rate) || 0;
        const q = parseFloat(quantity) || 0;
        return r * q;
    };

    const totalQuantity = products.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const grandTotal = products.reduce((sum, item) => sum + calculateProductTotal(item.rate, item.quantity), 0);

    // Add product from existing catalog
    const handleSelectCatalogProduct = (prod) => {
        const prodName = prod.name || 'Product';
        const prodPrice = parseFloat(prod.selling_price ?? prod.price ?? prod.rate ?? 0);

        // Check if already in the bill
        const existingIdx = products.findIndex(p => p.name.trim().toLowerCase() === prodName.trim().toLowerCase());

        if (existingIdx !== -1) {
            // Increment existing item quantity by 1
            const updated = [...products];
            const currentQty = parseFloat(updated[existingIdx].quantity) || 0;
            updated[existingIdx].quantity = currentQty + 1;
            setProducts(updated);
            
            // Highlight row temporarily
            setHighlightedRowId(updated[existingIdx].id);
            setTimeout(() => setHighlightedRowId(null), 1200);
        } else {
            // If the only row is empty, replace it
            const isSingleEmpty = products.length === 1 && !products[0].name.trim() && !products[0].rate;
            const newRow = {
                id: Date.now() + Math.random().toString(36).substring(2, 9),
                name: prodName,
                sku: prod.sku || '',
                category: prod.category || '',
                rate: prodPrice || '',
                quantity: 1,
                isCustom: false
            };

            if (isSingleEmpty) {
                setProducts([newRow]);
            } else {
                setProducts([...products, newRow]);
            }

            setHighlightedRowId(newRow.id);
            setTimeout(() => setHighlightedRowId(null), 1200);
        }

        setProductSearch('');
        setIsSearchFocused(false);
    };

    // Product row inputs
    const handleProductChange = (index, field, value) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    };

    // Quantity Stepper
    const handleQuantityChange = (index, delta) => {
        const updated = [...products];
        const currentQty = parseFloat(updated[index].quantity) || 1;
        const newQty = Math.max(1, currentQty + delta);
        updated[index].quantity = newQty;
        setProducts(updated);
    };

    const handleAddEmptyRow = () => {
        setProducts([...products, createEmptyProduct()]);
    };

    const handleRemoveProduct = (index) => {
        if (products.length === 1) {
            setProducts([createEmptyProduct()]);
            return;
        }
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleResetBill = () => {
        setBillingOrder(generateBillNumber());
        setCustomerName('Walk-in Customer');
        setCustomerPhone('');
        setPaymentMode('Cash');
        setProducts([createEmptyProduct()]);
        setProductSearch('');
    };

    // Submit Bill
    const handleSubmitBill = (e) => {
        if (e) e.preventDefault();

        const validProducts = products.filter(p => p.name.trim() !== '');
        if (validProducts.length === 0) {
            alert('Please add at least one product with a name.');
            return;
        }

        const formattedProducts = validProducts.map(p => {
            const r = parseFloat(p.rate) || 0;
            const q = parseFloat(p.quantity) || 1;
            return {
                id: p.id,
                name: p.name.trim(),
                sku: p.sku || '',
                rate: r,
                quantity: q,
                total: r * q
            };
        });

        const currentOrderId = billingOrder.trim() || generateBillNumber();

        const newRecord = {
            id: currentOrderId,
            billingOrder: currentOrderId,
            customerName: customerName.trim() || 'Walk-in Customer',
            customerPhone: customerPhone.trim(),
            paymentMode,
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            products: formattedProducts,
            totalQuantity,
            grandTotal
        };

        saveBillingRecord(newRecord);
        setSubmittedRecord(newRecord);
        setShowReceiptModal(true);

        // Reset inputs for next bill
        handleResetBill();
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    if (activeTab === 'records') {
        return <BillingRecords onNavigateToCreate={() => setActiveTab('create')} />;
    }

    const savedRecordsCount = getSavedBillingRecords().length;

    return (
        <div style={{ padding: '1.75rem', maxWidth: '1240px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            
            {/* Header with Navigation and Quick Switch */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', marginBottom: '0.2rem' }}>
                        <span style={{ 
                            background: '#DCFCE7', 
                            color: '#166534', 
                            padding: '3px 8px', 
                            borderRadius: '8px', 
                            fontSize: '0.72rem', 
                            fontWeight: 850, 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px' 
                        }}>
                            <Sparkles size={13} /> Quick Counter
                        </span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.025em' }}>
                        Simple Billing
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                        Quick-pick products, enter quantities, and generate customer receipts in seconds.
                    </p>
                </div>

                {/* Tab Switcher & Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                        type="button"
                        onClick={handleResetBill}
                        title="Clear current bill"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#F8FAFC',
                            color: '#64748B',
                            border: '1px solid #E2E8F0',
                            padding: '0.55rem 0.85rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 750,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#334155'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <RefreshCw size={14} /> Clear
                    </button>

                    <button
                        id="btn-view-billing-records"
                        type="button"
                        onClick={() => setActiveTab('records')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#FFFFFF',
                            color: '#1E293B',
                            border: '1px solid #CBD5E1',
                            padding: '0.55rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1B6B3A'; e.currentTarget.style.color = '#1B6B3A'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#1E293B'; }}
                    >
                        <Receipt size={16} />
                        <span>Past Records</span>
                        <span style={{ 
                            background: '#F1F5F9', 
                            color: '#475569', 
                            fontSize: '0.72rem', 
                            fontWeight: 850, 
                            padding: '1px 6px', 
                            borderRadius: '999px' 
                        }}>
                            {savedRecordsCount}
                        </span>
                        <ArrowRight size={14} style={{ color: '#94A3B8' }} />
                    </button>
                </div>
            </div>

            {/* Main Billing Canvas */}
            <form onSubmit={handleSubmitBill}>
                {/* 1. Customer & Bill Controls Card */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.25rem',
                    alignItems: 'center'
                }}>
                    {/* Customer Name Picker */}
                    <div style={{ position: 'relative' }} ref={customerDropdownRef}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 850, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <User size={13} style={{ color: '#1B6B3A' }} /> Customer
                            </span>
                            <span 
                                onClick={() => setCustomerName('Walk-in Customer')}
                                style={{ color: '#1B6B3A', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800 }}
                            >
                                Default Walk-in
                            </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="input-customer-name"
                                type="text"
                                placeholder="Customer Name (e.g. Walk-in Customer)"
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setShowCustomerDropdown(true);
                                }}
                                onFocus={() => setShowCustomerDropdown(true)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '12px',
                                    border: '1.5px solid #CBD5E1',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    background: '#F8FAFC',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {catalogCustomers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748B',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ChevronDown size={16} />
                                </button>
                            )}
                        </div>

                        {/* Dropdown for Existing Customers */}
                        {showCustomerDropdown && catalogCustomers.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '12px',
                                marginTop: '4px',
                                maxHeight: '180px',
                                overflowY: 'auto',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                zIndex: 50
                            }}>
                                <div 
                                    onClick={() => {
                                        setCustomerName('Walk-in Customer');
                                        setCustomerPhone('');
                                        setShowCustomerDropdown(false);
                                    }}
                                    style={{
                                        padding: '0.55rem 0.85rem',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 750,
                                        color: '#166534',
                                        background: '#F0FDF4',
                                        borderBottom: '1px solid #E2E8F0'
                                    }}
                                >
                                    👤 Walk-in Customer (General)
                                </div>
                                {catalogCustomers.map((cust, i) => {
                                    const cName = cust.name || cust.company_name || 'Customer';
                                    const cPhone = cust.phone || cust.mobile || '';
                                    return (
                                        <div
                                            key={cust.id || i}
                                            onClick={() => {
                                                setCustomerName(cName);
                                                if (cPhone) setCustomerPhone(cPhone);
                                                setShowCustomerDropdown(false);
                                            }}
                                            style={{
                                                padding: '0.55rem 0.85rem',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                borderBottom: '1px solid #F1F5F9',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                        >
                                            <span style={{ fontWeight: 700, color: '#1E293B' }}>{cName}</span>
                                            {cPhone && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{cPhone}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Bill Order Number */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', fontWeight: 850, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            <Receipt size={13} style={{ color: '#1B6B3A' }} /> Bill No.
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                                id="input-billing-order"
                                type="text"
                                value={billingOrder}
                                onChange={(e) => setBillingOrder(e.target.value)}
                                required
                                style={{
                                    flex: 1,
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '12px',
                                    border: '1.5px solid #CBD5E1',
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    color: '#166534',
                                    background: '#F0FDF4',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setBillingOrder(generateBillNumber())}
                                title="Generate New Bill Number"
                                style={{
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '12px',
                                    border: '1px solid #CBD5E1',
                                    background: '#F8FAFC',
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Payment Mode Pills */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 850, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Payment Method
                        </label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {PAYMENT_MODES.map(mode => {
                                const Icon = mode.icon;
                                const isSelected = paymentMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setPaymentMode(mode.id)}
                                        style={{
                                            flex: 1,
                                            minWidth: '70px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '5px',
                                            padding: '0.6rem 0.5rem',
                                            borderRadius: '10px',
                                            fontSize: '0.78rem',
                                            fontWeight: 800,
                                            border: isSelected ? `2px solid ${mode.color}` : '1px solid #E2E8F0',
                                            background: isSelected ? mode.bg : '#FFFFFF',
                                            color: isSelected ? mode.color : '#64748B',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        <Icon size={14} />
                                        <span>{mode.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Quick Product Search & Existing Products Chips */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShoppingBag size={18} style={{ color: '#1B6B3A' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#1E293B' }}>
                                Quick Add from Existing Products
                            </h3>
                        </div>
                        {catalogProducts.length > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                                {catalogProducts.length} items in inventory
                            </span>
                        )}
                    </div>

                    {/* Quick Search Input with Dropdown */}
                    <div style={{ position: 'relative' }} ref={searchDropdownRef}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input
                                type="text"
                                placeholder="🔍 Type product name or SKU to search & add..."
                                value={productSearch}
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    setIsSearchFocused(true);
                                }}
                                onFocus={() => setIsSearchFocused(true)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 2.75rem',
                                    borderRadius: '14px',
                                    border: isSearchFocused ? '2px solid #1B6B3A' : '1.5px solid #E2E8F0',
                                    fontSize: '0.92rem',
                                    fontWeight: 600,
                                    color: '#0F172A',
                                    background: '#F8FAFC',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.15s'
                                }}
                            />
                            {productSearch && (
                                <button
                                    type="button"
                                    onClick={() => setProductSearch('')}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#94A3B8',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Dropdown */}
                        {isSearchFocused && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: '#FFFFFF',
                                border: '1.5px solid #CBD5E1',
                                borderRadius: '14px',
                                marginTop: '6px',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                boxShadow: '0 12px 30px -4px rgba(0,0,0,0.12)',
                                zIndex: 60
                            }}>
                                {filteredCatalog.length > 0 ? (
                                    filteredCatalog.map((prod, idx) => {
                                        const pPrice = parseFloat(prod.selling_price ?? prod.price ?? prod.rate ?? 0);
                                        const pStock = prod.quantity ?? prod.stock ?? null;
                                        return (
                                            <div
                                                key={prod.id || idx}
                                                onClick={() => handleSelectCatalogProduct(prod)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderBottom: '1px solid #F1F5F9',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '1rem',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>{prod.name}</span>
                                                        {prod.category && (
                                                            <span style={{ fontSize: '0.68rem', background: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                                                {prod.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {prod.sku && (
                                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                                                            SKU: {prod.sku}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontWeight: 900, color: '#166534', fontSize: '0.95rem' }}>
                                                        ₹{pPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                    {pStock !== null && (
                                                        <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 750 }}>
                                                            Stock: {pStock}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748B' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem' }}>No catalog product found matching "{productSearch}".</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newRow = {
                                                    id: Date.now() + Math.random().toString(36).substring(2, 9),
                                                    name: productSearch.trim(),
                                                    rate: '',
                                                    quantity: 1,
                                                    isCustom: true
                                                };
                                                setProducts([...products, newRow]);
                                                setProductSearch('');
                                                setIsSearchFocused(false);
                                            }}
                                            style={{
                                                marginTop: '0.5rem',
                                                background: '#166534',
                                                color: 'white',
                                                border: 'none',
                                                padding: '4px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 750,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Add "{productSearch}" as Custom Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick-Pick Product Chips Carousel */}
                    {quickPickProducts.length > 0 && (
                        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 850, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Tag size={12} /> Popular:
                            </span>
                            {quickPickProducts.map((p, i) => {
                                const price = parseFloat(p.selling_price ?? p.price ?? p.rate ?? 0);
                                return (
                                    <button
                                        key={p.id || i}
                                        type="button"
                                        onClick={() => handleSelectCatalogProduct(p)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            background: '#F0FDF4',
                                            border: '1px solid #BBF7D0',
                                            borderRadius: '999px',
                                            padding: '4px 10px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#166534',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <Plus size={11} strokeWidth={3} />
                                        <span>{p.name}</span>
                                        <span style={{ color: '#047857', fontWeight: 900 }}>₹{price}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Items Bill Table */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E2E8F0',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Receipt size={17} style={{ color: '#1B6B3A' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 850, color: '#1E293B' }}>
                                Items in Bill ({products.length})
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddEmptyRow}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#F8FAFC',
                                color: '#1B6B3A',
                                border: '1px solid #CBD5E1',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '10px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        >
                            <Plus size={14} /> Add Manual Row
                        </button>
                    </div>

                    {/* Table View */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '0.4rem 0.75rem', width: '42%' }}>Item Description</th>
                                    <th style={{ padding: '0.4rem 0.75rem', width: '20%' }}>Rate (₹)</th>
                                    <th style={{ padding: '0.4rem 0.75rem', width: '18%', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '0.4rem 0.75rem', width: '15%', textAlign: 'right' }}>Total (₹)</th>
                                    <th style={{ padding: '0.4rem 0.75rem', width: '5%', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => {
                                    const itemTotal = calculateProductTotal(item.rate, item.quantity);
                                    const isHighlighted = highlightedRowId === item.id;

                                    return (
                                        <tr 
                                            key={item.id} 
                                            style={{ 
                                                background: isHighlighted ? '#ECFDF5' : '#F8FAFC', 
                                                borderRadius: '12px',
                                                transition: 'background 0.3s ease'
                                            }}
                                        >
                                            {/* Item Name */}
                                            <td style={{ padding: '0.65rem 0.75rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Product Name (e.g. Wireless Mouse)"
                                                    value={item.name}
                                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.55rem 0.75rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #CBD5E1',
                                                        fontSize: '0.88rem',
                                                        fontWeight: 750,
                                                        color: '#0F172A',
                                                        background: '#FFFFFF',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>

                                            {/* Rate */}
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontWeight: 800, fontSize: '0.85rem' }}>₹</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        placeholder="0.00"
                                                        value={item.rate}
                                                        onChange={(e) => handleProductChange(index, 'rate', e.target.value)}
                                                        required
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.55rem 0.75rem 0.55rem 1.6rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid #CBD5E1',
                                                            fontSize: '0.88rem',
                                                            fontWeight: 750,
                                                            color: '#0F172A',
                                                            background: '#FFFFFF',
                                                            outline: 'none',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Quantity with Smooth Stepper Buttons */}
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(index, -1)}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #CBD5E1',
                                                            background: '#FFFFFF',
                                                            color: '#475569',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            fontWeight: 900
                                                        }}
                                                    >
                                                        <Minus size={13} strokeWidth={3} />
                                                    </button>
                                                    
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="any"
                                                        value={item.quantity}
                                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                        required
                                                        style={{
                                                            width: '50px',
                                                            textAlign: 'center',
                                                            padding: '0.5rem 0.25rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid #CBD5E1',
                                                            fontSize: '0.88rem',
                                                            fontWeight: 850,
                                                            color: '#0F172A',
                                                            background: '#FFFFFF',
                                                            outline: 'none'
                                                        }}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(index, 1)}
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #CBD5E1',
                                                            background: '#FFFFFF',
                                                            color: '#166534',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            fontWeight: 900
                                                        }}
                                                    >
                                                        <Plus size={13} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Automatic Line Total */}
                                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 900, color: '#166534', fontSize: '0.95rem' }}>
                                                ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            {/* Delete Row Button */}
                                            <td style={{ padding: '0.65rem 0.75rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#94A3B8',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.15s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Bottom Sticky Summary Strip & Instant Submit */}
                <div style={{
                    background: 'linear-gradient(135deg, #064E3B 0%, #166534 100%)',
                    borderRadius: '20px',
                    padding: '1.25rem 1.75rem',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.4)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                                Total Items
                            </span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>
                                {totalQuantity} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D1FAE5' }}>units ({products.length} products)</span>
                            </span>
                        </div>

                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                                Payment By
                            </span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 850, color: '#FFFFFF' }}>
                                {paymentMode}
                            </span>
                        </div>

                        <div>
                            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                                Grand Total
                            </span>
                            <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#FFFFFF' }}>
                                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            id="btn-submit-bill"
                            type="submit"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#FFFFFF',
                                color: '#166534',
                                border: 'none',
                                padding: '0.85rem 1.75rem',
                                borderRadius: '14px',
                                fontSize: '0.98rem',
                                fontWeight: 900,
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                transition: 'all 0.15s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
                        >
                            <CheckCircle2 size={20} />
                            <span>Save & Print Bill</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* 5. Instant Thermal Receipt Modal */}
            {showReceiptModal && submittedRecord && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        width: '100%',
                        maxWidth: '440px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden'
                    }}>
                        {/* Receipt Top Bar */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: '#F8FAFC',
                            borderBottom: '1px solid #E2E8F0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                                <span style={{ fontWeight: 850, fontSize: '0.9rem', color: '#1E293B' }}>Bill Generated Successfully</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReceiptModal(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Printable Thermal Receipt Layout */}
                        <div id="printable-bill-receipt" style={{ padding: '1.5rem', fontFamily: "'Courier New', Courier, monospace" }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', fontFamily: 'sans-serif' }}>
                                    TAX INVOICE / CASH BILL
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                                    Bill #{submittedRecord.id}
                                </p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748B' }}>
                                    {submittedRecord.formattedDate}
                                </p>
                            </div>

                            <div style={{ borderTop: '1px dashed #CBD5E1', borderBottom: '1px dashed #CBD5E1', padding: '0.6rem 0', margin: '0.75rem 0', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Customer:</span>
                                    <strong>{submittedRecord.customerName}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                    <span>Payment Mode:</span>
                                    <strong>{submittedRecord.paymentMode || 'Cash'}</strong>
                                </div>
                            </div>

                            {/* Items List */}
                            <table style={{ width: '100%', fontSize: '0.78rem', margin: '0.75rem 0', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
                                        <th style={{ padding: '4px 0' }}>Item</th>
                                        <th style={{ padding: '4px 0', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '4px 0', textAlign: 'right' }}>Rate</th>
                                        <th style={{ padding: '4px 0', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submittedRecord.products.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px dotted #F1F5F9' }}>
                                            <td style={{ padding: '4px 0', fontWeight: 600 }}>{item.name}</td>
                                            <td style={{ padding: '4px 0', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{item.rate}</td>
                                            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>₹{item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Total Breakdown */}
                            <div style={{ borderTop: '1.5px dashed #0F172A', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Total Items:</span>
                                    <strong>{submittedRecord.totalQuantity}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, marginTop: '4px', color: '#0F172A' }}>
                                    <span>GRAND TOTAL:</span>
                                    <span>₹{submittedRecord.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: '1.25rem', marginBottom: 0 }}>
                                Thank you for your business!
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            background: '#F8FAFC',
                            borderTop: '1px solid #E2E8F0',
                            display: 'flex',
                            gap: '0.65rem'
                        }}>
                            <button
                                type="button"
                                onClick={handlePrintReceipt}
                                style={{
                                    flex: 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    background: '#166534',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '0.65rem',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <Printer size={16} /> Print Receipt
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowReceiptModal(false);
                                    setActiveTab('records');
                                }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    background: '#FFFFFF',
                                    color: '#475569',
                                    border: '1px solid #CBD5E1',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '10px',
                                    fontWeight: 750,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                View Records
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowReceiptModal(false)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    background: '#E2E8F0',
                                    color: '#1E293B',
                                    border: 'none',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '10px',
                                    fontWeight: 750,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                + New Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimpleBilling;
