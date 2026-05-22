import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useCurrency } from '../context';
import { 
    Cpu, 
    Layers, 
    Activity, 
    TrendingUp, 
    Plus, 
    X, 
    Search, 
    Filter, 
    Calendar, 
    DollarSign, 
    Clock, 
    Trash2, 
    AlertCircle, 
    CheckCircle2, 
    Zap, 
    Settings, 
    ClipboardList,
    TrendingDown, 
    Award,
    Wrench,
    Gauge
} from 'lucide-react';
import '../App.css';

const INITIAL_BOMS = [
    {
        bom_id: 'BOM-101',
        bom_name: 'Premium Wooden Office Desk BOM',
        finished_product_id: 'PRD-Desk09',
        finished_product_name: 'Premium Wooden Office Desk',
        required_quantity: 1,
        unit: 'piece',
        raw_materials: [
            { material_id: 'MAT-Wood01', material_name: 'Oak Wood Planks', required_quantity: 4, unit: 'sq meters', cost_per_unit: 800 },
            { material_id: 'MAT-Screw02', material_name: 'Heavy Duty Screws', required_quantity: 24, unit: 'pieces', cost_per_unit: 5 },
            { material_id: 'MAT-Paint03', material_name: 'Walnut Stain Wood Varnish', required_quantity: 1.5, unit: 'liters', cost_per_unit: 300 },
            { material_id: 'MAT-Handle04', material_name: 'Brass Drawer Handles', required_quantity: 3, unit: 'pieces', cost_per_unit: 120 }
        ]
    },
    {
        bom_id: 'BOM-102',
        bom_name: 'Ergonomic Chair Assembly BOM',
        finished_product_id: 'PRD-Chair22',
        finished_product_name: 'Ergonomic Mesh Chair',
        required_quantity: 1,
        unit: 'piece',
        raw_materials: [
            { material_id: 'MAT-Mesh01', material_name: 'Nylon Breathable Mesh', required_quantity: 2, unit: 'meters', cost_per_unit: 450 },
            { material_id: 'MAT-Castor02', material_name: 'Heavy Duty Castor Wheels', required_quantity: 5, unit: 'pieces', cost_per_unit: 80 },
            { material_id: 'MAT-GasLift03', material_name: 'Class 4 Gas Lift Cylinder', required_quantity: 1, unit: 'piece', cost_per_unit: 600 },
            { material_id: 'MAT-Frame04', material_name: 'Steel Support Frame', required_quantity: 1, unit: 'piece', cost_per_unit: 1100 }
        ]
    }
];

const INITIAL_WORK_ORDERS = [
    {
        production_id: 'MFG-201',
        production_order_number: 'WO-2026-901',
        production_status: 'Running',
        production_date: '2026-05-06',
        bom_id: 'BOM-101',
        finished_product_name: 'Premium Wooden Office Desk',
        production_quantity: 10,
        rejected_quantity: 0,
        warehouse_id: 'WH-MAIN-01',
        planned_start_date: '2026-05-06',
        planned_end_date: '2026-05-08',
        actual_start_date: '2026-05-06 09:00 AM',
        actual_end_date: '',
        production_shift: 'Morning Shift',
        operator_id: 'WRK-802',
        operator_name: 'Suhail Khan',
        supervisor_id: 'SUP-01',
        supervisor_name: 'Karan Mehra',
        machine_id: 'MCH-WoodRouter01',
        machine_name: 'CNC Wood Router',
        work_center_id: 'WC-Line01',
        machine_runtime: 6.5,
        downtime_hours: 0.5,
        raw_material_cost: 41100, // Calculated automatically
        labor_cost: 4500,
        overhead_cost: 2200,
        total_production_cost: 47800,
        per_unit_cost: 4780,
        quality_status: 'passed',
        defect_reason: '',
        inspection_date: '2026-05-06',
        raw_material_stock_out: 'MAT-Wood01, MAT-Screw02, MAT-Paint03, MAT-Handle04',
        finished_goods_stock_in: 'PRD-Desk09'
    },
    {
        production_id: 'MFG-202',
        production_order_number: 'WO-2026-892',
        production_status: 'Completed',
        production_date: '2026-05-05',
        bom_id: 'BOM-102',
        finished_product_name: 'Ergonomic Mesh Chair',
        production_quantity: 25,
        rejected_quantity: 1,
        warehouse_id: 'WH-TECH-02',
        planned_start_date: '2026-05-04',
        planned_end_date: '2026-05-05',
        actual_start_date: '2026-05-04 08:30 AM',
        actual_end_date: '2026-05-05 04:30 PM',
        production_shift: 'Day Shift',
        operator_id: 'WRK-809',
        operator_name: 'Milind Deshpande',
        supervisor_id: 'SUP-01',
        supervisor_name: 'Karan Mehra',
        machine_id: 'MCH-Press02',
        machine_name: 'Hydraulic Press',
        work_center_id: 'WC-Line02',
        machine_runtime: 14.0,
        downtime_hours: 1.0,
        raw_material_cost: 77500,
        labor_cost: 8500,
        overhead_cost: 3900,
        total_production_cost: 89900,
        per_unit_cost: 3596,
        quality_status: 'passed',
        defect_reason: '1 unit rejected due to minor fabric tear',
        inspection_date: '2026-05-05',
        raw_material_stock_out: 'MAT-Mesh01, MAT-Castor02, MAT-GasLift03, MAT-Frame04',
        finished_goods_stock_in: 'PRD-Chair22'
    }
];

