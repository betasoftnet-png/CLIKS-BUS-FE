import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import FilterableTableHead from '../components/FilterableTableHead';
import ReceiveGoodsModal from '../components/modals/ReceiveGoodsModal';
import NewProductModal from '../components/modals/NewProductModal';
import { 
    ShoppingCart, 
    Plus, 
    Search, 
    Filter, 
    FileText, 
    ArrowUpRight, 
    ArrowDownRight, 
    PackageOpen,
    Package,
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
    ShieldCheck,
    ArrowRightLeft,
    CreditCard
} from 'lucide-react';
import { paymentsStore } from '../lib/paymentsStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { purchasesService, productsService, suppliersService, settingsService, returnsService, warehouseService, stockService } from '../services';
import '../App.css';
import { useCurrency, useAuth } from '../context';

const BusinessPurchases = () => {
    const navigate = useNavigate();
    const { currency, formatCurrency } = useCurrency();
    const { selectedPlan, user } = useAuth();
    const business = user?.business;
    const currentPlan = (
        user?.subscription?.plan_key || 
        user?.plan_type || 
        business?.plan || 
        selectedPlan ||
        user?.tier ||
        ""
    ).toLowerCase();
    const isStarterPlan = currentPlan === 'starter' || currentPlan === 'mini_shop' || currentPlan === 'starter plan';
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
    const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [pendingReceiveBill, setPendingReceiveBill] = useState(null);
    const [selectedReceiveWarehouse, setSelectedReceiveWarehouse] = useState('Main Godown');
    const [receiveQuantities, setReceiveQuantities] = useState({});

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

    // Payment Settlement Modal states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentDoc, setPaymentDoc] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paymentBankAccountId, setPaymentBankAccountId] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

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

    const handleBuyerRespondPartial = async (po, action) => {
        try {
            const targetId = po.id || po.purchase_id || po.purchase_number;
            await purchasesService.respondBuyerPurchase(targetId, { action });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            alert(action === 'ACCEPT' ? 'Accepted partial quantity!' : 'Rejected partial quantity!');
        } catch(err) {
            alert(err.response?.data?.message || err.message || 'Failed to update response');
        }
    };

    const handleBuyerRespondDate = async (po, action) => {
        try {
            const targetId = po.id || po.purchase_id || po.purchase_number;
            await purchasesService.respondBuyerPurchase(targetId, { action });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            alert(action === 'ACCEPT_DATE' ? 'You accepted the proposed available date.' : 'You declined the proposed available date.');
        } catch(err) {
            alert(err.response?.data?.message || err.message || 'Failed to update response');
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

    const handleOpenReceiveModal = (doc) => {
        setSelectedDoc(doc);
        const defaultWh = doc.warehouse_id || (warehousesList && warehousesList[0] ? (warehousesList[0].id || warehousesList[0].code || warehousesList[0].name || warehousesList[0].warehouse_name) : '1');
        setSelectedReceiveWarehouse(defaultWh);
        setIsReceiveModalOpen(true);
    };

    const handleConfirmReceiveGoods = async (payload) => {
        if (!selectedDoc) return;
        try {
            const targetId = selectedDoc.id || selectedDoc.purchase_id || selectedDoc.purchase_number;
            const targetWh = (payload && typeof payload === 'object') ? (payload.warehouse_id || payload.warehouse_code || payload.warehouse_name) : (payload || selectedReceiveWarehouse);
            const chosenWh = (warehousesList || []).find(w => 
                String(w.id) === String(targetWh) || 
                (w.code || '').toLowerCase() === String(targetWh).toLowerCase() || 
                (w.name || w.warehouse_name || '').toLowerCase() === String(targetWh).toLowerCase()
            ) || { 
                id: targetWh, 
                name: (payload && payload.warehouse_name) || targetWh, 
                code: (payload && payload.warehouse_code) || targetWh 
            };

            await purchasesService.receiveGoods(targetId, {
                warehouse_id: chosenWh.id || chosenWh.code || targetWh,
                warehouse_name: chosenWh.name || chosenWh.warehouse_name || targetWh,
                warehouse_code: chosenWh.code || chosenWh.warehouse_code || targetWh,
                ...(payload?.items ? { items: payload.items } : {})
            });

            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });

            setIsReceiveModalOpen(false);
            setSelectedDoc(null);
            alert(`✅ Goods received successfully!\n\nThe purchase order status has been updated to COMPLETED and physical stock has been added to warehouse: ${chosenWh.name || chosenWh.warehouse_name || targetWh}.`);
        } catch(err) {
            alert('Error receiving goods: ' + (err.response?.data?.message || err.message || 'Failed to process warehouse stock receiving'));
        }
    };

    const queryClient = useQueryClient();

    const handleOpenPaymentModal = (doc) => {
        const grandTotal = parseFloat(doc.grand_total) || 0;
        const paid = (parseFloat(doc.paid_amount) || 0) + (parseFloat(doc.advance_amount) || 0);
        const remainingDue = Math.max(0, grandTotal - paid);
        setPaymentDoc(doc);
        setPaymentAmount(remainingDue);
        setPaymentMode(doc.payment_mode && doc.payment_mode !== 'Credit' ? doc.payment_mode : 'Cash');
        setPaymentBankAccountId(doc.bank_account_id || '');
        setIsPaymentModalOpen(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!paymentDoc) return;
        const amt = parseFloat(paymentAmount) || 0;
        if (amt <= 0) {
            alert('Please enter a valid payment amount greater than 0.');
            return;
        }
        try {
            setIsSubmittingPayment(true);
            await purchasesService.processPurchasePayments(paymentDoc.id || paymentDoc.purchase_id, {
                paid_amount: amt,
                payment_mode: paymentMode,
                bank_account_id: paymentBankAccountId || null
            });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['allExpensesDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setIsPaymentModalOpen(false);
            setPaymentDoc(null);
        } catch (err) {
            console.error('Error processing purchase payment:', err);
            alert(err?.response?.data?.message || 'Failed to record payment. Please try again.');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    // Queries
    const { data: allPurchases = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: purchasesService.getPurchases,
        refetchInterval: 3000,
        refetchIntervalInBackground: true
    });

    React.useEffect(() => {
        if (isSupplierViewModalOpen && supplierViewPO && allPurchases && allPurchases.length > 0) {
            const updated = allPurchases.find(p => (p.id && String(p.id) === String(supplierViewPO.id)) || (p.purchase_number && p.purchase_number === supplierViewPO.purchase_number));
            if (updated) {
                const curSt = supplierViewPO.supplier_confirmation_status || supplierViewPO.status;
                const newSt = updated.supplier_confirmation_status || updated.status;
                if (curSt !== newSt || updated.expected_available_date !== supplierViewPO.expected_available_date) {
                    setSupplierViewPO(updated);
                }
            }
        }
    }, [allPurchases, isSupplierViewModalOpen, supplierViewPO]);

    // 🚀 Fetch live catalog items and active vendors
    const { data: catalogProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

    const { data: dbStocks = [] } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockService.getStocks()
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
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['allExpensesDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
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
            queryClient.invalidateQueries({ queryKey: ['expensesList'] });
            queryClient.invalidateQueries({ queryKey: ['allExpensesDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
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
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            queryClient.invalidateQueries({ queryKey: ['ledger'] });
            queryClient.invalidateQueries({ queryKey: ['accounting'] });
            queryClient.invalidateQueries({ queryKey: ['gstReconciliations'] });
            queryClient.invalidateQueries({ queryKey: ['gstr3bReport'] });
            queryClient.invalidateQueries({ queryKey: ['gstr9Report'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            alert('✅ Goods received successfully!\n\nThe following were updated automatically:\n• Purchase Bill → Completed\n• Stock added to warehouse\n• Vendor Ledger\n• Accounts Payable\n• Accounting Journal\n• GSTR-2B (Input Tax Credit)');
        },
        onError: (err) => {
            alert('Error: ' + (err.response?.data?.message || err.message || 'Failed to receive goods'));
        }
    });

    // 🏢 Fulfill Internal Requisition: transfers stock from Main Showroom to requesting Branch
    const fulfillRequisitionMutation = useMutation({
        mutationFn: (id) => purchasesService.fulfillInternalRequisition(id),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['branches'] });
            alert(`✅ Stock Requisition Accepted & Dispatched!\n\n${res?.message || 'Stock successfully transferred from Main Showroom to destination branch.'}`);
        },
        onError: (err) => {
            alert('Error fulfilling requisition: ' + (err.response?.data?.message || err.message || 'Failed to dispatch stock'));
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
        payment_mode: 'Credit',
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

    React.useEffect(() => {
        if (warehousesList && warehousesList.length > 0) {
            setFormHeader(prev => {
                if (!prev.warehouse_id || prev.warehouse_id === 'Main Godown') {
                    const firstWh = warehousesList[0].name || warehousesList[0].warehouse_name;
                    if (firstWh) return { ...prev, warehouse_id: firstWh };
                }
                return prev;
            });
        }
    }, [warehousesList]);

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

    // 📦 Supplier-filtered products for Purchase Return
    const supplierProducts = React.useMemo(() => {
        if (createDocType !== 'RETURN' || (!formHeader.supplier_id && !formHeader.supplier_name)) {
            return createDocType === 'RETURN' ? [] : catalogProducts;
        }

        const selectedId = String(formHeader.supplier_id || '');
        const selectedName = (formHeader.supplier_name || '').toLowerCase().trim();

        const purchasedMap = new Map();
        (allPurchases || []).forEach(p => {
            const matchId = selectedId && String(p.supplier_id) === selectedId;
            const matchName = selectedName && (p.supplier_name || '').toLowerCase().trim() === selectedName;
            if (matchId || matchName) {
                const items = Array.isArray(p.items) ? p.items : (typeof p.items === 'string' ? JSON.parse(p.items || '[]') : []);
                items.forEach(it => {
                    const pName = it.product_name || it.name || it.description;
                    if (pName) {
                        const key = pName.toLowerCase().trim();
                        if (!purchasedMap.has(key)) {
                            purchasedMap.set(key, {
                                id: it.product_id || it.id || key,
                                product_id: it.product_id || it.id || key,
                                name: pName,
                                product_name: pName,
                                sku: it.sku || '',
                                purchase_price: parseFloat(it.purchase_price || it.price || 0),
                                primary_unit: it.primary_unit || 'pcs'
                            });
                        }
                    }
                });
            }
        });

        const filteredCatalog = (catalogProducts || []).filter(p => {
            const pSuppId = String(p.supplier_id || p.vendor_id || '');
            const pSuppName = (p.supplier_name || p.vendor_name || '').toLowerCase().trim();
            const matchSupp = (selectedId && pSuppId === selectedId) || (selectedName && pSuppName === selectedName);
            const pNameKey = (p.name || p.product_name || '').toLowerCase().trim();
            const matchPurchased = purchasedMap.has(pNameKey);
            return matchSupp || matchPurchased;
        });

        const result = [...filteredCatalog];
        purchasedMap.forEach((itemObj, key) => {
            if (!result.some(p => (p.name || p.product_name || '').toLowerCase().trim() === key)) {
                result.push(itemObj);
            }
        });

        return result;
    }, [createDocType, formHeader.supplier_id, formHeader.supplier_name, allPurchases, catalogProducts]);

    // 🏬 Product-filtered warehouses for Purchase Return
    const availableWarehouses = React.useMemo(() => {
        if (createDocType !== 'RETURN') return warehousesList;
        const selectedProd = formItems[0];
        if (!selectedProd || (!selectedProd.product_id && !selectedProd.product_name && !selectedProd.sku)) {
            return [];
        }

        const targetName = (selectedProd.product_name || '').toLowerCase().trim();
        const targetSku = (selectedProd.sku || '').toLowerCase().trim();
        const targetId = String(selectedProd.product_id || '');

        return warehousesList.map(wh => {
            const whName = (wh.name || wh.warehouse_name || '').toLowerCase().trim();
            const whCode = (wh.code || wh.warehouse_code || '').toLowerCase().trim();
            const whIdStr = String(wh.id || '');

            let availableQty = 0;

            (dbStocks || []).forEach(st => {
                const stLoc = (st.location || st.warehouse || '').toLowerCase().trim();
                if (stLoc === whName || stLoc === whCode || stLoc === whIdStr) {
                    const stName = (st.name || '').toLowerCase().trim();
                    const stSku = (st.sku || '').toLowerCase().trim();
                    const stId = String(st.id || '');
                    if (
                        (targetId && stId === targetId) ||
                        (targetSku && stSku && stSku === targetSku) ||
                        (targetName && stName && stName === targetName)
                    ) {
                        availableQty += parseFloat(st.quantity || 0);
                    }
                }
            });

            (catalogProducts || []).forEach(cp => {
                const cpWh = (cp.warehouse_id || '').toLowerCase().trim();
                if (cpWh === whName || cpWh === whCode || cpWh === whIdStr) {
                    const cpName = (cp.name || cp.product_name || '').toLowerCase().trim();
                    const cpSku = (cp.sku || '').toLowerCase().trim();
                    const cpId = String(cp.id || cp.product_id || '');
                    if (
                        (targetId && cpId === targetId) ||
                        (targetSku && cpSku && cpSku === targetSku) ||
                        (targetName && cpName && cpName === targetName)
                    ) {
                        availableQty = Math.max(availableQty, parseFloat(cp.quantity || 0));
                    }
                }
            });

            return {
                ...wh,
                availableQty
            };
        }).filter(wh => wh.availableQty > 0);
    }, [createDocType, formItems, warehousesList, dbStocks, catalogProducts]);

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

    const handleProductCreated = (newProduct) => {
        if (!newProduct) return;
        const newItem = {
            product_id: newProduct.id || newProduct.product_id,
            product_name: newProduct.name || newProduct.product_name,
            sku: newProduct.sku || '',
            batch_number: '',
            expiry_date: '',
            quantity: 1,
            free_quantity: 0,
            primary_unit: newProduct.primary_unit || 'pcs',
            purchase_price: parseFloat(newProduct.purchase_price || newProduct.price || 0),
            discount: 0,
            gst_percentage: parseInt(newProduct.gst_percentage || newProduct.tax_rate || 18, 10) || 18
        };

        setFormItems(prev => {
            if (prev.length === 1 && !prev[0].product_id && !prev[0].product_name) {
                return [newItem];
            }
            return [...prev, newItem];
        });
    };

    const handleGoToCreateProduct = () => {
        // 1. Close current PO modal
        setIsCreateModalOpen(false);

        // 2. Navigate to Inventory Products session with modal query param / state
        navigate('/inventory/products?create=true', {
            state: { openCreateModal: true }
        });
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

        if (createDocType === 'RETURN') {
            if (!formHeader.supplier_id && !formHeader.supplier_name) {
                alert('Please select a supplier first.');
                return;
            }

            const item = formItems[0];
            if (!item || (!item.product_id && !item.product_name)) {
                alert('Please select a product to return.');
                return;
            }

            if (isStarterPlan) {
                formHeader.warehouse_id = formHeader.warehouse_id || 'GENERAL';
            } else if (!formHeader.warehouse_id) {
                alert('Please select a warehouse.');
                return;
            }

            const selectedWhName = formHeader.warehouse_id;
            const targetWh = availableWarehouses.find(w => 
                String(w.id) === String(selectedWhName) || 
                (w.name || '').toLowerCase() === String(selectedWhName).toLowerCase() || 
                (w.code || '').toLowerCase() === String(selectedWhName).toLowerCase()
            );

            const availQty = targetWh ? targetWh.availableQty : 0;
            const returnQty = parseFloat(item.quantity) || 1;

            if (!isStarterPlan && returnQty > availQty) {
                alert(`Return quantity (${returnQty}) exceeds available stock (${availQty} PCS) in warehouse '${formHeader.warehouse_id}'.`);
                return;
            }
        }

        const isRequisition = createDocType === 'REQUISITION' || formHeader.purchase_type === 'INTERNAL' || String(formHeader.supplier_name || '').toLowerCase().includes('main showroom');
        const totals = computeDocTotals(formItems, formHeader.shipping_charge);
        const grandTotal = parseFloat(totals.grand_total) || 0;
        const isCredit = formHeader.payment_mode === 'Credit' || !formHeader.payment_mode;
        const paidAmount = (isCredit && !(parseFloat(formHeader.paid_amount) > 0)) ? 0 : (parseFloat(formHeader.paid_amount) || 0);
        const advanceAmount = (isCredit && !(parseFloat(formHeader.advance_amount) > 0)) ? 0 : (parseFloat(formHeader.advance_amount) || 0);

        let resolvedStatus = 'pending';
        let resolvedPaymentStatus = 'pending';

        if (isRequisition) {
            resolvedStatus = 'Pending Approval';
            resolvedPaymentStatus = 'n/a';
        } else if (createDocType === 'PO') {
            resolvedStatus = 'Approved';
            if (grandTotal > 0 && advanceAmount >= grandTotal) {
                resolvedPaymentStatus = 'paid';
            } else if (advanceAmount > 0) {
                resolvedPaymentStatus = 'partial';
            } else {
                resolvedPaymentStatus = 'pending';
            }
        } else if (createDocType === 'BILL') {
            if (grandTotal > 0 && paidAmount >= grandTotal) {
                resolvedStatus = 'paid';
                resolvedPaymentStatus = 'paid';
            } else if (paidAmount > 0) {
                resolvedStatus = 'partial';
                resolvedPaymentStatus = 'partial';
            } else {
                resolvedStatus = 'pending';
                resolvedPaymentStatus = 'pending';
            }
        } else if (createDocType === 'RETURN') {
            resolvedStatus = 'Completed';
            resolvedPaymentStatus = 'refunded';
        }

        const docPayload = {
            ...formHeader,
            payment_mode: formHeader.payment_mode || 'Credit',
            warehouse_id: formHeader.warehouse_id || 'Main Godown',
            doc_type: isRequisition ? 'PO' : createDocType,
            purchase_type: isRequisition ? 'INTERNAL' : (formHeader.purchase_type || 'GST'),
            supplier_name: isRequisition ? (formHeader.supplier_name || 'Main Showroom') : formHeader.supplier_name,
            items: formItems.map(i => ({
                ...i,
                received_quantity: createDocType === 'BILL' ? i.quantity : 0
            })),
            status: resolvedStatus,
            payment_status: resolvedPaymentStatus,
            paid_amount: isRequisition ? 0 : (createDocType === 'BILL' ? paidAmount : 0),
            advance_amount: isRequisition ? 0 : (createDocType === 'PO' ? advanceAmount : 0),
            ...totals
        };

        // Log Expense Transaction for Purchase Bill/Advance Payment (Skip for internal requisitions & unpaid/credit)
        const paymentAmt = createDocType === 'BILL' ? docPayload.paid_amount : docPayload.advance_amount;
        if (!isRequisition && paymentAmt > 0) {
            paymentsStore.addTransaction({
                type: createDocType === 'RETURN' ? 'income' : 'expense',
                reference_type: 'purchase',
                reference_id: formHeader.purchase_number,
                bank_account_id: formHeader.bank_account_id || null,
                amount: paymentAmt,
                payment_method: formHeader.payment_mode ? formHeader.payment_mode.toLowerCase() : 'credit',
                notes: `${createDocType} Payment for procurement ${formHeader.purchase_number}`
            });
            paymentsStore.getBankAccounts().then(res => setBankAccounts(Array.isArray(res) ? res : []));
        }

        createMutation.mutate(docPayload);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(5, 150, 105, 0.2)' }}>
                            <ShoppingCart size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.45rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Purchases Hub</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: '500', margin: 0 }}>Manage vendor procurement cycles, GST input tax credits, multi-warehouse receiving, and purchase returns.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                        onClick={() => { 
                            setCreateDocType('REQUISITION'); 
                            setFormHeader(prev => ({
                                ...prev,
                                purchase_type: 'INTERNAL',
                                supplier_id: 'internal_main',
                                supplier_name: 'Main Showroom',
                                supplier_gstin: 'INTERNAL-TRANSFER',
                                billing_address: 'Main Showroom / Central Warehouse',
                                contact_number: 'Internal Stock Depository',
                                payment_mode: 'Internal Transfer'
                            }));
                            setIsCreateModalOpen(true); 
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', borderRadius: '10px', background: '#F0FDF4', color: '#047857', border: '1px solid #BBF7D0', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                        <ArrowRightLeft size={14} /> Request Stock
                    </button>
                    <button 
                        onClick={() => {
                            setCreateDocType('PO');
                            setFormHeader(prev => ({ ...prev, payment_mode: 'Credit', paid_amount: 0, advance_amount: 0 }));
                            setIsCreateModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', borderRadius: '10px', background: 'white', color: '#334155', border: '1px solid #CBD5E1', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                    >
                        <Plus size={14} /> New PO
                    </button>
                    <button 
                        onClick={() => {
                            setCreateDocType('RETURN');
                            setFormHeader(prev => ({ ...prev, payment_mode: 'Credit', paid_amount: 0, advance_amount: 0 }));
                            setIsCreateModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', borderRadius: '10px', background: 'white', color: '#334155', border: '1px solid #CBD5E1', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                    >
                        <Plus size={14} /> Purchase Return
                    </button>
                    <button 
                        onClick={() => {
                            setCreateDocType('BILL');
                            setFormHeader(prev => ({ ...prev, payment_mode: 'Credit', paid_amount: 0, advance_amount: 0 }));
                            setIsCreateModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.15rem', borderRadius: '10px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)', transition: 'all 0.15s' }}
                    >
                        <Plus size={15} /> New Purchase Bill
                    </button>
                </div>
            </div>

            {/* Vyapar ERP Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.9rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Outward Procurement (At Cost)', value: formatCurrency(Math.round(totalOutwardPayments)), icon: TrendingUp, color: '#059669', bg: '#ECFDF5' },
                    { label: 'Active PO Cycles', value: activePurchaseOrdersCount, icon: ShoppingCart, color: '#2563EB', bg: '#EFF6FF' },
                    { label: 'Claimable Input Tax Credit (ITC)', value: formatCurrency(Number(inputGstCreditSum)), icon: PercentCircle, color: '#7C3AED', bg: '#F5F3FF' },
                    { label: 'Refund Adjustments', value: formatCurrency(Math.round(totalReturnedRefundsSum)), icon: RefreshCw, color: '#D97706', bg: '#FFFBEB' }
                ].map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.9rem 1.15rem', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'default' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                            <stat.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                <button 
                    onClick={() => setActiveTab('purchase-orders')}
                    style={{ 
                        padding: '0.55rem 1.1rem', borderRadius: '10px', 
                        background: activeTab === 'purchase-orders' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'white', 
                        color: activeTab === 'purchase-orders' ? 'white' : '#64748B',
                        border: '1px solid',
                        borderColor: activeTab === 'purchase-orders' ? '#047857' : '#E2E8F0', 
                        fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        boxShadow: activeTab === 'purchase-orders' ? '0 4px 10px rgba(5, 150, 105, 0.2)' : 'none',
                        transition: 'all 0.15s'
                    }}
                >
                    <ShoppingCart size={15} /> Purchase Orders (PO)
                </button>
                <button 
                    onClick={() => setActiveTab('purchase-bills')}
                    style={{ 
                        padding: '0.55rem 1.1rem', borderRadius: '10px', 
                        background: activeTab === 'purchase-bills' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'white', 
                        color: activeTab === 'purchase-bills' ? 'white' : '#64748B',
                        border: '1px solid',
                        borderColor: activeTab === 'purchase-bills' ? '#047857' : '#E2E8F0', 
                        fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        boxShadow: activeTab === 'purchase-bills' ? '0 4px 10px rgba(5, 150, 105, 0.2)' : 'none',
                        transition: 'all 0.15s'
                    }}
                >
                    <FileText size={15} /> Purchase Bills & Invoices
                </button>
                <button 
                    onClick={() => setActiveTab('supplier-returns')}
                    style={{ 
                        padding: '0.55rem 1.1rem', borderRadius: '10px', 
                        background: activeTab === 'supplier-returns' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'white', 
                        color: activeTab === 'supplier-returns' ? 'white' : '#64748B',
                        border: '1px solid',
                        borderColor: activeTab === 'supplier-returns' ? '#047857' : '#E2E8F0', 
                        fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        boxShadow: activeTab === 'supplier-returns' ? '0 4px 10px rgba(5, 150, 105, 0.2)' : 'none',
                        transition: 'all 0.15s'
                    }}
                >
                    <RefreshCw size={15} /> Purchase Returns (Suppliers)
                </button>
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Purchase Orders (PO) */}
            {activeTab === 'purchase-orders' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
                            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or order numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: '38px', padding: '0 1rem 0 2.4rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input 
                                type="date" 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{ height: '38px', padding: '0 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600', color: '#475569', fontSize: '0.82rem', boxSizing: 'border-box' }}
                            />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ height: '38px', padding: '0 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#475569', fontSize: '0.82rem', cursor: 'pointer', boxSizing: 'border-box' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Received">Received</option>
                                <option value="Billed">Billed</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <button 
                                onClick={() => { setSearchTerm(''); setDateFilter(''); setStatusFilter('All'); setColFilters({}); }}
                                title="Reset all filters"
                                style={{ height: '38px', width: '38px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                            >
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-fixed" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'po_number', label: 'PO Details', placeholder: 'PO No', style: { width: '16%' } },
                                { key: 'supplier_name', label: 'Supplier & GST', placeholder: 'Supplier', style: { width: '20%' } },
                                { key: 'items', label: 'Items', placeholder: 'Item', style: { width: '22%' } },
                                { key: 'total', label: 'Outward Payables', placeholder: 'e.g. 5000', style: { width: '14%' } },
                                { key: 'status', label: 'Status', placeholder: 'e.g. Pending', style: { width: '15%' } },
                                { key: '_actions', label: 'Actions', noFilter: true, align: 'right', style: { width: '13%' } }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredPOs.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((po) => (
                                    <tr key={po.purchase_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td className="align-top" style={{ width: '16%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.purchase_number}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '3px' }}>Date: {po.purchase_date} | Due: {po.due_date}</span>
                                        </td>
                                        <td className="align-top" style={{ width: '20%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.supplier_name}</p>
                                            {(po.purchase_type === 'INTERNAL' || po.purchase_type === 'REQUISITION' || String(po.supplier_name || '').toLowerCase().includes('main showroom')) ? (
                                                <span style={{ fontSize: '0.74rem', color: '#6366F1', fontWeight: '800', display: 'block', marginTop: '3px' }}>
                                                    🏬 For: {po.branch_name || 'Branch Showroom'}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '3px' }}>GSTIN: {po.supplier_gstin || 'Unregistered'}</span>
                                            )}
                                        </td>
                                        <td className="align-top" style={{ width: '22%', padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                            {Array.isArray(po.items) && po.items.length > 0 ? (
                                                <div className="max-h-24 overflow-y-auto" style={{ maxHeight: '5.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.25rem' }}>
                                                    {po.items.map((item, idx) => (
                                                        <div key={idx} style={{ background: '#F8FAFC', padding: '0.3rem 0.5rem', borderRadius: '7px', border: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                                                            <p style={{ fontWeight: '700', color: '#334155', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name || item.name || 'Product'}</p>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.7rem', marginTop: '1px' }}>
                                                                <span>Ord: {item.quantity}</span>
                                                                <span style={{ color: '#059669', fontWeight: '700' }}>Rec: {item.received_quantity !== undefined && item.received_quantity !== null && item.received_quantity !== '' ? item.received_quantity : item.quantity} {item.primary_unit || 'pcs'}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '0.76rem', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Package size={13} style={{ color: '#CBD5E1' }} /> Direct Purchase
                                                </span>
                                            )}
                                        </td>
                                        <td className="align-top" style={{ width: '14%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            {(() => {
                                                const totals = computeDocTotals(po.items, po.shipping_charge);
                                                const grandTotal = totals.grand_total || parseFloat(po.grand_total) || 0;
                                                const paidAdv = (parseFloat(po.advance_amount) || 0) + (parseFloat(po.paid_amount) || 0);
                                                const pendingBal = Math.max(0, grandTotal - paidAdv);
                                                return (
                                                    <div>
                                                        <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.98rem', margin: 0, whiteSpace: 'nowrap' }}>{formatCurrency(grandTotal)}</p>
                                                        {paidAdv > 0 && pendingBal > 0 ? (
                                                            <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>Paid: {formatCurrency(paidAdv)}</span>
                                                                <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: '700' }}>Due: {formatCurrency(pendingBal)}</span>
                                                            </div>
                                                        ) : paidAdv >= grandTotal && grandTotal > 0 ? (
                                                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', display: 'block', marginTop: '2px' }}>Paid Adv: {formatCurrency(paidAdv)}</span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '700', display: 'block', marginTop: '2px' }}>Paid Adv: {formatCurrency(po.advance_amount)}</span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="align-top" style={{ width: '15%', padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                            {(() => {
                                                const isInternal = po.purchase_type === 'INTERNAL' || po.purchase_type === 'REQUISITION' || String(po.supplier_name || '').toLowerCase().includes('main showroom');
                                                const statusType = po.supplier_response_type || po.supplier_confirmation_status || po.status;
                                                const isConfirmed = statusType === 'CONFIRMED' || po.status === 'Paid';
                                                const isPartiallyAvailable = statusType === 'PARTIALLY_AVAILABLE';
                                                const isPartiallyAccepted = statusType === 'PARTIAL_ACCEPTED';
                                                const isPartiallyRejected = statusType === 'PARTIAL_REJECTED';
                                                const isNotAvailable = statusType === 'NOT_AVAILABLE';
                                                const isAvailableLater = statusType === 'AVAILABLE_LATER';
                                                const isDateAccepted = statusType === 'DATE_ACCEPTED_BY_CUSTOMER' || statusType === 'DATE_ACCEPTED';
                                                const isDateDeclined = statusType === 'DATE_DECLINED_BY_CUSTOMER' || statusType === 'DATE_DECLINED';
                                                const isProductSent = statusType === 'PRODUCT_SENT' || statusType === 'SENT' || statusType === 'SUPPLIER_SENT';
                                                const isSupplierDeclined = statusType === 'SUPPLIER_DECLINED' || statusType === 'SUPPLIER_DECLINED_AFTER_ACCEPT';

                                                let badgeBg = '#FFFBEB';
                                                let badgeColor = '#B45309';
                                                let badgeIcon = <Clock size={12} />;
                                                let badgeText = 'SENT TO SUPPLIER (PENDING)';
                                                let statusMessage = 'Awaiting Supplier Confirmation';

                                                if (isInternal) {
                                                    if (po.status === 'Completed') {
                                                        badgeBg = '#F0FDF4';
                                                        badgeColor = '#15803D';
                                                        badgeIcon = <CheckCircle2 size={12} />;
                                                        badgeText = 'FULFILLED & TRANSFERRED';
                                                        statusMessage = `Stock transferred to ${po.branch_name || 'Branch'}.`;
                                                    } else {
                                                        badgeBg = '#EEF2FF';
                                                        badgeColor = '#4338CA';
                                                        badgeIcon = <Clock size={12} />;
                                                        badgeText = 'STOCK REQUISITION';
                                                        statusMessage = `Awaiting Main Showroom dispatch.`;
                                                    }
                                                } else if (isConfirmed) {
                                                    badgeBg = '#F0FDF4';
                                                    badgeColor = '#15803D';
                                                    badgeIcon = <CheckCircle2 size={12} />;
                                                    badgeText = 'CONFIRMED BY SUPPLIER';
                                                    statusMessage = 'Supplier has confirmed order.';
                                                } else if (isProductSent) {
                                                    badgeBg = '#F0FDF4';
                                                    badgeColor = '#15803D';
                                                    badgeIcon = <CheckCircle2 size={12} />;
                                                    badgeText = 'PRODUCT SENT';
                                                    statusMessage = 'Supplier dispatched product.';
                                                } else if (isSupplierDeclined) {
                                                    badgeBg = '#FEF2F2';
                                                    badgeColor = '#DC2626';
                                                    badgeIcon = <X size={12} />;
                                                    badgeText = 'SUPPLIER DECLINED';
                                                    statusMessage = 'Supplier declined the order.';
                                                } else if (isDateDeclined) {
                                                    badgeBg = '#FEF2F2';
                                                    badgeColor = '#DC2626';
                                                    badgeIcon = <X size={12} />;
                                                    badgeText = 'DATE DECLINED';
                                                    statusMessage = 'Proposed date not accepted.';
                                                } else if (isDateAccepted) {
                                                    badgeBg = '#EFF6FF';
                                                    badgeColor = '#1D4ED8';
                                                    badgeIcon = <CheckCircle2 size={12} />;
                                                    badgeText = 'DATE ACCEPTED';
                                                    statusMessage = 'Awaiting supplier dispatch.';
                                                } else if (isPartiallyAccepted) {
                                                    badgeBg = '#F0FDF4';
                                                    badgeColor = '#15803D';
                                                    badgeIcon = <CheckCircle2 size={12} />;
                                                    badgeText = 'PARTIAL ACCEPTED';
                                                    statusMessage = po.supplier_status_message || 'Partial quantity accepted.';
                                                } else if (isPartiallyRejected) {
                                                    badgeBg = '#FEF2F2';
                                                    badgeColor = '#DC2626';
                                                    badgeIcon = <X size={12} />;
                                                    badgeText = 'PARTIAL REJECTED';
                                                    statusMessage = po.supplier_status_message || 'Partial quantity rejected.';
                                                } else if (isPartiallyAvailable) {
                                                    badgeBg = '#FFF7ED';
                                                    badgeColor = '#C2410C';
                                                    badgeIcon = <AlertTriangle size={12} />;
                                                    badgeText = 'PARTIAL AVAILABLE';
                                                    statusMessage = po.supplier_status_message || 'Supplier has partial quantity.';
                                                } else if (isNotAvailable) {
                                                    badgeBg = '#FEF2F2';
                                                    badgeColor = '#DC2626';
                                                    badgeIcon = <X size={12} />;
                                                    badgeText = 'NOT AVAILABLE';
                                                    statusMessage = po.supplier_status_message || 'Product not available.';
                                                } else if (isAvailableLater) {
                                                    badgeBg = '#EFF6FF';
                                                    badgeColor = '#1D4ED8';
                                                    badgeIcon = <Clock size={12} />;
                                                    const expDate = po.expected_available_date ? po.expected_available_date : '';
                                                    badgeText = expDate ? `AVAILABLE ON ${expDate}` : 'AVAILABLE LATER';
                                                    statusMessage = expDate ? `Available on ${expDate}.` : (po.supplier_status_message || 'Waiting for availability.');
                                                }

                                                // Parse items breakdown if supplier provided partial availability
                                                let itemsBreakdown = null;
                                                const itemList = po.items || (po.supplier_response_items ? (typeof po.supplier_response_items === 'string' ? JSON.parse(po.supplier_response_items) : po.supplier_response_items) : null);
                                                if (isPartiallyAvailable && Array.isArray(itemList)) {
                                                    const firstIt = itemList[0];
                                                    const totalAvailQty = (firstIt && firstIt.available_quantity !== undefined && firstIt.available_quantity !== null) ? firstIt.available_quantity : 80;
                                                    itemsBreakdown = (
                                                        <div style={{ marginTop: '0.35rem', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '0.4rem 0.6rem', borderRadius: '7px' }}>
                                                            <strong style={{ fontSize: '0.7rem', color: '#9A3412', display: 'block', marginBottom: '0.15rem' }}>Breakdown:</strong>
                                                            {itemList.map((it, idx) => {
                                                                const reqQty = it.quantity || 1;
                                                                const availQty = it.available_quantity !== undefined && it.available_quantity !== null ? it.available_quantity : reqQty;
                                                                return (
                                                                    <div key={idx} style={{ fontSize: '0.68rem', color: '#C2410C', fontWeight: '700' }}>
                                                                        • {it.product_name || it.name || 'Item'}: Req {reqQty} | Avail {availQty}
                                                                    </div>
                                                                );
                                                            })}
                                                            <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleBuyerRespondPartial(po, 'ACCEPT'); }}
                                                                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: 'none', background: '#10B981', color: 'white', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <CheckCircle2 size={11} /> Accept {totalAvailQty}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleBuyerRespondPartial(po, 'REJECT'); }}
                                                                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #EF4444', background: '#FEF2F2', color: '#DC2626', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <X size={11} /> Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                let datePrompt = null;
                                                if (isAvailableLater) {
                                                    const expDateStr = po.expected_available_date || '28-08-2026';
                                                    datePrompt = (
                                                        <div style={{ marginTop: '0.35rem', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.45rem 0.65rem', borderRadius: '8px' }}>
                                                            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.75rem', fontWeight: '750', color: '#1E40AF' }}>
                                                                Available on {expDateStr}?
                                                            </p>
                                                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleBuyerRespondDate(po, 'ACCEPT_DATE'); }}
                                                                    style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: 'none', background: '#10B981', color: 'white', fontWeight: '750', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <CheckCircle2 size={11} /> Yes
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleBuyerRespondDate(po, 'REJECT_DATE'); }}
                                                                    style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #EF4444', background: '#FEF2F2', color: '#DC2626', fontWeight: '750', fontSize: '0.72rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <X size={11} /> No
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                        <div style={{ 
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                                            padding: '0.25rem 0.6rem', borderRadius: '7px',
                                                            background: badgeBg,
                                                            color: badgeColor,
                                                            fontSize: '0.72rem', fontWeight: '800', width: 'fit-content'
                                                        }}>
                                                            {badgeIcon}
                                                            {badgeText}
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', color: badgeColor, fontWeight: '600' }}>
                                                            {statusMessage}
                                                        </span>
                                                        {itemsBreakdown}
                                                        {datePrompt}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="align-middle" style={{ width: '13%', padding: '0.85rem 1rem', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'inline-flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                                                {(() => {
                                                    const isInternal = po.purchase_type === 'INTERNAL' || po.purchase_type === 'REQUISITION' || String(po.supplier_name || '').toLowerCase().includes('main showroom');
                                                    
                                                    if (isInternal) {
                                                        if (po.status === 'Completed') {
                                                            return (
                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: '800', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                                    <CheckCircle2 size={15} /> Dispatched
                                                                </span>
                                                            );
                                                        }
                                                        return (
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    if (window.confirm(`Accept Requisition #${po.purchase_number}?\n\nThis will automatically deduct items from Main Showroom and credit them to ${po.branch_name || 'the requesting branch'}.`)) {
                                                                        fulfillRequisitionMutation.mutate(po.id);
                                                                    }
                                                                }}
                                                                disabled={fulfillRequisitionMutation.isPending}
                                                                title="Accept Requisition & Transfer Stock from Main Showroom to Branch"
                                                                style={{ 
                                                                    padding: '0.45rem 0.8rem', 
                                                                    borderRadius: '8px', 
                                                                    border: 'none', 
                                                                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
                                                                    color: 'white', 
                                                                    fontWeight: '750', 
                                                                    fontSize: '0.78rem', 
                                                                    cursor: fulfillRequisitionMutation.isPending ? 'not-allowed' : 'pointer', 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '0.35rem',
                                                                    whiteSpace: 'nowrap',
                                                                    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)'
                                                                }}
                                                            >
                                                                <ArrowRightLeft size={13} /> {fulfillRequisitionMutation.isPending ? 'Transferring...' : 'Dispatch'}
                                                            </button>
                                                        );
                                                    }

                                                    if (po.status === 'Completed' || (po.supplier_response_type || po.supplier_confirmation_status || po.status) === 'PARTIAL_REJECTED') {
                                                        return (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: '800', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                                <CheckCircle2 size={15} /> Completed
                                                            </span>
                                                        );
                                                    }

                                                    const isConfirmed = Boolean(
                                                        po.supplierConfirmed === true ||
                                                        po.supplier_confirmed === true ||
                                                        po.status === 'CONFIRMED' ||
                                                        po.supplier_response_type === 'CONFIRMED' ||
                                                        po.supplier_confirmation_status === 'CONFIRMED'
                                                    );
                                                    const rawStatusStr = String(po.status || '').toUpperCase();
                                                    const isPending = !isConfirmed || rawStatusStr.includes('PENDING') || rawStatusStr.includes('SENT TO SUPPLIER');

                                                    if (isPending && !isConfirmed) {
                                                        return (
                                                            <div 
                                                                title="Supplier confirmation required before goods can be received."
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '0.35rem', 
                                                                    padding: '0.42rem 0.75rem', 
                                                                    borderRadius: '8px', 
                                                                    background: '#FFFBEB', 
                                                                    border: '1px solid #FEF3C7', 
                                                                    color: '#B45309', 
                                                                    fontSize: '0.74rem', 
                                                                    fontWeight: '750',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                <Clock size={12} style={{ color: '#D97706' }} /> Awaiting Supplier
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleOpenReceiveModal(po)}
                                                            title="Receive Goods into warehouse inventory"
                                                            style={{ 
                                                                padding: '0.48rem 0.85rem', 
                                                                borderRadius: '8px', 
                                                                border: 'none', 
                                                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                                                                color: 'white', 
                                                                fontWeight: '750', 
                                                                fontSize: '0.78rem', 
                                                                cursor: 'pointer', 
                                                                display: 'inline-flex', 
                                                                alignItems: 'center', 
                                                                gap: '0.35rem',
                                                                whiteSpace: 'nowrap',
                                                                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                                                                transition: 'all 0.15s'
                                                            }}
                                                        >
                                                            <PackageOpen size={14} /> Receive Goods
                                                        </button>
                                                    );
                                                })()}
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
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '850', color: '#1E293B' }}>Purchase Bills & Invoices</h3>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.76rem', color: '#64748B' }}>Bills with <strong style={{ color: '#B45309' }}>Pending Goods</strong> status require warehouse stock confirmation.</p>
                        </div>
                        <div style={{ position: 'relative', width: '280px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers or bill numbers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: '38px', padding: '0 1rem 0 2.4rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
                                { key: 'po_number', label: 'Bill Details', placeholder: 'Bill No', style: { width: '16%' } },
                                { key: 'supplier_name', label: 'Supplier & GST', placeholder: 'Supplier', style: { width: '20%' } },
                                { key: 'items', label: 'Items', placeholder: 'Item', style: { width: '22%' } },
                                { key: 'total', label: 'Bill Amount', placeholder: 'e.g. 5000', style: { width: '15%' } },
                                { key: 'status', label: 'Status', placeholder: 'e.g. Pending', style: { width: '14%' } },
                                { key: '_actions', label: 'Actions', noFilter: true, align: 'right', style: { width: '13%' } }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredBills.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((bill) => (
                                    <tr key={bill.id || bill.purchase_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ width: '16%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.purchase_number}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '3px' }}>Date: {bill.purchase_date} | Due: {bill.due_date || '—'}</span>
                                        </td>
                                        <td style={{ width: '20%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.supplier_name}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bill.billing_address || (bill.supplier_gstin ? `GSTIN: ${bill.supplier_gstin}` : 'Unregistered')}</span>
                                        </td>
                                        <td style={{ width: '22%', padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                            {bill.items && bill.items.length > 0 ? (
                                                <div className="max-h-24 overflow-y-auto" style={{ maxHeight: '5.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.25rem' }}>
                                                    {bill.items.map((item, idx) => (
                                                        <div key={idx} style={{ background: '#F8FAFC', padding: '0.3rem 0.5rem', borderRadius: '7px', border: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                                                            <p style={{ fontWeight: '700', color: '#334155', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                                                            <span style={{ color: '#64748B', fontSize: '0.7rem' }}>Qty: {item.quantity} @ {formatCurrency(item.purchase_price)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '0.76rem', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Package size={13} style={{ color: '#CBD5E1' }} /> {bill.notes || 'Inventory Purchases'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ width: '15%', padding: '0.85rem 1rem', verticalAlign: 'top', overflow: 'hidden' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items || [], bill.shipping_charge);
                                                const finalTotal = totals.grand_total || parseFloat(bill.grand_total) || 0;
                                                const paidAmount = (parseFloat(bill.paid_amount) || 0) + (parseFloat(bill.advance_amount) || 0);
                                                const dueAmount = Math.max(0, finalTotal - paidAmount);
                                                const singleTax = (totals.total_tax || 0) / 2;
                                                const isPaid = (bill.payment_status === 'paid' || bill.status === 'paid' || bill.status === 'Paid') || (finalTotal > 0 && paidAmount >= finalTotal);
                                                return (
                                                    <div>
                                                        <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.98rem', margin: 0, whiteSpace: 'nowrap' }}>{formatCurrency(finalTotal)}</p>
                                                        {paidAmount > 0 && dueAmount > 0 ? (
                                                            <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '750' }}>Paid: {formatCurrency(paidAmount)}</span>
                                                                <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: '750' }}>Due: {formatCurrency(dueAmount)}</span>
                                                            </div>
                                                        ) : isPaid ? (
                                                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '750', display: 'block', marginTop: '2px' }}>Paid: {formatCurrency(finalTotal)}</span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: '750', display: 'block', marginTop: '2px' }}>Due: {formatCurrency(finalTotal)}</span>
                                                        )}
                                                        {bill.payment_mode && bill.payment_mode !== 'Credit' && (
                                                            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '600', display: 'block', marginTop: '2px' }}>
                                                                via {bill.payment_mode}
                                                            </span>
                                                        )}
                                                        {singleTax > 0 && (
                                                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '2px' }}>GST: {formatCurrency(totals.total_tax)}</span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ width: '14%', padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items || [], bill.shipping_charge);
                                                const finalTotal = totals.grand_total || parseFloat(bill.grand_total) || 0;
                                                const paidAmount = (parseFloat(bill.paid_amount) || 0) + (parseFloat(bill.advance_amount) || 0);
                                                const dueAmount = Math.max(0, finalTotal - paidAmount);
                                                const isPaid = (bill.payment_status === 'paid' || bill.status === 'paid' || bill.status === 'Paid') || (finalTotal > 0 && paidAmount >= finalTotal);
                                                const isPartial = !isPaid && (bill.payment_status === 'partial' || bill.status === 'partial' || bill.status === 'Partial' || bill.status === 'Partially Paid' || (paidAmount > 0 && dueAmount > 0));

                                                let badgeBg = '#FEF3C7';
                                                let badgeColor = '#B45309';
                                                let badgeBorder = '#FDE68A';
                                                let badgeIcon = <Clock size={11} />;
                                                let badgeText = 'PENDING';

                                                if (isPaid) {
                                                    badgeBg = '#DCFCE7';
                                                    badgeColor = '#15803D';
                                                    badgeBorder = '#BBF7D0';
                                                    badgeIcon = <CheckCircle2 size={11} />;
                                                    badgeText = 'PAID';
                                                } else if (isPartial) {
                                                    badgeBg = '#EFF6FF';
                                                    badgeColor = '#1D4ED8';
                                                    badgeBorder = '#BFDBFE';
                                                    badgeIcon = <Clock size={11} />;
                                                    badgeText = 'PARTIAL';
                                                }

                                                return (
                                                    <div>
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                            padding: '0.22rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800',
                                                            background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}`
                                                        }}>
                                                            {badgeIcon}
                                                            {badgeText}
                                                        </span>
                                                        {isPartial && (
                                                            <div style={{ marginTop: '3px', fontSize: '0.7rem' }}>
                                                                <span style={{ color: '#059669', fontWeight: '750', display: 'block' }}>Paid: {formatCurrency(paidAmount)}</span>
                                                                <span style={{ color: '#B45309', fontWeight: '750', display: 'block' }}>Pending: {formatCurrency(dueAmount)}</span>
                                                            </div>
                                                        )}
                                                        {!isPaid && !isPartial && (
                                                            <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: '700', display: 'block', marginTop: '2px' }}>Due: {formatCurrency(finalTotal)}</span>
                                                        )}
                                                        {bill.status !== 'Completed' ? (
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                                marginTop: '4px', padding: '0.15rem 0.45rem', borderRadius: '5px',
                                                                fontSize: '0.66rem', fontWeight: '750', background: '#FFFBEB', color: '#B45309', border: '1px solid #FEF08A'
                                                            }}>
                                                                <Package size={10} /> Pending Goods
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                                marginTop: '4px', padding: '0.15rem 0.45rem', borderRadius: '5px',
                                                                fontSize: '0.66rem', fontWeight: '750', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0'
                                                            }}>
                                                                <CheckCircle2 size={10} /> In {bill.warehouse_id || 'Warehouse'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ width: '13%', padding: '0.85rem 1rem', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                            {(() => {
                                                const totals = computeDocTotals(bill.items || [], bill.shipping_charge);
                                                const finalTotal = totals.grand_total || parseFloat(bill.grand_total) || 0;
                                                const paidAmount = (parseFloat(bill.paid_amount) || 0) + (parseFloat(bill.advance_amount) || 0);
                                                const dueAmount = Math.max(0, finalTotal - paidAmount);

                                                return (
                                                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                                        {bill.status !== 'Completed' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReceiveModal(bill)}
                                                                title="Receive goods into warehouse inventory"
                                                                style={{
                                                                    padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none',
                                                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                                                    color: 'white',
                                                                    fontWeight: '750', fontSize: '0.75rem', cursor: 'pointer',
                                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                                    whiteSpace: 'nowrap',
                                                                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                                                                }}
                                                            >
                                                                <PackageOpen size={13} /> Receive Goods
                                                            </button>
                                                        )}
                                                        {dueAmount > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenPaymentModal(bill)}
                                                                style={{
                                                                    padding: '0.45rem 0.75rem', borderRadius: '8px',
                                                                    border: '1px solid #BFDBFE',
                                                                    background: '#EFF6FF',
                                                                    color: '#1D4ED8',
                                                                    fontWeight: '750', fontSize: '0.75rem', cursor: 'pointer',
                                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                                    whiteSpace: 'nowrap',
                                                                    transition: 'all 0.15s'
                                                                }}
                                                                title={`Record payment towards remaining ${formatCurrency(dueAmount)}`}
                                                            >
                                                                <CreditCard size={13} /> Pay Balance
                                                            </button>
                                                        ) : (
                                                            <span style={{ display: 'inline-flex', padding: '0.3rem 0.65rem', borderRadius: '7px', background: '#F0FDF4', color: '#15803D', fontSize: '0.74rem', fontWeight: '800' }}>
                                                                {bill.status === 'Completed' ? 'COMPLETED' : 'PAID'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Purchase Returns (Suppliers) */}
            {activeTab === 'supplier-returns' && (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Purchase Returns (Suppliers)</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0', fontWeight: '500' }}>Manage supplier defective product returns, debit notes, and refund statuses.</p>
                        </div>
                        <button 
                            onClick={() => {
                                setCreateDocType('RETURN');
                                setFormHeader(prev => ({ ...prev, payment_mode: 'Credit', paid_amount: 0, advance_amount: 0 }));
                                setIsCreateModalOpen(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)' }}
                        >
                            <Plus size={14} /> New Supplier Return
                        </button>
                    </div>

                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                        <table className="table-fixed" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ width: '20%', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Ref Bill / ID</th>
                                    <th style={{ width: '22%', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier</th>
                                    <th style={{ width: '28%', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Items Returned</th>
                                    <th style={{ width: '15%', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Refund Amount</th>
                                    <th style={{ width: '15%', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierReturnsList.length > 0 ? (
                                    supplierReturnsList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((pr) => (
                                        <tr key={pr.id || pr.return_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td className="align-top" style={{ width: '20%', verticalAlign: 'top', padding: '0.85rem 1rem', fontWeight: '850', color: '#0F172A', overflow: 'hidden' }}>
                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{pr.return_number || pr.purchase_id || pr.purchase_number || `PRN-${pr.id}`}</p>
                                            </td>
                                            <td className="align-top" style={{ width: '22%', verticalAlign: 'top', padding: '0.85rem 1rem', fontWeight: '750', color: '#1E293B', overflow: 'hidden' }}>
                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{pr.supplier_name || 'N/A'}</p>
                                            </td>
                                            <td className="align-top" style={{ width: '28%', verticalAlign: 'top', padding: '0.85rem 1rem' }}>
                                                <div className="max-h-24 overflow-y-auto" style={{ maxHeight: '5.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.25rem' }}>
                                                    {(pr.items || []).map((item, idx) => (
                                                        <div key={idx} style={{ background: '#F8FAFC', padding: '0.3rem 0.5rem', borderRadius: '7px', border: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                                                            <p style={{ fontWeight: '700', color: '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                                                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Qty returned: {item.return_quantity || item.quantity || 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="align-top" style={{ width: '15%', verticalAlign: 'top', padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '900', color: '#B91C1C', overflow: 'hidden' }}>
                                                <span style={{ whiteSpace: 'nowrap', fontSize: '0.92rem' }}>
                                                    {formatCurrency(pr.refund_amount || (pr.items || []).reduce((sum, i) => sum + (i.refund_amount || (i.price * i.return_quantity) || 0), 0))}
                                                </span>
                                            </td>
                                            <td className="align-top" style={{ width: '15%', verticalAlign: 'top', padding: '0.85rem 1rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.25rem 0.6rem', borderRadius: '7px',
                                                    background: pr.status === 'Completed' ? '#F0FDF4' : '#FEF2F2',
                                                    color: pr.status === 'Completed' ? '#15803D' : '#EF4444',
                                                    fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap'
                                                }}>
                                                    {(pr.inspection_status || pr.status || 'Completed').toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    purchaseReturns.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((ret) => (
                                        <tr key={ret.return_id || ret.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td className="align-top" style={{ width: '20%', verticalAlign: 'top', padding: '0.85rem 1rem', fontWeight: '850', color: '#0F172A', overflow: 'hidden' }}>
                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{ret.return_id || ret.doc_number || ret.purchase_number}</p>
                                            </td>
                                            <td className="align-top" style={{ width: '22%', verticalAlign: 'top', padding: '0.85rem 1rem', fontWeight: '750', color: '#1E293B', overflow: 'hidden' }}>
                                                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{ret.supplier_name}</p>
                                            </td>
                                            <td className="align-top" style={{ width: '28%', verticalAlign: 'top', padding: '0.85rem 1rem' }}>
                                                <div className="max-h-24 overflow-y-auto" style={{ maxHeight: '5.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.25rem' }}>
                                                    {(ret.items || ret.returned_items || []).map((item, idx) => (
                                                        <div key={idx} style={{ background: '#F8FAFC', padding: '0.3rem 0.5rem', borderRadius: '7px', border: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                                                            <p style={{ fontWeight: '700', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' }}>{item.product_name}</p>
                                                            <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Returned: {item.quantity || item.return_quantity} Units</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="align-top" style={{ width: '15%', verticalAlign: 'top', padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '900', color: '#B91C1C', overflow: 'hidden' }}>
                                                <span style={{ whiteSpace: 'nowrap', fontSize: '0.92rem' }}>
                                                    {formatCurrency(ret.refund_amount || (ret.returned_items || ret.items || []).reduce((sum, i) => sum + (i.refund_amount || (i.price * i.quantity) || 0), 0))}
                                                </span>
                                            </td>
                                            <td className="align-top" style={{ width: '15%', verticalAlign: 'top', padding: '0.85rem 1rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.25rem 0.6rem', borderRadius: '7px',
                                                    background: '#F0FDF4', color: '#15803D', fontSize: '0.72rem', fontWeight: '800', whiteSpace: 'nowrap'
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

            {/* Structured Goods Receipt Confirmation Modal */}
            {pendingReceiveBill && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '20px', padding: '1.75rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
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
                    <div style={{ background: 'white', width: '100%', maxWidth: '850px', borderRadius: '20px', padding: '1.75rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: createDocType === 'REQUISITION' ? '#4F46E5' : '#064E3B' }}>
                                    {createDocType === 'REQUISITION' 
                                        ? 'New Branch Stock Requisition (Internal PO)'
                                        : (createDocType === 'PO' ? 'New Purchase Order (PO)' : (createDocType === 'BILL' ? 'Register New Purchase Bill' : 'Log Purchase Return (Debit Note)'))
                                    }
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                    {createDocType === 'REQUISITION' 
                                        ? `Requisition Reference: ${formHeader.purchase_number} • Requesting stock from Main Showroom` 
                                        : `Doc Reference: ${formHeader.purchase_number}`
                                    }
                                </p>
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
                                                if (selectedId === 'internal_main') {
                                                    setCreateDocType('REQUISITION');
                                                    setFormHeader({ 
                                                        ...formHeader, 
                                                        supplier_id: 'internal_main',
                                                        supplier_name: 'Main Showroom',
                                                        supplier_gstin: 'INTERNAL-TRANSFER',
                                                        billing_address: 'Main Showroom / Central Warehouse',
                                                        contact_number: 'Internal Stock Depository',
                                                        purchase_type: 'INTERNAL',
                                                        payment_mode: 'Internal Transfer'
                                                    });
                                                    return;
                                                }
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
                                                    if (createDocType === 'RETURN') {
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
                                                    }
                                                }
                                            }} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#0F172A' }}
                                        >
                                            <option value="">-- Select Active Supplier --</option>
                                            <option value="internal_main" style={{ color: '#4F46E5', fontWeight: '800' }}>
                                                🏢 Main Showroom (Internal Stock Requisition)
                                            </option>
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
                            <div style={{ display: 'grid', gridTemplateColumns: createDocType === 'RETURN' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '1rem' }}>
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
                                {createDocType !== 'RETURN' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Target Warehouse</label>
                                        <select 
                                            value={formHeader.warehouse_id} 
                                            onChange={(e) => setFormHeader({ ...formHeader, warehouse_id: e.target.value })} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#0F172A' }}
                                        >
                                            {warehousesList.map(w => (
                                                <option key={w.id || w.name} value={w.name || w.warehouse_name || w.id}>
                                                    {w.name || w.warehouse_name} {w.location ? `(${w.location})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Itemized Grid Section */}
                            <div style={{ background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase' }}><Layers size={16} /> Itemized Products</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {createDocType !== 'RETURN' && (
                                            <button 
                                                type="button" 
                                                onClick={handleGoToCreateProduct}
                                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                                <span>+</span>
                                                <span>Create Product</span>
                                            </button>
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={handleAddItemField} 
                                            className="px-3.5 py-1.5 bg-[#0e4b34] hover:bg-[#093625] text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                            style={{ border: 'none' }}
                                        >
                                            <span>+</span>
                                            <span>Add Row</span>
                                        </button>
                                    </div>
                                </div>

                                {formItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1B6B3A' }}>Product Name</label>
                                            </div>
                                            <select 
                                                required 
                                                value={item.product_id || ''} 
                                                onChange={(e) => {
                                                    const selectedId = e.target.value;
                                                    const prodList = createDocType === 'RETURN' ? supplierProducts : catalogProducts;
                                                    const prod = prodList.find(p => String(p.id || p.product_id) === String(selectedId));
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
                                                <option value="">{createDocType === 'RETURN' ? ((!formHeader.supplier_id && !formHeader.supplier_name) ? '-- Select Supplier First --' : '-- Select Product --') : '-- Select Product --'}</option>
                                                {(createDocType === 'RETURN' ? supplierProducts : catalogProducts).map(p => (
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {!isStarterPlan && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse *</label>
                                            <select
                                                required
                                                value={formHeader.warehouse_id}
                                                onChange={(e) => setFormHeader({ ...formHeader, warehouse_id: e.target.value })}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}
                                            >
                                                <option value="">{(!formItems[0]?.product_id && !formItems[0]?.product_name) ? '-- Select Product First --' : '-- Select Warehouse --'}</option>
                                                {availableWarehouses.map((wh, idx) => (
                                                    <option key={idx} value={wh.name || wh.id}>
                                                        {wh.name || wh.warehouse_name} {wh.code ? `(${wh.code})` : ''} {wh.availableQty !== undefined ? `- ${wh.availableQty} PCS available` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reason for Return</label>
                                        <input type="text" value={formHeader.return_reason} onChange={(e) => setFormHeader({ ...formHeader, return_reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Damaged Goods / Wrong Item Shipped" />
                                    </div>
                                </div>
                            )}

                            {/* Summaries & Action buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase' }}>Payment Mode</label>
                                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                                                {formHeader.payment_mode === 'Credit' ? 'Pending settlement (Credit)' : `Payment via ${formHeader.payment_mode}`}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            {['Credit', 'Cash', 'UPI', 'Bank'].map(mode => {
                                                const isSelected = formHeader.payment_mode === mode;
                                                return (
                                                    <button 
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => {
                                                            const totals = computeDocTotals(formItems, formHeader.shipping_charge);
                                                            const paid = mode === 'Credit' ? 0 : totals.grand_total;
                                                            setFormHeader(prev => ({
                                                                ...prev, 
                                                                payment_mode: mode,
                                                                paid_amount: paid,
                                                                advance_amount: mode === 'Credit' ? 0 : (createDocType === 'PO' ? Math.min(10000, totals.grand_total) : paid)
                                                            }));
                                                        }}
                                                        style={{ 
                                                            flex: 1, padding: '0.75rem', borderRadius: '12px', 
                                                            border: isSelected ? '2px solid #1B6B3A' : '1px solid #DCF2E4',
                                                            background: isSelected ? '#1B6B3A' : 'white',
                                                            color: isSelected ? 'white' : '#1B6B3A',
                                                            fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        {mode === 'Credit' ? 'Credit (Unpaid)' : mode}
                                                    </button>
                                                );
                                            })}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>Paid Amount ({currency.symbol})</label>
                                                <span style={{ fontSize: '0.72rem', color: (parseFloat(formHeader.paid_amount) || 0) > 0 ? '#15803D' : '#D97706', fontWeight: '700' }}>
                                                    {formHeader.payment_mode === 'Credit' || (parseFloat(formHeader.paid_amount) || 0) === 0
                                                        ? 'Unpaid / Pending (Credit)'
                                                        : ((parseFloat(formHeader.paid_amount) || 0) >= computeDocTotals(formItems, formHeader.shipping_charge).grand_total
                                                            ? 'Fully Paid'
                                                            : 'Partially Paid')}
                                                </span>
                                            </div>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={formHeader.paid_amount ?? 0} 
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setFormHeader(prev => ({
                                                        ...prev,
                                                        paid_amount: val,
                                                        payment_mode: val > 0 ? (prev.payment_mode === 'Credit' ? 'Cash' : prev.payment_mode) : 'Credit'
                                                    }));
                                                }} 
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
                                            />
                                            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.35rem' }}>
                                                Set to 0 for Credit purchases to save bill as Unpaid/Pending.
                                            </p>
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
                                } else if (st === 'PARTIAL_ACCEPTED') {
                                    badgeText = 'BUYER ACCEPTED AVAILABLE QUANTITY';
                                    badgeColor = '#15803D';
                                } else if (st === 'PARTIAL_REJECTED') {
                                    badgeText = 'BUYER REJECTED AVAILABLE QUANTITY';
                                    badgeColor = '#DC2626';
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
                                
                                if (st === 'DATE_ACCEPTED_BY_CUSTOMER' || st === 'DATE_ACCEPTED') {
                                    return (
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                disabled={isConfirmingPO}
                                                onClick={() => handleConfirmPOBySupplier(supplierViewPO.id, 'SUPPLIER_DECLINED')}
                                                style={{
                                                    padding: '0.75rem 1.25rem', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                                    color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: '0.4rem'
                                                }}
                                            >
                                                <X size={16} /> Say No to Him
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isConfirmingPO}
                                                onClick={() => handleConfirmPOBySupplier(supplierViewPO.id, 'PRODUCT_SENT')}
                                                style={{
                                                    padding: '0.75rem 1.75rem', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                    color: 'white', border: 'none', fontWeight: '800', fontSize: '0.92rem', cursor: 'pointer',
                                                    boxShadow: '0 8px 16px rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}
                                            >
                                                <CheckCircle2 size={18} /> {isConfirmingPO ? 'SUBMITTING...' : 'Sent'}
                                            </button>
                                        </div>
                                    );
                                }

                                const isResponded = st === 'CONFIRMED' || st === 'PARTIALLY_AVAILABLE' || st === 'NOT_AVAILABLE' || st === 'AVAILABLE_LATER' || st === 'PARTIAL_ACCEPTED' || st === 'PARTIAL_REJECTED' || st === 'DATE_DECLINED_BY_CUSTOMER' || st === 'PRODUCT_SENT' || st === 'SUPPLIER_DECLINED';

                                if (isResponded) {
                                    let respLabel = 'Response Submitted';
                                    let respBg = '#F0FDF4';
                                    let respClr = '#15803D';
                                    if (st === 'PARTIALLY_AVAILABLE') {
                                        respBg = '#FFF7ED'; respClr = '#C2410C'; respLabel = 'Partially Available Submitted';
                                    } else if (st === 'PARTIAL_ACCEPTED') {
                                        respBg = '#F0FDF4'; respClr = '#15803D'; respLabel = 'Buyer Accepted Available Qty';
                                    } else if (st === 'PARTIAL_REJECTED') {
                                        respBg = '#FEF2F2'; respClr = '#DC2626'; respLabel = 'Buyer Rejected Available Qty';
                                    } else if (st === 'NOT_AVAILABLE') {
                                        respBg = '#FEF2F2'; respClr = '#DC2626'; respLabel = 'Not Available Submitted';
                                    } else if (st === 'AVAILABLE_LATER') {
                                        respBg = '#EFF6FF'; respClr = '#1D4ED8'; respLabel = 'Available Later Submitted — Waiting for Buyer Approval';
                                    } else if (st === 'DATE_DECLINED_BY_CUSTOMER') {
                                        respBg = '#FEF2F2'; respClr = '#DC2626'; respLabel = 'Buyer Declined Proposed Available Date';
                                    } else if (st === 'PRODUCT_SENT') {
                                        respBg = '#F0FDF4'; respClr = '#15803D'; respLabel = 'Product Sent Successfully';
                                    } else if (st === 'SUPPLIER_DECLINED') {
                                        respBg = '#FEF2F2'; respClr = '#DC2626'; respLabel = 'Supplier Declined Order';
                                    }
                                    return (
                                        <span style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', background: respBg, color: respClr, fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <CheckCircle2 size={16} /> {respLabel}
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

            {/* Record Purchase Payment Modal */}
            {isPaymentModalOpen && paymentDoc && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>Record Payment</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>{paymentDoc.purchase_number} • {paymentDoc.supplier_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmitPayment}>
                            {/* Summary cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', fontWeight: '600' }}>Bill Amount</span>
                                    <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', marginTop: '2px' }}>{formatCurrency(paymentDoc.grand_total || 0)}</strong>
                                </div>
                                <div style={{ background: '#F0FDF4', padding: '0.75rem', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                                    <span style={{ fontSize: '0.68rem', color: '#15803D', display: 'block', fontWeight: '600' }}>Already Paid</span>
                                    <strong style={{ fontSize: '0.88rem', color: '#15803D', display: 'block', marginTop: '2px' }}>{formatCurrency((parseFloat(paymentDoc.paid_amount) || 0) + (parseFloat(paymentDoc.advance_amount) || 0))}</strong>
                                </div>
                                <div style={{ background: '#FEF3C7', padding: '0.75rem', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                                    <span style={{ fontSize: '0.68rem', color: '#B45309', display: 'block', fontWeight: '600' }}>Pending Due</span>
                                    <strong style={{ fontSize: '0.88rem', color: '#B45309', display: 'block', marginTop: '2px' }}>
                                        {formatCurrency(Math.max(0, (parseFloat(paymentDoc.grand_total) || 0) - ((parseFloat(paymentDoc.paid_amount) || 0) + (parseFloat(paymentDoc.advance_amount) || 0))))}
                                    </strong>
                                </div>
                            </div>

                            {/* Payment Amount Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>Payment Amount ({currency.symbol})</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    required
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: '750', boxSizing: 'border-box', outline: 'none' }}
                                />
                            </div>

                            {/* Payment Mode Selection */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>Payment Mode</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Cash', 'Bank', 'UPI'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentMode(m)}
                                            style={{
                                                flex: 1, padding: '0.6rem', borderRadius: '9px',
                                                border: paymentMode === m ? '2px solid #059669' : '1px solid #E2E8F0',
                                                background: paymentMode === m ? '#F0FDF4' : 'white',
                                                color: paymentMode === m ? '#047857' : '#64748B',
                                                fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bank Account Selection if Bank or UPI */}
                            {(paymentMode === 'Bank' || paymentMode === 'UPI') && (
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', color: '#334155', marginBottom: '0.35rem' }}>Select Bank Account</label>
                                    <select
                                        value={paymentBankAccountId}
                                        onChange={(e) => setPaymentBankAccountId(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box', background: 'white' }}
                                    >
                                        <option value="">-- Default Account --</option>
                                        {bankAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.bank_name} ({formatCurrency(acc.current_balance)})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid #CBD5E1', background: 'white', color: '#64748B', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPayment}
                                    style={{
                                        padding: '0.6rem 1.35rem', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                        color: 'white', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)'
                                    }}
                                >
                                    {isSubmittingPayment ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receive Goods & Warehouse Selection Modal */}
            <ReceiveGoodsModal
                isOpen={isReceiveModalOpen && !!selectedDoc}
                doc={selectedDoc}
                warehousesList={warehousesList}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setSelectedDoc(null);
                }}
                onConfirm={handleConfirmReceiveGoods}
            />

            {/* Quick Create Product Modal */}
            <NewProductModal
                isOpen={isNewProductModalOpen}
                onClose={() => setIsNewProductModalOpen(false)}
                onSuccess={handleProductCreated}
            />
        </div>
    );
};

export default BusinessPurchases;
