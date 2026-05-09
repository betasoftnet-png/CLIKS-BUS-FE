import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    MoreVertical, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    ArrowUpRight,
    ArrowDownRight,
    Box,
    Layers,
    TrendingUp,
    ChevronRight,
    Download,
    History,
    ShieldAlert,
    BarChart3,
    Calendar,
    Tag,
    Trash,
    DollarSign,
    Percent,
    AlertCircle
} from 'lucide-react';
import '../App.css';

const BusinessInventory = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
    const [adjustAmount, setAdjustAmount] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'movement', 'reports'
    const [filterCategory, setFilterCategory] = useState('All');

    // Live catalog items database from productsService
    const { data: items = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

    const createMutation = useMutation({
        mutationFn: (data) => productsService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            alert('Product created and catalog initialized successfully!');
            setIsModalOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => productsService.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            alert('Product details updated successfully!');
            setIsModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => productsService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            alert('Product removed from catalog.');
        }
    });

    // Dummy movement history logs can safely exist locally
    const [movementHistory, setMovementHistory] = useState([
        { id: 'M-1', date: '2026-05-01', item_name: 'iPhone 15 (128GB, Black)', type: 'In (Purchase)', quantity: 25, ref: 'Bill #PUR-901', warehouse: 'Main Godown' },
        { id: 'M-2', date: '2026-05-03', item_name: 'iPhone 15 (128GB, Black)', type: 'Out (Sales)', quantity: 5, ref: 'Invoice #INV-201', warehouse: 'Main Godown' },
        { id: 'M-3', date: '2026-05-04', item_name: 'Ergonomic Mesh Office Chair', type: 'Out (Sales)', quantity: 15, ref: 'Invoice #INV-244', warehouse: 'Shop Front' },
    ]);

    const [formData, setFormData] = useState(() => ({
        product_code: `PRO-${Date.now().toString().slice(-4)}`,
        sku: '',
        barcode: '',
        qr_code: '',
        product_type: 'product',
        name: '',
        short_name: '',
        description: '',
        category: 'Electronics',
        brand: '',
        purchase_price: 0,
        selling_price: 0,
        wholesale_price: 0,
        dealer_price: 0,
        mrp: 0,
        discount_percentage: 0,
        gst_percentage: 18,
        hsn_code: '',
        tax_type: 'inclusive',
        opening_stock: 0,
        quantity: 0,
        reserved_stock: 0,
        damaged_stock: 0,
        min_stock: 5,
        reorder_level: 8,
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        serial_number: '',
        primary_unit: 'pcs',
        secondary_unit: 'box',
        conversion_rate: 1,
        warehouse: 'Main Godown',
        rack_number: ''
    }));

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            product_code: `PRO-${Date.now().toString().slice(-4)}`,
            sku: '',
            barcode: '',
            qr_code: '',
            product_type: 'product',
            name: '',
            short_name: '',
            description: '',
            category: 'Electronics',
            brand: '',
            purchase_price: 0,
            selling_price: 0,
            wholesale_price: 0,
            dealer_price: 0,
            mrp: 0,
            discount_percentage: 0,
            gst_percentage: 18,
            hsn_code: '',
            tax_type: 'inclusive',
            opening_stock: 0,
            quantity: 0,
            reserved_stock: 0,
            damaged_stock: 0,
            min_stock: 5,
            reorder_level: 8,
            batch_number: '',
            manufacturing_date: '',
            expiry_date: '',
            serial_number: '',
            primary_unit: 'pcs',
            secondary_unit: 'box',
            conversion_rate: 1,
            warehouse: 'Main Godown',
            rack_number: ''
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            product_code: item.product_code || `PRO-${item.id}`,
            sku: item.sku || '',
            barcode: item.barcode || '',
            qr_code: item.qr_code || '',
            product_type: item.product_type || 'product',
            name: item.name || '',
            short_name: item.short_name || '',
            description: item.description || '',
            category: item.category || 'Electronics',
            brand: item.brand || '',
            purchase_price: item.purchase_price || 0,
            selling_price: item.selling_price || 0,
            wholesale_price: item.wholesale_price || 0,
            dealer_price: item.dealer_price || 0,
            mrp: item.mrp || 0,
            discount_percentage: item.discount_percentage || 0,
            gst_percentage: item.gst_percentage || 18,
            hsn_code: item.hsn_code || '',
            tax_type: item.tax_type || 'inclusive',
            opening_stock: item.opening_stock || item.quantity || 0,
            quantity: item.quantity || 0,
            reserved_stock: item.reserved_stock || 0,
            damaged_stock: item.damaged_stock || 0,
            min_stock: item.min_stock || 5,
            reorder_level: item.reorder_level || 8,
            batch_number: item.batch_number || '',
            manufacturing_date: item.manufacturing_date || '',
            expiry_date: item.expiry_date || '',
            serial_number: item.serial_number || '',
            primary_unit: item.primary_unit || 'pcs',
            secondary_unit: item.secondary_unit || 'box',
            conversion_rate: item.conversion_rate || 1,
            warehouse: item.warehouse || 'Main Godown',
            rack_number: item.rack_number || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product? All historical logs and stock information will be removed.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            sku: formData.sku,
            category: formData.category,
            quantity: parseFloat(formData.opening_stock) || 0,
            purchase_price: parseFloat(formData.purchase_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0,
            barcode: formData.barcode,
            serial_number: formData.serial_number,
            batch_number: formData.batch_number,
            expiry_date: formData.expiry_date,
            tax_percentage: parseFloat(formData.gst_percentage) || 18,
            warehouse_id: formData.warehouse
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleAdjust = (item, type) => {
        setSelectedItem(item);
        setAdjustType(type);
        setAdjustAmount(1);
        setIsAdjustModalOpen(true);
    };

    const handleSaveAdjustment = (e) => {
        e.preventDefault();
        const amt = parseInt(adjustAmount);
        if (isNaN(amt) || amt <= 0) {
            alert('Please enter a valid stock adjustment quantity.');
            return;
        }

        const isStockIn = adjustType === 'in';
        const updatedQty = isStockIn ? selectedItem.quantity + amt : selectedItem.quantity - amt;

        if (!isStockIn && updatedQty < 0) {
            alert('Stock cannot drop below zero units.');
            return;
        }

        updateMutation.mutate({ 
            id: selectedItem.id, 
            data: { 
                ...selectedItem, 
                quantity: updatedQty,
                status: updatedQty < selectedItem.min_stock ? 'Low Stock' : 'In Stock'
            } 
        });

        // Append to running movement history logs
        setMovementHistory([
            ...movementHistory,
            {
                id: `M-${100 + movementHistory.length + 1}`,
                date: new Date().toISOString().split('T')[0],
                item_name: selectedItem.name,
                type: isStockIn ? 'In (Adjustment)' : 'Out (Adjustment)',
                quantity: amt,
                ref: 'Manual Adjustment',
                warehouse: selectedItem.warehouse
            }
        ]);
        setIsAdjustModalOpen(false);
        setSelectedItem(null);
        alert('Real-time inventory levels adjusted and committed!');
    };

    const filteredItems = items.filter(i => {
        const matchesSearch = (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (i.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (i.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (i.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || i.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Dynamic Report Computations
    const totalInventoryValue = items.filter(i => i.product_type === 'product').reduce((acc, i) => acc + (parseFloat(i.purchase_price || 0) * parseInt(i.quantity || 0)), 0);
    const potentialRevenue = items.filter(i => i.product_type === 'product').reduce((acc, i) => acc + (parseFloat(i.selling_price || 0) * parseInt(i.quantity || 0)), 0);
    const lowStockCount = items.filter(i => i.product_type === 'product' && i.quantity < i.min_stock).length;
    const totalPhysicalUnits = items.filter(i => i.product_type === 'product').reduce((acc, i) => acc + parseInt(i.quantity || 0), 0);

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.2)' }}>
                            <Package size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Products & Inventory Suite</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage product specifications, service offerings, batch expiries, warehouses, and valuations.</p>
                </div>
                <button 
                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={20} />
                    Add Product / Service
                </button>
            </div>

            {/* Bento-style Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Stock Valuation (Cost)', value: `₹${totalInventoryValue.toLocaleString()}`, icon: TrendingUp, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Low Stock SKU Alerts', value: lowStockCount, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Total Catalog SKUs', value: items.length, icon: Layers, color: '#0369A1', bg: '#F0F9FF' },
                    { label: 'Total Physical Units', value: totalPhysicalUnits, icon: Package, color: '#0D9488', bg: '#F0FDFA' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('list')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'list' ? '#064E3B' : 'white', 
                        color: activeTab === 'list' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'list' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <Package size={18} /> Products & Services List
                </button>
                <button 
                    onClick={() => setActiveTab('movement')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'movement' ? '#064E3B' : 'white', 
                        color: activeTab === 'movement' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'movement' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <History size={18} /> Movement History & Logs
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'reports' ? '#064E3B' : 'white', 
                        color: activeTab === 'reports' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'reports' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <BarChart3 size={18} /> Advanced Profit & Expiry Reports 📊
                </button>
            </div>

            {/* Tab 1: Products & Services Catalog List */}
            {activeTab === 'list' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search by name, SKU or barcode..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <select 
                                value={filterCategory} 
                                onChange={(e) => setFilterCategory(e.target.value)} 
                                style={{ padding: '0.65rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#475569' }}
                            >
                                <option value="All">All Categories</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Services">Services</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Product Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Classification</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Stock Level</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Purchase / Sales (₹)</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GST & HSN</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Stock Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((row) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: row.product_type === 'product' ? '#F0FDF4' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: row.product_type === 'product' ? '#1B6B3A' : '#1D4ED8' }}>
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.95rem' }}>{row.name}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>SKU: {row.sku} | Code: {row.product_code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{row.category}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{row.brand || 'No Brand'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {row.product_type === 'service' ? (
                                                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: '700' }}>NO STOCK TRACKING</span>
                                            ) : (
                                                <div>
                                                    <p style={{ fontWeight: '850', color: row.quantity < row.min_stock ? '#EF4444' : '#1E293B', fontSize: '1.05rem' }}>
                                                        {row.quantity} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{row.primary_unit}</span>
                                                    </p>
                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Min: {row.min_stock} | Reorder: {row.reorder_level}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem' }}>Buy: ₹{row.purchase_price.toLocaleString()}</p>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '850', color: '#064E3B' }}>Sell: ₹{row.selling_price.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{row.gst_percentage}% GST</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>HSN: {row.hsn_code || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                background: row.product_type === 'service' ? '#EFF6FF' : (row.quantity < row.min_stock ? '#FEF2F2' : '#F0FDF4'),
                                                color: row.product_type === 'service' ? '#1D4ED8' : (row.quantity < row.min_stock ? '#B91C1C' : '#15803D'),
                                                fontSize: '0.8rem', fontWeight: '800'
                                            }}>
                                                {row.product_type === 'service' ? <CheckCircle2 size={12} /> : (row.quantity < row.min_stock ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />)}
                                                {row.product_type === 'service' ? 'SERVICE' : (row.quantity < row.min_stock ? 'LOW STOCK' : 'IN STOCK')}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {row.product_type === 'product' && (
                                                    <div style={{ display: 'flex', background: '#F8FAFC', padding: '3px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                                        <button onClick={() => handleAdjust(row, 'in')} title="Induct Stock" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowUpRight size={14} /></button>
                                                        <button onClick={() => handleAdjust(row, 'out')} title="Deplete Stock" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '3px' }}><ArrowDownRight size={14} /></button>
                                                    </div>
                                                )}
                                                <button onClick={() => handleEdit(row)} title="Edit specifications" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(row.id)} title="Delete product" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Stock Movement Logs */}
            {activeTab === 'movement' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Product Movement & Stock Audits</h2>
                            <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '600' }}>Full ledger recording additions, sales deductions, and opening inductions.</p>
                        </div>
                    </div>

                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Timestamp</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Product Name</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Movement Type</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Ref / Reason</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Warehouse Location</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Quantity shifted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movementHistory.map((tx) => (
                                    <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '1.25rem', fontSize: '0.9rem', fontWeight: '600' }}>{tx.date}</td>
                                        <td style={{ padding: '1.25rem', fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{tx.item_name}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                background: tx.type.includes('In') ? '#F0FDF4' : '#FEF2F2',
                                                color: tx.type.includes('In') ? '#15803D' : '#B91C1C',
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>{tx.type.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>{tx.ref}</td>
                                        <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>{tx.warehouse || 'Main Godown'}</td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '900', color: tx.type.includes('In') ? '#15803D' : '#B91C1C' }}>
                                            {tx.type.includes('In') ? `+ ${tx.quantity}` : `- ${tx.quantity}`} Units
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Expiry & Profitability Valuation Reports */}
            {activeTab === 'reports' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Column - Expiries & Valuation metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Expiry Alerts Analysis */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <AlertCircle size={20} color="#B91C1C" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Batch Expiry & Dead Stock Trackers</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {items.filter(i => i.product_type === 'product' && i.expiry_date).length === 0 ? (
                                    <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '600' }}>No active product expiries logged.</p>
                                ) : (
                                    items.filter(i => i.expiry_date).map(i => (
                                        <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFBEB', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                                            <div>
                                                <p style={{ fontWeight: '750', color: '#B45309', fontSize: '0.95rem' }}>{i.name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Batch: {i.batch_number} | Warehouse: {i.warehouse}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '850', color: '#B45309', fontSize: '0.95rem' }}>Expiry: {i.expiry_date}</p>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444' }}>MONITOR REQUIRED</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Product-wise Profit Margins Analysis */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <TrendingUp size={20} color="#1B6B3A" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Product-wise Profitability Margins</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {items.map((prod, idx) => {
                                    const profit = prod.selling_price - prod.purchase_price;
                                    const margin = prod.selling_price > 0 ? Math.round((profit / prod.selling_price) * 100) : 100;
                                    return (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                                                <span style={{ color: '#1E293B' }}>{prod.name} ({prod.product_type.toUpperCase()})</span>
                                                <span style={{ color: '#15803D' }}>Margin: {margin}% (Profit: ₹{profit.toLocaleString()})</span>
                                            </div>
                                            <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: 'linear-gradient(90deg, #1B6B3A 0%, #10B981 100%)', width: `${margin}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Stock Valuation Summaries */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Interactive Stock Valuation Summary Box */}
                        <div style={{ background: '#064E3B', color: 'white', padding: '2rem', borderRadius: '28px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Stock Valuation Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Asset Valuation (At Cost):</span>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{totalInventoryValue.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Potential Revenue (At Sale):</span>
                                    <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{potentialRevenue.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '900' }}>Unrealized Profit Pool:</span>
                                    <span style={{ fontWeight: '950', fontSize: '1.35rem' }}>₹{(potentialRevenue - totalInventoryValue).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Performing Fast Moving Products */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <Layers size={18} color="#1B6B3A" />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>Fast Moving Products</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {items.sort((a,b) => b.total_sold - a.total_sold).map((prod, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: '700' }}>
                                        <span style={{ color: '#475569' }}>{prod.name}</span>
                                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>{prod.total_sold} Units Sold</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {/* Product Creation & Editing Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>{editingItem ? 'Edit Product Profile' : 'New Product Registration'}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Code: {formData.product_code}</p>
                            </div>
                            <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Product vs Service Select */}
                            <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '14px', maxWidth: '300px' }}>
                                <button type="button" onClick={() => setFormData({...formData, product_type: 'product'})} style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: formData.product_type === 'product' ? '#064E3B' : 'transparent', color: formData.product_type === 'product' ? 'white' : '#64748B', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Physical Product</button>
                                <button type="button" onClick={() => setFormData({...formData, product_type: 'service'})} style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '10px', border: 'none', background: formData.product_type === 'service' ? '#064E3B' : 'transparent', color: formData.product_type === 'service' ? 'white' : '#64748B', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>Service Offering</button>
                            </div>

                            {/* Basic Product Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.25rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Item Name</label>
                                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="e.g. MacBook Pro M3" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Short Display Name</label>
                                    <input type="text" value={formData.short_name} onChange={(e) => setFormData({...formData, short_name: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="MacBook" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>SKU Code</label>
                                    <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="MAC-M3-8" />
                                </div>
                            </div>

                            {/* Classification details */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Category</label>
                                    <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Electronics" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Brand</label>
                                    <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Apple" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Barcode Number</label>
                                    <input type="text" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Scan/Enter" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>HSN / SAC Code</label>
                                    <input type="text" value={formData.hsn_code} onChange={(e) => setFormData({...formData, hsn_code: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="8471" />
                                </div>
                            </div>

                            {/* Pricing fields */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purchase Cost (₹)</label>
                                    <input type="number" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Retail Selling (₹)</label>
                                    <input type="number" value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Wholesale Price (₹)</label>
                                    <input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({...formData, wholesale_price: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dealer Price (₹)</label>
                                    <input type="number" value={formData.dealer_price} onChange={(e) => setFormData({...formData, dealer_price: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                            </div>

                            {/* MRP & Tax specifications */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Max Retail Price (MRP)</label>
                                    <input type="number" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Discount %</label>
                                    <input type="number" value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GST Rate (%)</label>
                                    <select value={formData.gst_percentage} onChange={(e) => setFormData({...formData, gst_percentage: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value={0}>0% GST</option>
                                        <option value={5}>5% GST</option>
                                        <option value={12}>12% GST</option>
                                        <option value={18}>18% GST</option>
                                        <option value={28}>28% GST</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tax Type</label>
                                    <select value={formData.tax_type} onChange={(e) => setFormData({...formData, tax_type: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="inclusive">Tax Inclusive</option>
                                        <option value="exclusive">Tax Exclusive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Inventory Specific Fields (Only shown for physical Products) */}
                            {formData.product_type === 'product' && (
                                <div style={{ background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid #DCF2E4' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory & Stock Controls</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Opening Qty</label>
                                            <input type="number" value={formData.opening_stock} onChange={(e) => setFormData({...formData, opening_stock: parseInt(e.target.value) || 0, quantity: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Minimum Qty Alert</label>
                                            <input type="number" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Reorder Level</label>
                                            <input type="number" value={formData.reorder_level} onChange={(e) => setFormData({...formData, reorder_level: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Primary Unit</label>
                                            <select value={formData.primary_unit} onChange={(e) => setFormData({...formData, primary_unit: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }}>
                                                <option value="pcs">Pcs (Pieces)</option>
                                                <option value="kg">Kg (Kilograms)</option>
                                                <option value="box">Box</option>
                                                <option value="litre">Litre</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Batch Identifier</label>
                                            <input type="text" value={formData.batch_number} onChange={(e) => setFormData({...formData, batch_number: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} placeholder="B-8902" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Expiry Date</label>
                                            <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Warehouse</label>
                                            <input type="text" value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} placeholder="Main Godown" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Rack Location</label>
                                            <input type="text" value={formData.rack_number} onChange={(e) => setFormData({...formData, rack_number: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} placeholder="Rack 4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }}>
                                {editingItem ? 'Update Product Catalog' : 'Register Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Real-time Stock Adjustment Modal */}
            {isAdjustModalOpen && selectedItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>
                                    {adjustType === 'in' ? 'Induct Stock (Stock In)' : 'Deplete Stock (Stock Out)'}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Product: {selectedItem.name}</p>
                            </div>
                            <button onClick={() => setIsAdjustModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700' }}>
                                <span style={{ color: '#64748B' }}>Current Catalog Stock:</span>
                                <span style={{ color: '#064E3B' }}>{selectedItem.quantity} {selectedItem.primary_unit}</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Adjustment Volume</label>
                                <input required type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(Math.max(1, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '1.75rem', fontWeight: '900', color: '#064E3B', textAlign: 'center' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: adjustType === 'in' ? 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                Commit {adjustType === 'in' ? 'Stock Induction' : 'Stock Depletion'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessInventory;
