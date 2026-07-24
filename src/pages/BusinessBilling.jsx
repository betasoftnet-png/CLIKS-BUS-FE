import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useCurrency } from '../context';
import { 
    FileText, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    Download,
    Receipt,
    User,
    Mail,
    Calendar,
    IndianRupee,
    TrendingUp,
    Printer,
    Share2,
    History,
    Tag,
    LayoutTemplate,
    Settings,
    Check,
    Eye
} from 'lucide-react';
import { 
    billingService, 
    inventoryService, 
    crmService, 
    profileService, 
    productsService,
    settingsService
} from '../services';
import { paymentsStore } from '../lib/paymentsStore';
import { InvoiceTemplates } from '../components/InvoiceTemplates';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';

const DEFAULT_DROPDOWNS = {
    invoiceTypes: ['GST', 'Non-GST', 'Quotation', 'Proforma Invoice'],
    invoiceStatuses: ['Draft', 'Unpaid', 'Paid', 'Overdue'],
    paymentModes: ['Cash', 'UPI', 'Bank', 'Credit'],
    terms: ['Due on Receipt', 'Net 15 Days', 'Net 30 Days', 'Net 60 Days'],
    units: ['Pcs', 'Kg', 'Mtr', 'Box', 'Nos'],
    gstRates: ['0%', '5%', '12%', '18%', '28%'],
    discountTypes: ['Percentage', 'Flat Amount']
};

