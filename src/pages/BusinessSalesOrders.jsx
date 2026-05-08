import React, { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../services/ordersService';
import { crmService } from '../services/crmService';
import { 
    ShoppingCart, 
    Plus, 
    Search, 
    Filter, 
    FileText, 
    Clock, 
    CheckCircle2, 
    X, 
    Package, 
    Trash2, 
    Edit2, 
    Calendar, 
    Share2, 
    Printer, 
    RefreshCw, 
    Truck,
    IndianRupee,
    AlertTriangle,
    Trash,
    TrendingUp,
    BarChart3,
    UserCheck,
    XCircle
} from 'lucide-react';
import '../App.css';

const BusinessSalesOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'reports'

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [crmCustomers, setCrmCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await ordersService.getOrders({ search: searchTerm });
            if (res && res.success) {
                setOrders(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load live orders:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Load CRM customers for dropdown
    useEffect(() => {
        const loadCustomers = async () => {
            try {
                const res = await crmService.getCustomers();
                if (res && res.success) {
                    setCrmCustomers(res.data || []);
                }
            } catch (err) {
                console.error('Failed to load CRM customers:', err);
            }
        };
        loadCustomers();
    }, []);

    // Order Form State
    const [formData, setFormData] = useState(() => ({
        order_number: `SO-${Date.now().toString().slice(-6)}`,
        customer: '',
        customer_phone: '',
        customer_gstin: '',
        billing_address: '',
        shipping_address: '',
        date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        status: 'Draft',
        advance_amount: 0,
        shipping_charge: 0,
        shipping_method: '',
        tracking_number: '',
        dispatch_date: '',
        items: [
            { name: '', sku: '', quantity: 1, price: 0, hsn: '', discount: 0, gst: 18, total: 0 }
        ]
    }));

    const calculateTotals = useCallback((items, shipCharge) => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        items.forEach(item => {
            const rawTotal = item.quantity * item.price;
            const itemDiscount = (rawTotal * (item.discount / 100));
            const taxableAmount = rawTotal - itemDiscount;
            const itemTax = (taxableAmount * (item.gst / 100));
            const grandItemTotal = taxableAmount + itemTax;

            subtotal += rawTotal;
            totalDiscount += itemDiscount;
            totalTax += itemTax;
            item.total = grandItemTotal;
        });

        const grand_total = subtotal - totalDiscount + totalTax + parseFloat(shipCharge || 0);
        return { subtotal, total_discount: totalDiscount, total_tax: totalTax, grand_total };
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', sku: '', quantity: 1, price: 0, hsn: '', discount: 0, gst: 18, total: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const list = [...formData.items];
        list.splice(index, 1);
        setFormData({ ...formData, items: list });
    };

    const handleItemChange = (index, field, val) => {
        const list = [...formData.items];
        list[index][field] = val;
        
        // Re-calculate totals
        const updated = calculateTotals(list, formData.shipping_charge);
        setFormData({
            ...formData,
            items: list,
            ...updated
        });
    };

    const resetForm = useCallback(() => {
        setFormData({
            order_number: `SO-${Date.now().toString().slice(-6)}`,
            customer: '',
            customer_phone: '',
            customer_gstin: '',
            billing_address: '',
            shipping_address: '',
            date: new Date().toISOString().split('T')[0],
            delivery_date: '',
            status: 'Draft',
            advance_amount: 0,
            shipping_charge: 0,
            shipping_method: '',
            tracking_number: '',
            dispatch_date: '',
            items: [{ name: '', sku: '', quantity: 1, price: 0, hsn: '', discount: 0, gst: 18, total: 0 }]
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const calced = calculateTotals(formData.items, formData.shipping_charge);
            const pending = calced.grand_total - parseFloat(formData.advance_amount || 0);

            const orderPayload = {
                ...formData,
                ...calced,
                pending_amount: pending >= 0 ? pending : 0
            };

            if (editingOrder) {
                await ordersService.updateOrder(editingOrder.id, orderPayload);
                alert('Sales Order updated successfully!');
            } else {
                await ordersService.createOrder(orderPayload);
                alert('Sales Order created successfully!');
            }

            setIsModalOpen(false);
            setEditingOrder(null);
            resetForm();
            loadOrders();
        } catch (err) {
            console.error('Failed to save sales order:', err);
            alert('Failed to save sales order.');
        }
    };

    const handleEdit = (order) => {
        setEditingOrder(order);
        setFormData(order);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sales order?')) {
            try {
                await ordersService.deleteOrder(id);
                alert('Sales Order deleted successfully.');
                loadOrders();
            } catch (err) {
                console.error(err);
                alert('Failed to delete sales order.');
            }
        }
    };

    const handleConvertInvoice = async (order) => {
        if (window.confirm(`Convert Sales Order ${order.order_number} to a Sales Invoice?`)) {
            try {
                await ordersService.convertToInvoice(order.id);
                alert(`Sales Order successfully converted into Invoice! Stock deducted.`);
                loadOrders();
            } catch (err) {
                console.error(err);
                alert('Failed to convert sales order.');
            }
        }
    };

    const handleFulfillment = (order) => {
        setSelectedOrder(order);
        setIsFulfillmentOpen(true);
    };

    const handleSaveFulfillment = async (e) => {
        e.preventDefault();
        try {
            await ordersService.updateOrder(selectedOrder.id, {
                ...selectedOrder,
                status: 'Shipped'
            });
            setIsFulfillmentOpen(false);
            alert('Fulfillment tracking details updated!');
            loadOrders();
        } catch (err) {
            console.error(err);
            alert('Failed to update tracking details.');
        }
    };

    const filteredOrders = orders.filter(o => 
        (o.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic Computations for KPIs & Reports
    const activeOrdersCount = orders.filter(o => o.status !== 'Invoiced' && o.status !== 'Cancelled').length;
    const totalPendingValue = orders.filter(o => o.status !== 'Invoiced').reduce((acc, o) => acc + (o.grand_total || 0), 0);
    const readyToInvoiceCount = orders.filter(o => o.status === 'Confirmed').length;
    const invoicedThisMonth = orders.filter(o => o.status === 'Invoiced').reduce((acc, o) => acc + (o.grand_total || 0), 0);

    // Reports Analytics calculations
    const pendingOrdersList = orders.filter(o => o.status === 'Draft' || o.status === 'Confirmed');
    const cancelledOrdersList = orders.filter(o => o.status === 'Cancelled');
    
    // Delayed Deliveries: order_status is not completed (Invoiced) and delivery date is past (simulated current date: '2026-05-06')
    const simulatedCurrentDate = '2026-05-06';
    const delayedDeliveriesList = orders.filter(o => o.status !== 'Invoiced' && o.status !== 'Cancelled' && o.delivery_date && o.delivery_date < simulatedCurrentDate);

    // Top Customers
    const customerTotals = orders.reduce((acc, o) => {
        if (o.status !== 'Cancelled') {
            acc[o.customer] = (acc[o.customer] || 0) + o.grand_total;
        }
        return acc;
    }, {});
    const topCustomers = Object.entries(customerTotals)
        .map(([name, val]) => ({ name, value: val }))
        .sort((a, b) => b.value - a.value);

    // Most Ordered Products
    const productTotals = orders.reduce((acc, o) => {
        if (o.status !== 'Cancelled') {
            o.items.forEach(item => {
                acc[item.name] = (acc[item.name] || 0) + item.quantity;
            });
        }
        return acc;
    }, {});
    const mostOrderedProducts = Object.entries(productTotals)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty);

    // Fulfillment Rate
    const totalProcessed = orders.filter(o => o.status !== 'Draft' && o.status !== 'Cancelled').length;
    const totalFulfilled = orders.filter(o => o.status === 'Shipped' || o.status === 'Invoiced').length;
    const fulfillmentRate = totalProcessed > 0 ? Math.round((totalFulfilled / totalProcessed) * 100) : 0;

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <ShoppingCart size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Sales Orders Center</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage customer requests, reserve stocks, track shipments, and convert to invoices.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
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
                    New Order
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Active Orders', value: activeOrdersCount, icon: ShoppingCart, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Pending Value', value: `₹${totalPendingValue.toLocaleString()}`, icon: Clock, color: '#B45309', bg: '#FFFBEB' },
                    { label: 'Confirmed (Ready)', value: readyToInvoiceCount, icon: Package, color: '#0369A1', bg: '#F0F9FF' },
                    { label: 'Invoiced / Completed', value: `₹${invoicedThisMonth.toLocaleString()}`, icon: CheckCircle2, color: '#15803D', bg: '#F0FDF4' }
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
                    <ShoppingCart size={18} /> Orders List
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
                    <BarChart3 size={18} /> Order Reports 📊
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#064E3B', fontSize: '1.15rem', fontWeight: '800' }}>Loading Live Sales Orders...</p>
                </div>
            ) : activeTab === 'list' ? (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search customers or order ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                            />
                        </div>
                        <button style={{ width: '44px', height: '44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={20} />
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Order Number</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Customer</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Dispatch Date</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Grand Total</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Advance</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((row, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontWeight: '750', color: '#1E293B' }}>{row.order_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{row.customer}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{row.customer_phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontWeight: '600', fontSize: '0.9rem' }}>
                                                <Calendar size={14} />
                                                {row.delivery_date || 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#064E3B' }}>₹{row.grand_total.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0D9488' }}>₹{row.advance_amount.toLocaleString()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                background: row.status === 'Invoiced' ? '#F0FDF4' : (row.status === 'Cancelled' ? '#FEF2F2' : (row.status === 'Shipped' ? '#F0F9FF' : '#FFFBEB')),
                                                color: row.status === 'Invoiced' ? '#15803D' : (row.status === 'Cancelled' ? '#B91C1C' : (row.status === 'Shipped' ? '#0369A1' : '#B45309')),
                                                fontSize: '0.8rem', fontWeight: '800'
                                            }}>
                                                {row.status === 'Invoiced' ? <CheckCircle2 size={12} /> : (row.status === 'Cancelled' ? <X size={12} /> : (row.status === 'Shipped' ? <Truck size={12} /> : <Clock size={12} />))}
                                                {row.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {row.status !== 'Invoiced' && row.status !== 'Cancelled' && (
                                                    <>
                                                        <button onClick={() => handleConvertInvoice(row)} title="Convert to Invoice" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #DCF2E4', background: 'white', color: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><RefreshCw size={16} /></button>
                                                        <button onClick={() => handleFulfillment(row)} title="Shipping Fulfillment" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Truck size={16} /></button>
                                                    </>
                                                )}
                                                <button onClick={() => handleEdit(row)} title="Edit Order" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(row.id)} title="Delete Order" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* ORDER REPORTS VIEW */
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    
                    {/* Left Column - Detailed Lists */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* 1. Pending Orders Report */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <Clock size={20} color="#B45309" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Pending Customer Orders</h3>
                            </div>
                            {pendingOrdersList.length === 0 ? (
                                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No pending orders found.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {pendingOrdersList.map(o => (
                                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px' }}>
                                            <div>
                                                <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.95rem' }}>{o.customer}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>No: {o.order_number} | Due: {o.delivery_date}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '850', color: '#1B6B3A', fontSize: '1.05rem' }}>₹{o.grand_total.toLocaleString()}</p>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B45309' }}>{o.status.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Delayed Deliveries Report */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <AlertTriangle size={20} color="#EF4444" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Delayed Deliveries</h3>
                            </div>
                            {delayedDeliveriesList.length === 0 ? (
                                <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803D', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <CheckCircle2 size={16} /> All orders are on schedule! No delayed delivery.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {delayedDeliveriesList.map(o => (
                                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF2F2', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #FEE2E2' }}>
                                            <div>
                                                <p style={{ fontWeight: '750', color: '#991B1B', fontSize: '0.95rem' }}>{o.customer}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#991B1B' }}>Expected Delivery: <strong style={{ textDecoration: 'underline' }}>{o.delivery_date}</strong> (Delayed)</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '850', color: '#991B1B', fontSize: '1.05rem' }}>₹{o.grand_total.toLocaleString()}</p>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444' }}>OVERDUE</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Cancelled Orders Report */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <XCircle size={20} color="#EF4444" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>Cancelled Orders Log</h3>
                            </div>
                            {cancelledOrdersList.length === 0 ? (
                                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No cancelled orders recorded.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cancelledOrdersList.map(o => (
                                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '16px' }}>
                                            <div>
                                                <p style={{ fontWeight: '750', color: '#64748B', fontSize: '0.95rem' }}>{o.customer}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No: {o.order_number} | Date: {o.date}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: '850', color: '#94A3B8', fontSize: '1.05rem', textDecoration: 'line-through' }}>₹{o.grand_total.toLocaleString()}</p>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#EF4444' }}>CANCELLED</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column - Top Stats & Fulfillment Ring */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Fulfillment Rate Ring */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', width: '100%', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>Fulfillment Efficiency Rate</h3>
                            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
                                {/* SVG Circular Progress */}
                                <svg style={{ transform: 'rotate(-90deg)', width: '120px', height: '120px' }}>
                                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#E2E8F0" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1B6B3A" strokeWidth="10" 
                                            strokeDasharray={314}
                                            strokeDashoffset={314 - (314 * fulfillmentRate) / 100}
                                            strokeLinecap="round" />
                                </svg>
                                <span style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: '900', color: '#064E3B' }}>{fulfillmentRate}%</span>
                            </div>
                            <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.5rem' }}>{totalFulfilled} out of {totalProcessed} active orders shipped/delivered successfully.</p>
                        </div>

                        {/* Top Customers list */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <UserCheck size={18} color="#1B6B3A" />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>Top Customers Contribution</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {topCustomers.map((cust, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: '700' }}>
                                            <span style={{ color: '#1E293B' }}>{cust.name}</span>
                                            <span style={{ color: '#064E3B' }}>₹{cust.value.toLocaleString()}</span>
                                        </div>
                                        <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #1B6B3A 0%, #0D9488 100%)', width: `${Math.min(100, (cust.value / Math.max(...topCustomers.map(c => c.value))) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Most Ordered Products */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                                <TrendingUp size={18} color="#0D9488" />
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>Most Ordered Products</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {mostOrderedProducts.map((prod, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: '700' }}>
                                        <span style={{ color: '#475569' }}>{prod.name}</span>
                                        <span style={{ background: '#F0FDF4', color: '#15803D', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>{prod.qty} Units</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {/* Create/Edit Sales Order Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>{editingOrder ? 'Edit Sales Order' : 'New Sales Order'}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Order Number: {formData.order_number}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Customer Profile Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={customerSearch || formData.customer} 
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setFormData({...formData, customer: e.target.value});
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} 
                                        placeholder="Search or select customer..." 
                                    />
                                    {showCustomerDropdown && crmCustomers.length > 0 && (
                                        <div style={{ 
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            background: 'white', border: '1px solid #E2E8F0', borderRadius: '14px',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '220px', overflowY: 'auto', marginTop: '4px'
                                        }}>
                                            {crmCustomers
                                                .filter(c => {
                                                    const q = (customerSearch || '').toLowerCase();
                                                    return !q || (c.name || '').toLowerCase().includes(q) || (c.business_name || '').toLowerCase().includes(q) || (c.phone_number || '').includes(q);
                                                })
                                                .map(c => (
                                                    <div 
                                                        key={c.id}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                customer: c.name,
                                                                customer_phone: c.phone_number || c.phone || '',
                                                                customer_gstin: c.gstin || '',
                                                                billing_address: c.billing_address || '',
                                                                shipping_address: c.shipping_address || ''
                                                            });
                                                            setCustomerSearch(c.name);
                                                            setShowCustomerDropdown(false);
                                                        }}
                                                        style={{ 
                                                            padding: '0.75rem 1rem', cursor: 'pointer', 
                                                            borderBottom: '1px solid #F1F5F9',
                                                            transition: 'background 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                    >
                                                        <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem', marginBottom: '0.15rem' }}>{c.name}</p>
                                                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                                            {c.business_name ? `${c.business_name} | ` : ''}{c.phone_number || c.phone || ''}{c.gstin ? ` | ${c.gstin}` : ''}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                            {crmCustomers.filter(c => {
                                                const q = (customerSearch || '').toLowerCase();
                                                return !q || (c.name || '').toLowerCase().includes(q) || (c.business_name || '').toLowerCase().includes(q) || (c.phone_number || '').includes(q);
                                            }).length === 0 && (
                                                <div style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>No matching customers found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer Phone</label>
                                    <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="9876543210" />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer GSTIN (Optional)</label>
                                    <input type="text" value={formData.customer_gstin} onChange={(e) => setFormData({...formData, customer_gstin: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="07AAAAA1111A1Z1" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Billing Address</label>
                                    <textarea value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} placeholder="Billing Address..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                    <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', minHeight: '60px' }} placeholder="Shipping Address..." />
                                </div>
                            </div>

                            {/* Dates & Status */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Order Date</label>
                                    <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Delivery Due Date</label>
                                    <input required type="date" value={formData.delivery_date} onChange={(e) => setFormData({...formData, delivery_date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="Draft">Draft</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Itemized List Section */}
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#064E3B', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'center', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '14px' }}>
                                            <input required type="text" placeholder="Product Name" value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <input type="text" placeholder="SKU" value={item.sku} onChange={(e) => handleItemChange(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <input type="text" placeholder="HSN" value={item.hsn} onChange={(e) => handleItemChange(idx, 'hsn', e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <input required type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <input required type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <input type="number" placeholder="Disc%" value={item.discount} onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }} />
                                            <select value={item.gst} onChange={(e) => handleItemChange(idx, 'gst', parseInt(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.9rem' }}>
                                                <option value={0}>0% GST</option>
                                                <option value={5}>5% GST</option>
                                                <option value={12}>12% GST</option>
                                                <option value={18}>18% GST</option>
                                                <option value={28}>28% GST</option>
                                            </select>
                                            <span style={{ fontWeight: '750', color: '#064E3B', minWidth: '70px', textAlign: 'right', fontSize: '0.95rem' }}>₹{(item.total || 0).toLocaleString()}</span>
                                            {formData.items.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddItem} style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F0FDF4', color: '#15803D', border: '1px solid #DCF2E4', padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                    <Plus size={16} /> Add Product
                                </button>
                            </div>

                            {/* Summary & Advance Payment Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#064E3B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Payment & Charges</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Advance Amount Received (₹)</label>
                                            <input type="number" value={formData.advance_amount} onChange={(e) => setFormData({...formData, advance_amount: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Shipping / Delivery Charge (₹)</label>
                                            <input type="number" value={formData.shipping_charge} onChange={(e) => {
                                                const ship = parseFloat(e.target.value) || 0;
                                                const updated = calculateTotals(formData.items, ship);
                                                setFormData({ ...formData, shipping_charge: ship, ...updated });
                                            }} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>Subtotal</span>
                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>₹{(formData.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>Total Discount</span>
                                        <span style={{ fontWeight: '700', color: '#EF4444' }}>- ₹{(formData.total_discount || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>Total Tax (GST)</span>
                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>₹{(formData.total_tax || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748B', fontWeight: '600' }}>Shipping Charge</span>
                                        <span style={{ fontWeight: '700', color: '#1E293B' }}>₹{(formData.shipping_charge || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900', borderTop: '2px solid #F1F5F9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                        <span style={{ color: '#064E3B' }}>Grand Total</span>
                                        <span style={{ color: '#1B6B3A' }}>₹{(formData.grand_total || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                {editingOrder ? 'Update Sales Order' : 'Create Sales Order'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Shipping Fulfillment Tracking Modal */}
            {isFulfillmentOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Fulfillment & Tracking</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Order Number: {selectedOrder.order_number}</p>
                            </div>
                            <button onClick={() => setIsFulfillmentOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveFulfillment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Courier / Shipping Method</label>
                                <input type="text" value={selectedOrder.shipping_method || ''} onChange={(e) => setSelectedOrder({...selectedOrder, shipping_method: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="e.g. Fedex, DHL, Delhivery" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tracking Number</label>
                                <input type="text" value={selectedOrder.tracking_number || ''} onChange={(e) => setSelectedOrder({...selectedOrder, tracking_number: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="e.g. TRK7892109" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Dispatch Date</label>
                                <input type="date" value={selectedOrder.dispatch_date || ''} onChange={(e) => setSelectedOrder({...selectedOrder, dispatch_date: e.target.value})} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Save Fulfillment Details
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessSalesOrders;