const INITIAL_MATERIALS = [
    { material_id: 'MAT-Wood01', material_name: 'Oak Wood Planks', unit: 'sq meters', opening_stock: 120, consumed_quantity: 40, remaining_stock: 80, cost_per_unit: 800 },
    { material_id: 'MAT-Screw02', material_name: 'Heavy Duty Screws', unit: 'pieces', opening_stock: 2000, consumed_quantity: 240, remaining_stock: 1760, cost_per_unit: 5 },
    { material_id: 'MAT-Paint03', material_name: 'Walnut Stain Wood Varnish', unit: 'liters', opening_stock: 50, consumed_quantity: 15, remaining_stock: 35, cost_per_unit: 300 },
    { material_id: 'MAT-Handle04', material_name: 'Brass Drawer Handles', unit: 'pieces', opening_stock: 100, consumed_quantity: 30, remaining_stock: 70, cost_per_unit: 120 },
    { material_id: 'MAT-Mesh01', material_name: 'Nylon Breathable Mesh', unit: 'meters', opening_stock: 250, consumed_quantity: 50, remaining_stock: 200, cost_per_unit: 450 },
    { material_id: 'MAT-Castor02', material_name: 'Heavy Duty Castor Wheels', unit: 'pieces', opening_stock: 800, consumed_quantity: 125, remaining_stock: 675, cost_per_unit: 80 }
];

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bomService, manufacturingService } from '../services';
import FilterableTableHead from '../components/FilterableTableHead';

