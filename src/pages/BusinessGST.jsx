import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gstService, billingService, crmService, inventoryService, complianceService, profileService } from '../services';
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
    Trash2,
    Download,
    Eye,
    Printer
} from 'lucide-react';
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
    const [selectedFY, setSelectedFY] = useState('2024-25');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [locallyDeletedIds, setLocallyDeletedIds] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedQrInvoice, setSelectedQrInvoice] = useState(null);
    const [ewayBills, setEwayBills] = useState([]);
    const [customerList, setCustomerList] = useState([]);
    const [successModalData, setSuccessModalData] = useState(null);

    const queryClient = useQueryClient();

    // Fetch existing customers on component / modal mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await crmService.getCustomers();
                const list = Array.isArray(res) 
                    ? res 
                    : (Array.isArray(res?.data) 
                        ? res.data 
                        : (Array.isArray(res?.customers) 
                            ? res.customers 
                            : []));
                setCustomerList(list);
            } catch (err) {
                console.error('[BusinessGST] Failed to fetch customerList:', err);
            }
        };
        fetchCustomers();
    }, [isInvoiceModalOpen]);

    // Queries
    const { data: dbSalesInvoices = [] } = useQuery({
        queryKey: ['salesInvoices'],
        queryFn: () => billingService.getInvoices()
    });

    const { data: dbInventory = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => inventoryService.getInventory()
    });

    const { data: dbCustomersResponse = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => crmService.getCustomers()
    });
    const dbCustomers = customerList.length > 0 
        ? customerList 
        : (Array.isArray(dbCustomersResponse) 
            ? dbCustomersResponse 
            : (Array.isArray(dbCustomersResponse?.data) 
                ? dbCustomersResponse.data 
                : []));

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
        queryKey: ['gstr9Report', selectedFY],
        queryFn: () => gstService.getGSTR9(selectedFY)
    });

    // Mutations
    const generateInvoiceMutation = useMutation({
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

            // Immediately hydrate React Query cache so the table immediately shows the invoice
            queryClient.setQueryData(['gstInvoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);
            queryClient.setQueryData(['invoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);
            queryClient.setQueryData(['salesInvoices'], (old = []) => [newRecord, ...(Array.isArray(old) ? old : [])]);

            // Background invalidate queries to sync DB
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
            
            // Hydrate and immediately open the Government e-Invoice Portal preview modal
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
            
            console.error('========== E-INVOICE GENERATION FAILURE ==========');
            console.error('API URL: /api/v1/compliance/generate-einvoice');
            console.error('Request Payload:', variables);
            console.error('Exact Backend Response:', responseData);
            console.error('Network Status:', err?.response?.status || 'N/A');
            console.error('Error Object:', err);
            
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

    const { data: businessProfileRaw } = useQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getProfile()
    });
    const businessProfile = businessProfileRaw?.data || businessProfileRaw;

    const activeProfile = businessProfile || JSON.parse(localStorage.getItem('cliks_org_profile') || localStorage.getItem('cliks_business_config') || '{}');

    const defaultSender = {
      legal_name: activeProfile.business_name || activeProfile.legal_name || activeProfile.companyName || "Welton Consignor",
      gstin: activeProfile.gstin || activeProfile.gstinRef || "05AAAPG7885R002",
      state: activeProfile.state_registered || activeProfile.stateRegistered || "Uttarakhand",
      state_code: (activeProfile.gstin ? activeProfile.gstin.slice(0, 2) : (activeProfile.gstinRef ? activeProfile.gstinRef.slice(0, 2) : "05")),
      address: activeProfile.address || activeProfile.registeredAddress || "Dehradun Central Road",
      location: activeProfile.city || (activeProfile.address ? activeProfile.address.split(',')[0]?.trim() : "Dehradun") || "Dehradun",
      pincode: activeProfile.pincode || 248001
    };

    // Business GST registration metadata
    const gstProfile = {
        gstin: defaultSender.gstin,
        legal_name: defaultSender.legal_name,
        business_type: dbSettings.business_type || 'Private Limited',
        place_of_business: defaultSender.state,
        state_code: defaultSender.state_code
    };

    // fallbacks mapping
    const invoices = (Array.isArray(dbInvoices) ? dbInvoices : [])
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

    const reconciliations = (Array.isArray(dbReconciliations) ? dbReconciliations : [])
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
    const eways = combinedEways
        .filter(item => {
            if (!item) return false;
            const idKey = String(item.id || '');
            if (locallyDeletedIds.includes(idKey)) return false;
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

    // Form inputs states
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

    const [isLutModalOpen, setIsLutModalOpen] = useState(false);
    const [customerMode, setCustomerMode] = useState('existing'); // 'existing' or 'manual'
    const [saveCustomerForFuture, setSaveCustomerForFuture] = useState(false);

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
            } catch (err) {
                console.error('[Generate Invoice] Failed to save customer:', err);
            }
        }

        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        const generatedDocNumber = `CLK-INV-${Math.floor(1000 + Math.random() * 9000)}`;

        generateInvoiceMutation.mutate({
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
    const totalCGST = invoices.reduce((sum, inv) => sum + (inv.cgst_amount || 0), 0);
    const totalSGST = invoices.reduce((sum, inv) => sum + (inv.sgst_amount || 0), 0);
    const totalIGST = invoices.reduce((sum, inv) => sum + (inv.igst_amount || 0), 0);
    const countB2B = invoices.filter(inv => inv.invoice_type === 'B2B').length;
    const countB2C = invoices.filter(inv => inv.invoice_type === 'B2C').length;
    const countExport = invoices.filter(inv => inv.invoice_type === 'Export').length;
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
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Prepare returns, authenticate tax records, and reconcile purchase ITC.</p>
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
                {activeTab === 'gstr1' ? (
                    <>
                        {[
                            { label: 'Total Taxable Sales', value: formatCurrency(totalTaxableSales), icon: FileText, color: '#3B82F6', bg: '#EFF6FF' },
                            { label: 'Total Output GST', value: formatCurrency(totalOutputGSTCollected), icon: ArrowUpRight, color: '#EC4899', bg: '#FDF2F8' },
                            { label: 'Total IGST', value: formatCurrency(totalIGST), icon: Zap, color: '#8B5CF6', bg: '#F5F3FF' },
                            { label: 'Total CGST + SGST', value: formatCurrency(totalCGST + totalSGST), icon: PercentCircle, color: '#10B981', bg: '#ECFDF5' },
                            { label: 'B2B Invoices', value: countB2B, icon: Building, color: '#6366F1', bg: '#EEF2FF' },
                            { label: 'B2C Invoices', value: countB2C, icon: User, color: '#F59E0B', bg: '#FFFBEB' },
                            { label: 'Export Invoices', value: countExport, icon: Truck, color: '#14B8A6', bg: '#F0FDFA' },
                            { label: 'Total Count', value: invoices.length, icon: Activity, color: '#64748B', bg: '#F8FAFC' }
                        ].map((stat, idx) => (
                            <div key={idx} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', cursor: 'default' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                    <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{stat.label}</p>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{stat.value}</h3>
                                </div>
                                <div style={{ width: '40px', height: '42px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                                    <stat.icon size={18} />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    [
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
                    ))
                )}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                    { id: 'gstr1', label: 'GSTR-1 (Sales)', icon: FileText, gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', shadowColor: 'rgba(236, 72, 153, 0.15)' },
                    { id: 'gstr2', label: 'GSTR-2 (Purchase)', icon: RefreshCw, gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', shadowColor: 'rgba(59, 130, 246, 0.15)' },
                    { id: 'gstr3b', label: 'GSTR-3B (Liability)', icon: PercentCircle, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', shadowColor: 'rgba(139, 92, 246, 0.15)' },
                    { id: 'gstr9', label: 'GSTR-9 (Annual)', icon: Award, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', shadowColor: 'rgba(245, 158, 11, 0.15)' }
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
                                { key: 'customer_name', label: 'Customer', placeholder: 'Name' },
                                { key: 'customer_gstin', label: 'GSTIN', placeholder: 'GSTIN' },
                                { key: 'type', label: 'Type', placeholder: 'B2B/B2C' },
                                { key: 'place_of_supply', label: 'Place of Supply', placeholder: 'State' },
                                { key: 'taxable_value', label: 'Taxable Value', placeholder: 'e.g. 10000' },
                                { key: 'cgst_sgst', label: 'CGST/SGST', placeholder: 'e.g. 900' },
                                { key: 'igst', label: 'IGST', placeholder: 'e.g. 1800' },
                                { key: 'total_gst', label: 'Total GST', placeholder: 'e.g. 1800' },
                                { key: 'status', label: 'Status', placeholder: 'e.g. Filed' },
                                { key: '_actions', label: 'Actions', noFilter: true }
                            ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" style={{ padding: '3rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                                    <FileText size={24} />
                                                </div>
                                                <p style={{ color: '#64748B', fontWeight: '600', margin: 0 }}>No GST sales invoices found for the selected period.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((inv) => (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>{inv.invoice_number}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{inv.date}</span>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <p style={{ fontWeight: '750', color: '#1E293B', fontSize: '0.82rem', margin: 0 }}>{inv.customer_name}</p>
                                                <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{inv.customer_gstin}</span>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>{inv.customer_gstin}</td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: inv.invoice_type === 'B2B' ? '#EFF6FF' : '#F5F3FF', color: inv.invoice_type === 'B2B' ? '#1D4ED8' : '#8B5CF6', fontWeight: '800', fontSize: '0.72rem' }}>{inv.invoice_type}</span>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: '#475569', fontSize: '0.82rem' }}>{inv.place_of_supply}</td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '750', color: '#1E293B', fontSize: '0.82rem' }}>{formatCurrency(inv.taxable_value)}</td>
                                            <td style={{ padding: '0.6rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                                                {inv.cgst_amount > 0 ? `${formatCurrency(inv.cgst_amount)} + ${formatCurrency(inv.sgst_amount)}` : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                                                {inv.igst_amount > 0 ? formatCurrency(inv.igst_amount) : '—'}
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', fontWeight: '850', color: '#1D4ED8', fontSize: '0.82rem' }}>{formatCurrency(inv.total_tax)}</td>
                                            <td style={{ padding: '0.6rem 1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ padding: '0.15rem 0.4rem', borderRadius: '5px', background: '#E6F4EA', color: '#137333', fontWeight: '850', fontSize: '0.65rem', textAlign: 'center' }}>READY</span>
                                                    {inv.irn_number && <span style={{ fontSize: '0.6rem', color: '#047857', fontWeight: '700' }}>IRN Generated</span>}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                                    {inv.irn_number && (
                                                        <button
                                                            onClick={() => setSelectedQrInvoice(inv)}
                                                            style={{ border: 'none', background: '#EFF6FF', color: '#1D4ED8', padding: '0.3rem', borderRadius: '6px', cursor: 'pointer' }}
                                                            title="View e-Invoice Details"
                                                        >
                                                            <QrCode size={14} />
                                                        </button>
                                                    )}
                                                    {confirmingDeleteId === inv.id ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteInvoiceMutation.mutate(inv.id); setConfirmingDeleteId(null); }}
                                                            style={{ border: 'none', background: '#EF4444', color: 'white', padding: '0.25rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '800' }}
                                                        >Del</button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(inv.id); }}
                                                            style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                                                        >
                                                            <Trash2 size={14} />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* FY Selector and Header */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>GSTR-9 Annual Return</h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>Financial Year Summary & Reconciliation</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select
                                value={selectedFY}
                                onChange={(e) => setSelectedFY(e.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#0F172A', outline: 'none' }}
                            >
                                <option value="2023-24">FY 2023–24</option>
                                <option value="2024-25">FY 2024–25</option>
                                <option value="2025-26">FY 2025–26</option>
                            </select>
                            <button style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#0F172A', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Export Annual PDF
                            </button>
                        </div>
                    </div>

                    {dbGstr9 && (dbGstr9.summary?.total_taxable_sales > 0 || dbGstr9.summary?.total_taxable_purchases > 0) ? (
                        <>
                            {/* Annual Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {[
                                    { label: 'Total Taxable Sales', val: dbGstr9.summary.total_taxable_sales, icon: ArrowUpRight, color: '#EC4899', bg: '#FDF2F8' },
                                    { label: 'Total Taxable Purchases', val: dbGstr9.summary.total_taxable_purchases, icon: ArrowDownRight, color: '#3B82F6', bg: '#EFF6FF' },
                                    { label: 'Output GST Collected', val: dbGstr9.summary.total_output_gst, icon: PercentCircle, color: '#8B5CF6', bg: '#F5F3FF' },
                                    { label: 'Eligible ITC Claimed', val: dbGstr9.summary.total_itc_availed, icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' }
                                ].map((stat, idx) => (
                                    <div key={idx} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>{stat.label}</p>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>{formatCurrency(stat.val)}</h3>
                                        </div>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                {/* Annual GST Summary Table */}
                                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>Annual Statutory Summary</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {[
                                                { label: 'Total Taxable Sales (Outward)', val: dbGstr9.summary.total_taxable_sales },
                                                { label: 'Exempt / Nil Rated Sales', val: dbGstr9.summary.exempt_sales },
                                                { label: 'Zero Rated / Export Sales', val: dbGstr9.summary.export_sales },
                                                { label: 'Total Taxable Purchases (Inward)', val: dbGstr9.summary.total_taxable_purchases },
                                                { label: 'Total Eligible ITC Availed', val: dbGstr9.summary.total_itc_availed },
                                                { label: 'Total Output Tax Liability', val: dbGstr9.summary.total_output_gst, bold: true, color: '#6B21A8' },
                                                { label: 'Net GST Paid (Cash Ledger)', val: dbGstr9.summary.net_gst_paid, bold: true, color: '#059669' }
                                            ].map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                    <td style={{ padding: '0.85rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: row.bold ? '800' : '500' }}>{row.label}</td>
                                                    <td style={{ padding: '0.85rem 0', textAlign: 'right', fontSize: '1rem', fontWeight: row.bold ? '900' : '750', color: row.color || '#0F172A' }}>{formatCurrency(row.val)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Annual Reconciliation */}
                                <div style={{ background: '#FAF5FF', borderRadius: '20px', border: '1px solid #E9D5FF', padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#6B21A8', marginBottom: '1.25rem', borderBottom: '1px solid #F3E8FF', paddingBottom: '0.75rem' }}>Annual Reconciliation</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #F3E8FF' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6B21A8', textTransform: 'uppercase' }}>Difference in Sales (Books vs Returns)</span>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                <span style={{ fontWeight: '900', color: '#0F172A' }}>{formatCurrency(0)}</span>
                                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', fontSize: '0.65rem', fontWeight: '850' }}>MATCHED</span>
                                            </div>
                                        </div>
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #F3E8FF' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6B21A8', textTransform: 'uppercase' }}>Difference in ITC (GSTR-2B vs 3B)</span>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                <span style={{ fontWeight: '900', color: '#0F172A' }}>{formatCurrency(0)}</span>
                                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: '#DCFCE7', color: '#15803D', fontSize: '0.65rem', fontWeight: '850' }}>MATCHED</span>
                                            </div>
                                        </div>
                                        <div style={{ background: '#FFF7ED', padding: '1rem', borderRadius: '12px', border: '1px solid #FFEDD5' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase' }}>Late Filing Interests / Penalties</span>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                <span style={{ fontWeight: '900', color: '#9A3412' }}>{formatCurrency(0)}</span>
                                                <span style={{ color: '#C2410C', fontSize: '0.65rem', fontWeight: '800' }}>NONE DUE</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', borderRadius: '12px', border: 'none', background: '#6B21A8', color: 'white', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(107,33,168,0.2)' }}>
                                        Generate GSTR-9C Reconciliation
                                    </button>
                                </div>
                            </div>

                            {/* Monthly Filing Summary Table */}
                            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Monthly Filing History Breakdown</h3>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                            <tr>
                                                <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Month</th>
                                                <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Taxable Sales</th>
                                                <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Output GST</th>
                                                <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Eligible ITC</th>
                                                <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GST Paid</th>
                                                <th style={{ padding: '0.85rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GSTR-1</th>
                                                <th style={{ padding: '0.85rem 1.5rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GSTR-3B</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dbGstr9.monthly_filings.map((m, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                                    <td style={{ padding: '0.85rem 1.5rem', fontSize: '0.85rem', fontWeight: '750', color: '#1E293B' }}>{m.month}</td>
                                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{formatCurrency(m.sales)}</td>
                                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#6B21A8', fontWeight: '750' }}>{formatCurrency(m.output_gst)}</td>
                                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#15803D', fontWeight: '750' }}>{formatCurrency(m.itc)}</td>
                                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#991B1B', fontWeight: '800' }}>{formatCurrency(m.gst_paid)}</td>
                                                    <td style={{ padding: '0.85rem 1rem' }}>
                                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: m.gstr1_status === 'Filed' ? '#DCFCE7' : '#F1F5F9', color: m.gstr1_status === 'Filed' ? '#15803D' : '#64748B', fontSize: '0.7rem', fontWeight: '850' }}>
                                                            {m.gstr1_status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.85rem 1.5rem' }}>
                                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: m.gstr3b_status === 'Filed' ? '#DCFCE7' : '#F1F5F9', color: m.gstr3b_status === 'Filed' ? '#15803D' : '#64748B', fontSize: '0.7rem', fontWeight: '850' }}>
                                                            {m.gstr3b_status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                <Award size={32} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', color: '#1E293B' }}>No annual GST data found for {selectedFY}</h3>
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#64748B', fontWeight: '500', maxWidth: '450px', lineHeight: '1.5' }}>
                                    Create sales invoices and purchase bills for the selected financial year to automatically generate your GSTR-9 Annual Return and statutory summaries.
                                </p>
                            </div>
                        </div>
                    )}
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

            </div>
        </div>
    );
};

export default BusinessGST;