const getDaysFromTerms = (termText) => {
    if (!termText) return 0;
    if (termText.toLowerCase().includes('receipt')) return 0;
    const match = termText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const BusinessBilling = () => {
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [colFilters, setColFilters] = React.useState({});
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printData, setPrintData] = useState(null);
    const [selectedHistoryInvoice, setSelectedHistoryInvoice] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCustomerObject, setSelectedCustomerObject] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('premium_corporate'); // standard, premium_corporate, modern, minimal
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null); // New state for Viewing full invoice on screen
    const [showLivePreview, setShowLivePreview] = useState(false); // State for split-pane preview during creation
    const barcodeInputRef = React.useRef(null);

    // Fetch actual business profile for production-grade invoices
    const { data: businessProfile } = useQuery({
        queryKey: ['businessProfile'],
        queryFn: profileService.getProfile,
        refetchOnWindowFocus: false
    });

    // Fetch customization settings dynamically to enforce master configurations
    const { data: userSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingsService.getSettings,
        refetchOnWindowFocus: false
    });
    const activeConfig = React.useMemo(() => userSettings?.data || userSettings || {}, [userSettings]);
    const dropdownOptions = React.useMemo(() => activeConfig?.invoiceDropdownOptions || DEFAULT_DROPDOWNS, [activeConfig]);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [localDropdowns, setLocalDropdowns] = useState(null);

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings) => settingsService.updateSettings(newSettings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });

    React.useEffect(() => {
        if (isSettingsModalOpen) {
            setLocalDropdowns(JSON.parse(JSON.stringify(dropdownOptions)));
        }
    }, [isSettingsModalOpen, dropdownOptions]);

    const handleSettingsOptionAdd = (key) => {
        const titleMap = {
            invoiceTypes: 'Invoice Type',
            invoiceStatuses: 'Invoice Status',
            paymentModes: 'Payment Mode',
            terms: 'Terms',
            units: 'Units',
            gstRates: 'GST %',
            discountTypes: 'Discount Types'
        };
        const val = window.prompt(`Enter new value for ${titleMap[key] || key}:`);
        if (val && val.trim()) {
            setLocalDropdowns(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), val.trim()]
            }));
        }
    };

    const handleSettingsOptionEdit = (key, index) => {
        const oldVal = localDropdowns[key][index];
        const val = window.prompt(`Edit value:`, oldVal);
        if (val && val.trim() && val.trim() !== oldVal) {
            setLocalDropdowns(prev => {
                const list = [...(prev[key] || [])];
                list[index] = val.trim();
                return { ...prev, [key]: list };
            });
        }
    };

    const handleSettingsOptionDelete = (key, index) => {
        const oldVal = localDropdowns[key][index];
        if (window.confirm(`Are you sure you want to delete "${oldVal}"?`)) {
            setLocalDropdowns(prev => ({
                ...prev,
                [key]: (prev[key] || []).filter((_, idx) => idx !== index)
            }));
        }
    };

    const handleSaveChanges = () => {
        updateSettingsMutation.mutate({
            ...activeConfig,
            invoiceDropdownOptions: localDropdowns
        }, {
            onSuccess: () => {
                setIsSettingsModalOpen(false);
                alert('Invoice Settings saved successfully!');
            }
        });
    };

    React.useEffect(() => {
        if (isModalOpen && !editingInvoice) {
            const types = dropdownOptions.invoiceTypes || DEFAULT_DROPDOWNS.invoiceTypes;
            const statuses = dropdownOptions.invoiceStatuses || DEFAULT_DROPDOWNS.invoiceStatuses;
            const paymentModes = dropdownOptions.paymentModes || DEFAULT_DROPDOWNS.paymentModes;
            const units = dropdownOptions.units || DEFAULT_DROPDOWNS.units;
            const gstRates = dropdownOptions.gstRates || DEFAULT_DROPDOWNS.gstRates;

            setFormData(prev => {
                const nextType = types.includes(prev.invoice_type) ? prev.invoice_type : (types[0] || 'GST');
                const nextStatus = statuses.includes(prev.status) ? prev.status : (statuses[0] || 'Unpaid');
                const nextPaymentMode = paymentModes.includes(prev.payment_mode) ? prev.payment_mode : (paymentModes[0] || 'Cash');
                const nextItems = prev.items.map(item => {
                    const nextUnit = units.includes(item.unit) ? item.unit : (units[0] || 'Pcs');
                    const firstGstRateText = gstRates[0] || '18%';
                    const firstGstRateVal = parseFloat(firstGstRateText.replace(/[^0-9.]/g, '')) || 0;
                    const isRateValid = gstRates.some(g => (parseFloat(g.replace(/[^0-9.]/g, '')) || 0) === item.tax_rate);
                    const nextTaxRate = isRateValid ? item.tax_rate : firstGstRateVal;
                    return { ...item, unit: nextUnit, tax_rate: nextTaxRate };
                });

                return {
                    ...prev,
                    invoice_type: nextType,
                    status: nextStatus,
                    payment_mode: nextPaymentMode,
                    items: nextItems
                };
            });
        }
    }, [isModalOpen, editingInvoice, dropdownOptions]);

    React.useEffect(() => {
        if (isModalOpen && activeConfig?.quickEntry) {
            const timer = setTimeout(() => {
                barcodeInputRef.current?.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isModalOpen, activeConfig?.quickEntry]);

    // Sophisticated Custom Template Builder Configuration
    const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);
    const [customConfig, setCustomConfig] = useState({
        accentColor: '#BE185D',
        layout: 'table', // 'table' | 'list'
        alignment: 'left', // 'left' | 'center' | 'right'
        fontFamily: 'sans-serif',
        showBank: true,
        showTerms: true,
        showSignature: true,
        showHeaderStrip: true
    });
    // Auto-trigger invoice creation workflow via query param instruction
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const getPrefixForType = React.useCallback((type) => {
        if (!activeConfig) return 'INV-';
        if (type === 'Proforma') return activeConfig.prefixProforma || 'PRO-';
        if (type === 'Quotation') return activeConfig.prefixEstimate || 'EST-';
        return activeConfig.prefixSale || 'INV-';
    }, [activeConfig]);
    const bankAccounts = paymentsStore.getBankAccounts();
    const [formData, setFormData] = useState(() => ({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        client_name: '',
        client_email: '',
        client_gstin: '',
        billing_address: '',
        shipping_address: '',
        amount: 0,
        tax_amount: 0,
        total_amount: 0,
        paid_amount: 0,
        due_amount: 0,
        bank_account_id: '',
        discount_amount: 0,
        round_off: 0,
        status: 'Unpaid',
        due_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        invoice_type: 'GST', // GST, Non-GST, Proforma, Quotation, Return, CreditNote, DebitNote, Purchase
        tax_type: 'Exclusive', // Inclusive, Exclusive
        redeemed_points: 0,
        earned_points: 0,
        items: [{ 
            description: '', 
            quantity: 1, 
            price: 0, 
            tax_rate: 18, 
            unit: 'Pcs',
            hsn_code: '',
            discount_percent: 0,
            discount_amount: 0,
            total: 0 
        }]
    }));

    React.useEffect(() => {
        if (isModalOpen && !editingInvoice && activeConfig) {
            const prefix = getPrefixForType('GST');
            const defaultTaxType = activeConfig.inclusiveTax ? 'Inclusive' : 'Exclusive';
            const defaultPayMode = activeConfig.cashSale ? 'Cash' : 'Bank';
            setFormData(prev => ({
                ...prev,
                invoice_number: `${prefix}${Date.now().toString().slice(-6)}`,
                tax_type: defaultTaxType,
                payment_mode: defaultPayMode,
                client_name: activeConfig.cashSale ? 'Cash Customer' : prev.client_name,
                client_email: activeConfig.cashSale ? 'cash@customer.local' : prev.client_email
            }));
        }
    }, [isModalOpen, editingInvoice, activeConfig, getPrefixForType]);

    const handleViewHistory = (invoice) => {
        setSelectedHistoryInvoice(invoice);
        setIsHistoryModalOpen(true);
    };

    const handlePrint = (invoice) => {
        setPrintData(invoice);
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setPrintData(null);
        }, 500);
    };

    // Calculate totals when items change
    const calculateTotals = (items, taxType, currentFormData = {}) => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        
        items.forEach(item => {
            const qty = parseFloat(item.quantity) || 0;
            const prc = parseFloat(item.price) || 0;
            const discPct = parseFloat(item.discount_percent) || 0;
            const discAmt = parseFloat(item.discount_amount) || 0;
            const txRate = activeConfig.enableGst === false ? 0 : (parseFloat(item.tax_rate) || 0);

            const basePrice = qty * prc;
            
            // Calculate Item Discount
            const itemDiscount = (basePrice * (discPct / 100)) + discAmt;
            const priceAfterDiscount = Math.max(0, basePrice - itemDiscount);
            
            let itemTax = 0;
            let itemFinalTotal = 0;

            if (taxType === 'Inclusive') {
                const taxableValue = priceAfterDiscount / (1 + txRate / 100);
                itemTax = priceAfterDiscount - taxableValue;
                itemFinalTotal = priceAfterDiscount;
                subtotal += parseFloat(taxableValue) || 0;
            } else {
                itemTax = priceAfterDiscount * (txRate / 100);
                itemFinalTotal = priceAfterDiscount + itemTax;
                subtotal += priceAfterDiscount;
            }

            totalTax += parseFloat(itemTax) || 0;
            totalDiscount += parseFloat(itemDiscount) || 0;
            item.total = parseFloat(itemFinalTotal) || 0;
        });

        const rawTotal = (parseFloat(subtotal) || 0) + (parseFloat(totalTax) || 0);
        const redeemedAmt = (parseFloat(currentFormData.redeemed_points) || 0) / 100; // 100 pts = 1 Re
        const adjustedTotal = rawTotal - redeemedAmt;
        const roundedTotal = activeConfig.roundOff !== false ? Math.max(0, Math.round(adjustedTotal)) : Math.max(0, adjustedTotal);
        const roundOff = roundedTotal - adjustedTotal;
        
        // Rule: Earn 1 point per 100 units of final bill (in active currency)
        const earnedPts = Math.max(0, Math.floor(roundedTotal / 100));

        return {
            amount: parseFloat(subtotal) || 0,
            tax_amount: parseFloat(totalTax) || 0,
            discount_amount: parseFloat(totalDiscount) || 0,
            total_amount: parseFloat(roundedTotal) || 0,
            round_off: parseFloat(roundOff) || 0,
            earned_points: parseInt(earnedPts) || 0
        };
    };

    const calculateEstimatedProfit = () => {
        return (formData.items || []).reduce((acc, item) => {
            const catalogItem = catalogProducts?.find(p => p.id === item.product_id || p.name === item.description || p.product_name === item.description);
            const purchase = parseFloat(item.purchase_price) || parseFloat(catalogItem?.purchase_price) || 0;
            const saleRate = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 0;
            return acc + (saleRate - purchase) * qty;
        }, 0);
    };

    const handleClientChange = (value) => {
        const selectedCustomer = customers.find(c => c.name === value);
        if (selectedCustomer) {
            setSelectedCustomerObject(selectedCustomer);
            setFormData({
                ...formData,
                client_name: selectedCustomer.name,
                client_email: selectedCustomer.email || '',
                client_gstin: selectedCustomer.gstin || '',
                billing_address: selectedCustomer.company || selectedCustomer.billing_address || '', 
                shipping_address: selectedCustomer.company || selectedCustomer.shipping_address || ''
            });
        } else {
            setSelectedCustomerObject(null);
            setFormData({ ...formData, client_name: value, redeemed_points: 0 });
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        
        if (field === 'description') {
            // Check if value matches real catalog products first
            const selectedProd = catalogProducts.find(p => (p.name || p.product_name) === value);
            if (selectedProd) {
                newItems[index] = {
                    ...newItems[index],
                    description: selectedProd.name || selectedProd.product_name,
                    product_id: selectedProd.id,
                    inventory_id: null,
                    price: parseFloat(selectedProd.selling_price || selectedProd.price || 0),
                    hsn_code: selectedProd.hsn_code || selectedProd.sku || '',
                    tax_rate: parseInt(selectedProd.gst_percentage || selectedProd.tax_percentage || 18),
                    unit: selectedProd.primary_unit || 'Pcs',
                    total: (newItems[index].quantity || 1) * parseFloat(selectedProd.selling_price || 0)
                };
            } else {
                // Fallback to generic legacy inventory items list
                const selectedInvItem = inventoryItems.find(i => i.name === value);
                if (selectedInvItem) {
                    newItems[index] = {
                        ...newItems[index],
                        description: selectedInvItem.name,
                        inventory_id: selectedInvItem.id,
                        product_id: null,
                        price: parseFloat(selectedInvItem.price || 0),
                        hsn_code: selectedInvItem.hsn_sac || '',
                        tax_rate: parseInt(selectedInvItem.gst_rate || 18),
                        unit: selectedInvItem.unit || 'Pcs',
                        total: (newItems[index].quantity || 1) * parseFloat(selectedInvItem.price || 0)
                    };
                } else {
                    newItems[index][field] = value;
                    newItems[index].inventory_id = null;
                    newItems[index].product_id = null;
                }
            }
        } else {
            newItems[index][field] = value;
        }
        
        const totals = calculateTotals(newItems, formData.tax_type, formData);
        const paid = formData.payment_mode === 'Credit' ? 0 : totals.total_amount;
        setFormData({ 
            ...formData, 
            items: newItems, 
            ...totals,
            paid_amount: paid,
            due_amount: totals.total_amount - paid
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const totals = calculateTotals(newItems, formData.tax_type, formData);
        setFormData({ ...formData, items: newItems, ...totals });
    };

    // Queries
    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: billingService.getInvoices
    });

    const { data: inventoryItems = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryService.getInventory
    });

    // 📦 FETCH ACTIVE CORE CATALOG
    const { data: catalogProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            return res.data || [];
        }
    });

    // Mutations
    const adjustStockMutation = useMutation({
        mutationFn: ({ id, amount }) => inventoryService.adjustStock(id, amount)
    });

    // 🚀 UNIFIED PIPELINE: Hook into the central catalog matrix to deduct stock
    const adjustProductStockMutation = useMutation({
        mutationFn: ({ id, quantity }) => {
            const prod = catalogProducts.find(p => String(p.id) === String(id));
            if (prod) {
                const currentQty = parseFloat(prod.quantity) || 0;
                const updatedQty = Math.max(0, currentQty + quantity);
                const payload = {
                    ...prod,
                    quantity: updatedQty,
                    status: updatedQty < (prod.min_stock || 5) ? 'Low Stock' : 'In Stock'
                };
                return productsService.updateProduct(id, payload);
            }
            return Promise.resolve(null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    const createMutation = useMutation({
        mutationFn: billingService.createInvoice,
        onSuccess: (newInvoice) => {
            // Deduct stock for each item if it's a Sales Invoice
            if (formData.invoice_type === 'GST' || formData.invoice_type === 'Non-GST') {
                formData.items.forEach(item => {
                    if (item.inventory_id) {
                        adjustStockMutation.mutate({ 
                            id: item.inventory_id, 
                            amount: -item.quantity 
                        });
                    }
                    // 📉 Automatically deplete central catalog counts
                    if (item.product_id) {
                        adjustProductStockMutation.mutate({
                            id: item.product_id,
                            quantity: -item.quantity
                        });
                    }
                });
            } else if (formData.invoice_type === 'Return') {
                // Add back stock for returns
                formData.items.forEach(item => {
                    if (item.inventory_id) {
                        adjustStockMutation.mutate({ 
                            id: item.inventory_id, 
                            amount: item.quantity 
                        });
                    }
                    // 📈 Replenish catalog on return events
                    if (item.product_id) {
                        adjustProductStockMutation.mutate({
                            id: item.product_id,
                            quantity: item.quantity
                        });
                    }
                });
            }

            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            
            // Construct complete invoice object for visual preview combining server response & client data
            const invoiceForView = {
                ...formData,
                ...(newInvoice || {}), // Merge system generated IDs/timestamps if available
                items: typeof formData.items === 'string' ? JSON.parse(formData.items) : formData.items // Ensure it is array for template
            };

            // Close creation workspace
            closeModal();
            
            // Render visual modal instantly on screen if preview is enabled
            if (activeConfig.noInvoicePreview !== true) {
                setViewingInvoice(invoiceForView);
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => billingService.updateInvoice(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: billingService.deleteInvoice,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(['invoices'], (old = []) => 
                Array.isArray(old) ? old.filter(inv => String(inv.id) !== String(deletedId)) : []
            );
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInvoice(null);
        setShowLivePreview(false); // Reset live preview mode
        setSelectedCustomerObject(null);
        const prefix = activeConfig.prefixSale || 'INV-';
        setFormData({
            invoice_number: `${prefix}${Date.now().toString().slice(-6)}`,
            client_name: activeConfig.cashSale ? 'Cash Customer' : '',
            client_email: activeConfig.cashSale ? 'cash@customer.local' : '',
            client_gstin: '',
            billing_address: '',
            shipping_address: '',
            amount: 0,
            tax_amount: 0,
            total_amount: 0,
            paid_amount: 0,
            due_amount: 0,
            bank_account_id: '',
            discount_amount: 0,
            round_off: 0,
            status: 'Unpaid',
            due_date: new Date().toISOString().split('T')[0],
            payment_mode: activeConfig.cashSale ? 'Cash' : 'Bank',
            invoice_type: 'GST',
            tax_type: activeConfig.inclusiveTax ? 'Inclusive' : 'Exclusive',
            redeemed_points: 0,
            earned_points: 0,
            items: [{ 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
    };

    const handleEdit = (invoice) => {
        if (activeConfig.passcodeTxn) {
            const pin = prompt("Enter Security Passcode to authorize transaction edit:");
            if (pin !== "1234") {
                alert("Unauthorized: Incorrect security passcode.");
                return;
            }
        }
        setEditingInvoice(invoice);
        const parsedItems = invoice.items ? (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items) : [];
        setFormData({
            invoice_number: invoice.invoice_number,
            client_name: invoice.client_name,
            client_email: invoice.client_email,
            client_gstin: invoice.client_gstin || '',
            billing_address: invoice.billing_address || '',
            shipping_address: invoice.shipping_address || '',
            amount: invoice.amount,
            tax_amount: invoice.tax_amount || 0,
            total_amount: invoice.total_amount || invoice.amount,
            paid_amount: invoice.paid_amount || invoice.total_amount || invoice.amount,
            due_amount: invoice.due_amount || (invoice.total_amount || invoice.amount) - (invoice.paid_amount || 0),
            bank_account_id: invoice.bank_account_id || '',
            discount_amount: invoice.discount_amount || 0,
            round_off: invoice.round_off || 0,
            status: invoice.status || 'Unpaid',
            due_date: invoice.due_date,
            payment_mode: invoice.payment_mode || 'Cash',
            invoice_type: invoice.invoice_type || 'GST',
            tax_type: invoice.tax_type || 'Exclusive',
            items: parsedItems.length > 0 ? parsedItems : [{ 
                description: '', 
                quantity: 1, 
                price: 0, 
                tax_rate: 18, 
                unit: 'Pcs',
                hsn_code: '',
                discount_percent: 0,
                discount_amount: 0,
                total: 0 
            }]
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // ── Validation Checks from master customization configurations ──
        if (activeConfig.negativeStock) {
            for (const item of formData.items) {
                if (item.product_id) {
                    const prod = catalogProducts.find(p => String(p.id) === String(item.product_id));
                    if (prod && (prod.quantity || 0) < item.quantity) {
                        alert(`Negative Inventory Restricted: "${item.description}" has only ${prod.quantity || 0} units left in stock, but you requested ${item.quantity}.`);
                        return;
                    }
                } else if (item.inventory_id) {
                    const inv = inventoryItems.find(i => String(i.id) === String(item.inventory_id));
                    if (inv && (inv.quantity || 0) < item.quantity) {
                        alert(`Negative Inventory Restricted: "${item.description}" has only ${inv.quantity || 0} units left in stock, but you requested ${item.quantity}.`);
                        return;
                    }
                }
            }
        }

        if (activeConfig.blockParties) {
            const exists = customers.some(c => c.name === formData.client_name);
            if (!exists) {
                alert(`Lock Contact Generation Active: "${formData.client_name}" is a new contact record. Creating new contacts directly within invoice forms is restricted.`);
                return;
            }
        }

        if (activeConfig.hsnCode) {
            const missingHSN = formData.items.some(item => !item.hsn_code || !item.hsn_code.trim());
            if (missingHSN) {
                alert(`Force HSN Mandatory: All billed invoice items must include a valid HSN/SAC code.`);
                return;
            }
        }

        // Derive Status Logic
        const total = parseFloat(formData.total_amount) || 0;
        const paid = parseFloat(formData.paid_amount) || 0;
        const due = total - paid;
        
        let calculatedStatus = 'Unpaid';
        if (paid === 0) {
            calculatedStatus = 'Unpaid';
        } else if (paid < total) {
            calculatedStatus = 'Partially Paid';
        } else {
            calculatedStatus = 'Paid';
        }

        // Extract payload and EXCLUDE loyalty points fields which don't exist on backend table schema
        // This prevents the 500 Internal Server error caused by extra unexpected columns
        const { redeemed_points: _redeemed_points, earned_points: _earned_points, ...filteredFormData } = formData;

        const payload = {
            ...filteredFormData,
            status: calculatedStatus,
            due_amount: due,
            items: JSON.stringify(formData.items)
        };

        if (activeConfig.addTime) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            payload.due_date = `${formData.due_date} (${timeStr})`;
        }

        if (editingInvoice) {
            updateMutation.mutate({ id: editingInvoice.id, data: payload });
        } else {
            // Create sales transaction inside paymentsStore
            if (paid > 0) {
                paymentsStore.addTransaction({
                    type: 'income',
                    reference_type: 'sales',
                    reference_id: formData.invoice_number,
                    bank_account_id: formData.bank_account_id || null,
                    amount: paid,
                    payment_method: formData.payment_mode.toLowerCase(),
                    notes: `Sales Payment received for Invoice ${formData.invoice_number}`
                });
            }
            // Update Customer Loyalty Points
            if (selectedCustomerObject) {
                const currentPts = selectedCustomerObject.loyalty_points || 0;
                const newPts = currentPts - (formData.redeemed_points || 0) + (formData.earned_points || 0);
                
                // Fire and forget update to CRM, success is handle seamlessly on invalidate query
                crmService.updateCustomer(selectedCustomerObject.id, {
                    ...selectedCustomerObject,
                    loyalty_points: newPts
                }).catch(e => console.error('Failed automatic loyalty increment:', e));
            }

            createMutation.mutate(payload);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = 
            (inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        const matchesDate = !dateFilter || inv.due_date === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalInvoiced = invoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    const paidInvoiced = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    const pendingInvoiced = invoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);

    const handleSendReminder = (invoice) => {
        const message = `Hello ${invoice.client_name},\n\nThis is a friendly reminder regarding your invoice *${invoice.invoice_number}* for *${formatCurrency(invoice.total_amount || invoice.amount)}*.\n\nDue Date: ${invoice.due_date}\nStatus: ${invoice.status.toUpperCase()}\n\nPlease make the payment at your earliest convenience.\n\nThank you,\nCLIKS BUSINESS`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDelete = async (id) => {
        if (await customConfirm('Are you sure you want to delete this invoice?')) {
            if (activeConfig.passcode || activeConfig.passcodeTxn) {
                const pin = prompt("Enter Security Passcode to authorize deletion:");
                if (pin !== "1234") {
                    alert("Unauthorized: Incorrect security passcode.");
                    return;
                }
            }
            deleteMutation.mutate(id);
        }
    };

    const handlePreviewPDF = (invoice) => {
        try {
            localStorage.setItem('cliks_invoice_preview_data', JSON.stringify(invoice));
            localStorage.setItem('cliks_invoice_preview_template', activeTemplate);
            localStorage.setItem('cliks_invoice_preview_config', JSON.stringify(customConfig));
        } catch (error) {
            console.error('Failed to store invoice data for preview:', error);
        }
    };

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @media screen and (max-width: 768px) {
                    /* Create/Edit Modal Stacking */
                    .billing-modal-body {
                        flex-direction: column !important;
                        overflow-y: auto !important;
                    }
                    .billing-modal-form-pane {
                        flex: 1 0 auto !important;
                        overflow-y: visible !important;
                        border-bottom: 1px solid #E2E8F0 !important;
                        padding: 1rem !important;
                    }
                    .billing-modal-preview-pane {
                        flex: 1 0 auto !important;
                        overflow-y: visible !important;
                        border-left: none !important;
                        padding: 1rem !important;
                    }

                    /* Template Selector Modal Stacking */
                    .template-selector-body {
                        grid-template-columns: 1fr !important;
                        height: auto !important;
                        max-height: 70vh !important;
                        overflow-y: auto !important;
                    }
                    .template-selector-left {
                        height: 300px !important;
                        max-height: 300px !important;
                        border-right: none !important;
                        border-bottom: 1px solid #E2E8F0 !important;
                        grid-template-columns: 1fr !important;
                    }
                    .template-selector-right {
                        height: 400px !important;
                        max-height: 400px !important;
                        padding: 1rem !important;
                    }

                    /* Invoice View Modal Paddings */
                    .billing-preview-scroll-wrapper {
                        padding: 0.5rem !important;
                    }
                    .billing-preview-inner-wrapper {
                        padding: 15px !important;
                    }
                }
            ` }} />
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Receipt size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Billing Center</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage client invoices and accounts receivable.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsTemplatesModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1rem', borderRadius: '10px', 
                            background: '#FFF', color: '#0F172A', border: '1px solid #E2E8F0', 
                            fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s'
                        }}
                    >
                        <LayoutTemplate size={15} />
                        Templates
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1rem', borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', 
                            fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                        }}
                    >
                        <Plus size={15} />
                        Generate Invoice
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: TrendingUp, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Paid Revenue', value: formatCurrency(paidInvoiced), icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Outstanding Balance', value: formatCurrency(pendingInvoiced), icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Active Clients', value: new Set(invoices.map(i => i.client_name)).size, icon: User, color: '#3B82F6', bg: '#EFF6FF' }
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

            {/* Invoices List */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search client or invoice #..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                        />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.85rem', color: '#64748B' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Draft">Draft</option>
                        </select>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                    {isLoading ? (
                        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color="#BE185D" /></div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'invoice_number', label: 'Invoice', placeholder: 'e.g. INV-001' },
        { key: 'client_name', label: 'Client', placeholder: 'Name' },
        { key: 'due_date', label: 'Due Date', placeholder: 'e.g. 2026-05' },
        { key: 'total_amount', label: 'Amount', placeholder: 'e.g. 5000' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Paid' },
        { key: '_actions', label: 'Actions', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredInvoices.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE185D' }}>
                                                    <FileText size={16} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#0F172A', fontSize: '0.85rem' }}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.85rem', marginBottom: '0.1rem', margin: 0 }}>{inv.client_name}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{inv.client_email}</span>
                                            </div>
                                        </td>
                                        {activeConfig.dueDates !== false && (
                                            <td style={{ padding: '0.75rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                                    <Calendar size={12} />
                                                    {inv.due_date}
                                                </div>
                                            </td>
                                        )}
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A' }}>{formatCurrency(inv.amount)}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                background: inv.status === 'Paid' ? '#D1FAE5' : (inv.status === 'Unpaid' ? '#FEE2E2' : '#FEF3C7'),
                                                color: inv.status === 'Paid' ? '#065F46' : (inv.status === 'Unpaid' ? '#991B1B' : '#92400E'),
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>
                                                {inv.status === 'Paid' ? <CheckCircle2 size={10} /> : (inv.status === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />)}
                                                {inv.status.toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                <button onClick={() => handleViewHistory(inv)} title="Invoice Audit Trail" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><History size={14} /></button>
                                                <button onClick={() => handleSendReminder(inv)} title="WhatsApp Reminder" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Share2 size={14} /></button>
                                                <button onClick={() => handlePrint(inv)} title="Print Invoice" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={14} /></button>
                                                <button onClick={() => handleEdit(inv)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #FEE2E2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ 
                        background: 'white', 
                        width: '100%',
                        maxWidth: showLivePreview ? '1250px' : '760px', 
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                        borderRadius: '20px', 
                        padding: 0, 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
                        maxHeight: '90vh', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid #F1F5F9' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button 
                                    type="button"
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        padding: '0.5rem 0.9rem', borderRadius: '8px', 
                                        background: '#F1F5F9', 
                                        color: '#64748B', 
                                        border: '1px solid transparent',
                                        fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Settings size={15} /> Settings
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowLivePreview(!showLivePreview)} 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        padding: '0.5rem 0.9rem', borderRadius: '8px', 
                                        background: showLivePreview ? '#FCE7F3' : '#F1F5F9', 
                                        color: showLivePreview ? '#BE185D' : '#64748B', 
                                        border: showLivePreview ? '1px solid #FBCFE8' : '1px solid transparent',
                                        fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Eye size={15} /> {showLivePreview ? 'Hide Real-time Preview' : 'Live Preview Mode'}
                                </button>
                                <button onClick={closeModal} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
                            </div>
                        </div>
                        
                        <div className="billing-modal-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                            {/* Left: Dynamic Interaction Pane */}
                            <div className="billing-modal-form-pane" style={{ 
                                flex: showLivePreview ? '1 1 55%' : '1 1 100%', 
                                overflowY: 'scroll', 
                                padding: '1.5rem 2rem 2rem', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'all 0.3s ease'
                            }}>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: activeConfig.invoiceBillNo !== false ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem' }}>
                                {activeConfig.invoiceBillNo !== false && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Invoice #</label>
                                        <input readOnly type="text" value={formData.invoice_number} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '0.85rem' }} />
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Type</label>
                                    <select value={formData.invoice_type} onChange={(e) => {
                                        const nextType = e.target.value;
                                        const nextPrefix = getPrefixForType(nextType);
                                        setFormData(prev => ({
                                            ...prev,
                                            invoice_type: nextType,
                                            invoice_number: `${nextPrefix}${prev.invoice_number.replace(/^[^-]+-/, '')}`
                                        }));
                                    }} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem' }}>
                                        {(dropdownOptions.invoiceTypes || DEFAULT_DROPDOWNS.invoiceTypes).map((type, idx) => (
                                            <option key={idx}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.85rem' }}>
                                        {(dropdownOptions.invoiceStatuses || DEFAULT_DROPDOWNS.invoiceStatuses).map((status, idx) => (
                                            <option key={idx}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${3 + (activeConfig.placeSupply ? 1 : 0) + (activeConfig.customerPo ? 1 : 0) + (activeConfig.ewayBill ? 1 : 0)}, 1fr)`, gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client Name</label>
                                    <input 
                                        required 
                                        type="text" 
                                        list="customer-suggestions"
                                        value={formData.client_name} 
                                        onChange={(e) => handleClientChange(e.target.value)} 
                                        style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} 
                                    />
                                    <datalist id="customer-suggestions">
                                        {customers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(c => (
                                            <option key={c.id} value={c.name}>{c.company || 'Personal'}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client Email</label>
                                    <input required={activeConfig.billingType !== 'lite'} type="email" value={formData.client_email} onChange={(e) => setFormData({...formData, client_email: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Client GSTIN</label>
                                    <input type="text" value={formData.client_gstin} onChange={(e) => setFormData({...formData, client_gstin: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} placeholder="Optional" />
                                </div>
                                {activeConfig.placeSupply && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Place of Supply</label>
                                        <input type="text" value={formData.place_of_supply || ''} onChange={(e) => setFormData({...formData, place_of_supply: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} placeholder="e.g. Maharashtra" />
                                    </div>
                                )}
                                {activeConfig.customerPo && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Customer P.O. No.</label>
                                        <input type="text" value={formData.customer_po_number || ''} onChange={(e) => setFormData({...formData, customer_po_number: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} placeholder="PO-12345" />
                                    </div>
                                )}
                                {activeConfig.ewayBill && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>E-way Bill No.</label>
                                        <input type="text" value={formData.eway_bill_number || ''} onChange={(e) => setFormData({...formData, eway_bill_number: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }} placeholder="12-digit number" />
                                    </div>
                                )}
                            </div>

                            {activeConfig.billingType !== 'lite' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Billing Address</label>
                                        <textarea value={formData.billing_address} onChange={(e) => setFormData({...formData, billing_address: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '60px', fontSize: '0.85rem' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                        <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '60px', fontSize: '0.85rem' }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Invoice Items</h3>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                            <input 
                                                ref={barcodeInputRef}
                                                placeholder="Quick Scan / Barcode" 
                                                style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem', width: '160px' }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const barcode = e.target.value;
                                                        // Search catalog products first
                                                        const prod = catalogProducts.find(p => p.barcode === barcode || p.sku === barcode);
                                                        if (prod) {
                                                            const newItem = {
                                                                description: prod.name || prod.product_name,
                                                                product_id: prod.id,
                                                                inventory_id: null,
                                                                quantity: 1,
                                                                price: parseFloat(prod.selling_price || 0),
                                                                tax_rate: parseInt(prod.gst_percentage || 18),
                                                                unit: prod.primary_unit || 'Pcs',
                                                                hsn_code: prod.hsn_code || prod.sku || '',
                                                                discount_percent: 0,
                                                                discount_amount: 0,
                                                                total: parseFloat(prod.selling_price || 0)
                                                            };
                                                            const newItems = [...formData.items, newItem].filter(it => it.description !== '');
                                                            const totals = calculateTotals(newItems, formData.tax_type, formData);
                                                            setFormData({ ...formData, items: newItems, ...totals });
                                                            e.target.value = '';
                                                            return;
                                                        }

                                                        const item = inventoryItems.find(i => i.barcode === barcode || i.sku === barcode);
                                                        if (item) {
                                                            const newItem = {
                                                                description: item.name,
                                                                inventory_id: item.id,
                                                                product_id: null,
                                                                quantity: 1,
                                                                price: item.price || 0,
                                                                tax_rate: item.gst_rate || 18,
                                                                unit: item.unit || 'Pcs',
                                                                hsn_code: item.hsn_sac || '',
                                                                discount_percent: 0,
                                                                discount_amount: 0,
                                                                total: item.price || 0
                                                            };
                                                            const newItems = [...formData.items, newItem].filter(it => it.description !== '');
                                                            const totals = calculateTotals(newItems, formData.tax_type, formData);
                                                            setFormData({ ...formData, items: newItems, ...totals });
                                                            e.target.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#BE185D', background: '#FCE7F3', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Plus size={14} /> Add Item
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                    {formData.items.map((item, idx) => {
                                        let gridCols = '1.5fr';
                                        if (activeConfig.enableGst !== false) gridCols += ' 70px';
                                        gridCols += ' 60px';
                                        if (activeConfig.freeQty === true) gridCols += ' 60px';
                                        gridCols += ' 65px';
                                        gridCols += ' 75px';
                                        if (activeConfig.txnDiscount !== false) gridCols += ' 60px';
                                        if (activeConfig.txnTax !== false) gridCols += ' 65px';
                                        gridCols += ' 30px';

                                        return (
                                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '0.5rem', alignItems: 'end', padding: '0.6rem 0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>DESCRIPTION</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    list="inventory-suggestions"
                                                    value={item.description} 
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                                                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} 
                                                />
                                                <datalist id="inventory-suggestions">
                                                    {catalogProducts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(prod => (
                                                        <option key={`prod-${prod.id}`} value={prod.name || prod.product_name}>
                                                            📦 Catalog: {prod.sku || 'N/A'} - Stock: {prod.quantity || 0} 
                                                            {activeConfig.displayPurchase && ` - Purchase Price: ${formatCurrency(prod.purchase_price || 0)}`}
                                                            {activeConfig.showLast5Sale && ` - Last Sale: ${formatCurrency(prod.price || prod.sale_price || 0)}`}
                                                            {activeConfig.showLast5Purchase && ` - Last Purchase: ${formatCurrency(prod.purchase_price || 0)}`}
                                                        </option>
                                                    ))}
                                                    {/* Legacy Generic Inventory items fallback */}
                                                    {inventoryItems.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(inv => (
                                                        <option key={`inv-${inv.id}`} value={inv.name}>📋 Legacy Inv: {inv.sku || 'N/A'} - Stock: {inv.quantity || 0}</option>
                                                    ))}
                                                </datalist>
                                            </div>
                                            {activeConfig.enableGst !== false && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>HSN</label>
                                                    <input type="text" value={item.hsn_code || ''} onChange={(e) => handleItemChange(idx, 'hsn_code', e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                                </div>
                                            )}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>QTY</label>
                                                <input required type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            {activeConfig.freeQty === true && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>FREE</label>
                                                    <input type="number" placeholder="0" value={item.free_quantity || ''} onChange={(e) => handleItemChange(idx, 'free_quantity', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                                </div>
                                            )}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>UNIT</label>
                                                <select value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8rem' }}>
                                                    {(dropdownOptions.units || DEFAULT_DROPDOWNS.units).map((unit, uIdx) => (
                                                        <option key={uIdx}>{unit}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>PRICE ({currency.symbol})</label>
                                                <input required type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                            </div>
                                            {activeConfig.txnDiscount !== false && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>DISC %</label>
                                                    <input type="number" value={item.discount_percent} onChange={(e) => handleItemChange(idx, 'discount_percent', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} />
                                                </div>
                                            )}
                                            {activeConfig.txnTax !== false && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>GST %</label>
                                                    <select value={item.tax_rate} onChange={(e) => handleItemChange(idx, 'tax_rate', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.8rem' }}>
                                                        {(dropdownOptions.gstRates || DEFAULT_DROPDOWNS.gstRates).map((gRate, gIdx) => {
                                                            const rateVal = parseFloat(gRate.replace(/[^0-9.]/g, '')) || 0;
                                                            return <option key={gIdx} value={rateVal}>{gRate}</option>;
                                                        })}
                                                    </select>
                                                </div>
                                            )}
                                            <button type="button" onClick={() => removeItem(idx)} style={{ color: '#EF4444', border: 'none', background: 'transparent', cursor: 'pointer', paddingBottom: '0.4rem' }}><Trash2 size={16} /></button>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', padding: '1rem', background: '#EFF6FF', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Payment Mode</label>
                                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                            {(dropdownOptions.paymentModes || DEFAULT_DROPDOWNS.paymentModes).map(mode => (
                                                <button 
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => {
                                                        const paid = mode === 'Credit' ? 0 : formData.total_amount;
                                                        setFormData({
                                                            ...formData, 
                                                            payment_mode: mode,
                                                            paid_amount: paid,
                                                            due_amount: formData.total_amount - paid
                                                        });
                                                    }}
                                                    style={{ 
                                                        flex: 1, padding: '0.5rem', borderRadius: '6px', 
                                                        border: 'none',
                                                        background: formData.payment_mode === mode ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' : 'white',
                                                        color: formData.payment_mode === mode ? 'white' : '#64748B',
                                                        fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                                                        boxShadow: formData.payment_mode === mode ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                                                    }}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {(formData.payment_mode === 'Bank' || formData.payment_mode === 'UPI') && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Bank Account</label>
                                            <select 
                                                required
                                                value={formData.bank_account_id}
                                                onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', fontSize: '0.8rem' }}
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {bankAccounts.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.bank_name} - {formatCurrency(acc.current_balance)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Paid Amount ({currency.symbol})</label>
                                            <input 
                                                type="number" 
                                                value={formData.paid_amount || 0} 
                                                onChange={(e) => {
                                                    const paid = parseFloat(e.target.value) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        paid_amount: paid,
                                                        due_amount: formData.total_amount - paid
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', fontSize: '0.8rem' }} 
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Due Amount ({currency.symbol})</label>
                                            <input 
                                                readOnly
                                                type="number" 
                                                value={(parseFloat(formData.total_amount) || 0) - (parseFloat(formData.paid_amount) || 0)} 
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: '#F8FAFC', color: '#64748B', fontSize: '0.8rem' }} 
                                            />
                                        </div>
                                    </div>

                                    {activeConfig.loyalty !== false && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                                                    <Tag size={12} /> Loyalty Points
                                                </label>
                                                {selectedCustomerObject && (
                                                    <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: '700' }}>Available: {selectedCustomerObject.loyalty_points || 0}</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    disabled={!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0}
                                                    placeholder="Points to redeem"
                                                    value={formData.redeemed_points || ''}
                                                    onChange={(e) => {
                                                        let val = parseInt(e.target.value) || 0;
                                                        const maxAvail = selectedCustomerObject ? (selectedCustomerObject.loyalty_points || 0) : 0;
                                                        if (val > maxAvail) val = maxAvail;
                                                        if (val < 0) val = 0;
                                                        
                                                        // Create temporary updated state to calc totals accurately
                                                        const tmp = { ...formData, redeemed_points: val };
                                                        const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                        setFormData({ ...tmp, ...newTotals });
                                                    }}
                                                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0', background: 'white', fontSize: '0.8rem' }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        if (!selectedCustomerObject) return;
                                                        const maxAvail = selectedCustomerObject.loyalty_points || 0;
                                                        const tmp = { ...formData, redeemed_points: maxAvail };
                                                        const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                        setFormData({ ...tmp, ...newTotals });
                                                    }}
                                                    disabled={!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0}
                                                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#16A34A', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', opacity: (!selectedCustomerObject || (selectedCustomerObject.loyalty_points || 0) === 0) ? 0.5 : 1 }}
                                                >Use Max</button>
                                            </div>
                                        </div>
                                    )}

                                    {activeConfig.dueDates !== false && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Terms</label>
                                                <select 
                                                    onChange={(e) => {
                                                        const days = parseInt(e.target.value);
                                                        if (!isNaN(days)) {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + days);
                                                            setFormData({ ...formData, due_date: d.toISOString().split('T')[0] });
                                                        }
                                                    }} 
                                                    style={{ width: '100%', padding: '0.5rem 0.5rem', borderRadius: '6px', border: '1px solid #DBEAFE', fontSize: '0.8rem', height: '35px', background: 'white', outline: 'none' }}
                                                >
                                                    {(dropdownOptions.terms || DEFAULT_DROPDOWNS.terms).map((t, idx) => (
                                                        <option key={idx} value={getDaysFromTerms(t)}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Due Date</label>
                                                <input required type="date" value={formData.due_date || new Date().toISOString().split('T')[0]} onChange={(e) => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', fontSize: '0.8rem', height: '35px' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(formData.amount)}</span>
                                    </div>
                                    {activeConfig.countItems === true && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                            <span>Items Count:</span>
                                            <span>{formData.items.length} items ({formData.items.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)} Qty)</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Total Discount:</span>
                                        <span style={{ color: '#EF4444' }}>- {formatCurrency(formData.discount_amount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>GST Amount:</span>
                                        <span>{formatCurrency(formData.tax_amount)}</span>
                                    </div>
                                    {formData.redeemed_points > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '700', fontSize: '0.8rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Tag size={10} /> Points Redeemed:</span>
                                            <span>- {formatCurrency(formData.redeemed_points / 100)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Round Off:</span>
                                        <span>{currency.symbol} {(parseFloat(formData.round_off) || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E3A8A', fontWeight: '900', fontSize: '1.25rem', marginTop: '0.3rem', borderTop: '1px dashed #DBEAFE', paddingTop: '0.4rem' }}>
                                        <span>Total:</span>
                                        <span>{formatCurrency(formData.total_amount)}</span>
                                    </div>
                                    {activeConfig.showProfitSale === true && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '700', fontSize: '0.8rem', background: '#F0FDF4', border: '1px dashed #BBF7D0', padding: '0.35rem 0.5rem', borderRadius: '6px', marginTop: '0.2rem' }}>
                                            <span>Est. Gross Profit:</span>
                                            <span>{formatCurrency(calculateEstimatedProfit())}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'center', background: '#F0FDF4', border: '1px dashed #BBF7D0', padding: '0.3rem', borderRadius: '6px', marginTop: '0.2rem' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#15803D', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            🎉 Points to earn this bill: {formData.earned_points || 0} pts
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                                {createMutation.isLoading || updateMutation.isLoading ? <Loader2 className="animate-spin" /> : (editingInvoice ? 'Update Invoice' : 'Generate & Save Invoice')}
                            </button>
                                </form>
                            </div>

                            {/* Right: The Live In-Situ Renderer Instance */}
                            {showLivePreview && (
                                <div className="billing-modal-preview-pane" style={{ 
                                    flex: '1 1 45%', 
                                    background: '#F8FAFC', 
                                    borderLeft: '1px solid #E2E8F0', 
                                    overflowY: 'scroll', 
                                    padding: '2rem', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    animation: 'fadeIn 0.3s ease' 
                                }}>
                                    <div style={{ 
                                        alignSelf: 'flex-start', 
                                        marginBottom: '1.5rem', 
                                        borderBottom: '1px solid #E2E8F0', 
                                        width: '100%', 
                                        paddingBottom: '0.5rem' 
                                    }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em' }}>Real-Time Generation Display</span>
                                    </div>
                                    
                                    <div style={{ 
                                        width: '100%', 
                                        background: 'white', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
                                        borderRadius: '4px', 
                                        minHeight: '600px', 
                                        padding: '30px', 
                                        marginBottom: '3rem',
                                        flexShrink: 0
                                    }}>
                                        <InvoiceTemplates.Renderer 
                                            type={activeTemplate} 
                                            data={{
                                                ...formData,
                                                items: typeof formData.items === 'string' ? JSON.parse(formData.items) : (formData.items || [])
                                            }} 
                                            business={businessProfile?.data || businessProfile || {}} 
                                            config={customConfig}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Settings Modal */}
            {isSettingsModalOpen && localDropdowns && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ 
                        background: 'white', 
                        width: '100%',
                        maxWidth: '850px', 
                        borderRadius: '20px', 
                        padding: '2rem', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
                        maxHeight: '90vh', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column' 
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Invoice Settings</h2>
                            <button onClick={() => setIsSettingsModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
                        </div>

                        {/* Modal Body: Grid of configurable options */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
                                {[
                                    { key: 'invoiceTypes', title: 'Invoice Type' },
                                    { key: 'invoiceStatuses', title: 'Invoice Status' },
                                    { key: 'paymentModes', title: 'Payment Mode' },
                                    { key: 'terms', title: 'Terms' },
                                    { key: 'units', title: 'Units' },
                                    { key: 'gstRates', title: 'GST %' },
                                    { key: 'discountTypes', title: 'Discount Types' }
                                ].map((sec) => (
                                    <div key={sec.key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E293B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{sec.title}</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => handleSettingsOptionAdd(sec.key)} 
                                                style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: '800', color: '#BE185D', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                            >
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                        <div style={{ flex: 1, maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {localDropdowns[sec.key]?.length === 0 ? (
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic', padding: '0.5rem', textAlign: 'center' }}>No options configured</div>
                                            ) : (
                                                localDropdowns[sec.key]?.map((val, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{val}</span>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            <button type="button" onClick={() => handleSettingsOptionEdit(sec.key, idx)} style={{ padding: '0.2rem', color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Edit2 size={12} /></button>
                                                            <button type="button" onClick={() => handleSettingsOptionDelete(sec.key, idx)} style={{ padding: '0.2rem', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                            <button 
                                type="button" 
                                onClick={() => setIsSettingsModalOpen(false)} 
                                style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={handleSaveChanges} 
                                disabled={updateSettingsMutation.isPending}
                                style={{ background: 'linear-gradient(135deg, #BE185D 0%, #9D174D 100%)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer', opacity: updateSettingsMutation.isPending ? 0.6 : 1 }}
                            >
                                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Friendly Template */}
            {isPrinting && printData && (
                <div id="invoice-print-area" className="print-only" style={{ padding: '40px', color: '#000', background: '#fff', minHeight: '100vh', boxSizing: 'border-box' }}>
                    {/* 
                        DYNAMIC 10+ TEMPLATE SYSTEM
                        Modular architecture powered by InvoiceTemplates Component Library
                    */}
                    <InvoiceTemplates.Renderer 
                        type={activeTemplate} 
                        data={printData} 
                        business={businessProfile?.data || businessProfile || {}} 
                        config={customConfig}
                    />

                    {/* Global Bottom Legal (Appended outside template specifically if needed, already in some templates) */}
                    {['standard', 'modern'].includes(activeTemplate) && (
                        <div style={{ marginTop: '80px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Thank you for your business!</p>
                            <p style={{ fontSize: '11px', color: '#64748B' }}>This is a digitally generated invoice and does not require a physical signature.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Template Selector Gallery Modal */}
            {isTemplatesModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '1100px', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <LayoutTemplate size={20} color="#BE185D" />
                                    Choose Invoice Template
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.1rem', margin: 0 }}>Select the visual design for generated PDF and physical prints. Select one of 11 unique layouts.</p>
                            </div>
                            <button onClick={() => setIsTemplatesModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="template-selector-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', height: '65vh', overflow: 'hidden' }}>
                            {/* Left: Selector Grid */}
                            <div className="template-selector-left" style={{ 
                                padding: '1.5rem', 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '1.25rem', 
                                overflowY: 'scroll', 
                                height: '100%',
                                maxHeight: '100%',
                                background: '#F1F5F9', 
                                borderRight: '1px solid #E2E8F0' 
                            }}>
                                {[
                                    { id: 'premium_corporate', name: 'Premium Corporate', desc: 'Sleek Navy Enterprise', color: '#1E3A8A', bg: '#DBEAFE' },
                                    { id: 'creative_agency', name: 'Bold Amethyst', desc: 'Creative Digital Studio', color: '#6D28D9', bg: '#F5F3FF' },
                                    { id: 'emerald_clean', name: 'Emerald Eco-Mint', desc: 'Organic Minimal Luxe', color: '#047857', bg: '#ECFDF5' },
                                    { id: 'standard', name: 'Executive Standard', desc: 'Clean Compliance', color: '#BE185D', bg: '#FCE7F3' },
                                    { id: 'modern', name: 'Modern Pro', desc: 'Minimalist Sans-Serif', color: '#10B981', bg: '#D1FAE5' },
                                    { id: 'minimal', name: 'Master Box Grid', desc: 'Heavy Accounting', color: '#000000', bg: '#F1F5F9' },
                                    { id: 'elegant_dark', name: 'Pro Accent Top', desc: 'Luxury Color Block', color: '#F59E0B', bg: '#FEF3C7' },
                                    { id: 'compact_retail', name: 'Thermal Receipt (POS)', desc: '80mm Small Roll Printing', color: '#4B5563', bg: '#E5E7EB' },
                                    { id: 'retro_mono', name: 'Global Classic', desc: 'Standard B2B Statement', color: '#059669', bg: '#D1FAE5' },
                                    { id: 'creative_blue', name: 'Service Detailed', desc: 'Description Heavy', color: '#6366F1', bg: '#E0E7FF' },
                                    { id: 'executive', name: 'Legal Traditional', desc: 'Formal Dual-Rule', color: '#111827', bg: '#F3F4F6' },
                                    { id: 'clean_stripe', name: 'Modern Sidebar', desc: 'Integrated Branding', color: '#059669', bg: '#D1FAE5' },
                                    { id: 'service_pro', name: 'Dynamic Hybrid', desc: 'Modern SaaS Style', color: '#2563EB', bg: '#DBEAFE' },
                                    { id: 'custom', name: 'Build Your Own', desc: 'Launch Builder Modal', color: customConfig.accentColor, bg: '#FDF2F8' }
                                ].map((tmpl) => (
                                    <div 
                                        key={tmpl.id}
                                        onClick={() => {
                                            setActiveTemplate(tmpl.id);
                                            if (tmpl.id === 'custom') {
                                                setIsCustomizerModalOpen(true);
                                            }
                                        }}
                                        style={{ 
                                            cursor: 'pointer', 
                                            border: activeTemplate === tmpl.id ? `2px solid ${tmpl.color}` : '1px solid #E2E8F0', 
                                            borderRadius: '12px', padding: '0.5rem', 
                                            background: 'white',
                                            transform: activeTemplate === tmpl.id ? 'scale(1.02)' : 'scale(1)',
                                            boxShadow: activeTemplate === tmpl.id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            height: '100px', background: 'white', borderRadius: '8px', 
                                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)', overflow: 'hidden', 
                                            position: 'relative', padding: '8px', border: activeTemplate === tmpl.id ? `1px solid ${tmpl.color}20` : '1px solid #F1F5F9'
                                        }}>
                                            {/* Render mini abstract SVG / Div representation placeholders */}
                                            <div style={{ width: '100%', height: '100%', opacity: 0.7, position: 'relative' }}>
                                                {tmpl.id === 'premium_corporate' && (
                                                    <div><div style={{height: '4px', width: '100%', background: tmpl.color}}></div><div style={{height: '25px', width: '40%', background: '#eee', margin: '10px 0', borderLeft: `4px solid ${tmpl.color}`}}></div><div style={{height:'35px', width: '100%', background: '#fafafa'}}></div></div>
                                                )}
                                                {tmpl.id === 'creative_agency' && (
                                                    <div style={{ background: '#fff', height: '90px' }}>
                                                        <div style={{ height: '4px', width: '100%', background: 'linear-gradient(90deg, #6D28D9, #D946EF)' }}></div>
                                                        <div style={{ height: '18px', width: '55%', background: '#FAF5FF', margin: '8px 0', border: '1px dashed #E9D5FF', borderRadius: '4px' }}></div>
                                                        <div style={{ height: '35px', background: '#FAF5FF', borderRadius: '6px', borderLeft: `3px solid #6D28D9` }}></div>
                                                    </div>
                                                )}
                                                {tmpl.id === 'emerald_clean' && (
                                                    <div style={{ background: '#fff', height: '90px' }}>
                                                        <div style={{ display: 'flex', gap: '2px', height: '4px' }}><div style={{ flex: 3, background: '#047857' }} /><div style={{ flex: 1, background: '#064E3B' }} /></div>
                                                        <div style={{ height: '22px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}><div style={{ height: '6px', width: '30%', background: '#047857' }}></div><div style={{ height: '6px', width: '20%', background: '#064E3B' }}></div></div>
                                                        <div style={{ height: '30px', background: '#ECFDF5', borderLeft: '3px solid #047857' }}></div>
                                                    </div>
                                                )}
                                                {tmpl.id === 'standard' && (
                                                    <div><div style={{height: '6px', width: '40%', background: tmpl.color, marginBottom: '5px'}}></div><div style={{display:'flex', gap: '2px'}}><div style={{height:'20px', flex:1, background:tmpl.bg}}></div><div style={{height:'20px', flex:1, background:tmpl.bg}}></div></div><div style={{height:'30px', width: '100%', background: '#f1f1f1', marginTop: '5px'}}></div></div>
                                                )}
                                                {tmpl.id === 'modern' && (
                                                    <div><div style={{height: '2px', width: '100%', background: tmpl.color}}></div><div style={{height: '20px', width: '30%', background: '#eee', margin: '8px 0'}}></div><div style={{height: '40px', background: '#fcfcfc', border: '1px solid #eee'}}></div></div>
                                                )}
                                                {tmpl.id === 'minimal' && (
                                                    <div style={{border: '1px solid #000', height: '90px'}}><div style={{height: '15px', borderBottom: '1px solid #000'}}></div><div style={{height: '15px', borderBottom: '1px solid #000', display:'flex'}}><div style={{flex:1, borderRight: '1px solid #000'}}></div><div style={{flex:1}}></div></div><div style={{height: '40px'}}></div></div>
                                                )}
                                                {tmpl.id === 'elegant_dark' && (
                                                    <div style={{background: '#fff'}}><div style={{height: '30px', background: '#0F172A', width: '100%'}}></div><div style={{height: '3px', background: tmpl.color, width: '100%'}}></div><div style={{margin: '10px 0', height: '30px', borderLeft: `3px solid ${tmpl.color}`, background: '#fafafa'}}></div></div>
                                                )}
                                                {tmpl.id === 'compact_retail' && (
                                                    <div style={{border: '1px dashed #ccc', height: '95px', padding: '4px'}}><div style={{borderBottom: '1px dashed #000', height: '20px', textAlign: 'center', fontSize: '8px'}}>***</div><div style={{height: '40px', borderBottom: '1px dashed #000'}}></div></div>
                                                )}
                                                {tmpl.id === 'retro_mono' && (
                                                    <div style={{border: '2px double #000', height: '90px'}}><div style={{height: '15px', borderBottom: '1px solid #000', background: '#fafafa'}}></div><div style={{height: '50px', fontSize: '5px', fontFamily: 'monospace', padding: '4px'}}>+------+<br/>| DATA |</div></div>
                                                )}
                                                {tmpl.id === 'creative_blue' && (
                                                    <div style={{background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', height: '90px', borderRadius: '4px'}}><div style={{padding: '5px'}}><div style={{height: '8px', width: '50%', background: 'rgba(255,255,255,0.4)'}}></div></div></div>
                                                )}
                                                {tmpl.id === 'executive' && (
                                                    <div><div style={{height: '20px', textAlign: 'center', borderBottom: '2px double #111'}}></div><div style={{marginTop: '10px', height: '40px', borderTop: '1px solid #111', borderBottom: '1px solid #111'}}></div></div>
                                                )}
                                                {tmpl.id === 'clean_stripe' && (
                                                    <div style={{display: 'flex', height: '90px'}}><div style={{width: '25%', background: '#059669'}}></div><div style={{flex: 1, padding: '5px'}}><div style={{height: '10px', borderBottom: '2px solid #ECFDF5'}}></div></div></div>
                                                )}
                                                {tmpl.id === 'service_pro' && (
                                                    <div><div style={{height: '25px', background: '#EFF6FF', borderRadius: '4px', marginBottom: '5px'}}></div><div style={{height: '50px', border: '1px solid #E5E7EB', borderRadius: '4px'}}></div></div>
                                                )}
                                                {tmpl.id === 'custom' && (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px dashed ${tmpl.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tmpl.color }}>
                                                            <Plus size={20} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {activeTemplate === tmpl.id && (
                                                <div style={{ position: 'absolute', top: '5px', right: '5px', width: '18px', height: '18px', borderRadius: '50%', background: tmpl.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ textAlign: 'center', fontWeight: '800', fontSize: '0.8rem', margin: '6px 0 1px 0', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tmpl.name}</p>
                                        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#64748B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tmpl.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Visual Real-Time Rendering Pipeline */}
                            <div className="template-selector-right" style={{ 
                                padding: '1.5rem', 
                                background: '#F8FAFC', 
                                overflowY: 'scroll', // FORCE native scrolling availability
                                height: '100%', 
                                maxHeight: '100%',
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center' 
                            }}>
                                <div style={{ alignSelf: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', width: '100%', paddingBottom: '0.5rem' }}>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                                        <Eye size={12} /> Live Instant Preview
                                    </p>
                                </div>
                                <div style={{ 
                                    width: '100%', 
                                    maxWidth: '650px', 
                                    background: 'white', 
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                                    borderRadius: '6px',
                                    padding: '30px',
                                    height: 'auto',
                                    flexShrink: 0,
                                    marginBottom: '3rem' 
                                }}>
                                    <InvoiceTemplates.Renderer 
                                        type={activeTemplate} 
                                        data={{
                                            invoice_number: 'INV-SAMPLE-001',
                                            invoice_type: 'GST',
                                            due_date: new Date().toLocaleDateString(),
                                            payment_mode: 'UPI / Credit Card',
                                            client_name: 'Johnathan Doe Ltd.',
                                            client_email: 'billing@samplecorp.com',
                                            billing_address: '742 Evergreen Terrace, Springfield, US',
                                            amount: 15000,
                                            tax_amount: 2700,
                                            discount_amount: 500,
                                            total_amount: 17200,
                                            items: [
                                                { description: 'Enterprise Solutions License (Annual)', quantity: 1, price: 10000, tax_rate: 18, total: 11800, unit: 'Nos', hsn_code: '998311' },
                                                { description: 'Professional Cloud Implementation Consultation', quantity: 1, price: 5000, tax_rate: 18, total: 5900, unit: 'Hrs', hsn_code: '998711' }
                                            ]
                                        }} 
                                        business={businessProfile?.data || businessProfile || {
                                            business_name: 'Your Brand Corp',
                                            email: 'contact@yourbrand.com',
                                            phone: '+1 800 123 456'
                                        }} 
                                        config={customConfig}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            {activeTemplate === 'custom' && (
                                <button onClick={() => setIsCustomizerModalOpen(true)} style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', borderRadius: '6px', background: 'white', color: customConfig.accentColor, border: `1px solid ${customConfig.accentColor}`, fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <Plus size={14} /> Configure Settings
                                </button>
                            )}
                            <button onClick={() => setIsTemplatesModalOpen(false)} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Set as Active Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Custom Design Template Builder Modal */}
            {isCustomizerModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(10px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #E2E8F0', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: customConfig.accentColor, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} /> Design Customizer</h3>
                                <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: '2px 0 0 0' }}>Configure your exact layout logic</p>
                            </div>
                            <button onClick={() => setIsCustomizerModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                        </div>
                        
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* 1. BRAND COLOR */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '8px' }}>Primary Accent Color</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="color" value={customConfig.accentColor} onChange={(e) => setCustomConfig({...customConfig, accentColor: e.target.value})} style={{ width: '45px', height: '36px', padding: 0, border: '1px solid #E2E8F0', borderRadius: '6px', cursor: 'pointer' }} />
                                    <input type="text" value={customConfig.accentColor.toUpperCase()} onChange={(e) => setCustomConfig({...customConfig, accentColor: e.target.value})} style={{ flex: 1, padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'monospace' }} />
                                </div>
                            </div>

                            {/* 2. ALIGNMENT */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '8px' }}>Header Layout Alignment</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    {['left', 'center', 'right'].map(a => (
                                        <button key={a} onClick={() => setCustomConfig({...customConfig, alignment: a})} style={{ padding: '8px', borderRadius: '6px', border: customConfig.alignment === a ? `2px solid ${customConfig.accentColor}` : '1px solid #E2E8F0', background: customConfig.alignment === a ? `${customConfig.accentColor}10` : 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: customConfig.alignment === a ? customConfig.accentColor : '#64748B', textTransform: 'capitalize' }}>{a}</button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. ITEM TABLE STYLE */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '8px' }}>Items Display Pattern</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <button onClick={() => setCustomConfig({...customConfig, layout: 'table'})} style={{ padding: '10px', textAlign: 'left', borderRadius: '8px', border: customConfig.layout === 'table' ? `2px solid ${customConfig.accentColor}` : '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0F172A' }}>Classic Table Grid</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Strict structured rows & cols</div>
                                    </button>
                                    <button onClick={() => setCustomConfig({...customConfig, layout: 'list'})} style={{ padding: '10px', textAlign: 'left', borderRadius: '8px', border: customConfig.layout === 'list' ? `2px solid ${customConfig.accentColor}` : '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0F172A' }}>Modern Stack Cards</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Clean floating list layout</div>
                                    </button>
                                </div>
                            </div>

                            {/* 4. VISIBILITY TOGGLES */}
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '10px' }}>Include Sections</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { key: 'showHeaderStrip', label: 'Enable Accent Top Border Bar' },
                                        { key: 'showBank', label: 'Display Banking Details Box' },
                                        { key: 'showTerms', label: 'Include Legal T&C Declaration' },
                                        { key: 'showSignature', label: 'Authorized Signatory Anchor' }
                                    ].map(t => (
                                        <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#F8FAFC', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={customConfig[t.key]} onChange={(e) => setCustomConfig({...customConfig, [t.key]: e.target.checked})} style={{ accentColor: customConfig.accentColor, width: '16px', height: '16px' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{t.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsCustomizerModalOpen(false)} style={{ background: customConfig.accentColor, color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', boxShadow: `0 4px 10px ${customConfig.accentColor}40` }}>
                                Apply Design Style
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Lifecycle Modal */}
            {isHistoryModalOpen && selectedHistoryInvoice && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Invoice History</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.1rem', margin: 0 }}>Audit trail for {selectedHistoryInvoice.invoice_number}</p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #E2E8F0' }}>
                                {/* Event 1 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: '#BE185D', border: '3px solid #FCE7F3' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Invoice Generated</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>Invoice created successfully as {selectedHistoryInvoice.invoice_type || 'GST'} with base amount {formatCurrency(selectedHistoryInvoice.amount)}.</p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:00 AM</span>
                                </div>
                                {/* Event 2 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: '#1D4ED8', border: '3px solid #EFF6FF' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Tax & Discounts Applied</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>GST of {formatCurrency(selectedHistoryInvoice.tax_amount || 0)} and Discount of {formatCurrency(selectedHistoryInvoice.discount_amount || 0)} were successfully processed.</p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:05 AM</span>
                                </div>
                                {/* Event 3 */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.65rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', background: selectedHistoryInvoice.status === 'Paid' ? '#059669' : '#EF4444', border: selectedHistoryInvoice.status === 'Paid' ? '3px solid #D1FAE5' : '3px solid #FEE2E2' }}></div>
                                    <h4 style={{ fontWeight: '750', fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.15rem', margin: 0 }}>Payment Status: {selectedHistoryInvoice.status.toUpperCase()}</h4>
                                    <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                                        {selectedHistoryInvoice.status === 'Paid' 
                                            ? `Full payment of ${formatCurrency(selectedHistoryInvoice.total_amount || selectedHistoryInvoice.amount)} received via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                            : `Awaiting pending payment of ${formatCurrency(selectedHistoryInvoice.total_amount || selectedHistoryInvoice.amount)} via ${selectedHistoryInvoice.payment_mode || 'Cash'}.`
                                        }
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginTop: '0.25rem', fontWeight: '600' }}>May 06, 2026 at 10:10 AM</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsHistoryModalOpen(false)} style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: '#0F172A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>Close Trail</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Visual Invoice Preview Stage (Post Generation) */}
            {viewingInvoice && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1250, backdropFilter: 'blur(10px)', padding: '1rem' }}>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media (max-width: 768px) {
                            .billing-preview-modal-inner {
                                height: 95vh !important;
                                border-radius: 12px !important;
                            }
                            .billing-preview-modal-header {
                                padding: 1rem !important;
                                flex-direction: column !important;
                                align-items: stretch !important;
                                gap: 1rem !important;
                            }
                            .billing-preview-modal-header-actions {
                                width: 100% !important;
                                flex-direction: column !important;
                                gap: 0.5rem !important;
                            }
                            .billing-preview-modal-header-actions a,
                            .billing-preview-modal-header-actions button {
                                width: 100% !important;
                                justify-content: center !important;
                            }
                            .billing-preview-scroll-wrapper {
                                padding: 0.5rem !important;
                            }
                            .billing-preview-a4-sheet {
                                min-height: auto !important;
                                box-shadow: none !important;
                                border-radius: 12px !important;
                            }
                            .billing-preview-inner-wrapper {
                                padding: 0px !important;
                            }
                        }
                    `}} />
                    <div className="billing-preview-modal-inner" style={{ 
                        background: 'white', 
                        width: '100%', 
                        maxWidth: '920px', 
                        height: '88vh', 
                        borderRadius: '20px', 
                        boxShadow: '0 35px 60px -15px rgba(0,0,0,0.3)', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column',
                        animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div className="billing-preview-modal-header" style={{ padding: '1.25rem 1.75rem', background: '#FFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%' }}></div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>Invoice Created Successfully</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: '500' }}>Document Ref: <span style={{ fontWeight: '800', color: '#334155' }}>{viewingInvoice.invoice_number}</span></p>
                            </div>
                            <div className="billing-preview-modal-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                                <a 
                                    href="/sales/invoice/preview" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    onClick={() => handlePreviewPDF(viewingInvoice)} 
                                    style={{ 
                                        display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                        padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                        background: '#3B82F6', color: 'white', border: 'none', 
                                        fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <Eye size={16} /> Open PDF Preview
                                </a>
                                <button 
                                    onClick={() => handlePrint(viewingInvoice)} 
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                        padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                        background: '#EC4899', color: 'white', border: 'none', 
                                        fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                                    }}
                                >
                                    <Printer size={16} /> Print / Save PDF
                                </button>
                                <button 
                                    onClick={() => setViewingInvoice(null)} 
                                    style={{ 
                                        padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                        background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', 
                                        fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem'
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                        <div className="billing-preview-scroll-wrapper" style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#F8FAFC', display: 'flex', justifyContent: 'center' }}>
                            <div className="billing-preview-a4-sheet" style={{ 
                                background: 'white', 
                                width: '100%', 
                                maxWidth: '794px', // approx A4
                                minHeight: '1123px', // approx A4
                                padding: '0px', 
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div className="billing-preview-inner-wrapper" style={{ padding: '40px', color: '#000', background: '#fff' }}>
                                    <InvoiceTemplates.Renderer 
                                        type={activeTemplate} 
                                        data={viewingInvoice} 
                                        business={businessProfile?.data || businessProfile || {}} 
                                        config={customConfig}
                                    />
                                    
                                    {['standard', 'modern'].includes(activeTemplate) && (
                                        <div style={{ marginTop: '60px', borderTop: '1px solid #E2E8F0', paddingTop: '20px', textAlign: 'center' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Thank you for your business!</p>
                                            <p style={{ fontSize: '11px', color: '#64748B' }}>Digitally verified invoice generated on {new Date().toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBilling;
