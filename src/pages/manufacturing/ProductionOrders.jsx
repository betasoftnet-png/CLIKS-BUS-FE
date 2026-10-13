import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ClipboardList, 
    Plus, 
    Search, 
    CheckCircle2, 
    AlertTriangle, 
    Play, 
    CheckSquare, 
    XCircle, 
    Eye, 
    Clock, 
    RefreshCw, 
    Warehouse, 
    Layers, 
    Calendar, 
    ArrowRight, 
    Activity, 
    DollarSign,
    ShieldAlert,
    X,
    Filter
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const ProductionOrders = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();

    // Filters
    const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [overrideShortage, setOverrideShortage] = useState(false);

    // Create Order Form State
    const [orderForm, setOrderForm] = useState({
        order_number: '',
        product_id: '',
        bom_id: '',
        planned_quantity: 100,
        source_warehouse_id: '',
        destination_warehouse_id: '',
        planned_date: new Date().toISOString().split('T')[0],
        responsible_employee: '',
        notes: ''
    });

    // Auto-open specific order if passed via searchParams
    const urlOrderId = searchParams.get('orderId');

    // Fetch Orders
    const { data: ordersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
        queryKey: ['productionOrders', activeTab, searchQuery, selectedWarehouse],
        queryFn: () => manufacturingService.getOrders({
            status: activeTab === 'all' ? undefined : activeTab,
            q: searchQuery,
            warehouse_id: selectedWarehouse || undefined
        })
    });
    const orders = ordersData?.orders || [];

    // Fetch Catalog & BOMs
    const { data: boms = [] } = useQuery({
        queryKey: ['bomsActiveList'],
        queryFn: () => manufacturingService.getBoms({ status: 'active' })
    });

    const { data: productsData = [] } = useQuery({
        queryKey: ['productsCatalogList'],
        queryFn: () => manufacturingService.getProducts({ limit: 500 })
    });
    const products = Array.isArray(productsData) ? productsData : (productsData?.products || []);

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehousesList'],
        queryFn: () => manufacturingService.getWarehouses()
    });

    // Fetch Selected Order Details
    const { data: orderDetails, isLoading: isLoadingDetails, refetch: refetchOrderDetails } = useQuery({
        queryKey: ['productionOrderDetails', selectedOrder?.id],
        queryFn: () => manufacturingService.getOrderById(selectedOrder.id),
        enabled: !!selectedOrder?.id
    });

    // Availability Check Query
    const { data: availabilityCheck, isLoading: isCheckingAvailability, refetch: runAvailabilityCheck } = useQuery({
        queryKey: ['materialAvailability', selectedOrder?.id],
        queryFn: () => manufacturingService.checkAvailability(selectedOrder.id),
        enabled: !!selectedOrder?.id && isAvailabilityModalOpen
    });

    // Auto-open modal if URL param matches
    useEffect(() => {
        if (urlOrderId && orders.length > 0) {
            const found = orders.find(o => String(o.id) === String(urlOrderId));
            if (found) {
                setSelectedOrder(found);
                setIsDetailsModalOpen(true);
            }
        }
    }, [urlOrderId, orders]);

    // Mutations
    const createOrderMutation = useMutation({
        mutationFn: (data) => manufacturingService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            queryClient.invalidateQueries({ queryKey: ['manufacturingDashboardKPIs'] });
            setIsCreateModalOpen(false);
            alert('Production order created successfully (Draft)!');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to create production order');
        }
    });

    const confirmOrderMutation = useMutation({
        mutationFn: ({ id, override }) => manufacturingService.confirmOrder(id, { override_shortage: override }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            queryClient.invalidateQueries({ queryKey: ['productionOrderDetails'] });
            setIsAvailabilityModalOpen(false);
            alert('Production order confirmed! Materials verified.');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to confirm order');
        }
    });

    const issueMaterialsMutation = useMutation({
        mutationFn: (id) => manufacturingService.issueMaterials(id, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            queryClient.invalidateQueries({ queryKey: ['productionOrderDetails'] });
            alert('Raw materials issued & production started (In Progress)! Stock deducted from inventory.');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to issue materials');
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: ({ id, reason }) => manufacturingService.cancelOrder(id, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            queryClient.invalidateQueries({ queryKey: ['productionOrderDetails'] });
            setIsCancelModalOpen(false);
            alert('Production order cancelled and any issued materials reversed to inventory.');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to cancel order');
        }
    });

    const handleProductSelect = (productId) => {
        const prodBoms = boms.filter(b => Number(b.product_id) === Number(productId));
        const defaultBom = prodBoms.find(b => b.is_default) || prodBoms[0];
        setOrderForm(prev => ({
            ...prev,
            product_id: productId,
            bom_id: defaultBom ? defaultBom.id : ''
        }));
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!orderForm.product_id && !orderForm.bom_id) return alert('Select finished product / recipe');
        if (Number(orderForm.planned_quantity) <= 0) return alert('Planned quantity must be greater than 0');

        createOrderMutation.mutate(orderForm);
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Draft': { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
            'Confirmed': { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
            'In Progress': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
            'Completed': { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
            'Cancelled': { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
        };
        const s = styles[status] || styles['Draft'];
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '750',
                backgroundColor: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: '10px', color: '#1D4ED8' }}>
                            <ClipboardList size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Production Orders
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                        Manage the complete manufacturing lifecycle: Draft → Availability Check → Material Issue → Execution → Completion.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => {
                            setOrderForm({
                                order_number: `MO-${Date.now().toString().slice(-6)}`,
                                product_id: '',
                                bom_id: '',
                                planned_quantity: 100,
                                source_warehouse_id: '',
                                destination_warehouse_id: '',
                                planned_date: new Date().toISOString().split('T')[0],
                                responsible_employee: '',
                                notes: ''
                            });
                            setIsCreateModalOpen(true);
                        }}
                        style={{
                            padding: '0.7rem 1.3rem',
                            border: 'none',
                            borderRadius: '10px',
                            background: '#1B6B3A',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(27, 107, 58, 0.25)'
                        }}
                    >
                        <Plus size={18} /> New Production Order
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '1.25rem', gap: '0.5rem' }}>
                {['all', 'Draft', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.65rem 1.25rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '3px solid #1B6B3A' : '3px solid transparent',
                            color: activeTab === tab ? '#1B6B3A' : '#64748B',
                            fontWeight: '750',
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'all' ? 'All Orders' : tab}
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: '1rem', background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text"
                        placeholder="Search by order #, product name, or recipe..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.5rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>

                <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    style={{ padding: '0.65rem 1rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.9rem', background: '#FFFFFF', color: '#334155', outline: 'none' }}
                >
                    <option value="">All Warehouses</option>
                    {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code || 'Godown'})</option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {isLoadingOrders ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={30} className="spin" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                        <p>Loading production orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94A3B8' }}>
                        <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                        <h3 style={{ color: '#1E293B', fontWeight: '700', marginBottom: '0.25rem' }}>No production orders found</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Create a production order to plan and track manufacturing execution.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '14px 16px' }}>Order #</th>
                                    <th style={{ padding: '14px 16px' }}>Finished Product</th>
                                    <th style={{ padding: '14px 16px' }}>Planned Qty</th>
                                    <th style={{ padding: '14px 16px' }}>Output Good</th>
                                    <th style={{ padding: '14px 16px' }}>Planned Date</th>
                                    <th style={{ padding: '14px 16px' }}>Source Godown</th>
                                    <th style={{ padding: '14px 16px' }}>Status</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0F172A' }}>
                                            {order.order_number}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: '700', color: '#1E293B' }}>{order.product_name || 'N/A'}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Recipe: {order.bom_name} (v{order.bom_version || '1.0'})</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                                            <b>{order.planned_quantity}</b> {order.product_unit || 'units'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#16A34A', fontWeight: '750' }}>
                                            {order.completed_quantity || 0} {order.product_unit || 'units'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                                            {order.planned_date || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                                            {order.source_warehouse_name || order.source_warehouse_id || 'Main Godown'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                {/* View / Details */}
                                                <button
                                                    title="View Order Details & History"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsDetailsModalOpen(true);
                                                    }}
                                                    style={{ padding: '6px 10px', background: '#F1F5F9', border: 'none', borderRadius: '6px', color: '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    <Eye size={14} style={{ marginRight: '4px' }} /> View
                                                </button>

                                                {/* Action based on status */}
                                                {order.status === 'Draft' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsAvailabilityModalOpen(true);
                                                        }}
                                                        style={{ padding: '6px 10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', color: '#1D4ED8', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Check Stock & Confirm
                                                    </button>
                                                )}

                                                {order.status === 'Confirmed' && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Issue raw materials from godown and start production order #${order.order_number}?`)) {
                                                                issueMaterialsMutation.mutate(order.id);
                                                            }
                                                        }}
                                                        style={{ padding: '6px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', color: '#047857', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Play size={12} /> Issue & Start
                                                    </button>
                                                )}

                                                {order.status === 'In Progress' && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/manufacturing/consumption?orderId=${order.id}`)}
                                                            style={{ padding: '6px 10px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '6px', color: '#B45309', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Consumption
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/manufacturing/completion?orderId=${order.id}`)}
                                                            style={{ padding: '6px 10px', background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '6px', color: '#065F46', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Complete
                                                        </button>
                                                    </>
                                                )}

                                                {/* Cancel Option for Draft/Confirmed/In Progress */}
                                                {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                                    <button
                                                        title="Cancel Order"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setCancellationReason('');
                                                            setIsCancelModalOpen(true);
                                                        }}
                                                        style={{ padding: '6px', background: '#FEF2F2', border: 'none', borderRadius: '6px', color: '#DC2626', cursor: 'pointer' }}
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE PRODUCTION ORDER MODAL */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#064E3B', margin: 0 }}>Create Production Order</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>Plan a production run using an approved Bill of Materials (recipe)</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Order Number</label>
                                    <input 
                                        type="text" 
                                        value={orderForm.order_number} 
                                        onChange={(e) => setOrderForm({ ...orderForm, order_number: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Planned Production Date *</label>
                                    <input 
                                        type="date" 
                                        value={orderForm.planned_date} 
                                        onChange={(e) => setOrderForm({ ...orderForm, planned_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Finished Product to Manufacture *</label>
                                    <select
                                        value={orderForm.product_id}
                                        onChange={(e) => handleProductSelect(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                                        required
                                    >
                                        <option value="">-- Select Product --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.sku || 'No SKU'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Bill of Materials (Recipe) *</label>
                                    <select
                                        value={orderForm.bom_id}
                                        onChange={(e) => setOrderForm({ ...orderForm, bom_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                                        required
                                    >
                                        <option value="">-- Select BOM Recipe --</option>
                                        {boms
                                            .filter(b => !orderForm.product_id || Number(b.product_id) === Number(orderForm.product_id))
                                            .map(b => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name} (v{b.version || '1.0'}) [{b.output_quantity} {b.output_unit}]
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Planned Quantity to Produce *</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={orderForm.planned_quantity} 
                                        onChange={(e) => setOrderForm({ ...orderForm, planned_quantity: parseFloat(e.target.value) || 1 })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Responsible Employee / Supervisor</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Production Manager"
                                        value={orderForm.responsible_employee} 
                                        onChange={(e) => setOrderForm({ ...orderForm, responsible_employee: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Source Warehouse (Raw Materials)</label>
                                    <select
                                        value={orderForm.source_warehouse_id}
                                        onChange={(e) => setOrderForm({ ...orderForm, source_warehouse_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                                    >
                                        <option value="">Default Godown</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.location || 'Godown'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Destination Warehouse (Finished Goods)</label>
                                    <select
                                        value={orderForm.destination_warehouse_id}
                                        onChange={(e) => setOrderForm({ ...orderForm, destination_warehouse_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                                    >
                                        <option value="">Default Godown</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({w.location || 'Godown'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Notes / Batch Instructions</label>
                                <textarea 
                                    rows="2"
                                    value={orderForm.notes}
                                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                                    placeholder="Optional notes or batch instructions..."
                                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createOrderMutation.isPending}
                                    style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', background: '#1B6B3A', color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {createOrderMutation.isPending ? 'Creating Order...' : 'Create Production Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MATERIAL AVAILABILITY CHECK & CONFIRM MODAL */}
            {isAvailabilityModalOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: '750', color: '#1D4ED8', textTransform: 'uppercase' }}>Material Availability Verification</span>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                                    Order #{selectedOrder.order_number} ({selectedOrder.planned_quantity} {selectedOrder.product_name})
                                </h2>
                            </div>
                            <button onClick={() => setIsAvailabilityModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        {isCheckingAvailability ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
                                <RefreshCw size={28} className="spin" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                <p>Checking godown stock balances...</p>
                            </div>
                        ) : availabilityCheck ? (
                            <div>
                                {/* Status Banner */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '10px',
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: availabilityCheck.can_release ? '#ECFDF5' : '#FFFBEB',
                                    border: `1px solid ${availabilityCheck.can_release ? '#A7F3D0' : '#FCD34D'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {availabilityCheck.can_release ? (
                                            <CheckCircle2 size={24} color="#059669" />
                                        ) : (
                                            <AlertTriangle size={24} color="#D97706" />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '800', color: availabilityCheck.can_release ? '#065F46' : '#92400E', fontSize: '0.95rem' }}>
                                                {availabilityCheck.can_release ? 'All Materials In Stock & Ready to Release' : `${availabilityCheck.shortage_count} Raw Material Shortage(s) Detected`}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: availabilityCheck.can_release ? '#047857' : '#B45309' }}>
                                                {availabilityCheck.can_release ? 'You can safely confirm and release this order to production.' : 'Materials are insufficient in godown. Release is blocked unless authorized override is confirmed.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '1.25rem' }}>
                                    <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                                        <tr>
                                            <th style={{ padding: '8px 10px' }}>Raw Material</th>
                                            <th style={{ padding: '8px 10px' }}>Required</th>
                                            <th style={{ padding: '8px 10px' }}>Available Stock</th>
                                            <th style={{ padding: '8px 10px' }}>Reserved</th>
                                            <th style={{ padding: '8px 10px' }}>Shortage</th>
                                            <th style={{ padding: '8px 10px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availabilityCheck.components.map((c, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: c.status === 'Shortage' ? '#FFFDF5' : 'transparent' }}>
                                                <td style={{ padding: '9px 10px', fontWeight: '600' }}>{c.material_name}</td>
                                                <td style={{ padding: '9px 10px', fontWeight: '750' }}>{c.required_quantity} {c.unit}</td>
                                                <td style={{ padding: '9px 10px' }}>{c.current_stock} {c.stock_unit}</td>
                                                <td style={{ padding: '9px 10px', color: '#64748B' }}>{c.reserved_quantity}</td>
                                                <td style={{ padding: '9px 10px' }}>
                                                    {c.shortage_quantity > 0 ? (
                                                        <span style={{ color: '#DC2626', fontWeight: '750' }}>{c.shortage_quantity} {c.stock_unit}</span>
                                                    ) : (
                                                        <span style={{ color: '#16A34A' }}>0</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '9px 10px' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '750',
                                                        background: c.status === 'Shortage' ? '#FEE2E2' : '#DCFCE7',
                                                        color: c.status === 'Shortage' ? '#DC2626' : '#15803D'
                                                    }}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Override Checkbox if Shortage */}
                                {!availabilityCheck.can_release && (
                                    <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input 
                                            type="checkbox"
                                            id="overrideShortage"
                                            checked={overrideShortage}
                                            onChange={(e) => setOverrideShortage(e.target.checked)}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="overrideShortage" style={{ fontSize: '0.85rem', color: '#991B1B', fontWeight: '600', cursor: 'pointer' }}>
                                            Authorized Manager Override: Confirm order despite raw material shortages (will be logged in audit trail)
                                        </label>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsAvailabilityModalOpen(false)}
                                        style={{ padding: '0.65rem 1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        disabled={(!availabilityCheck.can_release && !overrideShortage) || confirmOrderMutation.isPending}
                                        onClick={() => confirmOrderMutation.mutate({ id: selectedOrder.id, override: overrideShortage })}
                                        style={{
                                            padding: '0.65rem 1.5rem',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: (!availabilityCheck.can_release && !overrideShortage) ? '#94A3B8' : '#1D4ED8',
                                            color: '#FFF',
                                            fontWeight: '700',
                                            cursor: (!availabilityCheck.can_release && !overrideShortage) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {confirmOrderMutation.isPending ? 'Confirming...' : 'Confirm Production Order'}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ORDER DETAILS & AUDIT LOGS MODAL */}
            {isDetailsModalOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                                        Order #{selectedOrder.order_number}
                                    </h2>
                                    {getStatusBadge(orderDetails?.status || selectedOrder.status)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                                    Finished Good: <b>{orderDetails?.product_name || selectedOrder.product_name}</b> • Recipe: {orderDetails?.bom_name || selectedOrder.bom_name}
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        {isLoadingDetails ? (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>Loading full order details...</div>
                        ) : orderDetails ? (
                            <div>
                                {/* Summary Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '1rem', background: '#F8FAFC', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Planned Quantity</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>{orderDetails.planned_quantity} {orderDetails.product_unit}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Completed Good Output</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#16A34A' }}>{orderDetails.completed_quantity || 0} {orderDetails.product_unit}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Total Actual Cost</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>{formatCurrency(orderDetails.total_cost || orderDetails.planned_material_cost || 0)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Actual Unit Cost</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#16A34A' }}>{formatCurrency(orderDetails.unit_cost || 0)}</div>
                                    </div>
                                </div>

                                {/* Materials Line Items */}
                                <h4 style={{ margin: '0 0 0.5rem', color: '#1E293B', fontWeight: '800' }}>Material Lines Tracking</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '1.25rem' }}>
                                    <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                                        <tr>
                                            <th style={{ padding: '8px 10px' }}>Material</th>
                                            <th style={{ padding: '8px 10px' }}>Planned</th>
                                            <th style={{ padding: '8px 10px' }}>Issued</th>
                                            <th style={{ padding: '8px 10px' }}>Consumed</th>
                                            <th style={{ padding: '8px 10px' }}>Wasted</th>
                                            <th style={{ padding: '8px 10px' }}>Unit Cost</th>
                                            <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(orderDetails.materials || []).map((m, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '9px 10px', fontWeight: '600' }}>{m.material_name}</td>
                                                <td style={{ padding: '9px 10px' }}>{m.planned_quantity} {m.unit}</td>
                                                <td style={{ padding: '9px 10px', color: m.issued_quantity > 0 ? '#16A34A' : '#64748B', fontWeight: '600' }}>
                                                    {m.issued_quantity || 0} {m.unit}
                                                </td>
                                                <td style={{ padding: '9px 10px', fontWeight: '700' }}>{m.consumed_quantity || 0} {m.unit}</td>
                                                <td style={{ padding: '9px 10px', color: m.wasted_quantity > 0 ? '#DC2626' : '#64748B' }}>
                                                    {m.wasted_quantity || 0} {m.unit}
                                                </td>
                                                <td style={{ padding: '9px 10px' }}>{formatCurrency(m.unit_cost || 0)}</td>
                                                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: '750' }}>{formatCurrency(m.total_cost || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Audit Logs Timeline */}
                                <h4 style={{ margin: '0 0 0.5rem', color: '#1E293B', fontWeight: '800' }}>Audit & Execution Trail</h4>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', background: '#F8FAFC', maxHeight: '180px', overflowY: 'auto' }}>
                                    {(orderDetails.logs || []).length === 0 ? (
                                        <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>No log entries found.</div>
                                    ) : (
                                        (orderDetails.logs || []).map((log, idx) => (
                                            <div key={idx} style={{ padding: '6px 0', borderBottom: idx < orderDetails.logs.length - 1 ? '1px solid #E2E8F0' : 'none', fontSize: '0.82rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                                                    <b style={{ color: '#1E293B' }}>{log.action}</b>
                                                    <span>{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</span>
                                                </div>
                                                <div style={{ color: '#334155', marginTop: '2px' }}>{log.details}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* CANCEL ORDER MODAL */}
            {isCancelModalOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#DC2626', margin: '0 0 0.5rem' }}>
                            Cancel Production Order #{selectedOrder.order_number}?
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1rem' }}>
                            Cancelling this order will automatically reverse and return any issued raw materials back to inventory.
                        </p>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Cancellation Reason *</label>
                            <textarea
                                rows="3"
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                placeholder="Explain why this production order is being cancelled..."
                                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.88rem' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                style={{ padding: '0.65rem 1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Never Mind
                            </button>
                            <button
                                type="button"
                                disabled={!cancellationReason.trim() || cancelOrderMutation.isPending}
                                onClick={() => cancelOrderMutation.mutate({ id: selectedOrder.id, reason: cancellationReason })}
                                style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', background: '#DC2626', color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                            >
                                {cancelOrderMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionOrders;
