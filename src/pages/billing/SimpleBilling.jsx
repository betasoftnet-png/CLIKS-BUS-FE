import React, { useState } from 'react';
import { 
    Plus, 
    Trash2, 
    User, 
    CheckCircle2, 
    Receipt, 
    ArrowRight,
    ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    quantity: 1
});

const SimpleBilling = () => {
    const navigate = useNavigate();
    const [billingOrder, setBillingOrder] = useState(() => 'ORD-' + Math.floor(100000 + Math.random() * 900000));
    const [customerName, setCustomerName] = useState('');
    const [products, setProducts] = useState([createEmptyProduct()]);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);
    const [submittedRecordId, setSubmittedRecordId] = useState(null);

    // Calculate totals
    const calculateProductTotal = (rate, quantity) => {
        const r = parseFloat(rate) || 0;
        const q = parseFloat(quantity) || 0;
        return r * q;
    };

    const totalQuantity = products.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
    const grandTotal = products.reduce((sum, item) => sum + calculateProductTotal(item.rate, item.quantity), 0);

    // Dynamic Product Row Management
    const handleProductChange = (index, field, value) => {
        const updated = [...products];
        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([...products, createEmptyProduct()]);
    };

    const handleRemoveProduct = (index) => {
        if (products.length === 1) {
            setProducts([createEmptyProduct()]);
            return;
        }
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleSubmitBill = (e) => {
        e.preventDefault();

        // Basic validation
        if (!customerName.trim()) {
            alert('Please enter a Customer Name.');
            return;
        }

        const validProducts = products.filter(p => p.name.trim() !== '');
        if (validProducts.length === 0) {
            alert('Please enter at least one product with a name.');
            return;
        }

        const formattedProducts = validProducts.map(p => {
            const r = parseFloat(p.rate) || 0;
            const q = parseFloat(p.quantity) || 0;
            return {
                id: p.id,
                name: p.name.trim(),
                rate: r,
                quantity: q,
                total: r * q
            };
        });

        const currentOrderId = billingOrder.trim() || ('ORD-' + Math.floor(100000 + Math.random() * 900000));

        const newRecord = {
            id: currentOrderId,
            billingOrder: currentOrderId,
            customerName: customerName.trim(),
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
        setSubmittedRecordId(newRecord.id);
        setSubmittedSuccess(true);

        // Reset form
        setCustomerName('');
        setBillingOrder('ORD-' + Math.floor(100000 + Math.random() * 900000));
        setProducts([createEmptyProduct()]);

        setTimeout(() => {
            setSubmittedSuccess(false);
        }, 5000);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B3A', marginBottom: '0.25rem' }}>
                        <Receipt size={22} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billing Module</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                        Simple Billing
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                        Generate quick bills, add multiple items, and keep track of your customer sales.
                    </p>
                </div>

                <button
                    id="btn-view-billing-records"
                    onClick={() => navigate('/billing/records')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.25rem',
                        background: '#FFFFFF',
                        color: '#1B6B3A',
                        border: '1.5px solid #1B6B3A',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#F0FDF4';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                    }}
                >
                    View Billing Records <ArrowRight size={16} />
                </button>
            </div>

            {/* Success Alert Banner */}
            {submittedSuccess && (
                <div style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    border: '1px solid #A7F3D0',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ background: '#10B981', color: '#FFFFFF', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#065F46', fontWeight: 800, fontSize: '1rem' }}>
                                Billing Order #{submittedRecordId} Submitted Successfully!
                            </h4>
                            <p style={{ margin: '0.2rem 0 0 0', color: '#047857', fontSize: '0.85rem' }}>
                                The bill record has been saved and is available under Billing Records.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/billing/records')}
                        style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '0.55rem 1rem',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        Go to Records
                    </button>
                </div>
            )}

            {/* Main Billing Form Card */}
            <form onSubmit={handleSubmitBill} style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
            }}>
                {/* Section 1: Billing Order & Customer Details */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    {/* Billing Order */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.5rem'
                        }}>
                            <Receipt size={15} style={{ color: '#1B6B3A' }} /> Billing Order # <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            id="input-billing-order"
                            type="text"
                            placeholder="Billing Order No. (e.g. ORD-849201)"
                            value={billingOrder}
                            onChange={(e) => setBillingOrder(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: '1.5px solid #CBD5E1',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: '#1B6B3A',
                                background: '#F0FDF4',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1B6B3A';
                                e.target.style.boxShadow = '0 0 0 3px rgba(27, 107, 58, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#CBD5E1';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Customer Name */}
                    <div>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.5rem'
                        }}>
                            <User size={15} style={{ color: '#1B6B3A' }} /> Customer Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                            id="input-customer-name"
                            type="text"
                            placeholder="Enter Customer Name (e.g. John Doe / Sharma Enterprises)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: '1.5px solid #CBD5E1',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#0F172A',
                                background: '#F8FAFC',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1B6B3A';
                                e.target.style.background = '#FFFFFF';
                                e.target.style.boxShadow = '0 0 0 3px rgba(27, 107, 58, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#CBD5E1';
                                e.target.style.background = '#F8FAFC';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '2rem' }} />

                {/* Section 2: Product Entries */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingBag size={18} style={{ color: '#1B6B3A' }} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>
                                Product Items
                            </h3>
                        </div>

                        <button
                            id="btn-add-multiple-products"
                            type="button"
                            onClick={handleAddProduct}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#F0FDF4',
                                color: '#1B6B3A',
                                border: '1px solid #BBF7D0',
                                padding: '0.55rem 1rem',
                                borderRadius: '10px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#DCFCE7'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#F0FDF4'}
                        >
                            <Plus size={16} /> Add Multiple Products
                        </button>
                    </div>

                    {/* Desktop & Mobile Responsive Table Container */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '0.5rem 0.75rem', width: '40%' }}>Product Name</th>
                                    <th style={{ padding: '0.5rem 0.75rem', width: '20%' }}>Selling Rate (₹)</th>
                                    <th style={{ padding: '0.5rem 0.75rem', width: '15%' }}>Quantity</th>
                                    <th style={{ padding: '0.5rem 0.75rem', width: '20%', textAlign: 'right' }}>Automatic Total (₹)</th>
                                    <th style={{ padding: '0.5rem 0.75rem', width: '5%', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => {
                                    const itemTotal = calculateProductTotal(item.rate, item.quantity);
                                    return (
                                        <tr key={item.id} style={{ background: '#F8FAFC', borderRadius: '12px' }}>
                                            {/* Product Name */}
                                            <td style={{ padding: '0.75rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Product Name (e.g. Wireless Mouse)"
                                                    value={item.name}
                                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.6rem 0.85rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        color: '#0F172A',
                                                        background: '#FFFFFF',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>

                                            {/* Selling Rate */}
                                            <td style={{ padding: '0.75rem' }}>
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
                                                        padding: '0.6rem 0.85rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        color: '#0F172A',
                                                        background: '#FFFFFF',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>

                                            {/* Quantity */}
                                            <td style={{ padding: '0.75rem' }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="any"
                                                    placeholder="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                    required
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.6rem 0.85rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        color: '#0F172A',
                                                        background: '#FFFFFF',
                                                        outline: 'none',
                                                        boxSizing: 'border-box'
                                                    }}
                                                />
                                            </td>

                                            {/* Automatic Product Total */}
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: '#1B6B3A', fontSize: '0.95rem' }}>
                                                ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            {/* Action Delete */}
                                            <td style={{ padding: '0.75rem', textAlign: 'center', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#94A3B8',
                                                        cursor: 'pointer',
                                                        padding: '6px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.color = '#EF4444';
                                                        e.currentTarget.style.background = '#FEE2E2';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.color = '#94A3B8';
                                                        e.currentTarget.style.background = 'transparent';
                                                    }}
                                                    title="Remove Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Add Product Button */}
                    <button
                        type="button"
                        onClick={handleAddProduct}
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'transparent',
                            color: '#1B6B3A',
                            border: '1.5px dashed #A7F3D0',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#F0FDF4';
                            e.currentTarget.style.borderColor = '#1B6B3A';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = '#A7F3D0';
                        }}
                    >
                        <Plus size={18} /> Add Multiple Products
                    </button>
                </div>

                <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '2rem' }} />

                {/* Section 3: Totals & Submit */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    background: '#F8FAFC',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0'
                }}>
                    <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                        {/* Total Quantity */}
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Total Quantity
                            </span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>
                                {totalQuantity} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>items</span>
                            </span>
                        </div>

                        {/* Grand Total */}
                        <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Grand Total
                            </span>
                            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1B6B3A' }}>
                                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        id="btn-submit-bill"
                        type="submit"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.85rem 2rem',
                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(27, 107, 58, 0.25)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 18px rgba(27, 107, 58, 0.35)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(27, 107, 58, 0.25)';
                        }}
                    >
                        <CheckCircle2 size={20} /> Submit Bill
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SimpleBilling;
