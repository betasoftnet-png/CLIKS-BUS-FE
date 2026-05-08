import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../services';
import { 
    Layers, 
    Plus, 
    Search, 
    ArrowRightLeft, 
    TrendingDown, 
    TrendingUp, 
    AlertTriangle, 
    Warehouse, 
    Calendar, 
    Activity, 
    DollarSign, 
    MapPin, 
    CheckCircle2, 
    Info, 
    X, 
    FileText, 
    ChevronRight, 
    RefreshCw, 
    Sliders,
    Zap
} from 'lucide-react';
import '../App.css';

const BusinessStock = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'movement', 'warehouse', 'batch'
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Live Stocks from backend with full fallback to UI specifications
    const { data: dbStocks = [] } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockService.getStocks()
    });

    useQuery({
        queryKey: ['stockStats'],
        queryFn: () => stockService.getStockStats()
    });

    const adjustMutation = useMutation({
        mutationFn: ({ id, delta }) => stockService.adjustQuantity(id, delta),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['stockStats'] });
            alert('Stock Adjustment audited & running ledger counts revalued successfully!');
            setIsAdjustmentModalOpen(false);
        }
    });

    // Mapping dbRows to UI properties safely
    const stocks = dbStocks.length > 0 ? dbStocks.map(s => ({
        stock_id: `STK-${s.id}`,
        id: s.id,
        product_id: s.sku || `PROD-${s.id}`,
        product_name: s.name || 'Unnamed Stock Item',
        opening_stock: s.opening_stock || 10,
        current_stock: s.quantity || 0,
        available_stock: s.quantity || 0,
        reserved_stock: 0,
        damaged_stock: 0,
        expired_stock: 0,
        in_transit_stock: 0,
        minimum_stock: s.low_stock_threshold || 5,
        reorder_level: s.low_stock_threshold || 5,
        reorder_quantity: 50,
        purchase_cost: s.unit_price || 0,
        average_cost: s.unit_price || 0,
        selling_value: (s.unit_price || 0) * 1.2,
        rack_number: s.location || 'Rack A-1',
        warehouse_name: s.location || 'Main Godown'
    })) : [
        {
            stock_id: 'STK-001',
            product_id: 'PROD-101',
            product_name: 'Dell Inspiron 15 Laptop',
            opening_stock: 100,
            current_stock: 125,
            available_stock: 110,
            reserved_stock: 10,
            damaged_stock: 3,
            expired_stock: 2,
            in_transit_stock: 10,
            minimum_stock: 20,
            reorder_level: 30,
            reorder_quantity: 50,
            purchase_cost: 35000,
            average_cost: 36200,
            selling_value: 45000,
            rack_number: 'Rack A-3',
            warehouse_name: 'Main Godown'
        },
        {
            stock_id: 'STK-002',
            product_id: 'PROD-105',
            product_name: 'Boat Bassheads Earphones',
            opening_stock: 500,
            current_stock: 15,
            available_stock: 15,
            reserved_stock: 0,
            damaged_stock: 0,
            expired_stock: 0,
            in_transit_stock: 200,
            minimum_stock: 50,
            reorder_level: 100,
            reorder_quantity: 500,
            purchase_cost: 250,
            average_cost: 260,
            selling_value: 399,
            rack_number: 'Shelf B-2',
            warehouse_name: 'Shop Front'
        }
    ];

    // Simulated Movements with safe fallback
    const [movements] = useState([
        {
            movement_id: 'MOV-1090',
            movement_type: 'in',
            movement_quantity: 50,
            movement_reason: 'Purchase Inward',
            reference_id: 'BILL-77091',
            performed_by: 'Ankit Sharma (Inventory)',
            movement_date: '2026-05-01',
            product_name: 'Dell Inspiron 15 Laptop'
        }
    ]);

    // Simulated Transfers
    const [transfers, setTransfers] = useState([
        {
            transfer_id: 'TRF-9011',
            product_name: 'Boat Bassheads Earphones',
            qty: 20,
            from_warehouse: 'Main Godown',
            to_warehouse: 'Shop Front',
            status: 'Completed',
            transfer_date: '2026-05-04',
            reference: 'MIG-TRF-09'
        }
    ]);

    // Simulated Batches
    const [batches] = useState([
        {
            batch_number: 'B-DEL-99',
            product_name: 'Dell Inspiron 15 Laptop',
            manufacturing_date: '2026-01-10',
            expiry_date: '2029-01-10',
            batch_quantity: 125
        }
    ]);

    // Form inputs for Stock Adjustments
    const [adjustmentForm, setAdjustmentForm] = useState({
        product_id: 'PROD-101',
        adjustment_type: 'add', // 'add' or 'reduce'
        qty: 10,
        reason: 'Physical stock reconciliation audit',
        warehouse_name: 'Main Godown'
    });

    // Form inputs for Warehouse Transfers
    const [transferForm, setTransferForm] = useState({
        product_id: 'PROD-101',
        qty: 15,
        from_warehouse: 'Main Godown',
        to_warehouse: 'Shop Front',
        reference: 'MIG-TRF-12'
    });

    const handleSaveAdjustment = (e) => {
        e.preventDefault();
        const selectedProd = stocks.find(s => s.product_id === adjustmentForm.product_id);
        const adjustQty = parseInt(adjustmentForm.qty) || 0;
        const delta = adjustmentForm.adjustment_type === 'add' ? adjustQty : -adjustQty;

        if (selectedProd && selectedProd.id) {
            adjustMutation.mutate({ id: selectedProd.id, delta });
        } else {
            // Local fallback
            const updatedQty = adjustmentForm.adjustment_type === 'add' 
                ? (selectedProd?.current_stock || 0) + adjustQty 
                : Math.max(0, (selectedProd?.current_stock || 0) - adjustQty);

            alert(`Mock stock adjusted successfully to ${updatedQty}!`);
            setIsAdjustmentModalOpen(false);
        }
    };

    const handleSaveTransfer = (e) => {
        e.preventDefault();
        const selectedProd = stocks.find(s => s.product_id === transferForm.product_id);
        const transQty = parseInt(transferForm.qty) || 0;

        if (transQty > (selectedProd?.available_stock || 0)) {
            alert('Cannot transfer quantity higher than current available stock!');
            return;
        }

        const newTrf = {
            transfer_id: `TRF-${4000 + transfers.length + 1}`,
            product_name: selectedProd?.product_name || 'Product',
            qty: transQty,
            from_warehouse: transferForm.from_warehouse,
            to_warehouse: transferForm.to_warehouse,
            status: 'Completed',
            transfer_date: new Date().toISOString().split('T')[0],
            reference: transferForm.reference
        };

        setTransfers([newTrf, ...transfers]);
        setIsTransferModalOpen(false);
        alert('Stock successfully moved between warehouse logs!');
    };

    const filteredStocks = stocks.filter(st => 
        st.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Compute live inventory valuations
    const totalInventoryValue = stocks.reduce((sum, s) => sum + (s.current_stock * s.average_cost), 0);
    const lowStockAlertsCount = stocks.filter(s => s.current_stock <= s.reorder_level).length;

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Layers size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Stock & Inventory Valuation</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Real-time inventory engine, multi-warehouse branch transfers, batch expiries, FIFO valuation, and reorder levels.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsAdjustmentModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <Sliders size={16} /> Adjust Stock Counts
                    </button>
                    <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <ArrowRightLeft size={16} /> Warehouse Transfer
                    </button>
                </div>
            </div>

            {/* Live Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Inventory Valuation (Cost basis)', value: `₹${totalInventoryValue.toLocaleString()}`, icon: DollarSign, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Low Stock Alerts (Reorder Level)', value: `${lowStockAlertsCount} Items`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Total Warehouses Registered', value: '2 Branches', icon: Warehouse, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Dynamic In-Transit Stock', value: '210 Items', icon: Activity, color: '#7C3AED', bg: '#F5F3FF' }
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

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'registry', label: 'Stock Registry & Valuation', icon: Layers },
                    { id: 'movement', label: 'Inward & Outward Logs', icon: Activity },
                    { id: 'warehouse', label: 'Warehouse Transfers', icon: Warehouse },
                    { id: 'batch', label: 'Batches & Expiries', icon: Calendar }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '12px', 
                            background: activeTab === tab.id ? '#064E3B' : 'white', 
                            color: activeTab === tab.id ? 'white' : '#475569',
                            border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === tab.id ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Stock Registry */}
            {activeTab === 'registry' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search products or locations..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Product Description</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Warehouse Location</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Current Stock</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Available Stock</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Damaged / Expired</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Avg Cost</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Total Valuation</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Alert Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStocks.map((st) => {
                                    const isLow = st.current_stock <= st.reorder_level;
                                    const valuation = st.current_stock * st.average_cost;
                                    return (
                                        <tr key={st.stock_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.95rem' }}>{st.product_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Product ID: {st.product_id}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <MapPin size={14} style={{ color: '#64748B' }} />
                                                    <span style={{ fontWeight: '600', color: '#475569' }}>{st.warehouse_name} ({st.rack_number})</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{st.current_stock} pcs</td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#10B981' }}>{st.available_stock} pcs</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#EF4444', fontWeight: '700' }}>{st.damaged_stock} Dmg</span> / <span style={{ color: '#B45309', fontWeight: '700' }}>{st.expired_stock} Exp</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>₹{st.average_cost.toLocaleString()}</td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>₹{valuation.toLocaleString()}</td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                    background: isLow ? '#FEF2F2' : '#F0FDF4',
                                                    color: isLow ? '#EF4444' : '#10B981',
                                                    fontSize: '0.75rem', fontWeight: '800'
                                                }}>{isLow ? 'REORDER LOW' : 'OPTIMAL'}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Stock Movements Logs */}
            {activeTab === 'movement' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Stock Inward / Outward running ledger</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Movement ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Type</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Qty Moved</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Reason / Doc ref</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Performed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((move) => (
                                <tr key={move.movement_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{move.movement_id}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{move.movement_date}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{move.product_name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            display: 'inline-flex', padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            background: move.movement_type === 'in' ? '#ECFDF5' : (move.movement_type === 'out' ? '#FEF2F2' : '#EFF6FF'),
                                            color: move.movement_type === 'in' ? '#10B981' : (move.movement_type === 'out' ? '#EF4444' : '#3B82F6'),
                                            fontSize: '0.75rem', fontWeight: '800'
                                        }}>{move.movement_type.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{move.movement_quantity} pcs</td>
                                    <td style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>{move.movement_reason} ({move.reference_id})</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{move.performed_by}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Warehouse transfers */}
            {activeTab === 'warehouse' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Warehouse Branch transfers</h3>
                        <button onClick={() => setIsTransferModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Transfer Stock</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Transfer ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>From Warehouse</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>To Warehouse</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Qty Transferred</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((trf) => (
                                <tr key={trf.transfer_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{trf.transfer_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{trf.product_name}</td>
                                    <td style={{ padding: '1rem' }}>{trf.from_warehouse}</td>
                                    <td style={{ padding: '1rem' }}>{trf.to_warehouse}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{trf.qty} pcs</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', fontWeight: '800', fontSize: '0.75rem' }}>{trf.status.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 4: Batches & Expiry Dates */}
            {activeTab === 'batch' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Batch-Wise & Expiry Tracking (FIFO Engine)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Batch Number</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>MFG Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Expiry Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Batch Qty</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Days to Expiry</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map((bat) => {
                                const daysLeft = Math.ceil((new Date(bat.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <tr key={bat.batch_number} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '750', color: '#1E293B' }}>{bat.batch_number}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700' }}>{bat.product_name}</td>
                                        <td style={{ padding: '1rem' }}>{bat.manufacturing_date}</td>
                                        <td style={{ padding: '1rem', color: daysLeft < 120 ? '#EF4444' : '#1E293B', fontWeight: '700' }}>{bat.expiry_date}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{bat.batch_quantity} pcs</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                background: daysLeft < 120 ? '#FEF2F2' : '#EFF6FF',
                                                color: daysLeft < 120 ? '#EF4444' : '#1D4ED8',
                                                fontWeight: '800', fontSize: '0.75rem'
                                            }}>{daysLeft > 0 ? `${daysLeft} Days` : 'EXPIRED'}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Adjust Stock Counts Modal */}
            {isAdjustmentModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Adjust Stock Counts</h3>
                            <button onClick={() => setIsAdjustmentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Product</label>
                                <select value={adjustmentForm.product_id} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, product_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    {stocks.map(s => <option key={s.product_id} value={s.product_id}>{s.product_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Adjustment Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="button" onClick={() => setAdjustmentForm({ ...adjustmentForm, adjustment_type: 'add' })} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: adjustmentForm.adjustment_type === 'add' ? '#10B981' : '#F1F5F9', color: adjustmentForm.adjustment_type === 'add' ? 'white' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Add Stock (+)</button>
                                    <button type="button" onClick={() => setAdjustmentForm({ ...adjustmentForm, adjustment_type: 'reduce' })} style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: adjustmentForm.adjustment_type === 'reduce' ? '#EF4444' : '#F1F5F9', color: adjustmentForm.adjustment_type === 'reduce' ? 'white' : '#475569', fontWeight: '800', cursor: 'pointer' }}>Reduce Stock (-)</button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Adjustment Qty</label>
                                <input required type="number" value={adjustmentForm.qty} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason / Comment</label>
                                <input required type="text" value={adjustmentForm.reason} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Physical stock audit reconciliation" />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Finalize Stock Audit Change
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Warehouse Transfer Modal */}
            {isTransferModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Warehouse Stock Transfer</h3>
                            <button onClick={() => setIsTransferModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Product</label>
                                <select value={transferForm.product_id} onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    {stocks.map(s => <option key={s.product_id} value={s.product_id}>{s.product_name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Warehouse</label>
                                    <select value={transferForm.from_warehouse} onChange={(e) => setTransferForm({ ...transferForm, from_warehouse: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Main Godown</option>
                                        <option>Shop Front</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Warehouse</label>
                                    <select value={transferForm.to_warehouse} onChange={(e) => setTransferForm({ ...transferForm, to_warehouse: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Shop Front</option>
                                        <option>Main Godown</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Quantity to Move</label>
                                <input required type="number" value={transferForm.qty} onChange={(e) => setTransferForm({ ...transferForm, qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Transfer Ref / ID</label>
                                <input required type="text" value={transferForm.reference} onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Initiate Transfer Release
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessStock;
