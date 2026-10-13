import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    CheckCircle2, 
    Layers, 
    DollarSign, 
    AlertCircle, 
    TrendingUp, 
    CheckSquare, 
    ArrowRight, 
    ShieldAlert, 
    RefreshCw,
    PackageCheck,
    X
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const ProductionCompletion = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();

    const initialOrderId = searchParams.get('orderId') || '';
    const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);

    // Completion Form State
    const [completionForm, setCompletionForm] = useState({
        good_quantity_produced: 0,
        rejected_quantity: 0,
        scrap_quantity: 0,
        remaining_quantity: 0,
        remaining_reason: '',
        labor_cost: 0,
        overhead_cost: 0,
        completion_notes: ''
    });

    // Fetch In-Progress production orders
    const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['activeOrdersForCompletion'],
        queryFn: () => manufacturingService.getOrders({ limit: 100 })
    });
    const activeOrders = (ordersData?.orders || []).filter(o => o.status === 'In Progress' || o.status === 'Confirmed');

    // Auto-select first in-progress order
    useEffect(() => {
        if (!selectedOrderId && activeOrders.length > 0) {
            setSelectedOrderId(String(activeOrders[0].id));
        }
    }, [activeOrders, selectedOrderId]);

    // Fetch details of selected order
    const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['orderCompletionDetails', selectedOrderId],
        queryFn: () => manufacturingService.getOrderById(selectedOrderId),
        enabled: !!selectedOrderId
    });

    // Sync default quantities when order details load
    useEffect(() => {
        if (orderDetails) {
            setCompletionForm({
                good_quantity_produced: orderDetails.planned_quantity || 0,
                rejected_quantity: 0,
                scrap_quantity: 0,
                remaining_quantity: 0,
                remaining_reason: '',
                labor_cost: orderDetails.labor_cost || 0,
                overhead_cost: orderDetails.overhead_cost || 0,
                completion_notes: ''
            });
        }
    }, [orderDetails]);

    // Live Costing Calculations
    const materials = orderDetails?.materials || [];
    let estimatedMaterialCost = 0;
    materials.forEach(m => {
        const qty = m.consumed_quantity > 0 ? m.consumed_quantity : (m.issued_quantity || m.planned_quantity);
        estimatedMaterialCost += (qty * (m.unit_cost || 0));
    });

    const totalProductionCost = estimatedMaterialCost + Number(completionForm.labor_cost || 0) + Number(completionForm.overhead_cost || 0);
    const goodUnits = Number(completionForm.good_quantity_produced) || 0;
    const actualUnitCost = goodUnits > 0 ? (totalProductionCost / goodUnits) : 0;
    const plannedCost = orderDetails?.planned_material_cost || 0;
    const costVariance = totalProductionCost - plannedCost;

    // Complete Production Mutation
    const completeMutation = useMutation({
        mutationFn: (data) => manufacturingService.completeProduction(selectedOrderId, data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            queryClient.invalidateQueries({ queryKey: ['activeOrdersForCompletion'] });
            queryClient.invalidateQueries({ queryKey: ['manufacturingDashboardKPIs'] });
            alert(`Production completed successfully! ${goodUnits} finished goods added to inventory catalog.`);
            navigate('/manufacturing/orders');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to complete production');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (goodUnits < 0) return alert('Good output units cannot be negative');
        if (confirm(`Finalize and post ${goodUnits} accepted ${orderDetails?.product_name || 'finished goods'} into inventory?`)) {
            completeMutation.mutate(completionForm);
        }
    };

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '10px', color: '#047857' }}>
                            <PackageCheck size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Production Completion & Finished Goods Output
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                        Validate production output, record rejections, compute final manufacturing cost per unit, and atomically post to inventory.
                    </p>
                </div>
            </div>

            {/* Order Selector */}
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        Select Production Order to Finalize:
                    </label>
                    <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#1E293B', background: '#FFF' }}
                    >
                        <option value="">-- Choose Order to Finalize --</option>
                        {activeOrders.map(o => (
                            <option key={o.id} value={o.id}>
                                #{o.order_number} — {o.product_name} (Planned: {o.planned_quantity} {o.product_unit}) [{o.status}]
                            </option>
                        ))}
                    </select>
                </div>

                {orderDetails && (
                    <div style={{ display: 'flex', gap: '1.5rem', paddingLeft: '1.5rem', borderLeft: '1px solid #E2E8F0' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Finished Product</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{orderDetails.product_name}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Target Planned</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{orderDetails.planned_quantity} {orderDetails.product_unit}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Destination Godown</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#047857' }}>
                                {orderDetails.destination_warehouse_name || orderDetails.destination_warehouse_id || 'Main Godown'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isLoadingDetails ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading order completion data...</div>
            ) : !orderDetails ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    Select an active production order above to record completion output.
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem' }}>
                    {/* Left Column: Output Quantities Form */}
                    <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B', margin: '0 0 1rem' }}>
                            Finished Goods Output Verification
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '1rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#14532D', marginBottom: '4px' }}>
                                    Accepted Good Output ({orderDetails.product_unit}) *
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.good_quantity_produced}
                                    onChange={(e) => setCompletionForm({ ...completionForm, good_quantity_produced: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', border: '2px solid #10B981', borderRadius: '8px', fontSize: '1.25rem', fontWeight: '850', color: '#047857' }}
                                    required
                                />
                                <span style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '4px', display: 'block' }}>
                                    This exact quantity will be added to Finished Goods inventory.
                                </span>
                            </div>

                            <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#991B1B', marginBottom: '4px' }}>
                                    Rejected / Defective Units ({orderDetails.product_unit})
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.rejected_quantity}
                                    onChange={(e) => setCompletionForm({ ...completionForm, rejected_quantity: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #F87171', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '750', color: '#DC2626' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '4px', display: 'block' }}>
                                    Quality rejections logged to wastage reports.
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Scrap / Spoilage Quantity
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.scrap_quantity}
                                    onChange={(e) => setCompletionForm({ ...completionForm, scrap_quantity: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                    Incomplete / Remaining Units
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.remaining_quantity}
                                    onChange={(e) => setCompletionForm({ ...completionForm, remaining_quantity: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        {/* Extra Costs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem', background: '#F8FAFC', borderRadius: '10px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                    Direct Labor Allocated (₹)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.labor_cost}
                                    onChange={(e) => setCompletionForm({ ...completionForm, labor_cost: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                                    Manufacturing Overhead (₹)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={completionForm.overhead_cost}
                                    onChange={(e) => setCompletionForm({ ...completionForm, overhead_cost: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                                Completion Notes / Quality Sign-off
                            </label>
                            <textarea
                                rows="3"
                                value={completionForm.completion_notes}
                                onChange={(e) => setCompletionForm({ ...completionForm, completion_notes: e.target.value })}
                                placeholder="Inspection results, batch serials, or disposition notes..."
                                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={completeMutation.isPending || goodUnits <= 0}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                border: 'none',
                                borderRadius: '10px',
                                background: goodUnits <= 0 ? '#94A3B8' : '#047857',
                                color: '#FFFFFF',
                                fontWeight: '800',
                                fontSize: '1rem',
                                cursor: goodUnits <= 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)'
                            }}
                        >
                            <CheckCircle2 size={20} />
                            {completeMutation.isPending ? 'Finalizing Production...' : `Complete Order & Add ${goodUnits} Units to Inventory`}
                        </button>
                    </div>

                    {/* Right Column: Real-time Costing Breakdown Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', margin: '0 0 1rem' }}>
                                Production Costing Engine
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                    <span>Raw Material Cost:</span>
                                    <b style={{ color: '#1E293B' }}>{formatCurrency(estimatedMaterialCost)}</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                    <span>Direct Labor:</span>
                                    <b style={{ color: '#1E293B' }}>{formatCurrency(Number(completionForm.labor_cost) || 0)}</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                    <span>Manufacturing Overhead:</span>
                                    <b style={{ color: '#1E293B' }}>{formatCurrency(Number(completionForm.overhead_cost) || 0)}</b>
                                </div>

                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '750', color: '#1E293B' }}>Total Production Cost:</span>
                                    <b style={{ fontSize: '1.1rem', color: '#1E293B' }}>{formatCurrency(totalProductionCost)}</b>
                                </div>

                                <div style={{ padding: '0.85rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '700', textTransform: 'uppercase' }}>
                                        Actual Cost Per Good Unit
                                    </div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#14532D', marginTop: '2px' }}>
                                        {formatCurrency(actualUnitCost)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '2px' }}>
                                        Formula: Total Cost / Accepted Good Output ({goodUnits} units)
                                    </div>
                                </div>

                                {plannedCost > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.25rem' }}>
                                        <span style={{ color: '#64748B' }}>Variance vs Planned:</span>
                                        <b style={{ color: costVariance > 0 ? '#DC2626' : '#16A34A' }}>
                                            {costVariance > 0 ? `+${formatCurrency(costVariance)}` : formatCurrency(costVariance)}
                                        </b>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Safety & Idempotency Checklist */}
                        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#64748B' }}>
                            <div style={{ fontWeight: '800', color: '#334155', marginBottom: '0.5rem' }}>
                                System Integrity Guarantees:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li>Atomic transaction: stock update and completion happen atomically.</li>
                                <li>Duplicate completions are strictly prevented.</li>
                                <li>Unissued materials will be deducted automatically now.</li>
                                <li>Immutable production audit history is preserved.</li>
                            </ul>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductionCompletion;
