import React, { useState, useCallback } from 'react';
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

const BusinessSuppliers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'ledger', 'reports'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [filterType, setFilterType] = useState('All');

    // Supplier Payment Form states
    const [paymentForm, setPaymentForm] = useState(() => ({
        amount: 0,
        mode: 'UPI',
        reference: `TXN-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0]
    }));

    // Stateful Supplier database initialized with Vyapar realistic sample data
    const [suppliers, setSuppliers] = useState([
        {
            supplier_id: 'SUP-101',
            supplier_code: 'SUP-APL-01',
            supplier_type: 'local', // local / import
            supplier_status: 'active',
            supplier_name: 'TechCorp Distributors',
            company_name: 'TechCorp India Pvt Ltd',
            contact_person: 'Harish Mehta',
            phone_number: '+91 98765 43210',
            alternate_phone: '+91 22 4567 8901',
            email: 'procurement@techcorp.in',
            website: 'www.techcorp.in',
            gstin: '27AAAAA1111A1Z1',
            pan_number: 'AAAAA1111A',
            tax_type: 'registered',
            place_of_supply: 'Maharashtra',
            billing_address: 'Warehouse Block 4, Industrial Area, Mumbai',
            shipping_address: 'Warehouse Block 4, Industrial Area, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400013',
            country: 'India',
            opening_balance: 50000,
            current_balance: 120000, // money you owe (payable)
            credit_limit: 300000,
            payment_terms: 'Net 30',
            total_purchases: 450000,
            total_paid: 330000,
            pending_amount: 120000,
            advance_amount: 0,
            total_purchase_orders: 12,
            total_purchase_bills: 10,
            last_purchase_date: '2026-05-01',
            ledger: [
                { id: 'L-1', date: '2026-04-10', type: 'purchase', reference_id: 'BILL-77091', debit: 150000, credit: 0, running_balance: 150000 },
                { id: 'L-2', date: '2026-04-15', type: 'payment', reference_id: 'PAY-88011', debit: 0, credit: 100000, running_balance: 50000 },
                { id: 'L-3', date: '2026-05-01', type: 'purchase', reference_id: 'BILL-90112', debit: 70000, credit: 0, running_balance: 120000 },
            ]
        },
        {
            supplier_id: 'SUP-102',
            supplier_code: 'SUP-GDJ-44',
            supplier_type: 'local',
            supplier_status: 'active',
            supplier_name: 'Godrej Office Sol.',
            company_name: 'Godrej & Boyce Mfg Co',
            contact_person: 'Amit Nair',
            phone_number: '+91 99881 22334',
            alternate_phone: '',
            email: 'sales@godrejoffice.com',
            website: 'www.godrejoffice.com',
            gstin: '27BBBBB2222B2Z2',
            pan_number: 'BBBBB2222B',
            tax_type: 'registered',
            place_of_supply: 'Maharashtra',
            billing_address: 'Godrej Vikhroli Plant, Mumbai',
            shipping_address: 'Godrej Vikhroli Plant, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400079',
            country: 'India',
            opening_balance: 0,
            current_balance: 25000, // money you owe
            credit_limit: 150000,
            payment_terms: 'Net 15',
            total_purchases: 180000,
            total_paid: 155000,
            pending_amount: 25000,
            advance_amount: 0,
            total_purchase_orders: 5,
            total_purchase_bills: 4,
            last_purchase_date: '2026-04-28',
            ledger: [
                { id: 'L-1', date: '2026-04-20', type: 'purchase', reference_id: 'BILL-4401', debit: 80000, credit: 0, running_balance: 80000 },
                { id: 'L-2', date: '2026-04-25', type: 'payment', reference_id: 'PAY-4412', debit: 0, credit: 55000, running_balance: 25000 },
            ]
        },
        {
            supplier_id: 'SUP-103',
            supplier_code: 'SUP-GLB-02',
            supplier_type: 'import',
            supplier_status: 'inactive',
            supplier_name: 'Global Chip Tech',
            company_name: 'Global Semiconductors Ltd',
            contact_person: 'Chen Wei',
            phone_number: '+86 21 6789 0123',
            alternate_phone: '',
            email: 'export@globalchip.cn',
            website: 'www.globalchip.cn',
            gstin: '',
            pan_number: '',
            tax_type: 'unregistered',
            place_of_supply: 'Import (Overseas)',
            billing_address: 'High-Tech Zone, Pudong, Shanghai',
            shipping_address: 'High-Tech Zone, Pudong, Shanghai',
            city: 'Shanghai',
            state: 'Shanghai',
            pincode: '201203',
            country: 'China',
            opening_balance: 0,
            current_balance: -50000, // negative payable means you paid advance (Advance In!)
            credit_limit: 500000,
            payment_terms: 'Advance Paid',
            total_purchases: 200000,
            total_paid: 250000,
            pending_amount: 0,
            advance_amount: 50000,
            total_purchase_orders: 2,
            total_purchase_bills: 1,
            last_purchase_date: '2026-03-15',
            ledger: [
                { id: 'L-1', date: '2026-03-10', type: 'payment', reference_id: 'PAY-IMPORT-01', debit: 0, credit: 250000, running_balance: -250000 },
                { id: 'L-2', date: '2026-03-15', type: 'purchase', reference_id: 'BILL-IMPORT-99', debit: 200000, credit: 0, running_balance: -50000 },
            ]
        }
    ]);

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
        setFormData(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to completely remove this vendor/supplier profile? All ledger records will be deleted.')) {
            setSuppliers(suppliers.filter(s => s.supplier_id !== id));
            alert('Supplier deleted successfully.');
        }
    };

    const handleSubmitSupplier = (e) => {
        e.preventDefault();
        if (editingSupplier) {
            setSuppliers(suppliers.map(s => s.supplier_id === editingSupplier.supplier_id ? { ...s, ...formData } : s));
            alert('Supplier profile details successfully updated!');
        } else {
            const newSupId = `SUP-${Date.now().toString().slice(-3)}`;
            const newSup = {
                ...formData,
                supplier_id: newSupId,
                current_balance: formData.opening_balance,
                pending_amount: formData.opening_balance > 0 ? formData.opening_balance : 0,
                advance_amount: formData.opening_balance < 0 ? Math.abs(formData.opening_balance) : 0,
                total_purchases: 0,
                total_paid: 0,
                total_purchase_orders: 0,
                total_purchase_bills: 0,
                last_purchase_date: '-',
                ledger: formData.opening_balance !== 0 ? [
                    {
                        id: `L-${Date.now().toString().slice(-3)}`,
                        date: new Date().toISOString().split('T')[0],
                        type: 'purchase',
                        reference_id: 'Opening Balance Setup',
                        debit: formData.opening_balance > 0 ? formData.opening_balance : 0,
                        credit: formData.opening_balance < 0 ? Math.abs(formData.opening_balance) : 0,
                        running_balance: formData.opening_balance
                    }
                ] : []
            };
            setSuppliers([...suppliers, newSup]);
            alert('Supplier registered and master profile initialized!');
        }
        setIsModalOpen(false);
    };

    const handleOpenPaymentModal = useCallback((supplier) => {
        setSelectedSupplier(supplier);
        setPaymentForm({
            amount: Math.max(0, supplier.current_balance),
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

        const newBal = selectedSupplier.current_balance - payAmt;
        const newLedgerRow = {
            id: `L-${Date.now().toString().slice(-3)}`,
            date: paymentForm.date,
            type: 'payment',
            reference_id: paymentForm.reference,
            debit: 0,
            credit: payAmt,
            running_balance: newBal
        };

        setSuppliers(suppliers.map(s => s.supplier_id === selectedSupplier.supplier_id ? {
            ...s,
            current_balance: newBal,
            pending_amount: newBal > 0 ? newBal : 0,
            advance_amount: newBal < 0 ? Math.abs(newBal) : 0,
            total_paid: s.total_paid + payAmt,
            ledger: [...s.ledger, newLedgerRow]
        } : s));

        setIsPaymentModalOpen(false);
        setSelectedSupplier(null);
        alert('Outward Payment logged! Vendor ledger and running payables adjusted.');
    };

    const handleShareLedgerWhatsApp = (supplier) => {
        const text = `Dear ${supplier.supplier_name}, here is your current statement summary with us: Outstanding Payable: INR ${supplier.current_balance.toLocaleString()}. Thank you!`;
        window.open(`https://api.whatsapp.com/send?phone=${supplier.phone_number.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`, '_blank');
    };

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || s.supplier_type === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    // Report computations
    const totalPayablesSum = suppliers.reduce((acc, s) => acc + (s.current_balance > 0 ? s.current_balance : 0), 0);
    const totalAdvancePaymentsSum = suppliers.reduce((acc, s) => acc + (s.current_balance < 0 ? Math.abs(s.current_balance) : 0), 0);
    const totalOutwardPurchasesSum = suppliers.reduce((acc, s) => acc + s.total_purchases, 0);

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(27, 107, 58, 0.2)' }}>
                            <Users size={22} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '850', color: '#064E3B', letterSpacing: '-0.02em' }}>Suppliers Master & Ledger Suite</h1>
                    </div>
                    <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: '500' }}>Manage vendor demographics, credit limits, purchase ledgers, and outward payables aging summaries.</p>
                </div>
                <button 
                    onClick={handleOpenCreateModal}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.6rem', 
                        padding: '0.85rem 1.75rem', borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', color: 'white', border: 'none', 
                        fontWeight: '700', cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.25)'
                    }}
                >
                    <Plus size={20} />
                    Register New Supplier
                </button>
            </div>

            {/* Premium Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Outstanding Payables (Dues)', value: `₹${totalPayablesSum.toLocaleString()}`, icon: TrendingUp, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Advance Supplier Outflows', value: `₹${totalAdvancePaymentsSum.toLocaleString()}`, icon: CheckCircle2, color: '#15803D', bg: '#F0FDF4' },
                    { label: 'Total Procured Value', value: `₹${totalOutwardPurchasesSum.toLocaleString()}`, icon: Layers, color: '#0369A1', bg: '#F0F9FF' },
                    { label: 'Registered Supplier Bases', value: suppliers.length, icon: Users, color: '#0D9488', bg: '#F0FDFA' }
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

            {/* Switcher Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setActiveTab('list')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'list' ? '#064E3B' : 'white', 
                        color: activeTab === 'list' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'list' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <Users size={18} /> Suppliers Master Base
                </button>
                <button 
                    onClick={() => setActiveTab('ledger')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'ledger' ? '#064E3B' : 'white', 
                        color: activeTab === 'ledger' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'ledger' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <FileText size={18} /> Running Ledger Statements
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    style={{ 
                        padding: '0.75rem 1.5rem', borderRadius: '12px', 
                        background: activeTab === 'reports' ? '#064E3B' : 'white', 
                        color: activeTab === 'reports' ? 'white' : '#475569',
                        border: '1px solid #E2E8F0', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: activeTab === 'reports' ? '0 8px 16px rgba(6, 78, 59, 0.15)' : 'none'
                    }}
                >
                    <AlertTriangle size={18} /> Payables Aging & Reminders Reports 📊
                </button>
            </div>

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
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Supplier Details</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Demographics</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>GST & HSN</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit Limits</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Running Payable Balance</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem 2rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.map((sup) => (
                                    <tr key={sup.supplier_id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B6B3A' }}>
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '850', color: '#1E293B', fontSize: '0.95rem' }}>{sup.supplier_name}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Code: {sup.supplier_code} | Contact: {sup.contact_person}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{sup.phone_number}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sup.email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.85rem' }}>{sup.gstin || 'No GSTIN'}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>PAN: {sup.pan_number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem' }}>Limit: ₹{sup.credit_limit.toLocaleString()}</p>
                                                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Terms: {sup.payment_terms}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: sup.current_balance > 0 ? '#EF4444' : '#15803D' }}>
                                                {sup.current_balance > 0 ? `₹${sup.current_balance.toLocaleString()}` : `₹${Math.abs(sup.current_balance).toLocaleString()} (Adv)`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem' }}>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '0.3rem 0.6rem', borderRadius: '8px',
                                                background: sup.supplier_status === 'active' ? '#F0FDF4' : '#F1F5F9',
                                                color: sup.supplier_status === 'active' ? '#15803D' : '#475569',
                                                fontSize: '0.75rem', fontWeight: '800'
                                            }}>{sup.supplier_status.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                {sup.current_balance > 0 && (
                                                    <button 
                                                        onClick={() => handleOpenPaymentModal(sup)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#064E3B', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                                                    >Record Pay</button>
                                                )}
                                                <button onClick={() => handleEdit(sup)} title="Edit specifications" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(sup.supplier_id)} title="Delete product" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #FEF2F2', background: 'white', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Running Ledger Statements */}
            {activeTab === 'ledger' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
                    {/* Left side list */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '28px', border: '1px solid #E2E8F0', height: 'fit-content' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Select Supplier</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {suppliers.map(s => (
                                <button 
                                    key={s.supplier_id}
                                    onClick={() => setSelectedSupplier(s)}
                                    style={{ 
                                        width: '100%', padding: '1rem', borderRadius: '16px', border: selectedSupplier?.supplier_id === s.supplier_id ? '2px solid #064E3B' : '1px solid #E2E8F0',
                                        background: selectedSupplier?.supplier_id === s.supplier_id ? '#F0F9F4' : 'white',
                                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <p style={{ fontWeight: '800', color: '#1E293B', fontSize: '0.9rem' }}>{s.supplier_name}</p>
                                    <span style={{ fontSize: '0.8rem', color: s.current_balance > 0 ? '#EF4444' : '#15803D', fontWeight: '700' }}>Payable: ₹{s.current_balance.toLocaleString()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right side ledger details */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                        {selectedSupplier ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#064E3B' }}>Statement of Account: {selectedSupplier.supplier_name}</h3>
                                        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>GSTIN: {selectedSupplier.gstin || 'N/A'} | Contact: {selectedSupplier.phone_number}</p>
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
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                                            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Tx Date</th>
                                            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Transaction Ref</th>
                                            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Debit (You Owe)</th>
                                            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Credit (We Paid)</th>
                                            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>Running Payable</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedSupplier.ledger.map((row, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: '600' }}>{row.date}</td>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: '750', color: '#1E293B', fontSize: '0.85rem' }}>{row.reference_id}</td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#EF4444', fontWeight: '700' }}>
                                                    {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', color: '#15803D', fontWeight: '700' }}>
                                                    {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: '800', color: '#1E293B' }}>
                                                    ₹{row.running_balance.toLocaleString()}
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
                                    <span style={{ fontWeight: '900', color: '#C53030' }}>₹85,000</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#FFFBEB', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                                    <span style={{ color: '#B45309', fontWeight: '700' }}>31–60 Days Overdue Bucket</span>
                                    <span style={{ fontWeight: '900', color: '#B45309' }}>₹35,000</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCF2E4' }}>
                                    <span style={{ color: '#15803D', fontWeight: '700' }}>61–90+ Days Overdue Bucket</span>
                                    <span style={{ fontWeight: '900', color: '#15803D' }}>₹0</span>
                                </div>
                            </div>
                        </div>

                        {/* Supplier contribution purchases */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '28px', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1E293B', marginBottom: '1.5rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>Supplier Procurement Shares</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {suppliers.map((s, idx) => (
                                    <div key={idx}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                                            <span>{s.supplier_name}</span>
                                            <span>Total bought: ₹{s.total_purchases.toLocaleString()}</span>
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
                                        <span style={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: '700' }}>Balance Due: ₹{s.current_balance.toLocaleString()}</span>
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Opening Payable Balance (INR)</label>
                                    <input type="number" disabled={!!editingSupplier} value={formData.opening_balance} onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: '1px solid #DCF2E4', outline: 'none', background: 'white' }} />
                                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Keep positive if you owe them, negative for advance payment.</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1B6B3A', marginBottom: '0.5rem' }}>Credit limit allowance (INR)</label>
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
                                <span style={{ color: '#C53030' }}>₹{selectedSupplier.current_balance.toLocaleString()}</span>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem' }}>Paid Amount (INR)</label>
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
        </div>
    );
};

export default BusinessSuppliers;
