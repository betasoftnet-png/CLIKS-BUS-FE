import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Activity, 
    RefreshCw, 
    Layers, 
    CheckCircle2, 
    AlertTriangle, 
    ArrowDownLeft, 
    ArrowUpRight, 
    ClipboardList, 
    Save, 
    TrendingUp, 
    DollarSign,
    X,
    Filter
} from 'lucide-react';
import { useCurrency } from '../../context';
import { manufacturingService } from '../../services';

const MaterialIssueConsumption = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { formatCurrency } = useCurrency();

    const initialOrderId = searchParams.get('orderId') || '';
    const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);

    // Modal state for recording consumption
    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
    const [consumptionForm, setConsumptionForm] = useState([]);

    // Fetch active/in-progress orders for selection
    const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['activeProductionOrdersList'],
        queryFn: () => manufacturingService.getOrders({ limit: 100 })
    });
    const orders = (ordersData?.orders || []).filter(o => o.status === 'In Progress' || o.status === 'Confirmed' || o.status === 'Draft');

    // Auto-select first order if none selected
    useEffect(() => {
        if (!selectedOrderId && orders.length > 0) {
            setSelectedOrderId(String(orders[0].id));
        }
    }, [orders, selectedOrderId]);

    // Fetch details of selected order
    const { data: orderDetails, isLoading: isLoadingDetails, refetch: refetchDetails } = useQuery({
        queryKey: ['orderMaterialDetails', selectedOrderId],
        queryFn: () => manufacturingService.getOrderById(selectedOrderId),
        enabled: !!selectedOrderId
    });

    const materials = orderDetails?.materials || [];

    // Initialize consumption form when modal opens
    const handleOpenConsumptionModal = () => {
        setConsumptionForm(materials.map(m => ({
            id: m.id,
            material_id: m.product_id,
            material_name: m.material_name,
            unit: m.unit,
            planned_quantity: m.planned_quantity,
            issued_quantity: m.issued_quantity || 0,
            consumed_quantity: m.consumed_quantity > 0 ? m.consumed_quantity : (m.issued_quantity || m.planned_quantity),
            returned_quantity: m.returned_quantity || 0,
            wasted_quantity: m.wasted_quantity || 0,
            wastage_reason: m.wastage_reason || ''
        })));
        setIsConsumptionModalOpen(true);
    };

    // Issue materials mutation
    const issueMutation = useMutation({
        mutationFn: () => manufacturingService.issueMaterials(selectedOrderId, {}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orderMaterialDetails'] });
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            alert('All planned raw materials issued to production floor! Inventory deducted.');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to issue materials');
        }
    });

    // Save consumption mutation
    const consumptionMutation = useMutation({
        mutationFn: (data) => manufacturingService.recordConsumption(selectedOrderId, { consumptions: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orderMaterialDetails'] });
            queryClient.invalidateQueries({ queryKey: ['productionOrders'] });
            setIsConsumptionModalOpen(false);
            alert('Material consumption, returns, and wastage recorded successfully!');
        },
        onError: (err) => {
            alert(err.response?.data?.error?.message || err.message || 'Failed to save consumption');
        }
    });

    return (
        <div style={{ padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'inherit' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '8px', background: '#FEF3C7', borderRadius: '10px', color: '#D97706' }}>
                            <Activity size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064E3B', margin: 0, letterSpacing: '-0.02em' }}>
                            Material Issue, Consumption & Wastage
                        </h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                        Track planned vs issued vs actual consumed raw materials, return unused stock, and log scrap/spoilage.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {orderDetails && orderDetails.status === 'Confirmed' && (
                        <button
                            onClick={() => {
                                if (confirm(`Issue all planned materials for order #${orderDetails.order_number}? Stock will be deducted.`)) {
                                    issueMutation.mutate();
                                }
                            }}
                            disabled={issueMutation.isPending}
                            style={{
                                padding: '0.65rem 1.25rem',
                                border: 'none',
                                borderRadius: '10px',
                                background: '#1D4ED8',
                                color: '#FFFFFF',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowUpRight size={18} /> Issue Materials to Floor
                        </button>
                    )}

                    {orderDetails && orderDetails.status === 'In Progress' && (
                        <button
                            onClick={handleOpenConsumptionModal}
                            style={{
                                padding: '0.65rem 1.25rem',
                                border: 'none',
                                borderRadius: '10px',
                                background: '#D97706',
                                color: '#FFFFFF',
                                fontWeight: '700',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
                            }}
                        >
                            <Save size={18} /> Record Consumption & Returns
                        </button>
                    )}
                </div>
            </div>

            {/* Select Production Order Selector Bar */}
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                        Select Production Order to Track:
                    </label>
                    <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#1E293B', background: '#FFF' }}
                    >
                        <option value="">-- Choose Production Order --</option>
                        {orders.map(o => (
                            <option key={o.id} value={o.id}>
                                #{o.order_number} — {o.product_name} ({o.planned_quantity} units) [{o.status}]
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
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Planned Output</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1E293B' }}>{orderDetails.planned_quantity} {orderDetails.product_unit}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Order Status</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: orderDetails.status === 'In Progress' ? '#D97706' : '#1D4ED8' }}>
                                {orderDetails.status}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Materials Table: Planned vs Issued vs Consumed vs Variance */}
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>
                        Raw Material Breakdown & Variances
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Stock deducted at issue. Any unused returns increase stock balance automatically.
                    </div>
                </div>

                {isLoadingDetails ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading material details...</div>
                ) : !orderDetails ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>Select a production order above to view raw material consumption.</div>
                ) : materials.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No component materials recorded on this order.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '14px 16px' }}>Component (Raw Material)</th>
                                    <th style={{ padding: '14px 16px' }}>Planned Qty</th>
                                    <th style={{ padding: '14px 16px' }}>Issued Qty</th>
                                    <th style={{ padding: '14px 16px' }}>Actual Consumed</th>
                                    <th style={{ padding: '14px 16px' }}>Returned Stock</th>
                                    <th style={{ padding: '14px 16px' }}>Wastage / Scrap</th>
                                    <th style={{ padding: '14px 16px' }}>Variance</th>
                                    <th style={{ padding: '14px 16px' }}>Unit Cost</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((m, idx) => {
                                    const isExcess = (m.consumed_quantity || 0) > m.planned_quantity;
                                    const variance = (m.consumed_quantity || 0) - m.planned_quantity;

                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: '750', color: '#1E293B' }}>{m.material_name}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{m.material_sku}</div>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: '700', color: '#334155' }}>
                                                {m.planned_quantity} {m.unit}
                                            </td>
                                            <td style={{ padding: '14px 16px', color: (m.issued_quantity || 0) > 0 ? '#1D4ED8' : '#94A3B8', fontWeight: '600' }}>
                                                {m.issued_quantity || 0} {m.unit}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: '800', color: (m.consumed_quantity || 0) > 0 ? '#0F172A' : '#94A3B8' }}>
                                                {m.consumed_quantity || 0} {m.unit}
                                            </td>
                                            <td style={{ padding: '14px 16px', color: (m.returned_quantity || 0) > 0 ? '#16A34A' : '#94A3B8', fontWeight: '700' }}>
                                                {m.returned_quantity || 0} {m.unit}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {(m.wasted_quantity || 0) > 0 ? (
                                                    <div>
                                                        <span style={{ color: '#DC2626', fontWeight: '750' }}>{m.wasted_quantity} {m.unit}</span>
                                                        {m.wastage_reason && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>({m.wastage_reason})</div>}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#94A3B8' }}>0</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {m.consumed_quantity > 0 ? (
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: '750',
                                                        fontSize: '0.78rem',
                                                        background: variance > 0 ? '#FEE2E2' : '#DCFCE7',
                                                        color: variance > 0 ? '#DC2626' : '#15803D'
                                                    }}>
                                                        {variance > 0 ? `+${variance}` : variance} {m.unit}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#94A3B8' }}>Pending</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px', color: '#475569' }}>
                                                {formatCurrency(m.unit_cost || 0)}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '750', color: '#1E293B' }}>
                                                {formatCurrency(m.total_cost || ((m.consumed_quantity || m.planned_quantity) * (m.unit_cost || 0)))}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* RECORD CONSUMPTION & RETURNS MODAL */}
            {isConsumptionModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D97706', margin: 0 }}>
                                    Record Actual Material Consumption
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0' }}>
                                    Enter actual amounts consumed, returned unused materials, and scrap/wastage with reasons
                                </p>
                            </div>
                            <button onClick={() => setIsConsumptionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            consumptionMutation.mutate(consumptionForm);
                        }}>
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#F8FAFC', color: '#475569' }}>
                                        <tr>
                                            <th style={{ padding: '8px 10px', width: '25%' }}>Material</th>
                                            <th style={{ padding: '8px 10px', width: '12%' }}>Planned</th>
                                            <th style={{ padding: '8px 10px', width: '18%' }}>Actual Consumed *</th>
                                            <th style={{ padding: '8px 10px', width: '15%' }}>Return to Godown</th>
                                            <th style={{ padding: '8px 10px', width: '15%' }}>Scrap / Wasted</th>
                                            <th style={{ padding: '8px 10px', width: '15%' }}>Wastage Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consumptionForm.map((item, idx) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '8px 10px', fontWeight: '600' }}>
                                                    {item.material_name}
                                                </td>
                                                <td style={{ padding: '8px 10px', color: '#64748B' }}>
                                                    {item.planned_quantity} {item.unit}
                                                </td>
                                                <td style={{ padding: '8px 10px' }}>
                                                    <input 
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={item.consumed_quantity}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setConsumptionForm(prev => prev.map((x, i) => i === idx ? { ...x, consumed_quantity: val } : x));
                                                        }}
                                                        style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                        required
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 10px' }}>
                                                    <input 
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={item.returned_quantity}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setConsumptionForm(prev => prev.map((x, i) => i === idx ? { ...x, returned_quantity: val } : x));
                                                        }}
                                                        style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 10px' }}>
                                                    <input 
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        value={item.wasted_quantity}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            setConsumptionForm(prev => prev.map((x, i) => i === idx ? { ...x, wasted_quantity: val } : x));
                                                        }}
                                                        style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '8px 10px' }}>
                                                    <input 
                                                        type="text"
                                                        placeholder="Spillage, scrap, burnt..."
                                                        value={item.wastage_reason}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setConsumptionForm(prev => prev.map((x, i) => i === idx ? { ...x, wastage_reason: val } : x));
                                                        }}
                                                        style={{ width: '100%', padding: '0.45rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.82rem' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsConsumptionModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFF', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={consumptionMutation.isPending}
                                    style={{ padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', background: '#D97706', color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    {consumptionMutation.isPending ? 'Saving...' : 'Save Consumption & Returns'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialIssueConsumption;
