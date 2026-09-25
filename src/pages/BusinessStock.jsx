import React, { useState, useEffect } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService, warehouseService, productsService, posService, billingService } from '../services';
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
    Zap,
    Users,
    ShoppingBag,
    Eye,
    Settings
} from 'lucide-react';
import '../App.css';
import { useCurrency } from '../context';

const BarChartIcon = ({ size = 16 }) => (
    <span style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>📊</span>
);

const BusinessStock = () => {
    const { formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('registry');
    const [colFilters, setColFilters] = React.useState({}); // 'registry', 'movement', 'warehouse', 'batch', 'selling_history'
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedHistoryProductId, setSelectedHistoryProductId] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);

    // Selling History & Date Interval Customization
    const [dateInterval, setDateInterval] = useState('7days'); // 'today' | '7days' | 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isCustomizeViewOpen, setIsCustomizeViewOpen] = useState(false);
    const [customerListModal, setCustomerListModal] = useState(null);
    const [savedBills, setSavedBills] = useState([]);

    useEffect(() => {
        try {
            const local = localStorage.getItem('cliks_billing_records_v1');
            setSavedBills(local ? JSON.parse(local) : []);
        } catch {
            setSavedBills([]);
        }
    }, []);

    // Fetch Live POS Orders
    const { data: posOrders = [] } = useQuery({
        queryKey: ['pos-orders-stock'],
        queryFn: () => posService.getOrders({ limit: 500 }).catch(() => [])
    });

    // Fetch Invoices
    const { data: billingInvoices = [] } = useQuery({
        queryKey: ['billing-invoices-stock'],
        queryFn: () => billingService.getInvoices().catch(() => [])
    });

    // Fetch Live Registered Products Catalog (Inventory -> Products)
    const { data: dbProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

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

    // Safe unified mapping of DB products & stock items with strict Damaged Godown exclusion
    const stocks = React.useMemo(() => {
        const list = [];
        const seenNames = new Set();

        const safeProds = Array.isArray(dbProducts) ? dbProducts : [];
        safeProds.forEach(p => {
            if (!p) return;
            const nameKey = (p.name || '').toLowerCase().trim();
            if (nameKey) seenNames.add(nameKey);

            const warehouseName = p.warehouse_id || p.warehouse || 'Main Godown';
            const isDamagedGodown = String(warehouseName).toLowerCase().includes('damaged');
            const rawQty = parseFloat(p.quantity ?? p.opening_stock ?? 0) || 0;
            const damagedQty = isDamagedGodown ? rawQty : (parseFloat(p.damaged_stock ?? 0) || 0);
            const sellableQty = isDamagedGodown ? 0 : Math.max(0, rawQty - damagedQty);

            list.push({
                stock_id: `STK-${p.id}`,
                id: p.id,
                product_id: p.sku || `PROD-${p.id}`,
                product_name: p.name || 'Unnamed Product',
                opening_stock: parseFloat(p.opening_stock || p.quantity || 0),
                current_stock: rawQty,
                available_stock: sellableQty,
                damaged_stock: damagedQty,
                is_damaged_facility: isDamagedGodown,
                minimum_stock: parseFloat(p.min_stock || 5),
                purchase_cost: parseFloat(p.purchase_price || p.unit_price || 0),
                average_cost: parseFloat(p.purchase_price || p.unit_price || 0),
                selling_value: parseFloat(p.selling_price || (p.purchase_price * 1.2) || 0),
                warehouse_name: warehouseName,
                rack_number: p.rack_number || 'Rack A-1'
            });
        });

        const safeStocks = Array.isArray(dbStocks) ? dbStocks : [];
        safeStocks.forEach(s => {
            if (!s) return;
            const nameKey = (s.name || '').toLowerCase().trim();
            if (nameKey && seenNames.has(nameKey)) return;
            if (nameKey) seenNames.add(nameKey);

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
            const isDamagedGodown = String(warehouseName).toLowerCase().includes('damaged');
            const rawQty = parseFloat(s.quantity || 0);
            const damagedQty = isDamagedGodown ? rawQty : 0;
            const sellableQty = isDamagedGodown ? 0 : rawQty;

            list.push({
                stock_id: `STK-${s.id}`,
                id: s.id,
                product_id: s.sku || `PROD-${s.id}`,
                product_name: s.name || 'Unnamed Stock Item',
                opening_stock: parseFloat(s.opening_stock || 10),
                current_stock: rawQty,
                available_stock: sellableQty,
                damaged_stock: damagedQty,
                is_damaged_facility: isDamagedGodown,
                minimum_stock: parseFloat(s.low_stock_threshold || 5),
                purchase_cost: parseFloat(s.unit_price || 0),
                average_cost: parseFloat(s.unit_price || 0),
                selling_value: parseFloat((s.unit_price || 0) * 1.2),
                warehouse_name: warehouseName,
                rack_number: rackNumber
            });
        });

        return list;
    }, [dbProducts, dbStocks]);

    // Match sales items from POS / Billing to product inventory
    const matchesProduct = (item, product) => {
        if (!item || !product) return false;
        const prodName = (product.product_name || product.name || '').toLowerCase().trim();
        const itemName = (item.productName || item.name || item.product_name || item.description || '').toLowerCase().trim();
        if (prodName && itemName && (prodName === itemName || itemName.includes(prodName) || prodName.includes(itemName))) {
            return true;
        }
        const prodId = String(product.id || product.product_id || '').toLowerCase().trim();
        const itemId = String(item.productId || item.product_id || item.id || '').toLowerCase().trim();
        if (prodId && itemId && (prodId === itemId || itemId.includes(prodId) || prodId.includes(itemId))) {
            return true;
        }
        const prodSku = String(product.product_id || product.sku || '').toLowerCase().trim();
        const itemSku = String(item.sku || '').toLowerCase().trim();
        if (prodSku && itemSku && prodSku === itemSku) {
            return true;
        }
        return false;
    };

    // Deduplicate merged POS receipts and internal Sales Orders
    const deduplicateSalesTransactions = (salesList) => {
        if (!Array.isArray(salesList) || salesList.length === 0) return [];

        const result = [];

        salesList.forEach(tx => {
            const cust = (tx.customerName || 'Walk-in Customer').trim().toLowerCase();
            const units = parseFloat(tx.quantity || 1) || 1;
            const total = parseFloat(tx.total ?? ((tx.price || 0) * units) ?? 0).toFixed(2);
            const dateObj = tx.date ? new Date(tx.date) : null;
            const purchaseDate = (dateObj && !isNaN(dateObj.getTime()))
                ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'N/A';

            const compositeKey = `${cust}_${units}_${total}_${purchaseDate}`;

            const txBillId = String(tx.billId || '').trim();
            const txRawId = tx.rawId !== undefined && tx.rawId !== null ? String(tx.rawId).trim() : '';
            const txOrderNum = String(tx.orderNumber || '').trim();
            const txInvNum = String(tx.invoiceNumber || '').trim();

            const existingIdx = result.findIndex(existing => {
                const exBillId = String(existing.billId || '').trim();
                const exRawId = existing.rawId !== undefined && existing.rawId !== null ? String(existing.rawId).trim() : '';
                const exOrderNum = String(existing.orderNumber || '').trim();
                const exInvNum = String(existing.invoiceNumber || '').trim();

                // 1. Direct ID / Linked ID match
                const idMatched = (
                    (txBillId && exBillId && txBillId === exBillId) ||
                    (txRawId && exRawId && txRawId === exRawId) ||
                    (txRawId && exBillId && txRawId === exBillId) ||
                    (txBillId && exRawId && txBillId === exRawId) ||
                    (txBillId && exOrderNum && txBillId === exOrderNum) ||
                    (txBillId && exInvNum && txBillId === exInvNum) ||
                    (exBillId && txOrderNum && exBillId === txOrderNum) ||
                    (exBillId && txInvNum && exBillId === txInvNum)
                );
                if (idMatched) return true;

                // If both transactions have different explicit database raw IDs, they are distinct
                if (txRawId && exRawId && txRawId !== exRawId) {
                    return false;
                }

                // 2. Composite key match: customerName + unitsPurchased + totalAmount + purchaseDate
                const exCust = (existing.customerName || 'Walk-in Customer').trim().toLowerCase();
                const exUnits = parseFloat(existing.quantity || 1) || 1;
                const exTotal = parseFloat(existing.total ?? ((existing.price || 0) * exUnits) ?? 0).toFixed(2);
                const exDateObj = existing.date ? new Date(existing.date) : null;
                const exPurchaseDate = (exDateObj && !isNaN(exDateObj.getTime()))
                    ? exDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A';
                const exComposite = `${exCust}_${exUnits}_${exTotal}_${exPurchaseDate}`;

                if (compositeKey === exComposite) {
                    // Two distinct retail POS receipts (e.g. POS-906739 and POS-414825) are distinct transactions
                    const isTxPos = txBillId.startsWith('POS-');
                    const isExPos = exBillId.startsWith('POS-');
                    if (isTxPos && isExPos && txBillId !== exBillId) {
                        return false;
                    }
                    // Two distinct numeric order IDs (e.g. 450 vs 449) are distinct transactions
                    if (!isTxPos && !isExPos && txBillId && exBillId && txBillId !== exBillId) {
                        return false;
                    }
                    // Linked duplicate POS receipt & internal Sales Order
                    return true;
                }

                return false;
            });

            if (existingIdx === -1) {
                result.push(tx);
            } else {
                // If the new one has a Retail POS receipt ID (e.g. POS-XXXXXX), keep/upgrade to it
                const existing = result[existingIdx];
                const isTxPos = txBillId.startsWith('POS-');
                const isExPos = String(existing.billId || '').startsWith('POS-');

                if (isTxPos && !isExPos) {
                    result[existingIdx] = {
                        ...existing,
                        ...tx,
                        billId: tx.billId,
                        rawId: tx.rawId || existing.rawId
                    };
                }
            }
        });

        return result;
    };

    // Unified Sales Transactions from POS Orders, Saved Billing Records, and Invoices
    const allSalesTransactions = React.useMemo(() => {
        const list = [];

        // 1. From POS Orders (/pos)
        (Array.isArray(posOrders) ? posOrders : []).forEach(order => {
            const orderId = order.invoice_number || order.order_number || order.id || order.bill_id || `ORD-${order.id}`;
            const customerName = order.client_name || order.customer_name || order.party_name || 'Walk-in Customer';
            const orderDate = order.created_at || order.order_date || order.date;
            const items = Array.isArray(order.items) ? order.items : [];

            items.forEach(item => {
                list.push({
                    source: 'POS',
                    billId: orderId,
                    rawId: order.id,
                    orderNumber: order.order_number,
                    invoiceNumber: order.invoice_number,
                    customerName: customerName,
                    date: orderDate ? new Date(orderDate) : new Date(),
                    productName: item.name || item.product_name || item.description || '',
                    productId: item.product_id || item.id || '',
                    sku: item.sku || '',
                    quantity: parseFloat(item.quantity ?? item.qty ?? 1) || 1,
                    price: parseFloat(item.price ?? item.unit_price ?? item.rate ?? 0) || 0,
                    total: parseFloat(item.total ?? (item.price * item.quantity) ?? 0) || 0
                });
            });
        });

        // 2. From Saved Billing Records (SimpleBilling / POS Billing records)
        (Array.isArray(savedBills) ? savedBills : []).forEach(bill => {
            const billId = bill.id || bill.billingOrder || 'BILL-REF';
            const customerName = bill.customerName || 'Walk-in Customer';
            const billDate = bill.date || bill.created_at;
            const products = Array.isArray(bill.products) ? bill.products : [];

            products.forEach(p => {
                list.push({
                    source: 'Billing',
                    billId: billId,
                    rawId: bill.id,
                    orderNumber: bill.billingOrder,
                    customerName: customerName,
                    date: billDate ? new Date(billDate) : new Date(),
                    productName: p.name || '',
                    productId: p.id || '',
                    sku: p.sku || '',
                    quantity: parseFloat(p.quantity || 1) || 1,
                    price: parseFloat(p.rate || p.price || 0) || 0,
                    total: parseFloat(p.total || ((p.rate || 0) * (p.quantity || 1)) || 0)
                });
            });
        });

        // 3. From Invoices
        (Array.isArray(billingInvoices) ? billingInvoices : []).forEach(inv => {
            const invId = inv.invoice_number || inv.id || 'INV-REF';
            const customerName = inv.customer_name || inv.party_name || inv.client_name || 'General Customer';
            const invDate = inv.invoice_date || inv.created_at || inv.due_date;
            const items = Array.isArray(inv.items) ? inv.items : [];

            items.forEach(item => {
                list.push({
                    source: 'Invoice',
                    billId: invId,
                    rawId: inv.id,
                    invoiceNumber: inv.invoice_number,
                    orderNumber: inv.order_number,
                    customerName: customerName,
                    date: invDate ? new Date(invDate) : new Date(),
                    productName: item.name || item.item_name || item.description || '',
                    productId: item.product_id || item.id || '',
                    sku: item.sku || '',
                    quantity: parseFloat(item.quantity || 1) || 1,
                    price: parseFloat(item.unit_price || item.rate || item.price || 0) || 0,
                    total: parseFloat(item.total_amount || item.total || 0) || 0
                });
            });
        });

        return list;
    }, [posOrders, savedBills, billingInvoices]);

    // Product Detail and Daily/Weekly Selling History Data
    const productSellingHistoryData = React.useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return stocks.map(product => {
            const rawProductSales = allSalesTransactions.filter(tx => matchesProduct(tx, product));
            const productSales = deduplicateSalesTransactions(rawProductSales);

            // Daily sales (today)
            const dailySales = productSales.filter(tx => {
                if (!tx.date) return false;
                const dt = new Date(tx.date);
                return dt.toISOString().split('T')[0] === todayStr || (now.getTime() - dt.getTime() < 24 * 60 * 60 * 1000 && dt.getDate() === now.getDate());
            });
            const dailyQty = dailySales.reduce((sum, tx) => sum + tx.quantity, 0);
            const dailyAmount = dailySales.reduce((sum, tx) => sum + (tx.total || (tx.quantity * tx.price)), 0);

            // Weekly sales (last 7 days)
            const weeklySales = productSales.filter(tx => {
                if (!tx.date) return false;
                const dt = new Date(tx.date);
                return dt >= sevenDaysAgo && dt <= now;
            });
            const weeklyQty = weeklySales.reduce((sum, tx) => sum + tx.quantity, 0);
            const weeklyAmount = weeklySales.reduce((sum, tx) => sum + (tx.total || (tx.quantity * tx.price)), 0);

            // Custom / Selected interval sales
            let intervalSales = productSales;
            if (dateInterval === 'today') {
                intervalSales = dailySales;
            } else if (dateInterval === '7days') {
                intervalSales = weeklySales;
            } else if (dateInterval === 'custom' && (customStartDate || customEndDate)) {
                intervalSales = productSales.filter(tx => {
                    if (!tx.date) return false;
                    const dt = new Date(tx.date).getTime();
                    const start = customStartDate ? new Date(customStartDate).getTime() : 0;
                    const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
                    return dt >= start && dt <= end;
                });
            }
            const intervalQty = intervalSales.reduce((sum, tx) => sum + tx.quantity, 0);
            const intervalAmount = intervalSales.reduce((sum, tx) => sum + (tx.total || (tx.quantity * tx.price)), 0);

            // Unique customers who bought this item
            const uniqueCustomers = Array.from(new Set(productSales.map(tx => (tx.customerName || 'Walk-in Customer').trim())));

            return {
                ...product,
                starting_quantity: product.opening_stock ?? 0,
                dailyQty,
                dailyAmount,
                weeklyQty,
                weeklyAmount,
                intervalQty,
                intervalAmount,
                purchases: productSales,
                customerCount: uniqueCustomers.length,
                uniqueCustomers
            };
        });
    }, [stocks, allSalesTransactions, dateInterval, customStartDate, customEndDate]);

    const totalDailySoldQty = productSellingHistoryData.reduce((sum, p) => sum + p.dailyQty, 0);
    const totalDailySoldAmount = productSellingHistoryData.reduce((sum, p) => sum + p.dailyAmount, 0);
    const totalWeeklySoldQty = productSellingHistoryData.reduce((sum, p) => sum + p.weeklyQty, 0);
    const totalWeeklySoldAmount = productSellingHistoryData.reduce((sum, p) => sum + p.weeklyAmount, 0);

    const filteredSellingHistory = productSellingHistoryData.filter(item =>
        (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.product_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.warehouse_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uniqueCustomers.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

    // Map registered catalog products (Inventory -> Products) & dbStocks into a unified list for Stock Transfer
    const transferProductsList = React.useMemo(() => {
        const list = [];
        const seenIds = new Set();

        const safeProducts = Array.isArray(dbProducts) ? dbProducts : [];
        safeProducts.forEach(p => {
            if (p && p.id != null) {
                const idKey = `prod_${p.id}`;
                if (!seenIds.has(idKey)) {
                    seenIds.add(idKey);
                    list.push({
                        id: p.id,
                        unique_id: idKey,
                        product_id: p.sku || `PROD-${p.id}`,
                        name: p.name || p.product_name || `Product #${p.id}`,
                        sku: p.sku || 'N/A',
                        quantity: parseFloat(p.quantity) || 0,
                        available_stock: parseFloat(p.quantity) || 0,
                        purchase_price: parseFloat(p.purchase_price || p.unit_price || p.price || 0),
                        unit: p.unit || 'PCS',
                        warehouse_name: p.warehouse_id || p.warehouse_name || p.location || 'Main Godown'
                    });
                }
            }
        });

        const safeStocks = Array.isArray(stocks) ? stocks : [];
        safeStocks.forEach(s => {
            if (s && s.id != null) {
                const idKey = `stk_${s.id}`;
                const nameMatches = list.some(item => item.name.toLowerCase() === (s.product_name || '').toLowerCase());
                if (!nameMatches && !seenIds.has(idKey)) {
                    seenIds.add(idKey);
                    list.push({
                        id: s.id,
                        unique_id: idKey,
                        product_id: s.product_id || `PROD-${s.id}`,
                        name: s.product_name || `Stock Item #${s.id}`,
                        sku: s.product_id || 'N/A',
                        quantity: parseFloat(s.available_stock) || 0,
                        available_stock: parseFloat(s.available_stock) || 0,
                        purchase_price: parseFloat(s.average_cost) || 0,
                        unit: 'PCS',
                        warehouse_name: s.warehouse_name || 'Main Godown'
                    });
                }
            }
        });

        return list;
    }, [dbProducts, stocks]);

    // Initialize forms when product list and warehouses are available
    useEffect(() => {
        if (transferProductsList.length > 0) {
            setAdjustmentForm(prev => {
                if (!prev.product_id) return prev;
                const exists = transferProductsList.some(p => String(p.id) === String(prev.product_id));
                if (!exists) {
                    return { ...prev, product_id: '' };
                }
                return prev;
            });
        }
    }, [transferProductsList]);

    useEffect(() => {
        if (transferProductsList.length > 0) {
            setTransferForm(prev => {
                if (!prev.product_id) return prev;
                const exists = transferProductsList.some(p => String(p.id) === String(prev.product_id));
                if (!exists) {
                    return { ...prev, product_id: '' };
                }
                return prev;
            });
        }
    }, [transferProductsList]);

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
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stockStats'] });
            queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
            alert('Stock Adjustment audited & running ledger counts revalued successfully!');
            setIsAdjustmentModalOpen(false);
        }
    });

    const transferMutation = useMutation({
        mutationFn: ({ from_warehouse_id, to_warehouse_id, stock_id, qty, reference }) => 
            warehouseService.transferStock(from_warehouse_id, {
                from_warehouse_id,
                to_warehouse_id,
                stock_id,
                quantity: qty,
                reference
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseProducts'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseTransfers'] });
            alert('Stock successfully moved between warehouse logs!');
            setIsTransferModalOpen(false);
        }
    });

    const handleSaveAdjustment = (e) => {
        e.preventDefault();
        const productIdStr = String(adjustmentForm.product_id || '');
        const adjustQty = parseFloat(adjustmentForm.qty) || 0;

        if (!productIdStr) {
            alert('Please select a product from the list to adjust stock counts.');
            return;
        }

        if (adjustQty <= 0) {
            alert('Please enter a valid adjustment quantity greater than 0.');
            return;
        }

        const selectedProd = transferProductsList.find(p => String(p.id) === productIdStr);
        const currentQty = selectedProd ? (parseFloat(selectedProd.quantity) || 0) : 0;

        if (adjustmentForm.adjustment_type === 'reduce' && adjustQty > currentQty) {
            alert(`Cannot reduce stock by ${adjustQty} ${selectedProd?.unit || 'units'} because only ${currentQty} ${selectedProd?.unit || 'units'} are available for "${selectedProd?.name || 'this product'}".`);
            return;
        }

        const delta = adjustmentForm.adjustment_type === 'add' ? adjustQty : -adjustQty;
        const stockId = parseInt(productIdStr);

        if (stockId) {
            adjustMutation.mutate({ id: stockId, delta });
        }
    };

    const handleSaveTransfer = (e) => {
        e.preventDefault();
        const productIdStr = String(transferForm.product_id || '');
        const transQty = parseFloat(transferForm.qty) || 0;
        const fromWhId = String(transferForm.from_warehouse_id || '');
        const toWhId = String(transferForm.to_warehouse_id || '');

        // 0. Product Selection Validation
        if (!productIdStr) {
            alert('Please select a product from the list to initiate stock transfer.');
            return;
        }

        // 1. Warehouse Validation: From Warehouse != To Warehouse
        if (fromWhId && toWhId && fromWhId.trim().toLowerCase() === toWhId.trim().toLowerCase()) {
            alert('Source (From) and Destination (To) warehouses must be different. Please select a different destination warehouse.');
            return;
        }

        // 2. Stock Validation: Cannot transfer > available stock
        const selectedProd = transferProductsList.find(p => String(p.id) === productIdStr);
        const availableQty = selectedProd ? (parseFloat(selectedProd.quantity) || 0) : 0;

        if (transQty <= 0) {
            alert('Please enter a valid transfer quantity greater than 0.');
            return;
        }

        if (transQty > availableQty) {
            alert(`Insufficient stock! Cannot transfer ${transQty} ${selectedProd?.unit || 'units'} because only ${availableQty} ${selectedProd?.unit || 'units'} are available for "${selectedProd?.name || 'this product'}".`);
            return;
        }

        if (fromWhId && toWhId && productIdStr) {
            transferMutation.mutate({
                from_warehouse_id: fromWhId,
                to_warehouse_id: toWhId,
                stock_id: productIdStr,
                qty: transQty,
                reference: transferForm.reference || 'MIG-TRF-12'
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
                    { label: 'Total Inventory Valuation (Cost basis)', value: formatCurrency(totalInventoryValue), icon: DollarSign, color: '#EC4899', bg: '#FDF2F8' },
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
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                    { 
                        id: 'registry', 
                        label: 'Stock Registry & Valuation', 
                        icon: Layers, 
                        gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', 
                        shadowColor: 'rgba(236, 72, 153, 0.15)',
                        description: 'Shows your products, available stock, and the value/cost of your inventory.',
                        example: '50 units × ₹100 cost = ₹5,000 stock value.'
                    },
                    { 
                        id: 'warehouse', 
                        label: 'Warehouse Transfers', 
                        icon: Warehouse, 
                        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                        shadowColor: 'rgba(139, 92, 246, 0.15)',
                        description: 'Used to move products from one warehouse to another.',
                        example: 'Main Warehouse → Chennai Branch: 10 units.'
                    },
                    { 
                        id: 'batch', 
                        label: 'Batches & Expiries', 
                        icon: Calendar, 
                        gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', 
                        shadowColor: 'rgba(16, 185, 129, 0.15)',
                        description: 'Used for products that have batches and expiry dates, especially food, medicine, cosmetics, etc.',
                        example: 'Milk Batch B102 → Expiry: 20-08-2026.'
                    },
                    { 
                        id: 'selling_history', 
                        label: 'Product Detail & Daily Selling History', 
                        icon: BarChartIcon, 
                        gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
                        shadowColor: 'rgba(37, 99, 235, 0.15)',
                        description: 'Product starting quantity, current stock, daily & weekly sales breakdown, and customer purchase records.',
                        example: 'iPhone 15: Sold 3 units today (₹2,40,000) • 5 Customers.'
                    }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        title={`${tab.description}\nExample: ${tab.example}`}
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

            {/* Active Tab Info Description Banner */}
            {(() => {
                const tabDescriptions = {
                    registry: {
                        desc: "Shows your products, available stock, and the value/cost of your inventory.",
                        example: "50 units × ₹100 cost = ₹5,000 stock value."
                    },
                    movement: {
                        desc: "Shows the history of stock coming in and going out.\nInward = stock added/purchased. Outward = stock sold/removed.",
                        example: "Purchase +20 units, Sale −5 units."
                    },
                    warehouse: {
                        desc: "Used to move products from one warehouse to another.",
                        example: "Main Warehouse → Chennai Branch: 10 units."
                    },
                    batch: {
                        desc: "Used for products that have batches and expiry dates, especially food, medicine, cosmetics, etc.",
                        example: "Milk Batch B102 → Expiry: 20-08-2026."
                    },
                    selling_history: {
                        desc: "Track product starting stock, current stock, daily & weekly sales performance and customer purchase records.",
                        example: "iPhone 15: Sold 3 units today (₹2,40,000) • 5 Customers."
                    }
                };
                const current = tabDescriptions[activeTab];
                if (!current) return null;
                return (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.65rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '500', lineHeight: 1.4 }}>
                            {current.desc.split('\n').map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                        </div>
                        <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#0F172A', fontWeight: '600', flexShrink: 0 }}>
                            <span style={{ color: '#64748B', fontWeight: '700' }}>Example:</span> {current.example}
                        </div>
                    </div>
                );
            })()}
            
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
        { key: 'valuation', label: 'Total Valuation', placeholder: 'e.g. 50000' }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredStocks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((st) => {
                                    const valuation = st.current_stock * st.average_cost;
                                    return (
                                        <tr key={st.stock_id} onClick={() => setSelectedStock(st)} style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background='white'}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.95rem' }}>{st.product_name}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Product ID: {st.product_id}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <MapPin size={14} style={{ color: st.is_damaged_facility ? '#EF4444' : '#64748B' }} />
                                                    <span style={{ fontWeight: '700', color: st.is_damaged_facility ? '#EF4444' : '#475569' }}>{st.warehouse_name} ({st.rack_number})</span>
                                                </div>
                                                {st.is_damaged_facility && (
                                                    <span style={{ fontSize: '0.68rem', background: '#FEF2F2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px', fontWeight: '850', display: 'inline-block', marginTop: '2px' }}>
                                                        ⚠️ DAMAGED GODOWN (EXCLUDED FROM SELLABLE STOCK)
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>{st.current_stock} pcs</td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '800', color: st.available_stock > 0 ? '#10B981' : '#64748B' }}>
                                                {st.available_stock} pcs {st.is_damaged_facility && <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: '800' }}>(0 Sellable)</span>}
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ color: '#EF4444', fontWeight: '700' }}>{st.damaged_stock} Dmg</span> / <span style={{ color: '#B45309', fontWeight: '700' }}>{st.expired_stock || 0} Exp</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>{formatCurrency(st.average_cost)}</td>
                                            <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#064E3B' }}>{formatCurrency(valuation)}</td>
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

            {/* Tab: Product Detail & Daily Selling History */}
            {activeTab === 'selling_history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* 3-Metric Summary Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                        <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tracked Catalog Items</p>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0F172A', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>{stocks.length} Products</h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                                <Layers size={22} />
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Sold Volume (Today)</p>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#16A34A', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>
                                    {totalDailySoldQty} Units <span style={{ fontSize: '1rem', fontWeight: '700', color: '#059669' }}>({formatCurrency(totalDailySoldAmount)})</span>
                                </h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A', flexShrink: 0 }}>
                                <TrendingUp size={22} />
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Weekly Sold Volume (7 Days)</p>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563EB', margin: '0.2rem 0 0 0', letterSpacing: '-0.02em' }}>
                                    {totalWeeklySoldQty} Units <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1D4ED8' }}>({formatCurrency(totalWeeklySoldAmount)})</span>
                                </h3>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                                <ShoppingBag size={22} />
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        {/* Toolbar: Search and Customize View button */}
                        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
                                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search product details or customer..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', background: 'white' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                                <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700', background: '#F1F5F9', padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                                    📅 Interval: <strong style={{ color: '#0F172A' }}>{dateInterval === 'today' ? 'Today' : dateInterval === '7days' ? 'Last 7 Days' : `${customStartDate || 'Start'} to ${customEndDate || 'End'}`}</strong>
                                </span>

                                {/* Customize View (⚙️) Button */}
                                <button
                                    onClick={() => setIsCustomizeViewOpen(!isCustomizeViewOpen)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        padding: '0.55rem 1.1rem',
                                        borderRadius: '12px',
                                        background: isCustomizeViewOpen ? '#064E3B' : 'white',
                                        color: isCustomizeViewOpen ? 'white' : '#064E3B',
                                        border: '1px solid #DCF2E4',
                                        fontSize: '0.82rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <span>⚙️</span> Customize View
                                </button>

                                {/* Customize View Popover */}
                                {isCustomizeViewOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 8px)',
                                        right: 0,
                                        width: '320px',
                                        background: 'white',
                                        borderRadius: '20px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                                        padding: '1.25rem',
                                        zIndex: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.6rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ fontSize: '1rem' }}>⚙️</span>
                                                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '850', color: '#0F172A' }}>Customize Date Interval</h4>
                                            </div>
                                            <button onClick={() => setIsCustomizeViewOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}><X size={16} /></button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Select Interval</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                                                {[
                                                    { id: 'today', label: 'Today' },
                                                    { id: '7days', label: 'Last 7 Days' },
                                                    { id: 'custom', label: 'Custom' }
                                                ].map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => setDateInterval(preset.id)}
                                                        style={{
                                                            padding: '0.5rem 0.4rem',
                                                            borderRadius: '8px',
                                                            border: dateInterval === preset.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                                            background: dateInterval === preset.id ? '#EFF6FF' : 'white',
                                                            color: dateInterval === preset.id ? '#1D4ED8' : '#475569',
                                                            fontWeight: '800',
                                                            fontSize: '0.78rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {dateInterval === 'custom' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '750', color: '#475569', marginBottom: '0.25rem' }}>Start Date</label>
                                                    <input 
                                                        type="date" 
                                                        value={customStartDate} 
                                                        onChange={(e) => setCustomStartDate(e.target.value)} 
                                                        style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: 'white' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '750', color: '#475569', marginBottom: '0.25rem' }}>End Date</label>
                                                    <input 
                                                        type="date" 
                                                        value={customEndDate} 
                                                        onChange={(e) => setCustomEndDate(e.target.value)} 
                                                        style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', background: 'white' }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsCustomizeViewOpen(false)}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem',
                                                borderRadius: '10px',
                                                background: '#064E3B',
                                                color: 'white',
                                                border: 'none',
                                                fontSize: '0.82rem',
                                                fontWeight: '800',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Apply Interval
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <FilterableTableHead columns={[
                                    { key: 'product_name', label: 'PRODUCT DETAILS', placeholder: 'Name/SKU' },
                                    { key: 'starting_quantity', label: 'STARTING QUANTITY', placeholder: 'Qty' },
                                    { key: 'current_stock', label: 'CURRENT STOCK', placeholder: 'Stock' },
                                    { key: 'daily_sales', label: 'DAILY SALES (QTY / ₹)', placeholder: 'Qty / ₹' },
                                    { key: 'weekly_sales', label: 'WEEKLY SALES (QTY / ₹)', placeholder: 'Qty / ₹' },
                                    { key: 'customers', label: 'CUSTOMERS', placeholder: 'Customer' }
                                ]} onFilterChange={setColFilters} />
                                <tbody>
                                    {filteredSellingHistory.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            {/* 1. PRODUCT DETAILS */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <p style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.92rem', margin: 0 }}>
                                                        {item.product_name}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748B' }}>
                                                        <span>SKU: <strong style={{ color: '#475569' }}>{item.product_id}</strong></span>
                                                        <span>•</span>
                                                        <span>Rate: <strong style={{ color: '#1B6B3A' }}>{formatCurrency(item.selling_value || item.purchase_cost)}</strong></span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. STARTING QUANTITY */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                    <span style={{ fontWeight: '850', color: '#1E293B', fontSize: '0.9rem' }}>
                                                        {item.starting_quantity} Units
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>Initial Setup Stock</span>
                                                </div>
                                            </td>

                                            {/* 3. CURRENT STOCK */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: '850', color: item.current_stock <= 0 ? '#EF4444' : item.current_stock <= item.minimum_stock ? '#F59E0B' : '#0F172A', fontSize: '0.95rem' }}>
                                                        {item.current_stock}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.2rem 0.55rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '800',
                                                        background: item.current_stock <= 0 ? '#FEF2F2' : item.current_stock <= item.minimum_stock ? '#FFFBEB' : '#F0FDF4',
                                                        color: item.current_stock <= 0 ? '#EF4444' : item.current_stock <= item.minimum_stock ? '#D97706' : '#16A34A',
                                                        border: item.current_stock <= 0 ? '1px solid #FECACA' : item.current_stock <= item.minimum_stock ? '1px solid #FDE68A' : '1px solid #BBF7D0'
                                                    }}>
                                                        {item.current_stock <= 0 ? 'Out of Stock' : item.current_stock <= item.minimum_stock ? 'Low Stock' : 'In Stock'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 4. DAILY SALES (QTY / ₹) */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                    <span style={{ fontWeight: '850', color: item.dailyQty > 0 ? '#16A34A' : '#64748B', fontSize: '0.9rem' }}>
                                                        {item.dailyQty} Units
                                                    </span>
                                                    <span style={{ fontSize: '0.78rem', color: item.dailyAmount > 0 ? '#15803D' : '#94A3B8', fontWeight: '700' }}>
                                                        {formatCurrency(item.dailyAmount)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 5. WEEKLY SALES (QTY / ₹) */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                    <span style={{ fontWeight: '850', color: item.weeklyQty > 0 ? '#2563EB' : '#64748B', fontSize: '0.9rem' }}>
                                                        {item.weeklyQty} Units
                                                    </span>
                                                    <span style={{ fontSize: '0.78rem', color: item.weeklyAmount > 0 ? '#1D4ED8' : '#94A3B8', fontWeight: '700' }}>
                                                        {formatCurrency(item.weeklyAmount)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 6. CUSTOMERS */}
                                            <td style={{ padding: '1.25rem 1.75rem' }}>
                                                <button
                                                    onClick={() => setCustomerListModal({ product: item, purchases: item.purchases })}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.45rem 0.85rem',
                                                        borderRadius: '8px',
                                                        background: item.customerCount > 0 ? '#EFF6FF' : '#F8FAFC',
                                                        border: item.customerCount > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                                                        color: item.customerCount > 0 ? '#1D4ED8' : '#64748B',
                                                        fontSize: '0.78rem',
                                                        fontWeight: '750',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (item.customerCount > 0) e.currentTarget.style.background = '#DBEAFE';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (item.customerCount > 0) e.currentTarget.style.background = '#EFF6FF';
                                                    }}
                                                >
                                                    <Users size={14} /> View Customers ({item.customerCount})
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSellingHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94A3B8', fontWeight: '600' }}>
                                                No products found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            </div>

            {/* Customer List Modal */}
            {customerListModal && (() => {
                const deduplicatedPurchases = deduplicateSalesTransactions(customerListModal.purchases || []);
                const uniqueCusts = new Set(deduplicatedPurchases.map(p => (p.customerName || 'Walk-in Customer').trim().toLowerCase()));
                const totalUnits = deduplicatedPurchases.reduce((s, p) => s + (parseFloat(p.quantity) || 1), 0);
                const totalRev = deduplicatedPurchases.reduce((s, p) => s + (parseFloat(p.total) || ((parseFloat(p.price) || 0) * (parseFloat(p.quantity) || 1))), 0);

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '750px', maxHeight: '85vh', borderRadius: '28px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>👥</span>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Customer Purchase History</h3>
                                    </div>
                                    <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                                        Buyers of <strong>{customerListModal.product.product_name}</strong> (SKU: {customerListModal.product.product_id})
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setCustomerListModal(null)} 
                                    style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Quick summary strip */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#F8FAFC', padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Total Buyers</span>
                                    <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>{uniqueCusts.size} Customers</h4>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Total Sold</span>
                                    <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: '850', color: '#16A34A' }}>{totalUnits} Units</h4>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Gross Revenue</span>
                                    <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.1rem', fontWeight: '850', color: '#2563EB' }}>{formatCurrency(totalRev)}</h4>
                                </div>
                            </div>

                            {/* Table of customers */}
                            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #F1F5F9', borderRadius: '16px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#F8FAFC', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Customer Name</th>
                                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Bill / Order ID</th>
                                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Units Purchased</th>
                                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Total Amount</th>
                                            <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Purchase Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deduplicatedPurchases.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8', fontWeight: '600' }}>
                                                    No customer purchase records found for this product yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            deduplicatedPurchases.map((tx, idx) => {
                                                const formattedDate = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A';
                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#0F172A' }}>
                                                            {tx.customerName || 'Walk-in Customer'}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <span style={{ padding: '0.2rem 0.5rem', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', color: '#475569' }}>
                                                                {tx.billId || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#16A34A' }}>
                                                            {tx.quantity || 1} Units
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '750', color: '#1E293B' }}>
                                                            {formatCurrency(tx.total || ((tx.price || 0) * (tx.quantity || 1)))}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>
                                                            {formattedDate}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal Footer */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                                <button
                                    onClick={() => setCustomerListModal(null)}
                                    style={{
                                        padding: '0.65rem 1.5rem',
                                        borderRadius: '12px',
                                        background: '#1E293B',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '800',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
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
                                    <option value="">-- Select Product --</option>
                                    {transferProductsList.map(p => <option key={p.id} value={p.id}>{p.name} (Avail: {p.quantity} {p.unit})</option>)}
                                </select>

                                {(() => {
                                    const selectedProd = transferProductsList.find(p => String(p.id) === String(adjustmentForm.product_id));
                                    if (!selectedProd) return null;
                                    return (
                                        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem 1rem', marginTop: '0.5rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', color: '#1E293B' }}>{selectedProd.name}</span>
                                                <span style={{ fontWeight: '800', color: '#064E3B', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>Current Stock: {selectedProd.quantity} {selectedProd.unit}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                                                <span>SKU: <strong style={{ color: '#334155' }}>{selectedProd.sku}</strong></span>
                                                <span>Unit Price: <strong style={{ color: '#334155' }}>{formatCurrency(selectedProd.purchase_price)}</strong></span>
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                    <option value="">-- Select Product --</option>
                                    {transferProductsList.map(p => <option key={p.id} value={p.id}>{p.name} (Avail: {p.quantity} {p.unit})</option>)}
                                </select>

                                {(() => {
                                    const selectedProd = transferProductsList.find(p => String(p.id) === String(transferForm.product_id));
                                    if (!selectedProd) return null;
                                    return (
                                        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.75rem 1rem', marginTop: '0.5rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '800', color: '#1E293B' }}>{selectedProd.name}</span>
                                                <span style={{ fontWeight: '800', color: '#064E3B', background: '#ECFDF5', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>{selectedProd.quantity} {selectedProd.unit} available</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                                                <span>SKU: <strong style={{ color: '#334155' }}>{selectedProd.sku}</strong></span>
                                                <span>Unit Price: <strong style={{ color: '#334155' }}>{formatCurrency(selectedProd.purchase_price)}</strong></span>
                                            </div>
                                            {selectedProd.warehouse_name && (
                                                <div style={{ color: '#64748B' }}>
                                                    Current Location: <strong style={{ color: '#334155' }}>{selectedProd.warehouse_name}</strong>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
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

            {/* Stock Item Detail Popup */}
            {selectedStock && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,78,59,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '28px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Stock Item Details</h3>
                            <button onClick={() => setSelectedStock(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {/* Product Info */}
                        <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontWeight: '900', fontSize: '1.05rem', color: '#1E293B', marginBottom: '0.4rem' }}>{selectedStock.product_name}</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.75rem' }}>SKU: {selectedStock.product_id} &nbsp;|&nbsp; Location: {selectedStock.warehouse_name} ({selectedStock.rack_number})</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '0.85rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>{selectedStock.current_stock}</p>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', margin: 0 }}>CURRENT QTY (pcs)</p>
                                </div>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '0.85rem', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10B981', margin: 0 }}>{formatCurrency(selectedStock.average_cost)}</p>
                                    <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', margin: 0 }}>UNIT PRICE</p>
                                </div>
                            </div>
                        </div>

                        {/* Mock History Timeline */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>📋 Movement History</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {[
                                    { icon: '🟢', label: 'Last Restock', detail: `+${Math.max(10, selectedStock.current_stock)} pcs received`, date: '2026-05-20', color: '#ECFDF5', border: '#BBF7D0' },
                                    { icon: '🔴', label: 'Last Sale / Dispatch', detail: `-${Math.max(2, Math.round(selectedStock.current_stock * 0.1))} pcs dispatched`, date: '2026-05-22', color: '#FEF2F2', border: '#FECACA' },
                                    { icon: '🔵', label: 'Stock Adjustment', detail: 'Physical audit reconciliation', date: '2026-05-18', color: '#EFF6FF', border: '#BFDBFE' },
                                    { icon: '🟡', label: 'Transfer In-Transit', detail: `${selectedStock.in_transit_stock || 0} pcs en-route`, date: '2026-05-24', color: '#FFFBEB', border: '#FDE68A' },
                                    { icon: '⚪', label: 'Current Stock Level', detail: `${selectedStock.current_stock} pcs on hand`, date: 'Today', color: '#F8FAFC', border: '#E2E8F0' }
                                ].map((entry, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: entry.color, border: `1px solid ${entry.border}`, borderRadius: '10px', padding: '0.65rem 0.85rem' }}>
                                        <span style={{ fontSize: '1rem' }}>{entry.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '800', fontSize: '0.8rem', color: '#1E293B', margin: 0 }}>{entry.label}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>{entry.detail}</p>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '700' }}>{entry.date}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Edit Quantity Button */}
                        <button
                            onClick={() => {
                                setSelectedStock(null);
                                setAdjustmentForm(prev => ({ ...prev, product_id: selectedStock.id.toString() }));
                                setIsAdjustmentModalOpen(true);
                            }}
                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #047857)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            ✏️ Edit Quantity / Adjust Stock
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessStock;
