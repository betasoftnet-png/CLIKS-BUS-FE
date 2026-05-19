import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService, warehouseService } from '../services';
import { apiClient } from '../api/client';
import FilterableTableHead from '../components/FilterableTableHead';
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
    const [activeTab, setActiveTab] = useState('registry');
    const [colFilters, setColFilters] = React.useState({}); // 'registry', 'movement', 'warehouse', 'batch'
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedHistoryProductId, setSelectedHistoryProductId] = useState('');

    // Fetch Live Stocks
    const { data: dbStocks = [] } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockService.getStocks()
    });

    // Fetch Live Warehouses
    const { data: dbWarehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses()
    });

    // Fetch Warehouse Transfers Reports
    const { data: reportsData } = useQuery({
        queryKey: ['warehouseReports'],
        queryFn: () => apiClient.get('/warehouses/reports').then(res => res.data.data || res.data)
    });

    // Safe mapping of DB stock items to UI representation
    const stocks = dbStocks.map(s => {
        let warehouseName = 'Main Godown';
        let rackNumber = 'Rack A-1';

        if (s.location) {
            if (s.location.includes('(')) {
                const parts = s.location.split('(');
                warehouseName = parts[0].trim();
                rackNumber = parts[1].replace(')', '').trim();
            } else {
                warehouseName = s.location;
            }
        }

        return {
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
            rack_number: rackNumber,
            warehouse_name: warehouseName
        };
    });

    // Set default product for history when stock loads
    useEffect(() => {
        if (!selectedHistoryProductId && stocks.length > 0) {
            const timer = setTimeout(() => {
                setSelectedHistoryProductId(stocks[0].id.toString());
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [stocks, selectedHistoryProductId]);

    // Fetch stock transaction history for the selected product
    const { data: dbHistory = [] } = useQuery({
        queryKey: ['stockHistory', selectedHistoryProductId],
        queryFn: () => stockService.getStockHistory(selectedHistoryProductId),
        enabled: !!selectedHistoryProductId
    });

    const movements = dbHistory.map(h => {
        const product = stocks.find(s => s.id === h.stock_id);
        return {
            movement_id: `MOV-${h.id}`,
            movement_type: h.type || 'in',
            movement_quantity: h.quantity || 0,
            movement_reason: h.type === 'in' ? 'Stock Inward / Reconciliation' : 'Stock Outward / Dispatch',
            reference_id: `REF-STK-${h.id}`,
            performed_by: 'Inventory Operator',
            movement_date: h.created_at ? h.created_at.split('T')[0] : '2026-05-08',
            product_name: product?.product_name || 'Stock Item'
        };
    });

    // Map DB Transfers
    const dbTransfers = reportsData?.transfers || [];
    const transfers = dbTransfers.map(t => {
        const product = stocks.find(s => s.id === t.stock_id);
        const fromWh = dbWarehouses.find(w => w.id === t.from_warehouse_id);
        const toWh = dbWarehouses.find(w => w.id === t.to_warehouse_id);
        return {
            transfer_id: `TRF-${t.id}`,
            product_name: product?.product_name || `Stock Item #${t.stock_id}`,
            qty: t.quantity || 0,
            from_warehouse: fromWh?.name || 'Main Godown',
            to_warehouse: toWh?.name || 'Shop Front',
            status: 'Completed',
            transfer_date: t.created_at ? t.created_at.split('T')[0] : '2026-05-08',
            reference: `REF-TRF-${t.id}`
        };
    });

    // Dynamic batches based on live stocks
    const batches = stocks.map((s) => ({
        batch_number: s.product_id.replace('PROD-', 'BAT-'),
        product_name: s.product_name,
        manufacturing_date: '2026-01-10',
        expiry_date: '2029-01-10',
        batch_quantity: s.current_stock
    }));

    // Form inputs for Stock Adjustments
    const [adjustmentForm, setAdjustmentForm] = useState({
        product_id: '',
        adjustment_type: 'add', // 'add' or 'reduce'
        qty: 10,
        reason: 'Physical stock reconciliation audit',
        warehouse_name: 'Main Godown'
    });

    // Form inputs for Warehouse Transfers
    const [transferForm, setTransferForm] = useState({
        product_id: '',
        qty: 15,
        from_warehouse_id: '',
        to_warehouse_id: '',
        reference: 'MIG-TRF-12'
    });

    // Initialize forms when stock items and warehouses are available
    useEffect(() => {
        if (stocks.length > 0) {
            const timer = setTimeout(() => {
                setAdjustmentForm(prev => prev.product_id ? prev : { ...prev, product_id: stocks[0].id.toString() });
                setTransferForm(prev => prev.product_id ? prev : { ...prev, product_id: stocks[0].id.toString() });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [stocks]);

    useEffect(() => {
        if (dbWarehouses.length > 1) {
            const timer = setTimeout(() => {
                setTransferForm(prev => prev.from_warehouse_id ? prev : {
                    ...prev,
                    from_warehouse_id: dbWarehouses[0].id.toString(),
                    to_warehouse_id: dbWarehouses[1].id.toString()
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [dbWarehouses]);

    const adjustMutation = useMutation({
        mutationFn: ({ id, delta }) => stockService.adjustQuantity(id, delta),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['stockStats'] });
            queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
            alert('Stock Adjustment audited & running ledger counts revalued successfully!');
            setIsAdjustmentModalOpen(false);
        }
    });

    const transferMutation = useMutation({
        mutationFn: ({ from_warehouse_id, to_warehouse_id, stock_id, qty }) => 
            warehouseService.transferStock(from_warehouse_id, {
                from_warehouse_id,
                to_warehouse_id,
                stock_id,
                quantity: qty
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            alert('Stock successfully moved between warehouse logs!');
            setIsTransferModalOpen(false);
        }
    });

    const handleSaveAdjustment = (e) => {
        e.preventDefault();
        const stockId = parseInt(adjustmentForm.product_id);
        const adjustQty = parseInt(adjustmentForm.qty) || 0;
        const delta = adjustmentForm.adjustment_type === 'add' ? adjustQty : -adjustQty;

        if (stockId) {
            adjustMutation.mutate({ id: stockId, delta });
        }
    };

    const handleSaveTransfer = (e) => {
        e.preventDefault();
        const stockId = parseInt(transferForm.product_id);
        const transQty = parseInt(transferForm.qty) || 0;
        const fromWhId = parseInt(transferForm.from_warehouse_id);
        const toWhId = parseInt(transferForm.to_warehouse_id);

        const selectedProd = stocks.find(s => s.id === stockId);

        if (transQty > (selectedProd?.available_stock || 0)) {
            alert('Cannot transfer quantity higher than current available stock!');
            return;
        }

        if (fromWhId && toWhId && stockId) {
            transferMutation.mutate({
                from_warehouse_id: fromWhId,
                to_warehouse_id: toWhId,
                stock_id: stockId,
                qty: transQty
            });
        }
    };

    const filteredStocks = stocks.filter(st => 
        st.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Compute live inventory valuations
    const totalInventoryValue = stocks.reduce((sum, s) => sum + (s.current_stock * s.average_cost), 0);
    const lowStockAlertsCount = stocks.filter(s => s.current_stock <= s.reorder_level).length;

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Layers size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Stock & Inventory Valuation</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Real-time inventory engine, multi-warehouse branch transfers, batch expiries, FIFO valuation, and reorder levels.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsAdjustmentModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Sliders size={15} /> Adjust Stock Counts
                    </button>
                    <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#3B82F6', border: '1px solid #DBEAFE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <ArrowRightLeft size={15} /> Warehouse Transfer
                    </button>
                </div>
            </div>

            {/* Live Metrics Grid */}
            {/* Modern Stock Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Inventory Valuation (Cost basis)', value: `₹${totalInventoryValue.toLocaleString()}`, icon: DollarSign, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Low Stock Alerts (Reorder Level)', value: `${lowStockAlertsCount} Items`, icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Total Warehouses Registered', value: `${dbWarehouses.length} Registered`, icon: Warehouse, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Dynamic In-Transit Stock', value: `${transfers.length} Transfers`, icon: Activity, color: '#8B5CF6', bg: '#F5F3FF' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Decorative background watermark */}
                        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06, color: stat.color, transform: 'rotate(-15deg)' }}>
                            <stat.icon size={70} />
                        </div>
                        
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                            <stat.icon size={20} />
                        </div>
                        
                        <h3 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', position: 'relative', zIndex: 1 }}>{stat.value}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}>{stat.label}</p>
                        
                        {/* Colored bottom border accent */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: stat.color, opacity: 0.7 }} />
                    </div>
                ))}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'registry', label: 'Stock Registry & Valuation', icon: Layers, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'movement', label: 'Inward & Outward Logs', icon: Activity, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'warehouse', label: 'Warehouse Transfers', icon: Warehouse, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'batch', label: 'Batches & Expiries', icon: Calendar, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.5rem 1rem', borderRadius: '8px', 
                            background: activeTab === tab.id ? tab.gradient : 'white', 
                            color: activeTab === tab.id ? 'white' : '#64748B',
                            border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: activeTab === tab.id ? `0 4px 10px ${tab.shadowColor}` : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

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
                            <FilterableTableHead columns={[
        { key: 'product_name', label: 'Product Description', placeholder: 'Name' },
        { key: 'warehouse', label: 'Warehouse Location', placeholder: 'Location' },
        { key: 'current_stock', label: 'Current Stock', placeholder: 'e.g. 100' },
        { key: 'available_stock', label: 'Available Stock', placeholder: 'e.g. 80' },
        { key: 'damaged', label: 'Damaged / Expired', placeholder: 'e.g. 5' },
        { key: 'avg_cost', label: 'Avg Cost', placeholder: 'e.g. 500' },
        { key: 'valuation', label: 'Total Valuation', placeholder: 'e.g. 50000' },
        { key: 'alert_status', label: 'Alert Status', placeholder: 'e.g. Low' }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredStocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((st) => {
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Stock Inward / Outward running ledger</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '750', color: '#475569' }}>Select Product:</span>
                            <select 
                                value={selectedHistoryProductId} 
                                onChange={(e) => setSelectedHistoryProductId(e.target.value)} 
                                style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#1E293B' }}
                            >
                                {stocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => <option key={s.id} value={s.id}>{s.product_name}</option>)}
                            </select>
                        </div>
                    </div>
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
                            {movements.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((move) => (
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
                            {transfers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((trf) => (
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
                            {batches.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((bat) => {
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
            </div>
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
                                <select value={adjustmentForm.product_id} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, product_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {stocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => <option key={s.id} value={s.id}>{s.product_name} (Qty: {s.current_stock})</option>)}
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
                                <input required type="number" value={adjustmentForm.qty} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason / Comment</label>
                                <input required type="text" value={adjustmentForm.reason} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} placeholder="e.g. Physical stock audit reconciliation" />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }}>
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
                                <select value={transferForm.product_id} onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {stocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => <option key={s.id} value={s.id}>{s.product_name} (Avail: {s.available_stock} pcs)</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Warehouse</label>
                                    <select value={transferForm.from_warehouse_id} onChange={(e) => setTransferForm({ ...transferForm, from_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {dbWarehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Warehouse</label>
                                    <select value={transferForm.to_warehouse_id} onChange={(e) => setTransferForm({ ...transferForm, to_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {dbWarehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Quantity to Move</label>
                                <input required type="number" value={transferForm.qty} onChange={(e) => setTransferForm({ ...transferForm, qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Transfer Ref / ID</label>
                                <input required type="text" value={transferForm.reference} onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.2)' }}>
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
