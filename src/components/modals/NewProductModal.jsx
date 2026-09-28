/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { X, PackagePlus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../../services';
import { useCurrency } from '../../context/CurrencyContext';

export const NewProductModal = ({ isOpen, onClose, onSuccess, onProductCreated }) => {
    const { currency } = useCurrency();
    const queryClient = useQueryClient();

    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [mfgDate, setMfgDate] = useState('');

    const [form, setForm] = useState({
        name: '',
        sku: '',
        category: 'General',
        primary_unit: 'pcs',
        purchase_price: '',
        selling_price: '',
        tax_percentage: 18,
        hsn_code: ''
    });

    const [error, setError] = useState('');

    const createMutation = useMutation({
        mutationFn: (data) => productsService.createProduct(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            
            const normalizedProduct = {
                id: data.id || data.product_id,
                product_id: data.id || data.product_id,
                name: data.name || data.product_name || form.name,
                product_name: data.name || data.product_name || form.name,
                sku: data.sku || form.sku,
                purchase_price: parseFloat(data.purchase_price || form.purchase_price || 0),
                price: parseFloat(data.price || data.selling_price || form.selling_price || form.purchase_price || 0),
                primary_unit: data.primary_unit || data.unit || form.primary_unit || 'pcs',
                gst_percentage: parseInt(data.tax_percentage || form.tax_percentage || 18, 10),
                tax_rate: parseInt(data.tax_percentage || form.tax_percentage || 18, 10),
                category: data.category || form.category || 'General',
                has_expiry: hasExpiry,
                is_perishable: hasExpiry,
                expiry_date: hasExpiry ? expiryDate : null,
                mfg_date: hasExpiry ? mfgDate : null,
                manufacturing_date: hasExpiry ? mfgDate : null
            };

            if (onProductCreated) {
                onProductCreated(normalizedProduct);
            }
            if (onSuccess) {
                onSuccess(normalizedProduct);
            }
            onClose();
        },
        onError: (err) => {
            setError(err?.response?.data?.message || err?.message || 'Failed to create product');
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) {
            setError('Product name is required');
            return;
        }

        const generatedSku = form.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
        const pPrice = parseFloat(form.purchase_price) || 0;
        const sPrice = parseFloat(form.selling_price) || (pPrice > 0 ? parseFloat((pPrice * 1.2).toFixed(2)) : 0);

        const payload = {
            name: form.name.trim(),
            product_name: form.name.trim(),
            sku: generatedSku,
            category: form.category || 'General',
            category_name: form.category || 'General',
            primary_unit: form.primary_unit || 'pcs',
            unit: form.primary_unit || 'pcs',
            purchase_price: pPrice,
            selling_price: sPrice,
            price: sPrice,
            tax_percentage: parseInt(form.tax_percentage, 10) || 18,
            gst_percentage: parseInt(form.tax_percentage, 10) || 18,
            hsn_code: form.hsn_code.trim(),
            has_expiry: hasExpiry,
            is_perishable: hasExpiry,
            expiry_date: hasExpiry ? expiryDate : null,
            mfg_date: hasExpiry ? mfgDate : null,
            manufacturing_date: hasExpiry ? mfgDate : null,
            quantity: 0,
            stock: 0
        };

        createMutation.mutate(payload);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                            <PackagePlus size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#1E293B' }}>New Product Registration</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Quickly register an item to append directly to this order.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}>
                        <X size={18} color="#64748B" />
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '1rem', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Item Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                            Product / Item Name *
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Copper Wire 2.5mm / Arabica Coffee"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* SKU & Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                SKU Code (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Auto-generated if blank"
                                value={form.sku}
                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                Primary Unit
                            </label>
                            <select
                                value={form.primary_unit}
                                onChange={(e) => setForm({ ...form, primary_unit: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', fontWeight: '600', boxSizing: 'border-box' }}
                            >
                                <option value="pcs">Pieces (pcs)</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="box">Boxes (box)</option>
                                <option value="nos">Numbers (nos)</option>
                                <option value="meter">Meters (meter)</option>
                                <option value="litre">Litres (litre)</option>
                                <option value="pack">Packs (pack)</option>
                            </select>
                        </div>
                    </div>

                    {/* Purchase Price & Selling Price */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                Purchase Cost ({currency?.symbol || '₹'}) *
                            </label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0.00"
                                value={form.purchase_price}
                                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '700', color: '#064E3B', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                Selling Price / MRP ({currency?.symbol || '₹'})
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Optional"
                                value={form.selling_price}
                                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* GST % & HSN */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                GST Rate (%)
                            </label>
                            <select
                                value={form.tax_percentage}
                                onChange={(e) => setForm({ ...form, tax_percentage: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', background: 'white', fontWeight: '600', boxSizing: 'border-box' }}
                            >
                                <option value={0}>0% (Tax Exempt)</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>
                                HSN / SAC Code
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 8544"
                                value={form.hsn_code}
                                onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    {/* =================================================================== */}
                    {/* HAS EXPIRY / EXPIRY APPLICABLE TOGGLE                               */}
                    {/* =================================================================== */}
                    <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1rem' }}>
                        <label className="flex items-center gap-2.5 cursor-pointer select-none" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox"
                                checked={hasExpiry}
                                onChange={(e) => {
                                    setHasExpiry(e.target.checked);
                                    if (!e.target.checked) {
                                        setExpiryDate('');
                                        setMfgDate('');
                                    }
                                }}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                            />
                            <div>
                                <span className="text-xs font-bold text-gray-800" style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E293B', display: 'block' }}>
                                    Expiry Applicable / Perishable Product
                                </span>
                                <p className="text-[10px] text-gray-400 font-medium" style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748B' }}>
                                    Enable only for items with limited shelf-life (food, pharma, cosmetics). Leave unchecked for electronics, hardware, furniture, etc.
                                </p>
                            </div>
                        </label>

                        {/* Show MFG & Expiry Date inputs ONLY when hasExpiry is checked */}
                        {hasExpiry && (
                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-200/60 animate-in fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #E2E8F0' }}>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                        Manufacturing Date (MFG)
                                    </label>
                                    <input
                                        type="date"
                                        value={mfgDate}
                                        onChange={(e) => setMfgDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none"
                                        style={{ width: '100%', padding: '0.65rem', background: 'white', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', color: '#1E293B', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1" style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600"
                                        style={{ width: '100%', padding: '0.65rem', background: 'white', border: '1px solid #CBD5E1', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '600', color: '#1E293B', boxSizing: 'border-box' }}
                                        required={hasExpiry}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '0.7rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            style={{
                                padding: '0.7rem 1.4rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#064E3B',
                                color: 'white',
                                fontWeight: '800',
                                cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: createMutation.isPending ? 0.7 : 1
                            }}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating Product...
                                </>
                            ) : (
                                '+ Create & Append to PO'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductModal;
