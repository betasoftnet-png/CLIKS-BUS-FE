import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import FilterableTableHead from '../components/FilterableTableHead';
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
    MapPin,
    MessageCircle,
    Send,
    Globe,
    ShieldCheck
} from 'lucide-react';
import { paymentsStore } from '../lib/paymentsStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { purchasesService, productsService, suppliersService, settingsService, returnsService, warehouseService } from '../services';
import '../App.css';
import { useCurrency } from '../context';

const BusinessPurchases = () => {
    const { currency, formatCurrency } = useCurrency();
    const [bankAccounts, setBankAccounts] = useState([]);
    React.useEffect(() => {
        paymentsStore.getBankAccounts().then(res => setBankAccounts(Array.isArray(res) ? res : []));
    }, []);
    const [activeTab, setActiveTab] = useState('purchase-orders');
    const [colFilters, setColFilters] = React.useState({}); // 'purchase-orders', 'purchase-bills', 'purchase-returns', 'reports'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createDocType, setCreateDocType] = useState('PO'); // 'PO', 'BILL', 'RETURN'
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [pendingReceiveBill, setPendingReceiveBill] = useState(null);
    const [selectedReceiveWarehouse, setSelectedReceiveWarehouse] = useState('Main Godown');

    // Supplier Confirmation View & Chat states
    const [isSupplierViewModalOpen, setIsSupplierViewModalOpen] = useState(false);
    const [supplierViewPO, setSupplierViewPO] = useState(null);
    const [isConfirmingPO, setIsConfirmingPO] = useState(false);
    const [supplierResponseMode, setSupplierResponseMode] = useState('CONFIRMED');
    const [expectedAvailableDate, setExpectedAvailableDate] = useState('');
    const [itemAvailableQtys, setItemAvailableQtys] = useState({});

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatSupplier, setChatSupplier] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Fetch customization settings dynamically to enforce master configurations
    const { data: userSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const activeConfig = React.useMemo(() => userSettings?.data || userSettings || {}, [userSettings]);

    // Handle instant PO/Bill/Return creation and tab deep linking via Quick Actions Shortcut
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        const create = searchParams.get('create');
        const tab = searchParams.get('tab');
        
        if (tab && ['purchase-orders', 'purchase-bills', 'supplier-returns'].includes(tab)) {
            setActiveTab(tab);
        } else if (tab === 'purchase-returns') {
            setActiveTab('supplier-returns');
        }
        
        if (create === 'true') {
            const type = searchParams.get('type') || 'PO';
            setCreateDocType(type.toUpperCase());
            setIsCreateModalOpen(true);
            
            // Clean up create params, keeping tab if present
            const newParams = {};
            if (tab) newParams.tab = tab;
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Helper handlers for Supplier confirmation & Chat
    const handleOpenSupplierView = (po) => {
        setSupplierViewPO(po);
        setSupplierResponseMode(po.supplier_response_type || po.supplier_confirmation_status || 'CONFIRMED');
        setExpectedAvailableDate(po.expected_available_date || '');
        const initialQtys = {};
        if (po.items && Array.isArray(po.items)) {
            po.items.forEach((it, idx) => {
                initialQtys[idx] = it.available_quantity !== undefined && it.available_quantity !== null ? it.available_quantity : it.quantity;
            });
        }
        setItemAvailableQtys(initialQtys);
        setIsSupplierViewModalOpen(true);
    };

    const handleConfirmPOBySupplier = async (poId, responseTypeOverride) => {
        const mode = responseTypeOverride || supplierResponseMode || 'CONFIRMED';
        setIsConfirmingPO(true);
        try {
            const payloadItems = (supplierViewPO?.items || []).map((it, idx) => ({
                ...it,
                available_quantity: mode === 'PARTIALLY_AVAILABLE' ? (parseFloat(itemAvailableQtys[idx]) || 0) : (mode === 'NOT_AVAILABLE' ? 0 : it.quantity),
                item_availability_status: mode
            }));

            let notes = 'Supplier has confirmed your order.';
            if (mode === 'PARTIALLY_AVAILABLE') {
                notes = 'Supplier can provide only a smaller quantity.';
            } else if (mode === 'NOT_AVAILABLE') {
                notes = 'Product not available — Waiting for buyer response.';
            } else if (mode === 'AVAILABLE_LATER') {
                notes = expectedAvailableDate ? `Waiting for supplier — Available on ${expectedAvailableDate}.` : 'Waiting for supplier — Expected to become available later.';
            }

            const payload = {
                response_type: mode,
                expected_available_date: mode === 'AVAILABLE_LATER' ? expectedAvailableDate : null,
                notes,
                items: payloadItems
            };

            const targetId = poId || supplierViewPO?.id || supplierViewPO?.purchase_id || supplierViewPO?.purchase_number;
            await purchasesService.confirmSupplierPurchase(targetId, payload);
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            alert('Supplier response saved and order updated successfully!');

            if (supplierViewPO) {
                setSupplierViewPO(prev => ({
                    ...prev,
                    status: mode,
                    supplier_confirmation_status: mode,
                    supplier_response_type: mode,
                    expected_available_date: payload.expected_available_date,
                    supplier_status_message: notes,
                    items: payloadItems
                }));
            }
        } catch(err) {
            alert(err.message || 'Failed to record supplier response');
        } finally {
            setIsConfirmingPO(false);
        }
    };

    const handleOpenChat = async (po) => {
        const foundSup = (suppliersList || []).find(s => (s.name || s.supplier_name || '').toLowerCase() === (po.supplier_name || '').toLowerCase()) || { id: po.supplier_id || 1, name: po.supplier_name };
        setChatSupplier(foundSup);
        setIsChatModalOpen(true);
        try {
            const msgs = await suppliersService.getChats(foundSup.id || 1, po.id || po.purchase_id);
            setChatMessages(Array.isArray(msgs) ? msgs : []);
        } catch(e) {
            setChatMessages([]);
        }
    };

    const handleSendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !chatSupplier) return;
        setIsSendingMessage(true);
        try {
            const sent = await suppliersService.sendChatMessage(chatSupplier.id || 1, {
                message: chatInput,
                purchase_id: supplierViewPO ? (supplierViewPO.id || supplierViewPO.purchase_id) : null,
                sender_type: 'dealer'
            });
            setChatMessages(prev => [...prev, sent]);
            setChatInput('');
        } catch(err) {
            alert(err.message || 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    };

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

    const { data: allReturns = [] } = useQuery({
        queryKey: ['returns'],
        queryFn: returnsService.getReturns
    });

    const supplierReturnsList = allReturns.filter(r => r.return_type === 'purchase');

    const applyFilters = (docs) => docs.filter(p => {
        const matchesSearch = 
            (p.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.doc_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesDate = !dateFilter || (p.doc_date || '').startsWith(dateFilter);

        return matchesSearch && matchesStatus && matchesDate;
    });

    const purchaseOrders = applyFilters(allPurchases.filter(p => p.doc_type === 'PO'));
    const purchaseBills = applyFilters(allPurchases.filter(p => p.doc_type === 'BILL'));
    const purchaseReturns = applyFilters(allPurchases.filter(p => p.doc_type === 'RETURN'));

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

    // 🚀 Receive Goods: triggers full ERP cascade (Inventory + Vendor Ledger + AP + Accounting + GSTR-2B)
    const receiveGoodsMutation = useMutation({
        mutationFn: (id) => purchasesService.receiveGoods(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['accounting'] });
            queryClient.invalidateQueries({ queryKey: ['gstReconciliations'] });
            queryClient.invalidateQueries({ queryKey: ['gstr3bReport'] });
            queryClient.invalidateQueries({ queryKey: ['gstr9Report'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            alert('✅ Goods received successfully!\n\nThe following were updated automatically:\n• Purchase Bill → Completed\n• Vendor Ledger\n• Accounts Payable\n• Accounting Journal\n• GSTR-2B (Input Tax Credit)');
        },
        onError: (err) => {
            alert('Error: ' + (err.response?.data?.message || err.message || 'Failed to receive goods'));
        }
    });

    // Warehouse query for Receive Goods dropdown
    const warehousesQuery = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses()
    });

    const warehousesList = Array.isArray(warehousesQuery.data) && warehousesQuery.data.length > 0
        ? warehousesQuery.data
        : [{ id: 1, name: 'Main Godown' }, { id: 2, name: 'Shop Front' }, { id: 3, name: 'Central Warehouse' }];

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

    React.useEffect(() => {
        if (isCreateModalOpen && activeConfig) {
            const prefix = createDocType === 'PO' ? (activeConfig.prefixPurchase || 'PO-') : (createDocType === 'RETURN' ? (activeConfig.prefixCredit || 'RET-') : 'BILL-');
            setFormHeader(prev => ({
                ...prev,
                purchase_number: `${prefix}${Date.now().toString().slice(-4)}`
            }));
        }
    }, [isCreateModalOpen, createDocType, activeConfig]);

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
            paymentsStore.getBankAccounts().then(res => setBankAccounts(Array.isArray(res) ? res : []));
        }

        createMutation.mutate(docPayload);
    };

    const handleOpenReceiveModal = (po) => {
        setSelectedDoc(po);
        setSelectedReceiveWarehouse(po.warehouse_id || 'Main Godown');
        const qtyMap = {};
        (po.items || []).forEach((item, idx) => {
            qtyMap[idx] = (item.quantity - (item.received_quantity !== undefined ? item.received_quantity : item.quantity));
        });
        setReceiveQuantities(qtyMap);
        setIsReceiveModalOpen(true);
    };

    const handleConfirmReceiveGoods = async () => {
        if (!selectedDoc) return;
        try {
            await purchasesService.receiveGoods(selectedDoc.id || selectedDoc.purchase_id, {
                warehouse_id: selectedReceiveWarehouse,
                warehouse_name: selectedReceiveWarehouse
            });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsReceiveModalOpen(false);
            setSelectedDoc(null);
            alert(`✅ Goods received successfully into ${selectedReceiveWarehouse}!\n\nInventory updated and Purchase Bill completed.`);
        } catch (err) {
            alert('Failed to receive goods: ' + (err.message || 'Unknown error'));
        }
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
    const totalReturnedRefundsSum = purchaseReturns.reduce((acc, r) => acc + (r.returned_items || []).reduce((sum, item) => sum + (parseFloat(item.refund_amount) || 0), 0), 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
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
                        onClick={() => { setCreateDocType('PO'); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New PO
                    </button>
                    <button 
                        onClick={() => { setCreateDocType('BILL'); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#3B82F6', border: '1px solid #DBEAFE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> New Purchase Bill
                    </button>
                    <button 
                        onClick={() => { setCreateDocType('RETURN'); setIsCreateModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#8B5CF6', border: '1px solid #EDE9FE', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Plus size={15} /> Purchase Return
                    </button>
                </div>
            </div>

            {/* Vyapar ERP Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Outward Procurement (At Cost)', value: formatCurrency(Math.round(totalOutwardPayments)), icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Active PO Cycles', value: activePurchaseOrdersCount, icon: ShoppingCart, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'Claimable Input Tax Credit (ITC)', value: formatCurrency(Number(inputGstCreditSum)), icon: PercentCircle, color: '#8B5CF6', bg: '#F5F3FF' },
                    { label: 'Refund Adjustments', value: formatCurrency(Math.round(totalReturnedRefundsSum)), icon: RefreshCw, color: '#10B981', bg: '#ECFDF5' }
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
                    onClick={() => setActiveTab('supplier-returns')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'supplier-returns' ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : 'white', 
                        color: activeTab === 'supplier-returns' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'supplier-returns' ? '0 4px 10px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                >
                    <RefreshCw size={16} /> Purchase Returns (Suppliers)
                </button>
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Purchase Orders (PO) */}
            {activeTab === 'purchase-orders' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or order numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input 
                                type="date" 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{ padding: '0.65rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#475569' }}
                            />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ padding: '0.65rem 1rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#475569' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Received">Received</option>
                                <option value="Billed">Billed</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button style={{ width: '42px', height: '42px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'po_number', label: 'PO Details', placeholder: 'PO No' },
        { key: 'supplier_name', label: 'Supplier & GST', placeholder: 'Supplier' },
        { key: 'items', label: 'Items', placeholder: 'Item' },
        { key: 'total', label: 'Outward Payables', placeholder: 'e.g. 5000' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Pending' },
        { key: '_actions', label: 'Actions', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredPOs.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((po) => (
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
                                                     <p style={{ fontWeight: '700', color: '#475569', margin: 0 }}>{item.product_name}</p>
                                                     <span style={{ color: '#94A3B8' }}>Ordered: {item.quantity} | Received: {item.received_quantity !== undefined && item.received_quantity !== null && item.received_quantity !== '' ? item.received_quantity : item.quantity} {item.primary_unit || 'pcs'}</span>
                                                 </div>
                                             ))}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const totals = computeDocTotals(po.items, po.shipping_charge);
                                                return (
                                                    <div>
                                                        <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '1.05rem' }}>{formatCurrency(totals.grand_total)}</p>
                                                        <span style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: '700' }}>Paid Adv: {formatCurrency(po.advance_amount)}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const statusType = po.supplier_response_type || po.supplier_confirmation_status || po.status;
                                                const isConfirmed = statusType === 'CONFIRMED' || po.status === 'Paid';
                                                const isPartiallyAvailable = statusType === 'PARTIALLY_AVAILABLE';
                                                const isNotAvailable = statusType === 'NOT_AVAILABLE';
                                                const isAvailableLater = statusType === 'AVAILABLE_LATER';

                                                let badgeBg = '#FFFBEB';
                                                let badgeColor = '#B45309';
                                                let badgeIcon = <Clock size={13} />;
                                                let badgeText = 'SENT TO SUPPLIER (PENDING)';
                                                let statusMessage = 'Awaiting Supplier Confirmation';

                                                if (isConfirmed) {
                                                    badgeBg = '#F0FDF4';
                                                    badgeColor = '#15803D';
                                                    badgeIcon = <CheckCircle2 size={13} />;
                                                    badgeText = 'CONFIRMED BY SUPPLIER';
                                                    statusMessage = 'Supplier has confirmed your order.';
                                                } else if (isPartiallyAvailable) {
                                                    badgeBg = '#FFF7ED';
                                                    badgeColor = '#C2410C';
                                                    badgeIcon = <AlertTriangle size={13} />;
                                                    badgeText = 'PARTIALLY AVAILABLE / WAITING FOR BUYER RESPONSE';
                                                    statusMessage = po.supplier_status_message || 'Supplier can provide only a smaller quantity.';
                                                } else if (isNotAvailable) {
                                                    badgeBg = '#FEF2F2';
                                                    badgeColor = '#DC2626';
                                                    badgeIcon = <X size={13} />;
                                                    badgeText = 'PRODUCT NOT AVAILABLE / WAITING FOR BUYER RESPONSE';
                                                    statusMessage = po.supplier_status_message || 'Product not available — Waiting for buyer response.';
                                                } else if (isAvailableLater) {
                                                    badgeBg = '#EFF6FF';
                                                    badgeColor = '#1D4ED8';
                                                    badgeIcon = <Clock size={13} />;
                                                    const expDate = po.expected_available_date ? po.expected_available_date : '';
                                                    badgeText = expDate ? `WAITING FOR SUPPLIER — AVAILABLE ON ${expDate}` : 'WAITING FOR SUPPLIER — AVAILABLE LATER';
                                                    statusMessage = expDate ? `Expected to become available on ${expDate}.` : (po.supplier_status_message || 'Waiting for supplier availability.');
                                                }

                                                // Parse items breakdown if supplier provided partial availability
                                                let itemsBreakdown = null;
                                                const itemList = po.items || (po.supplier_response_items ? (typeof po.supplier_response_items === 'string' ? JSON.parse(po.supplier_response_items) : po.supplier_response_items) : null);
                                                if (isPartiallyAvailable && Array.isArray(itemList)) {
                                                    itemsBreakdown = (
                                                        <div style={{ marginTop: '0.4rem', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                                            <strong style={{ fontSize: '0.72rem', color: '#9A3412', display: 'block', marginBottom: '0.2rem' }}>Quantity Breakdown:</strong>
                                                            {itemList.map((it, idx) => {
                                                                const reqQty = it.quantity || 1;
                                                                const availQty = it.available_quantity !== undefined && it.available_quantity !== null ? it.available_quantity : reqQty;
                                                                return (
                                                                    <div key={idx} style={{ fontSize: '0.72rem', color: '#C2410C', fontWeight: '700' }}>
                                                                        • {it.product_name || it.name || 'Item'}: Requested {reqQty} | Available {availQty}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        <div style={{ 
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', 
                                                            padding: '0.35rem 0.75rem', borderRadius: '10px',
                                                            background: badgeBg,
                                                            color: badgeColor,
                                                            fontSize: '0.78rem', fontWeight: '800', width: 'fit-content'
                                                        }}>
                                                            {badgeIcon}
                                                            {badgeText}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: badgeColor, fontWeight: '700' }}>
                                                            {statusMessage}
                                                        </span>
                                                        {itemsBreakdown}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleOpenChat(po)}
                                                    title="Dealer-Supplier Chat"
                                                    style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid #10B981', background: '#ECFDF5', color: '#047857', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                                >
                                                    <MessageCircle size={14} /> Chat
                                                </button>
                                                {po.status !== 'Completed' && (
                                                    <button 
                                                        onClick={() => handleOpenReceiveModal(po)}
                                                        style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                                                    >
                                                        <PackageOpen size={14} /> Receive Goods
                                                    </button>
                                                )}
                                            </div>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '850', color: '#1E293B' }}>Purchase Bills</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>Bills with <strong style={{ color: '#B45309' }}>Pending Goods</strong> status need warehouse confirmation before GSTR-2B ITC is activated.</p>
                        </div>
                        <div style={{ position: 'relative', width: '260px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or bill numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.75rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'po_number', label: 'PO Details', placeholder: 'PO No' },
                                { key: 'supplier_name', label: 'Supplier & GST', placeholder: 'Supplier' },
                                { key: 'items', label: 'Items', placeholder: 'Item' },
                                { key: 'total', label: 'Outward Payables', placeholder: 'e.g. 5000' },
                                { key: 'status', label: 'Status', placeholder: 'e.g. Pending' },
                                { key: '_actions', label: 'Actions', noFilter: true }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredBills.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((bill) => (
                                    <tr key={bill.id || bill.purchase_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem', margin: 0 }}>{bill.purchase_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {bill.purchase_date} | Due: {bill.due_date || '—'}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.9rem', margin: 0 }}>{bill.supplier_name}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{bill.billing_address || (bill.supplier_gstin ? `GSTIN: ${bill.supplier_gstin}` : 'Unregistered')}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {bill.items && bill.items.length > 0 ? (
                                                bill.items.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                        <p style={{ fontWeight: '700', color: '#475569', margin: 0 }}>{item.product_name}</p>
                                                        <span style={{ color: '#94A3B8' }}>Qty: {item.quantity} @ {formatCurrency(item.purchase_price)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>
                                                    {bill.notes || 'Inventory Purchases'}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items || [], bill.shipping_charge);
                                                const finalTotal = totals.grand_total || bill.grand_total || 0;
                                                const singleTax = (totals.total_tax || 0) / 2;
                                                return (
                                                    <div style={{ fontSize: '0.85rem' }}>
                                                        <p style={{ fontWeight: '900', color: '#1E293B', fontSize: '1.05rem', margin: 0 }}>{formatCurrency(finalTotal)}</p>
                                                        {singleTax > 0 && (
                                                            <>
                                                                <p style={{ fontWeight: '700', color: '#475569', margin: 0 }}>CGST (9%): {formatCurrency(singleTax)}</p>
                                                                <p style={{ fontWeight: '700', color: '#475569', margin: 0 }}>SGST (9%): {formatCurrency(singleTax)}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800',
                                                background: bill.status === 'Completed' ? '#F0FDF4' : (bill.status === 'Pending Goods' ? '#FFFBEB' : '#F1F5F9'),
                                                color: bill.status === 'Completed' ? '#15803D' : (bill.status === 'Pending Goods' ? '#B45309' : '#475569')
                                            }}>
                                                {bill.status === 'Completed' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                                {bill.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            {bill.status === 'Pending Goods' ? (
                                                <button
                                                    disabled={receiveGoodsMutation.isPending}
                                                    onClick={() => setPendingReceiveBill(bill)}
                                                    style={{
                                                        padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none',
                                                        background: '#064E3B',
                                                        color: 'white',
                                                        fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                        boxShadow: '0 4px 6px -1px rgba(6, 78, 59, 0.2)'
                                                    }}
                                                >
                                                    <PackageOpen size={14} /> Receive Goods
                                                </button>
                                            ) : (
                                                <span style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '10px', background: '#F1F5F9', color: '#475569', fontSize: '0.8rem', fontWeight: '800' }}>
                                                    {bill.status === 'Completed' ? 'COMPLETED' : bill.status.toUpperCase()}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Purchase Returns (Suppliers) */}
            {activeTab === 'supplier-returns' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Purchase Returns (Suppliers)</h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0 0', fontWeight: '500' }}>Manage supplier defective product returns, debit notes, and refund statuses.</p>
                        </div>
                        <button 
                            onClick={() => { setCreateDocType('RETURN'); setIsCreateModalOpen(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
                        >
                            <Plus size={15} /> New Supplier Return
                        </button>
                    </div>

                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Return Ref</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Ref Bill / Purchase ID</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Items Returned</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Refund Amount</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierReturnsList.length > 0 ? (
                                    supplierReturnsList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((pr) => (
                                        <tr key={pr.id || pr.return_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '1.25rem', fontWeight: '850', color: '#064E3B' }}>{pr.return_number || `PRN-${pr.id}`}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>{pr.purchase_id || pr.purchase_number || 'N/A'}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '750', color: '#1E293B' }}>{pr.supplier_name || 'N/A'}</td>
                                            <td style={{ padding: '1.25rem' }}>
                                                {(pr.items || []).map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                        <p style={{ fontWeight: '700', color: '#475569', margin: 0 }}>{item.product_name}</p>
                                                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Qty returned: {item.return_quantity || item.quantity || 1}</span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '900', color: '#B91C1C' }}>
                                                {formatCurrency(pr.refund_amount || (pr.items || []).reduce((sum, i) => sum + (i.refund_amount || (i.price * i.return_quantity) || 0), 0))}
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                    background: pr.status === 'Completed' ? '#F0FDF4' : '#FEF2F2',
                                                    color: pr.status === 'Completed' ? '#15803D' : '#EF4444',
                                                    fontSize: '0.75rem', fontWeight: '800'
                                                }}>
                                                    {(pr.inspection_status || pr.status || 'Completed').toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    purchaseReturns.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((ret) => (
                                        <tr key={ret.return_id || ret.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '1.25rem', fontWeight: '850', color: '#B91C1C' }}>{ret.return_id || ret.doc_number}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>{ret.purchase_number || 'N/A'}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '750', color: '#1E293B' }}>{ret.supplier_name}</td>
                                            <td style={{ padding: '1.25rem' }}>
                                                {(ret.items || ret.returned_items || []).map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                        <p style={{ fontWeight: '700', margin: 0 }}>{item.product_name}</p>
                                                        <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Returned: {item.quantity || item.return_quantity} Units</span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: '900', color: '#B91C1C' }}>
                                                {formatCurrency(ret.refund_amount || (ret.returned_items || ret.items || []).reduce((sum, i) => sum + (i.refund_amount || (i.price * i.quantity) || 0), 0))}
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                    background: '#F0FDF4', color: '#15803D', fontSize: '0.75rem', fontWeight: '800'
                                                }}>
                                                    COMPLETED
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
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

            {/* Structured Goods Receipt Confirmation Modal */}
            {pendingReceiveBill && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Confirm Goods Receipt</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Review and verify purchase details before completion</p>
                            </div>
                            <button onClick={() => setPendingReceiveBill(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Bill Header Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Bill Number</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{pendingReceiveBill.purchase_number}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Supplier</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{pendingReceiveBill.supplier_name}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Warehouse</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{pendingReceiveBill.warehouse_id || 'Main Godown'}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Received Date</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1B6B3A' }}>{new Date().toISOString().split('T')[0]} (Today)</strong>
                                </div>
                            </div>

                            {/* Product List Section */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Product List</h4>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Item / Description</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Ordered Qty</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Received Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingReceiveBill.items && pendingReceiveBill.items.length > 0 ? (
                                                pendingReceiveBill.items.map((item, idx) => (
                                                    <tr key={idx} style={{ borderBottom: idx < pendingReceiveBill.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                                        <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E293B' }}>{item.product_name}</td>
                                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>{item.quantity}</td>
                                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '850', color: '#1B6B3A' }}>{item.quantity}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                /* Fallback for journal created credit purchases which have no items */
                                                <tr>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#1E293B' }}>
                                                        {pendingReceiveBill.notes || 'Inventory Purchases'}
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>1</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '850', color: '#1B6B3A' }}>1</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ERP Cascade Highlights */}
                            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>ERP Cascade Action Summary</span>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#065F46', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontWeight: '600' }}>
                                    <li>Mark Purchase Bill as Completed</li>
                                    <li>Replenish stocks & update inventory levels</li>
                                    <li>Update Vendor Ledger and Accounts Payable ({formatCurrency(pendingReceiveBill.grand_total)})</li>
                                    <li>Post to Accounting Journal (Inventory Purchase Dr + Input GST Dr)</li>
                                    <li>Create GSTR-2B entry & claim Eligible Input Tax Credit (ITC)</li>
                                </ul>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setPendingReceiveBill(null)}
                                    style={{ padding: '0.9rem', borderRadius: '16px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '750', fontSize: '0.95rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={receiveGoodsMutation.isPending}
                                    onClick={() => {
                                        receiveGoodsMutation.mutate(pendingReceiveBill.id, {
                                            onSuccess: () => {
                                                setPendingReceiveBill(null);
                                            }
                                        });
                                    }}
                                    style={{
                                        padding: '0.9rem', borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                                        color: 'white', border: 'none', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)'
                                    }}
                                >
                                    {receiveGoodsMutation.isPending ? 'Confirming...' : 'Confirm Receive'}
                                </button>
                            </div>
                        </div>
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
                                            {suppliersList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => (
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

                                {formItems.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((item, idx) => (
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
                                                {catalogProducts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(p => (
                                                    <option key={p.id || p.product_id} value={p.id || p.product_id}>{p.name || p.product_name} {p.sku ? `[${p.sku}]` : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>SKU</label>
                                            <input type="text" value={item.sku} onChange={(e) => handleItemChange(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #DCF2E4', outline: 'none' }} placeholder="IPH-15" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.25rem' }}>Purchase Cost ({currency.symbol})</label>
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
                                                {bankAccounts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.bank_name} - {formatCurrency(acc.current_balance)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {createDocType === 'PO' ? (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Advance Payment Amount ({currency.symbol})</label>
                                            <input type="number" value={formHeader.advance_amount} onChange={(e) => setFormHeader({ ...formHeader, advance_amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.4rem' }}>Entering an advance payment logs instant cash outflows dynamically.</p>
                                        </div>
                                    ) : createDocType === 'BILL' ? (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Paid Amount ({currency.symbol})</label>
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
                                                    <span style={{ fontWeight: '700' }}>{formatCurrency(totals.subtotal)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748B' }}>Total Discount:</span>
                                                    <span style={{ fontWeight: '700', color: '#EF4444' }}>- {formatCurrency(totals.total_discount)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748B' }}>Input Tax (GST):</span>
                                                    <span style={{ fontWeight: '700' }}>{formatCurrency(totals.total_tax)}</span>
                                                </div>
                                                <div style={{ height: '1px', background: '#E2E8F0', margin: '0.25rem 0' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1B6B3A' }}>
                                                    <span style={{ fontWeight: '800' }}>Grand Total Due:</span>
                                                    <span style={{ fontWeight: '950', fontSize: '1.15rem' }}>{formatCurrency(totals.grand_total)}</span>
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

            {/* Supplier Portal View (Confirm Order & Availability Response) Modal */}
            {isSupplierViewModalOpen && supplierViewPO && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)', padding: '1.5rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '780px', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header Banner */}
                        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Globe size={24} />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Cliks Website — Supplier Order Confirmation</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Supplier View for Purchase Request #{supplierViewPO.purchase_number}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSupplierViewModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Order Body */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Alert Banner */}
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '1rem 1.25rem', color: '#1E40AF', fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Info size={20} color="#1D4ED8" />
                                <span>THIS DEALER HAS REQUESTED THESE PRODUCTS FROM YOU.</span>
                            </div>

                            {/* Order Demographics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Dealer / Business Name</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{supplierViewPO.dealer_name || 'CLIKS Dealer Store'}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Supplier Name</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{supplierViewPO.supplier_name}</strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Order Date</span>
                                    <strong style={{ fontSize: '0.95rem', color: '#1E293B' }}>{supplierViewPO.purchase_date}</strong>
                                </div>
                            </div>

                            {/* Response Selection Options (If Pending) */}
                            {(!supplierViewPO.supplier_confirmation_status || supplierViewPO.supplier_confirmation_status === 'PENDING' || supplierViewPO.supplier_confirmation_status === 'PENDING SUPPLIER CONFIRMATION' || supplierViewPO.supplier_confirmation_status === 'Unpaid' || supplierViewPO.supplier_confirmation_status === 'Draft') && (
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                                        Select Supplier Response Option
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setSupplierResponseMode('CONFIRMED')}
                                            style={{
                                                padding: '0.65rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer',
                                                border: supplierResponseMode === 'CONFIRMED' ? '2px solid #10B981' : '1px solid #CBD5E1',
                                                background: supplierResponseMode === 'CONFIRMED' ? '#ECFDF5' : 'white',
                                                color: supplierResponseMode === 'CONFIRMED' ? '#047857' : '#475569',
                                                boxShadow: supplierResponseMode === 'CONFIRMED' ? '0 4px 12px rgba(16,185,129,0.15)' : 'none'
                                            }}
                                        >
                                            ✓ Confirm Order
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSupplierResponseMode('PARTIALLY_AVAILABLE')}
                                            style={{
                                                padding: '0.65rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer',
                                                border: supplierResponseMode === 'PARTIALLY_AVAILABLE' ? '2px solid #F97316' : '1px solid #CBD5E1',
                                                background: supplierResponseMode === 'PARTIALLY_AVAILABLE' ? '#FFF7ED' : 'white',
                                                color: supplierResponseMode === 'PARTIALLY_AVAILABLE' ? '#C2410C' : '#475569',
                                                boxShadow: supplierResponseMode === 'PARTIALLY_AVAILABLE' ? '0 4px 12px rgba(249,115,22,0.15)' : 'none'
                                            }}
                                        >
                                            ⚠ Less Qty Available
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSupplierResponseMode('NOT_AVAILABLE')}
                                            style={{
                                                padding: '0.65rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer',
                                                border: supplierResponseMode === 'NOT_AVAILABLE' ? '2px solid #EF4444' : '1px solid #CBD5E1',
                                                background: supplierResponseMode === 'NOT_AVAILABLE' ? '#FEF2F2' : 'white',
                                                color: supplierResponseMode === 'NOT_AVAILABLE' ? '#B91C1C' : '#475569',
                                                boxShadow: supplierResponseMode === 'NOT_AVAILABLE' ? '0 4px 12px rgba(239,68,68,0.15)' : 'none'
                                            }}
                                        >
                                            ✕ Product Not Available
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSupplierResponseMode('AVAILABLE_LATER')}
                                            style={{
                                                padding: '0.65rem 0.5rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer',
                                                border: supplierResponseMode === 'AVAILABLE_LATER' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                                                background: supplierResponseMode === 'AVAILABLE_LATER' ? '#EFF6FF' : 'white',
                                                color: supplierResponseMode === 'AVAILABLE_LATER' ? '#1D4ED8' : '#475569',
                                                boxShadow: supplierResponseMode === 'AVAILABLE_LATER' ? '0 4px 12px rgba(59,130,246,0.15)' : 'none'
                                            }}
                                        >
                                            📅 Available Later
                                        </button>
                                    </div>

                                    {supplierResponseMode === 'AVAILABLE_LATER' && (
                                        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#EFF6FF', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                                            <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E40AF' }}>Expected Available Date:</label>
                                            <input
                                                type="date"
                                                value={expectedAvailableDate}
                                                onChange={(e) => setExpectedAvailableDate(e.target.value)}
                                                style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #3B82F6', fontSize: '0.85rem', fontWeight: '800', outline: 'none', background: 'white' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Requested Product List */}
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#475569', marginBottom: '0.6rem', textTransform: 'uppercase' }}>Requested Products & Quantities</h4>
                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Product Name</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Requested Qty</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Available Qty</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569' }}>Unit</th>
                                                <th style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#475569', textAlign: 'right' }}>Unit Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {supplierViewPO.items && supplierViewPO.items.length > 0 ? (
                                                supplierViewPO.items.map((item, idx) => {
                                                    const isPending = !supplierViewPO.supplier_confirmation_status || supplierViewPO.supplier_confirmation_status === 'PENDING' || supplierViewPO.supplier_confirmation_status === 'PENDING SUPPLIER CONFIRMATION' || supplierViewPO.supplier_confirmation_status === 'Unpaid';
                                                    const curAvail = itemAvailableQtys[idx] !== undefined ? itemAvailableQtys[idx] : (item.available_quantity !== undefined ? item.available_quantity : item.quantity);
                                                    return (
                                                        <tr key={idx} style={{ borderBottom: idx < supplierViewPO.items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#1E293B' }}>{item.product_name}</td>
                                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#1D4ED8' }}>{item.quantity}</td>
                                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                                {isPending && supplierResponseMode === 'PARTIALLY_AVAILABLE' ? (
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={item.quantity}
                                                                        value={curAvail}
                                                                        onChange={(e) => setItemAvailableQtys({ ...itemAvailableQtys, [idx]: e.target.value })}
                                                                        style={{ width: '70px', padding: '0.3rem 0.5rem', borderRadius: '8px', border: '2px solid #F97316', textAlign: 'right', fontWeight: '800', color: '#C2410C', background: '#FFF7ED' }}
                                                                    />
                                                                ) : (
                                                                    <span style={{ fontWeight: '800', color: supplierViewPO.supplier_confirmation_status === 'PARTIALLY_AVAILABLE' ? '#C2410C' : (supplierViewPO.supplier_confirmation_status === 'NOT_AVAILABLE' ? '#DC2626' : '#15803D') }}>
                                                                        {supplierViewPO.supplier_confirmation_status === 'NOT_AVAILABLE' ? 0 : curAvail}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#475569' }}>{item.primary_unit || item.unit || 'pcs'}</td>
                                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>{formatCurrency(item.purchase_price || item.price || 0)}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8' }}>No specific item details listed</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {(() => {
                                const st = supplierViewPO.supplier_confirmation_status || supplierViewPO.supplier_response_type || supplierViewPO.status;
                                let badgeText = 'PENDING SUPPLIER CONFIRMATION';
                                let badgeColor = '#B45309';

                                if (st === 'CONFIRMED') {
                                    badgeText = 'CONFIRMED BY SUPPLIER';
                                    badgeColor = '#15803D';
                                } else if (st === 'PARTIALLY_AVAILABLE') {
                                    badgeText = 'PARTIALLY AVAILABLE / WAITING FOR BUYER RESPONSE';
                                    badgeColor = '#C2410C';
                                } else if (st === 'NOT_AVAILABLE') {
                                    badgeText = 'PRODUCT NOT AVAILABLE / WAITING FOR BUYER RESPONSE';
                                    badgeColor = '#DC2626';
                                } else if (st === 'AVAILABLE_LATER') {
                                    badgeText = `WAITING FOR SUPPLIER — AVAILABLE ON ${supplierViewPO.expected_available_date || 'EXPECTED DATE'}`;
                                    badgeColor = '#1D4ED8';
                                }

                                return (
                                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
                                        Status: <strong style={{ color: badgeColor }}>{badgeText}</strong>
                                    </span>
                                );
                            })()}

                            {(() => {
                                const st = supplierViewPO.supplier_confirmation_status || supplierViewPO.supplier_response_type || supplierViewPO.status;
                                const isResponded = st === 'CONFIRMED' || st === 'PARTIALLY_AVAILABLE' || st === 'NOT_AVAILABLE' || st === 'AVAILABLE_LATER';

                                if (isResponded) {
                                    return (
                                        <span style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', background: st === 'CONFIRMED' ? '#F0FDF4' : (st === 'PARTIALLY_AVAILABLE' ? '#FFF7ED' : (st === 'NOT_AVAILABLE' ? '#FEF2F2' : '#EFF6FF')), color: st === 'CONFIRMED' ? '#15803D' : (st === 'PARTIALLY_AVAILABLE' ? '#C2410C' : (st === 'NOT_AVAILABLE' ? '#DC2626' : '#1D4ED8')), fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <CheckCircle2 size={16} /> Response Submitted
                                        </span>
                                    );
                                }

                                let btnGradient = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                                let btnText = 'CONFIRM ORDER';
                                let btnShadow = 'rgba(16, 185, 129, 0.25)';

                                if (supplierResponseMode === 'PARTIALLY_AVAILABLE') {
                                    btnGradient = 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
                                    btnText = 'SUBMIT AVAILABLE QUANTITY';
                                    btnShadow = 'rgba(249, 115, 22, 0.25)';
                                } else if (supplierResponseMode === 'NOT_AVAILABLE') {
                                    btnGradient = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                                    btnText = 'MARK AS NOT AVAILABLE';
                                    btnShadow = 'rgba(239, 68, 68, 0.25)';
                                } else if (supplierResponseMode === 'AVAILABLE_LATER') {
                                    btnGradient = 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)';
                                    btnText = 'SET AVAILABLE DATE';
                                    btnShadow = 'rgba(59, 130, 246, 0.25)';
                                }

                                return (
                                    <button
                                        type="button"
                                        disabled={isConfirmingPO}
                                        onClick={() => handleConfirmPOBySupplier(supplierViewPO.id || supplierViewPO.purchase_id)}
                                        style={{
                                            padding: '0.75rem 1.75rem', borderRadius: '12px',
                                            background: btnGradient,
                                            color: 'white', border: 'none', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer',
                                            boxShadow: `0 8px 16px ${btnShadow}`, display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <CheckCircle2 size={18} /> {isConfirmingPO ? 'SUBMITTING...' : btnText}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Dealer <-> Supplier Chat Modal */}
            {isChatModalOpen && chatSupplier && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '550px', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800' }}>Dealer ↔ Supplier Chat</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Supplier: {chatSupplier.name || chatSupplier.supplier_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsChatModalOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages body */}
                        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {chatMessages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94A3B8', margin: 'auto', fontSize: '0.85rem' }}>
                                    <MessageCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p style={{ margin: '0 0 0.5rem', fontWeight: '700' }}>No messages yet.</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem' }}>Type below to discuss purchase requests, availability, delivery, and orders with this supplier.</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const isDealer = msg.sender_type === 'dealer';
                                    return (
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isDealer ? 'flex-end' : 'flex-start' }}>
                                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginBottom: '2px', fontWeight: '600' }}>
                                                {isDealer ? 'Dealer (You)' : (chatSupplier.name || 'Supplier')}
                                            </span>
                                            <div style={{
                                                maxWidth: '80%',
                                                padding: '0.65rem 1rem',
                                                borderRadius: isDealer ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                                background: isDealer ? '#10B981' : '#FFFFFF',
                                                color: isDealer ? '#FFFFFF' : '#1E293B',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                border: isDealer ? 'none' : '1px solid #E2E8F0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                            }}>
                                                {msg.message}
                                            </div>
                                            <span style={{ fontSize: '0.6rem', color: '#CBD5E1', marginTop: '2px' }}>
                                                {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input area */}
                        <form onSubmit={handleSendChatMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Type purchase message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                            />
                            <button
                                type="submit"
                                disabled={isSendingMessage || !chatInput.trim()}
                                style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', background: '#10B981', color: 'white', border: 'none', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (!chatInput.trim() || isSendingMessage) ? 0.6 : 1 }}
                            >
                                <Send size={16} />
                                <span>Send</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Receive Goods & Warehouse Selection Modal */}
            {isReceiveModalOpen && selectedDoc && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', maxWidth: '640px', width: '100%', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <PackageOpen size={22} color="#064E3B" />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: '#1E293B' }}>Receive Goods & Warehouse Assignment</h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>Confirm stock arrival and select destination godown/warehouse.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsReceiveModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer' }}>
                                <X size={18} color="#64748B" />
                            </button>
                        </div>

                        {/* PO Header Info */}
                        <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Purchase Order #</span>
                                <p style={{ margin: 0, fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{selectedDoc.purchase_number}</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Supplier Name</span>
                                <p style={{ margin: 0, fontWeight: '850', color: '#1E293B', fontSize: '0.95rem' }}>{selectedDoc.supplier_name}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#334155', marginBottom: '0.5rem' }}>Item Details to Receive</label>
                            <div style={{ border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#F1F5F9', color: '#475569', fontWeight: '700' }}>
                                        <tr>
                                            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Product</th>
                                            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Ordered Qty</th>
                                            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Confirmed / Received</th>
                                            <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedDoc.items && selectedDoc.items.length > 0 ? selectedDoc.items : [{ product_name: 'Product Item', quantity: 1, purchase_price: selectedDoc.grand_total }]).map((it, idx) => (
                                            <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '0.65rem 0.8rem', fontWeight: '700', color: '#1E293B' }}>{it.product_name}</td>
                                                <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', fontWeight: '800', color: '#1E293B' }}>{it.quantity} {it.primary_unit || 'pcs'}</td>
                                                <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', fontWeight: '800', color: '#15803D' }}>{it.received_quantity !== undefined && it.received_quantity !== null && it.received_quantity !== '' ? it.received_quantity : it.quantity} {it.primary_unit || 'pcs'}</td>
                                                <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>{formatCurrency(it.purchase_price || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Warehouse Dropdown */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '750', color: '#1E293B', marginBottom: '0.4rem' }}>Select Target Warehouse / Godown *</label>
                            <select 
                                value={selectedReceiveWarehouse}
                                onChange={(e) => setSelectedReceiveWarehouse(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontWeight: '700', fontSize: '0.9rem', color: '#0F172A' }}
                            >
                                {warehousesList.map((wh, idx) => {
                                    const wName = wh.name || wh.warehouse_name || `Warehouse ${idx + 1}`;
                                    return <option key={idx} value={wName}>{wName}</option>;
                                })}
                            </select>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsReceiveModalOpen(false)} style={{ padding: '0.7rem 1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                            <button onClick={handleConfirmReceiveGoods} style={{ padding: '0.7rem 1.4rem', borderRadius: '12px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={16} /> Submit & Receive Goods
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPurchases;
