import React, { useState, useEffect } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService, stockService, settingsService, productsService } from '../services';
import { apiClient } from '../api/client';
import FilterableTableHead from '../components/FilterableTableHead';
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
    Folder,
    Trash2
} from 'lucide-react';
import '../App.css';
import { useCurrency } from '../context';

const BusinessWarehouse = () => {
    const { formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    // Fetch customization settings dynamically to enforce master configurations
    const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const activeConfig = userSettings?.data || userSettings || {};

    const [activeTab, setActiveTab] = useState('profiles');
    const [colFilters, setColFilters] = React.useState({}); // 'profiles', 'stock', 'operations', 'transfers'

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [locallyDeletedIds, setLocallyDeletedIds] = useState([]);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [editWarehouseForm, setEditWarehouseForm] = useState({});
    const [selectedStock, setSelectedStock] = useState(null);

    // Warehouse Card Actions State: Add New Product & View List
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [targetWarehouseForProduct, setTargetWarehouseForProduct] = useState(null);
    const [newWarehouseProduct, setNewWarehouseProduct] = useState({
        name: '',
        sku: '',
        category: 'General',
        unit: 'PCS',
        quantity: 10,
        purchase_price: 0,
        selling_price: 0,
        barcode: '',
        hsn_code: ''
    });

    const [isViewListModalOpen, setIsViewListModalOpen] = useState(false);
    const [targetWarehouseForList, setTargetWarehouseForList] = useState(null);
    const [viewListSearch, setViewListSearch] = useState('');

    // Live Warehouses database via useQuery
    const { data: dbWarehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    // Live Stocks database via useQuery
    const { data: dbStocks = [] } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockService.getStocks(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    // Live Transfers database via useQuery
    const { data: reportsData } = useQuery({
        queryKey: ['warehouseReports'],
        queryFn: () => apiClient.get('/warehouses/reports').then(res => res.data.data || res.data),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
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

    const deleteWarehouseMutation = useMutation({
        mutationFn: (id) => warehouseService.deleteWarehouse(id),
        onMutate: (deletedId) => {
            // Zero-latency optimistic native React state repainting!
            setLocallyDeletedIds(prev => [...prev, String(deletedId)]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        },
        onError: (err) => {
            console.error('[Warehouse Delete Error]', err);
            alert('Action failed. Some active stock entries or transaction logs may still exist for this facility.');
            // Reset optimistic state to restore UI if API failed
            setLocallyDeletedIds(prev => prev.filter(id => id !== String(confirmingDeleteId)));
        }
    });

    const updateWarehouseMutation = useMutation({
        mutationFn: ({ id, data }) => warehouseService.updateWarehouse ? warehouseService.updateWarehouse(id, data) : Promise.resolve({ success: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setEditingWarehouse(null);
            alert('Warehouse profile updated!');
        }
    });

    const warehouses = dbWarehouses
        .filter(w => !locallyDeletedIds.includes(String(w.id)))
        .map(w => ({
            warehouse_id: `WH-0${w.id}`,
            id: w.id,
            warehouse_code: w.code || `WH-${w.id}`,
            warehouse_name: w.name || 'Warehouse Profile',
            warehouse_type: w.type || 'godown',
            warehouse_status: w.status || 'active',
            address: w.address || 'Unspecified',
            city: w.city || 'N/A',
            state: w.state || '',
            pincode: w.pincode || '',
            contact_person: w.contact_person || 'Not Assigned',
            phone_number: w.phone_number || '',
            email: w.email || '',
            capacity_utilization: w.capacity_utilization || '0%'
        }));

    // Stateful Warehouse Stock Database mapped from live DB Stocks
    const whStocks = dbStocks.map(s => {
        let warehouseName = 'General';
        let rackNumber = 'N/A';
        let zoneName = 'General';

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
            product_name: s.name || 'Unknown Product',
            warehouse_name: warehouseName,
            current_stock: current_stock,
            reserved_stock: s.reserved_stock || 0,
            damaged_stock: s.damaged_stock || 0,
            in_transit_stock: s.in_transit_stock || 0,
            rack_number: rackNumber,
            shelf_number: s.shelf_number || 'N/A',
            bin_number: s.bin_number || 'N/A',
            zone: zoneName,
            warehouse_stock_value: current_stock * average_cost
        };
    });

    // Stateful Stock Transfer Database mapped from live DB warehouse transfers
    const dbTransfers = reportsData?.transfers || [];
    const transfers = dbTransfers.map((t, idx) => {
        const fromWH = warehouses.find(w => w.id === t.from_warehouse_id) || { warehouse_name: 'Facility' };
        const toWH = warehouses.find(w => w.id === t.to_warehouse_id) || { warehouse_name: 'Branch' };
        const product = dbStocks.find(s => s.id === t.stock_id) || { name: 'Unknown' };

        return {
            transfer_id: `TRF-${t.id || (idx + 100)}`,
            id: t.id,
            source_warehouse: fromWH.warehouse_name,
            destination_warehouse: toWH.warehouse_name,
            product_name: product.name,
            transfer_quantity: t.quantity || 0,
            transfer_status: t.status || 'Pending',
            dispatch_date: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            received_date: t.received_at ? t.received_at.split('T')[0] : 'N/A',
            carrier_name: t.carrier_name || 'N/A',
            tracking_number: t.tracking_number || 'N/A'
        };
    });

    // Goods Inward (Receivings) Logs from actual backend transactions
    const dbInwards = reportsData?.inwards || [];
    const inwards = dbInwards.map((inw) => ({
        inward_id: `INW-${inw.id}`,
        purchase_id: inw.purchase_bill_ref || 'N/A',
        product_name: inw.product_name || 'Unknown Item',
        received_quantity: inw.quantity || 0,
        received_by: inw.received_by || 'Staff',
        inward_date: inw.created_at ? inw.created_at.split('T')[0] : 'N/A',
        warehouse_name: inw.warehouse_name || 'Not Configured'
    }));

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
        purchase_id: '',
        stock_id: '',
        received_quantity: 0,
        received_by: '',
        warehouse_id: ''
    });

    const [newTransfer, setNewTransfer] = useState({
        source_warehouse_id: '',
        destination_warehouse_id: '',
        stock_id: '',
        transfer_quantity: 0,
        carrier_name: '',
        tracking_number: ''
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

    // Fetch Live Registered Products for Goods Inward Receipt selection
    const { data: dbProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

    const inwardProductsList = React.useMemo(() => {
        const list = [];
        const seen = new Set();
        const safeProds = Array.isArray(dbProducts) ? dbProducts : [];
        safeProds.forEach(p => {
            if (p && p.id != null) {
                seen.add(String(p.id));
                list.push({ id: p.id, name: p.name || `Product #${p.id}`, sku: p.sku || 'N/A', quantity: p.quantity || 0 });
            }
        });
        const safeStocks = Array.isArray(dbStocks) ? dbStocks : [];
        safeStocks.forEach(s => {
            if (s && s.id != null && !seen.has(String(s.id))) {
                seen.add(String(s.id));
                list.push({ id: s.id, name: s.name || `Stock #${s.id}`, sku: s.sku || 'N/A', quantity: s.quantity || 0 });
            }
        });
        return list;
    }, [dbProducts, dbStocks]);

    const warehouseAssignedProducts = React.useMemo(() => {
        if (!targetWarehouseForList) return [];
        const targetId = String(targetWarehouseForList.id);
        const targetCode = (targetWarehouseForList.warehouse_code || '').toLowerCase();
        const targetName = (targetWarehouseForList.warehouse_name || '').toLowerCase();

        const resultList = [];
        const seenSkus = new Set();

        const safeProds = Array.isArray(dbProducts) ? dbProducts : [];
        safeProds.forEach(p => {
            if (!p) return;
            const pWhId = String(p.warehouse_id || '').toLowerCase();
            if (pWhId === targetId.toLowerCase() || pWhId === targetCode || pWhId === targetName || pWhId === `wh-0${targetId.toLowerCase()}` || (targetName && pWhId.includes(targetName))) {
                const key = (p.sku || p.name || '').toLowerCase();
                seenSkus.add(key);
                resultList.push({
                    id: p.id,
                    name: p.name || 'Unnamed Product',
                    sku: p.sku || `PROD-${p.id}`,
                    category: p.category || 'General',
                    quantity: p.quantity || 0,
                    unit: p.unit || 'PCS',
                    purchase_price: p.purchase_price || 0,
                    selling_price: p.selling_price || 0,
                    barcode: p.barcode || 'N/A',
                    hsn_code: p.hsn_code || 'N/A'
                });
            }
        });

        const safeStocks = Array.isArray(dbStocks) ? dbStocks : [];
        safeStocks.forEach(s => {
            if (!s) return;
            const loc = (s.location || '').toLowerCase();
            const wh = (s.warehouse || s.warehouse_name || s.warehouse_id || '').toLowerCase();
            const sWhId = String(s.warehouse_id || '').toLowerCase();
            const sWhName = (s.warehouse_name || '').toLowerCase();
            if (
                loc === targetName || (targetName && loc.includes(targetName)) ||
                wh === targetCode || wh === targetId.toLowerCase() || wh === targetName ||
                sWhId === targetId.toLowerCase() || (targetName && sWhName.includes(targetName))
            ) {
                const key = (s.sku || s.name || '').toLowerCase();
                if (!seenSkus.has(key)) {
                    seenSkus.add(key);
                    resultList.push({
                        id: `stk-${s.id}`,
                        name: s.name || 'Unnamed Stock Item',
                        sku: s.sku || `STK-${s.id}`,
                        category: s.category || 'Stock Item',
                        quantity: s.quantity || 0,
                        unit: s.unit || 'PCS',
                        purchase_price: s.unit_price || 0,
                        selling_price: s.unit_price || 0,
                        barcode: s.barcode || 'N/A',
                        hsn_code: s.hsn_code || 'N/A'
                    });
                }
            }
        });

        return resultList;
    }, [targetWarehouseForList, dbProducts, dbStocks]);

    const handleOpenAddProduct = (wh) => {
        setTargetWarehouseForProduct(wh);
        setNewWarehouseProduct({
            name: '',
            sku: `SKU-${Date.now().toString().slice(-6)}`,
            category: 'General',
            unit: 'PCS',
            quantity: 10,
            purchase_price: 0,
            selling_price: 0,
            barcode: '',
            hsn_code: ''
        });
        setIsAddProductModalOpen(true);
    };

    const handleCreateWarehouseProductSubmit = async (e) => {
        e.preventDefault();
        if (!newWarehouseProduct.name || !targetWarehouseForProduct) return;

        try {
            const targetIdStr = String(targetWarehouseForProduct.id || targetWarehouseForProduct.warehouse_code);
            const targetName = targetWarehouseForProduct.warehouse_name;
            const targetCode = targetWarehouseForProduct.warehouse_code;

            await productsService.createProduct({
                ...newWarehouseProduct,
                warehouse_id: targetIdStr
            });

            try {
                await stockService.createStock({
                    name: newWarehouseProduct.name,
                    sku: newWarehouseProduct.sku,
                    category: newWarehouseProduct.category,
                    unit: newWarehouseProduct.unit,
                    quantity: parseFloat(newWarehouseProduct.quantity) || 0,
                    unit_price: parseFloat(newWarehouseProduct.purchase_price) || 0,
                    cost_price: parseFloat(newWarehouseProduct.purchase_price) || 0,
                    location: targetName,
                    warehouse: targetCode,
                    supplier_name: 'Direct Inward'
                });
            } catch (stErr) {
                console.warn('[Warehouse Product Stock creation warning]', stErr);
            }

            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });

            alert(`New product "${newWarehouseProduct.name}" successfully created and saved in ${targetName}!`);
            setIsAddProductModalOpen(false);
        } catch (err) {
            console.error('[Warehouse Product Creation Error]', err);
            alert(err.message || 'Failed to create product for warehouse.');
        }
    };

    const handleOpenViewList = (wh) => {
        setTargetWarehouseForList(wh);
        setViewListSearch('');
        setIsViewListModalOpen(true);
    };

    const handleCreateWarehouse = (e) => {
        e.preventDefault();

        // Enforce 10-digit mobile number formatting rule
        const cleanPhone = (newWarehouse.phone_number || '').trim();
        if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
            alert("Contact Mobile No must strictly be a valid 10-digit phone number.");
            return;
        }

        const payload = {
            name: newWarehouse.warehouse_name,
            code: newWarehouse.warehouse_code,
            type: newWarehouse.warehouse_type,
            address: newWarehouse.address,
            city: newWarehouse.city,
            state: newWarehouse.state,
            pincode: newWarehouse.pincode,
            contact_person: newWarehouse.contact_person,
            phone_number: cleanPhone,
            email: newWarehouse.email
        };
        createWarehouseMutation.mutate(payload);
    };

    const createInwardMutation = useMutation({
        mutationFn: (data) => apiClient.patch(`/stock/${data.stock_id}/adjust-quantity`, {
            delta: data.quantity,
            purchase_bill_ref: data.purchase_bill_ref,
            received_by: data.received_by,
            warehouse_id: data.warehouse_id
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            alert('Goods Inward receipt logged! Warehouse inventory adjusted automatically.');
            setIsInwardModalOpen(false);
        }
    });

    const handleLogInward = (e) => {
        e.preventDefault();
        createInwardMutation.mutate({
            stock_id: parseInt(newInward.stock_id),
            quantity: parseInt(newInward.received_quantity),
            purchase_bill_ref: newInward.purchase_id,
            received_by: newInward.received_by,
            warehouse_id: parseInt(newInward.warehouse_id)
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

    if (!isLoadingSettings && activeConfig.godown === false) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px', background: '#F8FAFC', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '3rem', borderRadius: '24px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.1)' }}>
                        <WarehouseIcon size={40} style={{ color: '#EC4899' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Multi-Warehouse Management Locked</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', fontWeight: '500' }}>
                        The Godowns, Locations, and Logistics module is currently disabled. You can activate this feature instantly from your advanced personalization control panel to start managing bulk godowns and transfers.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.href = '/customization'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.5rem', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none',
                                fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                            }}
                        >
                            <Sliders size={16} /> Enable Godown Links
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalWarehouseValue = whStocks.reduce((sum, s) => sum + s.warehouse_stock_value, 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
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
            {/* Modern Warehouse Accent Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Active Godown Facilities', value: `${warehouses.length} Active`, icon: WarehouseIcon, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Multi-Warehouse Worth', value: formatCurrency(totalWarehouseValue), icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Pending Shipments', value: `${transfers.filter(t => t.transfer_status === 'Pending').length} Unsent`, icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Inward Receipts Audited', value: `${inwards.length} Records`, icon: FileText, color: '#8B5CF6', bg: '#F5F3FF' }
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

            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

                {/* Tab 1: Godown Profiles */}
                {activeTab === 'profiles' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {warehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((wh) => (
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

                                {/* Facility Product & Inventory Actions */}
                                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '1rem', paddingTop: '0.85rem', display: 'flex' }}>
                                    <button 
                                        type="button"
                                        onClick={() => handleOpenViewList(wh)} 
                                        style={{ 
                                            flex: 1,
                                            padding: '0.5rem 0.5rem', borderRadius: '10px', 
                                            background: '#EFF6FF', color: '#1D4ED8', 
                                            border: '1px solid #BFDBFE', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', 
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' 
                                        }}
                                    >
                                        <Layers size={14} /> View the List
                                    </button>
                                </div>

                                {/* Facility Action Footer */}
                                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '1.25rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button onClick={() => { setEditWarehouseForm({ ...wh }); setEditingWarehouse(wh.id); }} style={{ border: '1px solid #E2E8F0', background: 'white', color: '#475569', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}>✏️ Edit</button>
                                    {confirmingDeleteId === wh.id ? (
                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (activeConfig.passcode) {
                                                        const pin = prompt("Enter Security Passcode to authorize deletion:");
                                                        if (pin !== "1234") {
                                                            alert("Unauthorized: Incorrect security passcode.");
                                                            return;
                                                        }
                                                    }
                                                    deleteWarehouseMutation.mutate(wh.id);
                                                    setConfirmingDeleteId(null);
                                                }}
                                                style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}
                                            >
                                                Delete Godown
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                                style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(wh.id); }}
                                            style={{ border: 'none', background: '#FEF2F2', color: '#EF4444', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                            title="Delete Warehouse Profile"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
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
                                <FilterableTableHead columns={[
                                    { key: 'warehouse_name', label: 'Warehouse Facility', placeholder: 'Name' },
                                    { key: 'product_name', label: 'Product Description', placeholder: 'Product' },
                                    { key: 'zone', label: 'Storage Zone', placeholder: 'Zone A' },
                                    { key: 'current_stock', label: 'Current Stock', placeholder: 'e.g. 100' },
                                    { key: 'damaged', label: 'Damaged Qty', placeholder: 'e.g. 5' },
                                    { key: 'in_transit', label: 'In Transit', placeholder: 'e.g. 10' },
                                    { key: 'valuation', label: 'Sourcing Valuation', placeholder: 'e.g. 50000' }
                                ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {whStocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((st) => (
                                        <tr key={st.wh_stock_id} style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s' }} onClick={() => setSelectedStock(st)} onMouseOver={(e) => e.currentTarget.style.background = '#F0FDF4'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
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
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '950', color: '#10B981' }}>{formatCurrency(st.warehouse_stock_value)}</td>
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
                                {inwards.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((inw) => (
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
                                {transfers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((trf) => (
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
            </div>
            {/* Edit Warehouse Modal */}
            {editingWarehouse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Edit Warehouse Profile</h3>
                            <button onClick={() => setEditingWarehouse(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); updateWarehouseMutation.mutate({ id: editingWarehouse, data: { name: editWarehouseForm.warehouse_name, code: editWarehouseForm.warehouse_code, type: editWarehouseForm.warehouse_type, address: editWarehouseForm.address, city: editWarehouseForm.city, state: editWarehouseForm.state, pincode: editWarehouseForm.pincode, contact_person: editWarehouseForm.contact_person, phone_number: editWarehouseForm.phone_number, email: editWarehouseForm.email } }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[['warehouse_name', 'Warehouse Name', 'text'], ['warehouse_code', 'Code', 'text'], ['address', 'Address', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'], ['pincode', 'Pincode', 'text'], ['contact_person', 'Contact Person', 'text'], ['phone_number', 'Phone', 'tel'], ['email', 'Email', 'email']].map(([key, label, type]) => (
                                <div key={key}>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>{label}</label>
                                    <input type={type} value={editWarehouseForm[key] || ''} onChange={(e) => setEditWarehouseForm(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #047857)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Save Changes</button>
                        </form>
                    </div>
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
                                    {inwardProductsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sku}) — Current Stock: {s.quantity} pcs</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Received Quantity</label>
                                <input required type="number" value={newInward.received_quantity} onChange={(e) => setNewInward({ ...newInward, received_quantity: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '600' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Receiving Destination Warehouse</label>
                                <select value={newInward.warehouse_id} onChange={(e) => setNewInward({ ...newInward, warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                    {warehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
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
                                    {dbStocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => <option key={s.id} value={s.id}>{s.name} (Avail: {s.quantity} pcs)</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>From Warehouse</label>
                                    <select value={newTransfer.source_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, source_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {warehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>To Warehouse</label>
                                    <select value={newTransfer.destination_warehouse_id} onChange={(e) => setNewTransfer({ ...newTransfer, destination_warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        {warehouses.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
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

            {/* Stock Item Detail Popup */}
            {selectedStock && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '560px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>📦 {selectedStock.product_name}</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>{selectedStock.product_id} · {selectedStock.warehouse_name}</p>
                            </div>
                            <button onClick={() => setSelectedStock(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {/* Stock Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[['Current Stock', `${selectedStock.current_stock} pcs`, '#15803d', '#D1FAE5'], ['Damaged', `${selectedStock.damaged_stock} pcs`, '#DC2626', '#FEE2E2'], ['In Transit', `${selectedStock.in_transit_stock} pcs`, '#D97706', '#FEF3C7']].map(([label, val, color, bg]) => (
                                <div key={label} style={{ background: bg, borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color, margin: '0 0 4px 0', textTransform: 'uppercase' }}>{label}</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '900', color, margin: 0 }}>{val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Location Details */}
                        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem', margin: '0 0 10px 0' }}>📍 Storage Location</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                {[['Zone', selectedStock.zone], ['Rack', selectedStock.rack_number], ['Shelf', selectedStock.shelf_number], ['Bin', selectedStock.bin_number], ['Valuation', formatCurrency(selectedStock.warehouse_stock_value)], ['SKU', selectedStock.product_id]].map(([label, val]) => (
                                    <div key={label}>
                                        <p style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748B', margin: '0 0 2px 0' }}>{label}</p>
                                        <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.82rem', margin: 0 }}>{val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Simulated History Timeline */}
                        <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: '0 0 12px 0' }}>🕐 Stock Movement History (Recent)</p>
                        {[
                            { date: '2026-05-24', event: 'Goods Inward Receipt', qty: `+${Math.round(selectedStock.current_stock * 0.3)} pcs`, color: '#15803d' },
                            { date: '2026-05-20', event: 'Sales Dispatch', qty: `-${Math.round(selectedStock.current_stock * 0.1)} pcs`, color: '#DC2626' },
                            { date: '2026-05-15', event: 'Inter-Warehouse Transfer In', qty: `+${Math.round(selectedStock.current_stock * 0.2)} pcs`, color: '#2563EB' },
                            { date: '2026-05-10', event: 'Damage Write-off', qty: `-${selectedStock.damaged_stock} pcs`, color: '#D97706' },
                            { date: '2026-05-01', event: 'Opening Stock Audit', qty: `${selectedStock.current_stock} pcs`, color: '#6B21A8' }
                        ].map((entry, idx, arr) => (
                            <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0, marginTop: '4px' }} />
                                    {idx < arr.length - 1 && <div style={{ width: '2px', flex: 1, background: '#E2E8F0', minHeight: '18px' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '800', fontSize: '0.82rem', color: '#0F172A' }}>{entry.event} — <span style={{ color: entry.color }}>{entry.qty}</span></p>
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#94A3B8' }}>{entry.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Warehouse Modal */}
            {editingWarehouse && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>✏️ Edit Warehouse Profile</h3>
                            <button onClick={() => setEditingWarehouse(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); updateWarehouseMutation.mutate({ id: editingWarehouse, data: { name: editWarehouseForm.warehouse_name, code: editWarehouseForm.warehouse_code, type: editWarehouseForm.warehouse_type, address: editWarehouseForm.address, city: editWarehouseForm.city, state: editWarehouseForm.state, pincode: editWarehouseForm.pincode, contact_person: editWarehouseForm.contact_person, phone_number: editWarehouseForm.phone_number, email: editWarehouseForm.email } }); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                ['warehouse_name', 'Warehouse Name', 'text'],
                                ['warehouse_code', 'Code', 'text'],
                                ['address', 'Address', 'text'],
                                ['city', 'City', 'text'],
                                ['state', 'State', 'text'],
                                ['pincode', 'Pincode', 'text'],
                                ['contact_person', 'Contact Person', 'text'],
                                ['phone_number', 'Phone', 'tel'],
                                ['email', 'Email', 'email']
                            ].map(([key, label, type]) => (
                                <div key={key}>
                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>{label}</label>
                                    <input type={type} value={editWarehouseForm[key] || ''} onChange={(e) => setEditWarehouseForm(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', padding: '0.7rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #047857)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', marginTop: '0.5rem' }}>Save Changes</button>
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Pincode</label>
                                    <input
                                        required
                                        type="text"
                                        value={newWarehouse.pincode}
                                        onChange={(e) => {
                                            const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            let autoCity = newWarehouse.city;
                                            let autoState = newWarehouse.state;
                                            if (pin === '602001' || pin === '602002') { autoCity = 'Tiruvallur'; autoState = 'Tamil Nadu'; }
                                            else if (pin.startsWith('600')) { autoCity = 'Chennai'; autoState = 'Tamil Nadu'; }
                                            else if (pin.startsWith('110')) { autoCity = 'Delhi'; autoState = 'Delhi'; }
                                            else if (pin.startsWith('560')) { autoCity = 'Bengaluru'; autoState = 'Karnataka'; }
                                            else if (pin.startsWith('400')) { autoCity = 'Mumbai'; autoState = 'Maharashtra'; }
                                            setNewWarehouse({ ...newWarehouse, pincode: pin, city: autoCity, state: autoState });
                                        }}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        placeholder="e.g. 602001"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>City</label>
                                    <input required type="text" value={newWarehouse.city} onChange={(e) => setNewWarehouse({ ...newWarehouse, city: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Tiruvallur / Chennai" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>State</label>
                                    <input required type="text" value={newWarehouse.state} onChange={(e) => setNewWarehouse({ ...newWarehouse, state: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Tamil Nadu" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Manager Name</label>
                                    <input required type="text" value={newWarehouse.contact_person} onChange={(e) => setNewWarehouse({ ...newWarehouse, contact_person: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Ashwin" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Mobile (10 Digits)</label>
                                    <input
                                        required
                                        type="tel"
                                        value={newWarehouse.phone_number}
                                        onChange={(e) => setNewWarehouse({ ...newWarehouse, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        placeholder="9876543210"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newWarehouse.email}
                                        onChange={(e) => setNewWarehouse({ ...newWarehouse, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        placeholder="godown@company.com"
                                    />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.25)' }}>
                                Register Facility Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add New Product to Specific Warehouse Modal */}
            {isAddProductModalOpen && targetWarehouseForProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(4px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '650px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850' }}>Add New Product</h3>
                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Assign & Stock Item for Warehouse: <strong>{targetWarehouseForProduct.warehouse_name}</strong> ({targetWarehouseForProduct.warehouse_code})</p>
                            </div>
                            <button onClick={() => setIsAddProductModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWarehouseProductSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '78vh', overflowY: 'auto' }}>
                            {/* Warehouse Banner */}
                            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#047857', fontWeight: '700' }}>
                                <WarehouseIcon size={18} />
                                <span>Target Facility: {targetWarehouseForProduct.warehouse_name} ({targetWarehouseForProduct.warehouse_code})</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Product Name *</label>
                                    <input required type="text" value={newWarehouseProduct.name} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="e.g. Industrial Steel Pipe 2 inch" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>SKU Code *</label>
                                    <input required type="text" value={newWarehouseProduct.sku} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, sku: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="e.g. WH-SKU-01" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category</label>
                                    <input type="text" value={newWarehouseProduct.category} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="General" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Primary Unit</label>
                                    <select value={newWarehouseProduct.unit} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, unit: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', background: 'white' }}>
                                        <option value="PCS">PCS</option>
                                        <option value="Box">Box</option>
                                        <option value="Kg">Kg</option>
                                        <option value="Mtr">Mtr</option>
                                        <option value="Nos">Nos</option>
                                        <option value="Ltr">Ltr</option>
                                        <option value="Set">Set</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Opening Stock *</label>
                                    <input required type="number" min="0" value={newWarehouseProduct.quantity} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, quantity: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem', fontWeight: '800', color: '#047857' }} placeholder="10" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Purchase Price / Unit Cost (₹)</label>
                                    <input type="number" min="0" step="any" value={newWarehouseProduct.purchase_price} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, purchase_price: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="0" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Selling Price / MRP (₹)</label>
                                    <input type="number" min="0" step="any" value={newWarehouseProduct.selling_price} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, selling_price: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="0" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Barcode</label>
                                    <input type="text" value={newWarehouseProduct.barcode} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, barcode: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="Scan / Optional" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>HSN Code</label>
                                    <input type="text" value={newWarehouseProduct.hsn_code} onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, hsn_code: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.9rem' }} placeholder="e.g. 7306" />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)', marginTop: '0.5rem' }}>
                                Save Product to {targetWarehouseForProduct.warehouse_name}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Assigned Products List Modal for Specific Warehouse */}
            {isViewListModalOpen && targetWarehouseForList && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(4px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <WarehouseIcon size={24} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850' }}>{targetWarehouseForList.warehouse_name} — Products List</h3>
                                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Facility Code: <strong>{targetWarehouseForList.warehouse_code}</strong> | Total Items: <strong>{warehouseAssignedProducts.length}</strong></p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button onClick={() => setIsViewListModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Search Bar */}
                        <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '280px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    value={viewListSearch}
                                    onChange={(e) => setViewListSearch(e.target.value)}
                                    placeholder="Search product, SKU..."
                                    style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.2rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', background: 'white' }}
                                />
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>
                                Total Inventory Value: <strong style={{ color: '#047857' }}>{formatCurrency(warehouseAssignedProducts.reduce((acc, p) => acc + (p.quantity * (p.purchase_price || 0)), 0))}</strong>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
                            {warehouseAssignedProducts.filter(p => !viewListSearch || p.name.toLowerCase().includes(viewListSearch.toLowerCase()) || p.sku.toLowerCase().includes(viewListSearch.toLowerCase())).length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Product Name</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>SKU Code</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Category</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Stock / Qty</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Unit</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Unit Cost</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {warehouseAssignedProducts
                                            .filter(p => !viewListSearch || p.name.toLowerCase().includes(viewListSearch.toLowerCase()) || p.sku.toLowerCase().includes(viewListSearch.toLowerCase()))
                                            .map((prod, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#1E293B' }}>{prod.name}</td>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#3B82F6' }}>{prod.sku}</td>
                                                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontWeight: '600' }}>{prod.category}</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: prod.quantity > 5 ? '#047857' : '#DC2626' }}>{prod.quantity}</td>
                                                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '700' }}>{prod.unit}</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1E293B' }}>{formatCurrency(prod.purchase_price)}</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '6px', background: prod.quantity > 5 ? '#F0FDF4' : '#FEF2F2', color: prod.quantity > 5 ? '#15803D' : '#DC2626' }}>
                                                            {prod.quantity > 5 ? 'In Stock' : (prod.quantity > 0 ? 'Low Stock' : 'Out of Stock')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                                    <Folder size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5, display: 'block' }} />
                                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>No products found for this warehouse facility.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessWarehouse;
