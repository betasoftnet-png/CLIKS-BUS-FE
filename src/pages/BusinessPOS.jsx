import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Search, 
    Plus, 
    Minus, 
    Trash2, 
    User, 
    ShoppingBag, 
    CreditCard, 
    Smartphone, 
    DollarSign, 
    Filter, 
    Receipt, 
    ChevronRight,
    X,
    Check,
    Printer,
    TrendingUp,
    Calendar,
    Sparkles,
    CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inventoryService } from '../services/inventoryService';
import { productsService } from '../services/productsService';
import { crmService } from '../services/crmService';
import { posService } from '../services/posService';
import '../App.css';

const BusinessPOS = () => {
    const queryClient = useQueryClient();
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
    
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'flat'
    const [discountVal, setDiscountVal] = useState(0);
    const [taxRate, setTaxRate] = useState(18); // Default GST
    const [paymentMode, setPaymentMode] = useState('Cash');
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrderData, setLastOrderData] = useState(null);
    
    const customerInputRef = useRef(null);

    // 1. Fetch Unified Catalog (Combines Legacy Inventory + Standard Catalog Products)
    const { data: inventory = [], isLoading: isInventoryLoading } = useQuery({
        queryKey: ['pos-catalog'],
        queryFn: async () => {
            try {
                const [invRes, prodRes] = await Promise.all([
                    inventoryService.getInventory().catch(() => []),
                    productsService.getProducts().catch(() => [])
                ]);

                // Format Legacy Inventory items
                const legacyItems = (invRes || []).map(i => ({
                    id: i.id,
                    name: i.name,
                    sku: i.sku,
                    price: parseFloat(i.price) || 0,
                    quantity: parseFloat(i.quantity) || 0,
                    category: i.category || 'General',
                    source: 'inventory'
                }));

                // Format Central Catalog Products
                const catalogItems = (prodRes || []).map(p => ({
                    id: p.id,
                    name: p.product_name || p.name,
                    sku: p.sku || p.hsn_code,
                    price: parseFloat(p.selling_price) || parseFloat(p.price) || 0,
                    quantity: parseFloat(p.stock) || parseFloat(p.quantity) || 0,
                    category: p.category_name || p.category || 'General',
                    source: 'products'
                }));

                // Aggregate and de-duplicate by exact case-insensitive name
                const allItems = [...catalogItems, ...legacyItems];
                const uniqueMap = new Map();
                allItems.forEach(item => {
                    if (!item.name) return;
                    const key = item.name.toLowerCase().trim();
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    }
                });
                return Array.from(uniqueMap.values());
            } catch (err) {
                console.error('[POS Unified Fetch] Error aggregating catalog:', err);
                return [];
            }
        }
    });

    // 2. Fetch Today's Summary
    const { data: todaySummary, refetch: refetchSummary } = useQuery({
        queryKey: ['pos-summary'],
        queryFn: posService.getTodaySummary,
        refetchOnWindowFocus: true
    });

    // 3. Fetch Customers for Quick Search
    const { data: customers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            return res.data || [];
        }
    });

    // 4. Checkout Mutation
    const checkoutMutation = useMutation({
        mutationFn: posService.checkout,
        onSuccess: (data) => {
            setLastOrderData(data);
            setShowReceiptModal(true);
            setIsCheckingOut(false);
            // Reset Cart
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setSelectedCustomerObj(null);
            setDiscountVal(0);
            
            // Refetch to reflect updated inventory & stats
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            refetchSummary();
        },
        onError: (error) => {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
            setIsCheckingOut(false);
        }
    });

    // Derived Categories
    const categories = ['All', ...new Set(inventory.map(i => i.category).filter(Boolean))];

    // Filtered Products Catalog
    const filteredProducts = inventory.filter(prod => {
        const matchesSearch = 
            (prod.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (prod.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Handlers
    const addToCart = (prod) => {
        if (prod.quantity <= 0) {
            alert('Product is out of stock!');
            return;
        }
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === prod.id);
            if (existing) {
                if (existing.quantity >= prod.quantity) {
                    alert('Cannot exceed available stock!');
                    return prevCart;
                }
                return prevCart.map(item => 
                    item.id === prod.id 
                        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * (prod.price || 0) }
                        : item
                );
            }
            return [...prevCart, {
                id: prod.id,
                name: prod.name,
                sku: prod.sku,
                price: prod.price || 0,
                quantity: 1,
                tax_rate: taxRate,
                unit: 'Pcs',
                total: prod.price || 0,
                source: prod.source
            }];
        });
    };

    const updateCartQty = (id, amount) => {
        setCart(prevCart => {
            const existing = prevCart.find(item => item.id === id);
            const invProd = inventory.find(p => p.id === id);
            const maxStock = invProd ? invProd.quantity : Infinity;

            if (existing) {
                const newQty = existing.quantity + amount;
                if (newQty > maxStock) {
                    alert('Cannot add more than available stock!');
                    return prevCart;
                }
                if (newQty <= 0) {
                    return prevCart.filter(item => item.id !== id);
                }
                return prevCart.map(item => 
                    item.id === id 
                        ? { ...item, quantity: newQty, total: newQty * item.price }
                        : item
                );
            }
            return prevCart;
        });
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    };

    const handleCustomerSelect = (cust) => {
        setSelectedCustomerObj(cust);
        setCustomerName(cust.name);
        setCustomerEmail(cust.email || '');
        setIsCustomerDropdownOpen(false);
    };

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    
    const discountAmount = discountType === 'percentage' 
        ? (subtotal * (parseFloat(discountVal) || 0) / 100)
        : (parseFloat(discountVal) || 0);
    
    const discountedTotal = Math.max(0, subtotal - discountAmount);
    const calculatedTax = discountedTotal * (taxRate / 100);
    const totalBeforeRound = discountedTotal + calculatedTax;
    const finalTotal = Math.round(totalBeforeRound);
    const roundOff = finalTotal - totalBeforeRound;

    const handleCheckout = (mode) => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);
        
        const payload = {
            client_name: customerName || 'Walk-in Customer',
            client_email: customerEmail || null,
            amount: subtotal,
            tax_amount: calculatedTax,
            total_amount: finalTotal,
            paid_amount: finalTotal,
            due_amount: 0,
            discount_amount: discountAmount,
            round_off: roundOff,
            payment_mode: mode,
            items: cart.map(item => ({
                id: item.id,
                description: item.name,
                quantity: item.quantity,
                price: item.price,
                tax_rate: taxRate,
                total: item.total,
                source: item.source
            }))
        };

        checkoutMutation.mutate(payload);
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear the current cart?')) {
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setSelectedCustomerObj(null);
            setDiscountVal(0);
        }
    };

    const printReceipt = () => {
        const printContents = document.getElementById('thermal-receipt-pane').innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = `
            <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body { font-family: monospace; font-size: 12px; color: #000; background: #fff; margin: 0; padding: 15px; text-align: center; }
                        h2, h3, p { margin: 4px 0; }
                        hr { border: 0.5px dashed #000; margin: 8px 0; }
                        .receipt-table { width: 100%; border-collapse: collapse; text-align: left; }
                        .receipt-table td { padding: 2px 0; }
                        .text-right { text-align: right; }
                    </style>
                </head>
                <body>
                    ${printContents}
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `;
        window.print();
        window.location.reload(); // Reload back to app
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 2rem)', gap: '1rem', padding: '1rem', background: '#F1F5F9', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Left Side: Product Catalog */}
            <div style={{ flex: '1 1 60%', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                
                {/* Header: Search & Summary Widget */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em' }}>Retail POS System</h1>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Speed Checkout Terminal #1</p>
                            </div>
                        </div>

                        {/* Simple Summary Badge */}
                        {todaySummary && (
                            <div style={{ display: 'flex', gap: '1.5rem', background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Today Orders</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#065F46' }}>{todaySummary.total_orders || 0}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Total Sales</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#065F46' }}>₹{(todaySummary.total_sales || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search bar */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search item name, category or barcode SKU..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 500, transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#10B981'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </div>
                        
                        {/* Category Chips Container */}
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px', maxWidth: '50%' }}>
                            {categories.slice(0, 5).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        border: selectedCategory === cat ? '1px solid #10B981' : '1px solid #E2E8F0',
                                        background: selectedCategory === cat ? '#ECFDF5' : '#FFFFFF',
                                        color: selectedCategory === cat ? '#047857' : '#64748B',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#F8FAFC' }}>
                    {isInventoryLoading ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748B' }}>
                            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', marginBottom: '0.5rem' }}></div>
                            <span>Loading catalog matrix...</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8', gap: '0.75rem' }}>
                            <ShoppingBag size={32} opacity={0.5} />
                            <span>No products matching selection</span>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                            <AnimatePresence>
                                {filteredProducts.map(prod => {
                                    const isOutOfStock = (prod.quantity || 0) <= 0;
                                    const isLowStock = (prod.quantity || 0) > 0 && (prod.quantity || 0) < 10;
                                    
                                    return (
                                        <motion.div
                                            layout
                                            key={prod.id}
                                            whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => !isOutOfStock && addToCart(prod)}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '14px',
                                                padding: '0.85rem',
                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                position: 'relative',
                                                opacity: isOutOfStock ? 0.6 : 1,
                                                transition: 'border 0.2s'
                                            }}
                                        >
                                            {/* Visual Tag for Category */}
                                            <span style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{prod.category || 'General'}</span>
                                            
                                            <div style={{ height: '40px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h4>
                                                {prod.sku && <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontFamily: 'monospace' }}>SKU: {prod.sku}</span>}
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                                                <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0F172A' }}>₹{(prod.price || 0).toLocaleString()}</span>
                                                <div style={{ 
                                                    padding: '0.15rem 0.4rem', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: '800',
                                                    background: isOutOfStock ? '#FEE2E2' : (isLowStock ? '#FFFBEB' : '#ECFDF5'),
                                                    color: isOutOfStock ? '#B91C1C' : (isLowStock ? '#B45309' : '#047857')
                                                }}>
                                                    {isOutOfStock ? 'OUT' : `${prod.quantity} left`}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Live Cart Workspace */}
            <div style={{ flex: '1 1 40%', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                
                {/* Customer Attachment Row */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #F1F5F9', background: '#FFF', flexShrink: 0 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.4rem 0.75rem' }}>
                            <User size={16} color="#64748B" />
                            <input 
                                ref={customerInputRef}
                                type="text" 
                                placeholder="Assign Customer (e.g., Walk-in / Search CRM...)" 
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: '650', color: '#1E293B' }}
                            />
                            {customerName && (
                                <button 
                                    onClick={() => { setCustomerName(''); setCustomerEmail(''); setSelectedCustomerObj(null); }}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', color: '#94A3B8' }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Dropdown autocomplete for Customers */}
                        {isCustomerDropdownOpen && customerName.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #E2E8F0', borderRadius: '10px', marginTop: '4px', zIndex: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', maxHeight: '160px', overflowY: 'auto' }}>
                                {customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).slice(0, 5).map(cust => (
                                    <div
                                        key={cust.id}
                                        onClick={() => handleCustomerSelect(cust)}
                                        style={{ padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #F8FAFC', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span style={{ fontWeight: '750', color: '#1E293B' }}>{cust.name}</span>
                                        {cust.phone && <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{cust.phone}</span>}
                                    </div>
                                ))}
                                <div 
                                    onClick={() => setIsCustomerDropdownOpen(false)}
                                    style={{ padding: '0.5rem', textAlign: 'center', background: '#F8FAFC', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}>
                                    Close List
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Cart Items Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94A3B8', gap: '0.75rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Receipt size={24} opacity={0.6} />
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Cart is Empty</span>
                            <span style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: '180px' }}>Select products from catalog to begin billing.</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #F1F5F9' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Cart List ({cart.length})</span>
                                <button onClick={clearCart} style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>Clear All</button>
                            </div>
                            
                            <AnimatePresence initial={false}>
                                {cart.map(item => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            background: '#FFFFFF',
                                            padding: '0.65rem 0',
                                            borderBottom: '1px solid #F8FAFC'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '750', color: '#1E293B' }}>{item.name}</p>
                                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                                                <span>₹{item.price.toLocaleString()}</span>
                                                <span>x</span>
                                                <span style={{ fontWeight: '700', color: '#1E293B' }}>{item.quantity}</span>
                                            </div>
                                        </div>

                                        {/* Quantity Selectors */}
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '8px', padding: '2px' }}>
                                            <button onClick={() => updateCartQty(item.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ width: '26px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>{item.quantity}</span>
                                            <button onClick={() => updateCartQty(item.id, 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div style={{ width: '70px', textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>₹{item.total.toLocaleString()}</span>
                                        </div>

                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', padding: '0.25rem', cursor: 'pointer', display: 'flex', opacity: 0.6 }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Dynamic Totals Panel footer */}
                <div style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                    
                    {/* Discount & Tax Quick adjustment Row */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Discount</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => setDiscountType('percentage')} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.65rem', fontWeight: discountType === 'percentage' ? '800' : '400', color: discountType === 'percentage' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}>%</button>
                                    <span style={{ fontSize: '0.65rem', color: '#E2E8F0' }}>|</span>
                                    <button onClick={() => setDiscountType('flat')} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.65rem', fontWeight: discountType === 'flat' ? '800' : '400', color: discountType === 'flat' ? '#10B981' : '#94A3B8', cursor: 'pointer' }}>Flat</button>
                                </div>
                            </div>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={discountVal || ''}
                                onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                                style={{ width: '100%', padding: '0.4rem 0.75rem', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>GST Tax (%)</span>
                            <select 
                                value={taxRate}
                                onChange={(e) => setTaxRate(parseInt(e.target.value))}
                                style={{ width: '100%', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', fontWeight: '700', background: 'white', outline: 'none' }}>
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>
                    </div>

                    {/* Receipt Tally breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#EF4444', fontWeight: '500' }}>
                                <span>Discount ({discountType === 'percentage' ? `${discountVal}%` : 'Flat'})</span>
                                <span>- ₹{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B' }}>
                            <span>GST ({taxRate}%)</span>
                            <span>₹{calculatedTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        {Math.abs(roundOff) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94A3B8' }}>
                                <span>Round Off</span>
                                <span>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Grand total Display */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#0F172A' }}>Payable Amount</span>
                        <span style={{ fontSize: '1.65rem', fontWeight: '950', color: '#0F172A', letterSpacing: '-0.03em' }}>₹{finalTotal.toLocaleString()}</span>
                    </div>

                    {/* Checkout Payment Action Matrix */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('Cash')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <DollarSign size={18} />
                            Cash (F1)
                        </button>

                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('UPI')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <Smartphone size={18} />
                            UPI (F2)
                        </button>

                        <button
                            disabled={cart.length === 0 || isCheckingOut}
                            onClick={() => handleCheckout('Card')}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                opacity: cart.length === 0 ? 0.6 : 1,
                                boxShadow: cart.length > 0 ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(0.97)')}
                            onMouseUp={(e) => cart.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <CreditCard size={18} />
                            Card (F3)
                        </button>
                    </div>
                </div>
            </div>

            {/* SUCCESS RECEIPT POPUP MODAL */}
            {showReceiptModal && lastOrderData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'white',
                            width: '380px',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', padding: '1.5rem', color: 'white', textAlign: 'center', position: 'relative' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <Check size={24} strokeWidth={3} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900' }}>Payment Successful!</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Order {lastOrderData.invoice_number} generated</p>
                        </div>

                        {/* Thermal Receipt Workspace (to print) */}
                        <div id="thermal-receipt-pane" style={{ padding: '1.5rem', background: '#FFFFFF', flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'monospace', color: '#000' }}>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', textTransform: 'uppercase' }}>CLIKS BUSINESS POS</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem' }}>Phone: +91 98765 43210</p>
                                <p style={{ margin: '2px 0 8px', fontSize: '0.75rem' }}>Receipt No: {lastOrderData.invoice_number}</p>
                                
                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />
                                
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Date: {new Date(lastOrderData.created_at).toLocaleDateString()}</span>
                                    <span>Time: {new Date(lastOrderData.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', marginBottom: '8px' }}>
                                    <span>Customer: {lastOrderData.client_name}</span>
                                </div>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '4px 0 8px' }} />

                                {/* Items Table */}
                                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ textAlign: 'left', padding: '2px 0' }}>ITEM</th>
                                            <th style={{ textAlign: 'center', padding: '2px 0' }}>QTY</th>
                                            <th style={{ textAlign: 'right', padding: '2px 0' }}>AMT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lastOrderData.items && (typeof lastOrderData.items === 'string' ? JSON.parse(lastOrderData.items) : lastOrderData.items).map((item, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '4px 0', maxWidth: '140px', overflow: 'hidden' }}>{item.description}</td>
                                                <td style={{ padding: '4px 0', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '4px 0', textAlign: 'right' }}>₹{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '8px 0' }} />

                                {/* Tally */}
                                <div style={{ width: '100%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>SUBTOTAL:</span>
                                        <span>₹{lastOrderData.amount}</span>
                                    </div>
                                    {lastOrderData.discount_amount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>DISCOUNT:</span>
                                            <span>- ₹{lastOrderData.discount_amount}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>TAX (GST):</span>
                                        <span>₹{lastOrderData.tax_amount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '4px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                                        <span>GRAND TOTAL:</span>
                                        <span>₹{lastOrderData.total_amount}</span>
                                    </div>
                                </div>

                                <div style={{ width: '100%', borderBottom: '1px dashed #000', margin: '12px 0' }} />
                                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>MODE: {lastOrderData.payment_mode.toUpperCase()}</p>
                                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>Thank you for your business!</p>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div style={{ padding: '1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem' }}>
                            <button 
                                onClick={printReceipt}
                                style={{ 
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                                    padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', 
                                    background: 'white', color: '#1E293B', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                                }}
                            >
                                <Printer size={16} /> Print
                            </button>
                            <button 
                                onClick={() => setShowReceiptModal(false)}
                                style={{ 
                                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none', 
                                    background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                                }}
                            >
                                New Order
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BusinessPOS;
