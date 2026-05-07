import React, { useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('profiles'); // 'profiles', 'stock', 'operations', 'transfers'
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Stateful Warehouse Profiles Database
    const [warehouses, setWarehouses] = useState([
        {
            warehouse_id: 'WH-001',
            warehouse_code: 'WH-MUM-01',
            warehouse_name: 'Main Godown (Mumbai HQ)',
            warehouse_type: 'godown',
            warehouse_status: 'active',
            address: 'Plot No. 44, MIDC Industrial Area, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400093',
            contact_person: 'Vijay Chauhan (Godown Manager)',
            phone_number: '+91 98765 43210',
            email: 'mumbaiwh@cliksbusiness.com',
            capacity_utilization: '74%'
        },
        {
            warehouse_id: 'WH-002',
            warehouse_code: 'WH-MUM-02',
            warehouse_name: 'Shop Front (Bandra Outlet)',
            warehouse_type: 'store',
            warehouse_status: 'active',
            address: 'Shop No. 12, Hill Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            contact_person: 'Rohan Mehta (Store lead)',
            phone_number: '+91 98222 11100',
            email: 'bandrastore@cliksbusiness.com',
            capacity_utilization: '48%'
        },
        {
            warehouse_id: 'WH-003',
            warehouse_code: 'WH-BLR-03',
            warehouse_name: 'Bengaluru Distribution Center',
            warehouse_type: 'DC',
            warehouse_status: 'active',
            address: 'Peenya Industrial Area, Phase II',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560058',
            contact_person: 'Suresh Gowda (DC Manager)',
            phone_number: '+91 91100 22334',
            email: 'bangalorewh@cliksbusiness.com',
            capacity_utilization: '82%'
        }
    ]);

    // Stateful Warehouse Stock Database
    const [whStocks, setWhStocks] = useState([
        {
            wh_stock_id: 'WHS-101',
            product_id: 'PROD-101',
            product_name: 'Dell Inspiron 15 Laptop',
            warehouse_id: 'WH-001',
            warehouse_name: 'Main Godown (Mumbai HQ)',
            current_stock: 90,
            reserved_stock: 5,
            damaged_stock: 2,
            in_transit_stock: 10,
            rack_number: 'Rack A-2',
            shelf_number: 'Shelf 4',
            bin_number: 'Bin B',
            zone: 'High-Value Electronics',
            warehouse_stock_value: 3258000
        },
        {
            wh_stock_id: 'WHS-102',
            product_id: 'PROD-101',
            product_name: 'Dell Inspiron 15 Laptop',
            warehouse_id: 'WH-002',
            warehouse_name: 'Shop Front (Bandra Outlet)',
            current_stock: 35,
            reserved_stock: 5,
            damaged_stock: 1,
            in_transit_stock: 0,
            rack_number: 'Front Shelf 1',
            shelf_number: 'Shelf 1',
            bin_number: 'Bin A',
            zone: 'Display Units',
            warehouse_stock_value: 1267000
        },
        {
            wh_stock_id: 'WHS-103',
            product_id: 'PROD-105',
            product_name: 'Boat Bassheads Earphones',
            warehouse_id: 'WH-002',
            warehouse_name: 'Shop Front (Bandra Outlet)',
            current_stock: 15,
            reserved_stock: 0,
            damaged_stock: 0,
            in_transit_stock: 200,
            rack_number: 'Counter B',
            shelf_number: 'Shelf 3',
            bin_number: 'Bin C',
            zone: 'Accessories',
            warehouse_stock_value: 3900
        }
    ]);

    // Stateful Stock Transfer Database
    const [transfers, setTransfers] = useState([
        {
            transfer_id: 'TRF-0091',
            source_warehouse: 'Main Godown (Mumbai HQ)',
            destination_warehouse: 'Shop Front (Bandra Outlet)',
            product_name: 'Dell Inspiron 15 Laptop',
            transfer_quantity: 10,
            transfer_status: 'Completed',
            dispatch_date: '2026-05-02',
            received_date: '2026-05-03',
            carrier_name: 'SafeMove Logistics',
            tracking_number: 'TRK-900821'
        },
        {
            transfer_id: 'TRF-0092',
            source_warehouse: 'Bengaluru Distribution Center',
            destination_warehouse: 'Shop Front (Bandra Outlet)',
            product_name: 'Boat Bassheads Earphones',
            transfer_quantity: 200,
            transfer_status: 'Pending',
            dispatch_date: '2026-05-05',
            received_date: '',
            carrier_name: 'Delhivry Express',
            tracking_number: 'TRK-88129'
        }
    ]);

    // Goods Inward (Receivings) Historical Logs
    const [inwards, setInwards] = useState([
        {
            inward_id: 'INW-8812',
            purchase_id: 'BILL-77091',
            product_name: 'Dell Inspiron 15 Laptop',
            received_quantity: 50,
            received_by: 'Vijay Chauhan (Manager)',
            inward_date: '2026-05-01',
            warehouse_name: 'Main Godown (Mumbai HQ)'
        }
    ]);

    // Form states
    const [newWarehouse, setNewWarehouse] = useState({
        warehouse_code: 'WH-DEL-04',
        warehouse_name: 'Delhi NCR Godown',
        warehouse_type: 'godown',
        address: 'Sector 62, Noida Industrial Estate',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        contact_person: 'Amit Kumar (Manager)',
        phone_number: '+91 99888 77766',
        email: 'delhiwh@cliksbusiness.com'
    });

    const [newInward, setNewInward] = useState({
        purchase_id: 'BILL-90112',
        product_name: 'Boat Bassheads Earphones',
        received_quantity: 100,
        received_by: 'Vijay Chauhan (Manager)',
        warehouse_id: 'WH-001'
    });

    const [newTransfer, setNewTransfer] = useState({
        source_warehouse_id: 'WH-001',
        destination_warehouse_id: 'WH-002',
        product_name: 'Dell Inspiron 15 Laptop',
        transfer_quantity: 15,
        carrier_name: 'Bluedart Logistics',
        tracking_number: 'BD-88902A'
    });

    const handleCreateWarehouse = (e) => {
        e.preventDefault();
        const createdWH = {
            warehouse_id: `WH-0${warehouses.length + 1}`,
            ...newWarehouse,
            warehouse_status: 'active',
            capacity_utilization: '0%'
        };
        setWarehouses([...warehouses, createdWH]);
        setIsCreateModalOpen(false);
        alert('New Physical Warehouse Profile successfully created!');
    };

    const handleLogInward = (e) => {
        e.preventDefault();
        const selectedWH = warehouses.find(w => w.warehouse_id === newInward.warehouse_id);
        const loggedINW = {
            inward_id: `INW-${Date.now().toString().slice(-4)}`,
            purchase_id: newInward.purchase_id,
            product_name: newInward.product_name,
            received_quantity: parseInt(newInward.received_quantity) || 1,
            received_by: newInward.received_by,
            inward_date: new Date().toISOString().split('T')[0],
            warehouse_name: selectedWH?.warehouse_name || 'Main Godown'
        };
        setInwards([loggedINW, ...inwards]);

        // Add to stock inventory
        const existingStock = whStocks.find(s => s.warehouse_id === newInward.warehouse_id && s.product_name === newInward.product_name);
        if (existingStock) {
            setWhStocks(whStocks.map(s => s.wh_stock_id === existingStock.wh_stock_id ? {
                ...s,
                current_stock: s.current_stock + loggedINW.received_quantity
            } : s));
        } else {
            setWhStocks([...whStocks, {
                wh_stock_id: `WHS-${Date.now().toString().slice(-3)}`,
                product_id: 'PROD-NEW',
                product_name: newInward.product_name,
                warehouse_id: newInward.warehouse_id,
                warehouse_name: selectedWH?.warehouse_name || 'Main Godown',
                current_stock: loggedINW.received_quantity,
                reserved_stock: 0,
                damaged_stock: 0,
                in_transit_stock: 0,
                rack_number: 'Unassigned Rack',
                shelf_number: '',
                bin_number: '',
                zone: 'General Inward',
                warehouse_stock_value: loggedINW.received_quantity * 500
            }]);
        }

        setIsInwardModalOpen(false);
        alert('Goods Inward receipt logged! Warehouse inventory adjusted automatically.');
    };

    const handleSaveTransfer = (e) => {
        e.preventDefault();
        const sourceWH = warehouses.find(w => w.warehouse_id === newTransfer.source_warehouse_id);
        const targetWH = warehouses.find(w => w.warehouse_id === newTransfer.destination_warehouse_id);

        const createdTRF = {
            transfer_id: `TRF-${Date.now().toString().slice(-4)}`,
            source_warehouse: sourceWH?.warehouse_name || 'Warehouse A',
            destination_warehouse: targetWH?.warehouse_name || 'Warehouse B',
            product_name: newTransfer.product_name,
            transfer_quantity: parseInt(newTransfer.transfer_quantity) || 1,
            transfer_status: 'Pending',
            dispatch_date: new Date().toISOString().split('T')[0],
            received_date: '',
            carrier_name: newTransfer.carrier_name,
            tracking_number: newTransfer.tracking_number
        };

        setTransfers([createdTRF, ...transfers]);
        setIsTransferModalOpen(false);
        alert('Stock Transfer Order dispatched! Marked in-transit across branches.');
    };

    const handleCompleteTransfer = (trfId) => {
        setTransfers(transfers.map(trf => trf.transfer_id === trfId ? {
            ...trf,
            transfer_status: 'Completed',
            received_date: new Date().toISOString().split('T')[0]
        } : trf));
        alert('Transfer marked complete! Stock landed at destination warehouse.');
    };

    const filteredWarehouses = warehouses.filter(w => 
        w.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalWarehouseValue = whStocks.reduce((sum, s) => sum + s.warehouse_stock_value, 0);

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <WarehouseIcon size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Warehouse, Godowns & Logistics</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage multiple physical godowns, branch storage facilities, inter-warehouse transfers, rack zones, and inward receipts.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsInwardModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <Truck size={16} /> Goods Inward Receiving
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <Plus size={16} /> Register Warehouse
                    </button>
                </div>
            </div>

            {/* Warehouse Quick Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Active Godown Facilities', value: `${warehouses.length} Active`, icon: WarehouseIcon, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Total Multi-Warehouse Worth', value: `₹${totalWarehouseValue.toLocaleString()}`, icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Pending Transfer Dispatches', value: `${transfers.filter(t => t.transfer_status === 'Pending').length} Shipments`, icon: Truck, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Inward Receipts Audited', value: `${inwards.length} Receipts`, icon: FileText, color: '#06B6D4', bg: '#ECFEFF' }
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

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'profiles', label: 'Registered Godowns & Locations', icon: WarehouseIcon },
                    { id: 'stock', label: 'Warehouse Stock Registry', icon: Layers },
                    { id: 'operations', label: 'Goods Inward Historical logs', icon: FileText },
                    { id: 'transfers', label: 'Inter-Warehouse Transfers', icon: ArrowRightLeft }
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

            {/* Tab 1: Godown Profiles */}
            {activeTab === 'profiles' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {filteredWarehouses.map((wh) => (
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
                                <input required type="text" value={newInward.purchase_id} onChange={(e) => setNewInward({ ...newInward, purchase_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="BILL-90112" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Product Name</label>
                                <input required type="text" value={newInward.product_name} onChange={(e) => setNewInward({ ...newInward, product_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Boat Earphones" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Received Quantity</label>
                                <input required type="number" value={newInward.received_quantity} onChange={(e) => setNewInward({ ...newInward, received_quantity: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Receiving Destination Warehouse</label>
                                <select value={newInward.warehouse_id} onChange={(e) => setNewInward({ ...newInward, warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                    {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                </select>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
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
                                <input required type="text" value={newTransfer.product_name} onChange={(e) => setNewTransfer({ ...newTransfer, product_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Dell Laptop" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Warehouse</label>
                                    <select value={newTransfer.source_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, source_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Warehouse</label>
                                    <select value={newTransfer.destination_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, destination_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Quantity to Transfer</label>
                                <input required type="number" value={newTransfer.transfer_quantity} onChange={(e) => setNewTransfer({ ...newTransfer, transfer_quantity: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Logistics Carrier & Tracking ID</label>
                                <input required type="text" value={newTransfer.carrier_name} onChange={(e) => setNewTransfer({ ...newTransfer, carrier_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. Bluedart (BD-88902A)" />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
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
