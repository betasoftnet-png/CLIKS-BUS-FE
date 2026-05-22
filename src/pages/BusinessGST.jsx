import React, { useState } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gstService } from '../services';
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
    const [activeTab, setActiveTab] = useState('gstr1');
    const [colFilters, setColFilters] = React.useState({}); // 'gstr1', 'gstr2', 'gstr3b', 'gstr9', 'einvoice', 'eway'
    const [searchTerm, setSearchTerm] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isEwayModalOpen, setIsEwayModalOpen] = useState(false);
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [locallyDeletedIds, setLocallyDeletedIds] = useState([]);

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
        gstin: dbSettings.gstin || 'GSTIN NOT CONFIGURED',
        legal_name: dbSettings.legal_name || 'Business Registration Pending',
        business_type: dbSettings.business_type || 'Pending',
        place_of_business: dbSettings.place_of_business || 'Location Unspecified',
        state_code: dbSettings.state_code || '--'
    };

    // fallbacks mapping
    const invoices = dbInvoices
        .filter(item => !locallyDeletedIds.includes(String(item.id)))
        .map(item => ({
        id: item.id,
        gst_invoice_number: item.invoice_number,
        invoice_type: item.invoice_type || 'B2B',
        date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        place_of_supply: item.place_of_supply || 'N/A',
        taxable_value: parseFloat(item.taxable_value) || 0,
        gst_percentage: parseFloat(item.gst_percentage) || 18,
        cgst_amount: parseFloat(item.cgst_amount) || 0,
        sgst_amount: parseFloat(item.sgst_amount) || 0,
        igst_amount: parseFloat(item.igst_amount) || 0,
        total_tax: parseFloat(item.total_tax) || 0,
        reverse_charge: item.reverse_charge || 'No',
        irn_number: item.irn_number || '',
        qr_status: item.qr_status || 'Pending'
    }));

    const reconciliations = dbReconciliations
        .filter(item => !locallyDeletedIds.includes(String(item.id)))
        .map(item => ({
        id: item.id,
        vendor_gstin: item.vendor_gstin || '',
        vendor_name: item.vendor_name || '',
        invoice_amount: parseFloat(item.invoice_amount) || 0,
        input_cgst: parseFloat(item.input_cgst) || 0,
        input_sgst: parseFloat(item.input_sgst) || 0,
        input_igst: parseFloat(item.input_igst) || 0,
        eligible_itc: parseFloat(item.eligible_itc) || 0,
        invoice_match_status: item.invoice_match_status || 'matched',
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
        reference_invoice: item.reference_invoice || ''
    }));

    // Form inputs states
    const [invoiceForm, setInvoiceForm] = useState({
        invoice_type: 'B2B',
        place_of_supply: '27-Maharashtra',
        taxable_value: '',
        gst_percentage: 18,
        reverse_charge: 'No'
    });

    const [ewayForm, setEwayForm] = useState({
        transporter_name: '',
        vehicle_number: '',
        transport_distance: '',
        dispatch_location: '',
        delivery_location: ''
    });

    const [reconcileForm, setReconcileForm] = useState({
        vendor_gstin: '',
        vendor_name: '',
        invoice_amount: '',
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
                                            <p style={{ fontWeight: '850', color: '#0F172A', fontSize: '0.85rem', margin: 0 }}>{inv.gst_invoice_number}</p>
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
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Invoice Worth</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Calculated CGST/SGST</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Eligible ITC</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8' }}>Status</th>
                                    <th style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reconciliations.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '750', color: '#1E293B', fontSize: '0.85rem' }}>{rec.vendor_gstin}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.85rem' }}>{rec.vendor_name}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>{formatCurrency(rec.invoice_amount)}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#475569' }}>{formatCurrency(rec.input_cgst)} / {formatCurrency(rec.input_sgst)}</td>
                                        <td style={{ padding: '0.6rem 1rem', fontWeight: '800', color: '#1D4ED8', fontSize: '0.85rem' }}>{formatCurrency(rec.eligible_itc)}</td>
                                        <td style={{ padding: '0.6rem 1rem' }}>
                                            <span style={{ 
                                                padding: '0.2rem 0.4rem', borderRadius: '6px',
                                                background: rec.invoice_match_status === 'matched' ? '#E6F4EA' : '#FEE2E2',
                                                color: rec.invoice_match_status === 'matched' ? '#137333' : '#EF4444',
                                                fontWeight: '800', fontSize: '0.75rem'
                                            }}>{rec.invoice_match_status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>
                                            {confirmingDeleteId === rec.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteInvoiceMutation.mutate(rec.id); setConfirmingDeleteId(null); }} 
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
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(rec.id); }}
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
                        <div key={inv.gst_invoice_number} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ padding: '0.2rem 0.4rem', borderRadius: '6px', background: '#EFF6FF', color: '#1D4ED8', fontWeight: '800', fontSize: '0.75rem' }}>e-Invoice IRN Active</span>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#0F172A', marginTop: '0.4rem', margin: 0 }}>Invoice Ref: {inv.gst_invoice_number}</h3>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                                    <QrCode size={18} />
                                </div>
                            </div>

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
                    <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Generate GST e-Invoice</h3>
                            <button onClick={() => setIsInvoiceModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleGenerateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Invoice Type</label>
                                    <select value={invoiceForm.invoice_type} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_type: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        <option>B2B Tax Invoice</option>
                                        <option>B2C Invoice</option>
                                        <option>Export Invoice</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Place of supply</label>
                                    <select value={invoiceForm.place_of_supply} onChange={(e) => setInvoiceForm({ ...invoiceForm, place_of_supply: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        <option value="27-Maharashtra">27-Maharashtra</option>
                                        <option value="29-Karnataka">29-Karnataka</option>
                                        <option value="33-Tamil Nadu">33-Tamil Nadu</option>
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
                                    <select value={invoiceForm.gst_percentage} onChange={(e) => setInvoiceForm({ ...invoiceForm, gst_percentage: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        <option value="5">5% GST</option>
                                        <option value="12">12% GST</option>
                                        <option value="18">18% GST</option>
                                        <option value="28">28% GST</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>Reverse Charge</label>
                                    <select value={invoiceForm.reverse_charge} onChange={(e) => setInvoiceForm({ ...invoiceForm, reverse_charge: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '600' }}>
                                        <option>No</option>
                                        <option>Yes</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}>
                                Settle e-Invoice Authentication
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate e-Way Bill Modal */}
            {isEwayModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Create Government e-Way Bill</h3>
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

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}>
                                Settle Government e-Way Bill
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Verify Vendor Invoice Modal */}
            {isReconcileModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '1.5rem 2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Verify Vendor Invoice against GSTR-2B</h3>
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
                                        <option value="matched">MATCHED (Optimal)</option>
                                        <option value="mismatch">MISMATCH (Flag error)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 6px 12px rgba(124, 58, 237, 0.15)' }}>
                                Settle Reconciliation Status
                            </button>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default BusinessGST;
