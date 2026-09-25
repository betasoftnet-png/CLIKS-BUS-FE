import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useCurrency, useAuth } from '../context';
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
    Eye,
    ShoppingCart,
    RotateCcw,
    Truck,
    ShieldCheck,
    FileSpreadsheet,
    Package,
    Wrench,
    Globe,
    Info,
    Warehouse,
    Award,
    AlertCircle,
    Activity,
    Smartphone,
    Zap,
    Copy,
    QrCode
} from 'lucide-react';
import { complianceService } from '../services/complianceService';
import { validateEmail, validateGstin, validatePhone, validatePan } from '../utils/validationRules';
import { 
    billingService, 
    inventoryService, 
    crmService, 
    profileService, 
    productsService,
    settingsService,
    returnsService,
    purchasesService,
    suppliersService,
    warehouseService,
    gstService,
    splitExpenseService
} from '../services';
import { paymentsStore } from '../lib/paymentsStore';
import { InvoiceTemplates } from '../components/InvoiceTemplates';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';

// Helper function to sanitize and ensure all PDF URLs start with https://
const getSafePdfUrl = (url) => {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

// 2-digit GST state code to state name mapping for auto-selection
const GST_STATE_MAP = {
  "01": "01-Jammu and Kashmir",
  "02": "02-Himachal Pradesh",
  "03": "03-Punjab",
  "04": "04-Chandigarh",
  "05": "05-Uttarakhand",
  "06": "06-Haryana",
  "07": "07-Delhi",
  "08": "08-Rajasthan",
  "09": "09-Uttar Pradesh",
  "10": "10-Bihar",
  "11": "11-Sikkim",
  "12": "12-Arunachal Pradesh",
  "13": "13-Nagaland",
  "14": "14-Manipur",
  "15": "15-Mizoram",
  "16": "16-Tripura",
  "17": "17-Meghalaya",
  "18": "18-Assam",
  "19": "19-West Bengal",
  "20": "20-Jharkhand",
  "21": "21-Odisha",
  "22": "22-Chhattisgarh",
  "23": "23-Madhya Pradesh",
  "24": "24-Gujarat",
  "26": "26-Dadra & Nagar Haveli & Daman & Diu",
  "27": "27-Maharashtra",
  "29": "29-Karnataka",
  "30": "30-Goa",
  "31": "31-Lakshadweep",
  "32": "32-Kerala",
  "33": "33-Tamil Nadu",
  "34": "34-Puducherry",
  "35": "35-Andaman & Nicobar",
  "36": "36-Telangana",
  "37": "37-Andhra Pradesh",
  "38": "38-Ladakh"
};

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

const INITIAL_BILLING_DELIVERIES = [
    {
        delivery_id: 'DLV-401',
        delivery_number: 'CLIKS/DEL/26/101',
        delivery_status: 'Out For Delivery',
        delivery_date: '2026-05-06',
        shipment_id: 'SHP-8802',
        tracking_number: 'TRK998248102',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '2026-05-06 09:30 AM',
        estimated_delivery_date: '2026-05-06',
        driver_name: 'Satish Yadav',
        vehicle_number: 'MH-12-QB-8821',
        customer_name: 'Aman Deep',
        shipping_address: 'Flat 402, Green Meadows, Senapati Bapat Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411016',
        package_count: 2,
        package_weight: 4.5,
        challan_number: 'CHL-2026-4402',
        challan_type: 'GST',
        challan_date: '2026-05-06',
        linked_invoice_id: 'INV-40292',
        otp_code: '5829'
    },
    {
        delivery_id: 'DLV-402',
        delivery_number: 'CLIKS/DEL/26/102',
        delivery_status: 'Delivered',
        delivery_date: '2026-05-05',
        shipment_id: 'SHP-8791',
        tracking_number: 'TRK998248091',
        courier_name: 'Delhivery',
        dispatch_date: '2026-05-05 10:15 AM',
        estimated_delivery_date: '2026-05-05',
        driver_name: 'Rajesh Patil',
        vehicle_number: 'MH-14-EU-4592',
        customer_name: 'Megha Sharma',
        shipping_address: 'Sector 21, Plot 14, Nigdi Pradhikaran',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411044',
        package_count: 1,
        package_weight: 1.2,
        challan_number: 'CHL-2026-4403',
        challan_type: 'GST',
        challan_date: '2026-05-05',
        linked_invoice_id: 'INV-40280',
        otp_code: '1102'
    },
    {
        delivery_id: 'DLV-403',
        delivery_number: 'CLIKS/DEL/26/103',
        delivery_status: 'Failed Attempt',
        delivery_date: '2026-05-04',
        shipment_id: 'SHP-8750',
        tracking_number: 'TRK998248002',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '2026-05-04 11:00 AM',
        estimated_delivery_date: '2026-05-04',
        driver_name: 'Satish Yadav',
        vehicle_number: 'MH-12-QB-8821',
        customer_name: 'Rahul Varma',
        shipping_address: 'Building B, Apartment 801, Hinjewadi Phase 1',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411057',
        package_count: 3,
        package_weight: 12.8,
        challan_number: 'CHL-2026-4390',
        challan_type: 'GST',
        challan_date: '2026-05-04',
        linked_invoice_id: 'INV-40250',
        otp_code: '4452',
        failed_delivery_reason: 'Customer out of town / Premises locked'
    },
    {
        delivery_id: 'DLV-404',
        delivery_number: 'CLIKS/DEL/26/104',
        delivery_status: 'Packed',
        delivery_date: '2026-05-07',
        shipment_id: 'SHP-8820',
        tracking_number: 'TRK998248220',
        courier_name: 'CLIKS Logistics',
        dispatch_date: '2026-05-07 08:30 AM',
        estimated_delivery_date: '2026-05-07',
        driver_name: 'Rajesh Patil',
        vehicle_number: 'MH-14-EU-4592',
        customer_name: 'Snehal Deshmukh',
        shipping_address: 'Flat 101, Shivneri Sadan, Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038',
        package_count: 1,
        package_weight: 2.0,
        challan_number: 'CHL-2026-4420',
        challan_type: 'Non-GST',
        challan_date: '2026-05-06',
        linked_invoice_id: 'INV-40301',
        otp_code: '8910'
    }
];

const INITIAL_BILLING_STAFF = [
    { staff_id: 'STF-05', name: 'Satish Yadav', vehicle: 'MH-12-QB-8821', mobile: '+91 98234 56789', status: 'On Delivery', avg_time: '48 mins', delivery_success_rate: 96 },
    { staff_id: 'STF-02', name: 'Rajesh Patil', vehicle: 'MH-14-EU-4592', mobile: '+91 91234 56711', status: 'Available', avg_time: '42 mins', delivery_success_rate: 98 }
];

const BusinessBilling = () => {
    const { currency, formatCurrency } = useCurrency();
    const { selectedPlan, user } = useAuth();
    const isStarterPlan = (selectedPlan || user?.tier) === 'Starter Plan';
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
    const [fetchedLoyaltyCustomer, setFetchedLoyaltyCustomer] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState('premium_corporate'); // standard, premium_corporate, modern, minimal
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState(null); // New state for Viewing full invoice on screen
    const [showLivePreview, setShowLivePreview] = useState(false); // State for split-pane preview during creation
    const [generatingIrnId, setGeneratingIrnId] = useState(null);
    const barcodeInputRef = React.useRef(null);

    const handleGenerateIRN = async (invoice) => {
        if (!invoice) return;
        const invKey = invoice.id || invoice.invoice_number;
        setGeneratingIrnId(invKey);
        try {
            const payload = {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoice_number,
                buyerGstin: invoice.client_gstin || invoice.customer_gstin,
                buyerName: invoice.client_name,
                buyerAddress: invoice.billing_address || invoice.shipping_address,
                buyerPlace: invoice.city || 'Pune',
                buyerPincode: invoice.pincode || '411001',
                totalAmount: invoice.total_amount || invoice.amount,
                taxAmount: invoice.tax_amount || 0,
                items: invoice.items,
                docDate: invoice.created_at || invoice.due_date
            };
            const result = await complianceService.generateIRN(payload);
            const ackNo = result.AckNo || result.ackNo;
            const irn = result.Irn || result.irn;
            const ackDt = result.AckDt || result.ackDt;
            const qr = result.SignedQRCode || result.signedQRCode;

            queryClient.invalidateQueries({ queryKey: ['invoices'] });

            if (viewingInvoice && (viewingInvoice.id === invoice.id || viewingInvoice.invoice_number === invoice.invoice_number)) {
                setViewingInvoice(prev => ({
                    ...prev,
                    AckNo: ackNo,
                    ack_no: ackNo,
                    AckDt: ackDt,
                    ack_dt: ackDt,
                    Irn: irn,
                    irn: irn,
                    SignedQRCode: qr,
                    signed_qr_code: qr,
                    status: 'IRN Active'
                }));
            }
            alert(`✅ E-Invoice IRN Generated Successfully!\n\nIRN: ${irn}\nAck No: ${ackNo}\nAck Date: ${ackDt}`);
        } catch (err) {
            console.error('Failed to generate IRN:', err);
            alert(`⚠️ Failed to generate E-Invoice: ${err.message || 'Masters India Verification Error'}`);
        } finally {
            setGeneratingIrnId(null);
        }
    };

    // Logistics & Delivery State for Delivery Challan tab
    const [billingDeliveries, setBillingDeliveries] = useState(() => {
        const local = localStorage.getItem('cliks_deliveries');
        if (local) {
            try { return JSON.parse(local); } catch(e) {}
        }
        return INITIAL_BILLING_DELIVERIES;
    });
    const [deliverySubTab, setDeliverySubTab] = useState('shipments'); // 'shipments' | 'challans' | 'staff' | 'returns'
    const [deliverySearch, setDeliverySearch] = useState('');
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('All');
    const [selectedChallanConfirm, setSelectedChallanConfirm] = useState(null);
    const [confirmOtp, setConfirmOtp] = useState('');
    const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

    // Form state for creating and dispatching a new shipment / delivery challan
    const [dispatchFormData, setDispatchFormData] = useState({
        delivery_number: `CLIKS/DEL/26/${100 + INITIAL_BILLING_DELIVERIES.length + 1}`,
        delivery_status: 'Packed',
        delivery_date: new Date().toISOString().split('T')[0],
        shipment_id: `SHP-${8800 + INITIAL_BILLING_DELIVERIES.length + 1}`,
        tracking_number: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
        courier_name: 'CLIKS Logistics',
        dispatch_date: '',
        estimated_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        delivery_staff_id: '',
        driver_name: '',
        vehicle_number: '',
        contact_number: '',
        customer_name: '',
        shipping_address: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '',
        package_count: 1,
        package_weight: 1.0,
        warehouse_id: 'WH-MAIN-01',
        dispatch_by: 'Kiran Mane',
        challan_number: `CHL-2026-${4420 + INITIAL_BILLING_DELIVERIES.length + 1}`,
        challan_type: 'GST',
        challan_date: new Date().toISOString().split('T')[0],
        linked_invoice_id: '',
        packaging_notes: '',
        otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
    });

    const resetDispatchForm = () => {
        const nextCount = billingDeliveries.length + 1;
        setDispatchFormData({
            delivery_number: `CLIKS/DEL/26/${100 + nextCount}`,
            delivery_status: 'Packed',
            delivery_date: new Date().toISOString().split('T')[0],
            shipment_id: `SHP-${8800 + nextCount}`,
            tracking_number: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
            courier_name: 'CLIKS Logistics',
            dispatch_date: '',
            estimated_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            delivery_staff_id: '',
            driver_name: '',
            vehicle_number: '',
            contact_number: '',
            customer_name: '',
            shipping_address: '',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '',
            package_count: 1,
            package_weight: 1.0,
            warehouse_id: 'WH-MAIN-01',
            dispatch_by: 'Kiran Mane',
            challan_number: `CHL-2026-${4420 + nextCount}`,
            challan_type: 'GST',
            challan_date: new Date().toISOString().split('T')[0],
            linked_invoice_id: '',
            packaging_notes: '',
            otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
        });
    };

    const handleSelectInvoiceForDispatch = (invId) => {
        const found = (invoices || []).find(inv => String(inv.id) === String(invId) || String(inv.invoice_number) === String(invId));
        if (found) {
            let itemCount = 1;
            try {
                if (Array.isArray(found.items)) itemCount = found.items.length;
                else if (typeof found.items === 'string') itemCount = JSON.parse(found.items || '[]').length;
            } catch (e) {}
            setDispatchFormData(prev => ({
                ...prev,
                linked_invoice_id: found.invoice_number || `INV-${found.id}`,
                customer_name: found.client_name || prev.customer_name,
                shipping_address: found.shipping_address || found.billing_address || prev.shipping_address,
                challan_type: found.invoice_type === 'Non-GST' ? 'Non-GST' : 'GST',
                package_count: itemCount > 0 ? itemCount : 1,
                city: found.city || prev.city || 'Pune',
                state: found.state || prev.state || 'Maharashtra',
                pincode: found.pincode || prev.pincode || ''
            }));
        } else {
            setDispatchFormData(prev => ({ ...prev, linked_invoice_id: '' }));
        }
    };

    const handleSelectStaffForDispatch = (staffId) => {
        const stf = INITIAL_BILLING_STAFF.find(s => s.staff_id === staffId);
        if (stf) {
            setDispatchFormData(prev => ({
                ...prev,
                delivery_staff_id: staffId,
                driver_name: stf.name,
                vehicle_number: stf.vehicle,
                contact_number: stf.mobile
            }));
        } else {
            setDispatchFormData(prev => ({
                ...prev,
                delivery_staff_id: '',
                driver_name: '',
                vehicle_number: '',
                contact_number: ''
            }));
        }
    };

    const handleCreateDispatch = (e) => {
        e.preventDefault();
        if (!dispatchFormData.customer_name?.trim()) {
            alert('Please enter or select a customer name for the dispatch.');
            return;
        }

        const newDlv = {
            ...dispatchFormData,
            delivery_id: `DLV-${500 + billingDeliveries.length + 1}`,
            stock_reserved: true,
            dispatch_status: dispatchFormData.delivery_status === 'Packed' ? 'pending' : 'dispatched',
            dispatch_date: dispatchFormData.delivery_status !== 'Packed' ? new Date().toISOString().slice(0, 10) + ' 10:00 AM' : '',
            customer_signature: '',
            delivery_photo: '',
            delivery_feedback: 0,
            pickup_request_id: '',
            pickup_status: '',
            failed_delivery_reason: '',
            reverse_logistics_status: ''
        };

        const updated = [newDlv, ...billingDeliveries];
        setBillingDeliveries(updated);
        try {
            localStorage.setItem('cliks_deliveries', JSON.stringify(updated));
        } catch (err) {}

        setIsDispatchModalOpen(false);
        resetDispatchForm();
        alert(`Dispatch Shipment created! Delivery Ref: ${newDlv.delivery_number} under Challan #${newDlv.challan_number}`);
    };

    const deliveryStats = React.useMemo(() => {
        const total = billingDeliveries.length;
        const delivered = billingDeliveries.filter(d => d.delivery_status === 'Delivered').length;
        const failed = billingDeliveries.filter(d => d.delivery_status === 'Failed Attempt').length;
        const ongoing = billingDeliveries.filter(d => ['Out For Delivery', 'Packed', 'Dispatched', 'In Transit'].includes(d.delivery_status)).length;
        const rate = total > 0 ? Math.round((delivered / total) * 100) : 25;

        return {
            successRate: `${rate}%`,
            avgSpeed: '52 mins',
            failedCount: failed,
            ongoingCount: ongoing
        };
    }, [billingDeliveries]);

    const filteredDeliveries = React.useMemo(() => {
        return billingDeliveries.filter((dlv) => {
            const matchesSearch = !deliverySearch || 
                (dlv.customer_name && dlv.customer_name.toLowerCase().includes(deliverySearch.toLowerCase())) ||
                (dlv.delivery_number && dlv.delivery_number.toLowerCase().includes(deliverySearch.toLowerCase())) ||
                (dlv.city && dlv.city.toLowerCase().includes(deliverySearch.toLowerCase())) ||
                (dlv.driver_name && dlv.driver_name.toLowerCase().includes(deliverySearch.toLowerCase())) ||
                (dlv.tracking_number && dlv.tracking_number.toLowerCase().includes(deliverySearch.toLowerCase())) ||
                (dlv.challan_number && dlv.challan_number.toLowerCase().includes(deliverySearch.toLowerCase()));
            
            const matchesStatus = deliveryStatusFilter === 'All' || dlv.delivery_status === deliveryStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [billingDeliveries, deliverySearch, deliveryStatusFilter]);

    // Supplier View Modal states for B2B Purchase Request confirmation
    const [isSupplierViewModalOpen, setIsSupplierViewModalOpen] = useState(false);
    const [supplierViewPO, setSupplierViewPO] = useState(null);
    const [isConfirmingPO, setIsConfirmingPO] = useState(false);
    const [supplierResponseMode, setSupplierResponseMode] = useState('CONFIRMED'); // 'CONFIRMED' | 'PARTIALLY_AVAILABLE' | 'NOT_AVAILABLE' | 'AVAILABLE_LATER'
    const [expectedAvailableDate, setExpectedAvailableDate] = useState('');
    const [itemAvailableQtys, setItemAvailableQtys] = useState({});

    const handleOpenSupplierView = (invoice) => {
        const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items || '[]') : (invoice.items || []);
        const parsedItems = items.map((it, idx) => ({
            id: it.id,
            product_name: it.product_name || it.name || it.description || 'Product',
            quantity: it.quantity || it.qty || 1,
            available_quantity: it.available_quantity !== undefined && it.available_quantity !== null ? it.available_quantity : (it.quantity || it.qty || 1),
            primary_unit: it.primary_unit || it.unit || 'pcs',
            purchase_price: it.purchase_price || it.price || it.unit_cost || 0
        }));

        const initialQtys = {};
        parsedItems.forEach((it, idx) => {
            initialQtys[idx] = it.available_quantity;
        });
        setItemAvailableQtys(initialQtys);
        setSupplierResponseMode('CONFIRMED');
        setExpectedAvailableDate(invoice.expected_available_date || '');

        const currentStatus = invoice.supplier_confirmation_status || invoice.supplier_response_type || invoice.status || 'PENDING SUPPLIER CONFIRMATION';

        const poData = {
            id: invoice.id,
            purchase_id: invoice.id,
            purchase_number: invoice.invoice_number?.replace(/^INV-/, '') || invoice.invoice_number || 'PO-0702',
            dealer_name: invoice.client_name || 'CLIKS Dealer Store',
            supplier_name: businessProfile?.data?.business_name || businessProfile?.business_name || 'gogo tech',
            purchase_date: invoice.due_date || (invoice.created_at ? invoice.created_at.split('T')[0] : '2026-08-19'),
            created_at: invoice.created_at,
            items: parsedItems,
            status: currentStatus,
            supplier_confirmation_status: currentStatus,
            supplier_response_type: invoice.supplier_response_type,
            expected_available_date: invoice.expected_available_date,
            supplier_status_message: invoice.supplier_status_message
        };
        setSupplierViewPO(poData);
        setIsSupplierViewModalOpen(true);
    };

    const handleConfirmPOBySupplier = async (poId, responseTypeOverride) => {
        const mode = responseTypeOverride || supplierResponseMode || 'CONFIRMED';
        setIsConfirmingPO(true);
        try {
            const payloadItems = supplierViewPO.items.map((it, idx) => ({
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

            const targetId = poId || supplierViewPO?.id || supplierViewPO?.purchase_number || supplierViewPO?.invoice_number;
            await purchasesService.confirmSupplierPurchase(targetId, payload);
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
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

    // Tab Navigation State (Orders List, Sales Returns, Purchase Returns, Warranty Claims)
    const [activeMainTab, setActiveMainTab] = useState('orders'); // 'orders', 'sales_returns', 'purchase_returns', 'warranty'
    const [isOrderReportsModalOpen, setIsOrderReportsModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnFormType, setReturnFormType] = useState('sales'); // 'sales', 'purchase', 'warranty'
    const [newReturnData, setNewReturnData] = useState({
        client_name: '',
        invoice_number: '',
        total_amount: '',
        reason: 'Defective / Customer Return',
        return_type: 'sales'
    });

    const [selectedReturnItems, setSelectedReturnItems] = useState([]);

    // Fetch Returns & Claims
    const { data: allReturns = [], isLoading: isReturnsLoading } = useQuery({
        queryKey: ['returns'],
        queryFn: () => returnsService.getReturns().catch(() => []),
        refetchOnWindowFocus: false
    });

    const createReturnMutation = useMutation({
        mutationFn: (data) => returnsService.createReturn(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            alert('Return / Claim record created successfully!');
            setIsReturnModalOpen(false);
            setSelectedReturnItems([]);
            setNewReturnData({ client_name: '', invoice_number: '', total_amount: '', reason: 'Defective / Customer Return', return_type: 'sales' });
        },
        onError: (err) => {
            console.error('Failed to create return:', err);
            alert('Could not record return transaction.');
        }
    });

    const [moveWarehouseModalReturn, setMoveWarehouseModalReturn] = useState(null);
    const [selectedWarehouseForMove, setSelectedWarehouseForMove] = useState('');
    const [gotItModalData, setGotItModalData] = useState(null);
    const [selectedClmDetail, setSelectedClmDetail] = useState(null);

    const getFormattedPurchaseDate = (claim) => {
        const rawDate = claim.warranty_start_date || claim.return_date || claim.created_at || claim.purchase_date;
        if (!rawDate) return '28/06/2026';
        try {
            const d = new Date(rawDate);
            if (isNaN(d.getTime())) return '28/06/2026';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return '28/06/2026';
        }
    };

    const getWarrantyPeriodText = (claim) => {
        if (claim.warranty_period) return claim.warranty_period;
        if (claim.period) return claim.period;
        if (claim.reason_code && claim.reason_code.includes('Warranty Period:')) {
            try {
                return claim.reason_code.split('Warranty Period:')[1].split('(')[0].trim();
            } catch (e) {}
        }
        return '2 Years';
    };

    const calculateWarrantyProgress = (claim) => {
        const rawDate = claim.warranty_start_date || claim.return_date || claim.created_at || claim.purchase_date;
        let startDate = new Date('2026-06-28T00:00:00.000Z');
        if (rawDate) {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
                startDate = parsed;
            }
        }

        const periodText = getWarrantyPeriodText(claim);
        let totalDays = 730;

        const match = String(periodText).match(/(\d+)\s*(year|yr|month|mo|day|d)s?/i);
        if (match) {
            const num = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();
            if (unit.startsWith('year') || unit.startsWith('yr')) {
                totalDays = num * 365;
            } else if (unit.startsWith('month') || unit.startsWith('mo')) {
                totalDays = num * 30;
            } else if (unit.startsWith('day') || unit.startsWith('d')) {
                totalDays = num;
            }
        }

        const now = new Date();
        const diffTime = Math.max(0, now.getTime() - startDate.getTime());
        let elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (elapsedDays === 0 || isNaN(elapsedDays)) {
            elapsedDays = 56;
        }
        if (elapsedDays > totalDays) {
            elapsedDays = totalDays;
        }

        return {
            elapsedDays,
            totalDays,
            progressText: `${elapsedDays} / ${totalDays} days`
        };
    };

    const assignWarehouseMutation = useMutation({
        mutationFn: ({ returnId, warehouseName, status, targetClaim }) => returnsService.updateReturn(returnId, {
            warehouse_id: warehouseName,
            warehouse_name: warehouseName,
            status: status || 'Done',
            inspection_status: 'Assigned to Warehouse',
            items: targetClaim?.items || moveWarehouseModalReturn?.items || [],
            return_obj: targetClaim || moveWarehouseModalReturn,
            product_name: targetClaim?.product_name || targetClaim?.item_name || targetClaim?.name || moveWarehouseModalReturn?.product_name || moveWarehouseModalReturn?.name,
            return_quantity: targetClaim?.return_quantity || targetClaim?.quantity || moveWarehouseModalReturn?.return_quantity || moveWarehouseModalReturn?.quantity || 1
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['returns'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['warehouseReports'] });
            setMoveWarehouseModalReturn(null);
            setSelectedWarehouseForMove('');
        },
        onError: (err) => {
            alert('Failed to assign warehouse: ' + (err.message || 'Error occurred'));
        }
    });

    const salesReturnsList = React.useMemo(() => {
        return (allReturns || []).filter(r => (r.return_type === 'sales' || r.type === 'sales' || !r.return_type) &&
            ((r.client_name || r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.invoice_number || r.return_number || '').toLowerCase().includes(searchTerm.toLowerCase())));
    }, [allReturns, searchTerm]);

    const purchaseReturnsList = React.useMemo(() => {
        return (allReturns || []).filter(r => (r.return_type === 'purchase' || r.type === 'purchase') &&
            ((r.supplier_name || r.vendor_name || r.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.bill_number || r.return_number || '').toLowerCase().includes(searchTerm.toLowerCase())));
    }, [allReturns, searchTerm]);

    const warrantyClaimsList = React.useMemo(() => {
        return (allReturns || []).filter(r => (r.return_type === 'warranty' || r.type === 'warranty' || r.claim_type === 'warranty' || 
            (r.return_number && String(r.return_number).toUpperCase().startsWith('RET-')) || 
            (r.claim_number && String(r.claim_number).toUpperCase().startsWith('RET-')) || 
            (r.invoice_number && String(r.invoice_number).toUpperCase().startsWith('RET-'))) &&
            ((r.product_name || r.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.client_name || r.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())));
    }, [allReturns, searchTerm]);

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
        sendPurchaseHistoryToCustomer: true,
        sendToCustomerHistory: true,
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
            const qty = Math.max(0, parseFloat(item.quantity) || 0);
            const prc = Math.max(0, parseFloat(item.price) || 0);
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
        const redeemedAmt = parseFloat(currentFormData.redeemed_points) || 0;
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
            let processedValue = value;
            if (field === 'quantity' || field === 'free_quantity' || field === 'price') {
                if (typeof value === 'number') {
                    processedValue = Math.max(0, value);
                } else if (typeof value === 'string' && value !== '') {
                    const parsed = parseFloat(value);
                    processedValue = isNaN(parsed) ? '' : Math.max(0, parsed);
                }
            }
            newItems[index][field] = processedValue;
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
    const { data: rawInvoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: billingService.getInvoices
    });
    const invoices = React.useMemo(() => {
        if (Array.isArray(rawInvoices)) return rawInvoices;
        if (rawInvoices?.invoices && Array.isArray(rawInvoices.invoices)) return rawInvoices.invoices;
        if (rawInvoices?.data && Array.isArray(rawInvoices.data)) return rawInvoices.data;
        return [];
    }, [rawInvoices]);

    const { data: rawInventoryItems = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryService.getInventory
    });
    const inventoryItems = React.useMemo(() => {
        if (Array.isArray(rawInventoryItems)) return rawInventoryItems;
        if (rawInventoryItems?.inventory && Array.isArray(rawInventoryItems.inventory)) return rawInventoryItems.inventory;
        if (rawInventoryItems?.items && Array.isArray(rawInventoryItems.items)) return rawInventoryItems.items;
        if (rawInventoryItems?.data && Array.isArray(rawInventoryItems.data)) return rawInventoryItems.data;
        return [];
    }, [rawInventoryItems]);

    // 📦 FETCH ACTIVE CORE CATALOG
    const { data: rawCatalogProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts()
    });
    const catalogProducts = React.useMemo(() => {
        if (Array.isArray(rawCatalogProducts)) return rawCatalogProducts;
        if (rawCatalogProducts?.products && Array.isArray(rawCatalogProducts.products)) return rawCatalogProducts.products;
        if (rawCatalogProducts?.items && Array.isArray(rawCatalogProducts.items)) return rawCatalogProducts.items;
        if (rawCatalogProducts?.data && Array.isArray(rawCatalogProducts.data)) return rawCatalogProducts.data;
        return [];
    }, [rawCatalogProducts]);

    const { data: rawCustomers = [] } = useQuery({
        queryKey: ['business-customers'],
        queryFn: async () => {
            const res = await crmService.getCustomers();
            if (Array.isArray(res)) return res;
            if (res?.customers && Array.isArray(res.customers)) return res.customers;
            if (res?.data?.customers && Array.isArray(res.data.customers)) return res.data.customers;
            if (res?.data && Array.isArray(res.data)) return res.data;
            return [];
        }
    });
    const customers = React.useMemo(() => {
        if (Array.isArray(rawCustomers)) return rawCustomers;
        if (rawCustomers?.customers && Array.isArray(rawCustomers.customers)) return rawCustomers.customers;
        if (rawCustomers?.data && Array.isArray(rawCustomers.data)) return rawCustomers.data;
        return [];
    }, [rawCustomers]);

    const { data: rawBankAccounts = [] } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: paymentsStore.getBankAccounts
    });
    const bankAccounts = React.useMemo(() => {
        if (Array.isArray(rawBankAccounts)) return rawBankAccounts;
        if (rawBankAccounts?.accounts && Array.isArray(rawBankAccounts.accounts)) return rawBankAccounts.accounts;
        if (rawBankAccounts?.bankAccounts && Array.isArray(rawBankAccounts.bankAccounts)) return rawBankAccounts.bankAccounts;
        if (rawBankAccounts?.data && Array.isArray(rawBankAccounts.data)) return rawBankAccounts.data;
        return [];
    }, [rawBankAccounts]);

    const { data: rawSuppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersService.getSuppliers().catch(() => []),
        refetchOnWindowFocus: false
    });
    const suppliersList = React.useMemo(() => {
        if (Array.isArray(rawSuppliers)) return rawSuppliers;
        if (rawSuppliers?.suppliers && Array.isArray(rawSuppliers.suppliers)) return rawSuppliers.suppliers;
        if (rawSuppliers?.data && Array.isArray(rawSuppliers.data)) return rawSuppliers.data;
        return [];
    }, [rawSuppliers]);

    const { data: rawPurchases = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: () => purchasesService.getPurchases().catch(() => []),
        refetchInterval: 3000,
        refetchIntervalInBackground: true
    });

    React.useEffect(() => {
        if (isSupplierViewModalOpen && supplierViewPO && rawPurchases) {
            const list = Array.isArray(rawPurchases) ? rawPurchases : (rawPurchases.purchases || rawPurchases.data || []);
            if (Array.isArray(list) && list.length > 0) {
                const updated = list.find(p => (p.id && String(p.id) === String(supplierViewPO.id)) || (p.purchase_number && p.purchase_number === supplierViewPO.purchase_number));
                if (updated) {
                    const curSt = supplierViewPO.supplier_confirmation_status || supplierViewPO.status;
                    const newSt = updated.supplier_confirmation_status || updated.status;
                    if (curSt !== newSt || updated.expected_available_date !== supplierViewPO.expected_available_date) {
                        setSupplierViewPO(updated);
                    }
                }
            }
        }
    }, [rawPurchases, isSupplierViewModalOpen, supplierViewPO]);
    const purchasesList = React.useMemo(() => {
        if (Array.isArray(rawPurchases)) return rawPurchases;
        if (rawPurchases?.purchases && Array.isArray(rawPurchases.purchases)) return rawPurchases.purchases;
        if (rawPurchases?.data && Array.isArray(rawPurchases.data)) return rawPurchases.data;
        return [];
    }, [rawPurchases]);



    const availableInvoicesForReturn = React.useMemo(() => {
        if (!newReturnData.client_name) return [];
        const selName = newReturnData.client_name.trim().toLowerCase();
        
        if (returnFormType === 'purchase') {
            return (purchasesList || []).filter(p => {
                const sName = (p.supplier_name || p.client_name || '').trim().toLowerCase();
                return sName === selName || (sName && sName.includes(selName)) || (selName && selName.includes(sName));
            });
        } else {
            return (invoices || []).filter(inv => {
                const cName = (inv.client_name || inv.customer_name || inv.client_email || '').trim().toLowerCase();
                return cName === selName || (cName && cName.includes(selName)) || (selName && selName.includes(cName));
            });
        }
    }, [invoices, purchasesList, newReturnData.client_name, returnFormType]);

    const { data: rawWarehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.getWarehouses().catch(() => []),
        refetchOnWindowFocus: false
    });
    const dbWarehousesList = React.useMemo(() => {
        let list = [];
        if (Array.isArray(rawWarehouses)) list = rawWarehouses;
        else if (rawWarehouses?.warehouses && Array.isArray(rawWarehouses.warehouses)) list = rawWarehouses.warehouses;
        else if (rawWarehouses?.data && Array.isArray(rawWarehouses.data)) list = rawWarehouses.data;
        
        if (list.length === 0) {
            return [
                { id: 'Main Godown', name: 'Main Godown', code: 'MAIN-01' },
                { id: 'North Central Hub', name: 'North Central Hub', code: 'NORTH-02' }
            ];
        }
        return list;
    }, [rawWarehouses]);

    const { data: rawProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsService.getProducts().catch(() => []),
        refetchOnWindowFocus: false
    });

    const warrantyEligibleProducts = React.useMemo(() => {
        const prods = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
        return prods.filter(p => p.has_warranty === 'Yes' || p.has_warranty === true || String(p.has_warranty).toLowerCase() === 'yes');
    }, [rawProducts]);

    React.useEffect(() => {
        const email = formData.client_email ? String(formData.client_email).trim() : '';
        if (!email || !email.includes('@')) {
            setFetchedLoyaltyCustomer(null);
            return;
        }

        const timer = setTimeout(() => {
            crmService.lookupCustomerByEmail(email).then(res => {
                if (res && res.exists) {
                    setFetchedLoyaltyCustomer({
                        id: res.user_id,
                        email: res.email,
                        name: res.customer_name || formData.client_name,
                        loyalty_points: res.loyalty_points || 0
                    });
                } else {
                    setFetchedLoyaltyCustomer(null);
                }
            }).catch(() => {
                setFetchedLoyaltyCustomer(null);
            });
        }, 200);

        return () => clearTimeout(timer);
    }, [formData.client_email, formData.client_name]);

    const activeSelectedCustomer = React.useMemo(() => {
        if (fetchedLoyaltyCustomer) return fetchedLoyaltyCustomer;
        if (!selectedCustomerObject) return null;
        return customers.find(c => c.id === selectedCustomerObject.id) || selectedCustomerObject;
    }, [customers, selectedCustomerObject, fetchedLoyaltyCustomer]);

    // e-Invoice & e-Way Bill States
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
    const [isLutModalOpen, setIsLutModalOpen] = useState(false);
    const [customerMode, setCustomerMode] = useState('existing');
    const [saveCustomerForFuture, setSaveCustomerForFuture] = useState(false);
    const [selectedQrInvoice, setSelectedQrInvoice] = useState(null);
    const [successModalData, setSuccessModalData] = useState(null);
    const [confirmingGstDeleteId, setConfirmingGstDeleteId] = useState(null);
    const [locallyDeletedGstIds, setLocallyDeletedGstIds] = useState([]);
    const [ewayBills, setEwayBills] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

    const [invoiceForm, setInvoiceForm] = useState({
        invoice_type: 'B2B',
        place_of_supply: '05-Uttarakhand',
        taxable_value: '',
        gst_percentage: 18,
        reverse_charge: 'No',
        client_name: '',
        customer_gstin: '',
        hsn_code: '100190',
        unit: 'BOX',
        quantity: 1,
        export_under_lut: 'No',
        lut_document_path: '',
        lut_file_name: '',
        lut_uploaded_at: '',
        lut_uploaded_by: '',
        sender_product_name: '',
        receiver_product_name: ''
    });

    const [ewayForm, setEwayForm] = useState({
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        transport_mode: 'Road',
        transporter_name: 'M/S UTTARAYAN CO-OPERATIVE FOR RENEWABLE ENERGY',
        transporter_gstin: '05AAAAU6537D1ZO',
        vehicle_number: '',
        transport_distance: '',
        dispatch_location: '',
        delivery_location: '',
        goods_product_name: '',
        goods_hsn_code: '',
        goods_quantity: '',
        goods_unit: 'Pcs',
        goods_taxable_value: '',
        goods_gst_rate: '18',
        is_invoice_selected: false,
        goods_items: []
    });

    // e-Invoice & e-Way Bill Queries
    const { data: dbGstInvoices = [] } = useQuery({
        queryKey: ['gstInvoices'],
        queryFn: () => gstService.getInvoices()
    });

    const { data: dbEways = [] } = useQuery({
        queryKey: ['gstEways'],
        queryFn: () => gstService.getEways()
    });

    const resolvedDbEways = Array.isArray(dbEways)
        ? dbEways
        : (Array.isArray(dbEways?.data)
            ? dbEways.data
            : (Array.isArray(dbEways?.results?.ewayBills)
                ? dbEways.results.ewayBills
                : (Array.isArray(dbEways?.results?.message)
                    ? dbEways.results.message
                    : [])));

    const combinedEways = [
        ...(Array.isArray(ewayBills) ? ewayBills : []),
        ...resolvedDbEways
    ];

    const seenEwayKeys = new Set();
    const ewaysList = combinedEways
        .filter(item => {
            if (!item) return false;
            const idKey = String(item.id || '');
            if (locallyDeletedGstIds.includes(idKey)) return false;
            const rawNo = item.ewayBillNo || item.eway_bill_no || item.eway_bill_number;
            const key = String(rawNo || idKey);
            if (seenEwayKeys.has(key)) return false;
            seenEwayKeys.add(key);
            return true;
        })
        .map(item => ({
            id: item.id,
            ewayBillNo: item.ewayBillNo || item.eway_bill_no || item.eway_bill_number || '',
            eway_bill_no: item.ewayBillNo || item.eway_bill_no || item.eway_bill_number || '',
            eway_bill_number: item.ewayBillNo || item.eway_bill_no || item.eway_bill_number || '',
            carrierName: item.carrierName || item.transporter_name || item.carrier_name || '',
            transporter_name: item.carrierName || item.transporter_name || item.carrier_name || '',
            vehicleNo: item.vehicleNo || item.vehicle_number || item.vehicle_reg_no || '',
            vehicle_number: item.vehicleNo || item.vehicle_number || item.vehicle_reg_no || '',
            distance: item.distance || (item.transport_distance ? `${item.transport_distance} Kms` : ''),
            transport_distance: parseInt(item.transport_distance) || parseInt(item.distance) || 0,
            sourceDestination: item.sourceDestination || (item.dispatch_location || item.delivery_location ? `${item.dispatch_location || ''} → ${item.delivery_destination || item.delivery_location || ''}` : ''),
            dispatch_location: item.dispatch_location || '',
            delivery_location: item.delivery_destination || item.delivery_location || '',
            status: item.status || 'Active',
            reference_invoice: item.reference_invoice || '',
            transport_mode: item.transport_mode || '',
            transporter_gstin: item.transporter_gstin || '',
            validUpto: item.valid_upto || item.validUpto || '',
            url: item.url || item.print_url || item.pdf_url || '',
            print_url: item.url || item.print_url || item.pdf_url || '',
            pdf_url: item.url || item.print_url || item.pdf_url || ''
        }));

    const activeBusinessProfile = (businessProfile?.data || businessProfile) || JSON.parse(localStorage.getItem('cliks_org_profile') || localStorage.getItem('cliks_business_config') || '{}');

    const defaultSender = {
      legal_name: activeBusinessProfile.business_name || activeBusinessProfile.legal_name || activeBusinessProfile.companyName || "Welton Consignor",
      gstin: activeBusinessProfile.gstin || activeBusinessProfile.gstinRef || "05AAAPG7885R002",
      state: activeBusinessProfile.state_registered || activeBusinessProfile.stateRegistered || "Uttarakhand",
      state_code: (activeBusinessProfile.gstin ? activeBusinessProfile.gstin.slice(0, 2) : (activeBusinessProfile.gstinRef ? activeBusinessProfile.gstinRef.slice(0, 2) : "05")),
      address: activeBusinessProfile.address || activeBusinessProfile.registeredAddress || "Dehradun Central Road",
      location: activeBusinessProfile.city || (activeBusinessProfile.address ? activeBusinessProfile.address.split(',')[0]?.trim() : "Dehradun") || "Dehradun",
      pincode: activeBusinessProfile.pincode || 248001
    };

    const gstProfile = {
        gstin: defaultSender.gstin,
        legal_name: defaultSender.legal_name,
        business_type: 'Private Limited',
        place_of_business: defaultSender.state,
        state_code: defaultSender.state_code
    };

    const gstInvoicesList = (Array.isArray(dbGstInvoices) ? dbGstInvoices : [])
        .filter(item => !locallyDeletedGstIds.includes(String(item.id)))
        .map(item => ({
            id: item.id,
            invoice_number: item.invoice_number || 'N/A',
            type: item.invoice_type || 'B2B',
            invoice_type: item.invoice_type || 'B2B',
            date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            place_of_supply: item.place_of_supply || 'N/A',
            taxable_value: parseFloat(item.taxable_value) || 0,
            gst_percentage: parseFloat(item.gst_percentage) || 18,
            cgst_amount: parseFloat(item.cgst_amount) || 0,
            sgst_amount: parseFloat(item.sgst_amount) || 0,
            cgst_sgst: `${parseFloat(item.cgst_amount) || 0} + ${parseFloat(item.sgst_amount) || 0}`,
            igst_amount: parseFloat(item.igst_amount) || 0,
            igst: parseFloat(item.igst_amount) || 0,
            total_tax: parseFloat(item.total_tax) || 0,
            total_gst: parseFloat(item.total_tax) || 0,
            reverse_charge: item.reverse_charge || 'No',
            irn: item.irn || item.govt_irn || item.irn_hash || item.irnNo || item.ack_irn || item.irn_number || '',
            irn_number: item.irn_number || item.irn || item.govt_irn || item.irn_hash || item.irnNo || item.ack_irn || '',
            govt_irn: item.govt_irn || item.irn || item.irn_number || '',
            irn_hash: item.irn_hash || item.irn || item.irn_number || '',
            irnNo: item.irnNo || item.irn || item.irn_number || '',
            ack_irn: item.ack_irn || item.irn || item.irn_number || '',
            qr_status: item.qr_status || 'Pending',
            status: 'READY',
            export_under_lut: item.export_under_lut || 'false',
            lut_document_path: item.lut_document_path || '',
            lut_file_name: item.lut_file_name || '',
            lut_uploaded_at: item.lut_uploaded_at || '',
            lut_uploaded_by: item.lut_uploaded_by || '',
            customer_name: item.customer_name || item.client_name || 'N/A',
            customer_gstin: item.customer_gstin || 'N/A',
            customer_state: item.customer_state || item.place_of_supply || 'N/A',
            sender_name: item.sender_name || 'N/A',
            sender_gstin: item.sender_gstin || 'N/A',
            sender_state: item.sender_state || 'N/A'
        }));

    // Mutations for GST e-Invoice & e-Way
    const generateGstInvoiceMutation = useMutation({
        mutationFn: (data) => gstService.generateInvoice(data),
        onSuccess: (resData, variables) => {
            const rawMsg = resData?.results?.message || resData?.data?.results?.message || resData?.data || resData || {};
            const irnVal = rawMsg.Irn || rawMsg.irn || resData?.irn || resData?.irn_number || null;
            const ackNoVal = rawMsg.AckNo || rawMsg.ack_no || resData?.ack_no || resData?.AckNo || null;
            const ackDtVal = rawMsg.AckDt || rawMsg.ack_date || resData?.ack_date || resData?.AckDt || null;
            const pdfVal = getSafePdfUrl(rawMsg.EinvoicePdf || rawMsg.QRCodeUrl || resData?.pdf_url || resData?.einvoice_pdf_url || null);
            const qrVal = rawMsg.SignedQRCode || rawMsg.signed_qr_code || resData?.SignedQRCode || resData?.signed_qr_code || null;
            const invoiceNum = resData?.invoice_number || resData?.document_number || rawMsg.document_number || variables?.document_number || `CLK-INV-${Math.floor(1000 + Math.random() * 9000)}`;

            const taxable = parseFloat(variables?.taxable_value || resData?.taxable_value || resData?.taxable_amount || 1000);
            const gstPct = parseFloat(variables?.gst_percentage || resData?.gst_percentage || 18);
            const totalTax = taxable * (gstPct / 100);
            const totalAmt = taxable + totalTax;

            const newRecord = {
                id: resData?.id || rawMsg.id || Date.now(),
                invoice_number: invoiceNum,
                document_number: invoiceNum,
                date: ackDtVal || new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
                client_name: variables?.client_name || variables?.customer_name || 'Sthuthya Consignee',
                customer_name: variables?.client_name || variables?.customer_name || 'Sthuthya Consignee',
                customer_gstin: variables?.customer_gstin || '09AAAPG7885R002',
                invoice_type: variables?.invoice_type || 'B2B',
                place_of_supply: variables?.place_of_supply || '09-Uttar Pradesh',
                taxable_value: taxable,
                taxable_amount: taxable,
                gst_percentage: gstPct,
                cgst_amount: 0,
                sgst_amount: 0,
                igst_amount: totalTax,
                total_tax: totalTax,
                amount: totalAmt,
                total_amount: totalAmt,
                total_invoice: totalAmt,
                irn_number: irnVal,
                irn: irnVal,
                ack_no: ackNoVal,
                ack_date: ackDtVal,
                qr_status: 'Signed',
                pdf_url: pdfVal,
                url: pdfVal,
                SignedQRCode: qrVal,
                signed_qr_code: qrVal,
                status: 'GENERATED'
            };

            queryClient.setQueryData(['gstInvoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);
            queryClient.setQueryData(['invoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);
            queryClient.setQueryData(['salesInvoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);

            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['gstr3bReport'] });
            queryClient.invalidateQueries({ queryKey: ['gstr9Report'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });

            setIsInvoiceModalOpen(false);
            setCustomerMode('existing');
            setSaveCustomerForFuture(false);
            setInvoiceForm({
                invoice_type: 'B2B',
                place_of_supply: '05-Uttarakhand',
                taxable_value: '',
                gst_percentage: 18,
                reverse_charge: 'No',
                client_name: '',
                customer_gstin: '',
                hsn_code: '100190',
                unit: 'BOX',
                quantity: 1,
                export_under_lut: 'No',
                lut_document_path: '',
                lut_file_name: '',
                lut_uploaded_at: '',
                lut_uploaded_by: '',
                sender_product_name: '',
                receiver_product_name: ''
            });

            setSelectedQrInvoice({
                ...newRecord,
                ...(resData?.data || resData),
                irn: irnVal,
                irn_number: irnVal,
                AckNo: ackNoVal,
                ack_no: ackNoVal,
                AckDt: ackDtVal,
                ack_date: ackDtVal,
                SignedQRCode: qrVal,
                signed_qr_code: qrVal,
                EinvoicePdf: pdfVal,
                pdf_url: pdfVal,
                results: resData?.results || resData?.data?.results || { message: rawMsg }
            });
        },
        onError: (err, variables) => {
            const responseData = err?.response?.data || {};
            const message = responseData.errorMessage || responseData.message || responseData.error || err.message || 'Server error';
            console.error('Failed to generate e-Invoice:', message);
            alert(`Failed to generate e-Invoice: ${message}`);
        }
    });

    const createEwayMutation = useMutation({
        mutationFn: (data) => complianceService.generateEWayBill(data),
        onSuccess: (resData, variables) => {
            queryClient.invalidateQueries(['eway-bills']);
            queryClient.invalidateQueries({ queryKey: ['eway-bills'] });
            queryClient.invalidateQueries({ queryKey: ['gstEways'] });
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            setIsEwayModalOpen(false);
            setEwayForm({
                invoice_number: '',
                invoice_date: new Date().toISOString().split('T')[0],
                transport_mode: 'Road',
                transporter_name: 'M/S UTTARAYAN CO-OPERATIVE FOR RENEWABLE ENERGY',
                transporter_gstin: '05AAAAU6537D1ZO',
                vehicle_number: '',
                transport_distance: '',
                dispatch_location: '',
                delivery_location: '',
                goods_product_name: '',
                goods_hsn_code: '',
                goods_quantity: '',
                goods_unit: 'Pcs',
                goods_taxable_value: '',
                goods_gst_rate: '18',
                is_invoice_selected: false,
                goods_items: []
            });
            setValidationErrors({});

            const res = resData?._isAxiosResponse ? resData : { data: resData, ...resData };
            const formData = variables || {};

            const newRecord = {
              id: res.data?.results?.message?.ewayBillNo || res.results?.message?.ewayBillNo || res.data?.ewayBillNo || Date.now(),
              ewayBillNo: res.data?.results?.message?.ewayBillNo || res.results?.message?.ewayBillNo || res.data?.ewayBillNo || res.ewayBillNo,
              eway_bill_no: res.data?.results?.message?.ewayBillNo || res.results?.message?.ewayBillNo || res.data?.ewayBillNo || res.ewayBillNo,
              eway_bill_number: res.data?.results?.message?.ewayBillNo || res.results?.message?.ewayBillNo || res.data?.ewayBillNo || res.ewayBillNo,
              carrierName: formData.transport_company_name || formData.transporter_name || "TAPURI",
              transporter_name: formData.transport_company_name || formData.transporter_name || "TAPURI",
              vehicleNo: formData.vehicle_number || "KA12BL4567",
              vehicle_number: formData.vehicle_number || "KA12BL4567",
              distance: `${formData.distance || formData.transport_distance || 10} Kms`,
              transport_distance: formData.distance || formData.transport_distance || 10,
              sourceDestination: `${formData.dispatch_location || "Dehradun"} → ${formData.delivery_destination || formData.delivery_location || "Dehradun"}`,
              dispatch_location: formData.dispatch_location || "Dehradun",
              delivery_location: formData.delivery_destination || formData.delivery_location || "Dehradun",
              status: "GENERATED",
              validUpto: res.data?.results?.message?.validUpto || res.results?.message?.validUpto || res.data?.validUpto || res.validUpto || "—",
              url: res.data?.results?.message?.url || res.results?.message?.url || res.data?.url || res.url
            };
            setEwayBills(prev => [newRecord, ...(Array.isArray(prev) ? prev : [])]);
            queryClient.invalidateQueries({ queryKey: ['gstEways'] });
            queryClient.invalidateQueries({ queryKey: ['eway-bills'] });
            queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });

            setSuccessModalData({
                ewayBillNo: newRecord.ewayBillNo || '—',
                validUpto: newRecord.validUpto || '—',
                pdfUrl: newRecord.url ? getSafePdfUrl(newRecord.url) : null
            });
        },
        onError: (err) => {
            const apiError = err?.response?.data?.results?.message || err?.response?.data?.message || err?.response?.data?.error?.message || err?.message || "Failed to generate e-Way Bill";
            console.error('Failed to generate e-Way Bill:', apiError);
            alert(apiError);
        }
    });

    const deleteGstInvoiceMutation = useMutation({
        mutationFn: (id) => gstService.deleteInvoice(id),
        onMutate: (targetId) => {
            setLocallyDeletedGstIds(prev => [...prev, String(targetId)]);
        },
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(['gstInvoices'], (old = []) => 
                Array.isArray(old) ? old.filter(item => String(item.id) !== String(deletedId)) : []
            );
            queryClient.setQueryData(['gstEways'], (old = []) => 
                Array.isArray(old) ? old.filter(item => String(item.id) !== String(deletedId)) : []
            );
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['gstEways'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (err) => {
            console.error('[GST Deletion] Network error:', err);
            alert('Unable to reach billing network. Please retry.');
        }
    });

    const handleGenerateGstInvoice = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (!invoiceForm.client_name || !invoiceForm.client_name.trim()) {
            errors.client_name = 'Customer Name is required.';
        }
        if (invoiceForm.invoice_type === 'B2B') {
            if (!invoiceForm.customer_gstin || !invoiceForm.customer_gstin.trim()) {
                errors.customer_gstin = 'Customer GSTIN is required for B2B invoices.';
            } else {
                const gstinRegex = /^[0-9]{2}[A-Z0-9]{13}$/i;
                if (!gstinRegex.test(invoiceForm.customer_gstin.trim())) {
                    errors.customer_gstin = 'Invalid GSTIN format (15-characters, e.g. 05AAAPG7885R002).';
                }
            }
        }
        const val = parseFloat(invoiceForm.taxable_value) || 0;
        if (val <= 0) {
            errors.taxable_value = 'Taxable value must be greater than 0.';
        }
        if (invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes') {
            if (!invoiceForm.lut_document_path) {
                errors.lut_document_path = 'Please upload a valid LUT document.';
                alert('Please upload a valid LUT document.');
            }
        }
        if (!invoiceForm.receiver_product_name || !invoiceForm.receiver_product_name.trim()) {
            errors.receiver_product_name = 'Product Name / Description is required.';
        }
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            console.warn('[e-Invoice Validation Failed] Validation errors:', errors);
            return;
        }
        
        setValidationErrors({});
        
        if (customerMode === 'manual' && saveCustomerForFuture) {
            try {
                await crmService.createCustomer({
                    name: invoiceForm.client_name,
                    outstanding_balance: 0,
                    total_spent: parseFloat(invoiceForm.taxable_value) || 0,
                    gstin: invoiceForm.customer_gstin,
                    state: invoiceForm.place_of_supply,
                    place_of_supply: invoiceForm.place_of_supply
                });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
                queryClient.invalidateQueries({ queryKey: ['business-customers'] });
            } catch (err) {
                console.error('[Generate Invoice] Failed to save customer:', err);
            }
        }

        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        const generatedDocNumber = `CLK-INV-${Math.floor(1000 + Math.random() * 9000)}`;

        generateGstInvoiceMutation.mutate({
            document_number: generatedDocNumber,
            document_date: formattedDate,
            invoice_type: invoiceForm.invoice_type,
            place_of_supply: invoiceForm.place_of_supply,
            taxable_value: parseFloat(invoiceForm.taxable_value) || 0,
            gst_percentage: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? 0 : (parseInt(invoiceForm.gst_percentage) || 18),
            reverse_charge: invoiceForm.reverse_charge,
            client_name: invoiceForm.client_name,
            customer_gstin: invoiceForm.customer_gstin,
            product_name: invoiceForm.sender_product_name || invoiceForm.receiver_product_name || 'Wheat',
            hsn_code: invoiceForm.hsn_code || '100190',
            unit: invoiceForm.unit || 'BOX',
            quantity: Number(invoiceForm.quantity || 1),
            export_under_lut: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? 'true' : 'false',
            lut_document_path: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_document_path : '',
            lut_file_name: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_file_name : '',
            lut_uploaded_at: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_uploaded_at : '',
            lut_uploaded_by: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_uploaded_by : '',
            sender_product_name: invoiceForm.sender_product_name,
            receiver_product_name: invoiceForm.receiver_product_name,
            user_gstin: defaultSender.gstin,
            seller_name: defaultSender.legal_name,
            seller_gstin: defaultSender.gstin,
            seller_address: defaultSender.address,
            seller_location: defaultSender.location,
            seller_pincode: defaultSender.pincode,
            seller_state: defaultSender.state,
            seller_state_code: defaultSender.state_code
        });
    };

    const handleCreateEway = (e) => {
        e.preventDefault();
        const errors = {};
        
        if (!ewayForm.invoice_number.trim()) {
            errors.invoice_number = "Invoice number is required";
        }
        if (!ewayForm.invoice_date) {
            errors.invoice_date = "Invoice date is required";
        }
        if (!ewayForm.transport_mode) {
            errors.transport_mode = "Transport mode is required";
        }
        if (!ewayForm.transporter_name.trim()) {
            errors.transporter_name = "Transporter company name is required";
        }
        const cleanTransporterGstin = (ewayForm.transporter_gstin || '').trim().toUpperCase();
        if (!cleanTransporterGstin) {
            errors.transporter_gstin = "Transporter GSTIN is required";
        } else {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(cleanTransporterGstin)) {
                errors.transporter_gstin = "Invalid Indian GSTIN format (e.g. 27AAAAA1111A1Z1)";
            }
        }
        if (ewayForm.transport_mode === 'Road') {
            if (!ewayForm.vehicle_number.trim()) {
                errors.vehicle_number = "Vehicle number is required for Road transport";
            } else {
                const cleanedVehicle = ewayForm.vehicle_number.replace(/[\s-]/g, '').toUpperCase();
                const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{0,3}[0-9]{4}$/;
                if (!vehicleRegex.test(cleanedVehicle)) {
                    errors.vehicle_number = "Invalid Indian vehicle format (e.g. MH-02-EH-9081)";
                }
            }
        }
        const dist = parseFloat(ewayForm.transport_distance);
        if (isNaN(dist) || dist <= 0) {
            errors.transport_distance = "Distance must be a positive number";
        }
        if (!ewayForm.dispatch_location.trim()) {
            errors.dispatch_location = "Dispatch location is required";
        }
        if (!ewayForm.delivery_location.trim()) {
            errors.delivery_location = "Delivery destination is required";
        }

        if (!ewayForm.is_invoice_selected) {
            if (!ewayForm.goods_product_name.trim()) {
                errors.goods_product_name = "Product Name is required";
            }
            const qty = parseFloat(ewayForm.goods_quantity);
            if (isNaN(qty) || qty <= 0) {
                errors.goods_quantity = "Quantity must be a positive number";
            }
            const taxable = parseFloat(ewayForm.goods_taxable_value);
            if (isNaN(taxable) || taxable < 0) {
                errors.goods_taxable_value = "Taxable value must be a positive number";
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        
        setValidationErrors({});
        
        let payload = {
            invoice_number: ewayForm.invoice_number,
            invoice_date: ewayForm.invoice_date,
            transport_mode: ewayForm.transport_mode,
            transport_company_name: ewayForm.transporter_name,
            transporter_name: ewayForm.transporter_name,
            transporter_id: cleanTransporterGstin,
            transporterGstin: cleanTransporterGstin,
            transporter_gstin: cleanTransporterGstin,
            vehicle_number: ewayForm.transport_mode === 'Road' ? ewayForm.vehicle_number : (ewayForm.vehicle_number || 'UK07AB1234'),
            distance: ewayForm.transport_distance,
            transport_distance: parseInt(ewayForm.transport_distance),
            dispatch_location: ewayForm.dispatch_location || defaultSender.location || 'Dehradun',
            delivery_location: ewayForm.delivery_location,
            delivery_destination: ewayForm.delivery_location,
            client_name: ewayForm.client_name || ewayForm.customer_name || ewayForm.delivery_location || 'General Customer',
            user_gstin: defaultSender.gstin,
            consignor_name: defaultSender.legal_name,
            consignor_gstin: defaultSender.gstin,
            consignor_state: defaultSender.state,
            consignor_state_code: defaultSender.state_code,
            consignor_address: defaultSender.address,
            consignor_pincode: defaultSender.pincode
        };

        if (ewayForm.is_invoice_selected) {
            const taxVal = ewayForm.goods_items.reduce((sum, item) => sum + (parseFloat(item.price || item.rate || 0) * parseFloat(item.quantity || 0)), 0);
            const gstRate = parseFloat(ewayForm.goods_items[0]?.tax_rate || 18);
            const totalVal = ewayForm.goods_items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
            payload = {
                ...payload,
                product_name: ewayForm.goods_items.map(i => i.description || i.product_name).join(', ') || 'Wheat',
                goods_product_name: ewayForm.goods_items.map(i => i.description || i.product_name).join(', ') || 'Wheat',
                hsn_code: Number(ewayForm.goods_items[0]?.hsn_code || ewayForm.goods_items[0]?.hsn) || 1001,
                goods_hsn_code: ewayForm.goods_items.map(i => i.hsn_code || i.hsn).filter(Boolean).join(', '),
                quantity: ewayForm.goods_items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0) || 1,
                goods_quantity: ewayForm.goods_items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0) || 1,
                unit: ewayForm.goods_items[0]?.unit || 'BOX',
                goods_unit: ewayForm.goods_items[0]?.unit || 'BOX',
                taxable_value: taxVal,
                goods_taxable_value: taxVal,
                gst_rate: gstRate,
                goods_gst_rate: gstRate,
                total_value: totalVal,
                goods_total_value: totalVal,
                items: ewayForm.goods_items
            };
        } else {
            const taxable = parseFloat(ewayForm.goods_taxable_value) || 0;
            const rate = parseFloat(ewayForm.goods_gst_rate || 18);
            const total = taxable * (1 + rate / 100);
            payload = {
                ...payload,
                product_name: ewayForm.goods_product_name || 'Wheat',
                goods_product_name: ewayForm.goods_product_name || 'Wheat',
                hsn_code: Number(ewayForm.goods_hsn_code) || 1001,
                goods_hsn_code: ewayForm.goods_hsn_code,
                quantity: parseFloat(ewayForm.goods_quantity) || 1,
                goods_quantity: parseFloat(ewayForm.goods_quantity) || 1,
                unit: ewayForm.goods_unit || 'BOX',
                goods_unit: ewayForm.goods_unit || 'BOX',
                taxable_value: taxable,
                goods_taxable_value: taxable,
                gst_rate: rate,
                goods_gst_rate: rate,
                total_value: total,
                goods_total_value: total,
                items: [{
                    product_name: ewayForm.goods_product_name || 'Wheat',
                    description: ewayForm.goods_product_name || 'Wheat',
                    hsn_code: Number(ewayForm.goods_hsn_code) || 1001,
                    quantity: parseFloat(ewayForm.goods_quantity) || 1,
                    unit: ewayForm.goods_unit || 'BOX',
                    unit_of_product: ewayForm.goods_unit || 'BOX',
                    price: parseFloat(ewayForm.goods_quantity) > 0 ? (taxable / parseFloat(ewayForm.goods_quantity)) : taxable,
                    tax_rate: rate,
                    total: total
                }]
            };
        }

        createEwayMutation.mutate(payload);
    };

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
        setFetchedLoyaltyCustomer(null);
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
        const selectedCustomer = customers?.find(c => c.name === invoice.client_name);
        if (selectedCustomer) {
            setSelectedCustomerObject(selectedCustomer);
        } else {
            setSelectedCustomerObject(null);
        }
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
            redeemed_points: invoice.redeemed_points || 0,
            earned_points: invoice.earned_points || 0,
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

    React.useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchTerm(q);
            if (invoices && invoices.length > 0) {
                const match = invoices.find(inv => 
                    String(inv.invoice_number).toLowerCase() === q.toLowerCase() ||
                    String(inv.id) === q
                );
                if (match) {
                    handleEdit(match);
                }
            }
        }
    }, [searchParams, invoices]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // ── Global Field Validations ──
        const emailErr = validateEmail(formData.client_email, activeConfig.billingType !== 'lite');
        if (emailErr) {
            alert(emailErr);
            return;
        }

        const gstinErr = validateGstin(formData.client_gstin, false);
        if (gstinErr) {
            alert(gstinErr);
            return;
        }
        
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
            sendPurchaseHistoryToCustomer: true,
            sendToCustomerHistory: true,
            status: calculatedStatus,
            due_amount: due,
            items: JSON.stringify(formData.items)
        };

        if (activeConfig.addTime) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            payload.due_date = `${formData.due_date} (${timeStr})`;
        }

        if (activeSelectedCustomer) {
            const currentPts = activeSelectedCustomer.loyalty_points || 0;
            const newPts = currentPts - (formData.redeemed_points || 0) + (formData.earned_points || 0);
            
            // Fire and forget update to CRM, success is handled seamlessly on invalidate query
            crmService.updateCustomer(activeSelectedCustomer.id, {
                ...activeSelectedCustomer,
                loyalty_points: newPts
            }).catch(e => console.error('Failed automatic loyalty update:', e));
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

            createMutation.mutate(payload);
        }
    };

    console.log("Invoices =", invoices);
    console.log("IsArray(invoices) =", Array.isArray(invoices));
    console.log("Customers =", customers);
    console.log("IsArray(customers) =", Array.isArray(customers));
    console.log("Products =", catalogProducts);
    console.log("IsArray(products) =", Array.isArray(catalogProducts));
    console.log("Bank Accounts =", bankAccounts);
    console.log("IsArray(bankAccounts) =", Array.isArray(bankAccounts));

    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    console.log("safeInvoices =", safeInvoices);
    console.log("Array.isArray(safeInvoices) =", Array.isArray(safeInvoices));

    const filteredInvoices = safeInvoices.filter(inv => {
        const matchesSearch = 
            (inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        const matchesDate = !dateFilter || inv.due_date === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalInvoiced = safeInvoices.reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    console.log("safeInvoices for paidInvoiced =", safeInvoices);
    console.log("Array.isArray(safeInvoices) =", Array.isArray(safeInvoices));
    const paidInvoiced = safeInvoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);
    const pendingInvoiced = safeInvoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + parseFloat(inv.total_amount || inv.amount || 0), 0);

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
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {activeMainTab === 'delivery_challan' && (
                        <button 
                            type="button"
                            onClick={() => {
                                resetDispatchForm();
                                setIsDispatchModalOpen(true);
                            }}
                            className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-2 bg-[#155e3a] text-white"
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                padding: '0.65rem 1.1rem', borderRadius: '12px', 
                                background: '#155e3a', color: 'white', border: 'none', 
                                fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(21, 94, 58, 0.25)', transition: 'all 0.2s'
                            }}
                            aria-label="+ Dispatch Shipment"
                        >
                            <Plus size={15} />
                            Dispatch Shipment
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={() => setIsEwayModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1rem', borderRadius: '10px', 
                            background: 'white', color: '#10B981', border: '1px solid #A7F3D0', 
                            fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' 
                        }}
                    >
                        <Truck size={15} /> Generate e-Way Bill
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsInvoiceModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1rem', borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', color: 'white', border: 'none', 
                            fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)', transition: 'all 0.2s' 
                        }}
                    >
                        <Plus size={15} /> Generate e-Invoice
                    </button>
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
                    { label: 'Active Clients', value: new Set((invoices || []).map(i => i.client_name)).size, icon: User, color: '#3B82F6', bg: '#EFF6FF' }
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

            {/* Navigation Tab Bar (Placed ABOVE content box) */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '2px' }}>
                {/* 1. Orders List */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('orders')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'orders' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'orders' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#FFFFFF',
                        color: activeMainTab === 'orders' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'orders' ? '0 4px 12px rgba(217, 119, 6, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <ShoppingCart size={15} />
                    <span>Orders List</span>
                </button>


                {/* 2. Sales Returns (Customers) */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('sales_returns')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'sales_returns' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'sales_returns' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : '#FFFFFF',
                        color: activeMainTab === 'sales_returns' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'sales_returns' ? '0 4px 12px rgba(236, 72, 153, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <RotateCcw size={15} />
                    <span>Sales Returns (Customers)</span>
                </button>


                {/* 4. Warranty & Replacement Claims */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('warranty')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'warranty' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'warranty' ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : '#FFFFFF',
                        color: activeMainTab === 'warranty' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'warranty' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <ShieldCheck size={15} />
                    <span>Warranty & Replacement Claims</span>
                </button>

                {/* 5. Delivery Challan */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('delivery_challan')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'delivery_challan' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'delivery_challan' ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' : '#FFFFFF',
                        color: activeMainTab === 'delivery_challan' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'delivery_challan' ? '0 4px 12px rgba(3, 105, 161, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Truck size={15} />
                    <span>DELIVERY CHALLAN</span>
                </button>

                {/* 6. e-Invoice */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('einvoice')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'einvoice' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'einvoice' ? 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)' : '#FFFFFF',
                        color: activeMainTab === 'einvoice' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'einvoice' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <QrCode size={15} />
                    <span>e-Invoice</span>
                </button>

                {/* 7. e-Way Logistics */}
                <button
                    type="button"
                    onClick={() => setActiveMainTab('eway')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        border: activeMainTab === 'eway' ? 'none' : '1px solid #E2E8F0',
                        background: activeMainTab === 'eway' ? 'linear-gradient(135deg, #10B981 0%, #047857 100%)' : '#FFFFFF',
                        color: activeMainTab === 'eway' ? '#FFFFFF' : '#475569',
                        boxShadow: activeMainTab === 'eway' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Truck size={15} />
                    <span>e-Way Logistics</span>
                </button>
            </div>

            {/* Invoices List / Delivery Section */}
            {activeMainTab === 'delivery_challan' ? (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {/* 2. KPI SUMMARY CARDS (Top of the Delivery Section) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'DELIVERY SUCCESS RATE', value: deliveryStats.successRate, icon: Award, color: '#1B6B3A', bg: '#DCF2E4', borderColor: '#1B6B3A' },
                            { label: 'AVG DELIVERY SPEED', value: deliveryStats.avgSpeed, icon: Clock, color: '#0D9488', bg: '#CCFBF1', borderColor: '#0D9488' },
                            { label: 'FAILED ATTEMPTS', value: String(deliveryStats.failedCount), icon: AlertCircle, color: '#EF4444', bg: '#FEE2E2', borderColor: '#EF4444' },
                            { label: 'ONGOING SHIPMENTS', value: String(deliveryStats.ongoingCount), icon: Activity, color: '#3B82F6', bg: '#DBEAFE', borderColor: '#3B82F6' }
                        ].map((stat, idx) => (
                            <div key={idx} className="stat-card" style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06, color: stat.color, transform: 'rotate(-15deg)' }}>
                                    <stat.icon size={70} />
                                </div>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '0.85rem', position: 'relative', zIndex: 1 }}>
                                    <stat.icon size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', margin: '0 0 0.25rem 0', position: 'relative', zIndex: 1 }}>{stat.value}</h3>
                                <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', position: 'relative', zIndex: 1 }}>{stat.label}</p>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: stat.borderColor, opacity: 0.8 }} />
                            </div>
                        ))}
                    </div>

                    {/* 3. SUB-TAB NAVIGATION BAR */}
                    <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #E2E8F0', paddingBottom: '0.25rem', marginBottom: '1.25rem' }}>
                        <button 
                            type="button"
                            onClick={() => setDeliverySubTab('shipments')}
                            style={{ padding: '0.65rem 1.25rem', background: 'none', border: 'none', color: deliverySubTab === 'shipments' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: deliverySubTab === 'shipments' ? '3px solid #1B6B3A' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.15s' }}
                        >
                            📦 Shipments & Real-Time Status
                        </button>
                        <button 
                            type="button"
                            onClick={() => setDeliverySubTab('challans')}
                            style={{ padding: '0.65rem 1.25rem', background: 'none', border: 'none', color: deliverySubTab === 'challans' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: deliverySubTab === 'challans' ? '3px solid #1B6B3A' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.15s' }}
                        >
                            📄 Delivery Challans
                        </button>
                        <button 
                            type="button"
                            onClick={() => setDeliverySubTab('staff')}
                            style={{ padding: '0.65rem 1.25rem', background: 'none', border: 'none', color: deliverySubTab === 'staff' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: deliverySubTab === 'staff' ? '3px solid #1B6B3A' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.15s' }}
                        >
                            👨💼 Delivery Staff & Driver Performance
                        </button>
                        <button 
                            type="button"
                            onClick={() => setDeliverySubTab('returns')}
                            style={{ padding: '0.65rem 1.25rem', background: 'none', border: 'none', color: deliverySubTab === 'returns' ? '#1B6B3A' : '#64748B', fontWeight: '750', fontSize: '0.9rem', cursor: 'pointer', borderBottom: deliverySubTab === 'returns' ? '3px solid #1B6B3A' : '3px solid transparent', marginBottom: '-2px', transition: 'all 0.15s' }}
                        >
                            🔄 Reverse Logistics (Returns)
                        </button>
                    </div>

                    {/* 4 & 5. SUB-TAB CONTENT: SHIPMENTS */}
                    {deliverySubTab === 'shipments' && (
                        <div>
                            {/* SEARCH & FILTER CONTROLS */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.85rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                    <Search size={18} style={{ color: '#94A3B8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search deliveries by customer name, order number, city, or driver..."
                                        value={deliverySearch}
                                        onChange={e => setDeliverySearch(e.target.value)}
                                        style={{ width: '100%', border: 'none', outline: 'none', fontWeight: '500', fontSize: '0.88rem', color: '#1E293B', background: 'transparent' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748B' }}>Status:</span>
                                    <select 
                                        value={deliveryStatusFilter} 
                                        onChange={e => setDeliveryStatusFilter(e.target.value)}
                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontWeight: '600', outline: 'none', fontSize: '0.82rem', background: 'white', color: '#334155', cursor: 'pointer' }}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Dispatched">Dispatched</option>
                                        <option value="Out For Delivery">Out For Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Failed Attempt">Failed Attempt</option>
                                    </select>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            resetDispatchForm();
                                            setIsDispatchModalOpen(true);
                                        }}
                                        className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-2 bg-[#155e3a] text-white"
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.4rem', 
                                            padding: '0.45rem 0.95rem', borderRadius: '10px', 
                                            background: '#155e3a', color: 'white', border: 'none', 
                                            fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem',
                                            boxShadow: '0 4px 10px rgba(21, 94, 58, 0.2)', transition: 'all 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        aria-label="+ Dispatch Shipment"
                                    >
                                        <Plus size={15} />
                                        Dispatch Shipment
                                    </button>
                                </div>
                            </div>

                            {/* SHIPMENT / CHALLAN DELIVERY CARDS (List Layout) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {filteredDeliveries.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 2rem', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', color: '#64748B' }}>
                                        <Package size={44} style={{ margin: '0 auto 0.75rem', color: '#94A3B8' }} />
                                        <h4 style={{ fontWeight: '800', color: '#1E293B', marginBottom: '0.25rem', fontSize: '1rem' }}>No Deliveries Match Your Search</h4>
                                        <p style={{ fontSize: '0.82rem', margin: 0 }}>Try clearing the search query or status filter.</p>
                                    </div>
                                ) : (
                                    filteredDeliveries.map((dlv) => (
                                        <div 
                                            key={dlv.delivery_id}
                                            className="rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                                            style={{ background: 'white', borderRadius: '1rem', border: '1px solid #F1F5F9', padding: '1.1rem 1.4rem' }}
                                        >
                                            {/* Left Side (Status Icon + Details) */}
                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                <div style={{ 
                                                    width: '48px', 
                                                    height: '48px', 
                                                    borderRadius: '12px', 
                                                    background: dlv.delivery_status === 'Delivered' ? '#DCF2E4' : dlv.delivery_status === 'Failed Attempt' ? '#FEE2E2' : '#EFF6FF',
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    color: dlv.delivery_status === 'Delivered' ? '#1B6B3A' : dlv.delivery_status === 'Failed Attempt' ? '#EF4444' : '#3B82F6',
                                                    flexShrink: 0
                                                }}>
                                                    <Truck size={24} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                                                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>{dlv.customer_name}</h4>
                                                        <span style={{ 
                                                            fontSize: '0.7rem', 
                                                            fontWeight: '800', 
                                                            padding: '0.2rem 0.55rem', 
                                                            borderRadius: '6px',
                                                            background: dlv.delivery_status === 'Delivered' ? '#DCF2E4' : dlv.delivery_status === 'Failed Attempt' ? '#FEE2E2' : '#EFF6FF',
                                                            color: dlv.delivery_status === 'Delivered' ? '#1B6B3A' : dlv.delivery_status === 'Failed Attempt' ? '#EF4444' : '#2563EB'
                                                        }}>
                                                            {dlv.delivery_status}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500', margin: 0 }}>
                                                        Ref: <strong style={{ color: '#334155' }}>{dlv.delivery_number}</strong> • City: <strong style={{ color: '#334155' }}>{dlv.city}</strong> • Courier: <strong style={{ color: '#334155' }}>{dlv.courier_name}</strong>
                                                        {dlv.tracking_number && (
                                                            <> • Tracking: <span style={{ color: '#1B6B3A', fontWeight: '750' }}>{dlv.tracking_number}</span></>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side (Driver Assignment & Action) */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                {dlv.driver_name ? (
                                                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                                                        <span className="text-xs text-slate-400" style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>Assigned Driver</span>
                                                        <span className="text-sm font-semibold text-slate-800" style={{ display: 'block', fontSize: '0.88rem', fontWeight: '700', color: '#1E293B' }}>{dlv.driver_name}</span>
                                                        <span className="text-xs text-slate-500 font-mono" style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>{dlv.vehicle_number}</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                                                        <span className="text-xs text-slate-400" style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8', fontWeight: '600' }}>Assigned Driver</span>
                                                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>Pending Assignment</span>
                                                    </div>
                                                )}

                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedChallanConfirm(dlv);
                                                        setConfirmOtp(dlv.otp_code || '');
                                                    }}
                                                    className="border border-emerald-700 text-emerald-800 hover:bg-emerald-50 rounded-lg px-4 py-2 text-xs font-semibold"
                                                    style={{ 
                                                        border: '1px solid #047857', 
                                                        color: '#065F46', 
                                                        background: '#FFFFFF', 
                                                        borderRadius: '8px', 
                                                        padding: '0.5rem 1rem', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: '700', 
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    Challan & Confirm
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* SUB-TAB: CHALLANS */}
                    {deliverySubTab === 'challans' && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.25rem' }}>📄 Generated Delivery Challans (Product Dispatches)</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>Challan No #</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Customer / Client</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Linked Invoice</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Challan Type</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Challan Date</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billingDeliveries.map((chl) => (
                                        <tr key={chl.delivery_id} style={{ borderBottom: '1px solid #F8FAFC', fontSize: '0.85rem' }}>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0284C7' }}>{chl.challan_number}</td>
                                            <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#0F172A' }}>{chl.customer_name}</td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontFamily: 'monospace' }}>{chl.linked_invoice_id || 'N/A'}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800', background: chl.challan_type === 'GST' ? '#E0F2FE' : '#F1F5F9', color: chl.challan_type === 'GST' ? '#0369A1' : '#475569' }}>
                                                    {chl.challan_type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>{chl.challan_date}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: chl.delivery_status === 'Delivered' ? '#D1FAE5' : chl.delivery_status === 'Failed Attempt' ? '#FEE2E2' : '#FEF3C7', color: chl.delivery_status === 'Delivered' ? '#065F46' : chl.delivery_status === 'Failed Attempt' ? '#991B1B' : '#92400E' }}>
                                                    {chl.delivery_status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                                <button 
                                                    type="button"
                                                    onClick={() => { setSelectedChallanConfirm(chl); setConfirmOtp(chl.otp_code || ''); }} 
                                                    style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* SUB-TAB: STAFF */}
                    {deliverySubTab === 'staff' && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.25rem' }}>👨💼 Delivery Staff Performance & Fleet Assignments</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                {INITIAL_BILLING_STAFF.map((stf) => (
                                    <div key={stf.staff_id} style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '18px', border: '1px solid #E8F5EE' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem', margin: 0 }}>{stf.name}</h4>
                                                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>ID: {stf.staff_id}</span>
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: '800', background: stf.status === 'Available' ? '#DCF2E4' : '#EFF6FF', color: stf.status === 'Available' ? '#1B6B3A' : '#3B82F6', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                                {stf.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                                            <div>Vehicle: <strong style={{ color: '#1E293B', fontFamily: 'monospace' }}>{stf.vehicle}</strong></div>
                                            <div>Mobile: <strong style={{ color: '#1E293B' }}>{stf.mobile}</strong></div>
                                            <div>Avg Delivery Speed: <strong style={{ color: '#1E293B' }}>{stf.avg_time}</strong></div>
                                        </div>
                                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '750' }}>
                                                <span>Delivery Success Rate</span>
                                                <span style={{ color: '#1B6B3A' }}>{stf.delivery_success_rate}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginTop: '0.25rem' }}>
                                                <div style={{ width: `${stf.delivery_success_rate}%`, height: '100%', background: '#1B6B3A' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SUB-TAB: RETURNS */}
                    {deliverySubTab === 'returns' && (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#064E3B', marginBottom: '1.25rem' }}>🔄 Reverse Logistics (Return pick-ups & Failures)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {billingDeliveries.filter(d => d.delivery_status === 'Failed Attempt' || d.failed_delivery_reason).map((dlv) => (
                                    <div key={dlv.delivery_id} style={{ background: '#FFFDFD', border: '1px solid #FEE2E2', padding: '1.25rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                                                <h4 style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.95rem', margin: 0 }}>{dlv.customer_name}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: '#FEE2E2', color: '#EF4444', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                                    {dlv.delivery_status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                                                Ref: <strong>{dlv.delivery_number}</strong> • Destination: <strong>{dlv.city}</strong> • Reason: <span style={{ color: '#DC2626', fontWeight: '600' }}>{dlv.failed_delivery_reason || 'Premises locked'}</span>
                                            </p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => alert(`Rescheduling reverse logistics pickup for ${dlv.customer_name}. Assigned Fleet: ${dlv.driver_name}`)}
                                            style={{ padding: '0.45rem 0.85rem', border: '1px solid #EF4444', background: 'white', color: '#EF4444', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '750', cursor: 'pointer' }}
                                        >
                                            Reschedule Pickup
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : activeMainTab === 'einvoice' ? (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Government Registered e-Invoices</h3>
                            <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '500', margin: '0.2rem 0 0 0' }}>IRN Authenticated GST compliant invoices</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsInvoiceModalOpen(true)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                padding: '0.55rem 1rem', borderRadius: '10px', 
                                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', color: 'white', border: 'none', 
                                fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' 
                            }}
                        >
                            <Plus size={14} /> Generate e-Invoice
                        </button>
                    </div>

                    {gstInvoicesList.length === 0 ? (
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '3rem 2rem', textAlign: 'center', color: '#64748B' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', margin: '0 auto 1rem auto' }}>
                                <QrCode size={24} />
                            </div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.4rem 0' }}>No e-Invoices Generated Yet</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>Authenticate and register your first GST invoice with Government IRN portal.</p>
                            <button 
                                type="button"
                                onClick={() => setIsInvoiceModalOpen(true)}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#4338CA', color: 'white', border: 'none', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                + Generate e-Invoice
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {gstInvoicesList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(inv => (
                                <div key={inv.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                                                <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: '800', fontSize: '0.75rem' }}>e-Invoice IRN Active</span>
                                                {inv.export_under_lut === 'true' && (
                                                    <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#ECFDF5', color: '#047857', fontWeight: '800', fontSize: '0.75rem' }}>Export Under LUT: YES (GST 0%)</span>
                                                )}
                                            </div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', marginTop: '0.4rem', margin: 0 }}>Invoice Ref: {inv.invoice_number}</h3>
                                        </div>
                                        <div 
                                            onClick={() => setSelectedQrInvoice(inv)}
                                            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', cursor: 'pointer' }}
                                            title="View QR Code & Invoice Details"
                                        >
                                            <QrCode size={18} />
                                        </div>
                                    </div>

                                    {inv.export_under_lut === 'true' && inv.lut_file_name && (
                                        <div style={{ marginBottom: '1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F0FDF4', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #DCFCE7', color: '#15803D' }}>
                                            <span>📎</span>
                                            <span style={{ fontWeight: '700' }}>LUT Document Attached:</span>
                                            <a href={inv.lut_document_path} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#166534', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                                {inv.lut_file_name}
                                            </a>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500 font-mono truncate" style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#64748B', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', margin: 0 }}>
                                        <span className="font-semibold text-gray-700" style={{ fontWeight: '700', color: '#334155' }}>IRN: </span>
                                        {inv.irn || inv.govt_irn || inv.irn_hash || inv.irnNo || inv.ack_irn || inv.irn_number || "Pending / Not Generated"}
                                    </div>

                                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Govt Tax Invoice Value:</span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: '950', color: '#1D4ED8' }}>{formatCurrency(inv.taxable_value + inv.total_tax)}</span>
                                        </div>
                                        {confirmingGstDeleteId === inv.id ? (
                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); deleteGstInvoiceMutation.mutate(inv.id); setConfirmingGstDeleteId(null); }} 
                                                    style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}
                                                >
                                                    Delete?
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingGstDeleteId(null); }} 
                                                    style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setConfirmingGstDeleteId(inv.id); }}
                                                style={{ border: 'none', background: '#FEF2F2', color: '#EF4444', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeMainTab === 'eway' ? (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Government e-Way Bills Transport tracking</h3>
                            <button type="button" onClick={() => setIsEwayModalOpen(true)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: '#1D4ED8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>+ Dispatch New Bill</button>
                        </div>
                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#F8FAFC' }}>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>e-Way Bill No</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Carrier Name</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Vehicle Registration No</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Distance (Kms)</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Source - Destination</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                        <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ewaysList.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                                                No e-Way bills generated yet. Click "+ Dispatch New Bill" to generate one.
                                            </td>
                                        </tr>
                                    ) : (
                                        ewaysList.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((ew) => (
                                            <tr key={ew.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td className="font-mono font-semibold" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#0F172A' }}>
                                                    {ew.ewayBillNo || ew.eway_bill_no || ew.eway_bill_number || "—"}
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem' }}>
                                                    {ew.carrierName || ew.transporter_name || ew.carrier_name || "—"}
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                                                    {ew.vehicleNo || ew.vehicle_number || ew.vehicle_reg_no || "—"}
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem', fontWeight: '800', fontSize: '0.85rem', color: '#1D4ED8' }}>
                                                    {ew.distance ? (String(ew.distance).includes("Kms") ? ew.distance : `${ew.distance} Kms`) : (ew.transport_distance ? `${ew.transport_distance} Kms` : "—")}
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                                                    {ew.sourceDestination || (ew.dispatch_location || ew.delivery_location ? `${ew.dispatch_location || ew.from_place || ""} → ${ew.delivery_destination || ew.delivery_location || ew.to_place || ""}` : "—") || "—"}
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem' }}>
                                                    <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>
                                                        {(ew.status || 'GENERATED').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        {(ew.url || ew.print_url || ew.pdf_url) && (
                                                            <a 
                                                                href={getSafePdfUrl(ew.url || ew.print_url || ew.pdf_url)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                title="View Official Government PDF"
                                                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition inline-flex items-center"
                                                                style={{ 
                                                                    display: 'inline-flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center', 
                                                                    width: '28px', 
                                                                    height: '28px', 
                                                                    borderRadius: '8px', 
                                                                    background: '#EFF6FF', 
                                                                    color: '#1D4ED8', 
                                                                    border: '1px solid #BFDBFE',
                                                                    textDecoration: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <Eye size={16} />
                                                            </a>
                                                        )}
                                                        {confirmingGstDeleteId === ew.id ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); deleteGstInvoiceMutation.mutate(ew.id); setConfirmingGstDeleteId(null); }} 
                                                                    style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '800' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setConfirmingGstDeleteId(null); }} 
                                                                    style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                                                                >
                                                                    No
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setConfirmingGstDeleteId(ew.id); }}
                                                                style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                                                                title="Delete Record"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {/* Search & Filter Bar */}
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', gap: '0.75rem' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '260px', flexShrink: 0 }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Search client or invoice #..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem' }}
                        />
                    </div>

                    {/* Right Side: Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                        {activeMainTab === 'warranty' && (
                            <button 
                                onClick={() => { setReturnFormType('warranty'); setIsReturnModalOpen(true); }} 
                                style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                            >
                                + Log Warranty Claim
                            </button>
                        )}
                        <input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', color: '#64748B' }}
                        />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: '0.45rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.82rem', color: '#64748B' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Draft">Draft</option>
                        </select>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Filter size={15} />
                        </button>
                        {activeMainTab === 'sales_returns' && (
                            <button 
                                onClick={() => { setReturnFormType('sales'); setIsReturnModalOpen(true); }} 
                                style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                + Create Sales Return
                            </button>
                        )}

                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
                    {isLoading || isReturnsLoading ? (
                        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" size={32} color="#BE185D" /></div>
                    ) : activeMainTab === 'orders' ? (
                        <table className="table-fixed" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'invoice_number', label: 'Invoice', placeholder: 'e.g. INV-001', style: { width: '15%' } },
        { key: 'client_name', label: 'Client', placeholder: 'Name', style: { width: '20%' } },
        { key: 'due_date', label: 'Due Date', placeholder: 'e.g. 2026-05', style: { width: '15%' } },
        { key: 'total_amount', label: 'Amount', placeholder: 'e.g. 5000', style: { width: '15%' } },
        { key: 'status', label: 'Status', placeholder: 'e.g. Paid', align: 'left', style: { width: '18%' } },
        { key: '_actions', label: 'Actions', noFilter: true, align: 'right', style: { width: '17%' } }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {(() => {
                                    const safeFiltered = Array.isArray(filteredInvoices) ? filteredInvoices : [];
                                    return safeFiltered.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s' }}>
                                        <td style={{ width: '15%', padding: '0.75rem 1.25rem', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BE185D', flexShrink: 0 }}>
                                                    <FileText size={16} />
                                                </div>
                                                <span style={{ fontWeight: '750', color: '#0F172A', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ width: '20%', padding: '0.75rem 1.25rem', overflow: 'hidden' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.85rem', marginBottom: '0.1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.client_name}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.client_email}</span>
                                            </div>
                                        </td>
                                        <td style={{ width: '15%', padding: '0.75rem 1.25rem', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748B', fontWeight: '600', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                <Calendar size={12} />
                                                <span>{inv.due_date || '—'}</span>
                                            </div>
                                        </td>
                                        <td style={{ width: '15%', padding: '0.75rem 1.25rem', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '850', color: '#0F172A', whiteSpace: 'nowrap' }}>{formatCurrency(inv.amount || inv.total_amount)}</span>
                                        </td>
                                        <td style={{ width: '18%', padding: '0.75rem 1.25rem', textAlign: 'left', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start', minWidth: 0 }}>
                                                <div style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', 
                                                    padding: '0.25rem 0.5rem', borderRadius: '6px',
                                                    background: inv.status === 'Paid' ? '#D1FAE5' : (inv.status === 'Unpaid' ? '#FEE2E2' : '#FEF3C7'),
                                                    color: inv.status === 'Paid' ? '#065F46' : (inv.status === 'Unpaid' ? '#991B1B' : '#92400E'),
                                                    fontSize: '0.75rem', fontWeight: '800', whiteSpace: 'nowrap'
                                                }}>
                                                    {inv.status === 'Paid' ? <CheckCircle2 size={10} /> : (inv.status === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />)}
                                                    {inv.status ? inv.status.toUpperCase() : 'ACTIVE'}
                                                </div>

                                                {/* E-Invoice IRN Status Pill or Generate Button */}
                                                {(inv.Irn || inv.AckNo || inv.ack_no || inv.status === 'IRN Active') ? (
                                                    <div 
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            padding: '3px 8px',
                                                            borderRadius: '999px',
                                                            background: '#ECFDF5',
                                                            border: '1.5px solid #10B981',
                                                            color: '#065F46',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '850',
                                                            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const irnHash = inv.Irn || 'Verified';
                                                            navigator.clipboard.writeText(irnHash);
                                                            alert(`✅ IRN Active\n\nIRN Hash: ${irnHash}\nAck No: ${inv.AckNo || inv.ack_no || 'N/A'}\nAck Date: ${inv.AckDt || inv.ack_dt || 'N/A'}\n\n(Copied IRN to clipboard)`);
                                                        }}
                                                        title={`Click to copy IRN: ${inv.Irn || ''}\nAck No: ${inv.AckNo || inv.ack_no || ''}`}
                                                    >
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                                        <span>IRN Active</span>
                                                        {(inv.AckNo || inv.ack_no) && (
                                                            <span style={{ opacity: 0.85, fontWeight: '700', fontSize: '0.65rem' }}>
                                                                #{String(inv.AckNo || inv.ack_no).slice(-4)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleGenerateIRN(inv); }}
                                                        disabled={generatingIrnId === (inv.id || inv.invoice_number)}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #10B981',
                                                            background: '#F0FDF4',
                                                            color: '#047857',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        title="Generate GST e-Invoice IRN with Masters India"
                                                    >
                                                        {generatingIrnId === (inv.id || inv.invoice_number) ? (
                                                            <><Loader2 size={10} className="animate-spin" /> Generating...</>
                                                        ) : (
                                                            <><Zap size={10} color="#059669" /> Generate E-Invoice</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ width: '17%', padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', alignItems: 'center' }}>
                                                {(() => {
                                                    const currentBiz = (businessProfile?.data?.business_name || businessProfile?.business_name || '').toLowerCase();
                                                    const clientName = (inv.client_name || '').toLowerCase();
                                                    const isBuyer = Boolean(currentBiz && clientName && currentBiz === clientName);
                                                    const isSupplier = !isBuyer;

                                                    return isSupplier && (inv.notes?.includes('Source: Purchase Invoice') || inv.invoice_type === 'B2B' || inv.invoice_number?.includes('PO')) && (
                                                        <button 
                                                            onClick={() => handleOpenSupplierView(inv)} 
                                                            title="Supplier View (Confirm Order)" 
                                                            style={{ 
                                                                padding: '0.25rem 0.6rem', borderRadius: '6px', 
                                                                border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', 
                                                                fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', 
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem' 
                                                            }}
                                                        >
                                                            <Globe size={12} /> Supplier View
                                                        </button>
                                                    );
                                                })()}
                                                <button onClick={() => handleViewHistory(inv)} title="Invoice Audit Trail" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><History size={14} /></button>
                                                <button onClick={() => handleSendReminder(inv)} title="WhatsApp Reminder" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Share2 size={14} /></button>
                                                <button onClick={() => handlePrint(inv)} title="Print Invoice" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#BE185D', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Printer size={14} /></button>
                                                <button onClick={() => handleEdit(inv)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #FEE2E2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    ) : activeMainTab === 'sales_returns' ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Return Ref #</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Customer / Client</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Original Invoice</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Return Date</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Amount</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesReturnsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <RotateCcw size={32} opacity={0.4} />
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#475569' }}>No Customer Sales Returns Found</p>
                                                <span style={{ fontSize: '0.8rem' }}>Log sales returns and customer refund requests directly from invoices.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    salesReturnsList.map((ret) => (
                                        <tr key={ret.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '0.75rem 1.25rem', fontWeight: '800', color: '#BE185D' }}>{ret.return_number || `RET-${ret.id}`}</td>
                                            <td style={{ padding: '0.75rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>{ret.client_name || ret.customer_name || 'Customer'}</td>
                                            <td style={{ padding: '0.75rem 1.25rem', color: '#64748B', fontFamily: 'monospace' }}>{ret.invoice_number || 'POS / Direct'}</td>
                                            <td style={{ padding: '0.75rem 1.25rem', color: '#64748B', fontSize: '0.8rem' }}>{ret.created_at ? new Date(ret.created_at).toLocaleDateString() : 'Today'}</td>
                                            <td style={{ padding: '0.75rem 1.25rem', fontWeight: '850', color: '#0F172A' }}>{formatCurrency(ret.total_amount || ret.amount || 0)}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: ret.status === 'Approved' ? '#D1FAE5' : '#FEF3C7', color: ret.status === 'Approved' ? '#065F46' : '#92400E' }}>
                                                        {(ret.status || 'Processed').toUpperCase()}
                                                    </span>
                                                    {!isStarterPlan && (ret.warehouse_id || ret.warehouse_name ? (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#047857', fontWeight: '750', background: '#ECFDF5', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                                                            <Warehouse size={11} />
                                                            <span>Assigned: {ret.warehouse_name || ret.warehouse_id}</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setMoveWarehouseModalReturn(ret);
                                                                setSelectedWarehouseForMove('');
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                padding: 0,
                                                                color: '#2563EB',
                                                                fontSize: '0.72rem',
                                                                fontWeight: '800',
                                                                cursor: 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                textDecoration: 'underline'
                                                            }}
                                                        >
                                                            <Warehouse size={11} /> Move to Warehouse
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                                <button onClick={() => alert(`Sales Return #${ret.return_number || ret.id}\nClient: ${ret.client_name || 'Customer'}\nAmount: ₹${ret.total_amount || 0}`)} style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>View Details</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Claim Ref #</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Product / Item</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Customer / Supplier</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Serial / IMEI</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Claim Type</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Status</th>
                                    <th style={{ padding: '0.75rem 1.25rem' }}>Period</th>
                                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warrantyClaimsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <ShieldCheck size={32} opacity={0.4} />
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#475569' }}>No Warranty & Replacement Claims Found</p>
                                                <span style={{ fontSize: '0.8rem' }}>Log product replacement claims, repairs, and vendor warranty tickets.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    warrantyClaimsList.map((claim) => {
                                        const claimRef = claim.claim_number || claim.return_number || claim.invoice_number || claim.invoice_id || `CLM-${claim.id}`;
                                        const isRet = String(claimRef).trim().toUpperCase().startsWith('RET-');
                                        const isDone = String(claim.status).toLowerCase() === 'done' || String(claim.status).toLowerCase() === 'completed';
                                        const isPending = String(claim.status).toLowerCase() === 'pending';

                                        let badgeBg = '#D1FAE5';
                                        let badgeColor = '#047857';
                                        let statusText = (claim.status || 'Active').toUpperCase();

                                        if (isPending) {
                                            badgeBg = '#FEF3C7';
                                            badgeColor = '#92400E';
                                            statusText = 'PENDING';
                                        } else if (isDone) {
                                            badgeBg = '#D1FAE5';
                                            badgeColor = '#047857';
                                            statusText = 'DONE';
                                        }

                                        return (
                                            <tr key={claim.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                <td style={{ padding: '0.75rem 1.25rem', fontWeight: '800', color: isRet ? '#BE185D' : '#059669' }}>{claimRef}</td>
                                                <td style={{ padding: '0.75rem 1.25rem', fontWeight: '700', color: '#0F172A' }}>{claim.product_name || claim.item_name || 'Product'}</td>
                                                <td style={{ padding: '0.75rem 1.25rem', color: '#64748B' }}>{claim.client_name || claim.customer_name || claim.supplier_name || 'Customer'}</td>
                                                <td style={{ padding: '0.75rem 1.25rem', color: '#64748B', fontFamily: 'monospace', fontSize: '0.8rem' }}>{claim.serial_number || claim.imei || 'N/A'}</td>
                                                <td style={{ padding: '0.75rem 1.25rem', fontWeight: '700', color: '#475569' }}>{claim.claim_type || 'Warranty Tracking'}</td>
                                                <td style={{ padding: '0.75rem 1.25rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: badgeBg, color: badgeColor }}>
                                                            {statusText}
                                                        </span>
                                                        {(claim.warehouse_name || claim.warehouse_id) && (
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: '#047857', fontWeight: '750', background: '#ECFDF5', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                                                                <Warehouse size={11} />
                                                                <span>Assigned: {claim.warehouse_name || claim.warehouse_id}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem', fontWeight: '700', color: '#475569', fontSize: '0.82rem' }}>
                                                    {claim.warranty_period || claim.period || (claim.reason_code && claim.reason_code.includes('Warranty Period:') ? claim.reason_code.split('Warranty Period:')[1].split('(')[0].trim() : '3 Years')}
                                                </td>
                                                <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                                    {isRet ? (
                                                        <button 
                                                            onClick={() => {
                                                                setMoveWarehouseModalReturn(claim);
                                                                setSelectedWarehouseForMove('');
                                                            }} 
                                                            style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                                        >
                                                            Manage Claim
                                                        </button>
                                                    ) : (String(claimRef).trim().toUpperCase().startsWith('CLM-') || !isRet) ? (
                                                        <button 
                                                            onClick={() => setSelectedClmDetail(claim)} 
                                                            style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                                                        >
                                                            View Detail
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            )}

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
                                        {(() => {
                                            const safeCust = Array.isArray(customers) ? customers : [];
                                            return safeCust.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(c => (
                                            <option key={c.id} value={c.name}>{c.company || 'Personal'}</option>
                                        ));
                                        })()}
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
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Shipping Address</label>
                                    <textarea value={formData.shipping_address} onChange={(e) => setFormData({...formData, shipping_address: e.target.value})} style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', minHeight: '60px', fontSize: '0.85rem' }} />
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
                                                    {(() => {
                                                        const safeProds = Array.isArray(catalogProducts) ? catalogProducts : [];
                                                        return safeProds.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(prod => (
                                                        <option key={`prod-${prod.id}`} value={prod.name || prod.product_name}>
                                                            📦 Catalog: {prod.sku || 'N/A'} - Stock: {prod.quantity || 0} 
                                                            {activeConfig.displayPurchase && ` - Purchase Price: ${formatCurrency(prod.purchase_price || 0)}`}
                                                            {activeConfig.showLast5Sale && ` - Last Sale: ${formatCurrency(prod.price || prod.sale_price || 0)}`}
                                                            {activeConfig.showLast5Purchase && ` - Last Purchase: ${formatCurrency(prod.purchase_price || 0)}`}
                                                        </option>
                                                    ));
                                                    })()}
                                                    {(() => {
                                                        const safeInv = Array.isArray(inventoryItems) ? inventoryItems : [];
                                                        return safeInv.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(inv => (
                                                        <option key={`inv-${inv.id}`} value={inv.name}>📋 Legacy Inv: {inv.sku || 'N/A'} - Stock: {inv.quantity || 0}</option>
                                                    ));
                                                    })()}
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
                                                <input 
                                                    required 
                                                    type="number" 
                                                    min="0"
                                                    value={item.quantity} 
                                                    onChange={(e) => { const raw = e.target.value.slice(0, 14); handleItemChange(idx, 'quantity', Math.max(0, parseFloat(raw) || 0)); }} 
                                                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} 
                                                />
                                            </div>
                                            {activeConfig.freeQty === true && (
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: '800', color: '#94A3B8', marginBottom: '0.25rem' }}>FREE</label>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        placeholder="0" 
                                                        value={item.free_quantity || ''} 
                                                        onChange={(e) => { const raw = e.target.value.slice(0, 14); handleItemChange(idx, 'free_quantity', Math.max(0, parseFloat(raw) || 0)); }} 
                                                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                        style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} 
                                                    />
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
                                                <input 
                                                    required 
                                                    type="number" 
                                                    min="0"
                                                    step="any"
                                                    value={item.price} 
                                                    onKeyDown={(e) => {
                                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onPaste={(e) => {
                                                        const pasted = e.clipboardData.getData('text');
                                                        if (pasted.includes('-') || parseFloat(pasted) < 0) {
                                                            e.preventDefault();
                                                            const sanitized = Math.max(0, parseFloat(pasted) || 0);
                                                            handleItemChange(idx, 'price', sanitized);
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.slice(0, 14);
                                                        const parsed = parseFloat(raw);
                                                        const sanitized = isNaN(parsed) ? '' : Math.max(0, parsed);
                                                        handleItemChange(idx, 'price', sanitized);
                                                    }} 
                                                    style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }} 
                                                />
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

                                    {formData.payment_mode === 'Bank' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Select Bank Account</label>
                                            <select 
                                                required
                                                value={formData.bank_account_id}
                                                onChange={(e) => setFormData({...formData, bank_account_id: e.target.value})}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', fontSize: '0.8rem' }}
                                            >
                                                <option value="">-- Select Bank Account --</option>
                                                {(() => {
                                                     const safeBanks = Array.isArray(bankAccounts) ? bankAccounts : [];
                                                     return safeBanks.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(acc => (
                                                     <option key={acc.id} value={acc.id}>{acc.bank_name} - {formatCurrency(acc.current_balance)}</option>
                                                 ));
                                                 })()}
                                            </select>
                                        </div>
                                    )}

                                    {formData.payment_mode === 'UPI' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>UPI ID</label>
                                            <input 
                                                type="text"
                                                value={formData.upi_id || ''}
                                                onChange={(e) => setFormData({...formData, upi_id: e.target.value})}
                                                placeholder="Enter your UPI ID"
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #DBEAFE', background: 'white', fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#1E3A8A', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Paid Amount ({currency.symbol})</label>
                                            <input 
                                                type="number" 
                                                value={formData.paid_amount || 0} 
                                                onChange={(e) => {
                                                    const raw = e.target.value.slice(0, 14);
                                                    const paid = parseFloat(raw) || 0;
                                                    setFormData({
                                                        ...formData,
                                                        paid_amount: paid,
                                                        due_amount: (parseFloat(formData.total_amount) || 0) - paid
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
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.1rem 0' }}>
                                                ⭐ Available Points: {activeSelectedCustomer ? (activeSelectedCustomer.loyalty_points || 0) : 0}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    disabled={!activeSelectedCustomer || (activeSelectedCustomer.loyalty_points || 0) === 0}
                                                    placeholder="Redeem Points"
                                                    value={formData.redeemed_points || ''}
                                                    onChange={(e) => {
                                                        const rawVal = e.target.value;
                                                        let val = parseInt(rawVal, 10);
                                                        if (isNaN(val) || rawVal === '') {
                                                            val = 0;
                                                        }
                                                        const maxAvail = activeSelectedCustomer ? (activeSelectedCustomer.loyalty_points || 0) : 0;
                                                        if (val > maxAvail) val = maxAvail;
                                                        if (val < 0) val = 0;
                                                        
                                                        const tmp = { ...formData, redeemed_points: val };
                                                        const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                        setFormData({ ...tmp, ...newTotals });
                                                    }}
                                                    style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #BBF7D0', background: 'white', fontSize: '0.8rem', outline: 'none' }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        if (!activeSelectedCustomer) return;
                                                        const maxAvail = activeSelectedCustomer.loyalty_points || 0;
                                                        const tmp = { ...formData, redeemed_points: maxAvail };
                                                        const newTotals = calculateTotals(formData.items, formData.tax_type, tmp);
                                                        setFormData({ ...tmp, ...newTotals });
                                                    }}
                                                    disabled={!activeSelectedCustomer || (activeSelectedCustomer.loyalty_points || 0) === 0}
                                                    style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#16A34A', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', opacity: (!activeSelectedCustomer || (activeSelectedCustomer.loyalty_points || 0) === 0) ? 0.5 : 1 }}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem', gap: '0.5rem' }}>
                                        <span>Subtotal:</span>
                                        <span style={{ maxWidth: '65%', overflowWrap: 'break-word', wordBreak: 'break-all', textAlign: 'right' }}>{formatCurrency(formData.amount)}</span>
                                    </div>
                                    {activeConfig.countItems === true && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                            <span>Items Count:</span>
                                            <span>{formData.items.length} items ({formData.items.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)} Qty)</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem', gap: '0.5rem' }}>
                                        <span>Total Discount:</span>
                                        <span style={{ color: '#EF4444', maxWidth: '65%', overflowWrap: 'break-word', wordBreak: 'break-all', textAlign: 'right' }}>- {formatCurrency(formData.discount_amount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem', gap: '0.5rem' }}>
                                        <span>GST Amount:</span>
                                        <span style={{ maxWidth: '65%', overflowWrap: 'break-word', wordBreak: 'break-all', textAlign: 'right' }}>{formatCurrency(formData.tax_amount)}</span>
                                    </div>
                                    {formData.redeemed_points > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: '700', fontSize: '0.8rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Tag size={10} /> Loyalty Discount:</span>
                                            <span>- {formatCurrency(formData.redeemed_points)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontWeight: '600', fontSize: '0.8rem' }}>
                                        <span>Round Off:</span>
                                        <span>{currency.symbol} {(parseFloat(formData.round_off) || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E3A8A', fontWeight: '900', fontSize: String(formData.total_amount || '').length > 10 ? '0.95rem' : '1.25rem', marginTop: '0.3rem', borderTop: '1px dashed #DBEAFE', paddingTop: '0.4rem', gap: '0.5rem', alignItems: 'center' }}>
                                        <span>Total:</span>
                                        <span style={{ maxWidth: '65%', overflowWrap: 'break-word', wordBreak: 'break-all', textAlign: 'right' }}>{formatCurrency(formData.total_amount)}</span>
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
                            {(viewingInvoice.notes?.includes('Source: Purchase Invoice') || viewingInvoice.invoice_type === 'B2B' || viewingInvoice.source_note) && (
                                <div style={{ padding: '0.4rem 0.8rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldCheck size={16} color="#16A34A" />
                                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#166534' }}>
                                        {viewingInvoice.notes || viewingInvoice.source_note || `Source: Purchase Invoice from ${viewingInvoice.client_name}`}
                                    </span>
                                </div>
                            )}
                            <div className="billing-preview-modal-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                {/* E-Invoice IRN Status Pill or Action Button */}
                                {(viewingInvoice.Irn || viewingInvoice.AckNo || viewingInvoice.ack_no || viewingInvoice.status === 'IRN Active') ? (
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '10px',
                                        background: '#ECFDF5',
                                        border: '1.5px solid #10B981',
                                        color: '#065F46',
                                        fontSize: '0.8rem',
                                        fontWeight: '850',
                                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                                        <span>IRN Active</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#047857' }}>
                                            Ack: {viewingInvoice.AckNo || viewingInvoice.ack_no || 'Verified'}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const irnVal = viewingInvoice.Irn || viewingInvoice.irn || '';
                                                navigator.clipboard.writeText(irnVal);
                                                alert('IRN Hash copied to clipboard:\n' + irnVal);
                                            }}
                                            title={`Click to copy IRN Hash: ${viewingInvoice.Irn || ''}`}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#047857' }}
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={() => handleGenerateIRN(viewingInvoice)}
                                        disabled={generatingIrnId === (viewingInvoice.id || viewingInvoice.invoice_number)}
                                        style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                            padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', 
                                            fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem',
                                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                        }}
                                        title="Generate GST e-Invoice IRN with Masters India"
                                    >
                                        {generatingIrnId === (viewingInvoice.id || viewingInvoice.invoice_number) ? (
                                            <><Loader2 size={16} className="animate-spin" /> Generating IRN...</>
                                        ) : (
                                            <><Zap size={16} /> Generate E-Invoice</>
                                        )}
                                    </button>
                                )}
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
            {/* ORDER REPORTS SUMMARY MODAL */}
            {isOrderReportsModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '520px', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                                    <FileSpreadsheet size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>Order Reports 📊</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Sales & Orders summary overview</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOrderReportsModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Total Invoices</span>
                                <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#0F172A' }}>{invoices.length}</p>
                            </div>
                            <div style={{ background: '#ECFDF5', padding: '0.85rem', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Total Revenue</span>
                                <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#047857' }}>{formatCurrency(totalInvoiced)}</p>
                            </div>
                            <div style={{ background: '#FDF2F8', padding: '0.85rem', borderRadius: '12px', border: '1px solid #FBCFE8' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#BE185D', textTransform: 'uppercase' }}>Customer Returns</span>
                                <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#BE185D' }}>{salesReturnsList.length}</p>
                            </div>
                            <div style={{ background: '#EFF6FF', padding: '0.85rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1D4ED8', textTransform: 'uppercase' }}>Supplier Returns</span>
                                <p style={{ margin: '4px 0 0', fontSize: '1.2rem', fontWeight: '900', color: '#1D4ED8' }}>{purchaseReturnsList.length}</p>
                            </div>
                        </div>
                        <button onClick={() => window.print()} style={{ width: '100%', padding: '0.75rem', background: '#0F172A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Printer size={16} /> Print Full Analytics Report
                        </button>
                    </div>
                </div>
            )}

            {/* CREATE RETURN / LOG CLAIM MODAL */}
            {isReturnModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '20px', padding: '1.75rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: returnFormType === 'sales' ? '#FCE7F3' : (returnFormType === 'purchase' ? '#DBEAFE' : '#D1FAE5'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: returnFormType === 'sales' ? '#BE185D' : (returnFormType === 'purchase' ? '#1E40AF' : '#047857') }}>
                                    {returnFormType === 'sales' ? <RotateCcw size={18} /> : (returnFormType === 'purchase' ? <Truck size={18} /> : <ShieldCheck size={18} />)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', color: '#0F172A' }}>
                                        {returnFormType === 'sales' ? 'Create Sales Return' : (returnFormType === 'purchase' ? 'Create Purchase Return' : 'Log Warranty Claim')}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Enter return or claim transaction details</p>
                                </div>
                            </div>
                            <button onClick={() => setIsReturnModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const customerName = (newReturnData.client_name || '').trim();
                            let itemsToReturn = (selectedReturnItems || []).filter(it => it.selected).map(it => ({
                                product_id: it.product_id,
                                product_name: it.product_name || it.name,
                                return_quantity: parseFloat(it.return_quantity) || 1,
                                quantity: parseFloat(it.return_quantity) || 1,
                                price: parseFloat(it.price) || 0,
                                unit: it.unit,
                                total: (parseFloat(it.price) || 0) * (parseFloat(it.return_quantity) || 1)
                            }));

                            if (itemsToReturn.length === 0 && newReturnData.product_name) {
                                itemsToReturn = [{
                                    product_name: newReturnData.product_name,
                                    return_quantity: 1,
                                    price: 0
                                }];
                            }

                            if (customerName && returnFormType !== 'purchase') {
                                for (const item of itemsToReturn) {
                                    const prodName = (item.product_name || newReturnData.product_name || '').trim();
                                    if (!prodName) continue;

                                    const alreadyReturned = (allReturns || []).find(r => {
                                        const rCust = (r.client_name || r.customer_name || '').trim();
                                        const rStatus = String(r.status || '').trim().toLowerCase();
                                        const isDone = rStatus === 'done' || rStatus === 'completed';

                                        if (!isDone) return false;
                                        if (rCust.toLowerCase() !== customerName.toLowerCase()) return false;

                                        const rProd = (r.product_name || r.item_name || '').trim();
                                        if (rProd.toLowerCase() === prodName.toLowerCase()) return true;

                                        if (Array.isArray(r.items)) {
                                            return r.items.some(it => String(it.product_name || it.name || '').trim().toLowerCase() === prodName.toLowerCase());
                                        }

                                        return false;
                                    });

                                    if (alreadyReturned) {
                                        alert(`This product has already been returned by ${customerName}.\n\nCustomer: ${customerName}\nProduct: ${prodName}\nStatus: Already Returned`);
                                        return;
                                    }
                                }
                            }

                            createReturnMutation.mutate({
                                ...newReturnData,
                                return_type: returnFormType,
                                return_date: new Date().toISOString(),
                                customer_name: newReturnData.client_name || 'Customer',
                                supplier_name: newReturnData.client_name || 'Supplier',
                                refund_amount: parseFloat(newReturnData.total_amount) || 0,
                                amount: parseFloat(newReturnData.total_amount) || 0,
                                total_amount: parseFloat(newReturnData.total_amount) || 0,
                                items: itemsToReturn
                            });
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    {returnFormType === 'purchase' ? 'Supplier Name *' : 'Customer Name *'}
                                </label>
                                <select 
                                    required 
                                    value={newReturnData.client_name} 
                                    onChange={(e) => {
                                        const chosenName = e.target.value;
                                        setSelectedReturnItems([]);
                                        setNewReturnData(prev => ({ 
                                            ...prev, 
                                            client_name: chosenName,
                                            invoice_number: '' 
                                        }));
                                    }} 
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'white', cursor: 'pointer' }}
                                >
                                    <option value="">{returnFormType === 'purchase' ? '-- Select Supplier --' : '-- Select Customer --'}</option>
                                    {returnFormType === 'purchase' ? (
                                        suppliersList.map((sup, idx) => {
                                            const name = sup.name || sup.supplier_name;
                                            if (!name) return null;
                                            return (
                                                <option key={idx} value={name}>
                                                    {name} {sup.phone ? `(${sup.phone})` : ''}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        customers.map((cust, idx) => {
                                            const name = cust.name || cust.customer_name || cust.client_name;
                                            if (!name) return null;
                                            return (
                                                <option key={idx} value={name}>
                                                    {name} {cust.phone ? `(${cust.phone})` : ''}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>
                            </div>
                            {returnFormType === 'warranty' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                                        Select Covered Product *
                                    </label>
                                    <select
                                        required
                                        value={newReturnData.product_name || ''}
                                        onChange={(e) => {
                                            const pName = e.target.value;
                                            const matchedProd = warrantyEligibleProducts.find(p => p.name === pName);
                                            setNewReturnData(prev => ({
                                                ...prev,
                                                product_name: pName,
                                                warranty_period: matchedProd?.warranty_period || ''
                                            }));
                                            if (matchedProd) {
                                                setSelectedReturnItems([{
                                                    id: matchedProd.id,
                                                    product_id: matchedProd.id,
                                                    product_name: matchedProd.name,
                                                    return_quantity: 1,
                                                    price: parseFloat(matchedProd.selling_price || matchedProd.price || 0),
                                                    selected: true
                                                }]);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, background: 'white', cursor: 'pointer' }}
                                    >
                                        <option value="">-- Select Warranty-Covered Product --</option>
                                        {warrantyEligibleProducts.length === 0 ? (
                                            <option value="" disabled>No Warranty-Covered Products Registered (Warranty Details: Yes)</option>
                                        ) : (
                                            warrantyEligibleProducts.map((p, idx) => (
                                                <option key={idx} value={p.name}>
                                                    {p.name} {p.sku ? `[${p.sku}]` : ''} — Warranty: {p.warranty_period || 'Covered'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    {returnFormType === 'warranty' ? 'Serial / IMEI Number' : 'Invoice / Bill Number'}
                                </label>
                                {returnFormType === 'warranty' ? (
                                    <input 
                                        type="text" 
                                        value={newReturnData.invoice_number} 
                                        onChange={(e) => setNewReturnData({ ...newReturnData, invoice_number: e.target.value })} 
                                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }} 
                                        placeholder="e.g. POS-123456 / BILL-001" 
                                    />
                                ) : (
                                    <select 
                                        required
                                        value={newReturnData.invoice_number} 
                                        onChange={(e) => {
                                            const invNum = e.target.value;
                                            const matchInv = availableInvoicesForReturn.find(i => (i.invoice_number || i.purchase_number || i.id?.toString()) === invNum);
                                            if (matchInv) {
                                                const rawItems = typeof matchInv.items === 'string' ? JSON.parse(matchInv.items || '[]') : (matchInv.items || []);
                                                const initialReturnItems = rawItems.map((it, idx) => {
                                                    const origQty = parseFloat(it.quantity || it.qty || 1);
                                                    const prc = parseFloat(it.price || it.unit_price || it.selling_price || 0);
                                                    return {
                                                        id: it.id || idx,
                                                        product_id: it.product_id || it.id || null,
                                                        product_name: it.product_name || it.name || it.description || 'Product',
                                                        unit: it.unit || it.primary_unit || 'pcs',
                                                        invoiced_quantity: origQty,
                                                        return_quantity: origQty,
                                                        price: prc,
                                                        selected: true
                                                    };
                                                });
                                                setSelectedReturnItems(initialReturnItems);
                                                const calcTotal = initialReturnItems.filter(i => i.selected).reduce((sum, i) => sum + (i.price * i.return_quantity), 0);
                                                const finalAmt = calcTotal > 0 ? calcTotal.toFixed(2) : (matchInv.total_amount || matchInv.grand_total || matchInv.amount || '').toString();
                                                setNewReturnData(prev => ({ 
                                                    ...prev, 
                                                    invoice_number: invNum,
                                                    total_amount: finalAmt
                                                }));
                                            } else {
                                                setSelectedReturnItems([]);
                                                setNewReturnData(prev => ({ ...prev, invoice_number: invNum }));
                                            }
                                        }} 
                                        style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace', background: 'white', cursor: 'pointer' }} 
                                    >
                                        <option value="">
                                            {!newReturnData.client_name 
                                                ? (returnFormType === 'purchase' ? '-- Select Supplier First --' : '-- Select Customer First --')
                                                : (availableInvoicesForReturn.length === 0 ? '-- No Invoices Found for Selected Party --' : '-- Select Invoice / Bill Number --')
                                            }
                                        </option>
                                        {availableInvoicesForReturn.map((inv, idx) => {
                                            const num = inv.invoice_number || inv.purchase_number || inv.id;
                                            if (!num) return null;
                                            const amt = inv.total_amount || inv.grand_total || inv.amount || 0;
                                            const dt = inv.created_at ? inv.created_at.split('T')[0] : (inv.invoice_date || inv.date || '');
                                            const rawItems = typeof inv.items === 'string' ? JSON.parse(inv.items || '[]') : (inv.items || []);
                                            const itemNames = rawItems.map(i => i.product_name || i.name || i.description).filter(Boolean).slice(0, 3).join(', ');
                                            const itemSuffix = itemNames ? ` [${itemNames}${rawItems.length > 3 ? '...' : ''}]` : '';
                                            return (
                                                <option key={idx} value={num}>
                                                    {num} — ₹{amt}{itemSuffix} {dt ? `(${dt})` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                            </div>

                            {/* Multi-Product Selection & Quantity Adjustment for Return */}
                            {selectedReturnItems && selectedReturnItems.length > 0 && (
                                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                                            Select Products to Return ({selectedReturnItems.filter(i => i.selected).length} selected)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allSelected = selectedReturnItems.every(i => i.selected);
                                                const updated = selectedReturnItems.map(i => ({ ...i, selected: !allSelected }));
                                                setSelectedReturnItems(updated);
                                                const newTotal = updated.filter(i => i.selected).reduce((sum, i) => sum + (i.price * (parseFloat(i.return_quantity) || 0)), 0);
                                                setNewReturnData(prev => ({ ...prev, total_amount: newTotal.toFixed(2) }));
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#BE185D', fontSize: '0.7rem', fontWeight: '750', cursor: 'pointer' }}
                                        >
                                            {selectedReturnItems.every(i => i.selected) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
                                        {selectedReturnItems.map((item, idx) => {
                                            return (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', 
                                                        padding: '0.5rem 0.65rem', borderRadius: '10px', 
                                                        background: item.selected ? '#FFFFFF' : '#F1F5F9', 
                                                        border: item.selected ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                                                        opacity: item.selected ? 1 : 0.6
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={item.selected}
                                                            onChange={(e) => {
                                                                const updated = [...selectedReturnItems];
                                                                updated[idx].selected = e.target.checked;
                                                                setSelectedReturnItems(updated);
                                                                const newTotal = updated.filter(i => i.selected).reduce((sum, i) => sum + (i.price * (parseFloat(i.return_quantity) || 0)), 0);
                                                                setNewReturnData(prev => ({ ...prev, total_amount: newTotal.toFixed(2) }));
                                                            }}
                                                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#BE185D' }}
                                                        />
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '750', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.product_name}
                                                            </div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>
                                                                Invoiced: {item.invoiced_quantity} {item.unit} • ₹{item.price}/{item.unit}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {item.selected && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                            <label style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700' }}>Return Qty:</label>
                                                            <input 
                                                                type="number"
                                                                min="1"
                                                                max={item.invoiced_quantity}
                                                                value={item.return_quantity}
                                                                onChange={(e) => {
                                                                    let val = parseFloat(e.target.value);
                                                                    if (isNaN(val)) val = 1;
                                                                    if (val > item.invoiced_quantity) val = item.invoiced_quantity;
                                                                    if (val < 1) val = 1;

                                                                    const updated = [...selectedReturnItems];
                                                                    updated[idx].return_quantity = val;
                                                                    setSelectedReturnItems(updated);
                                                                    const newTotal = updated.filter(i => i.selected).reduce((sum, i) => sum + (i.price * (parseFloat(i.return_quantity) || 0)), 0);
                                                                    setNewReturnData(prev => ({ ...prev, total_amount: newTotal.toFixed(2) }));
                                                                }}
                                                                style={{ width: '55px', padding: '0.25rem 0.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', textAlign: 'right', fontWeight: '700', fontSize: '0.8rem', outline: 'none' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Return Amount (₹) *</label>
                                <input 
                                    required 
                                    type="number" 
                                    step="any" 
                                    value={newReturnData.total_amount} 
                                    onChange={(e) => setNewReturnData({ ...newReturnData, total_amount: e.target.value })} 
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', fontWeight: 700 }} 
                                    placeholder="0.00" 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>Reason / Notes</label>
                                <textarea 
                                    value={newReturnData.reason} 
                                    onChange={(e) => setNewReturnData({ ...newReturnData, reason: e.target.value })} 
                                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem', height: '60px', resize: 'none' }} 
                                    placeholder="Reason for return..." 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={createReturnMutation.isPending} 
                                style={{ 
                                    marginTop: '0.5rem', padding: '0.75rem', 
                                    background: returnFormType === 'sales' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : (returnFormType === 'purchase' ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'linear-gradient(135deg, #10B981 0%, #047857 100%)'), 
                                    color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' 
                                }}
                            >
                                {createReturnMutation.isPending ? 'Saving...' : 'Submit & Save Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* MOVE TO WAREHOUSE MODAL POPUP */}
            {moveWarehouseModalReturn && (() => {
                const items = Array.isArray(moveWarehouseModalReturn.items) ? moveWarehouseModalReturn.items : [];
                const prodName = items.length > 0 ? (items[0].product_name || items[0].name) : (moveWarehouseModalReturn.product_name || 'Returned Item');
                const retQty = items.length > 0 ? (items[0].return_quantity || items[0].quantity || 1) : (moveWarehouseModalReturn.return_quantity || 1);

                const rawWh = moveWarehouseModalReturn.warehouse_name || moveWarehouseModalReturn.warehouse_id;
                const assignedWhName = (rawWh && String(rawWh).trim() !== '' && String(rawWh).trim() !== 'null' && String(rawWh).trim() !== 'undefined') ? String(rawWh).trim() : '';
                const isAlreadyAssigned = Boolean(assignedWhName) || moveWarehouseModalReturn.inspection_status === 'Assigned to Warehouse';

                if (isAlreadyAssigned) {
                    const finalWhName = assignedWhName || 'Warehouse';
                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                            <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>Claim Already Completed</h4>
                                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, fontFamily: 'monospace' }}>
                                                Return Ref: {moveWarehouseModalReturn.return_number || moveWarehouseModalReturn.claim_number || `RET-${moveWarehouseModalReturn.id}`}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setMoveWarehouseModalReturn(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
                                </div>

                                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
                                        <Warehouse size={24} color="#047857" />
                                    </div>
                                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '850', color: '#065F46' }}>
                                        Already assigned to: <span style={{ color: '#047857', fontWeight: '950' }}>{finalWhName}</span>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#047857', fontWeight: '600', lineHeight: 1.4 }}>
                                        This returned product has already been moved to {finalWhName}.
                                    </p>
                                </div>

                                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Product:</span>
                                        <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '800' }}>{prodName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Quantity Returned:</span>
                                        <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '850' }}>{retQty}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setMoveWarehouseModalReturn(null)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#0F172A', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <Warehouse size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>Move Returned Products</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, fontFamily: 'monospace' }}>
                                            Return Ref: {moveWarehouseModalReturn.return_number || `RET-${moveWarehouseModalReturn.id}`}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setMoveWarehouseModalReturn(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
                            </div>

                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Product:</span>
                                    <span style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: '800' }}>{prodName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>Returned Quantity:</span>
                                    <span style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: '850' }}>{retQty}</span>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!selectedWarehouseForMove) {
                                    alert('Please select a warehouse');
                                    return;
                                }
                                const currentReturn = moveWarehouseModalReturn;
                                const selectedWh = selectedWarehouseForMove;
                                setMoveWarehouseModalReturn(null);
                                setGotItModalData({
                                    claim: currentReturn,
                                    warehouseName: selectedWh
                                });
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>
                                        Select Warehouse *
                                    </label>
                                    <select
                                        required
                                        value={selectedWarehouseForMove}
                                        onChange={(e) => setSelectedWarehouseForMove(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '0.88rem', fontWeight: '600', background: 'white', cursor: 'pointer' }}
                                    >
                                        <option value="">-- Select Registered Warehouse --</option>
                                        {dbWarehousesList.map((wh, idx) => (
                                            <option key={idx} value={wh.name || wh.id}>
                                                {wh.name} {wh.code ? `(${wh.code})` : ''} {wh.location ? `— ${wh.location}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setMoveWarehouseModalReturn(null)}
                                        style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={assignWarehouseMutation.isPending}
                                        style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', opacity: assignWarehouseMutation.isPending ? 0.7 : 1 }}
                                    >
                                        {assignWarehouseMutation.isPending ? 'Submitting...' : 'Move to Warehouse'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}
            {/* GOT IT CONFIRMATION MODAL */}
            {gotItModalData && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '380px', borderRadius: '20px', padding: '2rem 1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', border: '1px solid #BFDBFE', margin: '0 auto' }}>
                            <Info size={26} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>
                                Warranty Claim #{gotItModalData.claim.claim_number || gotItModalData.claim.return_number || (gotItModalData.claim.id ? `RET-${gotItModalData.claim.id}` : '')}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>
                                Product: {gotItModalData.claim.product_name || gotItModalData.claim.item_name || 'Product'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const targetClaim = gotItModalData.claim;
                                const targetWh = gotItModalData.warehouseName;
                                setGotItModalData(null);
                                assignWarehouseMutation.mutate({
                                    returnId: targetClaim.id,
                                    warehouseName: targetWh,
                                    status: 'Done',
                                    targetClaim: targetClaim
                                });
                            }}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#3B82F6', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            {/* CLM VIEW DETAIL MODAL */}
            {selectedClmDetail && (() => {
                const pDate = getFormattedPurchaseDate(selectedClmDetail);
                const wPeriod = getWarrantyPeriodText(selectedClmDetail);
                const progress = calculateWarrantyProgress(selectedClmDetail);
                const claimRef = selectedClmDetail.claim_number || selectedClmDetail.return_number || `CLM-${selectedClmDetail.id}`;

                return (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(6px)', padding: '1rem' }}>
                        <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '20px', padding: '1.75rem 1.5rem', border: '1px solid #E2E8F0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '850', color: '#0F172A' }}>Warranty Claim Details</h4>
                                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800', fontFamily: 'monospace' }}>
                                            Claim Ref: {claimRef}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedClmDetail(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', color: '#64748B' }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '700' }}>Purchase Date:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: '850' }}>{pDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '700' }}>Warranty Period:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#047857', fontWeight: '850' }}>{wPeriod}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: '700' }}>Warranty Progress:</span>
                                    <span style={{ fontSize: '0.9rem', color: '#2563EB', fontWeight: '850' }}>{progress.progressText}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedClmDetail(null)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: '#047857', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)', transition: 'all 0.2s' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                );
            })()}
            {/* Supplier Portal View (Confirm Order & Availability Response) Modal */}
            {isSupplierViewModalOpen && supplierViewPO && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, backdropFilter: 'blur(6px)', padding: '1.5rem' }}>
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

            {/* DISPATCH SHIPMENT / CREATE DELIVERY CHALLAN MODAL */}
            {isDispatchModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '780px', maxWidth: '94vw', maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#DCF2E4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                    <Truck size={22} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#064E3B', margin: 0 }}>Dispatch Shipment & Issue Challan</h2>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>Assign courier/driver, attach sales order, and initiate logistics transit</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setIsDispatchModalOpen(false)} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* SECTION 1: LINKED INVOICE & BASIC FIELDS */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', margin: 0 }}>
                                        📌 1. Link Sales Invoice & Basic Details
                                    </h4>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Quick auto-fill from current orders</span>
                                </div>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>
                                        Select Existing Invoice / Order (Optional)
                                    </label>
                                    <select 
                                        value={dispatchFormData.linked_invoice_id}
                                        onChange={e => handleSelectInvoiceForDispatch(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                    >
                                        <option value="">-- Choose Sales Invoice to Auto-populate Consignee & Items --</option>
                                        {(invoices || []).map(inv => (
                                            <option key={inv.id} value={inv.invoice_number || inv.id}>
                                                {inv.invoice_number || `INV-${inv.id}`} • {inv.client_name} ({formatCurrency(inv.total_amount || inv.amount || 0)}) • {inv.status || 'Active'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Delivery Reference No *</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={dispatchFormData.delivery_number}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, delivery_number: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Dispatch Date *</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={dispatchFormData.delivery_date}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, delivery_date: e.target.value, estimated_delivery_date: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Initial Status</label>
                                        <select 
                                            value={dispatchFormData.delivery_status}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, delivery_status: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="Packed">Packed</option>
                                            <option value="Dispatched">Dispatched</option>
                                            <option value="Out For Delivery">Out For Delivery</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: SHIPPING ADDRESS & RECEIVER */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '0.85rem' }}>📍 2. Shipping Address & Receiver</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Receiver / Customer Name *</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="e.g. Aman Deep"
                                            value={dispatchFormData.customer_name}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, customer_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>City / Pincode *</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Pune"
                                                value={dispatchFormData.city}
                                                onChange={e => setDispatchFormData({ ...dispatchFormData, city: e.target.value })}
                                                style={{ width: '60%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="411016"
                                                value={dispatchFormData.pincode}
                                                onChange={e => setDispatchFormData({ ...dispatchFormData, pincode: e.target.value })}
                                                style={{ width: '40%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Full Shipping Address *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="Flat / Office / Street address..."
                                        value={dispatchFormData.shipping_address}
                                        onChange={e => setDispatchFormData({ ...dispatchFormData, shipping_address: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            {/* SECTION 3: WAREHOUSE DISPATCH & CHALLAN */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '0.85rem' }}>📦 3. Packing & Challan Specs</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Warehouse</label>
                                        <select 
                                            value={dispatchFormData.warehouse_id}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, warehouse_id: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="WH-MAIN-01">WH-MAIN-01 (Pune)</option>
                                            <option value="WH-TECH-02">WH-TECH-02 (Hinjewadi)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Package Count</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={dispatchFormData.package_count}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, package_count: parseInt(e.target.value) || 1 })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Total Weight (Kg)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={dispatchFormData.package_weight}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, package_weight: parseFloat(e.target.value) || 1.0 })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Challan Type</label>
                                        <select 
                                            value={dispatchFormData.challan_type}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, challan_type: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="GST">GST Challan</option>
                                            <option value="Non-GST">Non-GST Challan</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Packaging Remarks</label>
                                    <input 
                                        type="text" 
                                        placeholder="Fragile items, urgent priority, delivery notes..."
                                        value={dispatchFormData.packaging_notes}
                                        onChange={e => setDispatchFormData({ ...dispatchFormData, packaging_notes: e.target.value })}
                                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                    />
                                </div>
                            </div>

                            {/* SECTION 4: FLEET & COURIER ASSIGNMENT */}
                            <div style={{ background: '#FAFDFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A', textTransform: 'uppercase', marginBottom: '0.85rem' }}>👨💼 4. Fleet & Courier Assignment</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Internal Delivery Driver</label>
                                        <select 
                                            value={dispatchFormData.delivery_staff_id}
                                            onChange={e => handleSelectStaffForDispatch(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600', background: 'white' }}
                                        >
                                            <option value="">Select Internal Driver</option>
                                            {INITIAL_BILLING_STAFF.map(s => (
                                                <option key={s.staff_id} value={s.staff_id}>{s.name} ({s.vehicle})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Courier Company</label>
                                        <input 
                                            type="text" 
                                            placeholder="CLIKS Logistics / Delhivery"
                                            value={dispatchFormData.courier_name}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, courier_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '750', color: '#64748B', marginBottom: '0.4rem' }}>Tracking Reference ID</label>
                                        <input 
                                            type="text" 
                                            placeholder="TRK998248102"
                                            value={dispatchFormData.tracking_number}
                                            onChange={e => setDispatchFormData({ ...dispatchFormData, tracking_number: e.target.value })}
                                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                style={{ 
                                    width: '100%', padding: '1rem', borderRadius: '12px', 
                                    background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                                    color: 'white', border: 'none', fontWeight: '800', fontSize: '1rem', 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.25)', marginTop: '0.25rem'
                                }}
                            >
                                <Truck size={18} /> Generate Challan & Dispatch Shipment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Challan & Confirm Verification Modal */}
            {selectedChallanConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', width: '560px', maxWidth: '92vw', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: '0 0 0.2rem 0' }}>Shipment Dispatch & Challan Verification</h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Challan No: <strong style={{ color: '#047857' }}>{selectedChallanConfirm.challan_number}</strong></span>
                            </div>
                            <button onClick={() => setSelectedChallanConfirm(null)} style={{ border: 'none', background: '#F1F5F9', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer', color: '#64748B' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#64748B' }}>Consignee / Customer:</span>
                                    <strong style={{ color: '#0F172A' }}>{selectedChallanConfirm.customer_name}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#64748B' }}>Delivery Address:</span>
                                    <strong style={{ color: '#0F172A', textAlign: 'right', maxWidth: '60%' }}>{selectedChallanConfirm.shipping_address}, {selectedChallanConfirm.city}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#64748B' }}>Assigned Driver:</span>
                                    <strong style={{ color: '#0F172A' }}>{selectedChallanConfirm.driver_name || 'Pending'} ({selectedChallanConfirm.vehicle_number || 'N/A'})</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748B' }}>Tracking Reference:</span>
                                    <strong style={{ color: '#047857' }}>{selectedChallanConfirm.tracking_number || 'TRK-DIRECT'}</strong>
                                </div>
                            </div>

                            <div style={{ background: '#FAFDFB', border: '1px solid #DCF2E4', padding: '1rem', borderRadius: '14px' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#166534', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Smartphone size={16} /> OTP Delivery Verification
                                </h4>
                                <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
                                    Verification Code: <strong style={{ background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{selectedChallanConfirm.otp_code || '5829'}</strong>
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Customer OTP..."
                                        value={confirmOtp}
                                        onChange={(e) => setConfirmOtp(e.target.value)}
                                        style={{ flex: 1, padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBillingDeliveries(prev => prev.map(d => d.delivery_id === selectedChallanConfirm.delivery_id ? { ...d, delivery_status: 'Delivered' } : d));
                                            alert(`Delivery Challan #${selectedChallanConfirm.challan_number} confirmed and marked as Delivered!`);
                                            setSelectedChallanConfirm(null);
                                        }}
                                        style={{
                                            padding: '0.55rem 1.1rem',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                                            color: 'white',
                                            border: 'none',
                                            fontWeight: '750',
                                            fontSize: '0.82rem',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Confirm Delivery ✓
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.print();
                                    }}
                                    style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white', color: '#334155', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Print Challan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedChallanConfirm(null)}
                                    style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: 'none', background: '#F1F5F9', color: '#475569', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate e-Invoice Modal */}
            {isInvoiceModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Generate GST e-Invoice</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleGenerateGstInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Sender (From) Section */}
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginTop: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sender (From)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#0F172A' }}>
                                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>Company Name:</span> <span style={{ fontWeight: '750' }}>{defaultSender.legal_name}</span></div>
                                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>GSTIN:</span> <span style={{ fontWeight: '750', fontFamily: 'monospace' }}>{defaultSender.gstin}</span></div>
                                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>State:</span> <span style={{ fontWeight: '750' }}>{defaultSender.state_code} - {defaultSender.state}</span></div>
                                        <div><span style={{ color: '#64748B', fontWeight: '600' }}>Address:</span> <span style={{ fontWeight: '600', color: '#475569' }}>{defaultSender.address}, {defaultSender.location} - {defaultSender.pincode}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Receiver (To) Section */}
                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginTop: 0, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Receiver (To)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {/* Customer Mode Selection */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B' }}>Customer Source:</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                name="customerMode" 
                                                value="existing" 
                                                checked={customerMode === 'existing'} 
                                                onChange={() => {
                                                    setCustomerMode('existing');
                                                    setInvoiceForm(prev => ({ ...prev, client_name: '', customer_gstin: '', place_of_supply: '33-Tamil Nadu' }));
                                                }}
                                            />
                                            Existing Customer
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>
                                            <input 
                                                type="radio" 
                                                name="customerMode" 
                                                value="manual" 
                                                checked={customerMode === 'manual'} 
                                                onChange={() => {
                                                    setCustomerMode('manual');
                                                    setInvoiceForm(prev => ({ ...prev, client_name: '', customer_gstin: '', place_of_supply: '33-Tamil Nadu' }));
                                                }}
                                            />
                                            Manual Entry
                                        </label>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Customer Name *</label>
                                        {customerMode === 'existing' ? (
                                            <select 
                                                value={invoiceForm.client_name} 
                                                onChange={(e) => {
                                                    const selectedName = e.target.value;
                                                    const customer = customers.find(c => c.name === selectedName);
                                                    setInvoiceForm(prev => ({
                                                        ...prev,
                                                        client_name: selectedName,
                                                        customer_gstin: customer?.gstin || prev.customer_gstin,
                                                        place_of_supply: customer?.place_of_supply || customer?.state || prev.place_of_supply
                                                    }));
                                                }}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.client_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                            >
                                                <option value="">Select Customer</option>
                                                {customers.map(cust => (
                                                    <option key={cust.id} value={cust.name}>{cust.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                required 
                                                type="text" 
                                                value={invoiceForm.client_name} 
                                                onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })} 
                                                placeholder="Enter Customer Name"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.client_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} 
                                            />
                                        )}
                                        {validationErrors.client_name && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.client_name}</span>}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Customer GSTIN</label>
                                            <input 
                                                type="text" 
                                                value={invoiceForm.customer_gstin} 
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    const prefix = val.slice(0, 2);
                                                    const autoState = GST_STATE_MAP[prefix];
                                                    setInvoiceForm(prev => ({
                                                        ...prev,
                                                        customer_gstin: val,
                                                        ...(autoState ? { place_of_supply: autoState } : {})
                                                    }));
                                                }} 
                                                placeholder="Enter GSTIN (e.g. 05AAAPG7885R002)"
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.customer_gstin ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} 
                                            />
                                            {validationErrors.customer_gstin && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.customer_gstin}</span>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>State / Place of Supply</label>
                                            <select 
                                                value={invoiceForm.place_of_supply} 
                                                onChange={(e) => setInvoiceForm({ ...invoiceForm, place_of_supply: e.target.value })} 
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                            >
                                                <option value="05-Uttarakhand">05 - Uttarakhand</option>
                                                <option value="09-Uttar Pradesh">09 - Uttar Pradesh</option>
                                                <option value="07-Delhi">07 - Delhi</option>
                                                <option value="33-Tamil Nadu">33 - Tamil Nadu</option>
                                                <option value="27-Maharashtra">27 - Maharashtra</option>
                                                <option value="29-Karnataka">29 - Karnataka</option>
                                                <option value="24-Gujarat">24 - Gujarat</option>
                                                <option value="19-West Bengal">19 - West Bengal</option>
                                                <option value="08-Rajasthan">08 - Rajasthan</option>
                                                <option value="06-Haryana">06 - Haryana</option>
                                                <option value="03-Punjab">03 - Punjab</option>
                                                <option value="10-Bihar">10 - Bihar</option>
                                                <option value="36-Telangana">36 - Telangana</option>
                                                <option value="37-Andhra Pradesh">37 - Andhra Pradesh</option>
                                                <option value="32-Kerala">32 - Kerala</option>
                                                <option value="23-Madhya Pradesh">23 - Madhya Pradesh</option>
                                                <option value="21-Odisha">21 - Odisha</option>
                                                <option value="18-Assam">18 - Assam</option>
                                                <option value="20-Jharkhand">20 - Jharkhand</option>
                                                <option value="22-Chhattisgarh">22 - Chhattisgarh</option>
                                                <option value="30-Goa">30 - Goa</option>
                                            </select>
                                        </div>
                                    </div>
                                    {customerMode === 'manual' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                            <input 
                                                type="checkbox" 
                                                id="saveCustomerForFuture" 
                                                checked={saveCustomerForFuture} 
                                                onChange={(e) => setSaveCustomerForFuture(e.target.checked)} 
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label htmlFor="saveCustomerForFuture" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                                                Save this customer for future use
                                            </label>
                                        </div>
                                    )}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Product Name / Description *</label>
                                        <input 
                                            list="receiver-inventory-products"
                                            required 
                                            type="text" 
                                            value={invoiceForm.receiver_product_name} 
                                            onChange={(e) => setInvoiceForm({ ...invoiceForm, receiver_product_name: e.target.value, sender_product_name: e.target.value })} 
                                            placeholder="Select or enter Product Name / Description"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.receiver_product_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} 
                                        />
                                        <datalist id="receiver-inventory-products">
                                            {inventoryItems.map(item => (
                                                <option key={item.id} value={item.name} />
                                            ))}
                                        </datalist>
                                        {validationErrors.receiver_product_name && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.receiver_product_name}</span>}
                                    </div>

                                    {/* Missing Mandatory E-Invoice Fields (HSN, Unit, Quantity) */}
                                    <div className="grid grid-cols-3 gap-3 my-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                      <div>
                                        <label className="text-[11px] font-semibold text-gray-600" style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4B5563', marginBottom: '0.25rem' }}>HSN/SAC Code *</label>
                                        <input
                                          type="text"
                                          name="hsn_code"
                                          value={invoiceForm.hsn_code || "100190"}
                                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, hsn_code: e.target.value }))}
                                          className="w-full text-xs p-2 border rounded-lg"
                                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                                          placeholder="100190"
                                          required
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[11px] font-semibold text-gray-600" style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4B5563', marginBottom: '0.25rem' }}>Unit *</label>
                                        <select
                                          name="unit"
                                          value={invoiceForm.unit || "BOX"}
                                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, unit: e.target.value }))}
                                          className="w-full text-xs p-2 border rounded-lg bg-white"
                                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                                        >
                                          <option value="BOX">BOX</option>
                                          <option value="KGS">KGS</option>
                                          <option value="NOS">NOS</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-[11px] font-semibold text-gray-600" style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#4B5563', marginBottom: '0.25rem' }}>Quantity *</label>
                                        <input
                                          type="number"
                                          name="quantity"
                                          min="1"
                                          value={invoiceForm.quantity || 1}
                                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, quantity: e.target.value }))}
                                          className="w-full text-xs p-2 border rounded-lg"
                                          style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '0.5rem', outline: 'none', boxSizing: 'border-box' }}
                                          required
                                        />
                                      </div>
                                    </div>
                                </div>
                            </div>

                            {/* e-Invoice parameters Section */}
                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Type</label>
                                        <select 
                                            value={invoiceForm.invoice_type} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setInvoiceForm(prev => ({
                                                    ...prev,
                                                    invoice_type: val,
                                                    ...(val !== 'Export' ? {
                                                        export_under_lut: 'No',
                                                        lut_document_path: '',
                                                        lut_file_name: '',
                                                        lut_uploaded_at: '',
                                                        lut_uploaded_by: ''
                                                    } : {})
                                                }));
                                            }} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                        >
                                            <option value="B2B">B2B</option>
                                            <option value="B2C">B2C</option>
                                            <option value="Export">Export</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Taxable Value (Before GST)</label>
                                        <input required type="number" value={invoiceForm.taxable_value} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxable_value: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.taxable_value ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', boxSizing: 'border-box' }} />
                                        {validationErrors.taxable_value && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.taxable_value}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GST %</label>
                                        <select 
                                            value={invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? '0' : invoiceForm.gst_percentage} 
                                            disabled={invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes'}
                                            onChange={(e) => setInvoiceForm({ ...invoiceForm, gst_percentage: parseInt(e.target.value) })} 
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? '#F1F5F9' : 'white', fontWeight: '600', cursor: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? 'not-allowed' : 'pointer' }}
                                        >
                                            {invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' && <option value="0">0% (LUT)</option>}
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reverse Charge</label>
                                        <select value={invoiceForm.reverse_charge} onChange={(e) => setInvoiceForm({ ...invoiceForm, reverse_charge: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                        </select>
                                    </div>
                                </div>

                                {invoiceForm.invoice_type === 'Export' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Export Under LUT / Bond?</label>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', height: '2.8rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="export_under_lut" 
                                                        value="Yes" 
                                                        checked={invoiceForm.export_under_lut === 'Yes'} 
                                                        onChange={() => {
                                                            setInvoiceForm(prev => ({ ...prev, export_under_lut: 'Yes' }));
                                                            setIsLutModalOpen(true);
                                                        }}
                                                    />
                                                    Yes
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', cursor: 'pointer' }}>
                                                    <input 
                                                        type="radio" 
                                                        name="export_under_lut" 
                                                        value="No" 
                                                        checked={invoiceForm.export_under_lut !== 'Yes'} 
                                                        onChange={() => {
                                                            setInvoiceForm(prev => ({ 
                                                                ...prev, 
                                                                export_under_lut: 'No',
                                                                lut_document_path: '',
                                                                lut_file_name: '',
                                                                lut_uploaded_at: '',
                                                                lut_uploaded_by: ''
                                                            }));
                                                        }}
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </div>
                                        {invoiceForm.export_under_lut === 'Yes' && invoiceForm.lut_file_name && (
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#047857', marginBottom: '0.2rem' }}>LUT DOC ATTACHED</label>
                                                <span style={{ fontSize: '0.72rem', fontWeight: '750', color: '#065F46', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    📎 {invoiceForm.lut_file_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Auto GST Detection Panel */}
                                {(() => {
                                    const senderStateCode = (gstProfile.state_code || '33').substring(0, 2);
                                    const receiverStateCode = (invoiceForm.place_of_supply || '33').substring(0, 2);
                                    const isSameState = senderStateCode === receiverStateCode;
                                    const isLut = invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes';
                                    const gstPct = isLut ? 0 : (parseFloat(invoiceForm.gst_percentage) || 12);
                                    const taxable = parseFloat(invoiceForm.taxable_value) || 0;
                                    const taxTotal = taxable * (gstPct / 100);
                                    return (
                                        <div style={{ background: '#F5F3FF', padding: '0.8rem', borderRadius: '10px', border: '1px solid #DDD6FE', fontSize: '0.78rem', color: '#4C1D95' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', marginBottom: '0.25rem' }}>
                                                <span>TAX TYPE DETERMINED:</span>
                                                <span style={{ color: '#7C3AED' }}>
                                                    {isLut ? 'EXPORT UNDER LUT (GST 0%)' : (isSameState ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', color: '#5B21B6', fontSize: '0.74rem' }}>
                                                {isLut ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>CGST (0%)</span>
                                                            <span style={{ fontWeight: '700' }}>{formatCurrency(0)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>SGST (0%)</span>
                                                            <span style={{ fontWeight: '700' }}>{formatCurrency(0)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>IGST (0%)</span>
                                                            <span style={{ fontWeight: '700' }}>{formatCurrency(0)}</span>
                                                        </div>
                                                    </>
                                                ) : isSameState ? (
                                                    <>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>CGST ({gstPct / 2}%)</span>
                                                            <span style={{ fontWeight: '700' }}>{formatCurrency(taxTotal / 2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>SGST ({gstPct / 2}%)</span>
                                                            <span style={{ fontWeight: '700' }}>{formatCurrency(taxTotal / 2)}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>IGST ({gstPct}%)</span>
                                                        <span style={{ fontWeight: '700' }}>{formatCurrency(taxTotal)}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #DDD6FE', paddingTop: '0.2rem', marginTop: '0.2rem', fontWeight: '800', fontSize: '0.78rem' }}>
                                                    <span>Total Invoice Amount</span>
                                                    <span>{formatCurrency(taxable + taxTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <button 
                                type="submit" 
                                disabled={generateGstInvoiceMutation.isPending}
                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: generateGstInvoiceMutation.isPending ? 'not-allowed' : 'pointer', opacity: generateGstInvoiceMutation.isPending ? 0.7 : 1, boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}
                            >
                                {generateGstInvoiceMutation.isPending ? 'Generating...' : 'Generate / Authenticate e-Invoice'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Letter of Undertaking (LUT) Modal */}
            {isLutModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Upload Letter of Undertaking (LUT)</h3>
                            <button 
                                onClick={() => {
                                    setIsLutModalOpen(false);
                                    if (!invoiceForm.lut_document_path) {
                                        setInvoiceForm(prev => ({ ...prev, export_under_lut: 'No' }));
                                    }
                                }} 
                                style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                            You selected Export under LUT/Bond. Please upload your valid Letter of Undertaking (LUT) document before generating the invoice.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                                id="lut-file-upload-input" 
                                style={{ display: 'none' }} 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    if (file.size > 10 * 1024 * 1024) {
                                        alert("Maximum file size allowed is 10 MB.");
                                        return;
                                    }
                                    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                                    if (!allowed.includes(file.type)) {
                                        alert("Invalid file format. Only PDF, JPG, JPEG, and PNG are supported.");
                                        return;
                                    }
                                    
                                    try {
                                        const reader = new FileReader();
                                        reader.onload = async () => {
                                            const base64Content = reader.result.split(',')[1];
                                            const uploadRes = await splitExpenseService.uploadAttachment({
                                                name: file.name,
                                                content: base64Content
                                            });
                                            
                                            setInvoiceForm(prev => ({
                                                ...prev,
                                                lut_document_path: uploadRes.url,
                                                lut_file_name: file.name,
                                                lut_uploaded_at: new Date().toISOString(),
                                                lut_uploaded_by: JSON.parse(localStorage.getItem('cliks_user_profile') || '{}')?.username || 'Current User'
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    } catch (err) {
                                        console.error('[LUT Upload] Failed:', err);
                                        alert('Failed to upload LUT document. Please try again.');
                                    }
                                }}
                            />
                            
                            <button 
                                type="button"
                                onClick={() => document.getElementById('lut-file-upload-input').click()}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 1.5rem', border: invoiceForm.lut_file_name ? '2px solid #10B981' : '2px dashed #CBD5E1', borderRadius: '16px', background: '#F8FAFC', cursor: 'pointer', outline: 'none' }}
                            >
                                <span style={{ fontSize: '1.75rem' }}>📄</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1E293B' }}>
                                    {invoiceForm.lut_file_name ? 'Change Document' : 'Choose File'}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '650' }}>
                                    Supported Formats: PDF, JPG, JPEG, PNG (Max 10 MB)
                                </span>
                            </button>
                            
                            {invoiceForm.lut_file_name && (
                                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#10B981', fontSize: '1rem' }}>✓</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: '750', color: '#065F46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {invoiceForm.lut_file_name}
                                        </p>
                                        <span style={{ fontSize: '0.65rem', color: '#047857', fontWeight: '600' }}>
                                            Ready to attach
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsLutModalOpen(false);
                                    if (!invoiceForm.lut_document_path) {
                                        setInvoiceForm(prev => ({ ...prev, export_under_lut: 'No' }));
                                    }
                                }} 
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #CBD5E1', background: 'white', color: '#334155', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (!invoiceForm.lut_document_path) {
                                        alert("Please upload a valid LUT document.");
                                        return;
                                    }
                                    setIsLutModalOpen(false);
                                }} 
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', fontWeight: '750', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Upload & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate e-Way Bill Modal */}
            {isEwayModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '580px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Create Government e-Way Bill</h3>
                            <button onClick={() => { setIsEwayModalOpen(false); setValidationErrors({}); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateEway} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Consignor / Sender (From) Section */}
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Consignor / Sender (From)</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.4rem', fontSize: '0.82rem', color: '#0F172A' }}>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>Legal Name:</span> <span style={{ fontWeight: '750' }}>{defaultSender.legal_name}</span></div>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>GSTIN:</span> <span style={{ fontWeight: '750', fontFamily: 'monospace' }}>{defaultSender.gstin}</span></div>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>Dispatch From:</span> <span style={{ fontWeight: '750' }}>{defaultSender.location} ({defaultSender.state_code} - {defaultSender.state}) - {defaultSender.pincode}</span></div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>AUTO-FILL FROM SALES INVOICE (OPTIONAL)</label>
                                <select 
                                    value={ewayForm.is_invoice_selected ? invoices.find(inv => inv.invoice_number === ewayForm.invoice_number)?.id || '' : ''} 
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setEwayForm(prev => ({
                                                ...prev,
                                                is_invoice_selected: false,
                                                invoice_number: '',
                                                goods_items: [],
                                                goods_product_name: '',
                                                goods_hsn_code: '',
                                                goods_quantity: '',
                                                goods_unit: 'Pcs',
                                                goods_taxable_value: '',
                                                goods_gst_rate: '18',
                                                goods_total_value: ''
                                            }));
                                            return;
                                        }
                                        const selected = invoices.find(inv => String(inv.id) === e.target.value);
                                        if (selected) {
                                            const items = Array.isArray(selected.items) ? selected.items : [];
                                            const taxVal = items.reduce((sum, item) => sum + (parseFloat(item.price || item.rate || 0) * parseFloat(item.quantity || 0)), 0);
                                            const totalVal = selected.total_amount || selected.amount || 0;
                                            
                                            setEwayForm(prev => ({
                                                ...prev,
                                                invoice_number: selected.invoice_number || '',
                                                invoice_date: selected.created_at ? selected.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                                                delivery_location: selected.client_name || selected.billing_address || '',
                                                is_invoice_selected: true,
                                                goods_items: items,
                                                goods_product_name: items.map(i => i.description || i.product_name).join(', '),
                                                goods_hsn_code: items.map(i => i.hsn_code || i.hsn).filter(Boolean).join(', '),
                                                goods_quantity: items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0),
                                                goods_unit: items[0]?.unit || 'Pcs',
                                                goods_taxable_value: taxVal,
                                                goods_gst_rate: items[0]?.tax_rate || 18,
                                                goods_total_value: totalVal
                                            }));
                                        }
                                    }} 
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}
                                >
                                    <option value="">-- Select Sales Invoice --</option>
                                    {invoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoice_number} - {inv.client_name || 'Walk-in'} (₹{parseFloat(inv.total_amount || inv.amount || 0).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Goods Details Section */}
                            {ewayForm.is_invoice_selected ? (
                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', marginTop: 0, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goods Details (Read-Only)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {ewayForm.goods_items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#334155', borderBottom: idx < ewayForm.goods_items.length - 1 ? '1px solid #F1F5F9' : 'none', paddingBottom: idx < ewayForm.goods_items.length - 1 ? '0.5rem' : 0 }}>
                                                <div>
                                                    <span style={{ fontWeight: '700', display: 'block' }}>{item.description || 'N/A'}</span>
                                                    {item.hsn_code && <span style={{ color: '#64748B', fontSize: '0.65rem' }}>HSN: {item.hsn_code}</span>}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>{item.quantity} {item.unit || 'Pcs'}</div>
                                                <div style={{ textAlign: 'right' }}>₹{parseFloat(item.price || 0).toLocaleString()}</div>
                                                <div style={{ textAlign: 'right', fontWeight: '700' }}>₹{parseFloat(item.total || 0).toLocaleString()} <span style={{ fontSize: '0.6rem', color: '#64748B' }}>({item.tax_rate}%)</span></div>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.6rem', marginTop: '0.2rem', fontWeight: '850', fontSize: '0.8rem', color: '#0F172A' }}>
                                            <span>Total Invoice Value:</span>
                                            <span>₹{parseFloat(ewayForm.goods_total_value || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', marginTop: 0, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goods Details (Manual Entry)</h4>
                                    
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>PRODUCT NAME *</label>
                                        <input type="text" value={ewayForm.goods_product_name} onChange={(e) => setEwayForm({ ...ewayForm, goods_product_name: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: validationErrors.goods_product_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem' }} placeholder="e.g. Steel Rods" />
                                        {validationErrors.goods_product_name && <span style={{ color: '#EF4444', fontSize: '0.65rem', fontWeight: '750', marginTop: '0.15rem', display: 'block' }}>{validationErrors.goods_product_name}</span>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>HSN/SAC CODE</label>
                                            <input type="text" value={ewayForm.goods_hsn_code} onChange={(e) => setEwayForm({ ...ewayForm, goods_hsn_code: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem' }} placeholder="e.g. 7214" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>UNIT</label>
                                            <input type="text" value={ewayForm.goods_unit} onChange={(e) => setEwayForm({ ...ewayForm, goods_unit: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem' }} placeholder="e.g. MT, Pcs, Kgs" />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>QUANTITY *</label>
                                            <input type="number" step="any" value={ewayForm.goods_quantity} onChange={(e) => setEwayForm({ ...ewayForm, goods_quantity: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: validationErrors.goods_quantity ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem' }} placeholder="e.g. 10" />
                                            {validationErrors.goods_quantity && <span style={{ color: '#EF4444', fontSize: '0.65rem', fontWeight: '750', marginTop: '0.15rem', display: 'block' }}>{validationErrors.goods_quantity}</span>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>TAXABLE VALUE (₹) *</label>
                                            <input type="number" step="any" value={ewayForm.goods_taxable_value} onChange={(e) => setEwayForm({ ...ewayForm, goods_taxable_value: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: validationErrors.goods_taxable_value ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem' }} placeholder="e.g. 50000" />
                                            {validationErrors.goods_taxable_value && <span style={{ color: '#EF4444', fontSize: '0.65rem', fontWeight: '750', marginTop: '0.15rem', display: 'block' }}>{validationErrors.goods_taxable_value}</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#64748B', marginBottom: '0.3rem' }}>GST RATE (%)</label>
                                        <select value={ewayForm.goods_gst_rate} onChange={(e) => setEwayForm({ ...ewayForm, goods_gst_rate: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.8rem', fontWeight: '600' }}>
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>INVOICE NUMBER *</label>
                                    <input required type="text" value={ewayForm.invoice_number} onChange={(e) => setEwayForm({ ...ewayForm, invoice_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.invoice_number ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="INV-2026-001" />
                                    {validationErrors.invoice_number && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.invoice_number}</span>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>INVOICE DATE *</label>
                                    <input required type="date" value={ewayForm.invoice_date} onChange={(e) => setEwayForm({ ...ewayForm, invoice_date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.invoice_date ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', fontFamily: 'inherit' }} />
                                    {validationErrors.invoice_date && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.invoice_date}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>TRANSPORT MODE *</label>
                                    <select value={ewayForm.transport_mode} onChange={(e) => setEwayForm({ ...ewayForm, transport_mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        <option value="Road">Road</option>
                                        <option value="Rail">Rail</option>
                                        <option value="Air">Air</option>
                                        <option value="Ship">Ship</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>TRANSPORT COMPANY NAME *</label>
                                    <input required type="text" value={ewayForm.transporter_name} onChange={(e) => setEwayForm({ ...ewayForm, transporter_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.transporter_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. M/S UTTARAYAN CO-OPERATIVE FOR RENEWABLE ENERGY" />
                                    {validationErrors.transporter_name && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.transporter_name}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>TRANSPORTER GSTIN *</label>
                                    <input required type="text" value={ewayForm.transporter_gstin} onChange={(e) => setEwayForm({ ...ewayForm, transporter_gstin: e.target.value.toUpperCase() })} onBlur={(e) => setEwayForm({ ...ewayForm, transporter_gstin: e.target.value.trim().toUpperCase() })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.transporter_gstin ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="05AAAAU6537D1ZO" />
                                    {validationErrors.transporter_gstin && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.transporter_gstin}</span>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                                        VEHICLE NUMBER {ewayForm.transport_mode === 'Road' ? '*' : '(OPTIONAL)'}
                                    </label>
                                    <input type="text" value={ewayForm.vehicle_number} onChange={(e) => setEwayForm({ ...ewayForm, vehicle_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.vehicle_number ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="MH-02-EH-9081" />
                                    {validationErrors.vehicle_number && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.vehicle_number}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>DISTANCE (KMS) *</label>
                                    <input required type="number" value={ewayForm.transport_distance} onChange={(e) => setEwayForm({ ...ewayForm, transport_distance: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.transport_distance ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="e.g. 150" />
                                    {validationErrors.transport_distance && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.transport_distance}</span>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>DISPATCH LOCATION *</label>
                                    <input required type="text" value={ewayForm.dispatch_location} onChange={(e) => setEwayForm({ ...ewayForm, dispatch_location: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.dispatch_location ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="Mumbai warehouse" />
                                    {validationErrors.dispatch_location && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.dispatch_location}</span>}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>DELIVERY DESTINATION *</label>
                                <input required type="text" value={ewayForm.delivery_location} onChange={(e) => setEwayForm({ ...ewayForm, delivery_location: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.delivery_location ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="Client site, Pune" />
                                {validationErrors.delivery_location && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.delivery_location}</span>}
                            </div>

                            {createEwayMutation.isError && (
                                <div style={{ color: '#EF4444', background: '#FEF2F2', padding: '0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid #FCA5A5' }}>
                                    Failed to generate e-Way Bill: {createEwayMutation.error?.response?.data?.error?.message || createEwayMutation.error?.response?.data?.message || createEwayMutation.error?.message || 'Unknown error'}
                                </div>
                            )}

                            <button type="submit" disabled={createEwayMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: createEwayMutation.isPending ? 'not-allowed' : 'pointer', opacity: createEwayMutation.isPending ? 0.7 : 1, boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}>
                                {createEwayMutation.isPending ? 'Generating e-Way Bill...' : 'Generate Government e-Way Bill'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Government e-Invoice QR Code & Details Modal */}
            {selectedQrInvoice && (() => {
                const data = selectedQrInvoice;
                const generatedInvoiceData = selectedQrInvoice;

                const getSafeInvoicePdfUrl = (data) => {
                  if (!data) return null;

                  let rawUrl = 
                    data?.EinvoicePdf || 
                    data?.results?.message?.EinvoicePdf || 
                    data?.results?.EinvoicePdf || 
                    data?.message?.EinvoicePdf || 
                    data?.pdf_url || 
                    data?.pdfUrl || 
                    null;

                  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '' || rawUrl.trim() === '#' || (rawUrl.includes('localhost') && rawUrl.includes('/#'))) {
                    return null;
                  }

                  let cleanUrl = rawUrl.trim();

                  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                    cleanUrl = `https://${cleanUrl}`;
                  }

                  return cleanUrl;
                };

                const handleDownloadInvoicePdf = () => {
                  const pdfUrl = getSafeInvoicePdfUrl(generatedInvoiceData);
                  if (!pdfUrl) {
                    alert("Official government PDF URL is not available for this record. Please re-generate with live credentials.");
                    return;
                  }
                  window.open(pdfUrl, "_blank", "noopener,noreferrer");
                };

                const handlePrintInvoice = () => {
                  const pdfUrl = getSafeInvoicePdfUrl(generatedInvoiceData);
                  if (!pdfUrl) {
                    alert("Official government PDF URL is not available for this record. Please re-generate with live credentials.");
                    return;
                  }
                  const printWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer");
                  if (printWindow) {
                    printWindow.addEventListener("load", () => {
                      try {
                        printWindow.focus();
                        printWindow.print();
                      } catch (err) {
                        console.warn("Print preview prevented by browser:", err);
                      }
                    });
                  }
                };

                const irnHash = data.results?.message?.Irn || data.irn || data.irn_number || 'N/A';
                const ackNo = data.results?.message?.AckNo || data.ack_no || data.AckNo || '—';
                const ackDate = data.results?.message?.AckDt || data.ack_date || data.AckDt || data.date || '—';
                const signedQrCode = data.results?.message?.SignedQRCode || data.signed_qr_code || data.SignedQRCode || '';
                
                const sellerName = defaultSender.legal_name || "Welton Consignor";
                const sellerGstin = defaultSender.gstin || "05AAAPG7885R002";
                const sellerState = `${defaultSender.state_code} - ${defaultSender.state}`;
                
                const buyerName = data.customer_name || data.client_name || "Buyer / Client Name";
                const buyerGstin = data.customer_gstin || "09AAAPG7885R002";
                const buyerState = data.customer_state || data.place_of_supply || "09 - Uttar Pradesh";

                const taxableSalesValue = Number(data.taxable_amount ?? data.taxable_value ?? data.amount ?? 0);
                const totalGstAmount = Number(data.total_tax ?? data.tax_amount ?? ((data.cgst_amount || 0) + (data.sgst_amount || 0) + (data.igst_amount || 0)) ?? 0);
                const totalInvoiceBillAmount = Number(data.total_amount ?? (taxableSalesValue + totalGstAmount) ?? 0);
                
                const qrPayload = signedQrCode || (data.id ? `${window.location.origin}/public/invoice/${data.id}` : (data.invoice_number || ''));

                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem' }}>
                        <div style={{ background: 'white', borderRadius: '32px', width: '100%', maxWidth: '650px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#4338CA', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>🛡️</span> Government e-Invoice Portal
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>IRN Authenticated & Registered Successfully</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedQrInvoice(null)} 
                                    style={{ border: 'none', background: '#F1F5F9', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* QR Code and Primary Metadata */}
                                <div style={{ display: 'flex', gap: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0', alignItems: 'center' }}>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}`}
                                        alt="Authenticated QR Code"
                                        style={{ background: 'white', padding: '0.4rem', border: '1px solid #E2E8F0', borderRadius: '12px', width: '130px', height: '130px' }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Invoice Number</span>
                                            <strong style={{ display: 'block', fontSize: '1rem', color: '#0F172A' }}>{data.invoice_number || 'N/A'}</strong>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ack No</span>
                                                <span style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: '700', fontFamily: 'monospace' }}>{ackNo}</span>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ack Date</span>
                                                <span style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: '700' }}>{ackDate}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Invoice Type</span>
                                            <div>
                                                <span style={{ display: 'inline-flex', padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#EEF2FF', color: '#4338CA', fontWeight: '800', fontSize: '0.75rem', marginTop: '0.15rem' }}>{data.invoice_type || 'B2B'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* IRN Reference Code */}
                                <div style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', padding: '0.85rem 1.25rem', borderRadius: '16px' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#4338CA', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Government Invoice Reference Number (IRN)</span>
                                    <strong style={{ fontSize: '0.78rem', color: '#3730A3', fontFamily: 'monospace', wordBreak: 'break-all' }}>{irnHash}</strong>
                                </div>

                                {/* Buyer & Seller Summary */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'white', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Seller details</span>
                                        <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block' }}>{sellerName}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>GSTIN: {sellerGstin}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>State: {sellerState}</span>
                                        {data.sender_product_name && (
                                            <span style={{ fontSize: '0.75rem', color: '#4F46E5', display: 'block', fontWeight: '700', marginTop: '0.25rem' }}>Product: {data.sender_product_name}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Buyer details</span>
                                        <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block' }}>{buyerName}</strong>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>GSTIN: {buyerGstin}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>State: {buyerState}</span>
                                        {data.receiver_product_name && (
                                            <span style={{ fontSize: '0.75rem', color: '#4F46E5', display: 'block', fontWeight: '700', marginTop: '0.25rem' }}>Product: {data.receiver_product_name}</span>
                                        )}
                                    </div>
                                </div>

                                {/* GST breakdown */}
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', margin: '0 0 0.85rem 0', textTransform: 'uppercase' }}>Tax Breakdown ({data.gst_percentage || 18}% GST)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                            <span>Taxable Sales Value:</span>
                                            <strong style={{ color: '#1F2937' }}>{formatCurrency(taxableSalesValue)}</strong>
                                        </div>
                                        {Number(data.cgst_amount) > 0 && (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                    <span>Central Tax (CGST):</span>
                                                    <strong style={{ color: '#1F2937' }}>{formatCurrency(data.cgst_amount)}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                    <span>State Tax (SGST):</span>
                                                    <strong style={{ color: '#1F2937' }}>{formatCurrency(data.sgst_amount)}</strong>
                                                </div>
                                            </>
                                        )}
                                        {Number(data.igst_amount) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                <span>Integrated Tax (IGST):</span>
                                                <strong style={{ color: '#1F2937' }}>{formatCurrency(data.igst_amount)}</strong>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem', marginBottom: '0.2rem' }}>
                                            <span>Total GST Amount Collected:</span>
                                            <strong style={{ color: '#4338CA' }}>{formatCurrency(totalGstAmount)}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                                            <strong style={{ color: '#111827' }}>Total Invoice Bill Amount:</strong>
                                            <strong style={{ color: '#047857', fontSize: '1.25rem' }}>{formatCurrency(totalInvoiceBillAmount)}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal actions */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedQrInvoice(null)}
                                        style={{ padding: '0.85rem', borderRadius: '14px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Close Preview
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handlePrintInvoice} 
                                        style={{ border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.85rem', borderRadius: '14px' }}
                                    >
                                        <Printer size={15} />
                                        Print Invoice
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleDownloadInvoicePdf} 
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.85rem', borderRadius: '14px', border: 'none', background: '#4338CA', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(67, 56, 202, 0.2)' }}
                                    >
                                        <Download size={15} />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* E-Way Bill Success Modal */}
            {successModalData && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '2rem'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '420px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: '1rem' }}>
                            Government e-Way Bill generated successfully.
                        </h3>

                        <div className="text-center space-y-2 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900">
                            e-Way Bill No: <span className="text-indigo-600">{successModalData?.ewayBillNo}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Valid Upto: {successModalData?.validUpto}
                          </p>
                          
                          {successModalData?.pdfUrl && (
                            <div className="pt-2">
                              <a
                                href={successModalData.pdfUrl.startsWith('http') ? successModalData.pdfUrl : `https://${successModalData.pdfUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <span>📄 View / Print Official PDF</span>
                              </a>
                            </div>
                          )}
                        </div>

                        <button 
                            type="button"
                            onClick={() => setSuccessModalData(null)}
                            style={{
                                width: '100%', padding: '0.85rem', marginTop: '1.5rem', borderRadius: '14px', border: 'none',
                                background: '#3B82F6', color: 'white', fontWeight: '800', fontSize: '1rem', cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessBilling;
