import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gstService, billingService, crmService } from '../services';
import FilterableTableHead from '../components/FilterableTableHead';
import { useCurrency } from '../context';
import { 
    PercentCircle, 
    Plus, 
    Search, 
    ArrowDownRight, 
    ArrowUpRight, 
    Truck, 
    FileText, 
    X, 
    CheckCircle2, 
    AlertTriangle, 
    User, 
    Activity, 
    Building, 
    Clock, 
    Zap, 
    QrCode, 
    RefreshCw, 
    Sliders,
    Award,
    Trash2
} from 'lucide-react';
import '../App.css';

const BusinessGST = () => {
    const { currency, formatCurrency } = useCurrency();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'gstr1';
    const setActiveTab = (tabId) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('tab', tabId);
            return next;
        });
    };
    const [colFilters, setColFilters] = React.useState({}); // 'gstr1', 'gstr2', 'gstr3b', 'gstr9', 'einvoice', 'eway'
    const [searchTerm, setSearchTerm] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
    const [selectedReconcile, setSelectedReconcile] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [locallyDeletedIds, setLocallyDeletedIds] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedQrInvoice, setSelectedQrInvoice] = useState(null);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbSalesInvoices = [] } = useQuery({
        queryKey: ['salesInvoices'],
        queryFn: () => billingService.getInvoices()
    });

    const { data: dbCustomersResponse = { data: [] } } = useQuery({
        queryKey: ['customers'],
        queryFn: () => crmService.getCustomers()
    });
    const dbCustomers = dbCustomersResponse?.data || [];

    // Queries
    const { data: dbInvoices = [] } = useQuery({
        queryKey: ['gstInvoices'],
        queryFn: () => gstService.getInvoices()
    });

    const { data: dbReconciliations = [] } = useQuery({
        queryKey: ['gstReconciliations'],
        queryFn: () => gstService.getReconciliations()
    });

    const { data: dbGstr3b = null } = useQuery({
        queryKey: ['gstr3bReport'],
        queryFn: () => gstService.getGSTR3B()
    });

    const { data: dbGstr9 = null } = useQuery({
        queryKey: ['gstr9Report'],
        queryFn: () => gstService.getGSTR9()
    });

    // Mutations
    const generateInvoiceMutation = useMutation({
        mutationFn: (data) => gstService.generateInvoice(data),
        onSuccess: (resData) => {
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['gstr3bReport'] });
            queryClient.invalidateQueries({ queryKey: ['gstr9Report'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setIsInvoiceModalOpen(false);
            setCustomerMode('existing');
            setSaveCustomerForFuture(false);
            
            const invoiceNo = resData.invoice_number || 'N/A';
            const status = resData.status || 'Generated';
            const irnVal = resData.irn || 'N/A';
            
            alert(
                `e-Invoice Generated Successfully\n\n` +
                `Invoice No : ${invoiceNo}\n` +
                `Status : ${status}\n` +
                `IRN : ${irnVal}\n` +
                `QR Code Generated`
            );
        },
        onError: (err, variables) => {
            const responseData = err?.response?.data || {};
            const message = responseData.message || responseData.error || err.message || 'Server error';
            
            console.error('========== E-INVOICE GENERATION FAILURE ==========');
            console.error('API URL: /api/v1/gst/einvoice');
            console.error('Request Payload:', variables);
            console.error('Exact Backend Response:', responseData);
            console.error('Network Status:', err?.response?.status || 'N/A');
            console.error('Error Object:', err);
            
            alert(`Failed to generate e-Invoice: ${message}`);
        }
    });

    const createEwayMutation = useMutation({
        mutationFn: (data) => gstService.createEway(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gstEways'] });
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            setIsEwayModalOpen(false);
            setEwayForm({
                invoice_number: '',
                invoice_date: new Date().toISOString().split('T')[0],
                transport_mode: 'Road',
                transporter_name: '',
                transporter_gstin: '',
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
            alert('Government e-Way Bill generated successfully.');
        }
    });

    const runReconciliationMutation = useMutation({
        mutationFn: (data) => gstService.runReconciliation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gstReconciliations'] });
            setIsReconcileModalOpen(false);
            alert('Supplier purchase entry reconciled successfully against GSTR-2B dashboard!');
        }
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: (id) => gstService.deleteInvoice(id),
        onMutate: (targetId) => {
            // 🚀 Immediate Native React UI repainting (0 milliseconds)
            setLocallyDeletedIds(prev => [...prev, String(targetId)]);
        },
        onSuccess: (_, deletedId) => {
            // Optimistic instant removal from local active cache layers:
            queryClient.setQueryData(['gstInvoices'], (old = []) => 
                Array.isArray(old) ? old.filter(item => String(item.id) !== String(deletedId)) : []
            );
            queryClient.setQueryData(['gstEways'], (old = []) => 
                Array.isArray(old) ? old.filter(item => String(item.id) !== String(deletedId)) : []
            );
            queryClient.setQueryData(['gstReconciliations'], (old = []) => 
                Array.isArray(old) ? old.filter(item => String(item.id) !== String(deletedId)) : []
            );
            
            // Quietly background re-sync and update related counts
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            queryClient.invalidateQueries({ queryKey: ['gstEways'] });
            queryClient.invalidateQueries({ queryKey: ['gstReconciliations'] });
            queryClient.invalidateQueries({ queryKey: ['gstr3bReport'] });
            queryClient.invalidateQueries({ queryKey: ['gstr9Report'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
        },
        onError: (err) => {
            console.error('[GST Deletion] Network error:', err);
            alert('Unable to reach billing network. Please retry.');
        }
    });

    // Queries
    const { data: dbSettings = {} } = useQuery({
        queryKey: ['gstSettings'],
        queryFn: () => gstService.getSettings()
    });

    // Business GST registration metadata
    const gstProfile = {
        gstin: dbSettings.gstin || '',
        legal_name: dbSettings.legal_name || '',
        business_type: dbSettings.business_type || '',
        place_of_business: dbSettings.place_of_business || '',
        state_code: dbSettings.state_code || ''
    };

    // fallbacks mapping
    const invoices = dbInvoices
        .filter(item => !locallyDeletedIds.includes(String(item.id)))
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
        irn_number: item.irn_number || '',
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

    const reconciliations = dbReconciliations
        .filter(item => !locallyDeletedIds.includes(String(item.id)))
        .map(item => ({
        id: item.id,
        vendor_gstin: item.vendor_gstin || '',
        vendor_name: item.vendor_name || '',
        invoice_number: item.invoice_number || 'N/A',
        invoice_date: item.invoice_date || (item.created_at ? item.created_at.split('T')[0] : 'N/A'),
        invoice_amount: parseFloat(item.amount || item.total_invoice || 0) || 0,
        taxable_value: parseFloat(item.taxable_value || 0),
        total_tax: parseFloat(item.total_tax || item.gst_amount || 0),
        input_cgst: parseFloat(item.cgst_amount || 0),
        input_sgst: parseFloat(item.sgst_amount || 0),
        input_igst: parseFloat(item.igst_amount || 0),
        eligible_itc: parseFloat(item.eligible_itc || 0),
        invoice_match_status: item.invoice_match_status || 'Pending',
        mismatch_reason: item.mismatch_reason || 'None',
        reconciliation_date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const { data: dbEways = [] } = useQuery({
        queryKey: ['gstEways'],
        queryFn: () => gstService.getEways()
    });

    const eways = dbEways
        .filter(item => !locallyDeletedIds.includes(String(item.id)))
        .map(item => ({
        id: item.id,
        eway_bill_number: item.eway_bill_number,
        transporter_name: item.transporter_name || '',
        vehicle_number: item.vehicle_number || '',
        transport_distance: parseInt(item.transport_distance) || 0,
        dispatch_location: item.dispatch_location || '',
        delivery_location: item.delivery_location || '',
        status: item.status || 'Active',
        reference_invoice: item.reference_invoice || '',
        transport_mode: item.transport_mode || '',
        transporter_gstin: item.transporter_gstin || ''
    }));

    // Form inputs states
    const [invoiceForm, setInvoiceForm] = useState({
        invoice_type: 'B2B',
        place_of_supply: '33-Tamil Nadu',
        taxable_value: '',
        gst_percentage: 12,
        reverse_charge: 'No',
        client_name: '',
        customer_gstin: '',
        export_under_lut: 'No',
        lut_document_path: '',
        lut_file_name: '',
        lut_uploaded_at: '',
        lut_uploaded_by: ''
    });

    const [isLutModalOpen, setIsLutModalOpen] = useState(false);
    const [customerMode, setCustomerMode] = useState('existing'); // 'existing' or 'manual'
    const [saveCustomerForFuture, setSaveCustomerForFuture] = useState(false);

    const [ewayForm, setEwayForm] = useState({
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        transport_mode: 'Road',
        transporter_name: '',
        transporter_gstin: '',
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

    const [reconcileForm, setReconcileForm] = useState({
        vendor_gstin: '',
        vendor_name: '',
        invoice_amount: '',
        gst_rate: 18,
        match_status: 'matched'
    });

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        
        // Validation check
        const errors = {};
        if (!invoiceForm.client_name || !invoiceForm.client_name.trim()) {
            errors.client_name = 'Customer Name is required.';
        }
        if (invoiceForm.invoice_type === 'B2B') {
            if (!invoiceForm.customer_gstin || !invoiceForm.customer_gstin.trim()) {
                errors.customer_gstin = 'Customer GSTIN is required for B2B invoices.';
            } else {
                const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
                if (!gstinRegex.test(invoiceForm.customer_gstin.trim())) {
                    errors.customer_gstin = 'Invalid GSTIN format (15-characters, e.g. 33ABCDE1234F1Z5).';
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
            } catch (err) {
                console.error('[Generate Invoice] Failed to save customer:', err);
            }
        }

        generateInvoiceMutation.mutate({
            invoice_type: invoiceForm.invoice_type,
            place_of_supply: invoiceForm.place_of_supply,
            taxable_value: parseFloat(invoiceForm.taxable_value) || 0,
            gst_percentage: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? 0 : (parseInt(invoiceForm.gst_percentage) || 12),
            reverse_charge: invoiceForm.reverse_charge,
            client_name: invoiceForm.client_name,
            customer_gstin: invoiceForm.customer_gstin,
            export_under_lut: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? 'true' : 'false',
            lut_document_path: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_document_path : '',
            lut_file_name: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_file_name : '',
            lut_uploaded_at: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_uploaded_at : '',
            lut_uploaded_by: invoiceForm.invoice_type === 'Export' && invoiceForm.export_under_lut === 'Yes' ? invoiceForm.lut_uploaded_by : ''
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
        if (ewayForm.transporter_gstin.trim()) {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(ewayForm.transporter_gstin.toUpperCase())) {
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

        // Validate goods details if no invoice is selected
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
            transporter_name: ewayForm.transporter_name,
            transporter_gstin: ewayForm.transporter_gstin,
            vehicle_number: ewayForm.transport_mode === 'Road' ? ewayForm.vehicle_number : '',
            transport_distance: parseInt(ewayForm.transport_distance),
            dispatch_location: ewayForm.dispatch_location,
            delivery_location: ewayForm.delivery_location
        };

        if (ewayForm.is_invoice_selected) {
            const taxVal = ewayForm.goods_items.reduce((sum, item) => sum + (parseFloat(item.price || item.rate || 0) * parseFloat(item.quantity || 0)), 0);
            const gstRate = parseFloat(ewayForm.goods_items[0]?.tax_rate || 18);
            const totalVal = ewayForm.goods_items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
            payload = {
                ...payload,
                goods_product_name: ewayForm.goods_items.map(i => i.description || i.product_name).join(', '),
                goods_hsn_code: ewayForm.goods_items.map(i => i.hsn_code || i.hsn).filter(Boolean).join(', '),
                goods_quantity: ewayForm.goods_items.reduce((sum, i) => sum + parseFloat(i.quantity || 0), 0),
                goods_unit: ewayForm.goods_items[0]?.unit || 'Pcs',
                goods_taxable_value: taxVal,
                goods_gst_rate: gstRate,
                goods_total_value: totalVal,
                items: ewayForm.goods_items
            };
        } else {
            const taxable = parseFloat(ewayForm.goods_taxable_value) || 0;
            const rate = parseFloat(ewayForm.goods_gst_rate || 18);
            const total = taxable * (1 + rate / 100);
            payload = {
                ...payload,
                goods_product_name: ewayForm.goods_product_name,
                goods_hsn_code: ewayForm.goods_hsn_code,
                goods_quantity: parseFloat(ewayForm.goods_quantity),
                goods_unit: ewayForm.goods_unit,
                goods_taxable_value: taxable,
                goods_gst_rate: rate,
                goods_total_value: total,
                items: [{
                    description: ewayForm.goods_product_name,
                    hsn_code: ewayForm.goods_hsn_code,
                    quantity: parseFloat(ewayForm.goods_quantity),
                    unit: ewayForm.goods_unit,
                    price: parseFloat(ewayForm.goods_quantity) > 0 ? (taxable / parseFloat(ewayForm.goods_quantity)) : taxable,
                    tax_rate: rate,
                    total: total
                }]
            };
        }

        createEwayMutation.mutate(payload);
    };

    const handleAddReconcile = (e) => {
        e.preventDefault();
        runReconciliationMutation.mutate({
            vendor_gstin: reconcileForm.vendor_gstin,
            vendor_name: reconcileForm.vendor_name,
            invoice_amount: parseFloat(reconcileForm.invoice_amount) || 0,
            gst_rate: parseInt(reconcileForm.gst_rate) || 18,
            match_status: reconcileForm.match_status
        });
    };

    const totalTaxableSales = invoices.reduce((sum, inv) => sum + inv.taxable_value, 0);
    const totalITCClaimable = reconciliations.filter(r => ['matched', 'verified'].includes(String(r.invoice_match_status).toLowerCase())).reduce((sum, r) => sum + r.eligible_itc, 0);
    const totalOutputGSTCollected = invoices.reduce((sum, inv) => sum + inv.total_tax, 0);
    const netTaxPayable = Math.max(0, totalOutputGSTCollected - totalITCClaimable);

    const filteredInvoices = invoices.filter(inv => 
        (inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.place_of_supply || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <PercentCircle size={18} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>GST & Tax Compliance</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Prepare returns, authenticate IRN e-Invoices, dispatch e-Way Bills, and reconcile purchase ITC.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsEwayModalOpen(true)}
                        className="crm-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'white', color: '#EC4899', border: '1px solid #FCE7F3', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    >
                        <Truck size={15} /> Generate e-Way Bill
                    </button>
                    <button 
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="crm-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                    >
                        <Plus size={15} /> Generate e-Invoice
                    </button>
                </div>
            </div>

            {/* Registration Metadata Alert */}
            <div style={{ background: 'white', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                        <Award size={18} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem', margin: 0 }}>Government GSTIN Registered</h4>
                        <p style={{ color: '#64748B', fontSize: '0.8rem', margin: 0 }}>Legal Name: {gstProfile.legal_name} | Type: {gstProfile.business_type}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '850', color: '#1D4ED8' }}>{gstProfile.gstin}</span>
                    <p style={{ color: '#64748B', fontSize: '0.75rem', margin: 0 }}>Place of Supply Code: {gstProfile.state_code} ({gstProfile.place_of_business})</p>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Output GST Collected', value: formatCurrency(totalOutputGSTCollected), icon: ArrowUpRight, color: '#EC4899', bg: '#FDF2F8' },
                    { label: 'Eligible ITC (Claimed GSTR-2B)', value: formatCurrency(totalITCClaimable), icon: ArrowDownRight, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Net GST Payable Liability', value: formatCurrency(netTaxPayable), icon: PercentCircle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Cumulative Taxable Sales', value: formatCurrency(totalTaxableSales), icon: FileText, color: '#3B82F6', bg: '#EFF6FF' }
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

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'gstr1', label: 'GSTR-1 (Sales)', icon: FileText, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'gstr2', label: 'GSTR-2 (Purchase)', icon: RefreshCw, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'gstr3b', label: 'GSTR-3B (Liability)', icon: PercentCircle, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'gstr9', label: 'GSTR-9 (Annual)', icon: Award, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' },
                    { id: 'einvoice', label: 'e-Invoice', icon: QrCode, gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', shadowColor: 'rgba(99, 102, 241, 0.15)' },
                    { id: 'eway', label: 'e-Way Logistics', icon: Truck, gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', shadowColor: 'rgba(16, 185, 129, 0.15)' }
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

            {/* Tab 1: GSTR-1 Outward Supplies */}
            {activeTab === 'gstr1' && (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '260px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search GST invoices or state..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.45rem 1rem 0.45rem 2.25rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'invoice_number', label: 'Invoice No', placeholder: 'e.g. INV-001' },
        { key: 'type', label: 'Type', placeholder: 'e.g. B2B' },
        { key: 'place_of_supply', label: 'Place of Supply', placeholder: 'State' },
        { key: 'taxable_value', label: 'Taxable Value', placeholder: 'e.g. 10000' },
        { key: 'cgst_sgst', label: 'CGST/SGST', placeholder: 'e.g. 900' },
        { key: 'igst', label: 'IGST', placeholder: 'e.g. 1800' },
        { key: 'total_gst', label: 'Total GST', placeholder: 'e.g. 1800' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Filed' },
        { key: '_actions', label: 'Actions', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredInvoices.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>{inv.invoice_number}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Date: {inv.date}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: '800', fontSize: '0.75rem' }}>{inv.invoice_type}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{inv.place_of_supply}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', color: '#1E293B', fontSize: '0.85rem' }}>{formatCurrency(inv.taxable_value)}</td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                                            {inv.cgst_amount > 0 ? `${formatCurrency(inv.cgst_amount)} + ${formatCurrency(inv.sgst_amount)}` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                                            {inv.igst_amount > 0 ? formatCurrency(inv.igst_amount) : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#1D4ED8', fontSize: '0.85rem' }}>{formatCurrency(inv.total_tax)} ({inv.gst_percentage}%)</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>READY</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                            {confirmingDeleteId === inv.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteInvoiceMutation.mutate(inv.id); setConfirmingDeleteId(null); }} 
                                                        style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '800' }}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} 
                                                        style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(inv.id); }}
                                                    style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', borderRadius: '6px' }}
                                                    className="hover-bg-red-50"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={15} />
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

            {/* Tab 2: Purchase Reconciliation (GSTR-2) */}
            {activeTab === 'gstr2' && (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>GSTR-2B Purchase ITC Reconciliations</h3>
                        <button onClick={() => setIsReconcileModalOpen(true)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: '#1D4ED8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>+ Verify Vendor Invoice</button>
                    </div>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Vendor GSTIN</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Vendor Name</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Invoice No</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Date</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Total Value</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>GST Amt</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>CGST/SGST/IGST</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Eligible ITC</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliations.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                                            No purchase invoices available for GSTR-2B reconciliation.
                                        </td>
                                    </tr>
                                ) : (
                                    reconciliations.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => (
                                        <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '750', color: '#1E293B', fontSize: '0.82rem' }}>{rec.vendor_gstin}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.82rem' }}>{rec.vendor_name}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: '700', color: '#1B6B3A' }}>{rec.invoice_number}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#64748B' }}>{rec.invoice_date}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#475569' }}>{formatCurrency(rec.invoice_amount)}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#475569' }}>{formatCurrency(rec.total_tax)}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.75rem', color: '#64748B' }}>
                                                {rec.input_igst > 0 ? `I: ${formatCurrency(rec.input_igst)}` : `C: ${formatCurrency(rec.input_cgst)} / S: ${formatCurrency(rec.input_sgst)}`}
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#1D4ED8', fontSize: '0.85rem' }}>{formatCurrency(rec.eligible_itc)}</td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.4rem', borderRadius: '6px',
                                                    background: rec.invoice_match_status === 'Verified' ? '#DCFCE7' : (rec.invoice_match_status === 'Rejected' ? '#FEE2E2' : '#F1F5F9'),
                                                    color: rec.invoice_match_status === 'Verified' ? '#15803D' : (rec.invoice_match_status === 'Rejected' ? '#B91C1C' : '#64748B'),
                                                    fontWeight: '850', fontSize: '0.72rem'
                                                }}>{rec.invoice_match_status.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={() => { setSelectedReconcile(rec); setIsReconcileModalOpen(true); }}
                                                        style={{ border: 'none', background: '#F1F5F9', color: '#1D4ED8', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '800' }}
                                                    >Verify</button>
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(rec.id); }}
                                                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2b: GSTR-3B Monthly Return Summary */}
            {activeTab === 'gstr3b' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {dbGstr3b && typeof dbGstr3b.outward_taxable !== 'undefined' ? (
                        <>
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', background: '#F3E8FF', color: '#6B21A8', fontWeight: '850', fontSize: '0.75rem' }}>GSTR-3B COMPLIANCE</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> Status: Verified</span>
                                        </div>
                                        <h2 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#0F172A', margin: '0.4rem 0 0.2rem 0' }}>Self-Declared Summary Return (Monthly)</h2>
                                        <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500', margin: 0 }}>Aggregate outward liabilities set off against eligible input tax credits.</p>
                                    </div>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(109,40,217,0.2)' }}>
                                        <FileText size={15} /> File GSTR-3B Now
                                    </button>
                                </div>

                                {/* Return Grid Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div style={{ border: '1px solid #F3E8FF', background: '#FAF5FF', borderRadius: '16px', padding: '1.25rem' }}>
                                        <h4 style={{ color: '#6B21A8', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Outward Taxable Supplies (Sales)</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Taxable Value:</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.outward_taxable || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Integrated Tax (IGST):</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.outward_igst || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>Central Tax (CGST):</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.outward_cgst || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: '600' }}>State Tax (SGST):</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.outward_sgst || 0)}</span></div>
                                            <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #E9D5FF', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: '#6B21A8', fontWeight: '800' }}>Total Liability:</span><span style={{ fontSize: '1rem', fontWeight: '900', color: '#6B21A8' }}>{formatCurrency(dbGstr3b?.total_output_tax || 0)}</span></div>
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #DCFCE7', background: '#F0FDF4', borderRadius: '16px', padding: '1.25rem' }}>
                                        <h4 style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Eligible Input Tax Credit (ITC)</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible IGST Available:</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.eligible_itc_igst || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible Central Tax (CGST):</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.eligible_itc_cgst || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Eligible State Tax (SGST):</span><span style={{ fontWeight: '800' }}>{formatCurrency(dbGstr3b?.eligible_itc_sgst || 0)}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>Ineligible/Blocked Credit:</span><span style={{ fontWeight: '800' }}>{formatCurrency(0)}</span></div>
                                            <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #BBF7D0', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: '800' }}>Total Claimable ITC:</span><span style={{ fontSize: '1rem', fontWeight: '900', color: '#15803D' }}>{formatCurrency(dbGstr3b?.total_eligible_itc || 0)}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Consolidated Liabilities Box */}
                                <div style={{ padding: '1.25rem', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2' }}>
                                    <h4 style={{ color: '#991B1B', fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', margin: '0 0 0.75rem 0', letterSpacing: '0.03em' }}>Final Net Tax Liability Payable (Cash Outflow)</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {[
                                            { label: 'Net IGST Payable', val: dbGstr3b?.net_payable_igst || 0 },
                                            { label: 'Net CGST Payable', val: dbGstr3b?.net_payable_cgst || 0 },
                                            { label: 'Net SGST Payable', val: dbGstr3b?.net_payable_sgst || 0 }
                                        ].map((card, ix) => (
                                            <div key={ix} style={{ background: 'white', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                                                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B', fontWeight: '800' }}>{card.label}</p>
                                                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '900', color: '#991B1B' }}>{formatCurrency(card.val)}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            Aggregating return summaries... If the service is temporarily unavailable, please verify connection.
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2c: GSTR-9 Consolidated Annual Return Summary */}
            {activeTab === 'gstr9' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {dbGstr9 && typeof dbGstr9.consolidated_turnover !== 'undefined' ? (
                        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                            
                            {/* Premium Top Ribbon Banner */}
                            <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', borderBottom: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Award size={16} color="#D97706" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '850', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Annual Tax Settlement Console</span>
                                    </div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#78350F', margin: '0.5rem 0 0.25rem 0', letterSpacing: '-0.02em' }}>GSTR-9 Annual Return ({dbGstr9?.fiscal_year || 'FY 2025-26'})</h2>
                                    <p style={{ fontSize: '0.82rem', color: '#B45309', fontWeight: '600', margin: 0 }}>Consolidated performance audit data aggregated from individual monthly cycles.</p>
                                </div>
                                <div style={{ background: 'white', border: '1px solid #FCD34D', padding: '0.75rem 1rem', borderRadius: '14px', boxShadow: '0 4px 6px rgba(217, 119, 6, 0.05)', textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>Filing Integrity</span>
                                    <div style={{ color: '#D97706', fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Zap size={16} /> 100% Reconciled
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                {/* Metrics Layout */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { label: 'Consolidated Annual Turnover', sub: 'Includes all exempt & B2B sales', val: dbGstr9?.consolidated_turnover || 0, color: '#3B82F6', bg: '#EFF6FF' },
                                        { label: 'Total Annual Tax Paid Outward', sub: 'Sum of IGST/CGST/SGST paid', val: dbGstr9?.total_tax_paid_outward || 0, color: '#EC4899', bg: '#FDF2F8' },
                                        { label: 'Cumulative ITC Availed (Annual)', sub: 'Verified Input Tax credit claims', val: dbGstr9?.total_itc_availed || 0, color: '#10B981', bg: '#ECFDF5' }
                                    ].map((box, k) => (
                                        <div key={k} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxSizing: 'border-box' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: '850', textTransform: 'uppercase', color: '#64748B', marginBottom: '0.25rem' }}>{box.label}</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0F172A', marginBottom: '0.4rem' }}>{formatCurrency(box.val)}</div>
                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '600' }}>{box.sub}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Activity size={18} color="#D97706" />
                                        <span style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: '750' }}>No annual gaps found between audited books & GSTR-9 summary drafts. All modules synced.</span>
                                    </div>
                                    <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'white', color: '#D97706', border: '1px solid #FCD34D', fontWeight: '850', fontSize: '0.78rem', cursor: 'pointer' }}>Download Audited Balance Sheet</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            Compiling annual GSTR-9 consolidated return data... If the service is temporarily unavailable, please verify backend connectivity.
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: e-Invoicing */}
            {activeTab === 'einvoice' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {invoices.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(inv => (
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

                            <p style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#64748B', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1rem', margin: 0 }}>
                                IRN: {inv.irn_number}
                            </p>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>Govt Tax Invoice Value:</span>
                                    <span style={{ fontSize: '1.15rem', fontWeight: '950', color: '#1D4ED8' }}>{formatCurrency(inv.taxable_value + inv.total_tax)}</span>
                                </div>
                                {confirmingDeleteId === inv.id ? (
                                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteInvoiceMutation.mutate(inv.id); setConfirmingDeleteId(null); }} 
                                            style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '800' }}
                                        >
                                            Delete?
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} 
                                            style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(inv.id); }}
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

            {/* Tab 4: e-Way Bills Logistics */}
            {activeTab === 'eway' && (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Government e-Way Bills Transport tracking</h3>
                        <button onClick={() => setIsEwayModalOpen(true)} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: '#1D4ED8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>+ Dispatch New Bill</button>
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
                                {eways.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((ew) => (
                                    <tr key={ew.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', fontSize: '0.85rem', color: '#0F172A' }}>{ew.eway_bill_number}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem' }}>{ew.transporter_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>{ew.vehicle_number}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', fontSize: '0.85rem', color: '#1D4ED8' }}>{ew.transport_distance} Kms</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>{ew.dispatch_location} ➔ {ew.delivery_location}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#E6F4EA', color: '#137333', fontWeight: '800', fontSize: '0.75rem' }}>{ew.status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                            {confirmingDeleteId === ew.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteInvoiceMutation.mutate(ew.id); setConfirmingDeleteId(null); }} 
                                                        style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '800' }}
                                                    >
                                                        Delete
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }} 
                                                        style={{ border: '1px solid #E2E8F0', background: 'white', color: '#64748B', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: '600' }}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(ew.id); }}
                                                    style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={15} />
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

            {/* Generate e-Invoice Modal */}
            {isInvoiceModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Generate GST e-Invoice</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleGenerateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Sender (From) Section */}
                            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginTop: 0, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sender (From)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#0F172A' }}>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>Company Name:</span> <span style={{ fontWeight: '750' }}>{gstProfile.legal_name || 'Saravana Stores Pvt Ltd'}</span></div>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>GSTIN:</span> <span style={{ fontWeight: '750', fontFamily: 'monospace' }}>{gstProfile.gstin || '33ABCDE1234F1Z5'}</span></div>
                                    <div><span style={{ color: '#64748B', fontWeight: '600' }}>State:</span> <span style={{ fontWeight: '750' }}>{gstProfile.place_of_business || 'Tamil Nadu'}</span></div>
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
                                                    const customer = dbCustomers.find(c => c.name === selectedName);
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
                                                {dbCustomers.map(cust => (
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
                                                onChange={(e) => setInvoiceForm({ ...invoiceForm, customer_gstin: e.target.value })} 
                                                placeholder="Enter GSTIN"
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
                                                <option value="33-Tamil Nadu">33 - Tamil Nadu</option>
                                                <option value="27-Maharashtra">27 - Maharashtra</option>
                                                <option value="29-Karnataka">29 - Karnataka</option>
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
                                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#065F46', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
                                disabled={generateInvoiceMutation.isPending}
                                style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: generateInvoiceMutation.isPending ? 'not-allowed' : 'pointer', opacity: generateInvoiceMutation.isPending ? 0.7 : 1, boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}
                            >
                                {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate / Authenticate e-Invoice'}
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
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>AUTO-FILL FROM SALES INVOICE (OPTIONAL)</label>
                                <select 
                                    value={ewayForm.is_invoice_selected ? dbSalesInvoices.find(inv => inv.invoice_number === ewayForm.invoice_number)?.id || '' : ''} 
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
                                        const selected = dbSalesInvoices.find(inv => String(inv.id) === e.target.value);
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
                                    {dbSalesInvoices.map(inv => (
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
                                    <input required type="text" value={ewayForm.transporter_name} onChange={(e) => setEwayForm({ ...ewayForm, transporter_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.transporter_name ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="Bluedart Cargo" />
                                    {validationErrors.transporter_name && <span style={{ color: '#EF4444', fontSize: '0.7rem', fontWeight: '750', marginTop: '0.2rem', display: 'block' }}>{validationErrors.transporter_name}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>TRANSPORTER GSTIN (OPTIONAL)</label>
                                    <input type="text" value={ewayForm.transporter_gstin} onChange={(e) => setEwayForm({ ...ewayForm, transporter_gstin: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: validationErrors.transporter_gstin ? '1px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} placeholder="27AAAAA1111A1Z1" />
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

            {/* Verify Vendor Invoice Modal */}
            {isReconcileModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Verify Vendor Invoice</h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>GSTR-2B ITC Reconciliation</p>
                            </div>
                            <button onClick={() => { setIsReconcileModalOpen(false); setSelectedReconcile(null); }} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        {selectedReconcile ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Vendor Name:</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>{selectedReconcile.vendor_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Vendor GSTIN:</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B', fontFamily: 'monospace' }}>{selectedReconcile.vendor_gstin}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Invoice Number:</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1B6B3A' }}>{selectedReconcile.invoice_number}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Invoice Date:</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>{selectedReconcile.invoice_date}</span>
                                    </div>
                                    <div style={{ height: '1px', background: '#E2E8F0', margin: '0.25rem 0' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Invoice Value:</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1E293B' }}>{formatCurrency(selectedReconcile.invoice_amount)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>GST Amount:</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#1B6B3A' }}>{formatCurrency(selectedReconcile.total_tax)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Eligible ITC:</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '950', color: '#1D4ED8' }}>{formatCurrency(selectedReconcile.eligible_itc)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Status:</span>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontWeight: '850', fontSize: '0.7rem' }}>
                                            {selectedReconcile.invoice_match_status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            runReconciliationMutation.mutate({ ...selectedReconcile, match_status: 'Verified', id: selectedReconcile.id });
                                            setIsReconcileModalOpen(false);
                                            setSelectedReconcile(null);
                                        }}
                                        style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27, 107, 58, 0.2)' }}
                                    >
                                        Verify Invoice
                                    </button>
                                    <button
                                        onClick={() => {
                                            runReconciliationMutation.mutate({ ...selectedReconcile, match_status: 'Rejected', id: selectedReconcile.id });
                                            setIsReconcileModalOpen(false);
                                            setSelectedReconcile(null);
                                        }}
                                        style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
                                    >
                                        Reject
                                    </button>
                                </div>
                                <button
                                    onClick={() => { setIsReconcileModalOpen(false); setSelectedReconcile(null); }}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'white', color: '#64748B', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Vendor GSTIN</label>
                                        <input required type="text" value={reconcileForm.vendor_gstin} onChange={(e) => setReconcileForm({ ...reconcileForm, vendor_gstin: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="27AAAAA1111A1Z1" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Vendor Name</label>
                                        <input required type="text" value={reconcileForm.vendor_name} onChange={(e) => setReconcileForm({ ...reconcileForm, vendor_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Acme Hardwares" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Total Amount ({currency.code})</label>
                                    <input required type="number" value={reconcileForm.invoice_amount} onChange={(e) => setReconcileForm({ ...reconcileForm, invoice_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GST Rate %</label>
                                        <select value={reconcileForm.gst_rate} onChange={(e) => setReconcileForm({ ...reconcileForm, gst_rate: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                            <option value="5">5% GST</option>
                                            <option value="12">12% GST</option>
                                            <option value="18">18% GST</option>
                                            <option value="28">28% GST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Match GSTR-2B</label>
                                        <select value={reconcileForm.match_status} onChange={(e) => setReconcileForm({ ...reconcileForm, match_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                            <option value="Pending">PENDING</option>
                                            <option value="Verified">VERIFIED (Matched)</option>
                                            <option value="Rejected">REJECTED (Error)</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" disabled={runReconciliationMutation.isPending} style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: runReconciliationMutation.isPending ? 'not-allowed' : 'pointer', opacity: runReconciliationMutation.isPending ? 0.7 : 1, boxShadow: '0 6px 12px rgba(29, 78, 216, 0.15)' }}>
                                    {runReconciliationMutation.isPending ? 'Settling Reconciliation...' : 'Settle Reconciliation Status'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Government e-Invoice QR Code & Details Modal */}
            {selectedQrInvoice && (
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
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/public/invoice/' + selectedQrInvoice.id)}`}
                                    alt="Authenticated QR Code"
                                    style={{ background: 'white', padding: '0.4rem', border: '1px solid #E2E8F0', borderRadius: '12px', width: '130px', height: '130px' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Invoice Number</span>
                                        <strong style={{ display: 'block', fontSize: '1rem', color: '#0F172A' }}>{selectedQrInvoice.invoice_number}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Date Generated</span>
                                        <span style={{ display: 'block', fontSize: '0.85rem', color: '#334155', fontWeight: '700' }}>{selectedQrInvoice.date}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Invoice Type</span>
                                        <span style={{ display: 'inline-flex', padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#EEF2FF', color: '#4338CA', fontWeight: '800', fontSize: '0.75rem', marginTop: '0.15rem' }}>{selectedQrInvoice.invoice_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* IRN Reference Code */}
                            <div style={{ background: '#EEF2FF', border: '1px solid #E0E7FF', padding: '0.85rem 1.25rem', borderRadius: '16px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#4338CA', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Government Invoice Reference Number (IRN)</span>
                                <strong style={{ fontSize: '0.78rem', color: '#3730A3', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedQrInvoice.irn_number || 'N/A'}</strong>
                            </div>

                            {/* Buyer & Seller Summary */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'white', border: '1px solid #E2E8F0', padding: '1.25rem', borderRadius: '20px' }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Seller details</span>
                                    <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block' }}>{selectedQrInvoice.sender_name}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>GSTIN: {selectedQrInvoice.sender_gstin}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>State: {selectedQrInvoice.sender_state}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Buyer details</span>
                                    <strong style={{ fontSize: '0.85rem', color: '#1E293B', display: 'block' }}>{selectedQrInvoice.customer_name}</strong>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.1rem' }}>GSTIN: {selectedQrInvoice.customer_gstin}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Supply Place: {selectedQrInvoice.customer_state}</span>
                                </div>
                            </div>

                            {/* GST breakdown */}
                            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', margin: '0 0 0.85rem 0', textTransform: 'uppercase' }}>Tax Breakdown ({selectedQrInvoice.gst_percentage}% GST)</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                        <span>Taxable Sales Value (Exclusive):</span>
                                        <strong style={{ color: '#1F2937' }}>{formatCurrency(selectedQrInvoice.taxable_value)}</strong>
                                    </div>
                                    {selectedQrInvoice.cgst_amount > 0 && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                <span>Central Tax (CGST):</span>
                                                <strong style={{ color: '#1F2937' }}>{formatCurrency(selectedQrInvoice.cgst_amount)}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                <span>State Tax (SGST):</span>
                                                <strong style={{ color: '#1F2937' }}>{formatCurrency(selectedQrInvoice.sgst_amount)}</strong>
                                            </div>
                                        </>
                                    )}
                                    {selectedQrInvoice.igst_amount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                            <span>Integrated Tax (IGST):</span>
                                            <strong style={{ color: '#1F2937' }}>{formatCurrency(selectedQrInvoice.igst_amount)}</strong>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.6rem', marginBottom: '0.2rem' }}>
                                        <span>Total GST Amount Collected:</span>
                                        <strong style={{ color: '#4338CA' }}>{formatCurrency(selectedQrInvoice.total_tax)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                                        <strong style={{ color: '#111827' }}>Total Invoice Bill Amount:</strong>
                                        <strong style={{ color: '#047857', fontSize: '1.25rem' }}>{formatCurrency(selectedQrInvoice.taxable_value + selectedQrInvoice.total_tax)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Modal actions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button 
                                    onClick={() => setSelectedQrInvoice(null)}
                                    style={{ padding: '0.85rem', borderRadius: '14px', background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: '750', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Close Preview
                                </button>
                                <a 
                                    href={`${window.location.origin}/public/invoice/${selectedQrInvoice.id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.85rem', borderRadius: '14px', border: '1px solid #CBD5E1', background: 'white', color: '#475569', fontWeight: '750', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    Print Invoice
                                </a>
                                <a 
                                    href={`${window.location.origin}/public/invoice/${selectedQrInvoice.id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.85rem', borderRadius: '14px', border: 'none', background: '#4338CA', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(67, 56, 202, 0.2)' }}
                                >
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default BusinessGST;
