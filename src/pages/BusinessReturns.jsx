import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import FilterableTableHead from '../components/FilterableTableHead';
import { 
    ArrowDownRight, 
    Plus, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    X, 
    TrendingUp, 
    Download, 
    Layers, 
    User, 
    Calendar, 
    PercentCircle, 
    Info, 
    ChevronRight, 
    MapPin, 
    Package, 
    AlertTriangle, 
    RefreshCw, 
    FileText, 
    ShoppingCart, 
    ShieldAlert, 
    Wrench,
    Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { returnsService } from '../services/returnsService';
import { billingService } from '../services/billingService';
import { purchasesService } from '../services/purchasesService';
import '../App.css';
import { useCurrency } from '../context';

const BusinessReturns = () => {
    const { currency, formatCurrency } = useCurrency();
    const [activeTab, setActiveTab] = useState('sales');
    const [colFilters, setColFilters] = React.useState({}); // 'sales', 'purchase', 'warranty', 'stock'
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createReturnType, setCreateReturnType] = useState('sales'); // 'sales' or 'purchase'
    const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    // Inspection status state
    const [inspectionForm, setInspectionForm] = useState({
        damaged_qty: 0,
        resaleable_qty: 0,
        notes: '',
        approved_by: 'Manager (Procurement)'
    });

    const queryClient = useQueryClient();

    // Queries
    const { data: allReturns = [], isLoading } = useQuery({
        queryKey: ['returns'],
        queryFn: returnsService.getReturns
    });

    const salesReturns = allReturns.filter(r => r.return_type === 'sales');
    const purchaseReturns = allReturns.filter(r => r.return_type === 'purchase');

    // Load Invoices and Purchases
    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: billingService.getInvoices
    });

    const { data: purchases = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: purchasesService.getPurchases
    });

    const purchaseBills = purchases.filter(p => p.doc_type === 'BILL');

    // Mutations
    const createMutation = useMutation({
        mutationFn: returnsService.createReturn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            setIsCreateModalOpen(false);
            setFormItems([{
                product_name: '',
                batch_number: '',
                serial_number: '',
                return_quantity: 1,
                replacement_quantity: 0,
                price: 0,
                gst_percentage: 18
            }]);
            alert('Return successfully logged!');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => returnsService.updateReturn(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            setIsInspectionModalOpen(false);
            setSelectedReturn(null);
            alert('Quality Check completed and updated successfully!');
        }
    });

    // Form inputs for new return
    const [formHeader, setFormHeader] = useState(() => ({
        return_number: `RN-${Date.now().toString().slice(-4)}`,
        invoice_id: '',
        purchase_id: '',
        customer_name: '',
        supplier_name: '',
        return_date: new Date().toISOString().split('T')[0],
        refund_mode: 'Cash',
        reason_code: 'Damaged Item',
        warehouse_id: 'Main Godown'
    }));

    const [formItems, setFormItems] = useState([
        {
            product_name: '',
            batch_number: '',
            serial_number: '',
            return_quantity: 1,
            replacement_quantity: 0,
            price: 0,
            gst_percentage: 18
        }
    ]);

    // Helpers to get selected document items
    const getSelectedInvoiceItems = () => {
        if (!formHeader.invoice_id) return [];
        const selectedInv = invoices.find(inv => 
            inv.invoice_number?.toString() === formHeader.invoice_id?.toString() || 
            inv.id?.toString() === formHeader.invoice_id?.toString()
        );
        if (!selectedInv) return [];
        return selectedInv.items ? (typeof selectedInv.items === 'string' ? JSON.parse(selectedInv.items) : selectedInv.items) : [];
    };

    const getSelectedPurchaseItems = () => {
        if (!formHeader.purchase_id) return [];
        const selectedPurch = purchaseBills.find(purch => 
            purch.purchase_number?.toString() === formHeader.purchase_id?.toString() || 
            purch.id?.toString() === formHeader.purchase_id?.toString()
        );
        if (!selectedPurch) return [];
        return selectedPurch.items || [];
    };

    const handleInvoiceChange = (invoiceId) => {
        const selectedInv = invoices.find(inv => 
            inv.id?.toString() === invoiceId.toString() || 
            inv.invoice_number?.toString() === invoiceId.toString()
        );
        
        setFormHeader(prev => ({
            ...prev,
            invoice_id: invoiceId,
            customer_name: selectedInv ? (selectedInv.customer_name || '') : ''
        }));
        
        // Reset item rows to a single blank row
        setFormItems([
            {
                product_name: '',
                batch_number: '',
                serial_number: '',
                return_quantity: 1,
                replacement_quantity: 0,
                price: 0,
                gst_percentage: 18
            }
        ]);
    };

    const handlePurchaseChange = (purchaseId) => {
        const selectedPurch = purchaseBills.find(purch => 
            purch.id?.toString() === purchaseId.toString() || 
            purch.purchase_number?.toString() === purchaseId.toString()
        );
        
        setFormHeader(prev => ({
            ...prev,
            purchase_id: purchaseId,
            supplier_name: selectedPurch ? (selectedPurch.supplier_name || '') : ''
        }));
        
        // Reset item rows to a single blank row
        setFormItems([
            {
                product_name: '',
                batch_number: '',
                serial_number: '',
                return_quantity: 1,
                replacement_quantity: 0,
                price: 0,
                gst_percentage: 18
            }
        ]);
    };

    const handleProductSelect = (index, prodName) => {
        let price = 0;
        let gst = 18;
        let batchNumber = '';
        
        if (createReturnType === 'sales') {
            const items = getSelectedInvoiceItems();
            const matched = items.find(item => (item.description || item.product_name || item.name) === prodName);
            if (matched) {
                price = matched.price || matched.rate || 0;
                gst = matched.tax_rate || matched.gst || matched.gst_percentage || 18;
                batchNumber = matched.batch_number || '';
            }
        } else {
            const items = getSelectedPurchaseItems();
            const matched = items.find(item => (item.product_name || item.name) === prodName);
            if (matched) {
                price = matched.purchase_price || matched.price || 0;
                gst = matched.gst_percentage || matched.gst || matched.tax_rate || 18;
                batchNumber = matched.batch_number || '';
            }
        }

        setFormItems(formItems.map((item, idx) => 
            idx === index 
                ? { ...item, product_name: prodName, price, gst_percentage: gst, batch_number: batchNumber } 
                : item
        ));
    };

    const handleAddItemRow = () => {
        setFormItems([...formItems, {
            product_name: '',
            batch_number: '',
            serial_number: '',
            return_quantity: 1,
            replacement_quantity: 0,
            price: 0,
            gst_percentage: 18
        }]);
    };

    const handleRemoveItemRow = (index) => {
        setFormItems(formItems.filter((_, i) => i !== index));
    };

    const handleItemFieldChange = (index, field, val) => {
        setFormItems(formItems.map((item, idx) => idx === index ? { ...item, [field]: val } : item));
    };

    const calculateTotals = (itemsList) => {
        let subtotal = 0;
        let totalTax = 0;
        itemsList.forEach(item => {
            const qty = parseFloat(item.return_quantity) || 0;
            const price = parseFloat(item.price) || 0;
            const gst = parseFloat(item.gst_percentage) || 0;
            const itemBase = qty * price;
            const itemTax = itemBase * (gst / 100);
            subtotal += itemBase;
            totalTax += itemTax;
        });
        return {
            subtotal,
            totalTax,
            grandTotal: Math.round(subtotal + totalTax)
        };
    };

    const handleCreateReturn = (e) => {
        e.preventDefault();
        const totals = calculateTotals(formItems);

        const payload = {
            return_number: formHeader.return_number,
            return_type: createReturnType,
            return_date: formHeader.return_date,
            status: createReturnType === 'sales' ? 'Pending' : 'Completed',
            invoice_id: createReturnType === 'sales' ? formHeader.invoice_id : null,
            purchase_id: createReturnType === 'purchase' ? formHeader.purchase_id : null,
            customer_name: createReturnType === 'sales' ? formHeader.customer_name : null,
            supplier_name: createReturnType === 'purchase' ? formHeader.supplier_name : null,
            refund_amount: totals.grandTotal,
            adjustment_amount: totals.grandTotal,
            tax_adjustment: totals.totalTax,
            refund_mode: formHeader.refund_mode,
            refund_status: createReturnType === 'sales' ? 'pending' : 'completed',
            reason_code: formHeader.reason_code,
            inspection_status: createReturnType === 'sales' ? 'Pending Check' : 'Damaged Segregation',
            warehouse_id: formHeader.warehouse_id,
            items: formItems.map(i => ({
                product_name: i.product_name,
                batch_number: i.batch_number,
                serial_number: i.serial_number,
                return_quantity: i.return_quantity,
                replacement_quantity: i.replacement_quantity,
                price: i.price,
                gst_percentage: i.gst_percentage,
                tax_amount: (i.return_quantity * i.price) * (i.gst_percentage / 100),
                total: (i.return_quantity * i.price) * (1 + i.gst_percentage / 100)
            }))
        };

        createMutation.mutate(payload);
    };

    const handleOpenInspection = (ret) => {
        setSelectedReturn(ret);
        setInspectionForm({
            damaged_qty: 0,
            resaleable_qty: ret.items[0]?.return_quantity || 1,
            notes: '',
            approved_by: 'Quality Head (Mumbai)'
        });
        setIsInspectionModalOpen(true);
    };

    const handleSaveInspection = (e) => {
        e.preventDefault();
        const payload = {
            status: 'Completed',
            inspection_status: inspectionForm.damaged_qty > 0 ? 'Damaged Segregation' : 'Resaleable',
            refund_status: 'completed',
            refund_date: new Date().toISOString().split('T')[0]
        };

        updateMutation.mutate({ id: selectedReturn.id, data: payload });
    };

    const filteredSalesReturns = salesReturns.filter(sr => 
        (sr.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sr.return_number || '').includes(searchTerm)
    );

    const filteredPurchaseReturns = purchaseReturns.filter(pr => 
        (pr.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pr.return_number || '').includes(searchTerm)
    );

    // Dynamic stats
    const totalSalesReturnedAmt = salesReturns.reduce((acc, sr) => acc + sr.refund_amount, 0);
    const totalPurchaseReturnedAmt = purchaseReturns.reduce((acc, pr) => acc + pr.refund_amount, 0);
    const pendingInspectionsCount = salesReturns.filter(sr => sr.inspection_status === 'Pending Check').length;

    // Derive active warranty / replacement claims across all loaded returns
    const warrantyClaims = [];
    allReturns.forEach(ret => {
        (ret.items || []).forEach(item => {
            if (item.replacement_quantity > 0) {
                warrantyClaims.push({
                    id: `WARR-${ret.id}-${item.id}`,
                    customer: ret.customer_name || ret.supplier_name || 'N/A',
                    product: item.product_name,
                    qty: item.replacement_quantity,
                    status: ret.status
                });
            }
        });
    });

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <ArrowDownRight size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Returns & Debit Notes</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage customer sales returns, defective supplier returns, replacements, credit notes, and damage segregation.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => { 
                            setCreateReturnType('sales'); 
                            setFormHeader({
                                return_number: `SRN-${Date.now().toString().slice(-4)}`,
                                invoice_id: '',
                                purchase_id: '',
                                customer_name: '',
                                supplier_name: '',
                                return_date: new Date().toISOString().split('T')[0],
                                refund_mode: 'Cash',
                                reason_code: 'Damaged Item',
                                warehouse_id: 'Main Godown'
                            });
                            setFormItems([{
                                product_name: '',
                                batch_number: '',
                                serial_number: '',
                                return_quantity: 1,
                                replacement_quantity: 0,
                                price: 0,
                                gst_percentage: 18
                            }]);
                            setIsCreateModalOpen(true); 
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New Customer Return
                    </button>
                    <button 
                        onClick={() => { 
                            setCreateReturnType('purchase'); 
                            setFormHeader({
                                return_number: `PRN-${Date.now().toString().slice(-4)}`,
                                invoice_id: '',
                                purchase_id: '',
                                customer_name: '',
                                supplier_name: '',
                                return_date: new Date().toISOString().split('T')[0],
                                refund_mode: 'Cash',
                                reason_code: 'Damaged Item',
                                warehouse_id: 'Main Godown'
                            });
                            setFormItems([{
                                product_name: '',
                                batch_number: '',
                                serial_number: '',
                                return_quantity: 1,
                                replacement_quantity: 0,
                                price: 0,
                                gst_percentage: 18
                            }]);
                            setIsCreateModalOpen(true); 
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#3B82F6', border: '1px solid #DBEAFE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New Supplier Return
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Customer Refunds (Sales)', value: formatCurrency(totalSalesReturnedAmt), icon: ArrowDownRight, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Recovered from Suppliers', value: formatCurrency(totalPurchaseReturnedAmt), icon: RefreshCw, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Pending Inspections', value: pendingInspectionsCount, icon: ShieldAlert, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'Stock Recalculations', value: 'Active', icon: Activity, color: '#10B981', bg: '#ECFDF5' }
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

            {/* Navigation Switchers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button 
                    onClick={() => setActiveTab('sales')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'sales' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'white', 
                        color: activeTab === 'sales' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'sales' ? '0 4px 10px rgba(236, 72, 153, 0.15)' : 'none'
                    }}
                >
                    <Package size={16} /> Sales Returns (Customers)
                </button>
                <button 
                    onClick={() => setActiveTab('purchase')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'purchase' ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'white', 
                        color: activeTab === 'purchase' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'purchase' ? '0 4px 10px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                >
                    <ShoppingCart size={16} /> Purchase Returns (Suppliers)
                </button>
                <button 
                    onClick={() => setActiveTab('warranty')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'warranty' ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'white', 
                        color: activeTab === 'warranty' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'warranty' ? '0 4px 10px rgba(139, 92, 246, 0.15)' : 'none'
                    }}
                >
                    <Wrench size={16} /> Warranty & Replacement Claims
                </button>
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: '#064E3B' }} />
                </div>
            )}

            {/* Tab 1: Sales Returns */}
            {activeTab === 'sales' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search customers or return numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'return_ref', label: 'Return Ref', placeholder: 'e.g. RET-001' },
        { key: 'original_invoice', label: 'Original Inv', placeholder: 'INV-' },
        { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
        { key: 'items_returned', label: 'Items Returned', placeholder: 'Item' },
        { key: 'refund_mode', label: 'Refund Mode', placeholder: 'e.g. UPI' },
        { key: 'inspection', label: 'Inspection', placeholder: 'Status' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Approved' }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredSalesReturns.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((sr) => (
                                    <tr key={sr.id || sr.return_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{sr.return_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {sr.return_date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontWeight: '700', color: '#475569' }}>{sr.invoice_id}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{sr.customer_name}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {sr.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                    <p style={{ fontWeight: '700', color: '#475569' }}>{item.product_name}</p>
                                                    <span style={{ color: '#94A3B8' }}>Qty: {item.return_quantity} | Serials: {item.serial_number || 'None'}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '850', color: '#064E3B' }}>{formatCurrency(sr.refund_amount)}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Mode: {sr.refund_mode}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                background: sr.inspection_status === 'Resaleable' ? '#F0FDF4' : (sr.inspection_status === 'Pending Check' ? '#FFFBEB' : '#FEF2F2'),
                                                color: sr.inspection_status === 'Resaleable' ? '#15803D' : (sr.inspection_status === 'Pending Check' ? '#B45309' : '#EF4444'),
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>{sr.inspection_status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                background: sr.status === 'Completed' ? '#F0FDF4' : '#EFF6FF',
                                                color: sr.status === 'Completed' ? '#15803D' : '#1D4ED8',
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>{sr.status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            {sr.status !== 'Completed' && (
                                                <button 
                                                    onClick={() => handleOpenInspection(sr)}
                                                    style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >Verify Quality</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Purchase Returns */}
            {activeTab === 'purchase' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or return numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'return_ref', label: 'Return Ref', placeholder: 'e.g. RET-001' },
        { key: 'original_invoice', label: 'Original Inv', placeholder: 'INV-' },
        { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
        { key: 'items_returned', label: 'Items Returned', placeholder: 'Item' },
        { key: 'refund_mode', label: 'Refund Mode', placeholder: 'e.g. UPI' },
        { key: 'inspection', label: 'Inspection', placeholder: 'Status' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Approved' }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredPurchaseReturns.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((pr) => (
                                    <tr key={pr.id || pr.return_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{pr.return_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {pr.return_date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontWeight: '700', color: '#475569' }}>{pr.purchase_id}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.9rem' }}>{pr.supplier_name}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {pr.items.map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                    <p style={{ fontWeight: '700', color: '#475569' }}>{item.product_name}</p>
                                                    <span style={{ color: '#94A3B8' }}>Qty returned: {item.return_quantity}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: '850', color: '#B91C1C' }}>{formatCurrency(pr.refund_amount)}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                background: '#FEF2F2', color: '#EF4444', fontSize: '0.75rem', fontWeight: '800'
                                            }}>{pr.inspection_status.toUpperCase()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Warranty claims */}
            {activeTab === 'warranty' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Wrench size={24} style={{ color: '#064E3B' }} />
                        <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#064E3B' }}>Warranty & Replacements Tracking</h2>
                    </div>
                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '1.25rem', borderRadius: '16px', color: '#B45309', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2rem' }}>
                        When products are returned as defective under warranty, they are marked for replacement. Our inventory automatically tracks exchange replacement stock separately to prevent margin dilution.
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Warranty ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Customer Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Product Description</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Exchange Qty</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Action Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warrantyClaims.length > 0 ? (
                                warrantyClaims.map((claim, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1rem', fontWeight: '750' }}>{claim.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>{claim.customer}</td>
                                        <td style={{ padding: '1rem' }}>{claim.product}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#B45309' }}>{claim.qty} Units</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: claim.status === 'Completed' ? '#F0FDF4' : '#FEF3C7', color: claim.status === 'Completed' ? '#15803D' : '#B45309', fontWeight: '800', fontSize: '0.75rem' }}>
                                                {claim.status === 'Completed' ? 'REPLACEMENT ISSUED' : 'REPLACEMENT PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>No active replacement claims found in system database.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            </div>
            {/* Quality Check Verification Modal */}
            {isInspectionModalOpen && selectedReturn && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Verify Returned Quality</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Return No: {selectedReturn.return_number}</p>
                            </div>
                            <button onClick={() => setIsInspectionModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSaveInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Resaleable Quantity</label>
                                <input required type="number" value={inspectionForm.resaleable_qty} onChange={(e) => setInspectionForm({ ...inspectionForm, resaleable_qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Damaged Stock Quantity (To Segregation)</label>
                                <input required type="number" value={inspectionForm.damaged_qty} onChange={(e) => setInspectionForm({ ...inspectionForm, damaged_qty: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Quality Check Comments</label>
                                <textarea value={inspectionForm.notes} onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '80px' }} placeholder="Optional notes on item condition..." />
                            </div>

                            <button 
                                type="submit" 
                                disabled={updateMutation.isPending}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    background: updateMutation.isPending ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '1.1rem', 
                                    cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', 
                                    boxShadow: updateMutation.isPending ? 'none' : '0 10px 20px rgba(27, 107, 58, 0.2)' 
                                }}
                            >
                                {updateMutation.isPending ? 'Approving Quality...' : 'Approve Quality & Adjust Stock'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Return Document Modal */}
            {isCreateModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '780px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>
                                    {createReturnType === 'sales' ? 'Log Sales Return (Customer Credit Note)' : 'Log Purchase Return (Supplier Debit Note)'}
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Doc Reference: {formHeader.return_number}</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateReturn} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* Metadata section */}
                            <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {createReturnType === 'sales' ? (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Invoice ID</label>
                                            <select
                                                required
                                                value={formHeader.invoice_id}
                                                onChange={(e) => handleInvoiceChange(e.target.value)}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                            >
                                                <option value="">Select Invoice</option>
                                                {invoices.map(inv => (
                                                    <option key={inv.id} value={inv.invoice_number || inv.id}>
                                                        {inv.invoice_number || inv.id} ({inv.customer_name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Customer Name</label>
                                            <input 
                                                required 
                                                disabled 
                                                type="text" 
                                                value={formHeader.customer_name} 
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F1F5F9', cursor: 'not-allowed' }} 
                                                placeholder="Select invoice to populate" 
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Original Purchase Bill ID</label>
                                            <select
                                                required
                                                value={formHeader.purchase_id}
                                                onChange={(e) => handlePurchaseChange(e.target.value)}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}
                                            >
                                                <option value="">Select Purchase Bill</option>
                                                {purchaseBills.map(purch => (
                                                    <option key={purch.id} value={purch.purchase_number || purch.id}>
                                                        {purch.purchase_number || purch.id} ({purch.supplier_name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Supplier Name</label>
                                            <input 
                                                required 
                                                disabled 
                                                type="text" 
                                                value={formHeader.supplier_name} 
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F1F5F9', cursor: 'not-allowed' }} 
                                                placeholder="Select purchase bill to populate" 
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Return Date</label>
                                    <input required type="date" value={formHeader.return_date} onChange={(e) => setFormHeader({ ...formHeader, return_date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            {/* Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Refund / Credit Mode</label>
                                    <select value={formHeader.refund_mode} onChange={(e) => setFormHeader({ ...formHeader, refund_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>Cash</option>
                                        <option>UPI</option>
                                        <option>Bank Transfer</option>
                                        <option>Store Credit</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason for Return</label>
                                    <input type="text" value={formHeader.reason_code} onChange={(e) => setFormHeader({ ...formHeader, reason_code: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Defective Screen / Damage" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Return Warehouse</label>
                                    <input type="text" value={formHeader.warehouse_id} onChange={(e) => setFormHeader({ ...formHeader, warehouse_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Main Godown" />
                                </div>
                            </div>

                            {/* Item Rows */}
                            <div style={{ background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px', border: '1px solid #DCF2E4', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase' }}><Layers size={16} /> Return Products List</h4>
                                    <button type="button" onClick={handleAddItemRow} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#1B6B3A', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>+ Add Product</button>
                                </div>

                                {formItems.map((item, idx) => {
                                    const availableItems = createReturnType === 'sales' ? getSelectedInvoiceItems() : getSelectedPurchaseItems();
                                    return (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Item Name</label>
                                                <select
                                                    required
                                                    value={item.product_name}
                                                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }}
                                                >
                                                    <option value="">Select Product</option>
                                                    {availableItems.map((availItem, aIdx) => {
                                                        const pName = availItem.description || availItem.product_name || availItem.name || '';
                                                        return (
                                                            <option key={aIdx} value={pName}>
                                                                {pName}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Batch No</label>
                                                <input type="text" value={item.batch_number} onChange={(e) => handleItemFieldChange(idx, 'batch_number', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} placeholder="B-DEL-9" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Serial No</label>
                                                <input type="text" value={item.serial_number} onChange={(e) => handleItemFieldChange(idx, 'serial_number', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} placeholder="S-4412" />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Returned Qty</label>
                                                <input required type="number" value={item.return_quantity} onChange={(e) => handleItemFieldChange(idx, 'return_quantity', parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Cost Price ({currency.symbol})</label>
                                                <input required type="number" value={item.price} onChange={(e) => handleItemFieldChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} />
                                            </div>
                                            {formItems.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveItemRow(idx)} style={{ border: 'none', background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer' }}><X size={16} /></button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary panel */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontWeight: '800', color: '#1E293B' }}>Grand Total Refund / Credit Note Due:</span>
                                {(() => {
                                    const totals = calculateTotals(formItems);
                                    return <span style={{ fontWeight: '950', fontSize: '1.25rem', color: '#1B6B3A' }}>{formatCurrency(totals.grandTotal)}</span>;
                                })()}
                            </div>

                            <button 
                                type="submit" 
                                disabled={createMutation.isPending}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '16px', 
                                    background: createMutation.isPending ? '#94A3B8' : 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    fontSize: '1.1rem', 
                                    cursor: createMutation.isPending ? 'not-allowed' : 'pointer', 
                                    boxShadow: createMutation.isPending ? 'none' : '0 10px 20px rgba(27, 107, 58, 0.2)' 
                                }}
                            >
                                {createMutation.isPending ? 'Completing Return...' : 'Complete Return Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessReturns;
