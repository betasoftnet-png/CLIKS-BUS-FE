/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Info, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService, inventoryService, hsnService } from '../../services';
import { CurrencyContext } from '../../context/CurrencyContext';

export const QuickRegisterItemModal = ({
    isOpen = true,
    onClose,
    editingProduct = null,
    currency: propCurrency,
    dbWarehouses = [],
    onSuccess
}) => {
    const currencyCtx = useContext(CurrencyContext);
    const currency = propCurrency || currencyCtx?.currency || { symbol: '₹' };
    const queryClient = useQueryClient();


    const [name, setName] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [unit, setUnit] = useState('PCS');
    const [openingStock, setOpeningStock] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [category, setCategory] = useState('General');
    const [taxRate, setTaxRate] = useState('18% GST');
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [hsnCode, setHsnCode] = useState('');

    // HSN Intelligent Search State
    const [hsnSuggestions, setHsnSuggestions] = useState([]);
    const [isHsnLoading, setIsHsnLoading] = useState(false);
    const [showHsnDropdown, setShowHsnDropdown] = useState(false);
    const [hasSearchedHsn, setHasSearchedHsn] = useState(false);
    const [hsnQueryOverride, setHsnQueryOverride] = useState('');

    // HSN Info Description Popover State & Ref
    const [showHsnInfoPopover, setShowHsnInfoPopover] = useState(false);
    const [hsnInfoDescription, setHsnInfoDescription] = useState('');
    const [isHsnInfoLoading, setIsHsnInfoLoading] = useState(false);
    const hsnInfoRef = useRef(null);

    // Initialize or reset form state when modal opens or editingProduct changes
    useEffect(() => {
        if (!isOpen) return;

        if (editingProduct) {
            setName(editingProduct.name || editingProduct.product_name || '');
            setSellingPrice(editingProduct.price ? String(editingProduct.price) : (editingProduct.selling_price ? String(editingProduct.selling_price) : ''));
            setUnit(editingProduct.unit || editingProduct.primary_unit || 'PCS');
            const editingUnlimited = Boolean(editingProduct.isUnlimited || editingProduct.is_unlimited || (parseFloat(editingProduct.quantity) >= 999000));
            setIsUnlimited(editingUnlimited);
            setOpeningStock(editingUnlimited ? '999999' : (editingProduct.quantity !== undefined ? String(editingProduct.quantity) : ''));
            setCategory(editingProduct.category || editingProduct.category_name || 'General');
            const taxVal = editingProduct.tax_percentage ?? editingProduct.tax_rate ?? editingProduct.taxRate ?? 18;
            setTaxRate(`${taxVal}% GST`);
            setSku(editingProduct.sku || '');
            setBarcode(editingProduct.barcode || editingProduct.sku || '');
            setHsnCode(editingProduct.hsn_code || editingProduct.hsnCode || '');
            setHsnQueryOverride(editingProduct.hsn_code || editingProduct.hsnCode || '');
        } else {
            setName('');
            setSellingPrice('');
            setUnit('PCS');
            setOpeningStock('');
            setIsUnlimited(false);
            setCategory('General');
            setTaxRate('18% GST');
            setSku(`SKU-${Date.now().toString().slice(-4)}`);
            setBarcode(`SKU-${Date.now().toString().slice(-4)}`);
            setHsnCode('');
            setHsnQueryOverride('');
        }
        setHsnSuggestions([]);
        setShowHsnDropdown(false);
        setShowHsnInfoPopover(false);
    }, [isOpen, editingProduct]);

    const fetchAndShowHsnDescription = async (codeToFetch) => {
        const code = (codeToFetch || hsnCode || '').trim();
        if (!code) {
            setHsnInfoDescription('No HSN/SAC code entered.');
            setShowHsnInfoPopover(true);
            return;
        }

        const matchedSuggestion = hsnSuggestions.find(s =>
            String(s.hsnCode).trim() === code ||
            String(s.hsnCode).trim() === code.replace(/^0+/, '')
        );
        if (matchedSuggestion && matchedSuggestion.description) {
            setHsnInfoDescription(matchedSuggestion.description);
            setShowHsnInfoPopover(true);
            return;
        }

        setIsHsnInfoLoading(true);
        setShowHsnInfoPopover(true);
        try {
            const results = await hsnService.searchHSN(code);
            if (results && results.length > 0) {
                const exactMatch = results.find(r =>
                    String(r.hsnCode).trim() === code ||
                    String(r.hsnCode).trim() === code.replace(/^0+/, '')
                ) || results[0];
                setHsnInfoDescription(exactMatch.description || 'No HSN/SAC description available for this code.');
            } else {
                setHsnInfoDescription('No HSN/SAC description available for this code.');
            }
        } catch {
            setHsnInfoDescription('No HSN/SAC description available for this code.');
        } finally {
            setIsHsnInfoLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (hsnInfoRef.current && !hsnInfoRef.current.contains(event.target)) {
                setShowHsnInfoPopover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setShowHsnDropdown(false);
            setHsnSuggestions([]);
            setHsnQueryOverride('');
            setHasSearchedHsn(false);
            setShowHsnInfoPopover(false);
            return;
        }

        const query = (hsnQueryOverride || name || '').trim();
        if (query.length < 2) {
            setHsnSuggestions([]);
            setShowHsnDropdown(false);
            setHasSearchedHsn(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsHsnLoading(true);
            setHasSearchedHsn(true);
            hsnService.searchHSN(query)
                .then(results => {
                    setHsnSuggestions(results || []);
                    setShowHsnDropdown(true);
                })
                .catch(() => {
                    setHsnSuggestions([]);
                })
                .finally(() => {
                    setIsHsnLoading(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, name, hsnQueryOverride]);

    // Mutation: Create product with instant catalog cache injection
    const createProductMutation = useMutation({
        mutationFn: (data) => productsService.createProduct(data),
        onSuccess: (resData, variables) => {
            const prod = resData?.data || resData || variables;
            const isItemUnlimited = Boolean(variables?.isUnlimited || prod?.isUnlimited || prod?.is_unlimited || variables?.openingStock === 999999);
            const stockVal = isItemUnlimited ? 999999 : (parseFloat(variables?.openingStock ?? variables?.quantity ?? prod?.quantity ?? prod?.stock ?? 0) || 0);

            const formattedProduct = {
                id: prod?.id || prod?.product_id || Date.now(),
                name: prod?.name || prod?.product_name || variables?.name,
                product_name: prod?.name || prod?.product_name || variables?.name,
                sku: prod?.sku || variables?.sku,
                barcode: prod?.barcode || variables?.barcode || prod?.sku || variables?.sku,
                unit: prod?.unit || prod?.primary_unit || variables?.unit || 'PCS',
                primary_unit: prod?.unit || prod?.primary_unit || variables?.unit || 'PCS',
                price: parseFloat(prod?.selling_price || prod?.price || variables?.selling_price || variables?.price || 0),
                selling_price: parseFloat(prod?.selling_price || prod?.price || variables?.selling_price || variables?.price || 0),
                quantity: stockVal,
                stock: stockVal,
                opening_stock: stockVal,
                openingStock: stockVal,
                category: prod?.category || prod?.category_name || variables?.category || 'General',
                category_name: prod?.category || prod?.category_name || variables?.category || 'General',
                warehouse_id: prod?.warehouse_id || variables?.warehouse_id || 'Main Godown',
                location: prod?.location || variables?.warehouse_id || 'Main Godown',
                tax_percentage: parseFloat(prod?.tax_percentage ?? variables?.tax_percentage ?? 18) || 0,
                tax_rate: parseFloat(prod?.tax_percentage ?? variables?.tax_percentage ?? 18) || 0,
                taxRate: parseFloat(prod?.tax_percentage ?? variables?.tax_percentage ?? 18) || 0,
                gst_percentage: parseFloat(prod?.tax_percentage ?? variables?.tax_percentage ?? 18) || 0,
                source: 'products',
                isUnlimited: isItemUnlimited,
                is_unlimited: isItemUnlimited,
                hsn_code: prod?.hsn_code || variables?.hsn_code || variables?.hsnCode || '1006',
                hsnCode: prod?.hsn_code || variables?.hsn_code || variables?.hsnCode || '1006'
            };

            // Requirement 4: Instant Update - push new product into active POS catalogue state
            queryClient.setQueryData(['pos-catalog'], (old = []) => {
                const list = Array.isArray(old) ? old : [];
                const exists = list.some(item => (formattedProduct.id && item.id === formattedProduct.id) || (formattedProduct.sku && item.sku === formattedProduct.sku));
                if (exists) {
                    return list.map(item => ((formattedProduct.id && item.id === formattedProduct.id) || (formattedProduct.sku && item.sku === formattedProduct.sku)) ? { ...item, ...formattedProduct } : item);
                }
                return [formattedProduct, ...list];
            });

            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });

            if (onSuccess) {
                onSuccess(formattedProduct);
            }
            if (onClose) {
                onClose();
            }
        },
        onError: (err) => {
            console.error('Product addition error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Could not add product. Please check input fields.';
            alert(msg.includes('validation') || msg.includes('required') ? msg : 'Could not add product. Please check input fields.');
        }
    });

    // Mutation: Update existing product
    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data, source }) => {
            if (source === 'inventory') {
                try {
                    return await inventoryService.updateItem(id, data);
                } catch {
                    return await productsService.updateProduct(id, data);
                }
            } else {
                try {
                    return await productsService.updateProduct(id, data);
                } catch {
                    return await inventoryService.updateItem(id, data);
                }
            }
        },
        onSuccess: (resData, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pos-catalog'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            if (onSuccess) {
                onSuccess(variables?.data);
            }
            if (onClose) {
                onClose();
            }
        },
        onError: (err) => {
            console.error('Error updating product:', err);
            alert('Could not update product. Please check input fields.');
        }
    });

    const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Numeric Parsing for Tax Rate:
        // The GST dropdown value "18% GST" must be parsed into a clean numeric value 18 before sending:
        const parsedTax = parseFloat(taxRate.replace(/[^0-9.]/g, '')) || 0;

        // 2. Sanitize Opening Stock for Unlimited Product:
        // When isUnlimited is active, set openingStock: 999999 and isUnlimited: true (do NOT pass UI display strings like ~ Unlimited).
        const cleanOpeningStock = isUnlimited
            ? 999999
            : (parseFloat(String(openingStock).replace(/[^0-9.]/g, '')) || 0);

        // 3. Fallback Values for Required Attributes:
        // Ensure category, unit, sku, barcode, and hsnCode fall back to standard defaults if left empty
        const defaultCategory = (category || '').trim() || 'General';
        const defaultUnit = (unit || '').trim() || 'PCS';
        const defaultSku = (sku || '').trim() || `SKU-${Date.now().toString().slice(-4)}`;
        const defaultBarcode = (barcode || '').trim() || defaultSku;
        const defaultHsnCode = (hsnCode || '').trim() || '1006';

        const sPrice = parseFloat(sellingPrice) || 0;
        const resolvedWarehouse = (dbWarehouses && dbWarehouses.length > 0 ? (dbWarehouses[0].id || dbWarehouses[0].name) : null) || 'Main Godown';

        const payload = {
            name: name.trim(),
            product_name: name.trim(),
            sku: defaultSku,
            barcode: defaultBarcode,
            category: defaultCategory,
            category_name: defaultCategory,
            unit: defaultUnit,
            primary_unit: defaultUnit,
            openingStock: cleanOpeningStock,
            opening_stock: cleanOpeningStock,
            quantity: cleanOpeningStock,
            stock: cleanOpeningStock,
            isUnlimited: Boolean(isUnlimited),
            is_unlimited: Boolean(isUnlimited),
            purchase_price: sPrice * 0.7,
            selling_price: sPrice,
            price: sPrice,
            tax_percentage: parsedTax,
            taxRate: parsedTax,
            tax_rate: parsedTax,
            gst_percentage: parsedTax,
            hsn_code: defaultHsnCode,
            hsnCode: defaultHsnCode,
            hsn: defaultHsnCode,
            hsn_sac: defaultHsnCode,
            warehouse_id: resolvedWarehouse,
            warehouse: resolvedWarehouse
        };

        if (editingProduct) {
            updateProductMutation.mutate({ id: editingProduct.id, data: payload, source: editingProduct.source });
        } else {
            createProductMutation.mutate(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{ background: 'white', width: '100%', maxWidth: '460px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '8px', borderRadius: '10px', background: '#ECFDF5', color: '#10B981' }}>
                            <Plus size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#0F172A' }}>{editingProduct ? 'Edit Product' : 'Quick Register Item'}</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{editingProduct ? 'Update product details in POS catalog' : 'Instantly list new products in POS catalog'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Item Name *</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                            placeholder="e.g. Tomato / Rice / Milk"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Selling Price ({currency.symbol}) *</label>
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="any"
                                value={sellingPrice}
                                onKeyDown={(e) => {
                                    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) {
                                        return;
                                    }
                                    if (/^[0-9]$/.test(e.key)) {
                                        const currentDigits = (e.target.value || '').replace(/[^0-9]/g, '');
                                        if (currentDigits.length >= 10) {
                                            e.preventDefault();
                                        }
                                    }
                                }}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    const digitsOnly = val.replace(/[^0-9]/g, '');
                                    if (digitsOnly.length > 10) {
                                        let truncated = '';
                                        let count = 0;
                                        for (let char of val) {
                                            if (/[0-9]/.test(char)) {
                                                if (count < 10) {
                                                    truncated += char;
                                                    count++;
                                                }
                                            } else {
                                                truncated += char;
                                            }
                                        }
                                        val = truncated;
                                    }
                                    setSellingPrice(val);
                                }}
                                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Unit *</label>
                            <select
                                value={unit || 'PCS'}
                                onChange={(e) => setUnit(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                            >
                                <option value="PCS">PCS (Pieces)</option>
                                <option value="GRAM">GRAM (g)</option>
                                <option value="KG">KG (Kilogram)</option>
                                <option value="LITRE">LITRE (L)</option>
                                <option value="ML">ML (Millilitre)</option>
                                <option value="DOZEN">DOZEN</option>
                                <option value="BOX">BOX</option>
                                <option value="PACK">PACK</option>
                                <option value="QUANTITY">QUANTITY</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Opening Stock *</label>
                            {isUnlimited ? (
                                <div style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1.5px dashed #3B82F6', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>∞ Unlimited</span>
                                    <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>999999</span>
                                </div>
                            ) : (
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={openingStock}
                                    onChange={(e) => setOpeningStock(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}
                                    placeholder="Qty left"
                                />
                            )}
                        </div>
                    </div>

                    {/* Unlimited Product toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>♾️</span>
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E293B' }}>Unlimited Product</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Never trigger out of stock warnings</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const nextState = !isUnlimited;
                                setIsUnlimited(nextState);
                                setOpeningStock(nextState ? '999999' : '');
                            }}
                            style={{
                                border: isUnlimited ? '1px solid #2563EB' : '1px solid #CBD5E1',
                                background: isUnlimited ? '#EFF6FF' : 'white',
                                color: isUnlimited ? '#1D4ED8' : '#64748B',
                                fontWeight: '800',
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            {isUnlimited ? 'ACTIVE' : 'OFF'}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                placeholder="General"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Tax (GST %)</label>
                            <select
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                            >
                                <option value="0% GST">0% GST</option>
                                <option value="5% GST">5% GST</option>
                                <option value="12% GST">12% GST</option>
                                <option value="18% GST">18% GST</option>
                                <option value="28% GST">28% GST</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Barcode / SKU</label>
                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => {
                                    setSku(e.target.value);
                                    setBarcode(e.target.value);
                                }}
                                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}
                            />
                        </div>
                        <div style={{ position: 'relative' }} ref={hsnInfoRef}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>HSN / SAC Code</label>
                                {isHsnLoading && <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: '600' }}>Searching...</span>}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={hsnCode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setHsnCode(val);
                                        setHsnQueryOverride(val);
                                        setShowHsnInfoPopover(false);
                                    }}
                                    onFocus={() => {
                                        if ((hsnCode || name) && ((hsnCode || '').length >= 2 || (name || '').length >= 2)) {
                                            setShowHsnDropdown(true);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.75rem', paddingRight: '2.25rem', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                                    placeholder="e.g. 1006"
                                />

                                {/* Info ⓘ Icon inside input aligned to far right */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (showHsnInfoPopover) {
                                            setShowHsnInfoPopover(false);
                                        } else {
                                            fetchAndShowHsnDescription(hsnCode);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: '#047857',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '2px',
                                        borderRadius: '50%',
                                        zIndex: 10
                                    }}
                                    title="View HSN/SAC Description"
                                >
                                    <Info size={16} color="#047857" />
                                </button>

                                {/* HSN Info Popover / Tooltip */}
                                {showHsnInfoPopover && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        right: 0,
                                        width: '280px',
                                        zIndex: 1300,
                                        marginBottom: '6px',
                                        background: '#1E293B',
                                        color: 'white',
                                        borderRadius: '14px',
                                        padding: '0.85rem 1rem',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)',
                                        fontSize: '0.8rem',
                                        lineHeight: '1.4'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid #334155', paddingBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: '800', fontSize: '0.75rem', color: '#38BDF8', textTransform: 'uppercase' }}>
                                                HSN {hsnCode ? hsnCode : ''} Details
                                            </span>
                                            <button type="button" onClick={() => setShowHsnInfoPopover(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                        {isHsnInfoLoading ? (
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Loading description...</div>
                                        ) : (
                                            <div style={{ maxHeight: '140px', overflowY: 'auto', color: '#F1F5F9', wordBreak: 'break-word' }}>
                                                {hsnInfoDescription || 'No HSN/SAC description available for this code.'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* HSN Suggestions Dropdown */}
                            {showHsnDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1300,
                                    marginTop: '6px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>HSN/SAC Suggestions</span>
                                        <button type="button" onClick={() => setShowHsnDropdown(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}><X size={14} /></button>
                                    </div>

                                    {isHsnLoading && (
                                        <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>Searching master catalog...</div>
                                    )}

                                    {!isHsnLoading && hsnSuggestions.length === 0 && hasSearchedHsn && (
                                        <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>No matching HSN found</div>
                                    )}

                                    {!isHsnLoading && hsnSuggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setHsnCode(item.hsnCode);
                                                setShowHsnDropdown(false);
                                                setHsnInfoDescription(item.description);
                                            }}
                                            style={{
                                                padding: '0.6rem 0.75rem',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'background 0.15s ease',
                                                borderBottom: idx < hsnSuggestions.length - 1 ? '1px solid #F8FAFC' : 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#ECFDF5'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{ flex: 1, paddingRight: '0.5rem', overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '850', fontSize: '0.85rem', color: '#047857' }}>{item.hsnCode}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                                            </div>
                                            <button
                                                type="button"
                                                style={{
                                                    border: 'none',
                                                    background: '#ECFDF5',
                                                    color: '#047857',
                                                    fontWeight: '700',
                                                    fontSize: '0.75rem',
                                                    padding: '0.35rem 0.65rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    flexShrink: 0
                                                }}
                                            >
                                                Select
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.85rem',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
                            opacity: isSubmitting ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                {editingProduct ? 'Updating...' : 'Registering...'}
                            </>
                        ) : (
                            editingProduct ? 'Save Changes' : 'Add to POS & List'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default QuickRegisterItemModal;
