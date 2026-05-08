import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gstService } from '../services';
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
    Award
} from 'lucide-react';
import '../App.css';

const BusinessGST = () => {
    const [activeTab, setActiveTab] = useState('returns'); // 'returns', 'itc', 'einvoice', 'eway'
    const [searchTerm, setSearchTerm] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Queries
    const { data: dbInvoices = [] } = useQuery({
        queryKey: ['gstInvoices'],
        queryFn: () => gstService.getInvoices()
    });

    const { data: dbReconciliations = [] } = useQuery({
        queryKey: ['gstReconciliations'],
        queryFn: () => gstService.getReconciliations()
    });

    // Mutations
    const generateInvoiceMutation = useMutation({
        mutationFn: (data) => gstService.generateInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            setIsInvoiceModalOpen(false);
            alert('Tax Invoice successfully validated! Government e-Invoice IRN & QR generated dynamically.');
        }
    });

    const createEwayMutation = useMutation({
        mutationFn: (data) => gstService.createEway(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gstInvoices'] });
            setIsEwayModalOpen(false);
            alert('e-Way Bill successfully authenticated with National Transport NIC Portal!');
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

    // Business GST registration metadata
    const [gstProfile] = useState({
        gstin: '27ABCDE1234F1Z5',
        legal_name: 'CLIKS Digital Services Pvt. Ltd.',
        business_type: 'Regular Taxpayer',
        place_of_business: 'Mumbai HQ, Maharashtra',
        state_code: '27'
    });

    // fallbacks mapping
    const invoices = dbInvoices.length > 0 ? dbInvoices.map(item => ({
        gst_invoice_number: item.invoice_number,
        invoice_type: item.invoice_type || 'B2B',
        date: (item.created_at || '').split('T')[0] || '2026-05-08',
        place_of_supply: item.place_of_supply || '27-Maharashtra',
        taxable_value: parseFloat(item.taxable_value) || 100000,
        gst_percentage: parseFloat(item.gst_percentage) || 18,
        cgst_amount: parseFloat(item.cgst_amount) || 9000,
        sgst_amount: parseFloat(item.sgst_amount) || 9000,
        igst_amount: parseFloat(item.igst_amount) || 0,
        total_tax: parseFloat(item.total_tax) || 18000,
        reverse_charge: item.reverse_charge || 'No',
        irn_number: item.irn_number || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        qr_status: item.qr_status || 'Generated'
    })) : [
        {
            gst_invoice_number: 'GST-2026-104',
            invoice_type: 'B2B',
            date: '2026-05-02',
            place_of_supply: '27-Maharashtra',
            taxable_value: 100000,
            gst_percentage: 18,
            cgst_amount: 9000,
            sgst_amount: 9000,
            igst_amount: 0,
            total_tax: 18000,
            reverse_charge: 'No',
            irn_number: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
            qr_status: 'Generated'
        },
        {
            gst_invoice_number: 'GST-2026-105',
            invoice_type: 'B2C',
            date: '2026-05-04',
            place_of_supply: '29-Karnataka',
            taxable_value: 50000,
            gst_percentage: 12,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 6000,
            total_tax: 6000,
            reverse_charge: 'No',
            irn_number: '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
            qr_status: 'Generated'
        }
    ];

    const reconciliations = dbReconciliations.length > 0 ? dbReconciliations.map(item => ({
        vendor_gstin: item.vendor_gstin || '27AAAAA1111A1Z1',
        vendor_name: item.vendor_name || 'Acme Hardware Corporates',
        invoice_amount: parseFloat(item.invoice_amount) || 35000,
        input_cgst: parseFloat(item.input_cgst) || 3150,
        input_sgst: parseFloat(item.input_sgst) || 3150,
        input_igst: parseFloat(item.input_igst) || 0,
        eligible_itc: parseFloat(item.eligible_itc) || 6300,
        invoice_match_status: item.invoice_match_status || 'matched',
        mismatch_reason: item.mismatch_reason || 'None',
        reconciliation_date: (item.created_at || '').split('T')[0] || '2026-05-08'
    })) : [
        {
            vendor_gstin: '27AAAAA1111A1Z1',
            vendor_name: 'Acme Hardware Corporates',
            invoice_amount: 35000,
            input_cgst: 3150,
            input_sgst: 3150,
            input_igst: 0,
            eligible_itc: 6300,
            invoice_match_status: 'matched',
            mismatch_reason: 'None',
            reconciliation_date: '2026-05-01'
        },
        {
            vendor_gstin: '29BBBBB2222B2Z2',
            vendor_name: 'Bengaluru Spares Ltd.',
            invoice_amount: 15000,
            input_cgst: 0,
            input_sgst: 0,
            input_igst: 2700,
            eligible_itc: 2700,
            invoice_match_status: 'mismatch',
            mismatch_reason: 'Tax rate mismatch (Supplier logged 12% instead of 18%)',
            reconciliation_date: '2026-05-03'
        }
    ];

    const { data: dbEways = [] } = useQuery({
        queryKey: ['gstEways'],
        queryFn: () => gstService.getEways()
    });

    const activeEways = dbInvoices.filter(item => item.is_eway_bill === 'true');
    const eways = activeEways.length > 0 ? activeEways.map(item => ({
        eway_bill_number: item.eway_bill_number,
        transporter_name: item.transporter_name || 'Bluedart Logistics',
        vehicle_number: item.vehicle_number || 'MH-02-AB-1234',
        transport_distance: parseInt(item.transport_distance) || 100,
        dispatch_location: item.dispatch_location || 'Mumbai',
        delivery_location: item.delivery_location || 'Pune',
        status: item.status || 'Active',
        reference_invoice: 'GST-2026-104'
    })) : [
        {
            eway_bill_number: 'EWB-2026-9011',
            transporter_name: 'Bluedart Freight Ltd.',
            vehicle_number: 'MH-02-EH-9081',
            transport_distance: 240,
            dispatch_location: 'Mumbai Warehouse',
            delivery_location: 'Pune Retail Store',
            status: 'Active',
            reference_invoice: 'GST-2026-104'
        }
    ];

    // Form inputs states
    const [invoiceForm, setInvoiceForm] = useState({
        invoice_type: 'B2B',
        place_of_supply: '27-Maharashtra',
        taxable_value: 40000,
        gst_percentage: 18,
        reverse_charge: 'No'
    });

    const [ewayForm, setEwayForm] = useState({
        transporter_name: 'Delhivry Express',
        vehicle_number: 'MH-04-AB-1234',
        transport_distance: 120,
        dispatch_location: 'Mumbai Warehouse',
        delivery_location: 'Thane Outlet'
    });

    const [reconcileForm, setReconcileForm] = useState({
        vendor_gstin: '27CCCCC3333C3Z3',
        vendor_name: 'Mumbai Spares Hub',
        invoice_amount: 12000,
        gst_rate: 18,
        match_status: 'matched'
    });

    const handleGenerateInvoice = (e) => {
        e.preventDefault();
        generateInvoiceMutation.mutate({
            invoice_type: invoiceForm.invoice_type,
            place_of_supply: invoiceForm.place_of_supply,
            taxable_value: parseFloat(invoiceForm.taxable_value) || 0,
            gst_percentage: parseInt(invoiceForm.gst_percentage) || 18,
            reverse_charge: invoiceForm.reverse_charge
        });
    };

    const handleCreateEway = (e) => {
        e.preventDefault();
        createEwayMutation.mutate({
            transporter_name: ewayForm.transporter_name,
            vehicle_number: ewayForm.vehicle_number,
            transport_distance: parseInt(ewayForm.transport_distance) || 100,
            dispatch_location: ewayForm.dispatch_location,
            delivery_location: ewayForm.delivery_location
        });
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
    const totalITCClaimable = reconciliations.filter(r => r.invoice_match_status === 'matched').reduce((sum, r) => sum + r.eligible_itc, 0);
    const totalOutputGSTCollected = invoices.reduce((sum, inv) => sum + inv.total_tax, 0);
    const netTaxPayable = Math.max(0, totalOutputGSTCollected - totalITCClaimable);

    const filteredInvoices = invoices.filter(inv => 
        inv.gst_invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.place_of_supply.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <PercentCircle size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>GST & Tax Compliance</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage auto GST splits, prepare GSTR-1 & GSTR-3B monthly filings, authenticate IRN e-Invoices, dispatch e-Way Bills, and reconcile purchase ITC.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => setIsEwayModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'white', color: '#1B6B3A', border: '1px solid #DCF2E4', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    >
                        <Truck size={16} /> Generate e-Way Bill
                    </button>
                    <button 
                        onClick={() => setIsInvoiceModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}
                    >
                        <Plus size={16} /> Generate e-Invoice
                    </button>
                </div>
            </div>

            {/* Registration Metadata Alert */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #DCF2E4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0F9F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                        <Award size={20} />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: '800', color: '#064E3B', fontSize: '1rem' }}>Government GSTIN Registered</h4>
                        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Legal Name: {gstProfile.legal_name} | Type: {gstProfile.business_type}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '850', color: '#1B6B3A' }}>{gstProfile.gstin}</span>
                    <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Place of Supply Code: {gstProfile.state_code} ({gstProfile.place_of_business})</p>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Output GST Collected', value: `₹${totalOutputGSTCollected.toLocaleString()}`, icon: ArrowUpRight, color: '#1B6B3A', bg: '#F0FDF4' },
                    { label: 'Eligible ITC (Claimed GSTR-2B)', value: `₹${totalITCClaimable.toLocaleString()}`, icon: ArrowDownRight, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Net GST Payable Liability', value: `₹${netTaxPayable.toLocaleString()}`, icon: PercentCircle, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Cumulative Taxable Sales', value: `₹${totalTaxableSales.toLocaleString()}`, icon: FileText, color: '#2563EB', bg: '#EFF6FF' }
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '1.75rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, marginBottom: '1.25rem' }}>
                            <stat.icon size={24} />
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748B', marginBottom: '0.5rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '850', color: '#1E293B', letterSpacing: '-0.02em' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Tab Swappers */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { id: 'returns', label: 'Returns Outward (GSTR-1)', icon: FileText },
                    { id: 'itc', label: 'Input Tax Reconciliation', icon: RefreshCw },
                    { id: 'einvoice', label: 'e-Invoicing IRN QR', icon: QrCode },
                    { id: 'eway', label: 'e-Way Bills Logistics', icon: Truck }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            padding: '0.75rem 1.5rem', borderRadius: '12px', 
                            background: activeTab === tab.id ? '#064E3B' : 'white', 
                            color: activeTab === tab.id ? 'white' : '#475569',
                            border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: activeTab === tab.id ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                        }}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: GSTR-1 Outward Supplies */}
            {activeTab === 'returns' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search GST invoices or state..." 
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
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Invoice No</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Place of supply</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Taxable Value</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>CGST / SGST</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>IGST</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Total GST</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.gst_invoice_number} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <p style={{ fontWeight: '850', color: '#064E3B', fontSize: '0.95rem' }}>{inv.gst_invoice_number}</p>
                                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {inv.date}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', fontSize: '0.75rem' }}>{inv.invoice_type}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '600', color: '#475569' }}>{inv.place_of_supply}</td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '750', color: '#1E293B' }}>₹{inv.taxable_value.toLocaleString()}</td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569' }}>
                                            {inv.cgst_amount > 0 ? `₹${inv.cgst_amount.toLocaleString()} + ₹${inv.sgst_amount.toLocaleString()}` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', color: '#475569' }}>
                                            {inv.igst_amount > 0 ? `₹${inv.igst_amount.toLocaleString()}` : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', fontWeight: '850', color: '#1B6B3A' }}>₹{inv.total_tax.toLocaleString()} ({inv.gst_percentage}%)</td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', fontWeight: '800', fontSize: '0.75rem' }}>READY</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Purchase Reconciliation */}
            {activeTab === 'itc' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>GSTR-2B Purchase ITC Reconciliations</h3>
                        <button onClick={() => setIsReconcileModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Verify Vendor Invoice</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Vendor GSTIN</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Vendor Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Invoice Worth</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Calculated CGST/SGST</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Eligible ITC</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reconciliations.map((rec) => (
                                <tr key={rec.vendor_gstin} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750', color: '#1E293B' }}>{rec.vendor_gstin}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{rec.vendor_name}</td>
                                    <td style={{ padding: '1rem' }}>₹{rec.invoice_amount.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>₹{rec.input_cgst.toLocaleString()} / ₹{rec.input_sgst.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800', color: '#1B6B3A' }}>₹{rec.eligible_itc.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', borderRadius: '6px',
                                            background: rec.invoice_match_status === 'matched' ? '#ECFDF5' : '#FEF2F2',
                                            color: rec.invoice_match_status === 'matched' ? '#10B981' : '#EF4444',
                                            fontWeight: '800', fontSize: '0.75rem'
                                        }}>{rec.invoice_match_status.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: e-Invoicing */}
            {activeTab === 'einvoice' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {invoices.map(inv => (
                        <div key={inv.gst_invoice_number} style={{ background: 'white', borderRadius: '28px', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: '#F0F9F4', color: '#1B6B3A', fontWeight: '800', fontSize: '0.75rem' }}>e-Invoice IRN Active</span>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#1E293B', marginTop: '0.5rem' }}>Invoice Ref: {inv.gst_invoice_number}</h3>
                                </div>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                    <QrCode size={24} />
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '10px', color: '#64748B', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '1.5rem' }}>
                                IRN: {inv.irn_number}
                            </p>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700' }}>Govt Tax Invoice Value:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '950', color: '#064E3B' }}>₹{(inv.taxable_value + inv.total_tax).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab 4: e-Way Bills Logistics */}
            {activeTab === 'eway' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Government e-Way Bills Transport tracking</h3>
                        <button onClick={() => setIsEwayModalOpen(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#1B6B3A', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>+ Dispatch New Bill</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>e-Way Bill No</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Carrier Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Vehicle Registration No</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Distance (Kms)</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Source - Destination</th>
                                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eways.map((ew) => (
                                <tr key={ew.eway_bill_number} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '1rem', fontWeight: '750' }}>{ew.eway_bill_number}</td>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>{ew.transporter_name}</td>
                                    <td style={{ padding: '1rem' }}>{ew.vehicle_number}</td>
                                    <td style={{ padding: '1rem', fontWeight: '800' }}>{ew.transport_distance} Kms</td>
                                    <td style={{ padding: '1rem' }}>{ew.dispatch_location} ➔ {ew.delivery_location}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: '#ECFDF5', color: '#10B981', fontWeight: '800', fontSize: '0.75rem' }}>{ew.status.toUpperCase()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Generate e-Invoice Modal */}
            {isInvoiceModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Generate GST e-Invoice</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleGenerateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Type</label>
                                    <select value={invoiceForm.invoice_type} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>B2B Tax Invoice</option>
                                        <option>B2C Invoice</option>
                                        <option>Export Invoice</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Place of supply</label>
                                    <select value={invoiceForm.place_of_supply} onChange={(e) => setInvoiceForm({ ...invoiceForm, place_of_supply: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="27-Maharashtra">27-Maharashtra (Intra)</option>
                                        <option value="29-Karnataka">29-Karnataka (Inter)</option>
                                        <option value="33-Tamil Nadu">33-Tamil Nadu (Inter)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Taxable Value (Before GST)</label>
                                <input required type="number" value={invoiceForm.taxable_value} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxable_value: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GST % Percentage</label>
                                    <select value={invoiceForm.gst_percentage} onChange={(e) => setInvoiceForm({ ...invoiceForm, gst_percentage: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="5">5% GST</option>
                                        <option value="12">12% GST</option>
                                        <option value="18">18% GST</option>
                                        <option value="28">28% GST</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reverse Charge</label>
                                    <select value={invoiceForm.reverse_charge} onChange={(e) => setInvoiceForm({ ...invoiceForm, reverse_charge: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option>No</option>
                                        <option>Yes</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle e-Invoice Authentication
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate e-Way Bill Modal */}
            {isEwayModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Create Government e-Way Bill</h3>
                            <button onClick={() => setIsEwayModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateEway} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Transporter Company Name</label>
                                <input required type="text" value={ewayForm.transporter_name} onChange={(e) => setEwayForm({ ...ewayForm, transporter_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="Bluedart Cargo" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Vehicle Number</label>
                                    <input required type="text" value={ewayForm.vehicle_number} onChange={(e) => setEwayForm({ ...ewayForm, vehicle_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} placeholder="MH-02-EH-9081" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Distance (Kms)</label>
                                    <input required type="number" value={ewayForm.transport_distance} onChange={(e) => setEwayForm({ ...ewayForm, transport_distance: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Dispatch Location</label>
                                    <input required type="text" value={ewayForm.dispatch_location} onChange={(e) => setEwayForm({ ...ewayForm, dispatch_location: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Delivery Destination</label>
                                    <input required type="text" value={ewayForm.delivery_location} onChange={(e) => setEwayForm({ ...ewayForm, delivery_location: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Government e-Way Bill
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Verify Vendor Invoice Modal */}
            {isReconcileModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Verify Vendor Invoice against GSTR-2B</h3>
                            <button onClick={() => setIsReconcileModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

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
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Total Amount (INR)</label>
                                <input required type="number" value={reconcileForm.invoice_amount} onChange={(e) => setReconcileForm({ ...reconcileForm, invoice_amount: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>GST Rate %</label>
                                    <select value={reconcileForm.gst_rate} onChange={(e) => setReconcileForm({ ...reconcileForm, gst_rate: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="5">5% GST</option>
                                        <option value="12">12% GST</option>
                                        <option value="18">18% GST</option>
                                        <option value="28">28% GST</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Match GSTR-2B</label>
                                    <select value={reconcileForm.match_status} onChange={(e) => setReconcileForm({ ...reconcileForm, match_status: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="matched">MATCHED (Optimal)</option>
                                        <option value="mismatch">MISMATCH (Flag error)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)' }}>
                                Settle Reconciliation Status
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessGST;
