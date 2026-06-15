import React, { useState, useCallback } from 'react';
import { applyTableFilters } from '../utils/filterUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { suppliersService } from '../services';
import { 
    Users, 
    Plus, 
    Search, 
    Filter, 
    Edit2, 
    Trash2, 
    MoreVertical, 
    AlertTriangle,
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
    IndianRupee,
    Briefcase,
    Phone,
    Mail,
    Globe,
    FileText,
    Share2,
    Smartphone
} from 'lucide-react';
import '../App.css';
import { customConfirm } from '../utils/customConfirm';
import FilterableTableHead from '../components/FilterableTableHead';
import { useCurrency } from '../context';

const BusinessSuppliers = () => {
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [colFilters, setColFilters] = React.useState({});
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'ledger', 'reports'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [filterType, setFilterType] = useState('All');

    // Supplier Bulk Import CSV states
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importStep, setImportStep] = useState('upload'); // 'upload', 'mapping', 'preview'
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvRows, setCsvRows] = useState([]);
    const [columnMap, setColumnMap] = useState({});
    const [parsedSuppliers, setParsedSuppliers] = useState([]);
    const [fileName, setFileName] = useState('');

    const importMutation = useMutation({
        mutationFn: (data) => suppliersService.importSuppliers(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            alert(res.message || 'Suppliers imported successfully!');
            setIsImportModalOpen(false);
            setImportStep('upload');
            setCsvHeaders([]);
            setCsvRows([]);
            setColumnMap({});
            setParsedSuppliers([]);
            setFileName('');
        },
        onError: (err) => {
            console.error('Import failed:', err);
            alert(err.response?.data?.message || err.message || 'Failed to import suppliers.');
        }
    });

    const SYSTEM_FIELDS = [
        { key: 'name', label: 'Supplier Name *', required: true, synonyms: ['name', 'supplier name', 'supplier_name', 'vendor', 'vendor name', 'company', 'company_name'] },
        { key: 'email', label: 'Email', required: false, synonyms: ['email', 'email address', 'email_address', 'mail'] },
        { key: 'phone', label: 'Phone', required: false, synonyms: ['phone', 'phone number', 'phone_number', 'mobile', 'mobile number', 'contact'] },
        { key: 'company', label: 'Company', required: false, synonyms: ['company', 'company name', 'company_name', 'organization', 'firm'] },
        { key: 'gstin', label: 'GSTIN', required: false, synonyms: ['gstin', 'gst', 'gst number', 'tax identification number', 'tin'] },
        { key: 'city', label: 'City', required: false, synonyms: ['city', 'town', 'location', 'district'] },
        { key: 'outstanding_balance', label: 'Outstanding Balance', required: false, synonyms: ['outstanding balance', 'balance', 'outstanding_balance', 'opening balance', 'opening_balance', 'payable', 'amount due'] }
    ];

    const parseCSV = (text) => {
        const lines = [];
        let row = [""];
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const next = text[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    row[row.length - 1] += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                row.push("");
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
                if (char === '\r' && next === '\n') {
                    i++;
                }
                lines.push(row);
                row = [""];
            } else {
                row[row.length - 1] += char;
            }
        }
        if (row.length > 1 || row[0] !== "") {
            lines.push(row);
        }
        return lines.filter(r => r.some(cell => cell.trim() !== ""));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const allRows = parseCSV(text);
            if (allRows.length < 2) {
                alert('The uploaded file must contain a header row and at least one supplier row.');
                return;
            }

            const headers = allRows[0].map(h => h.trim());
            const dataRows = allRows.slice(1);

            setCsvHeaders(headers);
            setCsvRows(dataRows);

            const initialMap = {};
            SYSTEM_FIELDS.forEach(field => {
                const matched = headers.find(h => {
                    const clean = h.toLowerCase();
                    return field.synonyms.some(syn => clean === syn || clean.includes(syn));
                });
                initialMap[field.key] = matched || '';
            });
            setColumnMap(initialMap);
            setImportStep('mapping');
        };
        reader.readAsText(file);
    };

    const handleProceedToPreview = () => {
        const missingRequired = SYSTEM_FIELDS.filter(f => f.required && !columnMap[f.key]);
        if (missingRequired.length > 0) {
            alert(`Please map the following required field(s): ${missingRequired.map(f => f.label).join(', ')}`);
            return;
        }

        const suppliers = csvRows.map((row, idx) => {
            const s = {};
            SYSTEM_FIELDS.forEach(f => {
                const headerName = columnMap[f.key];
                const headerIdx = csvHeaders.indexOf(headerName);
                let val = headerIdx > -1 ? row[headerIdx] : '';
                
                if (val !== undefined && val !== null) {
                    val = val.trim();
                } else {
                    val = '';
                }

                if (f.key === 'outstanding_balance') {
                    s[f.key] = parseFloat(val) || 0;
                } else {
                    s[f.key] = val;
                }
            });
            return {
                rowNumber: idx + 2,
                ...s
            };
        });

        setParsedSuppliers(suppliers);
        setImportStep('preview');
    };

    const handleExecuteImport = () => {
        const invalidRows = parsedSuppliers.filter(s => !s.name);
        if (invalidRows.length > 0) {
            alert(`Validation failed: Row(s) ${invalidRows.map(r => r.rowNumber).join(', ')} are missing supplier names.`);
            return;
        }
        importMutation.mutate({ suppliers: parsedSuppliers });
    };

    const generateSampleTemplate = () => {
        const headers = SYSTEM_FIELDS.map(f => f.label.replace(' *', ''));
        const row1 = ['Acme Industries Ltd', 'info@acme.com', '+919876543210', 'Acme Corp', '27AAAAA1111A1Z1', 'Mumbai', '55000'];
        const row2 = ['Globex Logistics', 'contact@globex.com', '+919988776655', 'Globex LLC', '27BBBBB2222B2Z2', 'Pune', '0'];
        const csvContent = [headers.join(','), row1.join(','), row2.join(',')].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'cliks_suppliers_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Automatically open creation wizard via query setup
    const [searchParams, setSearchParams] = useSearchParams();
    React.useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setIsModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Supplier Payment Form states
    const [paymentForm, setPaymentForm] = useState(() => ({
        amount: 0,
        mode: 'UPI',
        reference: `TXN-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0]
    }));

    // Live supplier Master Base React Query integration
    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersService.getSuppliers()
    });

    const createMutation = useMutation({
        mutationFn: (data) => suppliersService.createSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            alert('Supplier registered and master profile initialized!');
            setIsModalOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => suppliersService.updateSupplier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            alert('Supplier profile details successfully updated!');
            setIsModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => suppliersService.deleteSupplier(id),
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData(['suppliers'], (old = []) => 
                Array.isArray(old) ? old.filter(sup => (sup.id || sup.supplier_id) !== deletedId) : []
            );
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            alert('Supplier deleted successfully.');
        }
    });

    const paymentMutation = useMutation({
        mutationFn: ({ id, data }) => suppliersService.createPayment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            alert('Outward Payment logged! Vendor ledger and running payables adjusted.');
            setIsPaymentModalOpen(false);
            setSelectedSupplier(null);
        }
    });

    const [formData, setFormData] = useState(() => ({
        supplier_code: `SUP-${Date.now().toString().slice(-4)}`,
        supplier_type: 'local',
        supplier_status: 'active',
        supplier_name: '',
        company_name: '',
        contact_person: '',
        phone_number: '',
        alternate_phone: '',
        email: '',
        website: '',
        gstin: '',
        pan_number: '',
        tax_type: 'registered',
        place_of_supply: 'Maharashtra',
        billing_address: '',
        shipping_address: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        country: 'India',
        opening_balance: 0,
        credit_limit: 200000,
        payment_terms: 'Net 30'
    }));

    const handleOpenCreateModal = () => {
        setEditingSupplier(null);
        setFormData({
            supplier_code: `SUP-${Date.now().toString().slice(-4)}`,
            supplier_type: 'local',
            supplier_status: 'active',
            supplier_name: '',
            company_name: '',
            contact_person: '',
            phone_number: '',
            alternate_phone: '',
            email: '',
            website: '',
            gstin: '',
            pan_number: '',
            tax_type: 'registered',
            place_of_supply: 'Maharashtra',
            billing_address: '',
            shipping_address: '',
            city: '',
            state: 'Maharashtra',
            pincode: '',
            country: 'India',
            opening_balance: 0,
            credit_limit: 200000,
            payment_terms: 'Net 30'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            supplier_code: supplier.supplier_code || 'SUP-TEMP',
            supplier_type: supplier.supplier_type || 'local',
            supplier_status: supplier.supplier_status || supplier.status || 'active',
            supplier_name: supplier.supplier_name || supplier.name || '',
            company_name: supplier.company_name || supplier.company || '',
            contact_person: supplier.contact_person || supplier.name || '',
            phone_number: supplier.phone_number || supplier.phone || '',
            alternate_phone: supplier.alternate_phone || '',
            email: supplier.email || '',
            website: supplier.website || '',
            gstin: supplier.gstin || '',
            pan_number: supplier.pan_number || '',
            tax_type: supplier.tax_type || 'registered',
            place_of_supply: supplier.place_of_supply || supplier.city || 'Maharashtra',
            billing_address: supplier.billing_address || '',
            shipping_address: supplier.shipping_address || '',
            city: supplier.city || '',
            state: supplier.state || 'Maharashtra',
            pincode: supplier.pincode || '',
            country: supplier.country || 'India',
            opening_balance: supplier.opening_balance || 0,
            credit_limit: supplier.credit_limit || 200000,
            payment_terms: supplier.payment_terms || 'Net 30'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (await customConfirm('Are you sure you want to completely remove this vendor/supplier profile? All ledger records will be deleted.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmitSupplier = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.supplier_name,
            email: formData.email,
            phone: formData.phone_number,
            company: formData.company_name,
            gstin: formData.gstin,
            status: formData.supplier_status,
            city: formData.city,
            outstanding_balance: formData.opening_balance,
            total_purchased: 0
        };

        if (editingSupplier) {
            updateMutation.mutate({ id: editingSupplier.id || editingSupplier.supplier_id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleOpenPaymentModal = useCallback((supplier) => {
        setSelectedSupplier(supplier);
        const bal = supplier.outstanding_balance || supplier.current_balance || 0;
        setPaymentForm({
            amount: Math.max(0, bal),
            mode: 'UPI',
            reference: `TXN-PAY-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0]
        });
        setIsPaymentModalOpen(true);
    }, []);

    const handleRecordPayment = (e) => {
        e.preventDefault();
        const payAmt = parseFloat(paymentForm.amount) || 0;
        if (payAmt <= 0) {
            alert('Please enter a valid outward payment amount.');
            return;
        }

        paymentMutation.mutate({
            id: selectedSupplier.id || selectedSupplier.supplier_id,
            data: {
                amount: payAmt,
                payment_method: paymentForm.mode,
                reference_number: paymentForm.reference
            }
        });
    };

    const handleShareLedgerWhatsApp = (supplier) => {
        const bal = supplier.outstanding_balance || supplier.current_balance || 0;
        const text = `Dear ${supplier.name || supplier.supplier_name}, here is your current statement summary with us: Outstanding Payable: INR ${bal.toLocaleString()}. Thank you!`;
        const phoneNo = supplier.phone || supplier.phone_number || '';
        window.open(`https://api.whatsapp.com/send?phone=${phoneNo.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`, '_blank');
    };

    const filteredSuppliers = suppliers.filter(s => {
        const sName = s.name || s.supplier_name || '';
        const sComp = s.company || s.company_name || '';
        const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            sComp.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || (s.supplier_type || 'local') === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    // Report computations
    const totalPayablesSum = suppliers.reduce((acc, s) => acc + (parseFloat(s.outstanding_balance || s.current_balance || 0) > 0 ? parseFloat(s.outstanding_balance || s.current_balance || 0) : 0), 0);
    const totalAdvancePaymentsSum = suppliers.reduce((acc, s) => acc + (parseFloat(s.outstanding_balance || s.current_balance || 0) < 0 ? Math.abs(parseFloat(s.outstanding_balance || s.current_balance || 0)) : 0), 0);
    const totalOutwardPurchasesSum = suppliers.reduce((acc, s) => acc + parseFloat(s.total_purchased || s.total_purchases || 0), 0);

    return (
        <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}>
                            <Users size={20} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Suppliers Master Suite</h1>
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>Manage vendor demographics, credit limits, purchase ledgers, and outward payables aging summaries.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => {
                            setIsImportModalOpen(true);
                            setImportStep('upload');
                        }}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1.25rem', borderRadius: '10px', 
                            background: 'white', color: '#475569', border: '1px solid #E2E8F0', 
                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Download size={18} style={{ transform: 'rotate(180deg)' }} />
                        Bulk Import (CSV)
                    </button>
                    <button 
                        onClick={handleOpenCreateModal}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.65rem 1.25rem', borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', 
                            fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)'
                        }}
                    >
                        <Plus size={18} />
                        Register New Supplier
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Outstanding Payables', value: formatCurrency(totalPayablesSum), icon: TrendingUp, color: '#EF4444', bg: '#FEE2E2' },
                    { label: 'Advance Supplier Outflows', value: formatCurrency(totalAdvancePaymentsSum), icon: CheckCircle2, color: '#10B981', bg: '#DCF2E4' },
                    { label: 'Total Procured Value', value: formatCurrency(totalOutwardPurchasesSum), icon: Layers, color: '#3B82F6', bg: '#DBEAFE' },
                    { label: 'Registered Suppliers', value: suppliers.length, icon: Users, color: '#8B5CF6', bg: '#EDE9FE' }
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

            {/* Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button 
                    onClick={() => setActiveTab('list')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'list' ? 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' : 'white', 
                        color: activeTab === 'list' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'list' ? '0 4px 10px rgba(236, 72, 153, 0.15)' : 'none'
                    }}
                >
                    <Users size={16} /> Suppliers Master Base
                </button>
                <button 
                    onClick={() => setActiveTab('ledger')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'ledger' ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' : 'white', 
                        color: activeTab === 'ledger' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'ledger' ? '0 4px 10px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                >
                    <FileText size={16} /> Running Ledger Statements
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{ 
                        padding: '0.5rem 1rem', borderRadius: '8px', 
                        background: activeTab === 'reports' ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'white', 
                        color: activeTab === 'reports' ? 'white' : '#64748B',
                        border: '1px solid #E2E8F0', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        boxShadow: activeTab === 'reports' ? '0 4px 10px rgba(139, 92, 246, 0.15)' : 'none'
                    }}
                >
                    <AlertTriangle size={16} /> Payables Aging & Reminders
                </button>
            </div>
            
            {/* Central Auto-Scrolling Frame */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

            {/* Tab 1: Suppliers Master List */}
            {activeTab === 'list' && (
                <div style={{ background: 'white', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                        <div style={{ position: 'relative', width: '400px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                            <input 
                                type="text" 
                                placeholder="Search suppliers, company or contact person..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ padding: '0.65rem 1.25rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#475569' }}
                        >
                            <option>All</option>
                            <option>Local</option>
                            <option>Import</option>
                        </select>
                    </div>

                    <div style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <FilterableTableHead columns={[
        { key: 'supplier_name', label: 'Supplier Details', placeholder: 'Name' },
        { key: 'city', label: 'Demographics', placeholder: 'City' },
        { key: 'gstin', label: 'GST & HSN', placeholder: 'GSTIN' },
        { key: 'credit_limit', label: 'Credit Limits', placeholder: 'e.g. 50000' },
        { key: 'payable_balance', label: 'Running Payable', placeholder: 'e.g. 5000' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Active' },
        { key: '_actions', label: 'Actions', noFilter: true }
    ]} onFilterChange={setColFilters} />
                            <tbody>
                                {filteredSuppliers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((sup) => {
                                    const supId = sup.id || sup.supplier_id;
                                    const supName = sup.name || sup.supplier_name || 'Unnamed Supplier';
                                    const supCode = sup.supplier_code || `SUP-${supId}`;
                                    const supContact = sup.contact_person || supName;
                                    const supPhone = sup.phone || sup.phone_number || 'N/A';
                                    const supEmail = sup.email || 'N/A';
                                    const supGstin = sup.gstin || 'Unregistered';
                                    const supPan = sup.pan_number || 'N/A';
                                    const supLimit = sup.credit_limit || 0;
                                    const supTerms = sup.payment_terms || 'Net 30';
                                    const supBal = parseFloat(sup.outstanding_balance || sup.current_balance || 0);
                                    const supStatus = sup.status || sup.supplier_status || 'active';

                                    return (
                                        <tr key={supId} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: '850', color: '#1E293B', fontSize: '0.95rem' }}>{supName}</p>
                                                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Code: {supCode} | Contact: {supContact}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{supPhone}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{supEmail}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{supGstin}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>PAN: {supPan}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem' }}>Limit: {formatCurrency(supLimit)}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Terms: {supTerms}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: supBal > 0 ? '#EF4444' : '#15803D' }}>
                                                    {supBal > 0 ? formatCurrency(supBal) : `${formatCurrency(Math.abs(supBal))} (Adv)`}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                    background: supStatus === 'active' ? '#F0FDF4' : '#F1F5F9',
                                                    color: supStatus === 'active' ? '#15803D' : '#475569',
                                                    fontSize: '0.75rem', fontWeight: '800'
                                                }}>{supStatus.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    {supBal > 0 && (
                                                        <button 
                                                            onClick={() => handleOpenPaymentModal(sup)}
                                                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >Record Pay</button>
                                                    )}
                                                    <button onClick={() => handleEdit(sup)} title="Edit specifications" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(supId)} title="Delete product" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'ledger' && (
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    {/* Left side list */}
                    <div className="lg:col-span-2" style={{ background: 'white', padding: '1.5rem', borderRadius: '28px', border: '1px solid #E2E8F0', height: 'fit-content' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Select Supplier</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {suppliers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map(s => {
                                const sId = s.id || s.supplier_id;
                                const sName = s.name || s.supplier_name || 'Unnamed';
                                const sBal = parseFloat(s.outstanding_balance || s.current_balance || 0);
                                return (
                                    <button 
                                        key={sId}
                                        onClick={() => setSelectedSupplier(s)}
                                        style={{ 
                                            width: '100%', padding: '1rem', borderRadius: '16px', border: (selectedSupplier?.id === s.id || selectedSupplier?.supplier_id === s.supplier_id) ? '2px solid #064E3B' : '1px solid #E2E8F0',
                                            background: (selectedSupplier?.id === s.id || selectedSupplier?.supplier_id === s.supplier_id) ? '#F0F9F4' : 'white',
                                            textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.9rem' }}>{sName}</p>
                                        <span style={{ fontSize: '0.8rem', color: sBal > 0 ? '#EF4444' : '#15803D', fontWeight: '700' }}>Payable: {formatCurrency(sBal)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right side ledger details */}
                    <div className="lg:col-span-5" style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                        {selectedSupplier ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#064E3B' }}>Statement of Account: {selectedSupplier.name || selectedSupplier.supplier_name}</h3>
                                        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>GSTIN: {selectedSupplier.gstin || 'N/A'} | Contact: {selectedSupplier.phone || selectedSupplier.phone_number}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleShareLedgerWhatsApp(selectedSupplier)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #DCF2E4', background: '#F0FDF4', color: '#15803D', fontWeight: '700', cursor: 'pointer' }}>
                                            <Share2 size={16} /> WhatsApp Remind
                                        </button>
                                        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                                            <Download size={16} /> Export Statement PDF
                                        </button>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <FilterableTableHead columns={[
        { key: 'supplier_name', label: 'Supplier Details', placeholder: 'Name' },
        { key: 'city', label: 'Demographics', placeholder: 'City' },
        { key: 'gstin', label: 'GST & HSN', placeholder: 'GSTIN' },
        { key: 'credit_limit', label: 'Credit Limits', placeholder: 'e.g. 50000' },
        { key: 'payable_balance', label: 'Running Payable', placeholder: 'e.g. 5000' },
        { key: 'status', label: 'Status', placeholder: 'e.g. Active' },
        { key: '_actions', label: 'Actions', noFilter: true }
    ]} onFilterChange={setColFilters} />
                                    <tbody>
                                        {(selectedSupplier.ledger || []).map((row, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: '600' }}>{row.date}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '750', color: '#1E293B', fontSize: '0.85rem' }}>{row.reference_id}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#EF4444', fontWeight: '700' }}>
                                                    {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#15803D', fontWeight: '700' }}>
                                                    {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#1E293B' }}>
                                                    {formatCurrency(row.running_balance)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#94A3B8' }}>
                                <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                <p>Select a supplier from the left sidebar to view their full statement ledger.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 3: Payables Aging & Reminders Reports */}
            {activeTab === 'reports' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Outstanding payables log */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Outstanding Payables Aging Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#FFF5F5', borderRadius: '16px', border: '1px solid #FEE2E2' }}>
                                    <span style={{ color: '#C53030', fontWeight: '700' }}>0–30 Days Overdue Bucket</span>
                                    <span style={{ fontWeight: '900', color: '#C53030' }}>{formatCurrency(85000)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#FFFBEB', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                                    <span style={{ color: '#B45309', fontWeight: '700' }}>31–60 Days Overdue Bucket</span>
                                    <span style={{ fontWeight: '900', color: '#B45309' }}>{formatCurrency(35000)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <span style={{ color: '#15803D', fontWeight: '700' }}>61–90+ Days Overdue Bucket</span>
                                    <span style={{ fontWeight: '900', color: '#15803D' }}>{formatCurrency(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Supplier contribution purchases */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Supplier Procurement Shares</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {suppliers.filter(item => applyTableFilters(item, typeof colFilters !== "undefined" ? colFilters : {})).map((s, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                                            <span>{s.supplier_name}</span>
                                            <span>Total bought: {formatCurrency(s.total_purchases)}</span>
                                        </div>
                                        <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#1B6B3A', width: `${Math.min(100, (s.total_purchases / totalOutwardPurchasesSum) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Payment Follow-up Log</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {suppliers.filter(s => s.current_balance > 0).map((s, idx) => (
                                <div key={idx} style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.9rem' }}>{s.supplier_name}</p>
                                        <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: '700' }}>Balance Due: {formatCurrency(s.current_balance)}</span>
                                    </div>
                                    <button onClick={() => handleShareLedgerWhatsApp(s)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#F0FDF4', color: '#15803D', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Smartphone size={14} /> Send Alert
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            </div>
            {/* Register/Edit Supplier Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '800px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#064E3B' }}>{editingSupplier ? 'Edit Supplier Profile' : 'Register Vendor Master Profile'}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Code: {formData.supplier_code}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmitSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* General */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.25rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Supplier / Business Name</label>
                                    <input required type="text" value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="e.g. TechCorp India Pvt Ltd" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Contact Person</label>
                                    <input required type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="Harish Mehta" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Supplier Type</label>
                                    <select value={formData.supplier_type} onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="local">Local Supplier</option>
                                        <option value="import">Import Supplier</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contact Demographics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mobile Number</label>
                                    <input required type="text" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="+91 9988..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Alternate Phone</label>
                                    <input type="text" value={formData.alternate_phone} onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="procurement@brand.com" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Website Link</label>
                                    <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="www.brand.com" />
                                </div>
                            </div>

                            {/* Taxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GSTIN ID</label>
                                    <input type="text" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PAN Number</label>
                                    <input type="text" value={formData.pan_number} onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tax Registration</label>
                                    <select value={formData.tax_type} onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }}>
                                        <option value="registered">Registered Business</option>
                                        <option value="unregistered">Unregistered Vendor</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>State of Supply</label>
                                    <input type="text" value={formData.place_of_supply} onChange={(e) => setFormData({ ...formData, place_of_supply: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                            </div>

                            {/* Billing details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Billing Headquarters Address</label>
                                    <input type="text" value={formData.billing_address} onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Shipping Warehouse Address</label>
                                    <input type="text" value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>City</label>
                                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Postal Code (Pincode)</label>
                                    <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none', background: 'white' }} placeholder="400013" />
                                </div>
                            </div>

                            {/* Opening & Credit settings */}
                            <div style={{ background: '#F0F9F4', padding: '1.5rem', borderRadius: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', border: '1px solid #DCF2E4' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Opening Payable Balance ({currency.symbol})</label>
                                    <input type="number" disabled={!!editingSupplier} value={formData.opening_balance} onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Keep positive if you owe them, negative for advance payment.</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Credit limit allowance ({currency.symbol})</label>
                                    <input type="number" value={formData.credit_limit} onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Payment Terms (Days)</label>
                                    <input type="text" value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} placeholder="Net 30 / Net 15" />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', marginTop: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                {editingSupplier ? 'Save Supplier Specifications' : 'Initialize Supplier Master Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Record Payment Modal */}
            {isPaymentModalOpen && selectedSupplier && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: '#064E3B' }}>Record Outward Payment</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Vendor: {selectedSupplier.supplier_name}</p>
                            </div>
                            <button onClick={() => setIsPaymentModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', padding: '0.6rem', borderRadius: '14px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ background: '#FFF5F5', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #FEE2E2', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700' }}>
                                <span style={{ color: '#C53030' }}>Outstanding Balance Owed:</span>
                                <span style={{ color: '#C53030' }}>{formatCurrency(selectedSupplier.current_balance)}</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Paid Amount ({currency.symbol})</label>
                                <input required type="number" max={selectedSupplier.current_balance} value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1.5rem', fontWeight: '900', color: '#064E3B', textAlign: 'center' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Payment Mode</label>
                                    <select value={paymentForm.mode} onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontWeight: '700' }}>
                                        <option value="UPI">UPI (GPay/PhonePe)</option>
                                        <option value="Cash">Cash In Hand</option>
                                        <option value="Bank Transfer">Bank Transfer (IMPS/RTGS)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Tx Date</label>
                                    <input required type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Transaction Reference ID</label>
                                <input type="text" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontWeight: '700' }} />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)' }}>
                                Commit Outward Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {isImportModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(6, 78, 59, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '2rem' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: importStep === 'preview' ? '920px' : '580px', borderRadius: '28px', padding: '2.25rem', boxShadow: '0 25px 50px -12px rgba(6, 78, 59, 0.25)', border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'max-width 0.3s ease' }}>
                        
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Download size={20} style={{ transform: 'rotate(180deg)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#064E3B', margin: 0 }}>Supplier Bulk Import (CSV)</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>Import thousands of vendors directly from your spreadsheets.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} style={{ border: 'none', background: '#F1F5F9', color: '#64748B', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>

                        {/* Step 1: Upload File */}
                        {importStep === 'upload' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ border: '2px dashed #CBD5E1', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', position: 'relative' }}>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    />
                                    <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
                                        <Download size={24} style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '800', color: '#1E293B', fontSize: '0.95rem' }}>Drag & Drop your CSV file here</p>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.8rem', fontWeight: '500' }}>or click to browse your computer (.csv only)</p>
                                    </div>
                                </div>

                                <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#B45309' }}>Need a sample template?</h4>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B', fontWeight: '600', lineHeight: '1.4' }}>
                                        To ensure your columns pair properly with our system, you can download a sample template filled with mock data.
                                    </p>
                                    <button
                                        onClick={generateSampleTemplate}
                                        style={{ width: 'fit-content', border: 'none', background: '#FEF3C7', color: '#B45309', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', marginTop: '0.25rem', transition: 'all 0.15s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#FDE68A'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#FEF3C7'}
                                    >
                                        Download CSV Template
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Column Mapping */}
                        {importStep === 'mapping' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', padding: '1rem', borderRadius: '16px', color: '#1E40AF', fontSize: '0.82rem', fontWeight: '600' }}>
                                    We found <strong>{csvHeaders.length} columns</strong> and <strong>{csvRows.length} rows</strong> in <strong>{fileName}</strong>. Please map the expected system columns to your CSV fields. Unmapped fields will take default values.
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #CBD5E1', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
                                        <span>System Field</span>
                                        <span>Mapped CSV Column</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '38vh', overflowY: 'auto', paddingRight: '4px' }}>
                                        {SYSTEM_FIELDS.map(field => (
                                            <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1E293B' }}>{field.label}</span>
                                                <select
                                                    value={columnMap[field.key] || ''}
                                                    onChange={(e) => setColumnMap({ ...columnMap, [field.key]: e.target.value })}
                                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #CBD5E1', outline: 'none', background: 'white', fontSize: '0.85rem', fontWeight: '750', color: columnMap[field.key] ? '#1E293B' : '#94A3B8' }}
                                                >
                                                    <option value="">-- Unmapped (Use Default fallback) --</option>
                                                    {csvHeaders.map((header, idx) => (
                                                        <option key={idx} value={header}>{header}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => setImportStep('upload')}
                                        style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer' }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleProceedToPreview}
                                        style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)' }}
                                    >
                                        Proceed to Preview
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review Preview */}
                        {importStep === 'preview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1rem', borderRadius: '16px', color: '#065F46', fontSize: '0.82rem', fontWeight: '600' }}>
                                    <strong>Ready to Import!</strong> Please review the matched supplier details below. Red rows indicate missing required fields and must be fixed or excluded from your CSV.
                                </div>

                                <div style={{ border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', maxHeight: '42vh', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                                        <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Row</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Supplier Name *</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Email</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Phone</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Company</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>GSTIN</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>City</th>
                                                <th style={{ padding: '0.75rem', fontWeight: '800', color: '#64748B' }}>Outstanding Bal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedSuppliers.map((s, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: s.name ? 'transparent' : '#FEF2F2' }}>
                                                    <td style={{ padding: '0.75rem', color: '#64748B', fontWeight: '700' }}>{s.rowNumber}</td>
                                                    <td style={{ padding: '0.75rem', fontWeight: '800', color: s.name ? '#1E293B' : '#EF4444' }}>{s.name || '(MISSING NAME)'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{s.email || '—'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{s.phone || '—'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{s.company || '—'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{s.gstin || '—'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{s.city || '—'}</td>
                                                    <td style={{ padding: '0.75rem', color: '#B91C1C', fontWeight: '700' }}>{formatCurrency(s.outstanding_balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    💡 <strong>Note:</strong> Items missing additional parameters (like GSTIN or Company) will automatically assign blank fallbacks.
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => setImportStep('mapping')}
                                        style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', fontWeight: '750', fontSize: '0.82rem', cursor: 'pointer' }}
                                    >
                                        Back to Mapping
                                    </button>
                                    <button
                                        onClick={handleExecuteImport}
                                        disabled={importMutation.isPending || parsedSuppliers.some(s => !s.name)}
                                        style={{ padding: '0.65rem 2rem', borderRadius: '10px', background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.82rem', cursor: parsedSuppliers.some(s => !s.name) ? 'not-allowed' : 'pointer', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.2)' }}
                                    >
                                        {importMutation.isPending ? 'Importing Suppliers...' : `Import ${parsedSuppliers.length} Suppliers`}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessSuppliers;
