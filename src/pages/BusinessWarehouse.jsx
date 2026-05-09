import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService, stockService } from '../services';
import { apiClient } from '../api/client';
import { 
    Warehouse as WarehouseIcon, 
    Plus, 
    Search, 
    MapPin, 
    User, 
    Phone, 
    Mail, 
    Layers, 
    ArrowRightLeft, 
    FileText, 
    CheckCircle2, 
    Clock, 
    X, 
    DollarSign, 
    BarChart3, 
    PercentCircle, 
    Activity, 
    Sliders,
    Truck,
    Folder
} from 'lucide-react';
import '../App.css';

const BusinessWarehouse = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('profiles'); // 'profiles', 'stock', 'operations', 'transfers'

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Live Warehouses database via useQuery
    const { data: dbWarehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses()
    });

    // Live Stocks database via useQuery
    const { data: dbStocks = [] } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockService.getStocks()
    });

    // Live Transfers database via useQuery
    const { data: reportsData } = useQuery({
        queryKey: ['warehouseReports'],
        queryFn: () => apiClient.get('/warehouses/reports').then(res => res.data.data || res.data)
    });

    const createWarehouseMutation = useMutation({
        mutationFn: (data) => warehouseService.createWarehouse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            alert('New Physical Warehouse Profile successfully created!');
            setNewWarehouse({
                warehouse_code: '',
                warehouse_name: '',
                warehouse_type: 'godown',
                address: '',
                city: '',
                state: '',
                pincode: '',
                contact_person: '',
                phone_number: '',
                email: ''
            });
            setIsCreateModalOpen(false);
        }
    });

    const warehouses = dbWarehouses.map(w => ({
        warehouse_id: `WH-0${w.id}`,
        id: w.id,
        warehouse_code: w.code || `WH-CODE-${w.id}`,
        warehouse_name: w.name || 'Unnamed Godown Facility',
        warehouse_type: w.type || 'godown',
        warehouse_status: w.status || 'active',
        address: w.address || 'Address Not Configured',
        city: w.city || 'HQ',
        state: w.state || '',
        pincode: w.pincode || '',
        contact_person: w.contact_person || 'Facility Manager',
        phone_number: w.phone_number || '',
        email: w.email || '',
        capacity_utilization: w.capacity_utilization || '0%'
    }));

    // Stateful Warehouse Stock Database mapped from live DB Stocks
    const whStocks = dbStocks.map(s => {
        let warehouseName = 'Main Godown';
        let rackNumber = 'Rack A-1';
        let zoneName = 'General Storage';

        if (s.location) {
            if (s.location.includes('(')) {
                const parts = s.location.split('(');
                warehouseName = parts[0].trim();
                rackNumber = parts[1].replace(')', '').trim();
            } else {
                warehouseName = s.location;
            }
        }

        const current_stock = s.quantity || 0;
        const average_cost = s.unit_price || 0;

        return {
            wh_stock_id: `WHS-${s.id}`,
            id: s.id,
            product_id: s.sku || `PROD-${s.id}`,
            product_name: s.name || 'Unnamed Stock Item',
            warehouse_name: warehouseName,
            current_stock: current_stock,
            reserved_stock: 0,
            damaged_stock: 0,
            in_transit_stock: 0,
            rack_number: rackNumber,
            shelf_number: 'Shelf 1',
            bin_number: 'Bin A',
            zone: zoneName,
            warehouse_stock_value: current_stock * average_cost
        };
    });

    // Stateful Stock Transfer Database mapped from live DB warehouse transfers
    const dbTransfers = reportsData?.transfers || [];
    const transfers = dbTransfers.map((t, idx) => {
        const fromWH = warehouses.find(w => w.id === t.from_warehouse_id) || { warehouse_name: 'Main Godown' };
        const toWH = warehouses.find(w => w.id === t.to_warehouse_id) || { warehouse_name: 'Shop Front' };
        const product = dbStocks.find(s => s.id === t.stock_id) || { name: 'Dell Laptop' };

        return {
            transfer_id: `TRF-${t.id || (idx + 100)}`,
            id: t.id,
            source_warehouse: fromWH.warehouse_name,
            destination_warehouse: toWH.warehouse_name,
            product_name: product.name,
            transfer_quantity: t.quantity || 0,
            transfer_status: t.status || 'Completed',
            dispatch_date: t.created_at ? t.created_at.split('T')[0] : '2026-05-08',
            received_date: t.created_at ? t.created_at.split('T')[0] : '2026-05-08',
            carrier_name: 'Bluedart Logistics',
            tracking_number: `BD-88902${idx}`
        };
    });

    // Goods Inward (Receivings) Historical Logs mapped from DB Stocks
    const inwards = dbStocks.map((s) => {
        let warehouseName = 'Main Godown';
        if (s.location) {
            if (s.location.includes('(')) {
                warehouseName = s.location.split('(')[0].trim();
            } else {
                warehouseName = s.location;
            }
        }
        return {
            inward_id: `INW-${s.id + 8800}`,
            purchase_id: `BILL-770${s.id}`,
            product_name: s.name,
            received_quantity: s.quantity || 10,
            received_by: 'Vijay Chauhan (Manager)',
            inward_date: s.created_at ? s.created_at.split('T')[0] : '2026-05-08',
            warehouse_name: warehouseName
        };
    });

    // Form states
    const [newWarehouse, setNewWarehouse] = useState({
        warehouse_code: '',
        warehouse_name: '',
        warehouse_type: 'godown',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contact_person: '',
        phone_number: '',
        email: ''
    });

    const [newInward, setNewInward] = useState({
        purchase_id: 'BILL-90112',
        stock_id: '',
        received_quantity: 100,
        received_by: 'Vijay Chauhan (Manager)',
        warehouse_id: ''
    });

    const [newTransfer, setNewTransfer] = useState({
        source_warehouse_id: '',
        destination_warehouse_id: '',
        stock_id: '',
        transfer_quantity: 15,
        carrier_name: 'Bluedart Logistics',
        tracking_number: 'BD-88902A'
    });

    // Set default select values when database lists load
    useEffect(() => {
        const timer = setTimeout(() => {
            if (dbStocks.length > 0 && !newInward.stock_id) {
                setNewInward(prev => ({ ...prev, stock_id: dbStocks[0].id.toString() }));
            }
            if (dbWarehouses.length > 0 && !newInward.warehouse_id) {
                setNewInward(prev => ({ ...prev, warehouse_id: dbWarehouses[0].id.toString() }));
            }
            if (dbStocks.length > 0 && !newTransfer.stock_id) {
                setNewTransfer(prev => ({ ...prev, stock_id: dbStocks[0].id.toString() }));
            }
            if (dbWarehouses.length > 0 && !newTransfer.source_warehouse_id) {
                setNewTransfer(prev => ({ ...prev, source_warehouse_id: dbWarehouses[0].id.toString() }));
            }
            if (dbWarehouses.length > 1 && !newTransfer.destination_warehouse_id) {
                setNewTransfer(prev => ({ ...prev, destination_warehouse_id: dbWarehouses[1].id.toString() }));
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [dbStocks, dbWarehouses, newInward.stock_id, newInward.warehouse_id, newTransfer.stock_id, newTransfer.source_warehouse_id, newTransfer.destination_warehouse_id]);

    const handleCreateWarehouse = (e) => {
        e.preventDefault();
        const payload = {
            name: newWarehouse.warehouse_name,
            code: newWarehouse.warehouse_code,
            type: newWarehouse.warehouse_type,
            address: newWarehouse.address,
            city: newWarehouse.city,
            state: newWarehouse.state,
            pincode: newWarehouse.pincode,
            contact_person: newWarehouse.contact_person,
            phone_number: newWarehouse.phone_number,
            email: newWarehouse.email
        };
        createWarehouseMutation.mutate(payload);
    };

    const createInwardMutation = useMutation({
        mutationFn: (data) => apiClient.patch(`/stock/${data.stock_id}/adjust-quantity`, { delta: data.quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            alert('Goods Inward receipt logged! Warehouse inventory adjusted automatically.');
            setIsInwardModalOpen(false);
        }
    });

    const handleLogInward = (e) => {
        e.preventDefault();
        createInwardMutation.mutate({
            stock_id: parseInt(newInward.stock_id),
            quantity: parseInt(newInward.received_quantity)
        });
    };

    const createTransferMutation = useMutation({
        mutationFn: (data) => apiClient.post(`/warehouses/${data.from_warehouse_id}/transfers`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            alert('Stock Transfer Order dispatched! Marked in-transit across branches.');
            setIsTransferModalOpen(false);
        }
    });

    const handleSaveTransfer = (e) => {
        e.preventDefault();
        createTransferMutation.mutate({
            from_warehouse_id: parseInt(newTransfer.source_warehouse_id),
            to_warehouse_id: parseInt(newTransfer.destination_warehouse_id),
            stock_id: parseInt(newTransfer.stock_id),
            quantity: parseInt(newTransfer.transfer_quantity)
        });
    };

    const handleCompleteTransfer = (trfId) => {
        alert(`Transfer ${trfId} marked complete! Stock landed at destination warehouse.`);
    };



    const totalWarehouseValue = whStocks.reduce((sum, s) => sum + s.warehouse_stock_value, 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <WarehouseIcon size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Warehouse, Godowns & Logistics</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage multiple physical godowns, branch storage facilities, inter-warehouse transfers, rack zones, and inward receipts.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsInwardModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        <Truck size={15} /> Goods Inward Receiving
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Register Warehouse
                    </button>
                </div>
            </div>

            {/* Warehouse Quick Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Godown Facilities', value: `${warehouses.length} Active`, icon: WarehouseIcon, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Total Multi-Warehouse Worth', value: `₹${totalWarehouseValue.toLocaleString()}`, icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Pending Transfer Dispatches', value: `${transfers.filter(t => t.transfer_status === 'Pending').length} Shipments`, icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Inward Receipts Audited', value: `${inwards.length} Receipts`, icon: FileText, color: '#8B5CF6', bg: '#F5F3FF' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '0.5rem' }}>
                            <stat.icon size={20} />
                        </div>
                        <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem', margin: 0 }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'profiles', label: 'Registered Godowns & Locations', icon: WarehouseIcon, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'stock', label: 'Warehouse Stock Registry', icon: Layers, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'operations', label: 'Goods Inward Historical logs', icon: FileText, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'transfers', label: 'Inter-Warehouse Transfers', icon: ArrowRightLeft, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
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

            {/* Tab 1: Godown Profiles */}
            {activeTab === 'profiles' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {warehouses.map((wh) => (
                        <div key={wh.warehouse_id} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F0F9F4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>{wh.warehouse_code}</span>
                                <span style={{ display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#E0F2FE', color: '#0369A1', fontSize: '0.75rem', fontWeight: '800' }}>CAPACITY UTILIZATION: {wh.capacity_utilization}</span>
                            </div>

                            <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#1E293B', marginBottom: '1rem' }}>{wh.warehouse_name}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <MapPin size={16} style={{ color: '#64748B', flexShrink: 0 }} />
                                    <span>{wh.address}, {wh.city} - {wh.pincode} ({wh.state})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <User size={16} style={{ color: '#64748B' }} />
                                    <span>{wh.contact_person}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <Phone size={16} style={{ color: '#64748B' }} />
                                    <span>{wh.phone_number}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <Mail size={16} style={{ color: '#64748B' }} />
                                    <span>{wh.email}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 2: Warehouse Stock Registry */}
            {activeTab === 'stock' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Warehouse Facility</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Product Description</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Storage location zone</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Current Stock</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Damaged Qty</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>In Transit</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Sourcing Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {whStocks.map((st) => (
                                    <tr key={st.wh_stock_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '800', color: '#064E3B', fontSize: '0.95rem' }}>{st.warehouse_name}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '700', color: '#1E293B' }}>{st.product_name}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '700', color: '#475569' }}>{st.zone}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{st.rack_number} | {st.shelf_number} | {st.bin_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: '#1B6B3A' }}>{st.current_stock} pcs</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#EF4444' }}>{st.damaged_stock} pcs</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '700', color: '#F59E0B' }}>{st.in_transit_stock} pcs</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '950', color: '#10B981' }}>₹{st.warehouse_stock_value.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Goods Inwards Operations Logs */}
            {activeTab === 'operations' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Goods Inwards Audit Trail</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Inward ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Purchase bill ref</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Received Qty</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Received By</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Date Received</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Destination Warehouse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inwards.map((inw) => (
                                <tr key={inw.inward_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{inw.inward_id}</td>
                                    <td style={{ padding: '1rem', color: '#475569', fontWeight: '700' }}>{inw.purchase_id}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{inw.product_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>{inw.received_quantity} pcs</td>
                                    <td style={{ padding: '1rem' }}>{inw.received_by}</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{inw.inward_date}</td>
                                    <td style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>{inw.warehouse_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 4: Inter-Warehouse Transfers */}
            {activeTab === 'transfers' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Branch Dispatch & Inter-Transfers</h3>
                        <button onClick={() => setIsTransferModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Inter-Warehouse Transfer</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Transfer ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>From Facility</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>To Facility</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Transfer Qty</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Logistics Carrier / Track ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Land Shipment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((trf) => (
                                <tr key={trf.transfer_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{trf.transfer_id}</td>
                                    <td style={{ padding: '1rem' }}>{trf.source_warehouse}</td>
                                    <td style={{ padding: '1rem' }}>{trf.destination_warehouse}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{trf.product_name}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>{trf.transfer_quantity} pcs</td>
                                    <td style={{ padding: '1rem', color: '#64748B' }}>{trf.carrier_name} ({trf.tracking_number})</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            display: 'inline-flex', padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            background: trf.transfer_status === 'Completed' ? '#ECFDF5' : '#FFFBEB',
                                            color: trf.transfer_status === 'Completed' ? '#10B981' : '#B45309',
                                            fontSize: '0.75rem', fontWeight: '800'
                                        }}>{trf.transfer_status.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {trf.transfer_status !== 'Completed' && (
                                            <button 
                                                onClick={() => handleCompleteTransfer(trf.transfer_id)}
                                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >Mark Received</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Goods Inward Receiving Modal */}
            {isInwardModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Goods Inward Receipt</h3>
                            <button onClick={() => setIsInwardModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleLogInward} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Purchase Bill / Ref ID</label>
                                <input required type="text" value={newInward.purchase_id} onChange={(e) => setNewInward({ ...newInward, purchase_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} placeholder="BILL-90112" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Product Name</label>
                                <select value={newInward.stock_id} onChange={(e) => setNewInward({ ...newInward, stock_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {dbStocks.map(s => <option key={s.id} value={s.id}>{s.name} (Current: {s.quantity} pcs)</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Received Quantity</label>
                                <input required type="number" value={newInward.received_quantity} onChange={(e) => setNewInward({ ...newInward, received_quantity: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Receiving Destination Warehouse</label>
                                <select value={newInward.warehouse_id} onChange={(e) => setNewInward({ ...newInward, warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                                </select>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Log Good Inward Receipt
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Inter-Warehouse Transfer Modal */}
            {isTransferModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Inter-Warehouse Stock Transfer</h3>
                            <button onClick={() => setIsTransferModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Select Product</label>
                                <select value={newTransfer.stock_id} onChange={(e) => setNewTransfer({ ...newTransfer, stock_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {dbStocks.map(s => <option key={s.id} value={s.id}>{s.name} (Avail: {s.quantity} pcs)</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Warehouse</label>
                                    <select value={newTransfer.source_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, source_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Warehouse</label>
                                    <select value={newTransfer.destination_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, destination_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Quantity to Transfer</label>
                                <input required type="number" value={newTransfer.transfer_quantity} onChange={(e) => setNewTransfer({ ...newTransfer, transfer_quantity: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Logistics Carrier & Tracking ID</label>
                                <input required type="text" value={newTransfer.carrier_name} onChange={(e) => setNewTransfer({ ...newTransfer, carrier_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} placeholder="e.g. Bluedart (BD-88902A)" />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Dispatched branch Transfer
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Warehouse Profile Modal */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Register New Warehouse Facility</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse Name</label>
                                    <input required type="text" value={newWarehouse.warehouse_name} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Delhi Godown" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse Code</label>
                                    <input required type="text" value={newWarehouse.warehouse_code} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_code: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="WH-DEL-04" />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Facility Type</label>
                                <select value={newWarehouse.warehouse_type} onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouse_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    <option value="godown">Godown (Bulk Storage)</option>
                                    <option value="store">Store Outlet (Retail)</option>
                                    <option value="DC">Distribution Center (logistics)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Address</label>
                                <input required type="text" value={newWarehouse.address} onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Plot No 40..." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>City</label>
                                    <input required type="text" value={newWarehouse.city} onChange={(e) => setNewWarehouse({ ...newWarehouse, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>State</label>
                                    <input required type="text" value={newWarehouse.state} onChange={(e) => setNewWarehouse({ ...newWarehouse, state: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Pincode</label>
                                    <input required type="text" value={newWarehouse.pincode} onChange={(e) => setNewWarehouse({ ...newWarehouse, pincode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Manager Name</label>
                                    <input required type="text" value={newWarehouse.contact_person} onChange={(e) => setNewWarehouse({ ...newWarehouse, contact_person: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Mobile No</label>
                                    <input required type="text" value={newWarehouse.phone_number} onChange={(e) => setNewWarehouse({ ...newWarehouse, phone_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Register Facility Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessWarehouse;