const BusinessManufacturing = () => {
    const queryClient = useQueryClient();
    const { currency, formatCurrency } = useCurrency();

    // Query for Live Bill of Materials (BOM)
    const { data: dbBoms = [] } = useQuery({
        queryKey: ['boms'],
        queryFn: () => bomService.getBoms()
    });

    const createBomMutation = useMutation({
        mutationFn: (data) => bomService.createBom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boms'] });
            alert('Bill of Materials (BOM) created successfully!');
            setIsBOMOpen(false);
        }
    });

    // Mapping dbRows to UI properties safely
    const boms = dbBoms.length > 0 ? dbBoms.map(b => ({
        bom_id: `BOM-${b.id}`,
        id: b.id,
        bom_name: b.name || 'Unnamed Recipe BOM',
        finished_product_id: b.product_id || `PRD-${b.id}`,
        finished_product_name: b.name || 'Product',
        required_quantity: 1,
        unit: 'piece',
        raw_materials: Array.isArray(b.items) ? b.items : JSON.parse(b.items || '[]')
    })) : [];

    // Fetch Live Work Orders & BOM Reports from Manufacturing Service
    const { data: reportsData } = useQuery({
        queryKey: ['manufacturingReports'],
        queryFn: () => manufacturingService.getOrders()
    });

    // Map Work Orders dynamically from the backend reports
    const dbOrders = reportsData?.orders || [];
    const workOrders = dbOrders.length > 0 ? dbOrders.map(o => {
        const bom = boms.find(b => b.id === o.bom_id);
        
        let matCost = 0;
        if (bom && Array.isArray(bom.raw_materials)) {
            bom.raw_materials.forEach(raw => {
                matCost += (raw.cost_per_unit || 50) * (raw.required_quantity || 1) * (o.quantity || 1);
            });
        } else {
            matCost = 3500 * (o.quantity || 1);
        }

        const laborCost = 4500;
        const overheadCost = 2200;
        const totalCost = matCost + laborCost + overheadCost;

        return {
            production_id: o.id,
            production_order_number: `WO-2026-90${o.id}`,
            production_status: o.status || 'Planned',
            production_date: o.created_at ? o.created_at.split('T')[0] : '2026-05-08',
            bom_id: o.bom_id ? `BOM-${o.bom_id}` : 'BOM-101',
            finished_product_name: o.product_name || 'Premium Wooden Office Desk',
            production_quantity: o.quantity || 1,
            rejected_quantity: 0,
            warehouse_id: 'WH-MAIN-01',
            planned_start_date: o.created_at ? o.created_at.split('T')[0] : '2026-05-08',
            planned_end_date: o.created_at ? o.created_at.split('T')[0] : '2026-05-08',
            actual_start_date: '',
            actual_end_date: '',
            production_shift: 'Morning Shift',
            operator_name: 'Suhail Khan',
            supervisor_name: 'Karan Mehra',
            machine_name: 'CNC Wood Router',
            machine_runtime: 0,
            downtime_hours: 0,
            raw_material_cost: matCost,
            labor_cost: laborCost,
            overhead_cost: overheadCost,
            total_production_cost: totalCost,
            per_unit_cost: totalCost / (o.quantity || 1),
            quality_status: 'passed',
            defect_reason: '',
            inspection_date: '',
            raw_material_stock_out: 'MAT-Wood01',
            finished_goods_stock_in: 'PRD-Desk09'
        };
    }) : [];

    const materials = boms.reduce((acc, bom) => {
        if (Array.isArray(bom.raw_materials)) {
            bom.raw_materials.forEach(raw => {
                const found = acc.find(m => m.material_id === raw.material_id);
                if (!found) {
                    acc.push({
                        material_id: raw.material_id || `MAT-${raw.material_name?.replace(/\s+/g, '')}`,
                        material_name: raw.material_name || raw.material_id || 'Raw Material',
                        opening_stock: 500,
                        consumed_quantity: 0,
                        remaining_stock: 500,
                        unit: raw.unit || 'pcs',
                        cost_per_unit: raw.cost_per_unit || 100
                    });
                }
            });
        }
        return acc;
    }, []);
    const [activeTab, setActiveTab] = useState('all');
    const [colFilters, setColFilters] = React.useState({}); // 'all' (Orders) | 'bom' | 'materials' | 'costing' | 'qc' | 'reports'
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBOMOpen, setIsBOMOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInspectOpen, setIsInspectOpen] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // BOM Creation Form
    const [bomForm, setBomForm] = useState({
        bom_name: '',
        finished_product_name: '',
        required_quantity: 1,
        unit: 'piece',
        raw_materials: [
            { material_id: 'MAT-Wood01', material_name: 'Oak Wood Planks', required_quantity: 4, unit: 'sq meters', cost_per_unit: 800 }
        ]
    });

    // Work Order Form
    const [woForm, setWoForm] = useState({
        bom_id: '',
        production_quantity: 10,
        planned_start_date: '2026-05-06',
        planned_end_date: '2026-05-08',
        production_shift: 'Morning Shift',
        operator_name: 'Suhail Khan',
        supervisor_name: 'Karan Mehra',
        machine_name: 'CNC Wood Router',
        machine_id: 'MCH-WoodRouter01',
        work_center_id: 'WC-Line01',
        labor_cost: 4500,
        overhead_cost: 2200
    });

    // Inspect Form
    const [qcStatus, setQcStatus] = useState('passed');
    const [defectReason, setDefectReason] = useState('');
    const [rejectedQty, setRejectedQty] = useState(0);

    const handleCreateBOM = (e) => {
        e.preventDefault();
        const payload = {
            name: bomForm.bom_name,
            description: `Yields: 1 ${bomForm.unit}`,
            items: bomForm.raw_materials,
            status: 'active'
        };
        createBomMutation.mutate(payload);
    };

    const createOrderMutation = useMutation({
        mutationFn: (data) => manufacturingService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manufacturingReports'] });
            alert('Work order created and queued successfully!');
            setIsCreateOpen(false);
        }
    });

    const handleCreateWorkOrder = (e) => {
        e.preventDefault();
        const activeBomId = woForm.bom_id || boms[0]?.bom_id;
        const selectedBOM = boms.find(b => b.bom_id === activeBomId);
        if (!selectedBOM) return;

        createOrderMutation.mutate({
            bom_id: selectedBOM.id,
            product_name: selectedBOM.finished_product_name,
            quantity: parseInt(woForm.production_quantity) || 1
        });
    };

    const completeProductionMutation = useMutation({
        mutationFn: (orderId) => manufacturingService.completeOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manufacturingReports'] });
            alert('Quality Check completed. Production order closed successfully.');
            setIsInspectOpen(false);
        }
    });

    const handleInspectQC = () => {
        completeProductionMutation.mutate(selectedOrder.production_id);
    };

    const startProductionMutation = useMutation({
        mutationFn: (orderId) => manufacturingService.startOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manufacturingReports'] });
            alert('Production order started successfully! Machine routing active.');
        }
    });

    const handleStartWork = (id) => {
        startProductionMutation.mutate(id);
    };

    const filteredOrders = workOrders.filter(wo => {
        const matchesSearch = wo.finished_product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              wo.production_order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              wo.operator_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || wo.production_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats calculations
    const runningCount = workOrders.filter(w => w.production_status === 'Running').length;

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#FAFDFB', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', flexShrink: 0, justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}>
                            <Cpu size={22} />
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Manufacturing & Production</h1>
                    </div>
                    <p style={{ color: '#64748B', fontWeight: '500', fontSize: '0.95rem' }}>Manage raw material Bill of Materials (BOM), launch work orders, monitor CNC/machine centers, and inspect QC defects.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => setIsBOMOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', 
                            borderRadius: '12px', background: 'white', border: '1px solid #1B6B3A', 
                            fontWeight: '750', cursor: 'pointer', color: '#1B6B3A'
                        }}
                    >
                        <Layers size={16} /> Create BOM
                    </button>
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
                            borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                            color: 'white', border: 'none', fontWeight: '750', cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)'
                        }}
                    >
                        <Plus size={16} /> Launch Work Order
                    </button>
                </div>
            </div>

            {/* Stats Summary Dashboard */}
            {/* Modern Manufacturing Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Production Efficiency', value: '96.2%', icon: Gauge, color: '#1B6B3A', bg: '#DCF2E4' },
                    { label: 'Raw Material Wastage', value: '1.4%', icon: TrendingDown, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Machine Utilization', value: '84.5%', icon: Zap, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Running Work Orders', value: runningCount, icon: Activity, color: '#F59E0B', bg: '#FEF3C7' }
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

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('all')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'all' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'all' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    ⚙️ Active Work Orders
                </button>
                <button 
                    onClick={() => setActiveTab('bom')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'bom' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'bom' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    📄 Bill of Materials (BOM)
                </button>
                <button 
                    onClick={() => setActiveTab('materials')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'materials' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'materials' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    🏗️ Raw Materials Inventory
                </button>
                <button 
                    onClick={() => setActiveTab('costing')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'costing' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'costing' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    💰 Costing & Overheads Analysis
                </button>
                <button 
                    onClick={() => setActiveTab('qc')}
                    style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'qc' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'qc' ? '3px solid #1B6B3A' : '3px solid transparent' }}
                >
                    🧪 Quality Control (QC) Logs
                </button>
            </div>

            {/* Scrollable Tab Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* TAB CONTENT: WORK ORDERS */}
            {activeTab === 'all' && (
                <div>
                    {/* Search & Filter bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <Search size={18} style={{ color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search production orders by product name, work order ID, or operator..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', border: 'none', outline: 'none', fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>Status:</span>
                            <select 
                                value={statusFilter} 
                                onChange={e => setStatusFilter(e.target.value)}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.85rem' }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Planned">Planned</option>
                                <option value="Running">Running</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Active Work Orders Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                                <ClipboardList size={48} style={{ margin: '0 auto 1rem', color: '#94A3B8' }} />
                                <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem' }}>No Work Orders Found</h4>
                                <p style={{ fontSize: '0.85rem' }}>Click "Launch Work Order" to create a new production schedule.</p>
                            </div>
                        ) : (
                            filteredOrders.map(wo => (
                                <div key={wo.production_id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '12px', 
                                            background: wo.production_status === 'Completed' ? '#E8F5EE' : wo.production_status === 'Running' ? '#FFFBEB' : '#F1F5F9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: wo.production_status === 'Completed' ? '#1B6B3A' : wo.production_status === 'Running' ? '#F59E0B' : '#64748B'
                                        }}>
                                            <Cpu size={24} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B' }}>{wo.finished_product_name}</h4>
                                                <span style={{ 
                                                    fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px',
                                                    background: wo.production_status === 'Completed' ? '#DCF2E4' : wo.production_status === 'Running' ? '#FEF3C7' : '#E2E8F0',
                                                    color: wo.production_status === 'Completed' ? '#1B6B3A' : wo.production_status === 'Running' ? '#B45309' : '#475569'
                                                }}>
                                                    {wo.production_status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
                                                Order Ref: <strong style={{ color: '#334155' }}>{wo.production_order_number}</strong> • Qty to Produce: <strong style={{ color: '#334155' }}>{wo.production_quantity} {wo.unit || 'pcs'}</strong> • Machine Assigned: <strong style={{ color: '#1B6B3A' }}>{wo.machine_name}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Labor Operator</span>
                                            <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>{wo.operator_name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>{wo.production_shift}</span>
                                        </div>

                                        {wo.production_status === 'Planned' && (
                                            <button 
                                                onClick={() => handleStartWork(wo.production_id)}
                                                style={{ background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', color: 'white' }}
                                            >
                                                Start Machining
                                            </button>
                                        )}

                                        {wo.production_status === 'Running' && (
                                            <button 
                                                onClick={() => { setSelectedOrder(wo); setQcStatus('passed'); setDefectReason(''); setRejectedQty(0); setIsInspectOpen(true); }}
                                                style={{ background: '#FAFDFB', border: '1px solid #1B6B3A', padding: '0.55rem 1.25rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '750', cursor: 'pointer', color: '#1B6B3A' }}
                                            >
                                                Inspect & QC Complete
                                            </button>
                                        )}

                                        {wo.production_status === 'Completed' && (
                                            <div style={{ padding: '0.55rem 1rem', background: '#E8F5EE', borderRadius: '10px', color: '#1B6B3A', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <CheckCircle2 size={14} /> Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: BOM */}
            {activeTab === 'bom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {boms.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(bom => (
                        <div key={bom.bom_id} style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#064E3B' }}>{bom.bom_name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Finished Product: {bom.finished_product_name} • Yields: 1 {bom.unit}</span>
                                </div>
                                <span style={{ background: '#E8F5EE', color: '#1B6B3A', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800' }}>BOM Ref: {bom.bom_id}</span>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
        { key: 'material_id', label: 'Material ID', placeholder: 'ID' },
        { key: 'material_name', label: 'Material Name', placeholder: 'Name' },
        { key: 'qty', label: 'Required Qty', placeholder: 'Qty' },
        { key: 'unit', label: 'Unit', placeholder: 'e.g. Kg' },
        { key: 'cost', label: 'Cost Per Unit', placeholder: 'e.g. 50' }
    ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {bom.raw_materials.map(raw => (
                                        <tr key={raw.material_id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem', color: '#475569' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: '750', color: '#0F172A' }}>{raw.material_id}</td>
                                            <td style={{ padding: '0.75rem' }}>{raw.material_name}</td>
                                            <td style={{ padding: '0.75rem', fontWeight: '750', color: '#1B6B3A' }}>{raw.required_quantity}</td>
                                            <td style={{ padding: '0.75rem' }}>{raw.unit}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '750' }}>{formatCurrency(raw.cost_per_unit)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: RAW MATERIALS */}
            {activeTab === 'materials' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>🏗️ Raw Material Stock & Wastage Tracking</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead columns={[
        { key: 'material_id', label: 'Material ID', placeholder: 'ID' },
        { key: 'material_name', label: 'Material Name', placeholder: 'Name' },
        { key: 'qty', label: 'Required Qty', placeholder: 'Qty' },
        { key: 'unit', label: 'Unit', placeholder: 'e.g. Kg' },
        { key: 'cost', label: 'Cost Per Unit', placeholder: 'e.g. 50' }
    ]} onFilterChange={setColFilters} />
                        <tbody>
                            {materials.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(mat => (
                                <tr key={mat.material_id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem', color: '#334155' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{mat.material_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{mat.material_name}</td>
                                    <td style={{ padding: '1rem' }}>{mat.opening_stock}</td>
                                    <td style={{ padding: '1rem', color: '#EF4444', fontWeight: '750' }}>{mat.consumed_quantity}</td>
                                    <td style={{ padding: '1rem', color: '#1B6B3A', fontWeight: '750' }}>{mat.remaining_stock}</td>
                                    <td style={{ padding: '1rem' }}>{mat.unit}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '750' }}>{formatCurrency(mat.cost_per_unit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB CONTENT: COSTING */}
            {activeTab === 'costing' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>💰 Costing, Labor, & Overheads Ledger</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <FilterableTableHead columns={[
        { key: 'material_id', label: 'Material ID', placeholder: 'ID' },
        { key: 'material_name', label: 'Material Name', placeholder: 'Name' },
        { key: 'qty', label: 'Required Qty', placeholder: 'Qty' },
        { key: 'unit', label: 'Unit', placeholder: 'e.g. Kg' },
        { key: 'cost', label: 'Cost Per Unit', placeholder: 'e.g. 50' }
    ]} onFilterChange={setColFilters} />
                        <tbody>
                            {workOrders.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(wo => (
                                <tr key={wo.production_id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.9rem', color: '#334155' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{wo.production_order_number}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{wo.finished_product_name}</td>
                                    <td style={{ padding: '1rem' }}>{formatCurrency(wo.raw_material_cost)}</td>
                                    <td style={{ padding: '1rem' }}>{formatCurrency(wo.labor_cost)}</td>
                                    <td style={{ padding: '1rem' }}>{formatCurrency(wo.overhead_cost)}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#064E3B' }}>{formatCurrency(wo.total_production_cost)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '850', color: '#1B6B3A' }}>{formatCurrency(wo.per_unit_cost)} / unit</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB CONTENT: QUALITY CONTROL */}
            {activeTab === 'qc' && (
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>🧪 Quality Checks & Defective Items Inspection Logs</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {workOrders.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(wo => (
                            <div key={wo.production_id} style={{ background: '#FAFDFB', border: '1px solid #E8F5EE', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontWeight: '800', color: '#1E293B' }}>{wo.finished_product_name} ({wo.production_order_number})</h4>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', background: wo.quality_status === 'passed' ? '#DCF2E4' : '#FEE2E2', color: wo.quality_status === 'passed' ? '#1B6B3A' : '#EF4444', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                            QC: {wo.quality_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                                        Defects/Notes: <strong style={{ color: '#334155' }}>"{wo.defect_reason || 'Perfect yield. No defects recorded.'}"</strong>
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                        Rejected Quantity: <strong style={{ color: '#EF4444' }}>{wo.rejected_quantity} units</strong> • Inspection Date: {wo.inspection_date || 'Awaiting completion'}
                                    </p>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '750' }}>
                                    Passed: {wo.production_quantity - wo.rejected_quantity} units
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            </div>

            {/* CREATE BOM MODAL */}
            {isBOMOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '640px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layers style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Create Bill of Materials (BOM)</h2>
                            </div>
                            <button onClick={() => setIsBOMOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateBOM} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>BOM Recipe Name *</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Ergonomic Office Chair Assembly BOM"
                                    value={bomForm.bom_name}
                                    onChange={e => setBomForm({ ...bomForm, bom_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Finished Product Name *</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Premium Ergonomic Chair"
                                        value={bomForm.finished_product_name}
                                        onChange={e => setBomForm({ ...bomForm, finished_product_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Unit Yield</label>
                                    <select 
                                        value={bomForm.unit}
                                        onChange={e => setBomForm({ ...bomForm, unit: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                    >
                                        <option value="piece">piece</option>
                                        <option value="kg">kg</option>
                                        <option value="box">box</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ background: '#FAFDFB', padding: '1rem', borderRadius: '12px', border: '1px solid #DCF2E4' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1B6B3A' }}>🏗️ Raw Material Requirements Recipe Map</span>
                                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>BOM automatically maps Nylon Breathable Mesh, Wheels, gas lift cylinder, steel frame elements as standard recipe requirements.</p>
                            </div>

                            <button 
                                type="submit"
                                style={{ width: '100%', padding: '0.9rem', borderRadius: '10px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                Save BOM Formula
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* LAUNCH WORK ORDER MODAL */}
            {isCreateOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
                    <div style={{ background: 'white', width: '680px', maxHeight: '90vh', borderRadius: '24px', padding: '2.5rem', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Cpu style={{ color: '#1B6B3A' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>Launch New Production Work Order</h2>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateWorkOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Select BOM Recipe *</label>
                                    <select 
                                        value={woForm.bom_id}
                                        onChange={e => setWoForm({ ...woForm, bom_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                    >
                                        {boms.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(b => (
                                            <option key={b.bom_id} value={b.bom_id}>{b.bom_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Production Target Qty *</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={woForm.production_quantity}
                                        onChange={e => setWoForm({ ...woForm, production_quantity: parseInt(e.target.value) || 1 })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled Start Date</label>
                                    <input 
                                        type="date" 
                                        value={woForm.planned_start_date}
                                        onChange={e => setWoForm({ ...woForm, planned_start_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Scheduled End Date</label>
                                    <input 
                                        type="date" 
                                        value={woForm.planned_end_date}
                                        onChange={e => setWoForm({ ...woForm, planned_end_date: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Production Shift</label>
                                    <select 
                                        value={woForm.production_shift}
                                        onChange={e => setWoForm({ ...woForm, production_shift: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                    >
                                        <option value="Morning Shift">Morning Shift</option>
                                        <option value="Day Shift">Day Shift</option>
                                        <option value="Night Shift">Night Shift</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#FAFDFB', padding: '1rem', borderRadius: '12px', border: '1px solid #DCF2E4' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#1B6B3A', marginBottom: '0.4rem' }}>Labor/Operator Assignee</label>
                                    <input 
                                        type="text" 
                                        value={woForm.operator_name}
                                        onChange={e => setWoForm({ ...woForm, operator_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#1B6B3A', marginBottom: '0.4rem' }}>Supervisor Assignee</label>
                                    <input 
                                        type="text" 
                                        value={woForm.supervisor_name}
                                        onChange={e => setWoForm({ ...woForm, supervisor_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Machine Center</label>
                                    <input 
                                        type="text" 
                                        value={woForm.machine_name}
                                        onChange={e => setWoForm({ ...woForm, machine_name: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Standard Labor Cost ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        value={woForm.labor_cost}
                                        onChange={e => setWoForm({ ...woForm, labor_cost: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Electricity Overhead ({currency.symbol})</label>
                                    <input 
                                        type="number" 
                                        value={woForm.overhead_cost}
                                        onChange={e => setWoForm({ ...woForm, overhead_cost: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}
                            >
                                Launch Production Router Order
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* INSPECT & QC COMPLETE MODAL */}
            {isInspectOpen && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: 'white', width: '480px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A' }}>Quality Check & Inspection</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Order: {selectedOrder.production_order_number}</span>
                            </div>
                            <button onClick={() => setIsInspectOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Quality Inspection Status</label>
                                <select 
                                    value={qcStatus}
                                    onChange={e => setQcStatus(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                >
                                    <option value="passed">Passed ✓</option>
                                    <option value="rejected">Rejected Defective ⚠️</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Rejected / Defective Qty</label>
                                <input 
                                    type="number" 
                                    value={rejectedQty}
                                    onChange={e => setRejectedQty(parseInt(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>QC Defect Reason (if any)</label>
                                <textarea 
                                    placeholder="e.g. minor fabric tear, paint smudge..."
                                    value={defectReason}
                                    onChange={e => setDefectReason(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', minHeight: '60px' }}
                                />
                            </div>

                            <button 
                                onClick={handleInspectQC}
                                style={{ width: '100%', padding: '0.85rem', background: '#1B6B3A', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                Save Inspection & Close Work Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessManufacturing;
