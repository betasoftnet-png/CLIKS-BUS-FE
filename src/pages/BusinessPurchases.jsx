import React, { useState } from 'react';
import { 
    ShoppingCart, 
    Plus, 
    Search, 
    Filter, 
    FileText, 
    ArrowUpRight, 
    ArrowDownRight, 
    PackageOpen,
    Clock,
    CheckCircle2,
    AlertTriangle,
    IndianRupee,
    Truck,
    X,
    TrendingUp,
    Download,
    Layers,
    User,
    Calendar,
    Percent,
    RefreshCw,
    PercentCircle,
    Info,
    ChevronRight,
    MapPin
} from 'lucide-react';
import { paymentsStore } from '../lib/paymentsStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { purchasesService, productsService, suppliersService } from '../services';
import '../App.css';

const BusinessPurchases = () => {
    const [bankAccounts, setBankAccounts] = useState(() => paymentsStore.getBankAccounts());
    const [activeTab, setActiveTab] = useState('purchase-orders'); // 'purchase-orders', 'purchase-bills', 'purchase-returns', 'reports'
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createDocType, setCreateDocType] = useState('PO'); // 'PO', 'BILL', 'RETURN'
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Handle instant PO creation launch via Quick Actions Shortcut
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setCreateDocType('PO');
            setIsCreateModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const queryClient = useQueryClient();

    // Queries
    const { data: allPurchases = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: purchasesService.getPurchases
    });

    // 🚀 Fetch live catalog items and active vendors
    const { data: catalogProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

    const { data: suppliersList = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersService.getSuppliers()
    });

    const purchaseOrders = allPurchases.filter(p => p.doc_type === 'PO');
    const purchaseBills = allPurchases.filter(p => p.doc_type === 'BILL');
    const purchaseReturns = allPurchases.filter(p => p.doc_type === 'RETURN');

    // Mutations
    const createMutation = useMutation({
        mutationFn: purchasesService.createPurchase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            setIsCreateModalOpen(false);
            setFormItems([{
                product_id: '',
                product_name: '',
                sku: '',
                batch_number: '',
                expiry_date: '',
                quantity: 1,
                free_quantity: 0,
                primary_unit: 'pcs',
                purchase_price: 0,
                discount: 0,
                gst_percentage: 18
            }]);
            alert('Purchase document successfully registered!');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => purchasesService.updatePurchase(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            alert('Purchase successfully updated!');
        }
    });

    // 📦 THE MISSING LINK: Automated physical warehouse replenishment
    const processStockMutation = useMutation({
        mutationFn: ({ id, data }) => purchasesService.processStockUpdate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            console.log("Live physical inventories refreshed across target warehouses.");
        }
    });

    // Receive Goods Partial Modal Form state
    const [receiveQuantities, setReceiveQuantities] = useState({});

    // New Document Form States
    const [formHeader, setFormHeader] = useState(() => ({
        purchase_number: `TX-${Date.now().toString().slice(-5)}`,
        purchase_type: 'GST',
        purchase_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        supplier_name: '',
        supplier_gstin: '',
        billing_address: '',
        contact_number: '',
        warehouse_id: 'Main Godown',
        purchase_by: 'Branch Manager',
        payment_mode: 'Cash',
        bank_account_id: '',
        paid_amount: 0,
        advance_amount: 0,
        shipping_charge: 0,
        place_of_supply: 'Maharashtra',
        return_reason: 'Damaged Goods' // for returns
    }));

    const [formItems, setFormItems] = useState([
        {
            product_id: '',
            product_name: '',
            sku: '',
            batch_number: '',
            expiry_date: '',
            quantity: 1,
            free_quantity: 0,
            primary_unit: 'pcs',
            purchase_price: 0,
            discount: 0,
            gst_percentage: 18
        }
    ]);

    const handleAddItemField = () => {
        setFormItems([...formItems, {
            product_id: '',
            product_name: '',
            sku: '',
            batch_number: '',
            expiry_date: '',
            quantity: 1,
            free_quantity: 0,
            primary_unit: 'pcs',
            purchase_price: 0,
            discount: 0,
            gst_percentage: 18
        }]);
    };

    const handleRemoveItemField = (index) => {
        setFormItems(formItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, val) => {
        setFormItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: val } : item));
    };

    // Calculate detailed document summary totals dynamically
    const computeDocTotals = (itemsList, shipping = 0) => {
        let subtotal = 0;
        let total_discount = 0;
        let total_tax = 0;

        itemsList.forEach(item => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.purchase_price) || 0;
            const discPercent = parseFloat(item.discount) || 0;
            const gstPercent = parseFloat(item.gst_percentage) || 0;

            const baseAmount = qty * price;
            const discountAmt = baseAmount * (discPercent / 100);
            const taxableAmt = baseAmount - discountAmt;
            const taxAmt = taxableAmt * (gstPercent / 100);

            subtotal += baseAmount;
            total_discount += discountAmt;
            total_tax += taxAmt;
        });

        const grand_total = subtotal - total_discount + total_tax + (parseFloat(shipping) || 0);
        return {
            subtotal,
            total_discount,
            total_tax,
            grand_total: Math.round(grand_total)
        };
    };

    const handleCreateDocument = (e) => {
        e.preventDefault();
        const totals = computeDocTotals(formItems, formHeader.shipping_charge);

        const docPayload = {
            ...formHeader,
            doc_type: createDocType,
            items: formItems.map(i => ({
                ...i,
                received_quantity: createDocType === 'BILL' ? i.quantity : 0
            })),
            status: createDocType === 'PO' ? 'Approved' : 'paid',
            payment_status: createDocType === 'BILL' ? (parseFloat(formHeader.paid_amount) >= totals.grand_total ? 'paid' : (parseFloat(formHeader.paid_amount) > 0 ? 'partial' : 'pending')) : (totals.grand_total === (parseFloat(formHeader.advance_amount) || 0) ? 'paid' : ((parseFloat(formHeader.advance_amount) || 0) > 0 ? 'partial' : 'pending')),
            paid_amount: createDocType === 'BILL' ? (parseFloat(formHeader.paid_amount) || totals.grand_total) : 0,
            advance_amount: createDocType === 'PO' ? (parseFloat(formHeader.advance_amount) || 0) : 0,
            ...totals
        };

        // Log Expense Transaction for Purchase Bill/Advance Payment
        const paymentAmt = createDocType === 'BILL' ? docPayload.paid_amount : docPayload.advance_amount;
        if (paymentAmt > 0) {
            paymentsStore.addTransaction({
                type: createDocType === 'RETURN' ? 'income' : 'expense',
                reference_type: 'purchase',
                reference_id: formHeader.purchase_number,
                bank_account_id: formHeader.bank_account_id || null,
                amount: paymentAmt,
                payment_method: formHeader.payment_mode ? formHeader.payment_mode.toLowerCase() : 'cash',
                notes: `${createDocType} Payment for procurement ${formHeader.purchase_number}`
            });
            setBankAccounts(paymentsStore.getBankAccounts());
        }

        createMutation.mutate(docPayload);
    };

    const handleOpenReceiveModal = (po) => {
        setSelectedDoc(po);
        const qtyMap = {};
        po.items.forEach((item, idx) => {
            qtyMap[idx] = (item.quantity - item.received_quantity);
        });
        setReceiveQuantities(qtyMap);
        setIsReceiveModalOpen(true);
    };

    const handleCommitGoodsReceived = (e) => {
        e.preventDefault();
        const deltas = selectedDoc.items.map((item, idx) => parseInt(receiveQuantities[idx]) || 0);

        const updatedItems = selectedDoc.items.map((item, idx) => {
            const extraReceived = deltas[idx];
            return {
                ...item,
                received_quantity: Math.min(item.quantity, item.received_quantity + extraReceived)
            };
        });

        const updatedDoc = {
            ...selectedDoc,
            items: updatedItems,
            status: updatedItems.every(i => i.received_quantity >= i.quantity) ? 'Completed' : 'Partial Received'
        };

        updateMutation.mutate({ id: selectedDoc.id, data: updatedDoc }, {
            onSuccess: () => {
                // 🚀 ACTIVATE LEDGER: Update physical counts on the backend with new increment deltas!
                const stockPayload = {
                    warehouse_id: selectedDoc.warehouse_id || 'Main Godown',
                    items: updatedItems.map((i, idx) => ({
                        product_id: i.product_id || i.id || 0,
                        product_name: i.product_name || '',
                        delta_received: deltas[idx],
                        received_quantity: parseInt(i.received_quantity) || 0,
                        sku: i.sku || ''
                    }))
                };
                processStockMutation.mutate({ id: selectedDoc.id, data: stockPayload });

                // Prepare only the items actually received in this batch for the Bill
                const billItems = updatedItems
                    .map((item, idx) => ({
                        ...item,
                        quantity: deltas[idx] // Set quantity to EXACT amount received!
                    }))
                    .filter(item => item.quantity > 0);

                if (billItems.length > 0) {
                    // Auto generate partial bill matching precisely what was received!
                    const totals = computeDocTotals(billItems, selectedDoc.shipping_charge);
                    const autoBill = {
                        purchase_number: `B-${selectedDoc.purchase_number.split('-')[1] || Date.now().toString().slice(-4)}`,
                        purchase_type: selectedDoc.purchase_type,
                        purchase_date: new Date().toISOString().split('T')[0],
                        due_date: selectedDoc.due_date,
                        doc_type: 'BILL',
                        status: 'paid',
                        supplier_id: selectedDoc.supplier_id,
                        supplier_name: selectedDoc.supplier_name,
                        supplier_gstin: selectedDoc.supplier_gstin,
                        billing_address: selectedDoc.billing_address,
                        contact_number: selectedDoc.contact_number,
                        warehouse_id: selectedDoc.warehouse_id,
                        purchase_by: selectedDoc.purchase_by,
                        items: billItems,
                        payment_status: 'paid',
                        paid_amount: totals.grand_total,
                        ...totals
                    };
                    createMutation.mutate(autoBill);
                }

                setIsReceiveModalOpen(false);
                setSelectedDoc(null);
            }
        });
    };

    const filteredPOs = purchaseOrders.filter(po => 
        po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        po.purchase_number.includes(searchTerm)
    );

    const filteredBills = purchaseBills.filter(bill => 
        bill.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bill.purchase_number.includes(searchTerm)
    );

    // Report aggregates (Parse floats explicitly to prevent string concatenation / floating-point leaks)
    const totalOutwardPayments = purchaseBills.reduce((acc, bill) => acc + (parseFloat(bill.grand_total) || 0), 0);
    const activePurchaseOrdersCount = purchaseOrders.filter(po => po.status !== 'Completed').length;
    const inputGstCreditSum = purchaseBills.reduce((acc, b) => acc + (parseFloat(b.total_tax) || 0), 0);
    const totalReturnedRefundsSum = purchaseReturns.reduce((acc, r) => acc + r.returned_items.reduce((sum, item) => sum + (parseFloat(item.refund_amount) || 0), 0), 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <ShoppingCart size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Purchases Hub</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage vendor procurement cycles, GST input tax credits, multi-warehouse receiving, and purchase returns.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => { setCreateDocType('PO'); setFormHeader({ ...formHeader, purchase_number: `PO-${Date.now().toString().slice(-4)}` }); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New PO
                    </button>
                    <button 
                        onClick={() => { setCreateDocType('BILL'); setFormHeader({ ...formHeader, purchase_number: `BILL-${Date.now().toString().slice(-4)}` }); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#3B82F6', border: '1px solid #DBEAFE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New Purchase Bill
                    </button>
                    <button 
                        onClick={() => { setCreateDocType('RETURN'); setFormHeader({ ...formHeader, purchase_number: `RET-${Date.now().toString().slice(-4)}` }); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#8B5CF6', border: '1px solid #EDE9FE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> Purchase Return
                    </button>
                </div>
            </div>

            {/* Vyapar ERP Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Outward Procurement (At Cost)', value: `₹${Math.round(totalOutwardPayments).toLocaleString()}`, icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Active PO Cycles', value: activePurchaseOrdersCount, icon: ShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Claimable Input Tax Credit (ITC)', value: `₹${Number(inputGstCreditSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: PercentCircle, color: '#8B5CF6', bg: '#F5F3FF' },
                    { label: 'Refund Adjustments', value: `₹${Math.round(totalReturnedRefundsSum).toLocaleString()}`, icon: RefreshCw, color: '#10B981', bg: '#ECFDF5' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button 
                    onClick={() => setActiveTab('purchase-orders')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'purchase-orders' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'white', 
                        color: activeTab === 'purchase-orders' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'purchase-orders' ? '0 4px 10px rgba(236, 72, 153, 0.15)' : 'none'
                    }}
                >
                    <ShoppingCart size={16} /> Purchase Orders (PO)
                </button>
                <button 
                    onClick={() => setActiveTab('purchase-bills')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'purchase-bills' ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'white', 
                        color: activeTab === 'purchase-bills' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'purchase-bills' ? '0 4px 10px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                >
                    <FileText size={16} /> Purchase Bills & Invoices
                </button>
                <button 
                    onClick={() => setActiveTab('purchase-returns')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'purchase-returns' ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'white', 
                        color: activeTab === 'purchase-returns' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'purchase-returns' ? '0 4px 10px rgba(139, 92, 246, 0.15)' : 'none'
                    }}
                >
                    <ArrowDownRight size={16} /> Returns (Debit Notes)
                </button>
            </div>

            {/* Tab 1: Purchase Orders (PO) */}
            {activeTab === 'purchase-orders' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or order numbers..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>PO Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier & GST</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Items & Procurement</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Outward Payables</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Receiving Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPOs.map((po) => (
                                    <tr key={po.purchase_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{po.purchase_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {po.purchase_date} | Due: {po.due_date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{po.supplier_name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>GSTIN: {po.supplier_gstin || 'Unregistered'}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {po.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                    <p style={{ fontWeight: '700', color: '#475569' }}>{item.product_name}</p>
                                                    <span style={{ color: '#94A3B8' }}>Ordered: {item.quantity} | Received: {item.received_quantity} {item.primary_unit}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const totals = computeDocTotals(po.items, po.shipping_charge);
                                                return (
                                                    <div>
                                                        <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '1.05rem' }}>₹{totals.grand_total.toLocaleString()}</p>
                                                        <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: '700' }}>Paid Adv: ₹{po.paid_amount.toLocaleString()}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                padding: '0.4rem 0.8rem', borderRadius: '10px',
                                                background: po.status === 'Completed' ? '#F0FDF4' : (po.status === 'Partial Received' ? '#FFFBEB' : '#EFF6FF'),
                                                color: po.status === 'Completed' ? '#15803D' : (po.status === 'Partial Received' ? '#B45309' : '#1D4ED8'),
                                                fontSize: '0.8rem', fontWeight: '800'
                                            }}>
                                                {po.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                {po.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            {po.status !== 'Completed' && (
                                                <button 
                                                    onClick={() => handleOpenReceiveModal(po)}
                                                    style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                                >
                                                    <PackageOpen size={14} /> Receive Goods
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Purchase Bills */}
            {activeTab === 'purchase-bills' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or bill numbers..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Bill Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Itemized Grid</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GST CGST/SGST/IGST</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Grand Total</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Payment Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill.purchase_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{bill.purchase_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {bill.purchase_date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{bill.supplier_name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{bill.billing_address}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {bill.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                    <p style={{ fontWeight: '700', color: '#475569' }}>{item.product_name}</p>
                                                    <span style={{ color: '#94A3B8' }}>Qty: {item.quantity} @ ₹{item.purchase_price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items, bill.shipping_charge);
                                                const singleTax = totals.total_tax / 2;
                                                return (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <p style={{ fontWeight: '700', color: '#1E293B' }}>CGST (9%): ₹{singleTax.toLocaleString()}</p>
                                                        <p style={{ fontWeight: '700', color: '#1E293B' }}>SGST (9%): ₹{singleTax.toLocaleString()}</p>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items, bill.shipping_charge);
                                                return <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#15803D' }}>₹{totals.grand_total.toLocaleString()}</span>;
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: '800' }}>{bill.payment_mode.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Purchase Returns */}
            {activeTab === 'purchase-returns' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.5rem' }}>Purchase Returns & Debit Notes</h2>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Return ID</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Ref Bill</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Reason</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Items Returned</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Refund Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseReturns.map((ret) => (
                                    <tr key={ret.return_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '1.25rem', fontWeight: '850', color: '#B91C1C' }}>{ret.return_id}</td>
                                        <td style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>{ret.purchase_number}</td>
                                        <td style={{ padding: '1.25rem', fontWeight: '750', color: '#1E293B' }}>{ret.supplier_name}</td>
                                        <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>{ret.return_reason}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            {ret.returned_items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                    <p style={{ fontWeight: '700' }}>{item.product_name}</p>
                                                    <span style={{ color: '#94A3B8' }}>Returned: {item.quantity} Units</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '900', color: '#B91C1C' }}>
                                            ₹{ret.returned_items.reduce((sum, i) => sum + i.refund_amount, 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Goods Receiving Partial/Complete Modal */}
            {isReceiveModalOpen && selectedDoc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Verify Goods Received</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Order: {selectedDoc.purchase_number}</p>
                            </div>
                            <button onClick={() => setIsReceiveModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCommitGoodsReceived} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {selectedDoc.items.map((item, idx) => (
                                <div key={idx} style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '1rem', marginBottom: '0.4rem' }}>{item.product_name}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.75rem' }}>
                                        <span>Ordered: {item.quantity}</span>
                                        <span>Already Got: {item.received_quantity}</span>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.4rem' }}>Receive New Quantity</label>
                                        <input 
                                            required 
                                            type="number" 
                                            max={item.quantity - item.received_quantity}
                                            value={receiveQuantities[idx] || 0} 
                                            onChange={(e) => setReceiveQuantities({ ...receiveQuantities, [idx]: parseInt(e.target.value) || 0 })} 
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none', fontWeight: '700' }} 
                                        />
                                    </div>
                                </div>
                            ))}

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Commit Goods & Update Stocks
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Creation Document Modal */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>
                                    {createDocType === 'PO' ? 'New Purchase Order (PO)' : (createDocType === 'BILL' ? 'Register New Purchase Bill' : 'Log Purchase Return (Debit Note)')}
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Doc Reference: {formHeader.purchase_number}</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Supplier Section Header */}
                            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} /> Supplier Metadata</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Supplier Name</label>
                                        <select 
                                            required 
                                            value={formHeader.supplier_id || ''} 
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const supp = suppliersList.find(s => String(s.id || s.supplier_id) === String(selectedId));
                                                if (supp) {
                                                    setFormHeader({ 
                                                        ...formHeader, 
                                                        supplier_id: supp.id || supp.supplier_id,
                                                        supplier_name: supp.name || supp.supplier_name || '',
                                                        supplier_gstin: supp.gstin || supp.gst_number || '',
                                                        billing_address: supp.address || supp.billing_address || '',
                                                        contact_number: supp.phone || supp.mobile || ''
                                                    });
                                                }
                                            }} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#0F172A' }}
                                        >
                                            <option value="">-- Select Active Supplier --</option>
                                            {suppliersList.map(s => (
                                                <option key={s.id || s.supplier_id} value={s.id || s.supplier_id}>{s.name || s.supplier_name} {s.company_name ? `(${s.company_name})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GSTIN Number</label>
                                        <input type="text" value={formHeader.supplier_gstin} onChange={(e) => setFormHeader({ ...formHeader, supplier_gstin: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="27AAAAA1111A1Z1" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Billing Address</label>
                                        <input type="text" value={formHeader.billing_address} onChange={(e) => setFormHeader({ ...formHeader, billing_address: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Supplier HQ Address" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Contact Phone</label>
                                        <input type="text" value={formHeader.contact_number} onChange={(e) => setFormHeader({ ...formHeader, contact_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="+91 99881..." />
                                    </div>
                                </div>
                            </div>

                            {/* Document Meta Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Tax Mode</label>
                                    <select value={formHeader.purchase_type} onChange={(e) => setFormHeader({ ...formHeader, purchase_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="GST">GST Tax Registered</option>
                                        <option value="Non-GST">Non-GST Bill</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Purchase Date</label>
                                    <input required type="date" value={formHeader.purchase_date} onChange={(e) => setFormHeader({ ...formHeader, purchase_date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Due Date</label>
                                    <input required type="date" value={formHeader.due_date} onChange={(e) => setFormHeader({ ...formHeader, due_date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Target Warehouse</label>
                                    <input type="text" value={formHeader.warehouse_id} onChange={(e) => setFormHeader({ ...formHeader, warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Main Godown" />
                                </div>
                            </div>

                            {/* Itemized Grid Section */}
                            <div style={{ background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase' }}><Layers size={16} /> Itemized Products</h4>
                                    <button type="button" onClick={handleAddItemField} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Row</button>
                                </div>

                                {formItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Product Name</label>
                                            <select 
                                                required 
                                                value={item.product_id || ''} 
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const prod = catalogProducts.find(p => String(p.id || p.product_id) === String(selectedId));
                                                    if (prod) {
                                                        // Atomic Batch State Update to prevent React async clobbering
                                                        setFormItems(prev => prev.map((formItem, itemIdx) => 
                                                            itemIdx === idx ? { 
                                                                ...formItem, 
                                                                product_id: prod.id || prod.product_id,
                                                                product_name: prod.name || prod.product_name,
                                                                sku: prod.sku || '',
                                                                purchase_price: parseFloat(prod.purchase_price || prod.price || 0),
                                                                primary_unit: prod.primary_unit || 'pcs'
                                                            } : formItem
                                                        ));
                                                    }
                                                }} 
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none', background: 'white', fontWeight: '700', color: '#1B6B3A' }}
                                            >
                                                <option value="">-- Select Product --</option>
                                                {catalogProducts.map(p => (
                                                    <option key={p.id || p.product_id} value={p.id || p.product_id}>{p.name || p.product_name} {p.sku ? `[${p.sku}]` : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>SKU</label>
                                            <input type="text" value={item.sku} onChange={(e) => handleItemChange(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} placeholder="IPH-15" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Purchase Cost (₹)</label>
                                            <input required type="number" value={item.purchase_price} onChange={(e) => handleItemChange(idx, 'purchase_price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Qty</label>
                                            <input required type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Discount %</label>
                                            <input type="number" value={item.discount} onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>GST %</label>
                                            <select value={item.gst_percentage} onChange={(e) => handleItemChange(idx, 'gst_percentage', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }}>
                                                <option value={0}>0%</option>
                                                <option value={5}>5%</option>
                                                <option value={12}>12%</option>
                                                <option value={18}>18%</option>
                                                <option value={28}>28%</option>
                                            </select>
                                        </div>
                                        {formItems.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveItemField(idx)} style={{ border: 'none', background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer' }}><X size={16} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Additional return specifics */}
                            {createDocType === 'RETURN' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason for Return</label>
                                    <input type="text" value={formHeader.return_reason} onChange={(e) => setFormHeader({ ...formHeader, return_reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Damaged Goods / Wrong Item Shipped" />
                                </div>
                            )}

                            {/* Summaries & Action buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Payment Mode</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {['Cash', 'UPI', 'Bank', 'Credit'].map(mode => (
                                                <button 
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => {
                                                        const totals = computeDocTotals(formItems, formHeader.shipping_charge);
                                                        const paid = mode === 'Credit' ? 0 : totals.grand_total;
                                                        setFormHeader({
                                                            ...formHeader, 
                                                            payment_mode: mode,
                                                            paid_amount: paid,
                                                            advance_amount: mode === 'Credit' ? 0 : (createDocType === 'PO' ? 10000 : paid)
                                                        });
                                                    }}
                                                    style={{ 
                                                        flex: 1, padding: '0.75rem', borderRadius: '12px', 
                                                        border: formHeader.payment_mode === mode ? '2px solid #1B6B3A' : '1px solid #DCF2E4',
                                                        background: formHeader.payment_mode === mode ? '#1B6B3A' : 'white',
                                                        color: formHeader.payment_mode === mode ? 'white' : '#1B6B3A',
                                                        fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Select Bank Account Dropdown (Conditionally Rendered) */}
                                    {(formHeader.payment_mode === 'Bank' || formHeader.payment_mode === 'UPI') && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Select Bank Account</label>
                                            <select 
                                                required
                                                value={formHeader.bank_account_id}
                                                onChange={(e) => setFormHeader({...formHeader, bank_account_id: e.target.value})}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #DCF2E4', background: 'white' }}
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {bankAccounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.bank_name} - ₹{acc.current_balance.toLocaleString()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {createDocType === 'PO' ? (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Advance Payment Amount (₹)</label>
                                            <input type="number" value={formHeader.advance_amount} onChange={(e) => setFormHeader({ ...formHeader, advance_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem' }}>Entering an advance payment logs instant cash outflows dynamically.</p>
                                        </div>
                                    ) : createDocType === 'BILL' ? (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid Amount (₹)</label>
                                            <input type="number" value={formHeader.paid_amount || 0} onChange={(e) => setFormHeader({ ...formHeader, paid_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </div>
                                    ) : null}
                                </div>

                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {(() => {
                                        const totals = computeDocTotals(formItems, formHeader.shipping_charge);
                                        return (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748B' }}>Subtotal:</span>
                                                    <span style={{ fontWeight: '700' }}>₹{totals.subtotal.toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748B' }}>Total Discount:</span>
                                                    <span style={{ fontWeight: '700', color: '#EF4444' }}>- ₹{totals.total_discount.toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748B' }}>Input Tax (GST):</span>
                                                    <span style={{ fontWeight: '700' }}>₹{totals.total_tax.toLocaleString()}</span>
                                                </div>
                                                <div style={{ height: '1px', background: '#E2E8F0', margin: '0.25rem 0' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1B6B3A' }}>
                                                    <span style={{ fontWeight: '800' }}>Grand Total Due:</span>
                                                    <span style={{ fontWeight: '950', fontSize: '1.15rem' }}>₹{totals.grand_total.toLocaleString()}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Save & Complete Purchase Document
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPurchases;
